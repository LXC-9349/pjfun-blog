<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import hljs from 'highlight.js'
import { renderMarkdown } from '@/utils/markdown'

const props = defineProps<{ content: string }>()

const root = ref<HTMLElement | null>(null)
const html = ref('')
const theme = ref('light')
let timer: ReturnType<typeof setTimeout> | null = null

function highlight() {
  root.value?.querySelectorAll<HTMLElement>('pre code').forEach(block => {
    const langClass = Array.from(block.classList).find(cls => cls.startsWith('language-'))
    const language = langClass ? langClass.replace('language-', '') : ''
    // 未注册的语言交给默认样式，避免 hljs 输出降级警告
    if (!language || !hljs.getLanguage(language)) return
    try {
      block.innerHTML = hljs.highlight(block.textContent || '', { language }).value
      block.classList.add('hljs')
    } catch {
      // 单个代码块高亮失败不影响预览
    }
  })
}

async function render() {
  html.value = renderMarkdown(props.content)
  await nextTick()
  highlight()
}

watch(
  () => props.content,
  () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => void render(), 120)
  }
)

onMounted(() => {
  theme.value = document.documentElement.getAttribute('data-theme') || 'light'
  void render()
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <div class="toc-scrollbar h-full overflow-y-auto" data-lenis-prevent>
    <div v-if="content.trim()" ref="root" class="markdown-body px-5 py-4" :data-theme="theme" v-html="html" />
    <div v-else class="flex h-full items-center justify-center text-xs text-gray-400">预览区（正文为空）</div>
  </div>
</template>

<style scoped>
:deep(.markdown-body) {
  background: transparent;
}
</style>
