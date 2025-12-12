let timer: number | null = null
let onNewVersion: (() => void) | null = null
const key_name: string = 'pj_blog_web_version'
let latestVersion: string | null = null

interface VersionData {
    v: string
}

async function check(): Promise<void> {
    try {
        const fiveMinuteTimestamp = Math.floor(Date.now() / (5 * 60 * 1000))
        const res = await fetch(`/version.json?_=${fiveMinuteTimestamp}`, {
            cache: 'no-cache'
        })
        const data: VersionData = await res.json()
        const newV: string = data.v
        latestVersion = newV
        const oldV: string | null = localStorage.getItem(key_name)
        if (oldV && oldV+'' !== newV+'') {
            // if (timer) clearInterval(timer)
            onNewVersion?.()
        } else {
            localStorage.setItem(key_name, newV)
        }
    } catch (e) {
        // 网络错误不打扰用户
    }
}

export function startVersionCheck(callback: () => void, interval: number = 60_000): void {
    if (!import.meta.env.PROD) return

    onNewVersion = callback

    // 首次立即检查
    check()

    timer = setInterval(check, interval)
}

export async function refreshNow(): Promise<void> {
    if (latestVersion) {
        localStorage.setItem(key_name, latestVersion)
    }
    // 清除定时器
    if (timer) {
        clearInterval(timer)
        timer = null
    }
    // 重置回调函数
    onNewVersion = null
    // 刷新页面
    window.location.reload()
}
