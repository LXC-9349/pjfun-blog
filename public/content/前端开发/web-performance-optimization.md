---
title: Web 性能优化实战：从 Lighthouse 60 到 95 的完整记录
date: 2026-05-17
cover: https://picsum.photos/seed/web-perf-opt/800/400
desc: 记录一次真实的 Web 性能优化过程——从 Lighthouse 评分 60 到 95，涵盖 Core Web Vitals、资源加载策略、渲染优化等实战技巧
tags: [性能优化, Core Web Vitals, Lighthouse, 前端工程化]
---

## 背景

我们团队负责的一个电商 H5 页面，上线后 Lighthouse Performance 评分只有 62。用户反馈"打开慢"、"滑动卡顿"。老板给了两周时间优化，目标：Performance 评分 ≥ 90。

这篇文章记录了完整的优化过程，包括每一步做了什么、效果如何、踩了什么坑。

## 第一步：诊断——找到真正的瓶颈

很多人拿到性能问题就开始"优化"——压缩图片、加 CDN、上懒加载。但如果你不知道瓶颈在哪，这些优化可能毫无意义。

### 用 Lighthouse 做基线测试

```bash
# CLI 方式
npx lighthouse https://your-site.com --view --output=html

# 或者在 Chrome DevTools 中直接运行
```

我们的初始数据：

| 指标 | 初始值 | 目标值 |
|------|--------|--------|
| FCP (首次内容绘制) | 3.2s | < 1.8s |
| LCP (最大内容绘制) | 5.8s | < 2.5s |
| TBT (总阻塞时间) | 890ms | < 200ms |
| CLS (累积布局偏移) | 0.35 | < 0.1 |
| Speed Index | 4.5s | < 3.4s |

### 用 Performance 面板看时间线

Chrome DevTools → Performance → Record → 刷新页面。重点关注：

1. **Main 线程的长任务**（红色三角标记）：每个超过 50ms 的任务都会阻塞用户交互
2. **Network 瀑布图**：哪些资源在串行加载？哪些可以并行？
3. **Rendering 帧率**：是否有掉帧（低于 60fps）？

我们的发现：
- 首屏加载了 3.2MB 的 JS（未 tree-shaking）
- 首屏图片 8 张，总计 1.8MB，未压缩
- 第三方脚本（统计、客服、广告）阻塞了主线程 1.2s
- 字体文件 4 个，每个 200KB+，阻塞了文字渲染

## 第二步：资源优化——立竿见影的效果

### 图片优化

这是投入产出比最高的一步。

```bash
# 使用 sharp 批量压缩
npm install -D sharp

# 脚本示例
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const images = fs.readdirSync('./public/images')
for (const img of images) {
  await sharp(`./public/images/${img}`)
    .resize(800, 400, { fit: 'cover' })
    .webp({ quality: 80 })
    .toFile(`./public/images/${path.parse(img).name}.webp`)
}
```

效果：
- 8 张首屏图片从 1.8MB → 320KB（WebP 格式）
- 使用 `<picture>` 标签做降级：

```html
<picture>
  <source srcset="/img/hero.webp" type="image/webp">
  <source srcset="/img/hero.jpg" type="image/jpeg">
  <img src="/img/hero.jpg" alt="Hero" loading="eager" fetchpriority="high">
</picture>
```

关键技巧：
- 首屏图片用 `loading="eager"` + `fetchpriority="high"`
- 非首屏图片用 `loading="lazy"`
- 所有图片设置 `width` 和 `height` 属性，防止 CLS

### 字体优化

```css
/* 使用 font-display: swap 避免 FOIT */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap;
  font-weight: 400;
  font-style: normal;
}

/* 预加载关键字体 */
<link rel="preload" href="/fonts/custom.woff2" as="font" crossorigin>
```

效果：文字不再等待字体加载完成才显示，FCP 从 3.2s → 1.9s。

### JS/CSS 优化

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 按 vendor 分包
        manualChunks: {
          vue: ['vue', 'vue-router'],
          utils: ['lodash-es', 'dayjs'],
        }
      }
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      }
    }
  }
})
```

效果：主 JS bundle 从 3.2MB → 680KB。

## 第三步：加载策略优化——让关键资源先跑

### 资源优先级矩阵

| 资源类型 | 优先级 | 策略 |
|----------|--------|------|
| 首屏 CSS | 最高 | `<link rel="stylesheet">` 内联关键 CSS |
| 首屏 JS | 高 | `<script type="module">` |
| 首屏图片 | 高 | `fetchpriority="high"` |
| 非首屏 JS | 中 | `defer` 或动态 `import()` |
| 第三方脚本 | 低 | `requestIdleCallback` 延迟加载 |
| 非首屏图片 | 低 | `loading="lazy"` |

### 关键 CSS 内联

```html
<head>
  <!-- 内联首屏必需的 CSS -->
  <style>
    /* 只包含首屏可见元素的样式 */
    .header, .hero, .nav { /* ... */ }
  </style>
  
  <!-- 非关键 CSS 异步加载 -->
  <link rel="preload" href="/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/css/main.css"></noscript>
</head>
```

### 第三方脚本延迟加载

```javascript
// 不要在 HTML 中直接放第三方 script 标签
// 改为在用户交互或空闲时加载

function loadThirdParty() {
  if (window.__thirdPartyLoaded) return
  
  const script = document.createElement('script')
  script.src = 'https://third-party.com/sdk.js'
  script.async = true
  document.head.appendChild(script)
  window.__thirdPartyLoaded = true
}

// 方案一：用户交互时加载
document.querySelector('.chat-btn')?.addEventListener('click', loadThirdParty)

// 方案二：页面空闲时加载
if ('requestIdleCallback' in window) {
  requestIdleCallback(loadThirdParty, { timeout: 5000 })
} else {
  setTimeout(loadThirdParty, 3000)
}
```

效果：TBT 从 890ms → 120ms。

## 第四步：渲染优化——消除卡顿

### 避免长任务

任何超过 50ms 的同步任务都会阻塞主线程。解决方案：

```javascript
// 差：一次性处理大量数据
function processLargeData(data) {
  return data.map(transform).filter(valid).sort(compare)
}

// 好：分块处理
async function processLargeDataInChunks(data, chunkSize = 100) {
  const results = []
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)
    results.push(...chunk.map(transform).filter(valid))
    // 让出主线程
    await new Promise(resolve => setTimeout(resolve, 0))
  }
  return results.sort(compare)
}

// 更好：使用 Scheduler API（Chrome 115+）
async function processWithScheduler(data) {
  const results = []
  for (const item of data) {
    if (navigator.scheduling?.isInputPending?.()) {
      // 有用户输入待处理，让出主线程
      await new Promise(resolve => setTimeout(resolve, 0))
    }
    results.push(transform(item))
  }
  return results
}
```

### 虚拟列表

当列表项超过 100 个时，考虑虚拟滚动：

```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref(Array.from({ length: 10000 }, (_, i) => ({ id: i, text: `Item ${i}` })))
const itemHeight = 48
const containerHeight = 600
const scrollTop = ref(0)

const visibleItems = computed(() => {
  const start = Math.floor(scrollTop.value / itemHeight)
  const end = Math.min(start + Math.ceil(containerHeight / itemHeight) + 2, items.value.length)
  return items.value.slice(start, end).map((item, idx) => ({
    ...item,
    top: (start + idx) * itemHeight
  }))
})

const totalHeight = items.value.length * itemHeight
</script>

<template>
  <div class="virtual-list" :style="{ height: containerHeight + 'px' }" @scroll="e => scrollTop = e.target.scrollTop">
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <div
        v-for="item in visibleItems"
        :key="item.id"
        :style="{ position: 'absolute', top: item.top + 'px', height: itemHeight + 'px' }"
      >
        {{ item.text }}
      </div>
    </div>
  </div>
</template>
```

### 使用 `content-visibility` 优化长页面

```css
/* 对非首屏区块使用 content-visibility */
.below-fold {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px; /* 预估高度，防止 CLS */
}
```

## 第五步：缓存策略——让第二次访问飞快

### HTTP 缓存头

```nginx
# nginx 配置
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
  # 带 hash 的文件：缓存一年
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location / {
  # HTML 文件：不缓存或短时间缓存
  expires 0;
  add_header Cache-Control "no-cache, must-revalidate";
}
```

### Service Worker 缓存

```javascript
// 使用 workbox
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// 静态资源：缓存优先
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })
    ]
  })
)

// API 请求：网络优先
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3
  })
)
```

## 最终结果

| 指标 | 优化前 | 优化后 | 改善 |
|------|--------|--------|------|
| FCP | 3.2s | 1.1s | ↓ 66% |
| LCP | 5.8s | 1.8s | ↓ 69% |
| TBT | 890ms | 85ms | ↓ 90% |
| CLS | 0.35 | 0.02 | ↓ 94% |
| JS 体积 | 3.2MB | 680KB | ↓ 79% |
| 图片体积 | 1.8MB | 320KB | ↓ 82% |
| **Lighthouse Performance** | **62** | **95** | **+33** |

## 经验总结

1. **先测量再优化**：没有数据支撑的优化是盲猜
2. **图片优化 ROI 最高**：大多数网站的图片占了加载体积的 60%+
3. **第三方脚本是隐形杀手**：一个统计脚本可能比你的业务代码还慢
4. **缓存是免费的性能提升**：第二次访问应该比第一次快 10 倍
5. **性能优化不是一次性的**：把它加入 CI，设置性能预算，每次 PR 自动检查

```javascript
// 在 CI 中加入 Lighthouse CI
// .lighthouserc.json
{
  "ci": {
    "collect": { "url": ["http://localhost:3000"] },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }]
      }
    }
  }
}
```

性能优化是一场马拉松，不是冲刺。建立监控、设置预算、持续改进——这才是长期有效的策略。
