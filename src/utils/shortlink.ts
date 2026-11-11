// 短链工具：把 /s/<code> 还原成文章路径，也能给任意文章路径生成短链
//
// 设计取舍：
//   - 不依赖后端：短码由文章 path 在**构建期**派生（见 tooling/content-core.ts 的 shortCodeOf），
//     同一路径每次构建得到同一短码，历史分享链接不会失效。
//   - 码表写在 public/generated/shortlinks.json，随导航数据一起生成，
//     与 nav.json 同源，避免出现「文章有、短链没有」的错位。
//   - 前端只做一次查表跳转，失败则回首页，不需要服务端 302。

import {getEnvVariable} from '@/utils/tool'

/** 短链码表：{ code: 文章路径 } */
export type ShortLinkMap = Record<string, string>

export const SHORT_LINK_PREFIX = '/s/'
/** 码表文件名固定，不跟随 nav 的版本号变化 */
export const SHORT_LINK_FILE = 'shortlinks.json'

let cache: ShortLinkMap | null = null
let loading: Promise<ShortLinkMap> | null = null

/** 载入码表（带内存缓存，重复跳转不重复请求） */
export async function loadShortLinks(): Promise<ShortLinkMap> {
  if (cache) return cache
  if (loading) return loading

  loading = (async () => {
    const base = getEnvVariable('VITE_BASE') || '/'
    const url = `${base}generated/${SHORT_LINK_FILE}`
    try {
      const res = await fetch(url, {cache: 'no-cache'})
      if (!res.ok) return {}
      const data = (await res.json()) as ShortLinkMap
      cache = data && typeof data === 'object' ? data : {}
      return cache
    } catch {
      // 码表缺失不应阻塞访问：交给调用方回退到首页
      return {}
    } finally {
      loading = null
    }
  })()

  return loading
}

/** 短码 -> 文章路径；查不到返回 null */
export async function resolveShortLink(code: string): Promise<string | null> {
  if (!code) return null
  const map = await loadShortLinks()
  const key = code.replace(/\/+$/, '').toLowerCase()
  return map[key] || null
}

/** 文章路径 -> 短码（反查，用于页面内展示/复制短链） */
export async function shortLinkOf(pathname: string): Promise<string | null> {
  const map = await loadShortLinks()
  const hit = Object.keys(map).find(code => map[code] === pathname)
  return hit || null
}

/**
 * 判断当前路径是不是短链；是则返回短码。
 * 兼容 `/#/s/xxx`（hash 路由场景，本项目未启用但历史链接可能残留）。
 */
export function matchShortLink(path: string, hash = ''): string | null {
  const withoutQuery = path.split('?')[0] || ''
  const clean = decodeURI(withoutQuery)
  const m = clean.match(/^\/s\/([0-9a-z]{4,16})\/?$/i)
  if (m && m[1]) return m[1]
  const hm = hash.match(/^#\/s\/([0-9a-z]{4,16})\/?$/i)
  return hm && hm[1] ? hm[1] : null
}
