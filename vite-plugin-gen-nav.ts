import { resolve } from 'path'
import { readdir, readFile, stat, mkdir, writeFile,rm } from 'fs/promises'
import matter from 'gray-matter'
import type { Plugin } from 'vite'
import yaml from 'yaml'

export function genNavPlugin(navName:string,treeName:string,baseUrl:string): Plugin {
    return {
        name: 'gen-nav',
        async buildStart() {
            const contentDir = resolve(__dirname, 'public/content')
            const outDir = resolve(__dirname, 'public/generated')

            await rm(outDir, { recursive: true, force: true })
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
                    } else if (/\.(md|html|txt|pdf|docx?|xlsx?)$/.test(e)) {
                        const extension = e.split('.').pop() || 'md'
                        const slug = e.replace(/\.(md|html|txt|pdf|docx?|xlsx?)$/, '')
                        const route = base ? `${base}/${slug}` : `/${slug}`
                        
                        // 检查是否存在描述配置文件 (.desc.json 或 .desc.yaml)
                        let descData: any = null;
                        try {
                            const jsonDescPath = fp + '.desc.json';
                            const yamlDescPath = fp + '.desc.yaml';
                            
                            if (await stat(jsonDescPath).catch(() => false)) {
                                const descRaw = await readFile(jsonDescPath, 'utf-8');
                                descData = JSON.parse(descRaw);
                            } else if (await stat(yamlDescPath).catch(() => false)) {
                                const descRaw = await readFile(yamlDescPath, 'utf-8');
                                descData = yaml.parse(descRaw);
                            }
                        } catch (err) {
                            console.warn(`读取描述文件失败: ${fp}`, err);
                        }
                        
                        // 对于二进制文件（如PDF、Word、Excel），我们不需要读取内容
                        let raw = ''
                        if (['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(extension)) {
                            // 对于二进制文件不读取内容
                        } else {
                            raw = await readFile(fp, 'utf-8')
                        }
                        const lastModifyTime=s.mtime.toISOString()
                        // 正确处理文件URL，确保中文字符被正确编码
                        const fileUrl = `/content${route}.${extension}`;
                        
                        let itemData = {
                            type: 'post',
                            title: slug,
                            path: route,
                            url: fileUrl,
                            date: lastModifyTime,
                            cover: '',
                            tags: [],
                            excerpt: '',
                            sticky: false,
                            extension: extension
                        }
                        
                        // 如果存在描述配置文件，则优先使用其中的数据
                        if (descData) {
                            itemData = {
                                type: 'post',
                                title: descData.title || slug,
                                path: route,
                                url: fileUrl,
                                date: descData.date || lastModifyTime,
                                cover: descData.cover || '',
                                tags: descData.tags || [],
                                excerpt: descData.excerpt || '',
                                sticky: descData.sticky || false,
                                extension: extension
                            };
                        } else if (extension === 'md') {
                            // 只有 Markdown 文件才解析 frontmatter
                            const { data, content } = matter(raw)
                            //@ts-ignore
                            itemData = {
                                type: 'post',
                                title: data.title || slug,
                                path: route,
                                url: fileUrl,
                                date: data.date,
                                cover: data.cover,
                                tags: data.tags || [],
                                excerpt: data.desc || content.trim().split('\n')[0].slice(0, 120) + '...',
                                sticky: data.sticky || false
                            }
                        } else if (extension === 'html') {
                            // 解析 HTML 文件的元数据
                            const titleMatch = raw.match(/<title>(.*?)<\/title>/i)
                            const title = titleMatch ? titleMatch[1] : slug
                            
                            // 尝试提取 meta 描述
                            let excerpt = ''
                            const descMatch = raw.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
                            if (descMatch) {
                                excerpt = descMatch[1].slice(0, 120) + '...'
                            } else {
                                // 如果没有 meta 描述，则从正文提取
                                const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i)
                                if (bodyMatch) {
                                    const cleanText = bodyMatch[1]
                                        .replace(/<[^>]*>/g, '') // 移除 HTML 标签
                                        .replace(/\s+/g, ' ')    // 合并空白字符
                                        .trim()
                                    excerpt = cleanText.slice(0, 120) + '...'
                                }
                            }
                            let cover = ''
                            const descCoverMatch = raw.match(/<meta[^>]*name=["']cover["'][^>]*content=["']([^"']*)["'][^>]*>/i)
                            if (descCoverMatch) {
                                cover = descCoverMatch[1]
                            }
                            
                            itemData = {
                                type: 'post',
                                title: title,
                                path: route,
                                url: fileUrl,
                                date: lastModifyTime,
                                cover: cover||'/img/d2.webp',
                                //@ts-ignore
                                tags: ['网页'],
                                excerpt: excerpt,
                                sticky: false
                            }
                        } else if (extension === 'txt') {
                            // 解析 TXT 文件的元数据
                            const lines = raw.split('\n')
                            const title = lines[0] ? lines[0].trim() : slug
                            const excerpt = lines.slice(0, 3).join(' ').slice(0, 120) + '...'
                            
                            itemData = {
                                type: 'post',
                                title: title || slug,
                                path: route,
                                url: fileUrl,
                                date: lastModifyTime,
                                cover: '/img/d3.webp',
                                //@ts-ignore
                                tags: ['文本'],
                                excerpt: excerpt,
                                sticky: false,
                                extension: extension
                            }
                        } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(extension)) {
                            // 处理 PDF、Word 和 Excel 文件
                            itemData = {
                                type: 'post',
                                title: slug,
                                path: route,
                                url: fileUrl,
                                date: lastModifyTime,
                                cover: '/img/d7.webp',
                                //@ts-ignore
                                tags: extension === 'pdf' ? ['PDF'] : (extension.includes('doc') ? ['Word'] : ['Excel']),
                                excerpt: `${extension.toUpperCase()}`,
                                sticky: false,
                                extension: extension
                            }
                        }
                        let coverPath = itemData.cover;
                        if (coverPath && !coverPath.startsWith('http') && baseUrl!=='/') {
                            // 如果 cover 不以 http 开头，并且存在基础路径，则加上基础路径
                            coverPath = `${baseUrl}/${coverPath}`.replace(/\/+/g, '/'); // 避免重复的斜杠
                            itemData.cover=coverPath
                        }
                        nav.push(itemData)
                        parent.children.push({ type: 'post', title: itemData.title, path: route })
                    }
                }
            }

            await scan(contentDir, tree)

            // 只生成这两个 JSON 文件到 public/generated 目录
            await writeFile(resolve(outDir, navName), JSON.stringify(nav, null, 2))
            await writeFile(resolve(outDir, treeName), JSON.stringify(tree, null, 2))

            console.log(`Generated ${nav.length} posts → ${navName} & ${treeName}`)
        },

        // 关键：开发时动态返回所有路径的路由
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
        },
        
        // 添加 configureServer 钩子以处理开发服务器中的文件请求
        // configureServer(server) {
        //     // 不需要额外处理，因为/public下的文件Vite会自动提供服务
        // }
    }
}