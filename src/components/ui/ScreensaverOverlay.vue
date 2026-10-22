<template>
  <Teleport to="body">
    <Transition name="screensaver">
      <div
        v-if="visible"
        class="screensaver"
        role="dialog"
        aria-modal="true"
        :aria-label="t('appearanceScreensaver')"
        @mousemove="handleActivity"
        @pointerdown="handleActivity"
        @mouseleave="hideControls"
        @wheel.prevent
      >
        <!-- 媒体层：照片与视频共用双层交叉淡入淡出 -->
        <div
          v-for="(layer, index) in layers"
          :key="index"
          class="screensaver-slide"
          :class="{ 'is-active': activeLayer === index }"
        >
          <template v-if="layer">
            <video
              v-if="layer.kind === 'video'"
              :ref="el => setVideoRef(index, el)"
              class="screensaver-image"
              :src="layer.src"
              :poster="layer.poster"
              :muted="muted"
              loop
              playsinline
              preload="auto"
              @loadeddata="handleMediaReady(index)"
              @error="handleMediaError(index)"
            ></video>
            <img
              v-else
              :src="layer.src"
              class="screensaver-image"
              :class="{ 'ken-burns': appearance.effect.kenBurns }"
              alt=""
              draggable="false"
            >
          </template>
        </div>

        <!-- 视频加载占位 -->
        <Transition name="fade">
          <div v-if="videoLoading" class="screensaver-loading">
            <div class="loading-spinner"></div>
            <p>{{ t('appearanceVideoLoading') }}</p>
          </div>
        </Transition>

        <!-- 飘落特效：樱花 / 枫叶 / 梅花 / 银杏 / 羽毛 / 星星 -->
        <PetalEffect v-if="appearance.effect.effectEnabled" :z-index="3" />

        <!-- 序号 -->
        <Transition name="fade">
          <div v-if="showControls && pool.length > 0" class="screensaver-meta">
            {{ currentPosition }} / {{ pool.length }}
          </div>
        </Transition>

        <!-- 控制按钮：移动鼠标出现，3 秒后自动隐藏 -->
        <Transition name="fade">
          <div
            v-if="showControls"
            class="screensaver-controls"
            @mouseenter="clearHideTimer"
            @mouseleave="startHideTimer"
          >
            <button
              class="screensaver-btn screensaver-btn-wide"
              :class="{ 'is-active': imagesOnly }"
              :title="t('appearanceImagesOnlyHint')"
              :aria-label="t('appearanceImagesOnlyHint')"
              :aria-pressed="imagesOnly"
              @click="toggleImagesOnly"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="8.5" cy="9.5" r="1.5" />
                <path d="M21 16l-5-5-9 9" />
              </svg>
              <span>{{ t('appearanceImagesOnly') }}</span>
            </button>
            <button
              class="screensaver-btn"
              :title="muted ? t('appearanceUnmute') : t('appearanceMute')"
              :aria-label="muted ? t('appearanceUnmute') : t('appearanceMute')"
              @click="toggleMute"
            >
              <svg v-if="muted" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M11 5L6 9H3v6h3l5 4V5z" />
                <path d="M22 9l-6 6M16 9l6 6" />
              </svg>
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M11 5L6 9H3v6h3l5 4V5z" />
                <path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" />
              </svg>
            </button>
            <button
              class="screensaver-btn"
              :title="paused ? t('appearancePlay') : t('appearancePause')"
              :aria-label="paused ? t('appearancePlay') : t('appearancePause')"
              @click="togglePlay"
            >
              <svg v-if="paused" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7 5h3v14H7zM14 5h3v14h-3z" />
              </svg>
            </button>
            <button
              class="screensaver-btn"
              :title="t('appearanceNext')"
              :aria-label="t('appearanceNext')"
              @click="showNext"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 5l9 7-9 7V5zm10 0h2v14h-2V5z" />
              </svg>
            </button>
            <button
              class="screensaver-btn screensaver-close"
              :title="t('appearanceScreensaverExit')"
              :aria-label="t('appearanceScreensaverExit')"
              @click="close"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </Transition>

        <!-- 退出提示 -->
        <Transition name="fade">
          <p v-if="showControls" class="screensaver-hint">{{ t('appearanceScreensaverHint') }}</p>
        </Transition>

        <!-- 点击生成粒子提示 -->
        <Transition name="fade">
          <p v-if="showControls && appearance.effect.effectEnabled" class="screensaver-petal-hint">
            {{ t('appearancePetalClickHint') }}
          </p>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { t } from '@/utils/i18n'
import { appearance, backgroundList, resolveAssetUrl } from '@/utils/appearance'
import { bilibiliProxyUrl, SCREENSAVER_CONFIG } from '@/constants'
import { resolveBilibiliDirect } from '@/utils/bilibili'
import PetalEffect from '@/components/ui/PetalEffect.vue'

type MediaKind = 'image' | 'video'

interface MediaItem {
  kind: MediaKind
  src: string
  poster: string
  /** B 站 BV 号：代理失败时用于直链兑底 */
  bvid?: string
  /** 是否已使用第三方直链重试 */
  resolved?: boolean
  /** 重试前的原始地址，用于失败源去重与序号定位 */
  originSrc?: string
}

/** 媒体的稳定标识：B 站重试后 src 会变成直链，但仍应视为同一条 clip */
function mediaKey(item: MediaItem | null | undefined): string {
  return item?.originSrc ?? item?.src ?? ''
}

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'update:visible', value: boolean): void }>()

const imageItems = computed<MediaItem[]>(
  () => backgroundList.value.map(item => ({ kind: 'image', src: item.url, poster: '' }))
)

// 视频源配置见 src/constants/screensaver.ts
const clipItems = computed<MediaItem[]>(() => {
  const posters = backgroundList.value
  return SCREENSAVER_CONFIG.clips.map((clip, index) => {
    // 占位图默认使用 public/bg 中的图片，避免引用 public/img 下的资源
    const poster = clip.poster
      ? resolveAssetUrl(clip.poster)
      : (posters.length > 0 ? posters[index % posters.length]?.url ?? '' : '')
    return clip.type === 'bilibili'
      ? { kind: 'video', src: bilibiliProxyUrl(clip.bvid), poster, bvid: clip.bvid }
      : { kind: 'video', src: resolveAssetUrl(clip.src), poster }
  })
})

// 仅图片模式（默认关闭，即默认播放视频）
const imagesOnly = ref(false)
// 本次屏保内加载失败的视频源，避免反复选中
const failedSources = ref<string[]>([])

/** 默认视频；勾选「仅图片」或视频全部不可用时使用背景图 */
const pool = computed<MediaItem[]>(() => {
  if (imagesOnly.value) return imageItems.value
  const available = clipItems.value.filter(item => !failedSources.value.includes(item.src))
  return available.length > 0 ? available : imageItems.value
})

const layers = ref<[MediaItem | null, MediaItem | null]>([null, null])
const activeLayer = ref(0)
const currentItem = ref<MediaItem | null>(null)
const videoLoading = ref(false)
const muted = ref(true)
const paused = ref(false)
const showControls = ref(false)

const videoElements = new Map<number, HTMLVideoElement>()

let autoTimer: number | undefined
let hideTimer: number | undefined
let loadTimer: number | undefined
let ignoreTimer: number | undefined
let ignoreMediaError = false
// 每次真正切换画面时递增；用于丢弃过期的 B 站直链重试结果
let mediaToken = 0

// 全屏状态：进入成功后才在退出全屏时关闭屏保
const enteredFullscreen = ref(false)
let ignoreFullscreenChange = false

const currentPosition = computed(() => {
  const key = mediaKey(currentItem.value)
  const index = pool.value.findIndex(item => item.src === key)
  return index >= 0 ? index + 1 : 1
})

function setVideoRef(index: number, el: Element | ComponentPublicInstance | null) {
  if (el instanceof HTMLVideoElement) videoElements.set(index, el)
  else videoElements.delete(index)
}

/** 仅播放当前图层视频，其余暂停并复位，降低解码开销 */
function syncVideoPlayback() {
  videoElements.forEach((video, index) => {
    if (index === activeLayer.value && !paused.value) {
      video.play().catch(() => undefined)
    } else {
      video.pause()
      if (index !== activeLayer.value) video.currentTime = 0
    }
  })
}

function clearLoadTimer() {
  if (loadTimer) {
    window.clearTimeout(loadTimer)
    loadTimer = undefined
  }
}

/** 视频加载超时则跳过，避免长时间黑屏 */
function armLoadTimer() {
  clearLoadTimer()
  loadTimer = window.setTimeout(() => {
    if (videoLoading.value) handleMediaError()
  }, SCREENSAVER_CONFIG.mediaLoadTimeout)
}

function handleMediaReady(layerIndex: number) {
  // 只响应当前活动层的媒体，避免离开的旧视频误清加载态
  if (layerIndex !== activeLayer.value) return
  videoLoading.value = false
  clearLoadTimer()
  syncVideoPlayback()
}

/** 交叉淡入淡出切换到指定媒体 */
function show(item: MediaItem) {
  clearIgnoreTimer()
  mediaToken++
  const next = activeLayer.value === 0 ? 1 : 0
  const nextLayers = [...layers.value] as [MediaItem | null, MediaItem | null]
  nextLayers[next] = item
  layers.value = nextLayers
  activeLayer.value = next
  currentItem.value = item
  videoLoading.value = item.kind !== 'image'
  if (item.kind !== 'image') armLoadTimer()
  else clearLoadTimer()
  nextTick(syncVideoPlayback)
  // 视频循环播放，不按间隔切换；图片才自动轮播
  if (item.kind === 'image') startAutoSwitch()
  else stopAutoSwitch()
}

/** 随机取一条媒体，空列表返回 null */
function randomItem(list: MediaItem[]): MediaItem | null {
  if (list.length === 0) return null
  return list[Math.floor(Math.random() * list.length)] ?? null
}

/** 随机切换到下一条，避免连续重复（参考 screensaver.vue 的切换方式） */
function clearIgnoreTimer() {
  if (ignoreTimer) {
    window.clearTimeout(ignoreTimer)
    ignoreTimer = undefined
  }
  ignoreMediaError = false
}

function showNext() {
  const list = pool.value
  if (list.length === 0) return
  let item = randomItem(list)
  let guard = 0
  while (list.length > 1 && item && mediaKey(item) === mediaKey(currentItem.value) && guard++ < SCREENSAVER_CONFIG.maxSwitchRetry) {
    item = randomItem(list)
  }
  if (!item) return
  show(item)
}

/** 单个媒体加载失败：B 站先尝试直链兑底，其余直接跳过 */
async function handleMediaError(layerIndex: number = activeLayer.value) {
  // 只响应当前活动层，避免旧层视频报错误伤正在播放的媒体
  if (layerIndex !== activeLayer.value || ignoreMediaError) return

  const item = currentItem.value
  console.warn('屏保媒体加载失败，已跳过:', item?.src)
  videoLoading.value = false
  clearLoadTimer()

  // B 站代理失败时，尝试第三方解析出的直链再播一次
  if (item?.bvid && !item.resolved) {
    const token = mediaToken
    const direct = await resolveBilibiliDirect(item.bvid)
    // 等待期间用户可能已切换媒体或关闭屏保，丢弃过期结果
    if (token !== mediaToken || !props.visible) return
    if (direct) {
      ignoreMediaError = true
      const retry: MediaItem = {
        ...item,
        src: direct,
        resolved: true,
        originSrc: mediaKey(item)
      }
      const nextLayers = [...layers.value] as [MediaItem | null, MediaItem | null]
      nextLayers[activeLayer.value] = retry
      layers.value = nextLayers
      currentItem.value = retry
      videoLoading.value = true
      armLoadTimer()
      nextTick(syncVideoPlayback)
      // 替换 src 会中止旧请求，短暂忽略由此产生的事件；若重试仍失败则在窗口结束后补一次处理
      if (ignoreTimer) window.clearTimeout(ignoreTimer)
      ignoreTimer = window.setTimeout(() => {
        ignoreTimer = undefined
        ignoreMediaError = false
        const video = videoElements.get(activeLayer.value)
        if (videoLoading.value && video?.error) void handleMediaError()
      }, 2_000)
      return
    }
  }

  // 记录失败源，避免本次屏保反复选中同一条
  if (item) {
    const failedKey = mediaKey(item)
    failedSources.value = [...failedSources.value, failedKey]
  }
  showNext()
}

function startAutoSwitch() {
  stopAutoSwitch()
  if (paused.value) return
  // 仅图片自动轮播；视频循环播放，避免 B 站等加载较慢的视频尚未开始就被切走
  if (currentItem.value?.kind !== 'image') return
  if (pool.value.length < 2) return
  const seconds = Math.max(SCREENSAVER_CONFIG.minInterval, SCREENSAVER_CONFIG.interval)
  autoTimer = window.setInterval(showNext, seconds * 1000)
}

function stopAutoSwitch() {
  if (autoTimer) {
    window.clearInterval(autoTimer)
    autoTimer = undefined
  }
}

function clearHideTimer() {
  if (hideTimer) {
    window.clearTimeout(hideTimer)
    hideTimer = undefined
  }
}

/** 鼠标停止移动 3 秒后隐藏控件 */
function startHideTimer() {
  clearHideTimer()
  hideTimer = window.setTimeout(() => {
    showControls.value = false
  }, SCREENSAVER_CONFIG.controlsHideDelay)
}

function handleActivity() {
  showControls.value = true
  startHideTimer()
}

function hideControls() {
  clearHideTimer()
  showControls.value = false
}

function togglePlay() {
  paused.value = !paused.value
  if (paused.value) {
    stopAutoSwitch()
    videoElements.forEach(video => video.pause())
  } else {
    startAutoSwitch()
    syncVideoPlayback()
  }
  handleActivity()
}

function toggleMute() {
  muted.value = !muted.value
  // 用户手势下允许取消静音播放
  syncVideoPlayback()
  handleActivity()
}

/** 切换「仅图片 / 视频」模式，切换后立即播放对应媒体 */
function toggleImagesOnly() {
  imagesOnly.value = !imagesOnly.value
  failedSources.value = []
  const next = randomItem(pool.value)
  if (next) show(next)
  startAutoSwitch()
  handleActivity()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' || event.key === 'Esc') {
    event.preventDefault()
    close()
  }
}

function close() {
  emit('update:visible', false)
}

/** 进入浏览器全屏；不支持或请求被拒时保持沉浸覆盖层 */
async function enterFullscreen() {
  if (!SCREENSAVER_CONFIG.fullscreen || document.fullscreenElement) return
  const element = document.documentElement
  if (!element.requestFullscreen) return
  try {
    await element.requestFullscreen()
    // 请求期间用户可能已关闭屏保，此时不能再把页面留在全屏
    if (!props.visible) {
      if (document.exitFullscreen) {
        await document.exitFullscreen().catch(() => undefined)
      }
      enteredFullscreen.value = false
      return
    }
    enteredFullscreen.value = true
  } catch (error) {
    console.warn('进入全屏失败，已降级为沉浸模式:', error)
  }
}

function exitFullscreen() {
  if (!document.fullscreenElement) return
  ignoreFullscreenChange = true
  document.exitFullscreen()
    .catch(() => undefined)
    .finally(() => {
      ignoreFullscreenChange = false
      enteredFullscreen.value = false
    })
}

/** 用户通过 ESC 退出全屏时同步关闭屏保 */
function handleFullscreenChange() {
  if (ignoreFullscreenChange) return
  if (!document.fullscreenElement) {
    enteredFullscreen.value = false
    if (props.visible) close()
  }
}

function onOpen() {
  failedSources.value = []
  clearIgnoreTimer()
  mediaToken++
  imagesOnly.value = false
  // 默认进入浏览器全屏（不支持时降级）
  void enterFullscreen()
  // 随机起始媒体（默认视频）
  const list = pool.value
  const startItem = randomItem(list)
  if (startItem) show(startItem)
  // 预加载图片，避免切换时出现空白
  imageItems.value.forEach(item => {
    const image = new Image()
    image.src = item.src
  })
  paused.value = false
  showControls.value = false
  startAutoSwitch()
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.documentElement.style.overflow = 'hidden'
}

function onClose() {
  mediaToken++
  clearIgnoreTimer()
  stopAutoSwitch()
  clearHideTimer()
  clearLoadTimer()
  videoElements.forEach(video => video.pause())
  videoLoading.value = false
  showControls.value = false
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  exitFullscreen()
  document.documentElement.style.overflow = ''
}

// 视频 / 背景列表异步加载完成后，若屏保已打开且无媒体则自动补上
watch(pool, list => {
  if (props.visible && !currentItem.value && list.length > 0) {
    const first = list[0]
    if (!first) return
    show(first)
    startAutoSwitch()
  }
})

watch(
  () => props.visible,
  visible => {
    if (visible) onOpen()
    else onClose()
  }
)

onUnmounted(() => {
  stopAutoSwitch()
  clearHideTimer()
  clearLoadTimer()
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  exitFullscreen()
  document.documentElement.style.overflow = ''
})
</script>

<style scoped>
.screensaver {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: #000;
  overflow: hidden;
}

.screensaver-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  /* 与参考实现一致的交叉淡入淡出时长 */
  transition: opacity 1.5s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.screensaver-slide.is-active {
  opacity: 1;
}

.screensaver-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  transform-origin: center;
}

.ken-burns {
  animation: screensaver-ken-burns 24s ease-out forwards;
}

@keyframes screensaver-ken-burns {
  from {
    transform: scale(1) translate3d(0, 0, 0);
  }
  to {
    transform: scale(1.12) translate3d(1.5%, -1.5%, 0);
  }
}

/* 视频加载占位（参考 screensaver.vue 的 loading 样式） */
.screensaver-loading {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.35);
  pointer-events: none;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: screensaver-spin 1s ease-in-out infinite;
}

@keyframes screensaver-spin {
  to {
    transform: rotate(360deg);
  }
}

.screensaver-controls {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 10;
  display: flex;
  gap: 10px;
}

.screensaver-btn {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.screensaver-btn:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

.screensaver-close:hover {
  background-color: rgba(239, 68, 68, 0.85);
}

/* 「仅图片」胶囊按钮：覆盖圆形按钮的固定宽度，激活后高亮 */
.screensaver-btn.screensaver-btn-wide {
  width: auto;
  min-width: 0;
  gap: 6px;
  padding: 0 16px;
  border-radius: 9999px;
  font-size: 12px;
  white-space: nowrap;
}

.screensaver-btn.screensaver-btn-wide.is-active,
.screensaver-btn.screensaver-btn-wide.is-active:hover {
  background-color: #ffffff;
  color: #111827;
}

.screensaver-meta {
  position: absolute;
  top: 36px;
  left: 28px;
  z-index: 10;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  letter-spacing: 0.08em;
}

.screensaver-hint {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 13px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.screensaver-petal-hint {
  position: absolute;
  bottom: 24px;
  left: 28px;
  z-index: 10;
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.screensaver-enter-active,
.screensaver-leave-active {
  transition: opacity 0.4s ease;
}

.screensaver-enter-from,
.screensaver-leave-to {
  opacity: 0;
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
