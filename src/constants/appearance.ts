// 外观设置：字体 / 主题色 / 特效 / 鼠标样式的可配置项与默认值
// 所有默认值集中在 APPEARANCE_DEFAULTS，可直接修改，也支持通过 .env 覆盖（键名见注释）
import { getEnvVar } from './env'

export interface AppearanceBackground {
  id: string
  label: string
  labelEn: string
  url: string
}

export interface AppearanceFont {
  id: string
  label: string
  labelEn: string
  /** 应用到页面上的 font-family 完整值 */
  family: string
  /** 用于 document.fonts.load 检测的主字体名，系统字体为空 */
  primary: string
  /** npm 包内的样式表路径；按 FONT_CDN 顺序尝试，失败自动降级 */
  files: string[]
}

// 字体 CDN：主用国内镜像，失败后自动降级到 unpkg
export const FONT_CDN = {
  primary: 'https://cdn.jsdmirror.cn/npm',
  fallback: 'https://unpkg.com'
} as const

export interface AppearanceAccentPreset {
  id: string
  label: string
  labelEn: string
  /** 色相 0-360 */
  h: number
  /** 饱和度 0-100 */
  s: number
  /** 明度 0-100，对应色阶中的 500 */
  l: number
}

export type ScreensaverPetalType = 'fengye' | 'meihua' | 'yinghua1' | 'yinxing' | 'yumao' | 'xingxing'

export interface ScreensaverPetalOption {
  id: ScreensaverPetalType
  label: string
  labelEn: string
  /** 主色，用于绘制与设置面板展示 */
  color: string
}

// 屏保 / 页面特效的粒子类型
export const SCREENSAVER_PETALS: ScreensaverPetalOption[] = [
  { id: 'yinxing', label: '银杏', labelEn: 'Ginkgo', color: '#ffcf4d' },
  { id: 'yinghua1', label: '樱花', labelEn: 'Sakura', color: '#ffc2d1' },
  { id: 'fengye', label: '枫叶', labelEn: 'Maple', color: '#f4a261' },
  { id: 'meihua', label: '梅花', labelEn: 'Plum', color: '#f7a8c4' },
  { id: 'yumao', label: '羽毛', labelEn: 'Feather', color: '#dbeafe' },
  { id: 'xingxing', label: '星星', labelEn: 'Star', color: '#ffe082' }
]

export interface CursorOption {
  id: string
  label: string
  labelEn: string
  /** 系统光标值；arrow / dot / ring / target 由主题色动态生成 SVG */
  css: string
}

// 鼠标样式预设（arrow / dot / ring / target 的颜色跟随主题色）
export const CURSOR_OPTIONS: CursorOption[] = [
  { id: 'default', label: '系统默认', labelEn: 'System', css: 'auto' },
  { id: 'arrow', label: '精致箭头', labelEn: 'Arrow', css: '' },
  { id: 'dot', label: '主题圆点', labelEn: 'Dot', css: '' },
  { id: 'ring', label: '主题光环', labelEn: 'Ring', css: '' },
  { id: 'target', label: '主题准星', labelEn: 'Target', css: '' },
  { id: 'crosshair', label: '系统十字', labelEn: 'Crosshair', css: 'crosshair' }
]

export interface AppearanceEffectDefaults {
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

export interface AppearanceDefaults {
  backgroundId: string
  fontId: string
  cursor: string
  accent: { h: number; s: number; l: number }
  effect: AppearanceEffectDefaults
}

const num = (key: string, fallback: number): number => {
  const value = Number(getEnvVar(key, String(fallback)))
  return Number.isFinite(value) ? value : fallback
}

const bool = (key: string, fallback: boolean): boolean =>
  (getEnvVar(key, String(fallback)) || '').trim().toLowerCase() === 'true'

const petalTypeList = (key: string, fallback: ScreensaverPetalType[]): ScreensaverPetalType[] => {
  const raw = (getEnvVar(key, '') || '').split(',').map(item => item.trim()).filter(Boolean)
  const valid = raw.filter((id): id is ScreensaverPetalType =>
    SCREENSAVER_PETALS.some(item => item.id === id))
  return valid.length > 0 ? valid : fallback
}

/**
 * 主题设置全部参数的默认值（首次访问 / 恢复默认时生效；浏览器中的用户配置优先）
 * 可直接修改数值，也可在 .env 中用对应键覆盖
 */
export const APPEARANCE_DEFAULTS: AppearanceDefaults = {
  // 默认背景 id（public/bg 下的文件名，不含扩展名；留空为无背景）
  backgroundId: getEnvVar('VITE_DEFAULT_BACKGROUND', ''),
  // 默认字体 id（见下方 fonts）
  fontId: getEnvVar('VITE_DEFAULT_FONT', 'system'),
  // 默认鼠标样式 id（见 CURSOR_OPTIONS）
  cursor: getEnvVar('VITE_DEFAULT_CURSOR', 'default'),
  // 默认主题色（HSL，l 对应 500 色阶）
  accent: {
    h: num('VITE_DEFAULT_ACCENT_H', 25),
    s: num('VITE_DEFAULT_ACCENT_S', 94),
    l: num('VITE_DEFAULT_ACCENT_L', 53)
  },
  // 页面特效与背景动效默认值
  effect: {
    autoRotate: bool('VITE_DEFAULT_AUTO_ROTATE', false),
    rotateInterval: num('VITE_DEFAULT_ROTATE_INTERVAL', 12),
    kenBurns: bool('VITE_DEFAULT_KEN_BURNS', false),
    overlay: num('VITE_DEFAULT_OVERLAY', 35),
    effectEnabled: bool('VITE_DEFAULT_EFFECT_ENABLED', true),
    petalTypes: petalTypeList('VITE_DEFAULT_PETAL_TYPES', ['yinxing','yinghua1']),
    petalCount: num('VITE_DEFAULT_PETAL_COUNT', 50),
    rotationSpeed: num('VITE_DEFAULT_ROTATION_SPEED', 1),
    horizontalSpeed: num('VITE_DEFAULT_HORIZONTAL_SPEED', 0.5),
    verticalSpeed: num('VITE_DEFAULT_VERTICAL_SPEED', 1.5),
    petalSwing: num('VITE_DEFAULT_PETAL_SWING', 60),
    petalZIndex: num('VITE_DEFAULT_PETAL_Z_INDEX', -5)
  }
}

/** 设置面板中各参数的可调范围 */
export const APPEARANCE_LIMITS = {
  overlay: { min: 0, max: 90, step: 5 },
  autoRotateInterval: { min: 5, max: 60, step: 1 },
  petalCount: { min: 6, max: 150, step: 1 },
  rotationSpeed: { min: 0, max: 5, step: 0.1 },
  horizontalSpeed: { min: -3, max: 3, step: 0.1 },
  verticalSpeed: { min: 0.1, max: 5, step: 0.1 },
  petalSwing: { min: 0, max: 160, step: 5 },
  petalZIndex: { min: -10, max: 999, step: 1 }
} as const

/** 字体样式表加载参数 */
export const FONT_LOADING = {
  /** 单个样式表超时（毫秒） */
  stylesheetTimeout: 8_000,
  /** 设置面板预览预加载并发数 */
  preloadConcurrency: 3
} as const

export const APPEARANCE_CONFIG: {
  fonts: AppearanceFont[]
  accents: AppearanceAccentPreset[]
  defaults: AppearanceDefaults
} = {
  // 在线字体：系统字体直接使用，其余为 npm 字体包（jsdmirror 主用，unpkg 降级）
  fonts: [
    {
      id: 'system',
      label: '系统默认',
      labelEn: 'System Default',
      family: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif',
      primary: '',
      files: []
    },
    {
      id: 'system-serif',
      label: '系统宋体',
      labelEn: 'System Serif',
      family: '"Songti SC", SimSun, STSong, serif',
      primary: '',
      files: []
    },
    {
      id: 'system-kai',
      label: '系统楷体',
      labelEn: 'System Kai',
      family: 'KaiTi, STKaiti, "Kaiti SC", serif',
      primary: '',
      files: []
    },
    {
      id: 'noto-sans',
      label: '思源黑体',
      labelEn: 'Noto Sans SC',
      family: '"Noto Sans SC", -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
      primary: 'Noto Sans SC',
      files: ['@fontsource/noto-sans-sc@5.3.1/400.css', '@fontsource/noto-sans-sc@5.3.1/700.css']
    },
    {
      id: 'noto-serif',
      label: '思源宋体',
      labelEn: 'Noto Serif SC',
      family: '"Noto Serif SC", "Songti SC", "SimSun", serif',
      primary: 'Noto Serif SC',
      files: ['@fontsource/noto-serif-sc@5.3.1/400.css', '@fontsource/noto-serif-sc@5.3.1/700.css']
    },
    {
      id: 'misans',
      label: '小米 MiSans',
      labelEn: 'MiSans',
      family: '"MiSans VF", -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
      primary: 'MiSans VF',
      files: ['misans@5.0.0/lib/Normal/MiSansVF.min.css']
    },
    {
      id: 'harmony',
      label: '鸿蒙 HarmonyOS Sans',
      labelEn: 'HarmonyOS Sans',
      family: '"HarmonyOS Sans SC", -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
      primary: 'HarmonyOS Sans SC',
      files: ['@lobehub/webfont-harmony-sans-sc@1.0.0/css/index.css']
    },
    {
      id: 'wenkai',
      label: '霞鹜文楷',
      labelEn: 'LXGW WenKai',
      family: '"LXGW WenKai", "KaiTi", "STKaiti", serif',
      primary: 'LXGW WenKai',
      files: ['lxgw-wenkai-webfont@1.7.0/lxgwwenkai-regular.css', 'lxgw-wenkai-webfont@1.7.0/lxgwwenkai-bold.css']
    },
    {
      id: 'smiley',
      label: '得意黑',
      labelEn: 'Smiley Sans',
      family: '"smiley-sans", "PingFang SC", "Microsoft YaHei", sans-serif',
      primary: 'smiley-sans',
      files: ['font-smiley-sans@1.0.0/style.css']
    },
    {
      id: 'zcool-kuaile',
      label: '站酷快乐体',
      labelEn: 'ZCOOL KuaiLe',
      family: '"ZCOOL KuaiLe", -apple-system, "PingFang SC", sans-serif',
      primary: 'ZCOOL KuaiLe',
      files: ['@fontsource/zcool-kuaile@5.3.0/400.css']
    },
    {
      id: 'zcool-xiaowei',
      label: '站酷小薇体',
      labelEn: 'ZCOOL XiaoWei',
      family: '"ZCOOL XiaoWei", "Songti SC", serif',
      primary: 'ZCOOL XiaoWei',
      files: ['@fontsource/zcool-xiaowei@5.3.0/400.css']
    },
    {
      id: 'ma-shan-zheng',
      label: '马善政楷书',
      labelEn: 'Ma Shan Zheng',
      family: '"Ma Shan Zheng", KaiTi, STKaiti, cursive',
      primary: 'Ma Shan Zheng',
      files: ['@fontsource/ma-shan-zheng@5.3.1/400.css']
    },
    {
      id: 'long-cang',
      label: '龙藏体',
      labelEn: 'Long Cang',
      family: '"Long Cang", KaiTi, cursive',
      primary: 'Long Cang',
      files: ['@fontsource/long-cang@5.3.0/400.css']
    }
  ],
  // 主题色预设（h/s/l 指向色阶 500）
  accents: [
    { id: 'orange', label: '暖橙', labelEn: 'Amber', h: 25, s: 94, l: 53 },
    { id: 'rose', label: '玫瑰', labelEn: 'Rose', h: 344, s: 82, l: 56 },
    { id: 'violet', label: '紫罗兰', labelEn: 'Violet', h: 262, s: 80, l: 58 },
    { id: 'blue', label: '碧海', labelEn: 'Ocean', h: 212, s: 92, l: 52 },
    { id: 'cyan', label: '青碧', labelEn: 'Cyan', h: 188, s: 88, l: 42 },
    { id: 'green', label: '松石', labelEn: 'Jade', h: 158, s: 72, l: 42 }
  ],
  defaults: APPEARANCE_DEFAULTS
}
