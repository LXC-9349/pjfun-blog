import { SITE_CONFIG } from '@/constants'

// 存储已创建的meta标签，便于后续清理
const createdMetaTags: HTMLElement[] = []

export function setupSEO(articleData?: { title?: string; description?: string; path?: string }) {
  // 清理之前创建的meta标签
  createdMetaTags.forEach(tag => {
    if (tag.parentNode) {
      tag.parentNode.removeChild(tag)
    }
  })
  createdMetaTags.length = 0 // 清空数组

  // 根据是否有文章数据决定使用哪种SEO配置
  const title = articleData?.title || SITE_CONFIG.title
  const description = articleData?.description || SITE_CONFIG.description
  const url = articleData?.path ? `${window.location.origin}${articleData.path}` : window.location.href

  // 设置基础SEO meta标签
  const metaTags = [
    { name: 'description', content: description },
    { name: 'keywords', content: SITE_CONFIG.keywords.join(', ') },
    { name: 'author', content: SITE_CONFIG.author },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: articleData ? 'article' : 'website' },
    { property: 'og:url', content: url },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ]

  // 添加meta标签到head
  metaTags.forEach(tag => {
    const meta = document.createElement('meta')
    Object.keys(tag).forEach(key => {
      meta.setAttribute(key, (tag as any)[key])
    })
    document.head.appendChild(meta)
    createdMetaTags.push(meta) // 保存引用以便后续清理
  })

  // 更新页面标题
  document.title = title
}

// 专门用于更新文章详情页SEO的函数
export function updateArticleSEO(articleData: { title: string; description?: string; path?: string }) {
  setupSEO(articleData)
}