// B 站视频直链兜底解析
// 主链路：constants/bilibili.ts 中的 bilibiliProxyUrl（302 到带签名的 MP4）
// 兜底：代理失败时通过第三方解析接口取直链，拿到后同样交给 video 播放
import { BILIBILI_CONFIG } from '@/constants'

const directCache = new Map<string, { url: string; expireAt: number }>()

function parseDeadline(url: string): number {
  try {
    const deadline = Number(new URL(url).searchParams.get('deadline'))
    return Number.isFinite(deadline) && deadline > 0 ? deadline * 1000 : 0
  } catch {
    return 0
  }
}

/** 解析 B 站视频直链，失败返回 null */
export async function resolveBilibiliDirect(bvid: string): Promise<string | null> {
  const cached = directCache.get(bvid)
  if (cached && cached.expireAt > Date.now() + BILIBILI_CONFIG.cacheMinTtl) return cached.url

  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), BILIBILI_CONFIG.parseTimeout)
  try {
    const pageUrl = encodeURIComponent(`https://www.bilibili.com/video/${bvid}`)
    const response = await fetch(`${BILIBILI_CONFIG.parseApi}?url=${pageUrl}`, {
      signal: controller.signal,
      credentials: 'omit'
    })
    if (!response.ok) return null

    const data = (await response.json()) as { code?: number; data?: { video?: { url?: string } } }
    const url = data?.data?.video?.url
    if (!url) return null

    directCache.set(bvid, { url, expireAt: parseDeadline(url) || Date.now() + BILIBILI_CONFIG.cacheFallbackTtl })
    return url
  } catch {
    return null
  } finally {
    window.clearTimeout(timer)
  }
}
