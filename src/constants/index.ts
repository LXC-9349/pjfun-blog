export const SITE_CONFIG = {
  icon: 'Pj',
  title: 'Pjfun Blog',
  description: '一个现代化的个人博客和技术分享平台',
  author: 'Simon',
  keywords: ['博客', '技术分享', '前端开发', 'Vue', 'TypeScript'],
  email:'pjfun@aliyun.com',
  socialLinks: {
    github: 'https://github.com/LXC-9349/pjfun-blog',
    Telegram: 'https://t.me/pjfun_top',
  }
}

// Giscus 评论系统配置 https://giscus.app/zh-CN
export const GISCUS_CONFIG = {
  enabled: true, // 启用评论系统
  repo: 'LXC-9349/blog-comment', // GitHub 仓库
  repoId: 'R_kgDOQmj5WA', // 仓库 ID
  category: 'Announcements', // Discussion 分类
  categoryId: 'DIC_kwDOQmj5WM4CzpLf', // 分类 ID
  mapping: 'pathname', // 映射方式
  strict: false, // 严格匹配
  reactionsEnabled: true, // 启用反应
  emitMetadata: false, // 发送元数据
  inputPosition: 'bottom', // 输入框位置
  theme: 'preferred_color_scheme', // 主题
  lang: 'zh-CN' // 语言
}

// 热门标签列表
export const HOT_TAGS = [
  'Vue',
  '网页',
  '文本',
  '在线课程',
  '编程教程',
  '职业技能',
  '知识管理',
  '思维导图',
  '学习笔记',
  '教育心得',
  '自我提升'
]
export const I18N_CONFIG = {
  zh: {
    siteTitle: SITE_CONFIG.title,
    siteDescription: '欢迎来到我的个人博客，这里记录了我的技术探索和思考。',
    articleDirectory: '文章目录',
    latestPosts: '最新文章',
    searchPlaceholder: '搜索文章...',
    readMore: '阅读全文',
    excerpt: '这篇文章还没有摘要...',
    noArticles: '暂无文章',
    unknownDate: '未知日期',
    home: '首页',
    toggleTheme: '切换主题',
    search: '搜索',
    close: '关闭',
    loading: '加载中...',
    error: '加载失败',
    success: '操作成功',
    searchHint: '输入关键词搜索...',
    noResults: '未找到相关内容',
    startSearching: '开始搜索...',
    articlesFound: '找到 {count} 篇文章',
    navigation: '导航',
    select: '选择',
    backToTop: '返回顶部',
    backToHome: '返回主页',
    filterByTag: '热门标签',
    clear: '清除',
    noExcerpt: '暂无摘要',
    loadMore: '加载更多',
    noArticlesWithTag: '没有找到标签为「{tag}」的文章',
    // 新增翻译项
    back: '返回',
    print: '打印',
    tags: '标签',
    share: '分享文章',
    readingTime: '分钟阅读',
    copy: '复制',
    download: '下载',
    linkCopied: '链接已复制到剪贴板',
    lightboxImage: '图片预览',
    copyLink: '复制链接',
    adjustFontSize: '调整字体大小',
    showDirectory: '显示目录',
    copyCode: '复制代码',
    fontSizeSmall: '小',
    fontSizeMedium: '中',
    fontSizeLarge: '大',
    // 收藏相关翻译
    addToFavorites: '添加到收藏',
    removeFromFavorites: '从收藏中移除',
    favorite: '收藏',
    favorited: '已收藏',
    // 分享相关翻译
    shareTo: '分享到',
    copied: '已复制',
    wechat: '微信',
    weibo: '微博',
    qq: 'QQ',
    twitter: 'X',
    facebook: '脸书',
    linkedin: '领英',
    telegram: '电报',
    email: '邮件',
    // 收藏相关翻译
    favoritesTitle: '收藏夹',
    yourFavorites: '您的收藏',
    clearAll: '清空所有',
    noFavorites: '暂无收藏',
    noFavoritesDesc: '您还没有收藏任何文章',
    browseArticles: '浏览文章',
    confirmClearAll: '确定要清空所有收藏吗？',
    // 归档相关翻译
    archiveTitle: '文章归档',
    noArchivedArticles: '暂无归档文章',
    totalArticles: '总文章数',
    timeRange: '时间范围',
    // 密码保护相关翻译
    passwordProtected: '密码保护',
    enterPasswordToAccess: '请输入密码以访问此网站',
    password: '密码',
    enterPassword: '请输入访问密码',
    access: '进入网站',
    checking: '验证中...',
    contactForAccess: '请联系网站管理员获取访问权限',
    passwordRequired: '请输入密码',
    incorrectPassword: '密码错误',
    loginError: '登录时发生错误，请稍后重试',
    passwordProtectionNotConfigured: '密码保护未正确配置',
    // 页脚相关翻译
    footerDescription: '一个现代化的个人博客和技术分享平台',
    allRightsReserved: '保留所有权利',
    siteVisitors: '本站访客数',
    siteViews: '本站总访问量',
    pageViews: '当前页面访问量'
  },
  en: {
    siteTitle: SITE_CONFIG.title,
    siteDescription: 'Welcome to my personal blog where I record my technical explorations and thoughts.',
    articleDirectory: 'Article Directory',
    latestPosts: 'Latest Posts',
    searchPlaceholder: 'Search articles...',
    readMore: 'Read More',
    excerpt: 'This article has no excerpt yet...',
    noArticles: 'No articles available',
    unknownDate: 'Unknown Date',
    home: 'Home',
    toggleTheme: 'Toggle Theme',
    search: 'Search',
    close: 'Close',
    print: 'Print',
    loading: 'Loading...',
    error: 'Failed to load',
    success: 'Operation successful',
    searchHint: 'Type keywords to search...',
    noResults: 'No relevant content found',
    startSearching: 'Start searching...',
    articlesFound: '{count} articles found',
    navigation: 'Navigate',
    select: 'Select',
    backToTop: 'Back to Top',
    backToHome: 'Back to Home',
    noArticlesWithTag: 'No articles found with tag 「{tag}」',
    // 新增翻译项
    back: 'Back',
    tags: 'Tags',
    share: 'Share Article',
    readingTime: 'min read',
    copy: 'Copy',
    download: 'Download',
    linkCopied: 'Link copied to clipboard',
    lightboxImage: 'Image Preview',
    copyLink: 'Copy Link',
    adjustFontSize: 'Adjust Font Size',
    showDirectory: 'Show Directory',
    copyCode: 'Copy Code',
    fontSizeSmall: 'Small',
    fontSizeMedium: 'Medium',
    fontSizeLarge: 'Large',
    // Favorites translations
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',
    favorite: 'Favorite',
    favorited: 'Favorited',
    // Sharing translations
    shareTo: 'Share to',
    copied: 'Copied',
    wechat: 'WeChat',
    weibo: 'Weibo',
    qq: 'QQ',
    twitter: 'X',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    telegram: 'Telegram',
    email: 'Email',
    // Favorites translations
    favoritesTitle: 'Favorites',
    yourFavorites: 'Your Favorites',
    clearAll: 'Clear All',
    noFavorites: 'No Favorites',
    noFavoritesDesc: 'You haven\'t favorited any articles yet',
    browseArticles: 'Browse Articles',
    confirmClearAll: 'Are you sure you want to clear all favorites?',
    // Archive translations
    archiveTitle: 'Article Archive',
    noArchivedArticles: 'No archived articles',
    totalArticles: 'Total Articles',
    timeRange: 'Time Range',
    // Password protection translations
    passwordProtected: 'Password Protected',
    enterPasswordToAccess: 'Enter password to access this website',
    password: 'Password',
    enterPassword: 'Enter access password',
    access: 'Access Website',
    checking: 'Verifying...',
    contactForAccess: 'Contact the site administrator for access',
    passwordRequired: 'Please enter password',
    incorrectPassword: 'Incorrect password',
    loginError: 'Error occurred during login, please try again later',
    passwordProtectionNotConfigured: 'Password protection not configured properly',
    // Footer translations
    footerDescription: 'A modern personal blog and technology sharing platform',
    allRightsReserved: 'All rights reserved',
    siteVisitors: 'Site Visitors',
    siteViews: 'Site Views',
    pageViews: 'Page Views'
  }
}