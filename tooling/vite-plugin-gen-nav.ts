import { resolve } from 'path'
import type { Plugin, ViteDevServer } from 'vite'
import { generateNav } from './content-core'
import { contentBus } from './content-bus'
import { STUDIO_CONFIG } from '../src/constants/studio'

// 需要触发导航重建的文件：文章本体与元数据文件
const WATCH_FILE_RE = /\.(md|html|txt|pdf|docx?|xlsx?|desc\.json|desc\.yaml)$/i

export function genNavPlugin(navName: string, treeName: string, baseUrl: string): Plugin {
    let root = process.cwd()
    let isBuild = false
    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    let queue: Promise<void> = Promise.resolve()
    let disposed = false

    /** 串行生成，避免连续保存时同时写同一份 JSON */
    const generate = (clean = false): Promise<void> => {
        queue = queue
            .catch(() => undefined)
            .then(async () => {
                const scan = await generateNav(root, navName, treeName, baseUrl, { clean })
                console.log(`[gen-nav] ${scan.nav.length} posts → ${navName} & ${treeName}`)
            })
            .catch(error => {
                console.warn('[gen-nav] 生成导航数据失败：', error)
            })
        return queue
    }

    return {
        name: 'pjfun:gen-nav',
        configResolved(config) {
            root = config.root
            isBuild = config.command === 'build'
        },

        async buildStart() {
            // 构建前清空旧数据，避免历史版本文件残留在产物里
            await generate(isBuild)
        },

        configureServer(server: ViteDevServer) {
            const contentDir = resolve(root, 'public/content')
            const isContentPath = (file: string) => {
                const normalized = file.split('\\').join('/')
                return normalized.startsWith(contentDir.split('\\').join('/') + '/')
            }

            // 显式监听 content 目录：public 下的文件不走模块依赖图
            server.watcher.add(contentDir)
            contentBus.setRegenerator(() => generate(false))
            server.httpServer?.once('close', () => {
                // dev server 重启时停止旧实例的防抖任务，避免与新实例同时写文件
                disposed = true
                if (debounceTimer) {
                    clearTimeout(debounceTimer)
                    debounceTimer = null
                }
                contentBus.setRegenerator(null)
            })

            const schedule = () => {
                if (disposed) return
                if (debounceTimer) clearTimeout(debounceTimer)
                debounceTimer = setTimeout(async () => {
                    debounceTimer = null
                    await generate(false)
                    // Studio 保存时静默刷新，避免编辑器内容被重置
                    if (!contentBus.isReloadMuted()) {
                        server.ws.send({ type: 'full-reload', path: '*' })
                    }
                }, STUDIO_CONFIG.navRebuildDebounceMs)
            }

            const onFile = (file: string) => {
                if (!isContentPath(file)) return
                if (!WATCH_FILE_RE.test(file)) return
                schedule()
            }
            // 目录增删只影响目录树，同样需要重建
            const onDir = (dir: string) => {
                if (!isContentPath(dir)) return
                schedule()
            }

            server.watcher.on('add', onFile)
            server.watcher.on('unlink', onFile)
            server.watcher.on('change', onFile)
            server.watcher.on('addDir', onDir)
            server.watcher.on('unlinkDir', onDir)
        },

        // 文章详情页统一走 catch-all 路由，内容在运行时按 nav 数据拉取
        resolveId(id) {
            if (id === 'virtual:article-routes') return id
        },
        load(id) {
            if (id === 'virtual:article-routes') {
                return `
      import Article from '/src/pages/articleDetail.vue'

      export const articleRoutes = [{
        // 匹配所有路径
        path: '/:pathMatch(.*)*',
        component: Article
      }]
    `
            }
        }
    }
}
