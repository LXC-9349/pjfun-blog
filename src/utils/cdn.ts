/**
 * 按需加载 CDN 库
 *
 * 现状：PDF / Word / 代码高亮等重型库已改为本地打包的异步 chunk（见 vite.config.ts 的 HEAVY_PKGS），
 * 由路由与异步组件触发加载，因此 window.PJ_LAZY_LIBS 通常为空。
 *
 * 该工具与 build_cdn.ts 的 lazy 配置保留：后续若某个大库改回 CDN 外置，
 * 只要在 build_cdn.ts 标记 lazy 并在业务侧调用 ensureCdnLib，即可复用多源回退的加载逻辑
 * （window.pjLoadResource，见 public/pj_public.js）。
 */

type LazyLibMap = Record<string, string>

const pending = new Map<string, Promise<void>>()

function getLazyLibMap(): LazyLibMap | undefined {
    return (window as unknown as { PJ_LAZY_LIBS?: LazyLibMap }).PJ_LAZY_LIBS
}

/**
 * 确保指定库已可用
 * @param name 库名，与 build_cdn.ts 中的 libraries key 一致
 */
export function ensureCdnLib(name: string): Promise<void> {
    const urls = getLazyLibMap()?.[name]?.trim()
    // 没有登记为 CDN 按需库时直接返回，由调用方走本地动态导入
    if (!urls) return Promise.resolve()

    const cached = pending.get(name)
    if (cached) return cached

    const loader = (window as unknown as {
        pjLoadResource?: (urls: string, type?: string) => Promise<void>
    }).pjLoadResource

    if (!loader) {
        return Promise.reject(new Error(`资源加载器不可用，无法加载 ${name}`))
    }

    const task = loader(urls, 'js').catch(error => {
        // 失败后允许后续重试
        pending.delete(name)
        throw error
    })

    pending.set(name, task)
    return task
}
