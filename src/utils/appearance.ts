// 外观设置：背景图片、在线字体、主题色与特效
// 状态统一持久化到 localStorage，并通过 CSS 变量驱动全站样式
import { computed, reactive, ref, watch } from 'vue'
import { APPEARANCE_CONFIG, CURSOR_OPTIONS, FONT_CDN, FONT_LOADING, SCREENSAVER_PETALS, STORAGE_KEYS } from '@/constants'
import { buildSvgCursor, cursorDataUri } from '@/utils/cursor'
import type {
  AppearanceBackground,
  AppearanceFont,
  CursorOption,
  ScreensaverPetalType
} from '@/constants'

export interface AccentSetting {
  h: number
  s: number
  l: number
}

export interface AppearanceEffect {
  autoRotate: boolean
  rotateInterval: number
  kenBurns: boolean
  overlay: number
  /** 页面飘落特效开关 */
  effectEnabled: boolean
  /** 可多选，粒子随机使用选中的类型 */
  petalTypes: ScreensaverPetalType[]
  petalCount: number
  rotationSpeed: number
  horizontalSpeed: number
  verticalSpeed: number
  petalSwing: number
  petalZIndex: number
}

export interface AppearanceState {
  backgroundId: string
  fontId: string
  cursor: string
  accent: AccentSetting
  effect: AppearanceEffect
}

export type DeviceLevel = 'low' | 'medium' | 'high'

export interface DeviceProfile {
  level: DeviceLevel
  cores: number
  memory: number
  reducedMotion: boolean
  saveData: boolean
  mobile: boolean
}

/** 根据 CPU 核心数、内存、网络与系统动效偏好推断设备档位 */
export function detectDeviceProfile(): DeviceProfile {
  const nav = navigator as Navigator & {
    deviceMemory?: number
    connection?: { saveData?: boolean }
  }
  const cores = nav.hardwareConcurrency || 4
  const memory = nav.deviceMemory || (cores >= 8 ? 8 : 4)
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const saveData = nav.connection?.saveData === true
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent)

  let level: DeviceLevel = 'medium'
  if (reducedMotion || saveData || cores <= 4 || memory <= 4) level = 'low'
  else if (cores >= 12 && memory >= 8 && !mobile) level = 'high'
  if (mobile && level === 'high') level = 'medium'

  return { level, cores, memory, reducedMotion, saveData, mobile }
}

/** 当前设备档位，供设置面板展示 */
export const deviceProfile = detectDeviceProfile()

/** 各档位的特效默认值（仅首次初始化 / 恢复默认时使用） */
const EFFECT_PRESETS: Record<
  DeviceLevel,
  Pick<AppearanceEffect, 'effectEnabled' | 'petalCount' | 'rotationSpeed' | 'horizontalSpeed' | 'verticalSpeed' | 'petalSwing'>
> = {
  low: { effectEnabled: true, petalCount: 16, rotationSpeed: 0.5, horizontalSpeed: 0.3, verticalSpeed: 1, petalSwing: 40 },
  medium: { effectEnabled: true, petalCount: 25, rotationSpeed: 1, horizontalSpeed: 0.5, verticalSpeed: 1.1, petalSwing: 60 },
  high: { effectEnabled: true, petalCount: 35, rotationSpeed: 1.4, horizontalSpeed: 0.6, verticalSpeed: 1.2, petalSwing: 80 }
}

export type FontStatus = 'idle' | 'loading' | 'ready' | 'error'

/** 色阶刻度，与 500 明度的偏移量一一对应 */
const ACCENT_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
const LIGHTNESS_OFFSETS = [43, 38, 29, 19, 8, 0, -5, -13, -19, -25, -36]
/** 单个字体样式表的最长等待时间（毫秒） */
const STYLESHEET_TIMEOUT = FONT_LOADING.stylesheetTimeout

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const toNumber = (value: unknown, fallback: number, min: number, max: number) =>
  typeof value === 'number' && Number.isFinite(value) ? clamp(value, min, max) : fallback

function createDefaults(): AppearanceState {
  // 深拷贝，避免运行时修改污染配置
  const state = JSON.parse(JSON.stringify(APPEARANCE_CONFIG.defaults)) as AppearanceState
  // 首次初始化 / 恢复默认时，特效参数按设备档位自动适配
  const preset = EFFECT_PRESETS[deviceProfile.level]
  state.effect = {
    ...state.effect,
    ...preset,
    // 系统开启「减少动效」或省流模式时默认关闭特效
    effectEnabled: deviceProfile.reducedMotion || deviceProfile.saveData ? false : preset.effectEnabled
  }
  return state
}

function loadState(): AppearanceState {
  const state = createDefaults()
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.appearance)
    if (!raw) return state

    const saved = JSON.parse(raw) as Partial<AppearanceState>
    if (typeof saved.backgroundId === 'string') state.backgroundId = saved.backgroundId
    if (typeof saved.fontId === 'string') state.fontId = saved.fontId
    if (typeof saved.cursor === 'string' && CURSOR_OPTIONS.some(item => item.id === saved.cursor)) {
      state.cursor = saved.cursor
    }

    if (saved.accent) {
      state.accent = {
        h: toNumber(saved.accent.h, state.accent.h, 0, 360),
        s: toNumber(saved.accent.s, state.accent.s, 0, 100),
        l: toNumber(saved.accent.l, state.accent.l, 10, 90)
      }
    }

    const savedEffect = saved.effect
    if (savedEffect) {
      // 只保留配置中存在的类型，兼容旧版本的无效值
      const savedTypes = Array.isArray(savedEffect.petalTypes)
        ? savedEffect.petalTypes.filter((item): item is ScreensaverPetalType =>
          SCREENSAVER_PETALS.some(petal => petal.id === item))
        : []
      state.effect = {
        autoRotate: typeof savedEffect.autoRotate === 'boolean' ? savedEffect.autoRotate : state.effect.autoRotate,
        rotateInterval: toNumber(savedEffect.rotateInterval, state.effect.rotateInterval, 5, 120),
        kenBurns: typeof savedEffect.kenBurns === 'boolean' ? savedEffect.kenBurns : state.effect.kenBurns,
        overlay: toNumber(savedEffect.overlay, state.effect.overlay, 0, 90),
        effectEnabled: typeof savedEffect.effectEnabled === 'boolean'
          ? savedEffect.effectEnabled
          : state.effect.effectEnabled,
        petalTypes: savedTypes.length > 0 ? savedTypes : state.effect.petalTypes,
        petalCount: toNumber(savedEffect.petalCount, state.effect.petalCount, 6, 150),
        rotationSpeed: toNumber(savedEffect.rotationSpeed, state.effect.rotationSpeed, 0, 5),
        horizontalSpeed: toNumber(savedEffect.horizontalSpeed, state.effect.horizontalSpeed, -3, 3),
        verticalSpeed: toNumber(savedEffect.verticalSpeed, state.effect.verticalSpeed, 0.1, 5),
        petalSwing: toNumber(savedEffect.petalSwing, state.effect.petalSwing, 0, 160),
        petalZIndex: toNumber(savedEffect.petalZIndex, state.effect.petalZIndex, -10, 999)
      }
    }
  } catch (error) {
    console.warn('读取外观设置失败，已回退默认值:', error)
  }
  return state
}

export const appearance = reactive<AppearanceState>(loadState())

/** 在线字体加载状态，供设置面板展示 */
export const fontStatus = reactive<Record<string, FontStatus>>({})

/** 背景候选：运行时从 public/bg/backgrounds.json 拉取（由 vite-plugin-gen-backgrounds 自动生成） */
export const backgroundList = ref<AppearanceBackground[]>([])
export const backgroundStatus = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')

// public 目录资源前缀，兼容非根路径部署
const ASSET_BASE = `${(import.meta.env.BASE_URL || '/').replace(/\/+$/, '')}/`

export function resolveAssetUrl(url: string): string {
  if (/^(?:https?:)?\/\//i.test(url) || url.startsWith('/')) return url
  return `${ASSET_BASE}${url.replace(/^\.?\//, '')}`
}

/** 兼容手写 JSON：缺省字段自动补全，过滤无效项 */
function normalizeBackgrounds(raw: unknown): AppearanceBackground[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item, index) => ({
      id: typeof item.id === 'string' && item.id ? item.id : `bg-${index + 1}`,
      label: typeof item.label === 'string' && item.label ? item.label : `背景 ${index + 1}`,
      labelEn: typeof item.labelEn === 'string' && item.labelEn ? item.labelEn : `Scene ${index + 1}`,
      url: typeof item.url === 'string' ? resolveAssetUrl(item.url) : ''
    }))
    .filter(item => !!item.url)
}

/** 加载背景候选列表（同站点静态 JSON，失败时保留当前值并标记错误） */
export async function loadBackgrounds(): Promise<void> {
  backgroundStatus.value = 'loading'
  try {
    const response = await fetch(`${ASSET_BASE}bg/backgrounds.json`, { cache: 'no-cache' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    backgroundList.value = normalizeBackgrounds(await response.json())
    backgroundStatus.value = backgroundList.value.length > 0 ? 'ready' : 'error'
  } catch (error) {
    console.warn('加载背景列表失败:', error)
    backgroundStatus.value = 'error'
  }
}

export const fontList = APPEARANCE_CONFIG.fonts
export const accentPresets = APPEARANCE_CONFIG.accents

// 字体列表为空时的兜底字体
const FALLBACK_FONT: AppearanceFont = {
  id: 'system',
  label: '系统默认',
  labelEn: 'System Default',
  family: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif',
  primary: '',
  files: []
}

export const currentBackground = computed(
  () => backgroundList.value.find(item => item.id === appearance.backgroundId) || null
)
export const backgroundUrl = computed(() => currentBackground.value?.url || '')
export const currentFont = computed<AppearanceFont>(
  () => fontList.find(item => item.id === appearance.fontId) || FALLBACK_FONT
)

/** HSL 转 RGB（0-255） */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hue = ((h % 360) + 360) % 360
  const sat = clamp(s, 0, 100) / 100
  const light = clamp(l, 0, 100) / 100
  const chroma = (1 - Math.abs(2 * light - 1)) * sat
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = light - chroma / 2

  let rgb: [number, number, number]
  if (hue < 60) rgb = [chroma, x, 0]
  else if (hue < 120) rgb = [x, chroma, 0]
  else if (hue < 180) rgb = [0, chroma, x]
  else if (hue < 240) rgb = [0, x, chroma]
  else if (hue < 300) rgb = [x, 0, chroma]
  else rgb = [chroma, 0, x]

  return rgb.map(value => Math.round((value + m) * 255)) as [number, number, number]
}

const toRgbCss = (rgb: [number, number, number]) => rgb.join(' ')

/** 由基础色推导完整的 50-950 色阶（CSS 变量所需的 RGB 三元组） */
export function buildAccentScale(accent: AccentSetting): Record<number, string> {
  return ACCENT_STEPS.reduce<Record<number, string>>((scale, step, index) => {
    const lightness = clamp(accent.l + (LIGHTNESS_OFFSETS[index] ?? 0), 6, 96)
    scale[step] = toRgbCss(hslToRgb(accent.h, accent.s, lightness))
    return scale
  }, {})
}

export const accentScale = computed(() => buildAccentScale(appearance.accent))

/** 当前主题色（500 色阶）的十六进制值 */
export const accentHex = computed(() => {
  const rgb = hslToRgb(appearance.accent.h, appearance.accent.s, appearance.accent.l)
  return `#${rgb.map(value => value.toString(16).padStart(2, '0')).join('')}`
})

/** 将主题色与搭配色写入 CSS 变量，配合 uno.config.ts 中的色板使用 */
export function applyAccent(): void {
  const root = document.documentElement
  const scale = buildAccentScale(appearance.accent)
  // 次级色：色相轻微偏移，用于渐变两端的搭配
  const altScale = buildAccentScale({
    h: appearance.accent.h + 20,
    s: clamp(appearance.accent.s - 8, 30, 100),
    l: clamp(appearance.accent.l + 6, 20, 70)
  })

  ACCENT_STEPS.forEach(step => {
    const value = scale[step]
    const altValue = altScale[step]
    if (value) root.style.setProperty(`--accent-${step}`, value)
    if (altValue) root.style.setProperty(`--accent-alt-${step}`, altValue)
  })
}

/** 生成跟随主题色的 SVG 光标 */
function buildCursorValue(option: CursorOption, color: string): string {
  if (option.id === 'arrow' || option.id === 'dot' || option.id === 'ring' || option.id === 'target') {
    return buildSvgCursor(option.id, color)
  }
  return option.css || 'auto'
}

/** 将鼠标样式写入根元素，由 global.css 的 html[data-cursor] 规则生效 */
export function applyCursor(): void {
  const root = document.documentElement
  const option = CURSOR_OPTIONS.find(item => item.id === appearance.cursor)
  if (!option || option.id === 'default') {
    root.removeAttribute('data-cursor')
    root.style.removeProperty('--app-cursor')
    return
  }
  root.setAttribute('data-cursor', option.id)
  root.style.setProperty('--app-cursor', cursorCssValue(option.id))
}

/** 光标实际 CSS 值，供应用与面板预览共用 */
export function cursorCssValue(optionId: string): string {
  const option = CURSOR_OPTIONS.find(item => item.id === optionId)
  if (!option || option.id === 'default') return 'auto'
  return buildCursorValue(option, accentHex.value)
}

/** 面板预览图（data URI），颜色与光标一致 */
export function cursorPreviewSource(optionId: string): string {
  const option = CURSOR_OPTIONS.find(item => item.id === optionId)
  if (!option) return ''
  if (option.id === 'default') return cursorDataUri('arrow', '#6b7280')
  if (option.id === 'crosshair') return cursorDataUri('target', '#6b7280')
  return cursorDataUri(option.id as 'arrow' | 'dot' | 'ring' | 'target', accentHex.value)
}

const fontLoads = new Map<string, Promise<void>>()

/** 插入单个字体样式表 */
function loadStylesheet(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url

    const timer = window.setTimeout(() => {
      link.remove()
      reject(new Error(`字体样式表加载超时: ${url}`))
    }, STYLESHEET_TIMEOUT)

    link.onload = () => {
      window.clearTimeout(timer)
      resolve()
    }

    link.onerror = () => {
      window.clearTimeout(timer)
      link.remove()
      reject(new Error(`字体样式表加载失败: ${url}`))
    }

    document.head.appendChild(link)
  })
}

/** 单个样式表按主 CDN → 降级 CDN 依次尝试 */
async function loadFontFile(path: string): Promise<boolean> {
  for (const base of [FONT_CDN.primary, FONT_CDN.fallback]) {
    try {
      await loadStylesheet(`${base}/${path}`)
      return true
    } catch (error) {
      console.warn(error)
    }
  }
  return false
}

/** 按需插入字体样式表（多字重、双 CDN 降级），并等待字体真正可用 */
function loadFontStylesheet(font: AppearanceFont): Promise<void> {
  if (font.files.length === 0) return Promise.resolve()

  const cached = fontLoads.get(font.id)
  if (cached) return cached

  const task = (async () => {
    const results = await Promise.all(font.files.map(file => loadFontFile(file)))
    if (!results.some(Boolean)) {
      fontLoads.delete(font.id)
      throw new Error(`字体加载失败: ${font.id}`)
    }
    // 等字体解析完成，避免切换后短暂显示回退字体（超时不阻塞）
    if (font.primary && document.fonts?.load) {
      await document.fonts.load(`16px "${font.primary}"`).catch(() => undefined)
    }
  })()

  fontLoads.set(font.id, task)
  return task
}

function applyFontFamily(font: AppearanceFont): void {
  document.documentElement.style.setProperty('--app-font-family', font.family)
  // index.html 内联样式为 html/body/#app 指定了字体，这里用行内样式覆盖以保证生效
  const targets = [document.documentElement, document.body, document.getElementById('app')]
  targets.forEach(target => {
    if (target) (target as HTMLElement).style.fontFamily = font.family
  })
}

/** 切换字体，返回是否成功（失败时回退系统默认字体） */
export async function setFont(id: string): Promise<boolean> {
  const font = fontList.find(item => item.id === id)
  if (!font) return false

  if (font.files.length > 0 && fontStatus[font.id] !== 'ready') {
    fontStatus[font.id] = 'loading'
    try {
      await loadFontStylesheet(font)
      fontStatus[font.id] = 'ready'
    } catch (error) {
      console.warn(error)
      fontStatus[font.id] = 'error'
      return false
    }
  }

  applyFontFamily(font)
  appearance.fontId = font.id
  return true
}

/** 预加载字体样式并在后台下载预览字形（设置面板字体页使用，最多 3 并发） */
export async function preloadFontStyles(fonts: AppearanceFont[] = fontList): Promise<void> {
  const queue = fonts.filter(font =>
    font.files.length > 0 && fontStatus[font.id] !== 'ready' && fontStatus[font.id] !== 'loading'
  )

  const workers = Array.from({ length: Math.min(FONT_LOADING.preloadConcurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      const font = queue.shift()
      if (!font) return
      fontStatus[font.id] = 'loading'
      try {
        await loadFontStylesheet(font)
        if (font.primary && document.fonts?.load) {
          await document.fonts.load(`16px "${font.primary}"`, '春风十里 Aa')
        }
        fontStatus[font.id] = 'ready'
      } catch {
        fontStatus[font.id] = 'error'
      }
    }
  })

  await Promise.all(workers)
}

/** 恢复默认外观（特效按当前设备档位重新推荐） */
export function resetAppearance(): void {
  const defaults = createDefaults()
  appearance.backgroundId = defaults.backgroundId
  appearance.cursor = defaults.cursor
  appearance.accent = defaults.accent
  appearance.effect = defaults.effect
  void setFont(defaults.fontId)
  applyAccent()
  applyCursor()
}

/** 切换下一张背景，供轮播与屏保共用 */
export function nextBackgroundId(currentId: string): string {
  const list = backgroundList.value
  if (list.length === 0) return ''
  const index = list.findIndex(item => item.id === currentId)
  return list[(index + 1) % list.length]?.id || list[0]?.id || ''
}

let persistTimer: number | undefined

function persist(): void {
  if (persistTimer) window.clearTimeout(persistTimer)
  persistTimer = window.setTimeout(() => {
    persistTimer = undefined
    try {
      localStorage.setItem(STORAGE_KEYS.appearance, JSON.stringify({
        version: 1,
        updatedAt: new Date().toISOString(),
        ...appearance
      }))
    } catch (error) {
      console.warn('保存外观设置失败:', error)
    }
  }, 200)
}

watch(appearance, persist, { deep: true })
watch(() => appearance.accent, () => {
  applyAccent()
  // 主题圆点 / 光环光标需要跟随主色重新生成
  applyCursor()
}, { deep: true })
watch(() => appearance.cursor, applyCursor)

/** 应用已保存的外观设置（应用启动时调用，localStorage 中的用户配置优先） */
export function initAppearance(): void {
  applyAccent()
  applyCursor()
  void loadBackgrounds()

  const font = currentFont.value
  applyFontFamily(font)
  if (font.files.length > 0 && fontStatus[font.id] !== 'ready') {
    fontStatus[font.id] = 'loading'
    loadFontStylesheet(font)
      .then(() => { fontStatus[font.id] = 'ready' })
      .catch(() => { fontStatus[font.id] = 'error' })
  }
}
