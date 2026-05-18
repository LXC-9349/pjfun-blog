import type { Plugin } from 'vite'
import fs from 'fs/promises'
import path from 'path'
import { Feed } from 'feed'

interface Post {
  title: string
  path: string
  date: string
  cover?: string
  tags?: string[]
  excerpt?: string
  sticky?: boolean
}

export function rssPlugin(): Plugin {
  let config: any

  return {
    name: 'vite-plugin-rss',
    enforce: 'post',
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    async closeBundle() {
      if (config.command === 'build') {
        try {
          const siteUrl = process.env.VITE_SITE_URL || 'https://pjfun.top'

          // 读取导航数据
          const navPath = path.resolve(config.root, 'public/generated/nav.json')
          const navData = JSON.parse(await fs.readFile(navPath, 'utf-8')) as Post[]

          // 创建 Feed 实例
          const feed = new Feed({
            title: process.env.VITE_SITE_TITLE || 'Pjfun Blog',
            description: process.env.VITE_SITE_DESCRIPTION || '一个现代化的个人博客和技术分享平台',
            id: siteUrl,
            link: siteUrl,
            language: 'zh-CN',
            image: `${siteUrl}/img/192x192.png`,
            favicon: `${siteUrl}/favicon.ico`,
            copyright: `All rights reserved ${new Date().getFullYear()}`,
          })

          // 添加文章到 Feed
          navData.slice(0, 20).forEach(post => {
            feed.addItem({
              title: post.title,
              description: post.excerpt,
              id: `${siteUrl}${post.path}`,
              link: `${siteUrl}${post.path}`,
              date: new Date(post.date),
              image: post.cover ? (post.cover.startsWith('http') ? post.cover : `${siteUrl}${post.cover}`) : undefined,
            })
          })

          // 确保 dist 目录存在
          const outDir = config.build.outDir || 'dist'
          await fs.mkdir(path.resolve(config.root, outDir), { recursive: true })

          // 写入 RSS 文件
          await fs.writeFile(
            path.resolve(config.root, outDir, 'rss.xml'),
            feed.rss2(),
            'utf-8'
          )

          // 写入 Atom 文件
          await fs.writeFile(
            path.resolve(config.root, outDir, 'atom.xml'),
            feed.atom1(),
            'utf-8'
          )

          // 写入 JSON Feed 文件
          await fs.writeFile(
            path.resolve(config.root, outDir, 'feed.json'),
            feed.json1(),
            'utf-8'
          )

          console.log('✓ RSS feeds generated (rss.xml, atom.xml, feed.json)')
        } catch (error) {
          console.error('Error generating RSS feeds:', error)
        }
      }
    }
  }
}
