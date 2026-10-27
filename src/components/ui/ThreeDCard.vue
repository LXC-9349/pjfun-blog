<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  class?: string
}

const props = defineProps<Props>()

const cardRef = ref<HTMLElement | null>(null)
const rotateX = ref(0)
const rotateY = ref(0)
const translateZ = ref(0)

const handleMouseMove = (e: MouseEvent) => {
  if (!cardRef.value) return
  
  const rect = cardRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  // 计算相对于卡片中心的位置
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  
  // 计算旋转角度 (-15 到 15 度)
  const rotateXValue = ((y - centerY) / centerY) * 15
  const rotateYValue = ((centerX - x) / centerX) * 15
  
  rotateX.value = rotateXValue
  rotateY.value = rotateYValue
  translateZ.value = 20
}

const handleMouseLeave = () => {
  rotateX.value = 0
  rotateY.value = 0
  translateZ.value = 0
}

onMounted(() => {
  if (cardRef.value) {
    cardRef.value.addEventListener('mousemove', handleMouseMove)
    cardRef.value.addEventListener('mouseleave', handleMouseLeave)
  }
})

onUnmounted(() => {
  if (cardRef.value) {
    cardRef.value.removeEventListener('mousemove', handleMouseMove)
    cardRef.value.removeEventListener('mouseleave', handleMouseLeave)
  }
})
</script>

<template>
  <div 
    ref="cardRef"
    :class="['transform-gpu transition-all duration-300 ease-out', props.class]"
    :style="{
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`
    }"
  >
    <slot />
  </div>
</template>

<style scoped>
.transform-gpu {
  transform-style: preserve-3d;
}
</style>