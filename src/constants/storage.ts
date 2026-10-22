// 本地存储键（统一管理，避免散落在页面与工具中）
export const STORAGE_KEYS = {
  favorites: 'pjfun_blog_favorites',
  readingProgress: 'pjfun_blog_reading_progress',
  recentArticles: 'pjfun_blog_recent_articles',
  searchCache: 'pjfun_blog_search_cache',
  navDataCache: 'pjfun_blog_nav_data_cache',
  navTreeState: 'pjfun_blog_nav_tree_state',
  accessPassword: 'blog-access-pwd',
  theme: 'theme',
  appearance: 'pjfun_blog_appearance',
  language: 'language',
  redirectAfterLogin: 'redirect-after-login',
  redirectUrl: 'redirectUrl',
  webVersion: 'pj_blog_web_version',
  studioToken: 'pjfun_studio_token',
  studioDraft: 'pjfun_studio_draft'
} as const

// 本地存储数据的数量上限
// Storage limits for locally persisted lists
export const STORAGE_LIMITS = {
  /** 阅读进度最多保留条数 */
  readingProgressMax: 20,
  /** 最近浏览文章最多保留条数 */
  recentArticlesMax: 5
} as const
