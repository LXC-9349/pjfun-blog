<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { SITE_CONFIG } from '@/constants'
import { t } from '@/utils/i18n'

const route = useRoute()
const html = ref('<div class="text-center py-32">加载中...</div>')
const title = ref('加载中...')
const loading = ref(true)
const cover = ref('')
const readingTime = ref('')

// 新增：控制回到顶部按钮显示的ref
const showBackToTop = ref(false)

const articleMeta = ref({
  title: '',
  date: '',
  tags: [] as string[],
  excerpt: '',
  cover: ''
})

// ==================== 阅读进度条 ====================
const progress = ref(0)
const updateProgress = () => {
  const winScroll = document.documentElement.scrollTop || document.body.scrollTop
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
  progress.value = height > 0 ? (winScroll / height) * 100 : 0
  
  // 新增：判断是否显示回到顶部按钮（当滚动超过500px时显示）
  showBackToTop.value = winScroll > 500
}
onMounted(() => {
  window.addEventListener('scroll', updateProgress)
})
watch(() => route.path, () => nextTick(updateProgress))

// ==================== 目录生成 ====================
const headings = ref<Array<{ text: string; level: number; id: string }>>([])
const generateTOC = () => {
  const elements = document.querySelectorAll('h1, h2, h3')
  headings.value = Array.from(elements)
      .filter(el => el.textContent && el.id)
      .map(el => ({
        text: el.textContent!,
        level: parseInt(el.tagName.charAt(1)),
        id: el.id
      }))
}

// ==================== 返回顶部 ====================
const backToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ==================== 复制代码 ====================
const copyCode = (e: MouseEvent) => {
  const btn = e.target as HTMLElement
  // 修复：更准确地选择包含代码的元素
  const codeElement = btn.closest('.code-wrapper')?.querySelector('code')
  const code = codeElement?.textContent
  if (!code) return
  
  navigator.clipboard.writeText(code).then(() => {
    // 成功复制后的反馈
    const original = btn.innerHTML
    btn.innerHTML = 'Copied!'
    btn.classList.add('text-green-600')
    setTimeout(() => {
      btn.innerHTML = original
      btn.classList.remove('text-green-600')
    }, 2000)
  }).catch(err => {
    console.error('复制失败:', err)
  })
}

// ==================== 下载代码 ====================
const downloadCode = (e: MouseEvent) => {
  const btn = e.target as HTMLElement
  const codeWrapper = btn.closest('.code-wrapper')
  const codeElement = codeWrapper?.querySelector('code')
  const code = codeElement?.textContent
  if (!code) return

  // 获取语言类型用于文件扩展名
  const langClass = codeElement?.className.split(' ').find(cls => cls.startsWith('language-'))
  const lang = langClass ? langClass.replace('language-', '') : 'txt'
  
  // 创建下载
  const blob = new Blob([code], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `code.${lang}`
  document.body.appendChild(a)
  a.click()
  
  // 清理
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}

// ==================== SEO 更新 ====================
const updateSEO = () => {
  document.title = `${articleMeta.value.title} - ${SITE_CONFIG.title}`

  const desc = articleMeta.value.excerpt || SITE_CONFIG.description
  const updateMeta = (name: string, content: string, attr = 'name') => {
    let el = document.querySelector(`meta[${attr}="${name}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, name)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  updateMeta('description', desc)
  updateMeta('og:title', articleMeta.value.title, 'property')
  updateMeta('og:description', desc, 'property')
  updateMeta('og:image', articleMeta.value.cover || `${location.origin}/og-image.jpg`, 'property')
  updateMeta('twitter:card', 'summary_large_image', 'name')
}

// ==================== 加载文章 ====================
const loadArticle = async (mdPath: string) => {
  if (!mdPath) {
    html.value = '<h1 class="text-center py-32">404 - 文章不存在</h1>'
    title.value = '404'
    loading.value = false
    return
  }

  try {
    loading.value = true
    const res = await fetch(mdPath.startsWith('/') ? mdPath : `/${mdPath}`)
    if (!res.ok) throw new Error('Not Found')
    const text = await res.text()

    // 解析 frontmatter
    const fmMatch = text.match(/^---\n([\s\S]*?)\n---\n/)
    if (fmMatch) {
      const fm = fmMatch[1]
      if (fm) {
        articleMeta.value.title = fm.match(/title:\s*["']?([^"'\n]+)["']?/)?.[1] || '无标题'
        articleMeta.value.date = fm.match(/date:\s*["']?([^"'\n]+)["']?/)?.[1] || ''
        articleMeta.value.cover = fm.match(/cover:\s*["']?([^"'\n]+)["']?/)?.[1] || ''
        const tagsStr = fm.match(/tags:\s*\[([^\]]+)\]/)?.[1]
        articleMeta.value.tags = tagsStr ? tagsStr.split(',').map(t => t.trim().replace(/["']/g, '')) : []
        articleMeta.value.excerpt = fm.match(/desc:\s*["']?([^"'\n]+)["']?/)?.[1] ||
            fm.match(/excerpt:\s*["']?([^"'\n]+)["']?/)?.[1] || ''
      }

      // 计算阅读时长
      const content = text.replace(/^---\n[\s\S]*?\n---\n/, '')
      const words = content.trim().split(/\s+/).length
      readingTime.value = Math.ceil(words / 200) + ' 分钟阅读'
    }

    // Markdown 渲染
    const MarkdownIt = (await import('markdown-it')).default
    const md = new MarkdownIt({
      html: true,
      typographer: true,
      linkify: true
    })

    // 高亮 + 复制按钮
    const hljs = (await import('highlight.js')).default
    await import('highlight.js/styles/github-dark.css')

    md.set({
      highlight: (str: string, lang: string) => {
        let highlighted = ''
        if (lang && hljs.getLanguage(lang)) {
          try {
            highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
          } catch (e) {
            console.warn('语法高亮失败:', e)
            highlighted = md.utils.escapeHtml(str)
          }
        } else {
          highlighted = md.utils.escapeHtml(str)
        }

        // 改进：为hljs提供语言类，并添加下载功能
        return `
          <div class="relative group">
            <div class="code-wrapper">
              <div class="flex gap-2 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="window.copyCode(event)" class="copy-btn px-3 py-1.5 bg-gray-700 text-white text-xs rounded hover:bg-gray-600 transition flex items-center gap-1">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12l-5.3 5.3-1.4-1.4 4-4-4-4 1.4-1.4 5.3 5.3zm-12 0l-5.3 5.3-1.4-1.4 4-4-4-4 1.4-1.4 5.3 5.3zm-12 0l-5.3 5.3-1.4-1.4 4-4-4-4 1.4-1.4 5.3 5.3z"/></svg>
                  Copy
                </button>
                <button onclick="window.downloadCode(event)" class="download-btn px-3 py-1.5 bg-gray-700 text-white text-xs rounded hover:bg-gray-600 transition flex items-center gap-1">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                  </svg>
                  Download
                </button>
              </div>
              <pre class="hljs rounded-xl overflow-x-auto p-5"><code class="language-${lang || 'plaintext'}">${highlighted}</code></pre>
            </div>
          </div>`
      }
    })

    let rendered = md.render(text.replace(/^---\n[\s\S]*?\n---\n/, ''))

    // 图片优化 + 灯箱
    rendered = rendered.replace(
        /<img src="([^"]+)"/g,
        '<img src="$1" class="rounded-lg my-8 cursor-zoom-in max-w-full h-auto mx-auto block" onclick="window.open(this.src)" loading="lazy"'
    )

    html.value = rendered
    title.value = articleMeta.value.title
    cover.value = articleMeta.value.cover

    updateSEO()
    await nextTick()
    generateTOC()
  } catch (err) {
    console.error(err)
    html.value = `<div class="text-center py-32"><h1 class="text-4xl font-bold mb-4">404</h1><p class="text-gray-500">文章走丢了~</p></div>`
  } finally {
    loading.value = false
  }
}

// 路由监听
watch(() => route.path, (path) => {
  if (path && path !== '/') {
    loadArticle(`/content${path}.md`)
    window.scrollTo(0, 0)
  }
}, { immediate: true })

// 复制函数注入
onMounted(() => {
  // @ts-ignore
  window.copyCode = copyCode
  // @ts-ignore
  window.downloadCode = downloadCode
})
</script>

<template>
  <!-- 阅读进度条 -->
  <div class="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 z-50">
    <div class="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300" :style="{ width: progress + '%' }"></div>
  </div>

  <!-- 回到顶部按钮 -->
  <transition name="fade">
    <button 
      v-if="showBackToTop"
      @click="backToTop"
      class="fixed bottom-8 right-8 z-40 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
    >
      <svg class="w-6 h-6 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
    </button>
  </transition>

  <article class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <!-- 封面图 + 标题 -->
    <div v-if="cover" class="relative h-96 md:h-[500px] overflow-hidden">
      <img :src="cover" class="w-full h-full object-cover" alt="封面">
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
      <div class="absolute top-4 left-4 z-30">
        <router-link 
          to="/"
          class="flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          {{ t('home') }}
        </router-link>
      </div>
      <div class="absolute bottom-0 left-0 right-0 p-8 md:p-16 text-white">
        <h1 class="text-4xl md:text-5xl font-bold leading-tight max-w-5xl">{{ articleMeta.title }}</h1>
        <div class="flex flex-wrap items-center gap-6 mt-6 text-lg opacity-90">
          <time v-if="articleMeta.date" class="flex items-center">
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
            {{ articleMeta.date }}
          </time>
          <span v-if="readingTime" class="flex items-center">
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
            {{ readingTime }}
          </span>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-col lg:flex-row gap-10">
        <!-- 目录（PC） -->
        <div v-if="headings.length > 3" class="hidden lg:block sticky top-24 h-[calc(100vh-6rem)] flex-shrink-0">
          <aside class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 h-full overflow-y-auto">
            <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
              {{ t('articleDirectory') }}
            </h3>
            <ul class="space-y-2 text-sm">
              <li v-for="h in headings" :key="h.id" :class="{ 'ml-4': h.level === 3, 'ml-2': h.level === 2 }">
                <a 
                  :href="`#${h.id}`" 
                  class="block py-1 hover:text-blue-600 dark:hover:text-blue-400 transition truncate"
                  :title="h.text"
                  v-text="h.text"
                ></a>
              </li>
            </ul>
          </aside>
        </div>

        <!-- 文章主体 -->
        <div class="flex-1">
          <!-- 无封面时的标题 -->
          <header v-if="!cover" class="text-center mb-12">
            <div class="flex justify-center mb-6">
              <router-link 
                to="/"
                class="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition self-start"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                {{ t('home') }}
              </router-link>
            </div>
            <h1 class="text-4xl md:text-5xl font-bold mb-6">{{ articleMeta.title }}</h1>
            <div class="flex flex-wrap justify-center gap-6 text-gray-600 dark:text-gray-400">
              <time v-if="articleMeta.date" class="flex items-center">
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
                {{ articleMeta.date }}
              </time>
              <span v-if="readingTime" class="flex items-center">
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
                {{ readingTime }}
              </span>
            </div>
            <div v-if="articleMeta.tags.length" class="flex flex-wrap justify-center gap-2 mt-6">
              <span v-for="tag in articleMeta.tags" :key="tag"
                  class="px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                {{ tag }}
              </span>
            </div>
          </header>

          <!-- 内容 -->
          <div v-if="loading" class="space-y-8">
            <div v-for="i in 8" :key="i" class="bg-white dark:bg-gray-800 rounded-2xl p-8 animate-pulse">
              <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div class="space-y-3">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>

          <div v-else class="prose prose-lg dark:prose-invert max-w-none">
            <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 prose-headings:scroll-mt-24"
                v-html="html"></div>
          </div>

          <!-- 底部操作栏 -->
          <footer class="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <router-link to="/" class="flex items-center gap-2 text-blue-600 hover:underline">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              {{ t('home') }}
            </router-link>

            <button @click="backToTop" class="flex items-center gap-2 px-5 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
              {{ t('backToTop') }}
            </button>
          </footer>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.copy-btn, .download-btn {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>