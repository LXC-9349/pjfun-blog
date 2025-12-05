// SEO 插件
import { SITE_CONFIG } from '@/constants'

export function setupSEO() {
  // 设置基础SEO meta标签
  const metaTags = [
    { name: 'description', content: SITE_CONFIG.description },
    { name: 'keywords', content: SITE_CONFIG.keywords.join(', ') },
    { name: 'author', content: SITE_CONFIG.author },
    { property: 'og:title', content: SITE_CONFIG.title },
    { property: 'og:description', content: SITE_CONFIG.description },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: SITE_CONFIG.title },
    { name: 'twitter:description', content: SITE_CONFIG.description },
  ]

  // 添加meta标签到head
  metaTags.forEach(tag => {
    const meta = document.createElement('meta')
    Object.keys(tag).forEach(key => {
      meta.setAttribute(key, (tag as any)[key])
    })
    document.head.appendChild(meta)
  })
}