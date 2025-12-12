<template>
  <div class="inline-flex items-center justify-center">
    <svg
      v-if="name"
      :width="size"
      :height="size"
      :aria-label="title || name"
      class="inline-block align-middle"
    >
      <use :xlink:href="iconSymbolId" :fill="color" />
    </svg>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'

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