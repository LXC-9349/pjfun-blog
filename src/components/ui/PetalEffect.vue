<template>
  <canvas ref="canvasRef" class="petals-canvas" :style="{ zIndex: canvasZIndex }" aria-hidden="true"></canvas>
</template>

<script setup lang="ts">
// 页面 / 屏保飘落特效
// 粒子素材使用同目录复制过来的 SVG 图标资源（不再自绘形状）
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { PETAL_EFFECT_CONFIG, SCREENSAVER_PETALS } from '@/constants'
import type { ScreensaverPetalType } from '@/constants'
import { PETAL_ICON_URLS } from '@/assets/petals'
import { appearance } from '@/utils/appearance'

interface Petal {
  x: number
  y: number
  baseX: number
  size: number
  type: ScreensaverPetalType
  rotation: number
  rotateSpeed: number
  vy: number
  wind: number
  swingPhase: number
  swingSpeed: number
  opacity: number
  special: boolean
  life: number
}

const props = defineProps<{
  /** 不传时使用外观设置中的「显示层级」 */
  zIndex?: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasZIndex = computed(() => props.zIndex ?? appearance.effect.petalZIndex)

const dpr = Math.min(window.devicePixelRatio || 1, PETAL_EFFECT_CONFIG.maxDpr)

let ctx: CanvasRenderingContext2D | null = null
let rafId = 0
let width = 0
let height = 0
let elapsed = 0
let lastTime = 0
let disposed = false
let petals: Petal[] = []

// 粒子图标资源：键为粒子类型，值为预加载后的图片
const images: Partial<Record<ScreensaverPetalType, HTMLImageElement>> = {}
const mouse = { x: -9999, y: -9999 }

const rand = (min: number, max: number) => min + Math.random() * (max - min)

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = url
  })
}

/** 预加载全部粒子图标 */
async function loadImages() {
  const results = await Promise.all(
    SCREENSAVER_PETALS.map(async item => {
      const image = await loadImage(PETAL_ICON_URLS[item.id])
      return [item.id, image] as const
    })
  )
  results.forEach(([id, image]) => {
    if (image) images[id] = image
  })
}

function pickType(): ScreensaverPetalType {
  const types = appearance.effect.petalTypes
  return types[Math.floor(Math.random() * types.length)] ?? 'yinxing'
}

function createPetal(initial = false): Petal {
  const x = rand(0, width)
  return {
    x,
    y: initial ? rand(-height, height) : rand(-80, -20),
    baseX: x,
    size: rand(10, 24),
    type: pickType(),
    rotation: rand(0, Math.PI * 2),
    rotateSpeed: rand(-0.9, 0.9),
    vy: rand(26, 62),
    wind: rand(-8, 8),
    swingPhase: rand(0, Math.PI * 2),
    swingSpeed: rand(0.5, 1.5),
    opacity: rand(0.55, 0.95),
    special: false,
    life: Number.POSITIVE_INFINITY
  }
}

function resetPetals() {
  const count = appearance.effect.petalCount
  // 未选择任何类型时不生成粒子
  petals = appearance.effect.petalTypes.length === 0
    ? []
    : Array.from({ length: count }, () => createPetal(true))
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  width = window.innerWidth
  height = window.innerHeight
  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  ctx = canvas.getContext('2d')
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
}

/** 在指定位置生成发光粒子（点击触发） */
function spawnAt(clientX: number, clientY: number) {
  if (appearance.effect.petalTypes.length === 0) return
  if (petals.filter(item => item.special).length >= PETAL_EFFECT_CONFIG.maxSpecialPetals) return
  for (let i = 0; i < PETAL_EFFECT_CONFIG.clickSpawnCount; i++) {
    const petal = createPetal(false)
    petal.x = clientX + rand(-12, 12)
    petal.baseX = petal.x
    petal.y = clientY + rand(-12, 12)
    petal.vy = rand(18, 44)
    petal.size = rand(12, 26)
    petal.special = true
    petal.life = rand(4, 7)
    petals.push(petal)
  }
}

function update(dt: number) {
  const { rotationSpeed, horizontalSpeed, verticalSpeed, petalSwing } = appearance.effect
  const radius = PETAL_EFFECT_CONFIG.mouseRadius
  const radiusSq = radius * radius
  const mouseActive = mouse.x > -1000
  // 原地压缩数组：避免每帧新建数组带来的 GC 压力
  let alive = 0

  for (let i = 0; i < petals.length; i++) {
    let petal = petals[i]!

    // 鼠标避让（用平方距离比较，省去每帧的 Math.hypot）
    if (mouseActive) {
      const dx = petal.x - mouse.x
      const dy = petal.y - mouse.y
      const distanceSq = dx * dx + dy * dy
      if (distanceSq > 0.0001 && distanceSq < radiusSq) {
        const distance = Math.sqrt(distanceSq)
        const force = (radius - distance) / radius
        petal.baseX += (dx / distance) * force * 36 * dt
        petal.y += (dy / distance) * force * 10 * dt
      }
    }

    // 水平速度：基础漂移 + 风力
    petal.baseX += (petal.wind + horizontalSpeed * 16) * dt
    petal.y += petal.vy * verticalSpeed * dt
    petal.x = petal.baseX + Math.sin(elapsed * petal.swingSpeed + petal.swingPhase) * petalSwing
    petal.rotation += petal.rotateSpeed * rotationSpeed * dt

    if (petal.special) {
      petal.life -= dt
      if (petal.life <= 0 || petal.y > height + 60) continue
      petals[alive++] = petal
      continue
    }

    // 越界后从顶部重新飘落
    if (petal.y > height + 60) {
      petal = createPetal(false)
      petal.x = rand(0, width)
      petal.baseX = petal.x
    } else {
      if (petal.baseX < -120) petal.baseX = width + 80
      if (petal.baseX > width + 120) petal.baseX = -80
    }

    petals[alive++] = petal
  }

  petals.length = alive
}

function draw() {
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)

  for (const petal of petals) {
    const sprite = images[petal.type]
    if (!sprite) continue
    // SVG 图标带内边距，稍微放大以保证观感
    const drawSize = petal.size * PETAL_EFFECT_CONFIG.iconScale
    ctx.save()
    ctx.translate(petal.x, petal.y)
    ctx.rotate(petal.rotation)
    ctx.globalAlpha = petal.opacity
    if (petal.special) {
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)'
      ctx.shadowBlur = 14
    }
    ctx.drawImage(sprite, -drawSize / 2, -drawSize / 2, drawSize, drawSize)
    ctx.restore()
  }
}

function frame(time: number) {
  if (!ctx) return
  const dt = lastTime ? Math.min(0.05, (time - lastTime) / 1000) : 0
  lastTime = time
  elapsed += dt
  update(dt)
  draw()
  rafId = requestAnimationFrame(frame)
}

function start() {
  if (rafId) return
  lastTime = 0
  rafId = requestAnimationFrame(frame)
}

function stop() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
}

function handleResize() {
  resize()
  resetPetals()
}

function handleMouseMove(event: MouseEvent) {
  mouse.x = event.clientX
  mouse.y = event.clientY
}

function handleMouseLeave() {
  mouse.x = -9999
  mouse.y = -9999
}

/** 点击页面生成发光粒子（参考 sakura.vue 的点击交互） */
function handleClick(event: MouseEvent) {
  // 底部区域不生成，避免误触
  if (event.clientY > window.innerHeight - PETAL_EFFECT_CONFIG.clickBottomSafeArea) return
  spawnAt(event.clientX, event.clientY)
}

function handleVisibilityChange() {
  if (document.hidden) stop()
  else start()
}

watch(
  () => [appearance.effect.petalTypes.join(','), appearance.effect.petalCount],
  () => resetPetals()
)

onMounted(async () => {
  resize()
  window.addEventListener('resize', handleResize)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseleave', handleMouseLeave)
  window.addEventListener('click', handleClick)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  await loadImages()
  if (disposed) return
  resetPetals()
  start()
})

onUnmounted(() => {
  disposed = true
  stop()
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseleave', handleMouseLeave)
  window.removeEventListener('click', handleClick)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

defineExpose({ spawnAt })
</script>

<style scoped>
.petals-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
