import { access, mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import yaml from 'yaml'
import { STUDIO_CONFIG } from '../src/constants/studio'
import { isValidSlug, normalizeSlug } from '../src/utils/slug'

// ==================== 路径与格式约定 ====================

/** 文章根目录（相对项目根） */
export const CONTENT_ROOT = 'public/content'
/** 导航数据输出目录（相对项目根） */
export const GENERATED_ROOT = 'public/generated'
/** 构建扫描认可的文章扩展名 */
export const SUPPORTED_EXT_RE = /\.(md|html|txt|pdf|docx?|xlsx?)$/i
/** 二进制文档：不读取正文，由同名 .desc.json / .desc.yaml 提供元数据 */
const BINARY_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx']

// ==================== 类型定义 ====================

export interface NavPost {
  type: 'post'
  title: string
  path: string
  url: string
  date?: string | Date
  cover?: string
  tags?: string[]
  excerpt?: string
  sticky?: boolean
  extension?: string
  wordCount?: number
}

/** 目录树节点：children 由 scanContent 排好序（文件夹优先 + 最新文章日期倒序） */
export type NavTreeNode =
  | { type: 'folder'; title: string; path: string; children: NavTreeNode[] }
  | { type: 'post'; title: string; path: string }

export interface ContentScan {
  nav: NavPost[]
  tree: NavTreeNode
}

/** 文章 frontmatter 的可编辑字段 */
export interface PostFrontmatter {
  title: string
  date: string
  cover: string
  desc: string
  tags: string[]
  sticky: boolean
}

export interface ParsedPost {
  file: string
  frontmatter: PostFrontmatter
  /** 未知的 frontmatter 字段，保存时原样保留 */
  extra: Record<string, unknown>
  content: string
}

export type IssueLevel = 'error' | 'warn'

export interface ValidationIssue {
  level: IssueLevel
  code: string
  message: string
}

export interface ValidateContext {
  /** 预先扫描的导航数据，批量校验时避免重复扫描 */
  nav?: NavPost[]
}

export interface StudioNode {
  type: 'folder' | 'post'
  name: string
  /** 相对 public/content 的 posix 路径（文件 / 目录） */
  file?: string
  /** 目录节点自身的相对路径 */
  dir?: string
  extension?: string
  children?: StudioNode[]
}

export interface TagCount {
  name: string
  count: number
}

export type ContentErrorCode = 'exists' | 'invalid' | 'notfound' | 'conflict'

export class ContentError extends Error {
  code: ContentErrorCode

  constructor(code: ContentErrorCode, message: string) {
    super(message)
    this.name = 'ContentError'
    this.code = code
  }
}

// ==================== 通用工具 ====================

const toPosix = (value: string) => value.split(path.sep).join('/')

export function resolveContentRoot(root: string): string {
  return path.resolve(root, CONTENT_ROOT)
}

/** 把相对路径解析到 public/content 内，越界直接拒绝 */
export function resolveContentFile(root: string, relFile: string): string {
  const contentRoot = resolveContentRoot(root)
  const abs = path.resolve(contentRoot, ...relFile.split('/'))
  if (abs !== contentRoot && !abs.startsWith(contentRoot + path.sep)) {
    throw new ContentError('invalid', `路径越界：${relFile}`)
  }
  return abs
}

async function exists(target: string): Promise<boolean> {
  try {
    await access(target)
    return true
  } catch {
    return false
  }
}

async function writeAtomic(target: string, data: string | Buffer): Promise<void> {
  // 临时名必须全局唯一：dev server 重启时新旧实例可能同时生成同一份导航文件
  const suffix = `${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`
  const tmp = `${target}.${suffix}.tmp`
  await writeFile(tmp, data)
  await rename(tmp, target)
}

export function todayString(): string {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function extensionOf(file: string): string {
  return (file.split('.').pop() || '').toLowerCase()
}

/** 日期折算为时间戳：Date / 字符串 / 文件 mtime 均可，非法或缺失返回 0（排到最末） */
function dateTime(value: unknown): number {
  if (value instanceof Date) {
    const time = value.getTime()
    return Number.isNaN(time) ? 0 : time
  }
  if (typeof value === 'string' && value.trim()) {
    const time = new Date(value).getTime()
    return Number.isNaN(time) ? 0 : time
  }
  return 0
}

/** 归一化分类目录：去掉首尾斜杠，拒绝 .. 与 _ 开头的隐藏目录 */
export function normalizeDir(dir: string): string {
  const value = (dir || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').trim()
  if (!value) return ''
  const segments = value.split('/')
  for (const segment of segments) {
    if (!segment || segment === '.' || segment === '..' || segment.startsWith('_')) {
      throw new ContentError('invalid', `分类目录不合法：${dir}`)
    }
  }
  return segments.join('/')
}

// ==================== 扫描：生成导航与目录树 ====================

/**
 * 扫描 public/content 生成导航数据。
 * 解析规则与历史实现严格保持一致（HTML / TXT / 二进制文档的默认标题、封面、标签），
 * 修改前请先跑一遍 nav.json 差异对比。
 *
 * 输出顺序：目录树每层「文件夹优先」，双方各自按最新文章日期倒序（并列按标题兜底）；
 * nav 按发布日期倒序。日期缺失时回退文件 mtime。
 */
export async function scanContent(root: string, baseUrl = '/'): Promise<ContentScan> {
  const contentDir = resolveContentRoot(root)
  const nav: NavPost[] = []
  const tree: NavTreeNode = { type: 'folder', title: '根目录', path: '/', children: [] }
  /** 节点时间戳：文章取发布日期，文件夹取所有后代文章的最大值 */
  const stamps = new Map<NavTreeNode, number>()

  /** 递归扫描，返回本目录（含子目录）最新一篇文章的时间戳 */
  async function scan(
    dir: string,
    parent: Extract<NavTreeNode, { type: 'folder' }>,
    base = ''
  ): Promise<number> {
    const entries = await readdir(dir)
    let latest = 0

    for (const entry of entries) {
      // 下划线开头 = 草稿 / 隐藏资源，构建不收录
      if (entry.startsWith('_')) continue
      const fullPath = path.resolve(dir, entry)
      const stats = await stat(fullPath)

      if (stats.isDirectory()) {
        const node: Extract<NavTreeNode, { type: 'folder' }> = {
          type: 'folder',
          title: entry,
          path: `${base}/${entry}`,
          children: []
        }
        parent.children.push(node)
        const childLatest = await scan(fullPath, node, `${base}/${entry}`)
        stamps.set(node, childLatest)
        latest = Math.max(latest, childLatest)
        continue
      }

      if (!SUPPORTED_EXT_RE.test(entry)) continue

      const extension = extensionOf(entry)
      const slug = entry.replace(SUPPORTED_EXT_RE, '')
      const route = base ? `${base}/${slug}` : `/${slug}`
      const fileUrl = `/content${route}.${extension}`
      const lastModifyTime = stats.mtime.toISOString()

      const descData = await readDescData(fullPath)
      let itemData: NavPost

      if (descData) {
        // 非 Markdown 文档：同名 .desc.json / .desc.yaml 优先
        itemData = {
          type: 'post',
          title: descData.title ? String(descData.title) : slug,
          path: route,
          url: fileUrl,
          date: descData.date || lastModifyTime,
          cover: descData.cover ? String(descData.cover) : '',
          tags: normalizeTags(descData.tags),
          excerpt: descData.excerpt ? String(descData.excerpt) : '',
          sticky: descData.sticky || false,
          extension,
          wordCount: 0
        }
      } else if (extension === 'md') {
        const raw = await readFile(fullPath, 'utf-8')
        const { data, content } = matter(raw)
        itemData = {
          type: 'post',
          title: data.title ? String(data.title) : slug,
          path: route,
          url: fileUrl,
          // 缺失日期时回退文件修改时间，避免排序键为空
          date: data.date || lastModifyTime,
          cover: data.cover ? String(data.cover) : '',
          // YAML 会把 2026 之类的标签解析为 number，导航数据统一成字符串
          tags: normalizeTags(data.tags),
          excerpt: data.desc ? String(data.desc) : content.trim().split('\n')[0].slice(0, 120) + '...',
          sticky: data.sticky || false
        }
      } else if (extension === 'html') {
        const raw = await readFile(fullPath, 'utf-8')
        const titleMatch = raw.match(/<title>(.*?)<\/title>/i)
        const descriptionMatch = raw.match(
          /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i
        )
        const coverMatch = raw.match(/<meta[^>]*name=["']cover["'][^>]*content=["']([^"']*)["'][^>]*>/i)

        let excerpt = ''
        if (descriptionMatch) {
          excerpt = descriptionMatch[1].slice(0, 120) + '...'
        } else {
          const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i)
          if (bodyMatch) {
            const cleanText = bodyMatch[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
            excerpt = cleanText.slice(0, 120) + '...'
          }
        }

        itemData = {
          type: 'post',
          title: titleMatch ? titleMatch[1] : slug,
          path: route,
          url: fileUrl,
          date: lastModifyTime,
          cover: (coverMatch && coverMatch[1]) || '/img/d2.webp',
          tags: ['网页'],
          excerpt,
          sticky: false
        }
      } else if (extension === 'txt') {
        const raw = await readFile(fullPath, 'utf-8')
        const lines = raw.split('\n')
        const title = lines[0] ? lines[0].trim() : slug
        itemData = {
          type: 'post',
          title: title || slug,
          path: route,
          url: fileUrl,
          date: lastModifyTime,
          cover: '/img/d3.webp',
          tags: ['文本'],
          excerpt: lines.slice(0, 3).join(' ').slice(0, 120) + '...',
          sticky: false,
          extension
        }
      } else if (BINARY_EXTENSIONS.includes(extension)) {
        itemData = {
          type: 'post',
          title: slug,
          path: route,
          url: fileUrl,
          date: lastModifyTime,
          cover: '/img/d7.webp',
          tags: [extension === 'pdf' ? 'PDF' : extension.includes('doc') ? 'Word' : 'Excel'],
          excerpt: `${extension.toUpperCase()}`,
          sticky: false,
          extension
        }
      } else {
        continue
      }

      // 子路径部署时给本地封面补上 base 前缀
      if (itemData.cover && !itemData.cover.startsWith('http') && baseUrl !== '/') {
        itemData.cover = `${baseUrl}/${itemData.cover}`.replace(/\/+/g, '/')
      }

      nav.push(itemData)
      const postNode: NavTreeNode = { type: 'post', title: itemData.title, path: route }
      parent.children.push(postNode)
      const stamp = dateTime(itemData.date)
      stamps.set(postNode, stamp)
      latest = Math.max(latest, stamp)
    }

    // 文件夹优先分组，组内按最新文章时间倒序；并列时按标题兜底，
    // 否则不同系统 readdir 顺序不同会让产物顺序漂移
    parent.children.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      const diff = (stamps.get(b) || 0) - (stamps.get(a) || 0)
      return diff !== 0 ? diff : a.title.localeCompare(b.title, 'zh-CN')
    })

    return latest
  }

  await scan(contentDir, tree as Extract<NavTreeNode, { type: 'folder' }>)
  // nav 与目录树同一口径：按发布日期倒序，上一篇/下一篇沿时间轴切换
  nav.sort(
    (a, b) => dateTime(b.date) - dateTime(a.date) || a.title.localeCompare(b.title, 'zh-CN')
  )
  return { nav, tree }
}

async function readDescData(filePath: string): Promise<Record<string, any> | null> {
  const jsonPath = `${filePath}.desc.json`
  const yamlPath = `${filePath}.desc.yaml`
  try {
    if (await exists(jsonPath)) {
      return JSON.parse(await readFile(jsonPath, 'utf-8'))
    }
    if (await exists(yamlPath)) {
      return yaml.parse(await readFile(yamlPath, 'utf-8'))
    }
  } catch (error) {
    console.warn(`读取描述文件失败: ${filePath}`, error)
  }
  return null
}

// ==================== 导航文件输出 ====================

export interface GenerateNavOptions {
  /** 生成前是否清空 public/generated（仅构建 / 首次启动需要） */
  clean?: boolean
}

export async function generateNav(
  root: string,
  navName: string,
  treeName: string,
  baseUrl = '/',
  options: GenerateNavOptions = {}
): Promise<ContentScan> {
  const scan = await scanContent(root, baseUrl)
  const outDir = path.resolve(root, GENERATED_ROOT)

  if (options.clean) {
    await rm(outDir, { recursive: true, force: true })
  }
  await mkdir(outDir, { recursive: true })

  const navJson = JSON.stringify(scan.nav, null, 2)
  const treeJson = JSON.stringify(scan.tree, null, 2)
  const files: Array<[string, string]> = [
    [navName, navJson],
    [treeName, treeJson]
  ]
  // 兼容读取固定文件名的旧逻辑 / 手工调试
  if (navName !== 'nav.json') files.push(['nav.json', navJson])
  if (treeName !== 'tree.json') files.push(['tree.json', treeJson])

  for (const [name, data] of files) {
    // 先写临时文件再 rename：避免浏览器正好在重建时读到半截 JSON
    await writeAtomic(path.join(outDir, name), data)
  }

  return scan
}

// ==================== Markdown 读写 ====================

const KNOWN_FRONTMATTER_KEYS = new Set(['title', 'date', 'cover', 'desc', 'tags', 'sticky'])

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(tag => String(tag).trim()).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value.split(',').map(tag => tag.trim()).filter(Boolean)
  }
  return []
}

function normalizeDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim()
  return ''
}

export function normalizeFrontmatter(data: Record<string, unknown>): PostFrontmatter {
  return {
    title: typeof data.title === 'string' ? data.title.trim() : data.title ? String(data.title) : '',
    date: normalizeDate(data.date),
    cover: typeof data.cover === 'string' ? data.cover.trim() : '',
    desc: typeof data.desc === 'string' ? data.desc.trim() : '',
    tags: normalizeTags(data.tags),
    sticky: data.sticky === true || data.sticky === 'true'
  }
}

export async function readPost(root: string, relFile: string): Promise<ParsedPost> {
  if (extensionOf(relFile) !== 'md') {
    throw new ContentError('invalid', '只能编辑 Markdown 文章')
  }
  const abs = resolveContentFile(root, relFile)
  if (!(await exists(abs))) throw new ContentError('notfound', `文章不存在：${relFile}`)

  const raw = await readFile(abs, 'utf-8')
  const parsed = matter(raw)
  const data = parsed.data as Record<string, unknown>
  const extra = Object.fromEntries(
    Object.entries(data).filter(([key]) => !KNOWN_FRONTMATTER_KEYS.has(key))
  )

  return {
    file: relFile,
    frontmatter: normalizeFrontmatter(data),
    extra,
    content: parsed.content.replace(/^\n+/, '')
  }
}

/** 需要加引号的 YAML 标量 */
function yamlScalar(value: string): string {
  if (value === '') return "''"
  const plain =
    !/^[\s\-?:,[\]{}#&*!|>'"%@`]/.test(value) &&
    !/:\s|#|\n|\r/.test(value) &&
    !/^(true|false|null|~|-?\d+(\.\d+)?)$/i.test(value)
  return plain ? value : JSON.stringify(value)
}

export function stringifyPost(
  frontmatter: PostFrontmatter,
  content: string,
  extra: Record<string, unknown> = {}
): string {
  const lines: string[] = ['---']
  if (frontmatter.title) lines.push(`title: ${yamlScalar(frontmatter.title)}`)
  if (frontmatter.date) lines.push(`date: ${yamlScalar(frontmatter.date)}`)
  lines.push(`cover: ${yamlScalar(frontmatter.cover)}`)
  lines.push(`desc: ${yamlScalar(frontmatter.desc)}`)
  lines.push(`tags: [${frontmatter.tags.map(yamlScalar).join(', ')}]`)
  if (frontmatter.sticky) lines.push('sticky: true')

  for (const [key, value] of Object.entries(extra)) {
    if (KNOWN_FRONTMATTER_KEYS.has(key)) continue
    const dumped = yaml.stringify({ [key]: value }, { lineWidth: 0 }).trimEnd()
    if (dumped) lines.push(...dumped.split('\n'))
  }

  lines.push('---', '')
  return `${lines.join('\n')}\n${content.replace(/^\n+/, '')}`
}

export async function savePost(
  root: string,
  input: { file: string; frontmatter: PostFrontmatter; content: string }
): Promise<ParsedPost> {
  const { file } = input
  if (extensionOf(file) !== 'md') {
    throw new ContentError('invalid', '只能保存 Markdown 文章')
  }
  const abs = resolveContentFile(root, file)
  const slug = path.basename(file).replace(/\.md$/i, '')
  if (!isValidSlug(slug)) {
    throw new ContentError('invalid', `文件名需要是英文短横线格式：${slug}`)
  }

  let extra: Record<string, unknown> = {}
  if (await exists(abs)) {
    const parsed = matter(await readFile(abs, 'utf-8'))
    extra = Object.fromEntries(
      Object.entries(parsed.data as Record<string, unknown>).filter(
        ([key]) => !KNOWN_FRONTMATTER_KEYS.has(key)
      )
    )
  }

  const frontmatter = normalizeFrontmatter(input.frontmatter as unknown as Record<string, unknown>)
  await mkdir(path.dirname(abs), { recursive: true })
  await writeAtomic(abs, stringifyPost(frontmatter, input.content, extra))

  return { file, frontmatter, extra, content: input.content.replace(/^\n+/, '') }
}

// ==================== 新建 / 发布 ====================

export interface CreatePostInput {
  /** 分类目录，支持多级，如 前端开发 / 笔记/读书 */
  dir: string
  slug: string
  title: string
  draft: boolean
}

export async function createPost(
  root: string,
  input: CreatePostInput
): Promise<{ file: string; frontmatter: PostFrontmatter; content: string }> {
  const title = input.title.trim()
  if (!title) throw new ContentError('invalid', '标题不能为空')

  const slug = normalizeSlug(input.slug)
  if (!slug || !isValidSlug(slug)) {
    throw new ContentError('invalid', 'slug 只能包含小写字母、数字与连字符')
  }

  const dir = input.draft ? STUDIO_CONFIG.draftDir : normalizeDir(input.dir)
  const file = dir ? `${dir}/${slug}.md` : `${slug}.md`
  const abs = resolveContentFile(root, file)
  if (await exists(abs)) {
    throw new ContentError('exists', `同名文章已存在：${file}`)
  }

  const frontmatter: PostFrontmatter = {
    title,
    date: todayString(),
    cover: '',
    desc: '',
    tags: [],
    sticky: false
  }
  const content = ''

  await mkdir(path.dirname(abs), { recursive: true })
  await writeAtomic(abs, stringifyPost(frontmatter, content))
  return { file, frontmatter, content }
}

/** 草稿转正：移动到目标分类，并同步移动草稿配图目录 */
export async function publishPost(
  root: string,
  input: { file: string; targetDir: string }
): Promise<{ file: string }> {
  const draftPrefix = `${STUDIO_CONFIG.draftDir}/`
  if (!input.file.startsWith(draftPrefix)) {
    throw new ContentError('invalid', '只有草稿箱中的文章需要发布')
  }
  if (extensionOf(input.file) !== 'md') {
    throw new ContentError('invalid', '只能发布 Markdown 草稿')
  }

  const targetDir = normalizeDir(input.targetDir)
  if (!targetDir) throw new ContentError('invalid', '请选择目标分类')

  const sourceAbs = resolveContentFile(root, input.file)
  if (!(await exists(sourceAbs))) throw new ContentError('notfound', '草稿不存在')

  const slug = path.basename(input.file, '.md')
  const targetFile = `${targetDir}/${slug}.md`
  const targetAbs = resolveContentFile(root, targetFile)
  if (await exists(targetAbs)) {
    throw new ContentError('exists', `目标分类已存在同名文章：${targetFile}`)
  }

  const parsed = await readPost(root, input.file)
  const frontmatter = { ...parsed.frontmatter, date: parsed.frontmatter.date || todayString() }

  // 草稿配图目录同步迁移，并改写正文中的引用路径
  const draftAssetDir = path.resolve(path.dirname(sourceAbs), slug)
  const targetAssetDir = path.resolve(path.dirname(targetAbs), slug)
  let content = parsed.content
  if (await exists(draftAssetDir)) {
    if (await exists(targetAssetDir)) {
      throw new ContentError('exists', `目标分类已存在同名图片目录：${targetDir}/${slug}/`)
    }
    await mkdir(path.dirname(targetAssetDir), { recursive: true })
    await rename(draftAssetDir, targetAssetDir)
    const oldRef = `/content/${STUDIO_CONFIG.draftDir}/${slug}/`
    const newRef = `/content/${targetDir}/${slug}/`
    content = content.split(oldRef).join(newRef)
  }

  await mkdir(path.dirname(targetAbs), { recursive: true })
  await writeAtomic(targetAbs, stringifyPost(frontmatter, content, parsed.extra))
  await rm(sourceAbs, { force: true })

  return { file: targetFile }
}

// ==================== Studio 目录树 ====================

function sortStudioNodes(nodes: StudioNode[]): StudioNode[] {
  return nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.name.localeCompare(b.name, 'zh-CN')
  })
}

async function readStudioNodes(
  absDir: string,
  relDir: string,
  depth: number,
  options: { skipUnderscore: boolean; maxDepth: number }
): Promise<StudioNode[]> {
  if (depth > options.maxDepth) return []
  let entries
  try {
    entries = await readdir(absDir, { withFileTypes: true })
  } catch {
    return []
  }

  const folders: StudioNode[] = []
  const posts: StudioNode[] = []

  for (const entry of entries) {
    if (options.skipUnderscore && entry.name.startsWith('_')) continue
    const rel = relDir ? `${relDir}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      const children = await readStudioNodes(path.join(absDir, entry.name), rel, depth + 1, options)
      folders.push({ type: 'folder', name: entry.name, dir: rel, children })
      continue
    }
    if (!SUPPORTED_EXT_RE.test(entry.name) || entry.name.startsWith('.')) continue
    posts.push({
      type: 'post',
      name: entry.name.replace(SUPPORTED_EXT_RE, ''),
      file: rel,
      extension: extensionOf(entry.name)
    })
  }

  return [...sortStudioNodes(folders), ...sortStudioNodes(posts)]
}

export async function listContentTree(
  root: string
): Promise<{ tree: StudioNode[]; drafts: StudioNode[]; tags: TagCount[] }> {
  const contentDir = resolveContentRoot(root)
  const options = { skipUnderscore: true, maxDepth: STUDIO_CONFIG.maxTreeDepth }
  const tree = await readStudioNodes(contentDir, '', 1, options)

  const draftDir = path.resolve(contentDir, STUDIO_CONFIG.draftDir)
  const drafts = await readStudioNodes(draftDir, STUDIO_CONFIG.draftDir, 1, {
    skipUnderscore: false,
    maxDepth: 2
  })

  const scan = await scanContent(root)
  const counter = new Map<string, number>()
  for (const post of scan.nav) {
    for (const tag of post.tags || []) {
      // frontmatter 中的数字标签（如 2026）会被 YAML 解析为 number，统一转成字符串
      const name = String(tag)
      counter.set(name, (counter.get(name) || 0) + 1)
    }
  }
  const tags = [...counter.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'))

  return { tree, drafts, tags }
}

// ==================== 校验 ====================

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function validatePost(
  root: string,
  input: { file: string; frontmatter: PostFrontmatter; content: string },
  context: ValidateContext = {}
): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = []
  const { file, frontmatter, content } = input
  const slug = path.basename(file, '.md')

  if (!frontmatter.title.trim()) {
    issues.push({ level: 'warn', code: 'title', message: '标题为空，列表将回退显示文件名' })
  }
  if (frontmatter.date && !DATE_RE.test(frontmatter.date)) {
    issues.push({ level: 'warn', code: 'date', message: '日期建议使用 YYYY-MM-DD 格式' })
  }
  if (!frontmatter.desc) {
    issues.push({ level: 'warn', code: 'desc', message: '摘要为空，卡片将取正文首行前 120 字' })
  } else if (frontmatter.desc.length > 120) {
    issues.push({ level: 'warn', code: 'desc-length', message: '摘要超过 120 字，卡片会截断显示' })
  }
  if (frontmatter.cover && !/^https?:\/\//.test(frontmatter.cover)) {
    const coverRel = frontmatter.cover.replace(/^\//, '').split('/')
    const coverAbs = path.resolve(root, 'public', ...coverRel)
    if (!(await exists(coverAbs))) {
      issues.push({ level: 'warn', code: 'cover', message: `封面文件不存在：${frontmatter.cover}` })
    }
  }
  if (!content.trim()) {
    issues.push({ level: 'warn', code: 'empty', message: '正文为空' })
  }
  if (!isValidSlug(slug)) {
    issues.push({ level: 'error', code: 'slug', message: '文件名需要是英文短横线格式（小写字母 / 数字 / -）' })
  }

  // 路由冲突：同名路径已被其他文章占用
  const route = `/${file.replace(/\.md$/i, '')}`
  if (!file.startsWith(`${STUDIO_CONFIG.draftDir}/`)) {
    const nav = context.nav || (await scanContent(root)).nav
    const duplicated = nav.find(post => post.path === route && post.url !== `/content${route}.md`)
    if (duplicated) {
      issues.push({ level: 'error', code: 'route', message: `路由冲突：${route}` })
    }
  }

  return issues
}

// ==================== 附件（PDF / Word / Excel） ====================

export interface AttachmentMeta {
  title: string
  date: string
  cover: string
  tags: string[]
  excerpt: string
  sticky: boolean
}

export async function readAttachmentMeta(root: string, relFile: string): Promise<AttachmentMeta | null> {
  const abs = resolveContentFile(root, relFile)
  const metaPath = `${abs}.desc.json`
  if (!(await exists(metaPath))) return null
  try {
    const data = JSON.parse(await readFile(metaPath, 'utf-8')) as Record<string, unknown>
    return {
      title: typeof data.title === 'string' ? data.title : path.basename(relFile),
      date: normalizeDate(data.date),
      cover: typeof data.cover === 'string' ? data.cover : '',
      tags: normalizeTags(data.tags),
      excerpt: typeof data.excerpt === 'string' ? data.excerpt : '',
      sticky: data.sticky === true
    }
  } catch {
    return null
  }
}

export async function saveAttachmentMeta(
  root: string,
  relFile: string,
  meta: AttachmentMeta
): Promise<AttachmentMeta> {
  const abs = resolveContentFile(root, relFile)
  if (!(await exists(abs))) throw new ContentError('notfound', `文件不存在：${relFile}`)

  const metaPath = `${abs}.desc.json`
  const payload: Record<string, unknown> = {
    title: meta.title.trim() || path.basename(relFile),
    date: meta.date || todayString(),
    cover: meta.cover,
    tags: normalizeTags(meta.tags),
    excerpt: meta.excerpt,
    sticky: meta.sticky
  }

  await writeAtomic(metaPath, `${JSON.stringify(payload, null, 2)}\n`)
  return payload as unknown as AttachmentMeta
}

// ==================== 上传 ====================

export interface UploadInput {
  /** 目标分类目录（草稿图片使用 _drafts） */
  dir: string
  /** 文章 slug，用于图片子目录 */
  slug: string
  filename: string
  base64: string
  kind: 'image' | 'attachment'
}

export interface UploadResult {
  file: string
  url: string
}

function sanitizeFilename(filename: string): string {
  const base = path.basename(filename.replace(/\\/g, '/'))
  const cleaned = base.replace(/[\\/:*?"<>|\s]+/g, '-').replace(/^-+|-+$/g, '')
  return cleaned || `file-${Date.now()}`
}

export async function uploadFile(root: string, input: UploadInput): Promise<UploadResult> {
  const filename = sanitizeFilename(input.filename)
  const extension = extensionOf(filename)
  const allowed: readonly string[] =
    input.kind === 'image' ? STUDIO_CONFIG.imageExtensions : STUDIO_CONFIG.attachmentExtensions
  if (!allowed.includes(extension)) {
    throw new ContentError('invalid', `不支持的文件类型：${extension || '未知'}`)
  }

  const buffer = Buffer.from(input.base64, 'base64')
  if (!buffer.length) throw new ContentError('invalid', '文件内容为空')
  if (buffer.length > STUDIO_CONFIG.uploadMaxBytes) {
    throw new ContentError('invalid', `文件超过 ${Math.round(STUDIO_CONFIG.uploadMaxBytes / 1024 / 1024)}MB`)
  }

  const dir = input.dir === STUDIO_CONFIG.draftDir ? STUDIO_CONFIG.draftDir : normalizeDir(input.dir)
  const relativeDir = input.kind === 'image' && input.slug ? `${dir ? `${dir}/` : ''}${input.slug}` : dir
  const relFile = relativeDir ? `${relativeDir}/${filename}` : filename
  const abs = resolveContentFile(root, relFile)

  if (await exists(abs)) {
    throw new ContentError('exists', `文件已存在：${relFile}`)
  }

  await mkdir(path.dirname(abs), { recursive: true })
  await writeFile(abs, buffer)

  return { file: relFile, url: `/content/${relFile}` }
}

// ==================== 封面上传 ====================

export interface CoverUploadInput {
  filename: string
  base64: string
}

export interface CoverUploadResult {
  /** 相对 public 的路径 */
  file: string
  /** 可直接写入 frontmatter 的公开地址 */
  url: string
}

/** 封面上传到 public/img/covers，返回可直接填进 frontmatter 的地址 */
export async function uploadCover(root: string, input: CoverUploadInput): Promise<CoverUploadResult> {
  const extension = extensionOf(input.filename) || 'png'
  const allowedExtensions: readonly string[] = STUDIO_CONFIG.imageExtensions
  if (!allowedExtensions.includes(extension)) {
    throw new ContentError('invalid', `封面只支持图片格式：${STUDIO_CONFIG.imageExtensions.join(' / ')}`)
  }

  const buffer = Buffer.from(input.base64, 'base64')
  if (!buffer.length) throw new ContentError('invalid', '图片内容为空')
  if (buffer.length > STUDIO_CONFIG.uploadMaxBytes) {
    throw new ContentError('invalid', `图片超过 ${Math.round(STUDIO_CONFIG.uploadMaxBytes / 1024 / 1024)}MB`)
  }

  const dirRel = STUDIO_CONFIG.coverDir
  const dirAbs = path.resolve(root, 'public', ...dirRel.split('/'))
  await mkdir(dirAbs, { recursive: true })

  // 时间戳命名避免碰撞，极端情况下再追加序号
  const base = `cover-${Date.now()}`
  let filename = `${base}.${extension}`
  let counter = 1
  while (await exists(path.join(dirAbs, filename))) {
    filename = `${base}-${counter}.${extension}`
    counter++
  }

  await writeFile(path.join(dirAbs, filename), buffer)
  return {
    file: `${dirRel}/${filename}`,
    url: `/${dirRel}/${filename}`
  }
}

// ==================== 其它 ====================

/** 供 Studio 展示：相对 public 的封面候选路径（递归扫描 img 与 bg） */
export async function listCoverCandidates(root: string): Promise<string[]> {
  const covers: string[] = []
  const scanDir = async (relDir: string) => {
    const absDir = path.resolve(root, 'public', ...relDir.split('/'))
    let entries
    try {
      entries = await readdir(absDir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const rel = `${relDir}/${entry.name}`
      if (entry.isDirectory()) {
        await scanDir(rel)
        continue
      }
      if (!/\.(webp|jpe?g|png|avif|gif|svg)$/i.test(entry.name)) continue
      covers.push(`/${toPosix(rel)}`)
    }
  }

  await scanDir('img')
  await scanDir('bg')
  return covers.sort((a, b) => a.localeCompare(b, 'zh-CN'))
}
