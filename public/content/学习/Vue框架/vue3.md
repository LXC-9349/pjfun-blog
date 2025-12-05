---
title: Vue 3 简介
date: 2025-12-05
desc: 探索现代前端框架 Vue 3 的核心特性
cover: https://img1.baidu.com/it/u=2738382553,2853559896&fm=253&fmt=auto&app=138&f=JPEG
tags: [Vue, JavaScript, 前端]
---
我将为您完善和丰富这份 Vue 3 简介文档，添加更多有价值的内容。

## Vue 3 简介

Vue 3 是目前最流行的前端框架之一，它带来了许多令人兴奋的新特性和改进。

## 主要特性

1. **Composition API** - 更灵活的组件逻辑组织方式
2. **更好的 TypeScript 支持** - 提供完整的类型推导
3. **性能提升** - 更小的包体积和更快的渲染速度
4. **多根节点支持** - 不再限制组件必须有一个根元素
5. **Teleport** - 组件传送功能，可将组件渲染到DOM任意位置
6. **Suspense** - 异步组件处理和加载状态管理
7. **Fragment** - 支持多个根节点而无需包装元素

## 核心概念详解

### Composition API

`Composition API` 是 Vue 3 的核心新特性，它允许开发者使用函数的方式组织和复用组件逻辑：

```vue
<template>
  <div>
    <p>计数: {{ count }}</p>
    <button @click="increment">增加</button>
    <p>双倍计数: {{ doubleCount }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 响应式数据
const count = ref(0)

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 方法
const increment = () => {
  count.value++
}
</script>
```


### 响应式系统

Vue 3 采用了基于 Proxy 的响应式系统，相比 Vue 2 有显著提升：

```vue
<script setup>
import { reactive, ref, watch } from 'vue'

// 对象响应式
const state = reactive({
  name: 'Vue 3',
  version: 3
})

// 基本类型响应式
const count = ref(0)

// 监听器
watch(count, (newVal, oldVal) => {
  console.log(`count changed from ${oldVal} to ${newVal}`)
})
</script>
```


## 新增功能

### Teleport 组件

`Teleport` 允许将子组件渲染到DOM树的任意位置：

```vue
<template>
  <div>
    <!-- 传送到 body -->
    <Teleport to="body">
      <div class="modal">这是一个模态框</div>
    </Teleport>
    
    <!-- 传送到指定元素 -->
    <Teleport to="#modals">
      <component-a />
    </Teleport>
  </div>
</template>
```


### 多模板根节点

Vue 3 移除了组件必须有单一根元素的限制：

```vue
<template>
  <!-- 现在可以有多个根节点 -->
  <header>头部</header>
  <main>主要内容</main>
  <footer>底部</footer>
</template>
```


## 生命周期钩子

Vue 3 的生命周期钩子有两种形式：

### Options API 形式

```vue
<script>
export default {
  beforeCreate() {
    console.log('实例创建前')
  },
  created() {
    console.log('实例创建后')
  },
  beforeMount() {
    console.log('挂载前')
  },
  mounted() {
    console.log('挂载后')
  }
}
</script>
```


### Composition API 形式

```vue
<script setup>
import { onMounted, onUpdated, onUnmounted } from 'vue'

onMounted(() => {
  console.log('组件已挂载')
})

onUpdated(() => {
  console.log('组件已更新')
})

onUnmounted(() => {
  console.log('组件已卸载')
})
</script>
```


## 简单示例

```vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <button @click="increment">点击次数: {{ count }}</button>
    <p v-if="count > 5">你已经点击了很多次！</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const title = ref('Hello Vue 3!')
const count = ref(0)

const increment = () => {
  count.value++
}
</script>

<style scoped>
h1 {
  color: #42b983;
}

button {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```


## 性能优化

Vue 3 在性能方面做了多项优化：

- **更小的包体积**: 相比 Vue 2 减少了约 40%
- **更快的初始渲染**: 重写了虚拟 DOM 实现
- **更高效的更新**: 更精确的变更检测
- **更好的内存使用**: 减少了内存占用

## 生态系统

Vue 3 拥有丰富的生态系统：

- **Vue Router**: 官方路由管理
- **Vuex/Pinia**: 状态管理解决方案
- **Vue CLI/Vite**: 构建工具
- **Vue DevTools**: 浏览器调试工具

Vue 3 让前端开发变得更加简单高效，是现代 Web 开发的理想选择。