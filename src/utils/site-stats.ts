import { reactive } from 'vue'
import { SITE_STATS_CONFIG } from '@/constants'

export interface BusuanziPayload {
  site_pv?: number
  page_pv?: number
  site_uv?: number
}

// 不蒜子统计数据（全局共享，页脚 / 侧栏等位置复用同一份数据）
export const siteStats = reactive({
  sitePV: 0,
  pagePV: 0,
  siteUV: 0,
  loaded: false,
  failed: false
})

let request: Promise<void> | null = null

/**
 * 加载不蒜子统计（JSONP）
 * 全局只发起一次请求，数据写入 siteStats，
 * 同时按参考实现挂载到 window.site_pv / window.page_pv / window.site_uv
 */
export function loadBusuanzi(): Promise<void> {
  if (request) return request

  request = new Promise<void>((resolve) => {
    // 创建唯一回调函数名
    const callbackName = 'BusuanziCallback_' +
      Math.floor(1099511627776 * Math.random())

    // 创建 script 标签
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.referrerPolicy = 'no-referrer-when-downgrade'

    const cleanup = () => {
      if (timer) window.clearTimeout(timer)
      const globalWindow = window as unknown as Window & Record<string, unknown>
      delete globalWindow[callbackName]
      script.remove()
    }

    const finish = (failed: boolean) => {
      cleanup()
      siteStats.failed = failed
      siteStats.loaded = true
      resolve()
    }

    // 定义全局回调函数
    const globalWindow = window as unknown as Window & Record<string, unknown>
    globalWindow[callbackName] = function (data: BusuanziPayload = {}) {
      siteStats.sitePV = Number(data.site_pv) || 0
      siteStats.pagePV = Number(data.page_pv) || 0
      siteStats.siteUV = Number(data.site_uv) || 0

      // 挂载数据到 window，方便其他脚本直接读取
      window.site_pv = siteStats.sitePV
      window.page_pv = siteStats.pagePV
      window.site_uv = siteStats.siteUV

      // 通知数据已加载
      window.dispatchEvent(new Event('busuanziLoaded'))

      finish(false)
    }

    // 错误处理：脚本加载失败时不阻塞页面
    script.onerror = () => finish(true)

    // 超时兜底，避免离线或接口不可用时一直处于加载态
    const timer = window.setTimeout(() => finish(true), SITE_STATS_CONFIG.timeout)

    // 设置请求 URL（使用 JSONP 回调）
    script.src = `${SITE_STATS_CONFIG.busuanziEndpoint}?jsonpCallback=${callbackName}`

    // 插入到页面
    document.head.appendChild(script)
  })

  return request
}
