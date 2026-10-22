// B 站视频解析相关配置
export const BILIBILI_CONFIG = {
  /** 代理地址：302 到带签名的 MP4，可直接交给 video 播放 */
  proxyBase: 'https://jx.ouo.chat/bl/?url=',
  /** 第三方直链解析接口（代理失败时兜底） */
  parseApi: 'https://api.xingzhige.com/API/b_parse/',
  /** 解析请求超时（毫秒） */
  parseTimeout: 10_000,
  /** 直链缓存最小剩余有效期（毫秒） */
  cacheMinTtl: 60_000,
  /** 无 deadline 时的缓存时长（毫秒） */
  cacheFallbackTtl: 120_000
} as const

/** 生成 B 站视频播放地址（代理） */
export function bilibiliProxyUrl(bvid: string): string {
  return `${BILIBILI_CONFIG.proxyBase}${encodeURIComponent(bvid)}`
}
