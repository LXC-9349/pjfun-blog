import {defineConfig} from 'unocss'
import {presetWind3, presetIcons, transformerVariantGroup, transformerDirectives} from 'unocss'

// 主题色由 CSS 变量驱动（见 src/utils/appearance.ts），支持运行时动态调整
// <alpha-value> 占位符让 bg-orange-500/20、from-orange-500 等透明度变体同样生效
const accent = (step: string) => `rgb(var(--accent-${step}) / <alpha-value>)`
const accentAlt = (step: string) => `rgb(var(--accent-alt-${step}) / <alpha-value>)`

const accentScale = {
    50: accent('50'),
    100: accent('100'),
    200: accent('200'),
    300: accent('300'),
    400: accent('400'),
    500: accent('500'),
    600: accent('600'),
    700: accent('700'),
    800: accent('800'),
    900: accent('900'),
    950: accent('950'),
}

// 用于渐变搭配的次级色（色相轻微偏移）
const accentAltScale = {
    50: accentAlt('50'),
    100: accentAlt('100'),
    200: accentAlt('200'),
    300: accentAlt('300'),
    400: accentAlt('400'),
    500: accentAlt('500'),
    600: accentAlt('600'),
    700: accentAlt('700'),
    800: accentAlt('800'),
    900: accentAlt('900'),
    950: accentAlt('950'),
}

export default defineConfig({
    presets: [
        presetWind3(),
        presetIcons({
            scale: 1.2,
            extraProperties: {
                'display': 'inline-block',
                'vertical-align': 'middle',
            }
        }),
    ],
    transformers: [transformerVariantGroup(), transformerDirectives()],
    shortcuts: {
        'flex-center': 'flex items-center justify-center',
        'absolute-center': 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
        'card': 'bg-white dark:bg-gray-800 rounded-xl shadow-sm',
        'btn': 'px-6 py-3 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors',
        'btn-secondary': 'px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors',
        // 常用工具类（line-clamp-* 与 scrollbar-hide 由下方 rules 实现）
        'toc-scrollbar': 'overflow-y-auto',
        // 页面级复用组件
        'sticky-header': 'sticky top-0 z-50 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-colors duration-300',
        'scroll-top-btn': 'fixed bottom-20 lg:bottom-8 right-8 p-3 flex-center bg-gray-900 dark:bg-gray-700 text-white rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95 z-50 cursor-pointer',
        // 图标按钮
        'icon-btn': 'w-10 h-10 flex-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer',
        'icon-btn-sm': 'w-9 h-9 flex-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer',
        // PDF 工具栏按钮
        'pdf-toolbar-btn': 'flex-center w-9 h-9 border-none bg-transparent text-gray-700 dark:text-gray-300 rounded cursor-pointer transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed',
        // 图标徽章（暖橙渐变）
        'badge': 'w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex-center',
        // 玻璃态导航栏按钮（header 工具栏统一风格：无边框、悬停浅底 + 主色）
        'glass-nav-btn': 'w-9 h-9 flex-center rounded-lg border border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer',
        // 主题切换按钮
        'theme-toggle-btn': 'w-9 h-9 flex-center rounded-lg border border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer',
        // 卡片链接包装器（不设置 display，避免覆盖内部的 flex 布局）
        'card-link': 'cursor-pointer',
        // 文章卡片：高不透明度背景（不用 backdrop-blur，避免滚动时每帧重算背景模糊）
        'article-card': 'relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white/95 dark:bg-gray-800/95 shadow-sm hover:shadow-xl hover:-translate-y-0.5 hover:border-orange-200 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer',
        // 文章卡片标签胶囊（跟随主题色）
        'article-tag': 'px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200',
    },
    rules: [
        // .line-clamp-2 的多行截断
        [/^line-clamp-(\d+)$/, ([, line]) => ({
            'overflow': 'hidden',
            'display': '-webkit-box',
            '-webkit-line-clamp': line,
            '-webkit-box-orient': 'vertical',
        })],
        // .scrollbar-hide
        ['scrollbar-hide', {
            '-ms-overflow-style': 'none',
            'scrollbar-width': 'none',
        }],
        ['scrollbar-hide::-webkit-scrollbar', {
            'display': 'none',
        }],
        // 美化滚动条
        ['toc-scrollbar', {
            'overflow-y': 'auto',
        }],
        ['toc-scrollbar::-webkit-scrollbar', {
            'width': '4px',
        }],
        ['toc-scrollbar::-webkit-scrollbar-track', {
            'background': 'transparent',
        }],
        ['toc-scrollbar::-webkit-scrollbar-thumb', {
            'background': '#d8c8b6',
            'border-radius': '4px',
        }],
        ['.dark .toc-scrollbar::-webkit-scrollbar-thumb', {
            'background': '#3d352e',
        }],
        // ease-out-back 弹性曲线
        ['ease-out-back', {
            'transition-timing-function': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }],
    ],
    theme: {
        colors: {
            // 主色：随主题色设置实时变化
            primary: accent('500'),
            // 主色色阶：接管 orange，使全站暖橙元素跟随主题色
            orange: accentScale,
            // 次级色阶：接管 amber，用于渐变另一端的搭配色
            amber: accentAltScale,
            // 暖色灰阶：替换默认冷灰，让亮色主题整体呈现暖色调
            gray: {
                50: '#faf7f2',
                100: '#f4eee5',
                200: '#e9dfd2',
                300: '#d8c8b6',
                400: '#b3a08b',
                500: '#927d68',
                600: '#766354',
                700: '#5c4d41',
                800: '#3a312a',
                900: '#241e19',
                950: '#16120f',
            },
            // 暗色模式专用深色板（暖黑）
            dark: {
                50: '#f8f5f1',
                100: '#efe9e1',
                200: '#d9cdbe',
                300: '#4a4038',
                400: '#3d352e',
                500: '#332c26',
                600: '#2b251f',
                700: '#241f1a',
                800: '#1d1915',
                900: '#16120f',
                950: '#0f0c0a',
            },
        },
        animation: {
            keyframes: {
                'fade-in': '{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}',
                'slide-up': '{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}',
                'scale-in': '{0%{opacity:0;transform:scale(0.9)}100%{opacity:1;transform:scale(1)}}',
            },
            durations: {
                'fade-in': '0.3s',
                'slide-up': '0.4s',
                'scale-in': '0.3s',
            },
            timingFns: {
                'fade-in': 'ease-out',
                'slide-up': 'ease-out',
            },
        }
    },
})
