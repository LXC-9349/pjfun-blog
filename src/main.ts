import { createApp } from 'vue'
import Lenis from 'lenis'
import { MotionPlugin } from '@vueuse/motion'
import '@unocss/reset/tailwind-compat.css'
import 'uno.css'
import 'lenis/dist/lenis.css'
import App from "./App.vue";
import { getLanguage, setLanguage } from '@/utils/i18n'
import { setupSEO } from '@/plugins/seo'
import { SITE_CONFIG } from '@/constants'

// 初始化平滑滚动
const lenis = new Lenis({ 
  duration: 1.2, 
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
  syncTouch: false
})

function raf(t: number) { 
  lenis.raf(t)
  requestAnimationFrame(raf) 
}
requestAnimationFrame(raf)

// 更好的主题管理
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme')
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  let theme = 'light'
  if (savedTheme) {
    theme = savedTheme
  } else if (systemPrefersDark) {
    theme = 'dark'
  }
  
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.classList.toggle('dark', theme === 'dark')
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

initializeTheme()
initializeLanguage()
initializeSEO()

async function mountApp() {
    const { createRouter, createWebHistory } = await import('vue-router')
    const pages = (await import('virtual:generated-pages')).default
    const { articleRoutes } = await import('virtual:article-routes')

    const router = createRouter({
        history: createWebHistory(),
        routes: [
            ...pages,
            ...articleRoutes,
            { path: '/:pathMatch(.*)*', redirect: '/' }
        ],
    })

    // 添加路由守卫以处理SEO
    router.beforeEach((to, _from, next) => {
      // 动态设置页面标题
      if (to.meta.title) {
        document.title = `${to.meta.title} - ${SITE_CONFIG.title}`
      } else {
        document.title = SITE_CONFIG.title
      }
      next()
    })

    createApp(App).use(router).use(MotionPlugin).mount('#app')
}

mountApp()