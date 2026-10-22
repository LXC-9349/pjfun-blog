import { stdin, stdout } from 'node:process'
import { createInterface, type Interface } from 'node:readline/promises'
import { parseArgs } from 'node:util'
import {
  ContentError,
  createPost,
  listContentTree,
  publishPost,
  readAttachmentMeta,
  readPost,
  savePost,
  scanContent,
  validatePost,
  type PostFrontmatter,
  type StudioNode,
  type ValidationIssue
} from '../tooling/content-core'
import { STUDIO_CONFIG } from '../src/constants/studio'
import { isValidSlug, slugifyTitle } from '../src/utils/slug'

const ROOT = process.cwd()
const BINARY_EXTENSIONS: readonly string[] = STUDIO_CONFIG.attachmentExtensions

let promptInterface: Interface | null = null

async function ask(question: string, defaultValue = ''): Promise<string> {
  if (!stdin.isTTY) return defaultValue
  promptInterface ??= createInterface({ input: stdin, output: stdout })
  const suffix = defaultValue ? ` (${defaultValue})` : ''
  const answer = (await promptInterface.question(`${question}${suffix}: `)).trim()
  return answer || defaultValue
}

function closePrompts() {
  promptInterface?.close()
  promptInterface = null
}

interface FlatPost {
  file: string
  name: string
  extension: string
}

function flattenPosts(nodes: StudioNode[], result: FlatPost[] = []): FlatPost[] {
  for (const node of nodes) {
    if (node.type === 'folder') {
      flattenPosts(node.children || [], result)
    } else if (node.file) {
      result.push({ file: node.file, name: node.name, extension: node.extension || '' })
    }
  }
  return result
}

function collectFolders(nodes: StudioNode[], result: string[] = []): string[] {
  for (const node of nodes) {
    if (node.type !== 'folder') continue
    if (node.dir) result.push(node.dir)
    collectFolders(node.children || [], result)
  }
  return [...new Set(result)].sort((a, b) => a.localeCompare(b, 'zh-CN'))
}

// ==================== new ====================

async function commandNew(args: string[]) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      title: { type: 'string' },
      dir: { type: 'string' },
      slug: { type: 'string' },
      tags: { type: 'string' },
      cover: { type: 'string' },
      desc: { type: 'string' },
      draft: { type: 'boolean' },
      help: { type: 'boolean', short: 'h' }
    }
  })

  if (values.help) return printNewUsage()

  let title = (values.title || positionals.join(' ')).trim()
  const interactive = !title
  if (!title) title = await ask('文章标题')
  if (!title) throw new ContentError('invalid', '标题不能为空')

  const index = await listContentTree(ROOT)
  const folders = collectFolders(index.tree)
  const draft = values.draft === true

  let dir = values.dir ?? ''
  if (!draft && values.dir === undefined && interactive) {
    if (folders.length) console.log(`现有分类：${folders.join(' / ')}`)
    dir = await ask('分类目录（留空为根目录）')
  }

  const slug = values.slug || slugifyTitle(title)
  if (!slug || !isValidSlug(slug)) {
    throw new ContentError(
      'invalid',
      `slug 不合法：${slug || '(空)'}；请用 --slug 指定小写字母 / 数字 / 连字符`
    )
  }

  const created = await createPost(ROOT, { dir, slug, title, draft })
  const tags = (values.tags || '')
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)

  const frontmatter: PostFrontmatter = {
    ...created.frontmatter,
    cover: values.cover || '',
    desc: values.desc || '',
    tags
  }
  await savePost(ROOT, { file: created.file, frontmatter, content: created.content })

  console.log('')
  console.log(`已创建  public/content/${created.file}`)
  console.log(`标题    ${title}`)
  if (draft) console.log('状态    草稿（构建时忽略）')
  else if (dir) console.log(`分类    ${dir}`)
  if (tags.length) console.log(`标签    ${tags.join(', ')}`)
  console.log('')
  console.log('下一步：')
  console.log(`  pnpm dev  然后访问 /studio?file=${encodeURIComponent(created.file)}`)
  console.log(`  或直接编辑 public/content/${created.file}`)
}

// ==================== check ====================

interface CheckReport {
  file: string
  draft: boolean
  issues: ValidationIssue[]
}

async function commandCheck(args: string[]) {
  const { values } = parseArgs({
    args,
    options: {
      json: { type: 'boolean' },
      'no-drafts': { type: 'boolean' },
      help: { type: 'boolean', short: 'h' }
    }
  })

  if (values.help) return printCheckUsage()

  const [scan, index] = await Promise.all([scanContent(ROOT), listContentTree(ROOT)])
  const published = flattenPosts(index.tree)
  const drafts = values['no-drafts'] ? [] : flattenPosts(index.drafts)
  const all = [...published, ...drafts]
  const markdown = all.filter(item => item.extension === 'md')
  const attachments = all.filter(item => BINARY_EXTENSIONS.includes(item.extension))
  // HTML / TXT 的元数据来自文件内容，无需 frontmatter 校验
  const others = all.filter(
    item => item.extension !== 'md' && !BINARY_EXTENSIONS.includes(item.extension)
  )

  const reports: CheckReport[] = []
  let errors = 0
  let warnings = 0

  for (const item of markdown) {
    const isDraft = item.file.startsWith(`${STUDIO_CONFIG.draftDir}/`)
    try {
      const post = await readPost(ROOT, item.file)
      const issues = await validatePost(
        ROOT,
        { file: item.file, frontmatter: post.frontmatter, content: post.content },
        { nav: scan.nav }
      )
      if (!issues.length) continue
      reports.push({ file: item.file, draft: isDraft, issues })
      for (const issue of issues) {
        if (issue.level === 'error') errors++
        else warnings++
      }
    } catch (error) {
      errors++
      reports.push({
        file: item.file,
        draft: isDraft,
        issues: [
          {
            level: 'error',
            code: 'read',
            message: error instanceof Error ? error.message : '读取失败'
          }
        ]
      })
    }
  }

  // 非 Markdown 附件：缺少描述文件时仍能上线，但卡片信息会回退默认值
  for (const item of attachments) {
    const meta = await readAttachmentMeta(ROOT, item.file)
    if (meta) continue
    warnings++
    reports.push({
      file: item.file,
      draft: false,
      issues: [{ level: 'warn', code: 'desc', message: '缺少同名 .desc.json，将回退文件名与默认封面' }]
    })
  }

  // 路由冲突：同 path 被不同扩展名的文件占用
  const routes = new Map<string, string[]>()
  for (const post of scan.nav) {
    routes.set(post.path, [...(routes.get(post.path) || []), post.url])
  }
  for (const [route, urls] of routes) {
    if (urls.length < 2) continue
    errors++
    reports.push({
      file: urls.join(' / '),
      draft: false,
      issues: [{ level: 'error', code: 'route', message: `路由冲突：${route}` }]
    })
  }

  const payload = {
    markdown: markdown.length,
    drafts: drafts.length,
    attachments: attachments.length,
    others: others.length,
    errors,
    warnings,
    reports
  }

  if (values.json) {
    console.log(JSON.stringify(payload, null, 2))
  } else {
    console.log('内容检查')
    console.log(
      `  Markdown ${markdown.length} 篇（草稿 ${drafts.length}）· 附件 ${attachments.length} 个 · 其他格式 ${others.length} 个`
    )
    console.log('')
    if (!reports.length) {
      console.log('  未发现问题')
    }
    for (const report of reports) {
      console.log(`${report.draft ? '[草稿] ' : ''}public/content/${report.file}`)
      for (const issue of report.issues) {
        console.log(`  ${issue.level === 'error' ? '[错误]' : '[提示]'} ${issue.message}`)
      }
    }
    console.log('')
    console.log(
      errors
        ? `检查未通过：${errors} 个错误，${warnings} 个提示`
        : `检查通过：${warnings} 个提示`
    )
  }

  if (errors) process.exitCode = 1
}

// ==================== publish ====================

async function commandPublish(args: string[]) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      dir: { type: 'string' },
      help: { type: 'boolean', short: 'h' }
    }
  })

  if (values.help) return printPublishUsage()

  const index = await listContentTree(ROOT)
  const drafts = flattenPosts(index.drafts).filter(item => item.extension === 'md')
  let file = positionals[0] || ''

  if (!file) {
    if (!drafts.length) {
      console.log('草稿箱为空，无需发布')
      return
    }
    console.log('草稿列表：')
    drafts.forEach((item, i) => console.log(`  ${i + 1}) ${item.file}`))
    const answer = await ask('选择草稿编号', '1')
    const picked = drafts[Number(answer) - 1]
    if (!picked) throw new ContentError('invalid', `无效的草稿编号：${answer}`)
    file = picked.file
  }

  let targetDir = values.dir || ''
  if (!targetDir) {
    const folders = collectFolders(index.tree)
    if (folders.length) console.log(`现有分类：${folders.join(' / ')}`)
    targetDir = await ask('目标分类')
  }
  if (!targetDir) throw new ContentError('invalid', '请通过 --dir 指定目标分类')

  const result = await publishPost(ROOT, { file, targetDir })
  console.log('')
  console.log(`已发布  public/content/${result.file}`)
  console.log('下一步  检查内容后提交并推送（Studio 发布面板或 git 命令）')
}

// ==================== 帮助 ====================

function printUsage() {
  console.log(`PJ Blog 内容 CLI

用法：
  pnpm content:new "文章标题" [--dir 分类] [--slug slug] [--tags Vue,TS] [--cover /img/d1.webp] [--desc 摘要] [--draft]
  pnpm content:check [--json] [--no-drafts]
  pnpm content:publish [草稿文件] [--dir 目标分类]

说明：
  - 只写 public/content，不自动提交；导航在 pnpm dev / pnpm build 时自动重建
  - 发布仅接受 public/content/${STUDIO_CONFIG.draftDir} 下的 Markdown 草稿
  - 不加参数运行 new / publish 时会进入交互式提问`)
}

function printNewUsage() {
  console.log(`新建文章
  pnpm content:new "标题" --dir 前端开发 --tags Vue,TS --cover /img/d1.webp --desc "摘要"
  pnpm content:new "标题" --draft    # 存入 ${STUDIO_CONFIG.draftDir}，不参与构建
  --slug 可手动指定文件名，缺省按标题转拼音`)
}

function printCheckUsage() {
  console.log(`检查全部内容
  pnpm content:check              # 检查已发布文章、草稿与附件
  pnpm content:check --no-drafts  # 跳过草稿
  pnpm content:check --json       # 输出 JSON，便于 CI 使用`)
}

function printPublishUsage() {
  console.log(`发布草稿
  pnpm content:publish _drafts/foo.md --dir 前端开发
  pnpm content:publish --dir 前端开发   # 交互式选择草稿`)
}

// ==================== 入口 ====================

async function main() {
  const [command, ...rest] = process.argv.slice(2)
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printUsage()
    return
  }

  switch (command) {
    case 'new':
      await commandNew(rest)
      break
    case 'check':
      await commandCheck(rest)
      break
    case 'publish':
      await commandPublish(rest)
      break
    default:
      console.error(`未知命令：${command}`)
      printUsage()
      process.exitCode = 1
  }
}

main()
  .catch(error => {
    if (error instanceof ContentError) {
      console.error(`错误：${error.message}`)
    } else {
      console.error('执行失败：', error)
    }
    process.exitCode = 1
  })
  .finally(closePrompts)
