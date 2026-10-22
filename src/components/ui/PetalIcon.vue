<template>
  <img
    class="petal-icon"
    :src="PETAL_ICON_URLS[type]"
    :width="size"
    :height="size"
    alt=""
    draggable="false"
    aria-hidden="true"
  >
</template>

<script setup lang="ts">
import { PETAL_ICON_URLS } from '@/assets/petals'
import type { ScreensaverPetalType } from '@/constants'

withDefaults(defineProps<{
  type: ScreensaverPetalType
  size?: number
}>(), {
  size: 18
})
</script>

<style scoped>
.petal-icon {
  display: block;
  flex-shrink: 0;
  object-fit: contain;
}
</style>
