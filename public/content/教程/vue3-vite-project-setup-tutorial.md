---
title: 从零搭建 Vue3 + Vite 项目完整教程
date: 2026-05-17
cover: https://picsum.photos/seed/vue3-vite-tutorial/800/400
desc: 手把手教你从零搭建一个生产级别的 Vue3 + Vite 项目，涵盖路由、状态管理、样式、代码规范等
tags: [Vue3, Vite, 教程, 前端开发]
---

## 前言

每次开始一个新项目，搭建基础架构都是第一步。本文将完整记录从零搭建一个生产级 Vue3 + Vite 项目的全过程，包括路由、状态管理、样式方案、代码规范、API 封装等核心配置。

## 环境准备

### 安装 Node.js

推荐使用 Node.js 20 LTS 或更高版本：

```bash
# 检查 Node.js 版本
node -v  # 建议 v20.0.0+

# 检查 npm 版本
npm -v   # 建议 v10.0.0+
```

如果版本过低，可以使用 nvm 管理：

```bash
# 安装 nvm (Windows 使用 nvm-windows)
# macOS/Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 安装并使用 Node.js 20
nvm install 20
nvm use 20
```

## 创建项目

### 使用 create-vite

```bash
# 创建项目
npm create vite@latest my-vue-app -- --template vue-ts

# 进入项目目录
cd my-vue-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 初始项目结构

```
my-vue-app/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   └── HelloWorld.vue
│   ├── App.vue
│   ├── main.ts
│   ├── style.css
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## 安装核心依赖

### Vue Router

```bash
npm install vue-router@4
```

创建路由配置：

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/pages/About.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

export default router
```

创建页面组件：

```vue
<!-- src/pages/Home.vue -->
<template>
  <div class="home">
    <h1>首页</h1>
    <p>欢迎使用 Vue3 + Vite 项目</p>
  </div>
</template>
```

```vue
<!-- src/pages/NotFound.vue -->
<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面未找到</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>
```

### Pinia 状态管理

```bash
npm install pinia
```

```typescript
// src/stores/index.ts
import { createPinia } from 'pinia'

const pinia = createPinia()
export default pinia
```

```typescript
// src/stores/counter.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  return { count, doubleCount, increment, decrement }
})
```

### 集成到 main.ts

```typescript
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import './style.css'

const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')
```

## 样式方案配置

### 方案一：UnoCSS（推荐）

```bash
npm install -D unocss @unocss/preset-uno @unocss/transformer-directives
```

```typescript
// uno.config.ts
import { defineConfig, presetUno, presetIcons, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons(),
  ],
  transformers: [
    transformerDirectives(),
  ],
  shortcuts: {
    'btn-primary': 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition',
    'card': 'bg-white rounded-lg shadow-md p-4',
  },
})
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [vue(), UnoCSS()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
```

在 main.ts 中引入：

```typescript
import 'virtual:uno.css'
```

### 方案二：Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## ESLint + Prettier 配置

```bash
npm install -D eslint @antfu/eslint-config
```

```typescript
// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  rules: {
    'no-console': 'warn',
    'vue/multi-word-component-names': 'off',
  },
})
```

在 package.json 中添加脚本：

```json
{
  "scripts": {
    "lint": "eslint . --fix",
    "format": "prettier --write src/"
  }
}
```

## API 请求封装

```bash
npm install axios
```

```typescript
// src/utils/request.ts
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default service
```

```typescript
// src/api/user.ts
import request from '@/utils/request'

export interface User {
  id: number
  name: string
  email: string
}

export function getUserInfo() {
  return request.get<User>('/user/info')
}

export function updateUser(data: Partial<User>) {
  return request.put<User>('/user/info', data)
}
```

## 环境变量配置

```env
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=My App (Dev)

# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_APP_TITLE=My App
```

```typescript
// 在代码中使用
const apiBase = import.meta.env.VITE_API_BASE_URL
const appTitle = import.meta.env.VITE_APP_TITLE
```

## 组件目录结构设计

```
src/
├── api/              # API 接口
│   ├── user.ts
│   └── article.ts
├── assets/           # 静态资源
│   ├── images/
│   └── styles/
├── components/       # 公共组件
│   ├── ui/           # 基础 UI 组件
│   │   ├── Button.vue
│   │   └── Input.vue
│   └── layout/       # 布局组件
│       ├── Header.vue
│       └── Footer.vue
├── composables/      # 组合式函数
│   ├── useAuth.ts
│   └── useTheme.ts
├── pages/            # 页面组件
│   ├── Home.vue
│   ├── About.vue
│   └── NotFound.vue
├── router/           # 路由配置
│   └── index.ts
├── stores/           # 状态管理
│   ├── index.ts
│   └── user.ts
├── types/            # 类型定义
│   └── index.ts
├── utils/            # 工具函数
│   ├── request.ts
│   └── format.ts
├── App.vue
└── main.ts
```

## 生产构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

优化构建配置：

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          vendor: ['axios'],
        },
      },
    },
  },
})
```

## 总结

至此，一个生产级别的 Vue3 + Vite 项目基础架构已经搭建完成。核心配置包括：

1. **Vue Router** - 路由管理与懒加载
2. **Pinia** - 类型安全的状态管理
3. **UnoCSS/Tailwind** - 原子化 CSS 方案
4. **ESLint** - 代码规范与自动修复
5. **Axios 封装** - 统一的请求拦截与错误处理
6. **环境变量** - 多环境配置管理
7. **目录结构** - 清晰的项目组织

后续可以根据项目需求添加更多功能，如国际化、PWA、单元测试等。
