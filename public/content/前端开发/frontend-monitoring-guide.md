---
title: 前端监控与错误追踪方案
date: 2026-05-17
cover: https://picsum.photos/seed/frontend-monitoring/800/400
desc: 从错误捕获到性能监控，构建完整的前端监控体系
tags: [前端监控, 错误追踪, 性能优化, 生产环境]
---

## 为什么需要前端监控

后端有完善的日志和 APM，但前端往往是盲区。用户遇到白屏、按钮点击无响应、页面加载慢——如果没有监控，你永远不会知道。

## 监控体系全景

```
前端监控体系
├── 错误监控
│   ├── JavaScript 运行时错误
│   ├── Promise 未捕获异常
│   ├── 资源加载错误
│   └── 框架错误（Vue/React）
├── 性能监控
│   ├── 页面加载性能
│   ├── 运行时性能
│   └── 网络请求性能
├── 用户行为监控
│   ├── 页面访问 (PV/UV)
│   ├── 用户路径
│   └── 自定义事件
└── 数据上报
    ├── 实时上报
    ├── 批量上报
    └── 离线缓存
```

## 错误监控

### JavaScript 运行时错误

```typescript
// 全局错误捕获
window.addEventListener('error', (event: ErrorEvent) => {
  const error = {
    type: 'js_error',
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  }
  
  reportError(error)
}, true)
```

### Promise 未捕获异常

```typescript
window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  const error = {
    type: 'unhandled_rejection',
    message: event.reason?.message || String(event.reason),
    stack: event.reason?.stack,
    timestamp: Date.now(),
    url: window.location.href,
  }
  
  reportError(error)
  // 阻止默认的 console 输出
  event.preventDefault()
})
```

### 资源加载错误

```typescript
window.addEventListener('error', (event) => {
  const target = event.target as HTMLElement
  
  // 只处理资源加载错误，不处理 JS 运行时错误
  if (target !== window) {
    const error = {
      type: 'resource_error',
      tagName: target.tagName,
      src: (target as HTMLScriptElement).src || (target as HTMLLinkElement).href,
      timestamp: Date.now(),
      url: window.location.href,
    }
    
    reportError(error)
  }
}, true) // 注意：使用捕获阶段
```

### Vue 错误处理

```typescript
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  const error = {
    type: 'vue_error',
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    component: instance?.$options?.name,
    info, // 错误来源（render、watch 等）
    timestamp: Date.now(),
    url: window.location.href,
  }
  
  reportError(error)
}

app.mount('#app')
```

### React 错误边界

```tsx
import React, { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportError({
      type: 'react_error',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now(),
      url: window.location.href,
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback />
    }
    return this.props.children
  }
}

// 使用
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

## 性能监控

### Web Vitals

```typescript
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals'

// Cumulative Layout Shift - 累积布局偏移
onCLS(({ value }) => {
  reportMetric({ type: 'CLS', value })
})

// First Input Delay - 首次输入延迟
onFID(({ value }) => {
  reportMetric({ type: 'FID', value })
})

// First Contentful Paint - 首次内容绘制
onFCP(({ value }) => {
  reportMetric({ type: 'FCP', value })
})

// Largest Contentful Paint - 最大内容绘制
onLCP(({ value }) => {
  reportMetric({ type: 'LCP', value })
})

// Time to First Byte - 首字节时间
onTTFB(({ value }) => {
  reportMetric({ type: 'TTFB', value })
})
```

### 性能指标参考

| 指标 | 良好 | 需要改进 | 差 |
|------|------|---------|-----|
| LCP | < 2.5s | 2.5-4s | > 4s |
| FID | < 100ms | 100-300ms | > 300ms |
| CLS | < 0.1 | 0.1-0.25 | > 0.25 |
| FCP | < 1.8s | 1.8-3s | > 3s |
| TTFB | < 800ms | 800-1800ms | > 1800ms |

### 自定义性能测量

```typescript
// 测量函数执行时间
function measurePerformance(name: string, fn: Function) {
  const start = performance.now()
  const result = fn()
  const duration = performance.now() - start
  
  reportMetric({
    type: 'custom',
    name,
    value: duration,
    timestamp: Date.now(),
  })
  
  return result
}

// 使用 Performance API 测量页面导航
const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
if (navigation) {
  reportMetric({
    type: 'navigation',
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    ttfb: navigation.responseStart - navigation.requestStart,
    download: navigation.responseEnd - navigation.responseStart,
    domReady: navigation.domContentLoadedEventEnd - navigation.navigationStart,
    load: navigation.loadEventEnd - navigation.navigationStart,
  })
}
```

## 用户行为追踪

### 页面访问

```typescript
// SPA 路由变化监听
function trackPageView() {
  const { pathname, search, hash } = window.location
  
  reportEvent({
    type: 'page_view',
    path: pathname + search + hash,
    title: document.title,
    referrer: document.referrer,
    timestamp: Date.now(),
  })
}

// Vue Router
router.afterEach(() => {
  trackPageView()
})

// React Router
useEffect(() => {
  trackPageView()
}, [location])
```

### 自定义事件

```typescript
// 按钮点击
function trackClick(element: HTMLElement, label: string) {
  reportEvent({
    type: 'click',
    label,
    element: element.tagName,
    text: element.textContent?.trim(),
    timestamp: Date.now(),
  })
}

// 搜索行为
function trackSearch(query: string, resultCount: number) {
  reportEvent({
    type: 'search',
    query,
    resultCount,
    timestamp: Date.now(),
  })
}
```

## 数据上报策略

### 基础上报函数

```typescript
function reportError(error: Record<string, any>) {
  sendToServer('/api/monitor/error', error)
}

function reportMetric(metric: Record<string, any>) {
  sendToServer('/api/monitor/metric', metric)
}

function reportEvent(event: Record<string, any>) {
  sendToServer('/api/monitor/event', event)
}
```

### 使用 sendBeacon 可靠上报

```typescript
function sendToServer(url: string, data: Record<string, any>) {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  
  // 优先使用 sendBeacon（页面卸载时也能发送）
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, blob)
  } else {
    // 降级为 fetch
    fetch(url, {
      method: 'POST',
      body: blob,
      keepalive: true,
    })
  }
}
```

### 批量上报

```typescript
class ErrorReporter {
  private queue: any[] = []
  private maxQueueSize = 10
  private flushInterval: number

  constructor() {
    // 每 5 秒刷新一次
    this.flushInterval = window.setInterval(() => this.flush(), 5000)
  }

  push(error: any) {
    this.queue.push(error)
    
    // 队列满了立即上报
    if (this.queue.length >= this.maxQueueSize) {
      this.flush()
    }
  }

  flush() {
    if (this.queue.length === 0) return
    
    const batch = this.queue.splice(0, this.maxQueueSize)
    sendToServer('/api/monitor/batch', { errors: batch })
  }

  destroy() {
    clearInterval(this.flushInterval)
    this.flush() // 页面关闭前上报剩余数据
  }
}
```

## 监控平台选型

### 自建 vs 第三方

| 方案 | 优点 | 缺点 | 适合场景 |
|------|------|------|---------|
| 自建 (Sentry 自建) | 数据可控、无费用上限 | 运维成本高 | 有运维团队 |
| Sentry SaaS | 功能完善、集成简单 | 有费用上限 | 中小团队 |
| 阿里云 ARMS | 国内访问快、生态整合 | 绑定阿里云 | 阿里云用户 |
| 腾讯云 RUM | 国内访问快 | 功能相对简单 | 腾讯云用户 |

### Sentry 集成示例

```bash
npm install @sentry/vue @sentry/tracing
```

```typescript
import * as Sentry from '@sentry/vue'
import { createApp } from 'vue'

const app = createApp(App)

Sentry.init({
  app,
  dsn: 'https://your-dsn@sentry.io/your-project',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 0.1, // 10% 的采样率
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0, // 错误时 100% 录制
})
```

## 监控告警

### 告警规则建议

| 规则 | 阈值 | 通知方式 |
|------|------|---------|
| JS 错误率突增 | 5 分钟内错误率 > 5% | 钉钉/企微 |
| 页面加载过慢 | P75 LCP > 4s | 邮件 |
| 特定页面错误集中 | 单页面错误占比 > 30% | 钉钉/企微 |
| API 错误率 | 5 分钟内 > 10% | 电话 + 钉钉 |

## 总结

前端监控不是一蹴而就的，建议分阶段建设：

1. **第一阶段**：错误捕获 + 基础上报（1-2 天）
2. **第二阶段**：性能监控 + 用户行为（1 周）
3. **第三阶段**：告警规则 + 数据看板（1-2 周）
4. **第四阶段**：用户会话回放 + 智能分析（持续优化）

有了监控，你不再是"用户说有问题才知道有问题"，而是主动发现和解决问题。
