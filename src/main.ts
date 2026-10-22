import { createApp } from 'vue'
import Lenis from 'lenis'
import { MotionPlugin } from '@vueuse/motion'
import '@unocss/reset/tailwind-compat.css'
import 'uno.css'
import 'lenis/dist/lenis.css'
import '@/styles/global.css'
import App from "./App.vue";
import { getLanguage, setLanguage } from '@/utils/i18n'
import { setupSEO } from '@/plugins/seo'
import { SITE_CONFIG, STORAGE_KEYS } from '@/constants'
import { getEnvVariable } from '@/utils/tool'
import { initAppearance } from '@/utils/appearance'
import { initAutoHideScrollbar } from '@/utils/auto-hide-scrollbar'
// 引入 SVG 图标
import 'virtual:svg-icons-register'
import {passwordApi} from "@/utils/password";

// 初始化平滑滚动
// autoRaf 已由 Lenis 内部接管动画帧，无需再手写 requestAnimationFrame 循环（否则每帧会被驱动两次）
export const lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    syncTouch: false,
    autoRaf: true,
    gestureOrientation: 'vertical',
    lerp: 0.1
})

// 更好的主题管理
function initializeTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme)
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    let theme = 'light'
    if (savedTheme) {
        theme = savedTheme
    } else if (systemPrefersDark) {
        theme = 'dark'
    }

    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(STORAGE_KEYS.theme, theme) // 确保主题设置被存储

    // 触发自定义事件，通知其他组件主题已更改
    window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme } }))

    // 更新所有 markdown-body 元素的 data-theme 属性
    document.querySelectorAll('.markdown-body').forEach(el => {
        el.setAttribute('data-theme', theme);
    });
}

// 监听系统主题变化
const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    const isDark = e.matches
    const theme = isDark ? 'dark' : 'light'

    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEYS.theme, theme)

    // 触发自定义事件，通知其他组件主题已更改
    window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme } }))

    // 更新所有 markdown-body 元素的 data-theme 属性
    document.querySelectorAll('.markdown-body').forEach(el => {
        el.setAttribute('data-theme', theme);
    });
}

// 初始化语言
function initializeLanguage() {
    const lang = getLanguage()
    setLanguage(lang)
}

// 初始化SEO
function initializeSEO() {
    setupSEO()
    // 设置初始页面标题
    document.title = SITE_CONFIG.title
}

// 清理版本检查用于绕过 HTML 缓存的临时查询参数（见 utils/version-check.ts）
function cleanupVersionQuery() {
    const url = new URL(window.location.href)
    if (!url.searchParams.has('_v')) return
    url.searchParams.delete('_v')
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
}

cleanupVersionQuery()
initializeTheme()
// 应用已保存的外观设置（主题色与字体）
initAppearance()
// 卡片滚动条：滚动时显示，静止后自动隐藏
initAutoHideScrollbar()
initializeLanguage()
initializeSEO()

// 监听系统主题变化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSystemThemeChange)

// 检查是否需要密码保护
function isPasswordProtected(): boolean {
    return !!getEnvVariable('VITE_BLOG_PASSWORD_HASH')
}

// 检查用户是否已通过身份验证
function isAuthenticated(): boolean {
    const pwd = localStorage.getItem(STORAGE_KEYS.accessPassword)||'';
    const result = passwordApi.verifyPassword(pwd)
    if(result.success){
        return true
    }
    return false
}

async function mountApp() {
    // 三个依赖并行加载，避免串行等待拉长启动时间
    const [{ createRouter, createWebHistory }, pagesModule, { articleRoutes }] = await Promise.all([
        import('vue-router'),
        import('virtual:generated-pages'),
        import('virtual:article-routes')
    ])
    const pages = pagesModule.default
    const routes = [
        ...pages,
        ...articleRoutes
    ]

    // 本地创作台：仅开发环境注册；生产环境访问 /studio 时回到首页
    if (import.meta.env.DEV) {
        routes.push({
            path: '/studio',
            component: () => import('@/studio/StudioPage.vue')
        })
    } else {
        routes.push({ path: '/studio', redirect: '/' })
    }

    // 文章 catch-all 路由已覆盖未知路径，由文章页展示 Not Found，无需额外的首页重定向

    // 如果启用了密码保护，添加密码保护页面
    if (isPasswordProtected()) {
        const passwordRoute = {
            path: '/password',
            component: () => import('@/components/PasswordProtection.vue')
        }
        routes.push(passwordRoute)
    }

    // 获取 Vite 配置的基础路径
    const base = import.meta.env.BASE_URL || '/';

    const router = createRouter({
        history: createWebHistory(base),
        routes
    })

    // 添加路由守卫以处理SEO和密码保护
    router.beforeEach((to, _from, next) => {
        // 动态设置页面标题和SEO
        if (to.meta.title) {
            document.title = `${to.meta.title} - ${SITE_CONFIG.title}`
            // 更新SEO标签
            setupSEO({
                title: `${to.meta.title} - ${SITE_CONFIG.title}`,
                description: typeof to.meta.description === 'string' ? to.meta.description : SITE_CONFIG.description,
                path: to.path
            })
        } else {
            document.title = SITE_CONFIG.title
            // 设置默认SEO标签
            setupSEO()
        }

        // 检查是否需要密码保护
        if (isPasswordProtected() && !isAuthenticated() && to.path !== '/password') {
            // 保存用户尝试访问的路径
            sessionStorage.setItem(STORAGE_KEYS.redirectAfterLogin, to.fullPath)
            // 重定向到密码保护页面
            next('/password')
        } else {
            next()
        }
    })

    // GitHub Pages SPA 路由支持
    // 检查是否有保存的重定向 URL
    const redirectUrl = sessionStorage.getItem(STORAGE_KEYS.redirectUrl);
    if (redirectUrl) {
        sessionStorage.removeItem(STORAGE_KEYS.redirectUrl);
        // 如果有保存的 URL，则导航到该路径
        router.push(redirectUrl).catch(err => {
            console.warn('路由重定向失败:', err);
        });
    }

    createApp(App).use(router).use(MotionPlugin).mount('#app')
}

mountApp()
// 将 passwordApi 暴露到全局，供各页面调用登出等功能
Object.defineProperty(window, 'pjfun', {
  value: Object.freeze({
    ...((window as any).pjfun || {}),
    loaded: true,
    passwordApi: passwordApi
  }),
  writable: false
});
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error:', { message, source, lineno, colno, error });
};