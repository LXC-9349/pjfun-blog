<template>
  <!-- 卡片内换行布局（PC 右侧栏） -->
  <div
      v-if="layout === 'wrap'"
      class="flex flex-wrap gap-1.5"
  >
    <button
        v-for="tag in tags"
        :key="tag"
        @click="emit('select', tag)"
        :class="chipClass(tag)"
    >
      {{ tag }}
    </button>
    <slot />
  </div>

  <!-- 单行横向滑动（列表顶部） -->
  <div
      v-else
      ref="scrollEl"
      class="tag-scroll flex items-center gap-1.5 overflow-x-auto whitespace-nowrap min-w-0 flex-1 overscroll-contain"
      data-lenis-prevent
      @wheel="onWheel"
  >
    <button
        v-for="tag in tags"
        :key="tag"
        @click="emit('select', tag)"
        :class="chipClass(tag)"
    >
      {{ tag }}
    </button>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  tags: string[]
  selected?: string
  layout?: 'row' | 'wrap'
}>(), {
  selected: '',
  layout: 'row'
})

const emit = defineEmits<{ (e: 'select', tag: string): void }>()

const scrollEl = ref<HTMLElement | null>(null)

const chipClass = (tag: string) => [
  'flex-shrink-0 px-2.5 py-1 rounded-full text-xs border transition-colors cursor-pointer',
  props.selected === tag
    ? 'bg-orange-600 border-orange-600 text-white shadow-sm'
    : 'bg-white/70 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-orange-300 hover:text-orange-600 dark:hover:text-orange-400'
]

// 行布局时把纵向滚轮转为横向滚动（仅溢出时接管）
const onWheel = (event: WheelEvent) => {
  const el = scrollEl.value
  if (!el || el.scrollWidth <= el.clientWidth) return
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
  // deltaMode: 0=像素 1=行 2=页；Firefox 鼠标滚轮通常为行模式
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? el.clientWidth : 1
  el.scrollLeft += event.deltaY * unit
  event.preventDefault()
}
</script>
