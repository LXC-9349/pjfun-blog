import type { Plugin } from 'vite'
import fs from 'fs/promises'
import path from 'path'

export function sitemapPlugin(): Plugin {
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
          const siteUrl = (process.env.VITE_SITE_URL || 'https://pjfun.top').replace(/\/+$/, '')

          // 读取导航数据
          const navPath = path.resolve(config.root, 'public/generated/nav.json')
          const navData = JSON.parse(await fs.readFile(navPath, 'utf-8'))

          const outDir = config.build.outDir || 'dist'

          // 生成 sitemap XML
          const urls = navData.map((post: any) => `
  <url>
    <loc>${siteUrl}${post.path}</loc>
    <lastmod>${post.date ? new Date(post.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')

          const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/archive</loc>
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
