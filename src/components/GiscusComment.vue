<template>
  <div class="giscus-wrapper">
    <div ref="commentsContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  repo: string
  repoId: string
  category: string
  categoryId: string
  mapping?: 'pathname' | 'url' | 'title' | 'og:title' | 'number' | 'specific' | string
  strict?: boolean
  reactionsEnabled?: boolean
  emitMetadata?: boolean
  inputPosition?: 'top' | 'bottom'| string
  theme?: string
  lang?: string
  loading?: 'lazy' | 'eager'
  term?: string
}>()

const commentsContainer = ref<HTMLElement | null>(null)

const initGiscus = () => {
  if (!commentsContainer.value || !props.repo || !props.repoId || !props.category || !props.categoryId) return

  // 清空容器
  commentsContainer.value.innerHTML = ''

  // 创建 script 标签
  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.async = true
  script.crossOrigin = 'anonymous'
  script.setAttribute('data-repo', props.repo)
  script.setAttribute('data-repo-id', props.repoId)
  script.setAttribute('data-category', props.category)
  script.setAttribute('data-category-id', props.categoryId)
  script.setAttribute('data-mapping', props.mapping || 'pathname')
  
  // 如果提供了 term，则设置 term 属性
  if (props.term) {
    script.setAttribute('data-term', props.term)
  }
  
  script.setAttribute('data-strict', String(props.strict !== false))
  script.setAttribute('data-reactions-enabled', String(props.reactionsEnabled !== false))
  script.setAttribute('data-emit-metadata', String(props.emitMetadata === true))
  script.setAttribute('data-input-position', props.inputPosition || 'top')
  script.setAttribute('data-theme', props.theme || 'preferred_color_scheme')
  script.setAttribute('data-lang', props.lang || 'zh-CN')
  script.setAttribute('data-loading', props.loading || 'lazy')

  commentsContainer.value.appendChild(script)
}

// 监听主题变化
const handleThemeChange = (event: CustomEvent) => {
  const theme = event.detail.theme
  const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
  if (iframe?.contentWindow) {
    iframe.contentWindow.postMessage(
      { giscus: { setConfig: { theme: theme === 'dark' ? 'dark' : 'light' } } },
      'https://giscus.app'
    )
  }
}

// 监听属性变化，重新初始化
watch(() => [props.repo, props.repoId, props.category, props.categoryId, props.term], () => {
  initGiscus()
})

onMounted(() => {
  // 初始化评论系统
  initGiscus()
  
  // 监听主题变化
  window.addEventListener('theme-change', handleThemeChange as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('theme-change', handleThemeChange as EventListener)
})
</script>

<style scoped>
.giscus-wrapper {
  margin-top: 2rem;
}
</style>