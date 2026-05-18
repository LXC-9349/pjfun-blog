---
title: Web 无障碍（a11y）指南：不只是加分项，是基本要求
date: 2026-05-17
cover: https://picsum.photos/seed/a11y-guide/800/400
desc: 从实际开发角度讲解 Web 无障碍的核心概念、常见问题和修复方案，让你的网站对所有人可用
tags: [无障碍, a11y, HTML, 前端最佳实践]
---

## 为什么要在乎无障碍

全球有超过 10 亿人有某种形式的残障。在中国，这个数字超过 8500 万。如果你的网站不支持无障碍，意味着你在主动拒绝这部分用户。

但这不只是道德问题：

- **法律风险**：越来越多的国家和地区立法要求网站符合 WCAG 标准
- **商业价值**：无障碍做得好的网站，SEO 排名也更高（搜索引擎就是"盲人用户"）
- **用户体验**：无障碍改进通常让所有用户受益（比如清晰的对比度在强光下也更好读）

## WCAG 2.2 四个原则

WCAG（Web Content Accessibility Guidelines）是无障碍的国际标准，基于四个原则：

1. **可感知**（Perceivable）：信息不能只通过一种感官传递
2. **可操作**（Operable）：所有功能都能通过键盘操作
3. **可理解**（Understandable）：内容和操作方式清晰明确
4. **健壮**（Robust）：兼容各种辅助技术

## 最常见的问题和修复方案

### 1. 图片缺少 alt 文本

```html
<!-- 差：屏幕阅读器会读出文件名 -->
<img src="hero-banner-v2-final.png">

<!-- 差：alt 为空但有信息量 -->
<img src="chart.png" alt="">

<!-- 好：描述图片传达的信息 -->
<img src="chart.png" alt="2026年Q1销售额同比增长35%，其中移动端贡献了72%">

<!-- 装饰性图片：alt 为空 -->
<img src="decorative-line.svg" alt="" role="presentation">
```

**规则**：
- 信息性图片：alt 描述内容，不是描述图片本身
- 装饰性图片：alt="" 或 `role="presentation"`
- 图片中如果有文字，alt 中必须包含这些文字

### 2. 颜色对比度不足

```css
/* 差：灰色文字在白色背景上，对比度 2.5:1 */
.text-muted { color: #999; background: #fff; }

/* 好：对比度 7:1，符合 AAA 标准 */
.text-muted { color: #595959; background: #fff; }
```

**WCAG 标准**：
- AA 级：正常文字 ≥ 4.5:1，大文字（18px+ 或 14px bold）≥ 3:1
- AAA 级：正常文字 ≥ 7:1，大文字 ≥ 4.5:1

用 Chrome DevTools 检查：Elements → 选中元素 → Computed → 搜索 "contrast ratio"。

### 3. 表单缺少 label

```html
<!-- 差：只有 placeholder，不是 label -->
<input type="email" placeholder="请输入邮箱">

<!-- 好：关联的 label -->
<label for="email-input">邮箱地址</label>
<input type="email" id="email-input" required aria-describedby="email-hint">
<span id="email-hint">我们会发送验证邮件到您的邮箱</span>

<!-- 也可以：label 包裹 input -->
<label>
  邮箱地址
  <input type="email" required>
</label>
```

**规则**：每个表单控件必须有对应的 label。placeholder 不能替代 label——提交后 placeholder 消失，用户不知道自己填了什么。

### 4. 键盘导航失效

```html
<!-- 差：用 div 做按钮，键盘无法聚焦 -->
<div class="btn" onclick="submit()">提交</div>

<!-- 好：使用原生按钮 -->
<button type="button" onclick="submit()">提交</button>

<!-- 如果必须用 div（不推荐） -->
<div 
  class="btn" 
  role="button" 
  tabindex="0" 
  onclick="submit()"
  onkeydown="if(event.key==='Enter'||event.key===' ')submit()"
>
  提交
</div>
```

**规则**：
- 能用原生元素就用原生元素（`<button>`、`<a>`、`<input>`）
- 自定义交互元素需要 `role`、`tabindex` 和键盘事件
- 确保 Tab 键顺序符合视觉顺序

### 5. 焦点样式被移除

```css
/* 差：移除焦点样式 */
*:focus { outline: none; }

/* 好：自定义但保留可见焦点指示 */
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* 只对键盘导航显示焦点样式 */
button:focus:not(:focus-visible) {
  outline: none;
}
```

**规则**：永远不要完全移除 `outline`。如果设计需要，用 `:focus-visible` 替代——它只在键盘导航时显示焦点样式，鼠标点击时不显示。

## Vue 3 中的无障碍实践

### 自定义组件的无障碍

```vue
<!-- CustomCheckbox.vue -->
<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  label: { type: String, required: true },
  id: { type: String, required: true },
  description: String,
  error: String
})

const emit = defineEmits(['update:modelValue'])
const checked = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<template>
  <div class="custom-checkbox">
    <input
      type="checkbox"
      :id="id"
      :checked="checked"
      @change="checked = $event.target.checked"
      :aria-describedby="description ? `${id}-desc` : undefined"
      :aria-invalid="!!error"
      :aria-errormessage="error ? `${id}-error` : undefined"
    >
    <label :for="id">{{ label }}</label>
    <span v-if="description" :id="`${id}-desc`" class="description">
      {{ description }}
    </span>
    <span v-if="error" :id="`${id}-error`" class="error" role="alert">
      {{ error }}
    </span>
  </div>
</template>
```

### 动态内容的无障碍通知

```vue
<!-- ToastNotification.vue -->
<template>
  <!-- aria-live 告诉屏幕阅读器：这个区域的内容会动态变化 -->
  <div 
    role="status" 
    aria-live="polite" 
    class="toast-container"
  >
    <div v-for="toast in toasts" :key="toast.id" class="toast">
      {{ toast.message }}
    </div>
  </div>
</template>
```

`aria-live` 的两个值：
- `polite`：等屏幕阅读器读完当前内容再读新的
- `assertive`：立即打断当前朗读（用于紧急通知）

### 路由切换的无障碍

```vue
<!-- App.vue -->
<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const pageTitle = ref('')

watch(
  () => route.name,
  () => {
    // 路由切换后更新页面标题
    // 屏幕阅读器会朗读这个变化
    pageTitle.value = route.meta.title || ''
  }
)
</script>

<template>
  <!-- 这个区域会在路由切换时通知屏幕阅读器 -->
  <h1 class="sr-only" aria-live="polite">{{ pageTitle }}</h1>
  <router-view />
</template>

<style>
/* 屏幕阅读器可见但视觉上隐藏 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
```

## 自动化测试工具

### ESLint 插件

```bash
npm install -D eslint-plugin-jsx-a11y  # React
npm install -D eslint-plugin-vue-a11y  # Vue
```

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['vue-a11y'],
  extends: ['plugin:vue-a11y/recommended'],
}
```

### axe DevTools

Chrome 扩展，一键扫描当前页面的无障碍问题。比 Lighthouse 的 a11y 审计更详细。

### 手动测试清单

自动化工具只能发现约 30% 的无障碍问题。剩下的需要手动测试：

- [ ] 只用键盘能完成所有操作吗？
- [ ] 屏幕阅读器（NVDA / VoiceOver）朗读的内容有意义吗？
- [ ] 放大到 200% 后内容仍然可读吗？
- [ ] 关闭 CSS 后内容仍然有逻辑顺序吗？
- [ ] 颜色不是传达信息的唯一方式吗？

## 说两句

无障碍不是"做好了加分"的功能，而是"不做就扣分"的基本要求。它不应该在项目最后才想起来，而应该从第一天就融入开发流程。

好消息是：大多数无障碍改进只需要几分钟——加个 label、改个对比度、用对 HTML 元素。难的不是技术，是意识。
