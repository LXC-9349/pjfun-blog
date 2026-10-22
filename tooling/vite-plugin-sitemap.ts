import type { Plugin } from 'vite'
import fs from 'fs/promises'
import path from 'path'

interface SitemapSiteConfig {
  url: string
}

interface NavPost {
  path: string
  date?: string
}

/** XML 文本转义，避免标题 / 路径中的 & < > 破坏 sitemap */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** 日期无效时回退为构建当天，避免 toISOString() 抛错导致整份 sitemap 丢失 */
function toLastmod(value?: string): string {
  if (value) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date.toISOString().split('T')[0]!
  }
  return new Date().toISOString().split('T')[0]!
}

export function sitemapPlugin(site: SitemapSiteConfig): Plugin {
  let config: any

  return {
    name: 'vite-plugin-sitemap',
    enforce: 'post',
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    async closeBundle() {
      if (config.command === 'build') {
        try {
          const siteUrl = site.url.replace(/\/+$/, '')

          // 读取导航数据
          const navPath = path.resolve(config.root, 'public/generated/nav.json')
          const navData = JSON.parse(await fs.readFile(navPath, 'utf-8')) as NavPost[]

          const outDir = config.build.outDir || 'dist'

          // 生成 sitemap XML
          const urls = navData.map((post: NavPost) => `
  <url>
    <loc>${escapeXml(`${siteUrl}${post.path}`)}</loc>
    <lastmod>${toLastmod(post.date)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')

          const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(`${siteUrl}/`)}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${escapeXml(`${siteUrl}/archive`)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>${urls}
</urlset>`

          await fs.writeFile(
            path.resolve(config.root, outDir, 'sitemap.xml'),
            sitemap,
            'utf-8'
          )

          console.log(`✓ Sitemap generated: sitemap.xml (${navData.length + 2} URLs)`)
        } catch (error) {
          console.error('Error generating sitemap:', error)
        }
      }
    }
  }
}
