/// <reference types="vite/client" />
// 读取站点配置的环境变量。
// 浏览器端使用显式白名单（逐个引用 import.meta.env.KEY），避免 Vite 把整份 env
// 序列化进产物；Node 构建脚本请使用 Vite 的 loadEnv，不要依赖此函数读 .env。
// 新增配置项时必须在 getBrowserEnv 中登记。
type BrowserEnv = Record<string, string | undefined>

let browserEnv: BrowserEnv | null = null

function getBrowserEnv(): BrowserEnv {
  if (!browserEnv) {
    browserEnv = {
      VITE_SITE_ICON: import.meta.env.VITE_SITE_ICON,
      VITE_SITE_TITLE: import.meta.env.VITE_SITE_TITLE,
      VITE_SITE_DESCRIPTION: import.meta.env.VITE_SITE_DESCRIPTION,
      VITE_SITE_AUTHOR: import.meta.env.VITE_SITE_AUTHOR,
      VITE_SITE_KEYWORDS: import.meta.env.VITE_SITE_KEYWORDS,
      VITE_SITE_EMAIL: import.meta.env.VITE_SITE_EMAIL,
      VITE_SITE_URL: import.meta.env.VITE_SITE_URL,
      VITE_LOADING_TEXT: import.meta.env.VITE_LOADING_TEXT,
      VITE_JS_DISABLED_NOTICE: import.meta.env.VITE_JS_DISABLED_NOTICE,
      VITE_RESOURCE_LOAD_FAILED_TEXT: import.meta.env.VITE_RESOURCE_LOAD_FAILED_TEXT,
      VITE_REFRESH_REQUIRED_TEXT: import.meta.env.VITE_REFRESH_REQUIRED_TEXT,
      VITE_SOCIAL_GITHUB: import.meta.env.VITE_SOCIAL_GITHUB,
      VITE_SOCIAL_TELEGRAM: import.meta.env.VITE_SOCIAL_TELEGRAM,
      VITE_FOOT_GITHUB: import.meta.env.VITE_FOOT_GITHUB,
      VITE_HOT_RANK_URL: import.meta.env.VITE_HOT_RANK_URL,
      VITE_GISCUS_ENABLED: import.meta.env.VITE_GISCUS_ENABLED,
      VITE_GISCUS_CLIENT_SRC: import.meta.env.VITE_GISCUS_CLIENT_SRC,
      VITE_GISCUS_REPO: import.meta.env.VITE_GISCUS_REPO,
      VITE_GISCUS_REPO_ID: import.meta.env.VITE_GISCUS_REPO_ID,
      VITE_GISCUS_CATEGORY: import.meta.env.VITE_GISCUS_CATEGORY,
      VITE_GISCUS_CATEGORY_ID: import.meta.env.VITE_GISCUS_CATEGORY_ID,
      VITE_GISCUS_MAPPING: import.meta.env.VITE_GISCUS_MAPPING,
      VITE_GISCUS_STRICT: import.meta.env.VITE_GISCUS_STRICT,
      VITE_GISCUS_REACTIONS: import.meta.env.VITE_GISCUS_REACTIONS,
      VITE_GISCUS_METADATA: import.meta.env.VITE_GISCUS_METADATA,
      VITE_GISCUS_POSITION: import.meta.env.VITE_GISCUS_POSITION,
      VITE_GISCUS_LANG: import.meta.env.VITE_GISCUS_LANG,
      VITE_BUSUANZI_ENDPOINT: import.meta.env.VITE_BUSUANZI_ENDPOINT,
      VITE_PING0_IMAGE_URL: import.meta.env.VITE_PING0_IMAGE_URL,
      VITE_HOT_TAGS: import.meta.env.VITE_HOT_TAGS,
      VITE_HOT_TAGS_LIMIT: import.meta.env.VITE_HOT_TAGS_LIMIT,
      VITE_DEFAULT_BACKGROUND: import.meta.env.VITE_DEFAULT_BACKGROUND,
      VITE_DEFAULT_FONT: import.meta.env.VITE_DEFAULT_FONT,
      VITE_DEFAULT_CURSOR: import.meta.env.VITE_DEFAULT_CURSOR,
      VITE_DEFAULT_ACCENT_H: import.meta.env.VITE_DEFAULT_ACCENT_H,
      VITE_DEFAULT_ACCENT_S: import.meta.env.VITE_DEFAULT_ACCENT_S,
      VITE_DEFAULT_ACCENT_L: import.meta.env.VITE_DEFAULT_ACCENT_L,
      VITE_DEFAULT_AUTO_ROTATE: import.meta.env.VITE_DEFAULT_AUTO_ROTATE,
      VITE_DEFAULT_ROTATE_INTERVAL: import.meta.env.VITE_DEFAULT_ROTATE_INTERVAL,
      VITE_DEFAULT_KEN_BURNS: import.meta.env.VITE_DEFAULT_KEN_BURNS,
      VITE_DEFAULT_OVERLAY: import.meta.env.VITE_DEFAULT_OVERLAY,
      VITE_DEFAULT_EFFECT_ENABLED: import.meta.env.VITE_DEFAULT_EFFECT_ENABLED,
      VITE_DEFAULT_PETAL_TYPES: import.meta.env.VITE_DEFAULT_PETAL_TYPES,
      VITE_DEFAULT_PETAL_COUNT: import.meta.env.VITE_DEFAULT_PETAL_COUNT,
      VITE_DEFAULT_ROTATION_SPEED: import.meta.env.VITE_DEFAULT_ROTATION_SPEED,
      VITE_DEFAULT_HORIZONTAL_SPEED: import.meta.env.VITE_DEFAULT_HORIZONTAL_SPEED,
      VITE_DEFAULT_VERTICAL_SPEED: import.meta.env.VITE_DEFAULT_VERTICAL_SPEED,
      VITE_DEFAULT_PETAL_SWING: import.meta.env.VITE_DEFAULT_PETAL_SWING,
      VITE_DEFAULT_PETAL_Z_INDEX: import.meta.env.VITE_DEFAULT_PETAL_Z_INDEX
    }
  }
  return browserEnv
}

export function getEnvVar(key: string, defaultValue: string): string {
  // 构建脚本（Node）中返回 process.env 或默认值；.env 需由调用方 loadEnv 显式读取
  const nodeEnv = (globalThis as {
    process?: { env?: Record<string, string | undefined> }
  }).process?.env
  if (nodeEnv) {
    return nodeEnv[key] || defaultValue
  }
  return getBrowserEnv()[key] || defaultValue
}
