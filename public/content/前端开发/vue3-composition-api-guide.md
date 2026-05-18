---
title: Vue 3 Composition API 深入理解与实战
date: 2026-05-16
cover: https://picsum.photos/seed/vue3-composition/800/400
desc: 全面解析 Vue 3 Composition API 的设计理念、核心 API 和实际应用场景
tags: [Vue3, Composition API, 前端框架, JavaScript]
---

## 前言

Vue 3 带来的最大变化之一就是 Composition API。它不仅是一种新的代码组织方式，更是一种思维方式的重塑。本文将深入探讨 Composition API 的核心概念、设计原理和实战技巧。

## Composition API vs Options API

### Options API 的局限性

在 Vue 2 中，我们使用 Options API 组织组件逻辑：

```vue
<script>
export default {
  data() {
    return { count: 0, users: [] }
  },
  computed: { ... },
  methods: { ... },
  watch: { ... }
}
</script>
```

当组件变得复杂时，同一个逻辑的关注点会分散在不同的选项中。例如，与"用户"相关的数据在 data 中，方法在 methods 中，侦听器在 watch 中——跨越数百行代码后，维护变得困难。

### Composition API 的优势

Composition API 允许我们按逻辑关注点组织代码：

```vue
<script setup>
import { ref, computed, watch } from 'vue'

// 用户逻辑 - 集中在一起
const users = ref([])
const loadUsers = async () => { /* ... */ }
const activeUsers = computed(() => users.value.filter(u => u.active))
watch(users, (newVal) => { console.log('users changed:', newVal.length) })

// 计数逻辑 - 集中在一起
const count = ref(0)
const doubleCount = computed(() => count.value * 2)
</script>
```

## 核心响应式 API 深入

### ref：基本类型的响应式

`ref` 用于包装基本类型值，通过 `.value` 访问：

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++  // 注意需要 .value
}
</script>

<template>
  <p>{{ count }}</p>  <!-- 模板中自动解包 -->
  <button @click="increment">+1</button>
</template>
```

**原理**：ref 创建了一个 Ref 对象，内部通过 getter/setter 实现依赖追踪。当 `.value` 被读取时收集依赖，被修改时触发更新。

### reactive：对象的响应式

`reactive` 接收一个对象，返回其响应式代理：

```vue
<script setup>
import { reactive } from 'vue'

const state = reactive({
  user: { name: 'Alice', age: 25 },
  settings: { theme: 'dark' }
})

// 深层响应，无需 .value
state.user.age = 26
state.settings.theme = 'light'
</script>
```

> **注意**：reactive 会深层解包所有嵌套 ref，但不能用于基本类型。解构会丢失响应性——需要 `toRefs`。

### ref vs reactive 选择原则

| 场景 | 推荐 |
|------|------|
| 基本类型值 | `ref` |
| 对象且需要解构 | `ref`（配合 `toRefs`） |
| 表单数据对象 | `reactive` |
| 需要重新赋值的变量 | `ref` |
| 复杂嵌套对象 | `reactive` |

### computed：派生状态

`computed` 创建基于其他响应式数据的派生状态：

```vue
<script setup>
import { ref, computed } from 'vue'

const price = ref(100)
const quantity = ref(2)

const total = computed(() => price.value * quantity.value)

// 可写的 computed
const fullName = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: (val) => {
    [firstName.value, lastName.value] = val.split(' ')
  }
})
</script>
```

**最佳实践**：computed 应该是纯函数，不产生副作用。需要副作用时使用 `watch`。

### watch：响应式副作用

Vue 3 的 watch 支持侦听多个来源、深层侦听和立即执行：

```vue
<script setup>
import { ref, watch } from 'vue'

const keyword = ref('')
const results = ref([])
const isSearching = ref(false)

// 基础用法
watch(keyword, (newVal, oldVal) => {
  console.log(`搜索词从 "${oldVal}" 变为 "${newVal}"`)
  searchAPI(newVal)
})

// 侦听多个来源
watch([keyword, isSearching], ([newKeyword, newSearching]) => {
  if (newSearching) fetchResults(newKeyword)
})

// 深层侦听 + 立即执行
watch(
  () => state.deeply.nested.value,
  (newVal, oldVal) => { /* ... */ },
  { deep: true, immediate: true }
)
</script>
```

### watchEffect：自动追踪

`watchEffect` 自动追踪其回调中使用的所有响应式依赖：

```vue
<script setup>
import { ref, watchEffect } from 'vue'

const userId = ref(1)
const userData = ref(null)

// 自动追踪 userId，变化时重新执行
watchEffect(async () => {
  const id = userId.value  // 追踪依赖
  userData.value = await fetchUser(id)
})
</script>
```

## 自定义 Hook：组合式函数的设计模式

组合式函数（Composable）是 Composition API 最强的复用机制：

### 基础示例：useCounter

```vue
<script setup>
// useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const doubleCount = computed(() => count.value * 2)

  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initialValue

  return { count, doubleCount, increment, decrement, reset }
}
</script>
```

在组件中使用：

```vue
<script setup>
import { useCounter } from './composables/useCounter'

const { count, doubleCount, increment, reset } = useCounter(10)
</script>
```

### 实战：useAsyncData

```vue
<script setup>
// useAsyncData.js
import { ref, watch } from 'vue'

export function useAsyncData(fetcher) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const execute = async (...args) => {
    loading.value = true
    error.value = null
    try {
      data.value = await fetcher(...args)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, execute }
}
</script>
```

### 设计模式总结

1. **单一职责**：每个 Hook 只做一件事
2. **可组合**：Hook 之间可以互相调用
3. **参数灵活**：支持 ref 和普通值
4. **返回稳定引用**：避免不必要的重渲染
5. **命名规范**：以 `use` 开头

## 项目结构最佳实践

### 按功能组织 composables

```
src/
├── composables/
│   ├── useAuth.js        # 认证逻辑
│   ├── useCart.js         # 购物车逻辑
│   └── useTheme.js        # 主题切换
├── components/
│   ├── ProductList.vue
│   └── ProductCard.vue
└── pages/
    └── index.vue
```

### 在组件中使用

```vue
<script setup>
import { useAuth } from '@/composables/useAuth'
import { useCart } from '@/composables/useCart'
import { useTheme } from '@/composables/useTheme'

// 认证逻辑
const { user, isAuthenticated, login, logout } = useAuth()

// 购物车逻辑
const { cartItems, total, addToCart, removeFromCart } = useCart()

// 主题逻辑
const { theme, toggleTheme } = useTheme()
</script>
```

## 生命周期钩子

Composition API 中的生命周期钩子：

```vue
<script setup>
import { onMounted, onUnmounted, onUpdated, onBeforeUnmount } from 'vue'

onMounted(() => {
  console.log('组件已挂载')
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

onUpdated(() => {
  console.log('组件已更新')
})
</script>
```

## 总结

Composition API 的优势在于：

1. **更好的逻辑复用**：通过组合式函数实现跨组件的逻辑共享
2. **更灵活的组织**：按功能而非选项类型组织代码
3. **更好的类型推断**：天然支持 TypeScript
4. **更小的生产包体积**：函数调用比 Options API 更利于 tree-shaking

从 Options API 到 Composition API 不是革命，而是一种自然演进。对于简单组件，Options API 仍然简洁明了；对于复杂组件，Composition API 则展现了强大的组织能力。
