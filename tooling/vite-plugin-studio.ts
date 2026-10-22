import { execFile } from 'child_process'
import { access } from 'node:fs/promises'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'http'
import { loadEnv, type Plugin } from 'vite'
import {
  ContentError,
  createPost,
  listContentTree,
  listCoverCandidates,
  normalizeFrontmatter,
  publishPost,
  readAttachmentMeta,
  readPost,
  saveAttachmentMeta,
  savePost,
  uploadCover,
  uploadFile,
  validatePost,
  type AttachmentMeta
} from './content-core'
import { contentBus } from './content-bus'
import { readEnvConfig, writeEnvConfig } from './env-config'
import { STUDIO_CONFIG } from '../src/constants/studio'

// ==================== HTTP 小工具 ====================

const JSON_BODY_LIMIT = Math.ceil(STUDIO_CONFIG.uploadMaxBytes * 1.4) + 64 * 1024

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(payload))
}

function readJsonBody(req: IncomingMessage): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks: Buffer[] = []
    req.on('data', chunk => {
      size += chunk.length
      if (size > JSON_BODY_LIMIT) {
        reject(new ContentError('invalid', '请求体超过大小限制'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8')
      if (!raw) return resolve({})
      try {
        resolve(JSON.parse(raw))
      } catch {
        reject(new ContentError('invalid', '请求体不是合法 JSON'))
      }
    })
    req.on('error', reject)
  })
}

function isLocalRequest(req: IncomingMessage): boolean {
  const address = req.socket.remoteAddress || ''
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'
}

/** 同源校验 + 本机放行 + 局域网可选口令 */
function checkAuthorized(req: IncomingMessage, token: string): { status: number; message: string } | null {
  const origin = req.headers.origin
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.host) {
        return { status: 403, message: '拒绝跨站请求' }
      }
    } catch {
      return { status: 403, message: '非法 Origin' }
    }
  }

  if (isLocalRequest(req)) return null

  const provided = req.headers['x-studio-token']
  if (token && provided === token) return null
  if (!token) {
    return { status: 403, message: '创作台默认仅限本机访问；局域网访问请在 .env 配置 STUDIO_TOKEN' }
  }
  return { status: 401, message: '访问口令不正确' }
}

// ==================== Git 操作 ====================

interface GitResult {
  ok: boolean
  output: string
  code: number
}

function runGit(root: string, args: string[], timeout = 30_000): Promise<GitResult> {
  return new Promise(resolve => {
    execFile(
      'git',
      args,
      {
        cwd: root,
        timeout,
        windowsHide: true,
        maxBuffer: 10 * 1024 * 1024,
        // 禁止交互式凭据输入，失败时直接返回错误而不是挂起
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
      },
      (error, stdout, stderr) => {
        const output = `${stdout || ''}${stderr || ''}`.trim()
        const code = error && typeof error.code === 'number' ? error.code : error ? -1 : 0
        resolve({ ok: !error, output, code })
      }
    )
  })
}

async function getGitStatus(root: string) {
  const [branch, remote, status] = await Promise.all([
    runGit(root, ['rev-parse', '--abbrev-ref', 'HEAD']),
    runGit(root, ['remote', 'get-url', 'origin']),
    runGit(root, ['status', '--porcelain=v1'])
  ])

  const contentChanges: string[] = []
  const otherChanges: string[] = []
  if (status.ok && status.output) {
    for (const line of status.output.split('\n')) {
      if (!line.trim()) continue
      const file = line.slice(3).trim().replace(/\\/g, '/')
      // 文章与封面上传目录都属于创作台管理的范围，一并纳入提交
      if (file.startsWith('public/content/') || file.startsWith(`public/${STUDIO_CONFIG.coverDir}/`)) {
        contentChanges.push(line.trim())
      } else {
        otherChanges.push(line.trim())
      }
    }
  }

  return {
    branch: branch.ok ? branch.output : '',
    remote: remote.ok ? remote.output : '',
    contentChanges,
    otherChanges
  }
}

/** 判断目录 / 文件是否存在，用于动态拼接 git 路径 */
async function pathExists(target: string): Promise<boolean> {
  try {
    await access(target)
    return true
  } catch {
    return false
  }
}

// ==================== 插件 ====================

export function studioPlugin(): Plugin {
  let root = process.cwd()
  let token = ''
  let base = '/'

  return {
    name: 'pjfun:studio',
    // 只在 dev server 中生效，生产构建完全不含这部分代码
    apply: 'serve',

    configResolved(config) {
      root = config.root
      base = config.base || '/'
      // 非 VITE_ 前缀，避免口令被打进前端产物
      const env = loadEnv(config.mode, config.envDir || config.root, '')
      token = env.STUDIO_TOKEN || process.env.STUDIO_TOKEN || ''
    },

    configureServer(server) {
      const prefix = `${base}${STUDIO_CONFIG.apiPrefix}`

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '/', 'http://localhost')
        if (!url.pathname.startsWith(prefix)) return next()

        const denied = checkAuthorized(req, token)
        if (denied) return sendJson(res, denied.status, { ok: false, message: denied.message })

        const route = url.pathname.slice(prefix.length).replace(/^\/+/, '')
        const method = (req.method || 'GET').toUpperCase()

        try {
          // ---- 内容树与文章读写 ----
          if (method === 'GET' && route === 'tree') {
            return sendJson(res, 200, { ok: true, data: await listContentTree(root) })
          }

          if (method === 'GET' && route === 'post') {
            const file = url.searchParams.get('file') || ''
            return sendJson(res, 200, { ok: true, data: await readPost(root, file) })
          }

          if (method === 'GET' && route === 'attachment') {
            const file = url.searchParams.get('file') || ''
            return sendJson(res, 200, { ok: true, data: { meta: await readAttachmentMeta(root, file) } })
          }

          if (method === 'GET' && route === 'covers') {
            return sendJson(res, 200, { ok: true, data: await listCoverCandidates(root) })
          }

          // ---- 站点参数（.env） ----
          if (method === 'GET' && route === 'config') {
            return sendJson(res, 200, { ok: true, data: await readEnvConfig(root) })
          }

          if (method === 'POST' && route === 'config') {
            const body = await readJsonBody(req)
            const values = body.values
            if (!values || typeof values !== 'object' || Array.isArray(values)) {
              throw new ContentError('invalid', '参数格式不正确')
            }
            const config = await writeEnvConfig(root, values as Record<string, string>)
            return sendJson(res, 200, { ok: true, data: { ...config, restarting: true } })
          }

          if (method === 'POST' && route === 'create') {
            const body = await readJsonBody(req)
            contentBus.muteReload(STUDIO_CONFIG.reloadMuteMs)
            const created = await createPost(root, {
              dir: String(body.dir || ''),
              slug: String(body.slug || ''),
              title: String(body.title || ''),
              draft: Boolean(body.draft)
            })
            await contentBus.regenerate()
            return sendJson(res, 200, { ok: true, data: created })
          }

          if (method === 'POST' && route === 'save') {
            const body = await readJsonBody(req)
            const file = String(body.file || '')
            const frontmatter = normalizeFrontmatter((body.frontmatter || {}) as Record<string, unknown>)
            const content = String(body.content || '')

            const issues = await validatePost(root, { file, frontmatter, content })
            if (issues.some(issue => issue.level === 'error')) {
              return sendJson(res, 422, { ok: false, message: '校验未通过', data: { issues } })
            }

            contentBus.muteReload(STUDIO_CONFIG.reloadMuteMs)
            const saved = await savePost(root, { file, frontmatter, content })
            await contentBus.regenerate()
            return sendJson(res, 200, {
              ok: true,
              data: { file: saved.file, savedAt: Date.now(), issues }
            })
          }

          if (method === 'POST' && route === 'publish') {
            const body = await readJsonBody(req)
            contentBus.muteReload(STUDIO_CONFIG.reloadMuteMs)
            const published = await publishPost(root, {
              file: String(body.file || ''),
              targetDir: String(body.targetDir || '')
            })
            await contentBus.regenerate()
            return sendJson(res, 200, { ok: true, data: published })
          }

          if (method === 'POST' && route === 'upload') {
            const body = await readJsonBody(req)
            contentBus.muteReload(STUDIO_CONFIG.reloadMuteMs)
            const base64 = String(body.base64 || '').replace(/^data:[^;]+;base64,/, '')
            const uploaded = await uploadFile(root, {
              dir: String(body.dir || ''),
              slug: String(body.slug || ''),
              filename: String(body.filename || ''),
              base64,
              kind: body.kind === 'attachment' ? 'attachment' : 'image'
            })
            await contentBus.regenerate()
            return sendJson(res, 200, { ok: true, data: uploaded })
          }

          if (method === 'POST' && route === 'attachment-meta') {
            const body = await readJsonBody(req)
            contentBus.muteReload(STUDIO_CONFIG.reloadMuteMs)
            const meta = body.meta as AttachmentMeta
            const saved = await saveAttachmentMeta(root, String(body.file || ''), {
              title: String(meta?.title || ''),
              date: String(meta?.date || ''),
              cover: String(meta?.cover || ''),
              tags: Array.isArray(meta?.tags) ? meta.tags : [],
              excerpt: String(meta?.excerpt || ''),
              sticky: Boolean(meta?.sticky)
            })
            await contentBus.regenerate()
            return sendJson(res, 200, { ok: true, data: saved })
          }

          if (method === 'POST' && route === 'upload-cover') {
            const body = await readJsonBody(req)
            const base64 = String(body.base64 || '').replace(/^data:[^;]+;base64,/, '')
            const uploaded = await uploadCover(root, {
              filename: String(body.filename || 'cover.png'),
              base64
            })
            return sendJson(res, 200, { ok: true, data: uploaded })
          }

          // ---- Git ----
          if (method === 'GET' && route === 'git/status') {
            return sendJson(res, 200, { ok: true, data: await getGitStatus(root) })
          }

          if (method === 'POST' && route === 'git/commit') {
            const body = await readJsonBody(req)
            const message = String(body.message || '').trim()
            if (!message) throw new ContentError('invalid', '提交信息不能为空')

            const addPaths = ['public/content']
            if (await pathExists(path.resolve(root, 'public', ...STUDIO_CONFIG.coverDir.split('/')))) {
              addPaths.push(`public/${STUDIO_CONFIG.coverDir}`)
            }

            const add = await runGit(root, ['add', '-A', '--', ...addPaths])
            if (!add.ok) {
              return sendJson(res, 500, { ok: false, message: '暂存失败', data: { log: [add.output] } })
            }

            // 退出码 1 = 有已暂存改动；0 = 没有可提交内容
            const staged = await runGit(root, ['diff', '--cached', '--quiet', '--', ...addPaths])
            if (staged.ok) {
              return sendJson(res, 200, { ok: true, data: { committed: false, log: ['没有需要提交的内容变更'] } })
            }

            const commit = await runGit(root, ['commit', '-m', message])
            const log = [add.output, staged.output, commit.output].filter(Boolean)
            if (!commit.ok) {
              return sendJson(res, 500, { ok: false, message: '提交失败', data: { log } })
            }

            const hash = await runGit(root, ['rev-parse', '--short', 'HEAD'])
            return sendJson(res, 200, {
              ok: true,
              data: { committed: true, hash: hash.ok ? hash.output : '', log }
            })
          }

          if (method === 'POST' && route === 'git/push') {
            const body = await readJsonBody(req)
            // 推送必须由用户在前端明确确认，服务端二次校验
            if (body.confirm !== true) {
              return sendJson(res, 400, { ok: false, message: '推送前需要用户确认' })
            }

            const push = await runGit(root, ['push'], 120_000)
            if (!push.ok) {
              const output = push.output
              let hint = '推送失败'
              if (/non-fast-forward|rejected|fetch first/i.test(output)) {
                hint = '远端有新提交，请先执行 git pull --rebase 后再推送'
              } else if (/no upstream|set-upstream/i.test(output)) {
                hint = '当前分支未设置上游分支，请先执行 git push -u origin <branch>'
              } else if (/Authentication|Permission|403/i.test(output)) {
                hint = 'Git 认证失败，请检查远端凭据'
              }
              return sendJson(res, 500, { ok: false, message: hint, data: { log: [output] } })
            }
            return sendJson(res, 200, { ok: true, data: { log: [push.output || '推送成功'] } })
          }

          return sendJson(res, 404, { ok: false, message: `未知接口：${route}` })
        } catch (error) {
          if (error instanceof ContentError) {
            const status = error.code === 'exists' ? 409 : error.code === 'notfound' ? 404 : 400
            return sendJson(res, status, { ok: false, message: error.message })
          }
          console.error('[studio] 接口异常：', error)
          return sendJson(res, 500, {
            ok: false,
            message: error instanceof Error ? error.message : '服务端异常'
          })
        }
      })
    }
  }
}
