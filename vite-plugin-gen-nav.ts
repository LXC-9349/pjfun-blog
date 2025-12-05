import { resolve } from 'path'
import { readdir, readFile, stat, mkdir, writeFile } from 'fs/promises'
import matter from 'gray-matter'
import type { Plugin } from 'vite'

export function genNavPlugin(): Plugin {
    return {
        name: 'gen-nav',
        async buildStart() {
            const contentDir = resolve(__dirname, 'public/content')
            const outDir = resolve(__dirname, 'public/generated')
            await mkdir(outDir, { recursive: true })

            const nav: any[] = []
            const tree = { type: 'folder', title: '根目录', path: '/', children: [] as any[] }

            async function scan(dir: string, parent: any, base = '') {
                const entries = await readdir(dir)
                for (const e of entries) {
                    if (e.startsWith('_')) continue
                    const fp = resolve(dir, e)
                    const s = await stat(fp)
                    if (s.isDirectory()) {
                        const node = { type: 'folder', title: e, path: `${base}/${e}`, children: [] }
                        parent.children.push(node)
                        await scan(fp, node, `${base}/${e}`)
                    } else if (e.endsWith('.md')) {
                        const raw = await readFile(fp, 'utf-8')
                        const { data, content } = matter(raw)
                        const slug = e.replace('.md', '')
                        const route = base ? `${base}/${slug}` : `/${slug}`
                        const item = {
                            type: 'post',
                            title: data.title || slug,
                            path: route,
                            date: data.date,
                            cover: data.cover,
                            tags: data.tags || [],
                            excerpt: data.desc || content.trim().split('\n')[0].slice(0, 120) + '...',
                            sticky: data.sticky || false // 添加置顶属性
                        }
                        nav.push(item)
                        parent.children.push({ type: 'post', title: item.title, path: route })
                    }
                }
            }

            await scan(contentDir, tree)

            // 只生成这两个 JSON 文件到 public/generated 目录
            await writeFile(resolve(outDir, 'nav.json'), JSON.stringify(nav, null, 2))
            await writeFile(resolve(outDir, 'tree.json'), JSON.stringify(tree, null, 2))

            console.log(`Generated ${nav.length} posts → nav.json & tree.json`)
        },

        // 关键：开发时动态返回所有 Markdown 路径的路由
        resolveId(id) {
            if (id === 'virtual:article-routes') return id
        },
        load(id) {
            if (id === 'virtual:article-routes') {
                return `
      import Article from '/src/pages/article.vue'
      
      export const articleRoutes = [{
        // 匹配所有路径
        path: '/:pathMatch(.*)*',
        component: Article
      }]
    `
            }
        },
        
        // 添加 configureServer 钩子以处理开发服务器中的文件请求
        // configureServer(server) {
        //     // 不需要额外处理，因为/public下的文件Vite会自动提供服务
        // }
    }
}