// 站点基础信息与第三方服务配置（均支持 .env 覆盖）
import { getEnvVar } from './env'

/** 读取环境变量的函数；构建脚本可传入由 loadEnv 解析出的读取器 */
export type EnvReader = (key: string, fallback: string) => string

/**
 * 创建站点配置。
 * 客户端直接使用下面的 SITE_CONFIG；vite.config / RSS / sitemap 在构建时
 * 传入基于 loadEnv 的读取器，保证 .env 中的值同样作用于构建产物。
 */
export function createSiteConfig(read: EnvReader) {
  return {
    icon: read('VITE_SITE_ICON', 'Pj'),
    title: read('VITE_SITE_TITLE', 'Pjfun Blog'),
    description: read('VITE_SITE_DESCRIPTION', '一个现代化的个人博客和技术分享平台'),
    author: read('VITE_SITE_AUTHOR', 'Simon'),
    keywords: (read('VITE_SITE_KEYWORDS', '博客,技术分享,前端开发,Vue,TypeScript') || '').split(',').map(k => k.trim()),
    email: read('VITE_SITE_EMAIL', 'admin@pjfun.com'),
    url: read('VITE_SITE_URL', 'https://pjfun.top'),
    // 页面加载态与无脚本提示文案
    loadingText: read('VITE_LOADING_TEXT', 'Loading'),
    jsDisabledNotice: read('VITE_JS_DISABLED_NOTICE', '请开启 JavaScript'),
    // 静态资源加载器（pj_public.js）提示文案
    publicTexts: {
      resourceLoadFailed: read('VITE_RESOURCE_LOAD_FAILED_TEXT', '资源加载失败,请刷新'),
      refreshRequired: read('VITE_REFRESH_REQUIRED_TEXT', '页面需要刷新以完成更新...')
    },
    socialLinks: {
      github: read('VITE_SOCIAL_GITHUB', 'https://github.com/LXC-9349/pjfun-blog'),
      Telegram: read('VITE_SOCIAL_TELEGRAM', 'https://t.me/pjfun_top')
    },
    foot: {
      github: read('VITE_FOOT_GITHUB', 'https://github.com/LXC-9349/pjfun-blog')
    },
    // 热榜新闻入口（热门标签旁的特殊按钮）
    hotRank: read('VITE_HOT_RANK_URL', 'https://www.pjfun.top/fun/rank')
  }
}

export const SITE_CONFIG = createSiteConfig(getEnvVar)

// 仓库地址
export const GIT_REPO = SITE_CONFIG.socialLinks.github

// Giscus 评论系统配置 https://giscus.app/zh-CN
export const GISCUS_CONFIG = {
  enabled: getEnvVar('VITE_GISCUS_ENABLED', 'true') === 'true', // 启用评论系统
  clientSrc: getEnvVar('VITE_GISCUS_CLIENT_SRC', 'https://giscus.app/client.js'), // 客户端脚本
  origin: 'https://giscus.app', // postMessage 校验来源
  repo: getEnvVar('VITE_GISCUS_REPO', 'LXC-9349/blog-comment'), // GitHub 仓库
  repoId: getEnvVar('VITE_GISCUS_REPO_ID', 'R_kgDOQmj5WA'), // 仓库 ID
  category: getEnvVar('VITE_GISCUS_CATEGORY', 'Announcements'), // Discussion 分类
  categoryId: getEnvVar('VITE_GISCUS_CATEGORY_ID', 'DIC_kwDOQmj5WM4CzpLf'), // 分类 ID
  mapping: getEnvVar('VITE_GISCUS_MAPPING', 'pathname'), // 映射方式
  strict: getEnvVar('VITE_GISCUS_STRICT', 'false') === 'true', // 严格匹配
  reactionsEnabled: getEnvVar('VITE_GISCUS_REACTIONS', 'true') === 'true', // 启用反应
  emitMetadata: getEnvVar('VITE_GISCUS_METADATA', 'false') === 'true', // 发送元数据
  inputPosition: getEnvVar('VITE_GISCUS_POSITION', 'top'), // 输入框位置
  lang: getEnvVar('VITE_GISCUS_LANG', 'zh-CN') // 语言
}

// 站点统计配置（不蒜子 + ping0 访客信息图）
export const SITE_STATS_CONFIG = {
  // 不蒜子 JSONP 接口
  busuanziEndpoint: getEnvVar('VITE_BUSUANZI_ENDPOINT', 'https://busuanzi.ibruce.info/busuanzi'),
  // 请求超时（毫秒）
  timeout: 8000,
  // ping0 访客 IP 信息图片（签名档简单版）
  ping0ImageUrl: getEnvVar('VITE_PING0_IMAGE_URL', 'https://ping0.cc/img1'),
  ping0Link: 'https://ping0.cc/'
} as const
