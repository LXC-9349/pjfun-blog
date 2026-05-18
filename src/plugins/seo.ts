import { SITE_CONFIG } from '@/constants'

// 存储已创建的meta标签，便于后续清理
const createdMetaTags: HTMLElement[] = []

// JSON-LD 结构化数据类型
export interface WebsiteJsonLd {
  "@context": "https://schema.org"
  "@type": "WebSite"
  name: string
  url: string
  description?: string
  author?: {
    "@type": "Person"
    name: string
  }
}

export interface ArticleJsonLd {
  "@context": "https://schema.org"
  "@type": "Article"
  headline: string
  description: string
  datePublished: string
  dateModified: string
  author: {
    "@type": "Person"
    name: string
  }
  publisher: {
    "@type": "Organization"
    name: string
  }
  mainEntityOfPage: string
  image?: string
}

export interface BreadcrumbJsonLd {
  "@context": "https://schema.org"
  "@type": "BreadcrumbList"
  itemListElement: Array<{
    "@type": "ListItem"
    position: number
    name: string
    item: string
  }>
}

/**
 * 添加/替换 JSON-LD 结构化数据
 */
export function addJsonLd(data: WebsiteJsonLd | ArticleJsonLd | BreadcrumbJsonLd) {
  // 移除已存在的 JSON-LD 脚本
  const existing = document.querySelectorAll('script[type="application/ld+json"]')
  existing.forEach(el => el.remove())

  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}

/**
 * 设置网站级别的 JSON-LD
 */
export function setupWebsiteJsonLd() {
  const data: WebsiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.title,
    url: window.location.origin,
    description: SITE_CONFIG.description,
    author: {
      "@type": "Person",
      name: SITE_CONFIG.author
    }
  }
  addJsonLd(data)
}

/**
 * 设置文章级别的 JSON-LD
 */
export function setupArticleJsonLd(article: {
  title: string
  description: string
  date: string
  cover?: string
  path: string
}) {
  const data: ArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      "@type": "Person",
      name: SITE_CONFIG.author
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.title
    },
    mainEntityOfPage: `${window.location.origin}${article.path}`,
    ...(article.cover ? { image: article.cover } : {})
  }
  addJsonLd(data)
}

/**
 * 设置面包屑导航 JSON-LD
 */
export function setupBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  const data: BreadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${window.location.origin}${item.path}`
    }))
  }
  addJsonLd(data)
}

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

  // 添加 JSON-LD 结构化数据
  if (articleData) {
    // 文章页面使用 Article schema
    // 注意：具体调用由页面组件负责，这里只设置基础 meta
  } else {
    // 首页/列表页使用 WebSite schema
    setupWebsiteJsonLd()
  }
}

// 专门用于更新文章详情页SEO的函数
export function updateArticleSEO(articleData: { title: string; description?: string; path?: string }) {
  setupSEO(articleData)
}

// 专门用于更新文章详情页 JSON-LD 的函数
export function updateArticleJsonLd(articleData: {
  title: string
  description: string
  date: string
  cover?: string
  path: string
}) {
  setupArticleJsonLd(articleData)
}