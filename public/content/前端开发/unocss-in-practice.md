---
title: UnoCSS 实战指南：从零开始构建原子化 CSS 项目
date: 2026-05-16
cover: https://picsum.photos/seed/unocss-guide/800/400
desc: 学习 UnoCSS 的配置、自定义规则、预设系统及性能优化策略
tags: [UnoCSS, 原子化CSS, 前端工程化, Vite]
---

## 什么是 UnoCSS？

UnoCSS 是一个高性能的即时原子化 CSS 引擎。核心理念是"按需生成"——你只使用在代码中实际出现的 CSS，没有预定义的 CSS 框架文件。

**与 Tailwind CSS 的核心区别**：Tailwind 是预先定义好的框架，UnoCSS 是引擎——你定义规则，它按需生成。这使得 UnoCSS 极其灵活且轻量。

## 快速开始

### 在 Vite 项目中集成

```bash
npm install -D unocss
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [UnoCSS()]
})
```

```ts
// uno.config.ts
import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),          // 默认预设（类似 Tailwind）
    presetAttributify(),  // 属性化模式
    presetIcons(),        // 图标支持
  ],
  shortcuts: {
    'btn': 'px-4 py-2 rounded-lg font-semibold text-white transition-all',
    'btn-primary': 'btn bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
    'btn-danger': 'btn bg-red-500 hover:bg-red-600 active:bg-red-700',
    'card': 'bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6',
    'page-container': 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',
  }
})
```

```ts
// main.ts
import 'virtual:uno.css'
```

## 核心概念

### 原子化类名

UnoCSS 使用语义化的类名组合来描述样式：

```html
<!-- 传统 CSS -->
<div class="card">
  <h2 class="card-title">标题</h2>
  <p class="card-desc">描述文字</p>
</div>

<!-- UnoCSS 原子化 -->
<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
  <h2 class="text-xl font-bold text-gray-900 dark:text-white">标题</h2>
  <p class="text-gray-600 dark:text-gray-300 leading-relaxed">描述文字</p>
</div>
```

### 响应式前缀

```html
<!-- 默认值为移动端，sm/md/lg/xl/2xl 逐级覆盖 -->
<div class="
  text-sm             <!-- 移动端 -->
  md:text-base        <!-- 平板及以上 -->
  lg:text-lg          <!-- 桌面及以上 -->
  grid-cols-1         <!-- 移动端 -->
  sm:grid-cols-2      <!-- 小屏 -->
  lg:grid-cols-3      <!-- 大屏 -->
  xl:grid-cols-4      <!-- 超大屏 -->
"></div>
```

### 暗黑模式

```html
<div class="
  bg-white            <!-- 亮色模式 -->
  dark:bg-gray-900    <!-- 暗色模式 -->
  text-gray-900       <!-- 亮色模式 -->
  dark:text-white     <!-- 暗色模式 -->
  border-gray-200
  dark:border-gray-700
">
  <p class="text-gray-600 dark:text-gray-300">内容</p>
</div>
```

## 属性化模式

UnoCSS 的 `presetAttributify` 允许将类名拆分为 HTML 属性：

```html
<!-- 传统写法 -->
<button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
  按钮
</button>

<!-- 属性化写法 -->
<button
  px-4 py-2
  bg="blue-500 hover:blue-600"
  text="white"
  rounded-lg
>
  按钮
</button>
```

## 图标系统

UnoCSS 的图标方案极为优雅——按需加载，无需额外引入：

```bash
npm install -D @iconify-json/carbon @iconify-json/mdi
```

```html
<!-- 直接使用图标 -->
<span class="i-carbon-home text-2xl" />
<span class="i-mdi-github text-2xl text-gray-600" />
<span class="i-carbon-sun dark:i-carbon-moon text-xl" />
```

图标可以像文字一样通过 CSS 控制大小和颜色，比字体图标更高效。

## 自定义规则

### 简单规则

```ts
// uno.config.ts
export default defineConfig({
  rules: [
    ['m-1', { margin: '0.25rem' }],
    ['flex-center', { display: 'flex', 'align-items': 'center', 'justify-content': 'center' }],
    ['text-gradient', {
      'background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      '-webkit-background-clip': 'text',
      '-webkit-text-fill-color': 'transparent',
    }],
  ]
})
```

### 动态规则

```ts
export default defineConfig({
  rules: [
    [/^m-(\d+)$/, ([, d]) => ({ margin: `${d / 4}rem` })],
    [/^p-(\d+)$/, ([, d]) => ({ padding: `${d / 4}rem` })],
    [/^fs-(\d+)$/, ([, size]) => ({ 'font-size': `${size}px` })],
    // 自定义动画
    [/^animate-duration-(\d+)$/, ([, d]) => ({
      'animation-duration': `${d}ms`
    })],
  ]
})
```

## 预设系统

### 官方预设

```ts
export default defineConfig({
  presets: [
    presetUno(),         // 基础工具类（必选）
    presetAttributify(), // 属性化模式
    presetIcons(),       // 图标
    presetTypography(),  // 排版
    presetMini(),        // 轻量版本
    presetWind(),        // Tailwind 兼容
  ]
})
```

### 自定义预设

```ts
// presets/my-preset.ts
import { definePreset } from 'unocss'

export const presetMyUI = definePreset({
  name: 'my-ui-preset',
  rules: [
    ['btn-base', { /* ... */ }],
    // ...
  ],
  shortcuts: {
    'btn': 'btn-base px-4 py-2 rounded-lg',
    'input': 'border border-gray-300 rounded-lg px-3 py-2',
    'card': 'bg-white rounded-xl shadow-md p-6',
  },
  variants: [
    // 自定义变体
  ]
})
```

```ts
// uno.config.ts
import { presetMyUI } from './presets/my-preset'

export default defineConfig({
  presets: [presetUno(), presetMyUI()]
})
```

## Shortcuts 最佳实践

Shortcuts 用于组合常用样式组合：

```ts
export default defineConfig({
  shortcuts: [
    // 基础组件
    { 'btn': 'inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2' },
    { 'btn-primary': 'btn bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' },
    { 'btn-secondary': 'btn bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400' },
    { 'btn-ghost': 'btn text-gray-600 hover:bg-gray-100 focus:ring-gray-300' },

    // 布局
    { 'container': 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
    { 'section': 'py-12 sm:py-16 lg:py-20' },

    // 排版
    { 'h1': 'text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white' },
    { 'h2': 'text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white' },
    { 'body': 'text-base leading-relaxed text-gray-600 dark:text-gray-300' },
  ]
})
```

在模板中：

```html
<button class="btn-primary">提交</button>
<button class="btn-ghost">取消</button>
<h1 class="h1">页面标题</h1>
```

## 性能优化

UnoCSS 的设计目标就是极致的性能：

### 按需生成

UnoCSS 只会为实际使用的工具类生成 CSS。一个典型的项目生成 10-20KB 的 CSS，而非框架的几百 KB。

### 扫描配置

```ts
export default defineConfig({
  // 指定扫描范围，提高构建性能
  content: {
    pipeline: {
      include: [
        /\.(vue|html|jsx|tsx?|mdx?)($|\?)/
      ],
      exclude: []
    }
  }
})
```

### 自动重置样式

```bash
npm install @unocss/reset
```

```ts
// main.ts
import '@unocss/reset/tailwind-compat.css'
```

## 实战：构建一个完整的 UI 卡片

```html
<article class="
  card
  max-w-sm mx-auto
  group
  cursor-pointer
  transition-transform duration-300
  hover:-translate-y-1
">
  <!-- 封面图片 -->
  <div class="relative overflow-hidden rounded-t-xl">
    <img
      src="/img/cover.jpg"
      alt="Card cover"
      class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
    />
    <span class="
      absolute top-3 left-3
      px-2 py-1 rounded-full
      text-xs font-semibold
      bg-white/90 dark:bg-gray-800/90
      text-gray-700 dark:text-gray-200
      backdrop-blur-sm
    ">
      Featured
    </span>
  </div>

  <!-- 内容 -->
  <div class="p-5 space-y-3">
    <!-- 标签 -->
    <div class="flex gap-2">
      <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
        Vue
      </span>
      <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
        UnoCSS
      </span>
    </div>

    <!-- 标题 -->
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
      UnoCSS 实战指南：从零开始构建原子化 CSS 项目
    </h3>

    <!-- 摘要 -->
    <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
      深入理解 UnoCSS 的配置、自定义规则、预设系统及性能优化策略...
    </p>

    <!-- 底部信息 -->
    <div class="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
      <span class="text-xs text-gray-400">2026-05-16</span>
      <span class="text-xs text-gray-400">5 分钟阅读</span>
    </div>
  </div>
</article>
```

## 总结

UnoCSS 代表了 CSS 框架发展的新方向——引擎化而非框架化。它带来的核心价值：

1. **极小的产物体积**：只生成用到的 CSS，典型项目仅 10-20KB
2. **零运行时**：构建时完成，无 JavaScript 运行时开销
3. **完全可自定义**：规则、预设、快捷键，全部由你定义
4. **开发体验出色**：IDE 支持、属性化模式、图标即用
5. **与 Vite 深度集成**：热更新即时生效

对于新项目，UnoCSS 是一个非常值得尝试的 CSS 解决方案，尤其是当你追求极致的性能和灵活性时。
