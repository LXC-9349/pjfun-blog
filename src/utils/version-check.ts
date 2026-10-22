import { STORAGE_KEYS, VERSION_CHECK } from '@/constants'

interface VersionData {
    v: string | number
}

let timer: number | null = null
let onNewVersion: (() => void) | null = null
let onUpToDate: (() => void) | null = null
let latestVersion: string | null = null
// “稍后提醒”的静默状态（仅当前页面会话有效）
let snoozedVersion: string | null = null
let snoozeUntil = 0

/**
 * 规范化版本号：只接受非空字符串或数字
 */
function normalizeVersion(value: unknown): string | null {
    if (typeof value !== 'string' && typeof value !== 'number') return null
    const version = String(value).trim()
    return version.length > 0 ? version : null
}

/**
 * 拉取服务端版本号（带时间戳绕过缓存，且校验响应结构）
 */
async function fetchServerVersion(): Promise<string | null> {
    const base = import.meta.env.BASE_URL || '/'
    const res = await fetch(`${base}version.json?_=${Date.now()}`, {
        cache: 'no-store'
    })
    if (!res.ok) return null
    const data = (await res.json()) as VersionData | null
    return normalizeVersion(data?.v)
}

async function check(): Promise<void> {
    try {
        const newV = await fetchServerVersion()
        // 响应异常时直接忽略，避免误报“发现新版本”
        if (!newV) return
        latestVersion = newV

        const oldV = localStorage.getItem(STORAGE_KEYS.webVersion)
        // 当前页面已是最新构建：同步基线并通知隐藏提示（多标签页同步）
        const pageVersion = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : ''
        if (pageVersion && pageVersion === newV) {
            if (oldV !== newV) {
                localStorage.setItem(STORAGE_KEYS.webVersion, newV)
            }
            onUpToDate?.()
            return
        }

        // 首次访问：写入基线，不打扰用户
        if (!oldV) {
            localStorage.setItem(STORAGE_KEYS.webVersion, newV)
            return
        }

        if (oldV === newV) {
            onUpToDate?.()
            return
        }

        // 同一版本已选择“稍后提醒”，静默期内不再打扰
        if (snoozedVersion === newV && Date.now() < snoozeUntil) return

        onNewVersion?.()
    } catch {
        // 网络或数据异常不打扰用户
    }
}

/**
 * 启动版本更新检查
 * @param callbacks - onNewVersion: 发现新版本；onUpToDate: 当前已是最新/已更新
 * @param interval - 轮询间隔（毫秒）
 */
export function startVersionCheck(
    callbacks: { onNewVersion: () => void; onUpToDate?: () => void },
    interval: number = VERSION_CHECK.interval
): void {
    if (!import.meta.env.PROD) return

    // 防止重复调用叠加定时器
    if (timer) {
        clearInterval(timer)
        timer = null
    }

    onNewVersion = callbacks.onNewVersion
    onUpToDate = callbacks.onUpToDate ?? null

    // 首次立即检查
    void check()

    timer = setInterval(() => {
        void check()
    }, interval)
}

/**
 * 稍后提醒：静默期内不再提示同一新版本
 */
export function snoozeVersionCheck(minutes: number = VERSION_CHECK.snoozeMinutes): void {
    if (!latestVersion) return
    snoozedVersion = latestVersion
    snoozeUntil = Date.now() + minutes * 60_000
}

/**
 * 立即更新：带时间戳强制绕过 HTML 缓存后重新加载
 * 该时间戳参数会在 main.ts 启动时被清理，不影响路由与评论 term
 */
export function refreshNow(): void {
    if (timer) {
        clearInterval(timer)
        timer = null
    }
    onNewVersion = null
    onUpToDate = null

    const url = new URL(window.location.href)
    url.searchParams.set('_v', latestVersion || String(Date.now()))

    // 先注销旧 Service Worker，避免刷新后仍由它返回缓存的旧页面
    const serviceWorker = navigator.serviceWorker
    if (serviceWorker) {
        serviceWorker
            .getRegistrations()
            .then(registrations => Promise.all(registrations.map(item => item.unregister())))
            .catch(() => undefined)
            .finally(() => window.location.replace(url.toString()))
        return
    }

    window.location.replace(url.toString())
}
