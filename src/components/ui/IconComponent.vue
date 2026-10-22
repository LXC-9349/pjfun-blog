<template>
  <div class="inline-flex items-center justify-center shrink-0">
    <svg
      v-if="name"
      v-bind="$attrs"
      :width="size"
      :height="size"
      :role="title ? 'img' : undefined"
      :aria-hidden="title || $attrs['aria-label'] ? undefined : 'true'"
      class="inline-block align-middle"
    >
      <title v-if="title">{{ title }}</title>
      <use :xlink:href="iconSymbolId" :fill="color" />
    </svg>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'

// class / style 等属性直接作用于 svg，保持与 unplugin-icons 图标组件一致的尺寸行为
defineOptions({ inheritAttrs: false })

interface Props {
  name: string
  size?: string | number
  color?: string
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: '24',
  color: 'currentColor',
  title: ''
})

// 计算图标名称（用于 SVG symbol ID）
const iconSymbolId = computed(() => `#icon-${props.name}`)
</script>
