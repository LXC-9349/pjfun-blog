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

interface FeedSiteConfig {
  title: string
  description: string
  url: string
}

const toDate = (value: unknown): Date | null => {
  if (!value) return null
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

export function rssPlugin(site: FeedSiteConfig): Plugin {
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
          const siteUrl = site.url.replace(/\/+$/, '')

          // 读取导航数据
          const navPath = path.resolve(config.root, 'public/generated/nav.json')
          const navData = JSON.parse(await fs.readFile(navPath, 'utf-8')) as Post[]

          // 创建 Feed 实例
          const feed = new Feed({
            title: site.title,
            description: site.description,
            id: siteUrl,
            link: siteUrl,
            language: 'zh-CN',
            image: `${siteUrl}/img/192x192.png`,
            favicon: `${siteUrl}/favicon.ico`,
            copyright: `All rights reserved ${new Date().getFullYear()}`,
          })

          // 按日期倒序取最新 20 篇；无效日期直接跳过，避免输出 Invalid Date
          const latest = navData
            .map(post => ({ post, date: toDate(post.date) }))
            .filter((item): item is { post: Post; date: Date } => item.date !== null)
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 20)

          latest.forEach(({ post, date }) => {
            feed.addItem({
              title: post.title,
              description: post.excerpt,
              id: `${siteUrl}${post.path}`,
              link: `${siteUrl}${post.path}`,
              date,
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
