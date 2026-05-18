---
title: Next.js App Router 实战：从原理到生产环境
date: 2026-05-17
cover: https://picsum.photos/seed/nextjs-app-router/800/400
desc: 深入理解 Next.js App Router 的渲染模式、数据获取、缓存机制和部署策略，附带真实项目经验
tags: [Next.js, React, SSR, 全栈框架]
---

## App Router vs Pages Router

Next.js 13 引入的 App Router 不是 Pages Router 的简单升级，而是一套全新的架构。理解它们的区别是正确使用 App Router 的前提。

### 核心差异

| 特性 | Pages Router | App Router |
|------|-------------|------------|
| 路由定义 | `pages/` 目录 | `app/` 目录 + `page.tsx` |
| 数据获取 | `getServerSideProps` / `getStaticProps` | 直接在组件中 `async/await` |
| 渲染模式 | 页面级别 | 组件级别（每个组件可独立选择） |
| 布局 | 需要手动嵌套 | `layout.tsx` 自动嵌套 |
| 服务端组件 | 不支持 | 默认就是服务端组件 |
| 流式 SSR | 不支持 | 内置支持（Suspense） |

### 为什么默认是服务端组件

App Router 中，所有组件默认都是 **React Server Components (RSC)**。这意味着：

```tsx
// app/blog/[slug]/page.tsx
// 这个组件在服务端运行，可以直接访问数据库
import { getPost } from '@/lib/db'

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)  // 直接 await，不需要 useEffect
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}
```

服务端组件的优势：
- **零 bundle 体积**：服务端代码不会发送到客户端
- **直接访问后端资源**：数据库、文件系统、环境变量
- **减少水合成本**：只有交互组件需要水合

## 渲染模式：什么时候用什么

### 静态渲染（默认）

```tsx
// app/blog/page.tsx
// 构建时生成静态 HTML
export default async function BlogList() {
  const posts = await getPosts()
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

### 动态渲染

```tsx
// app/dashboard/page.tsx
// 每次请求时渲染
export const dynamic = 'force-dynamic'  // 强制动态

export default async function Dashboard() {
  const user = await getCurrentUser()  // 每次请求获取最新数据
  return <div>欢迎, {user.name}</div>
}
```

### 增量静态再生成（ISR）

```tsx
// app/products/[id]/page.tsx
// 构建时生成，然后定期重新验证
export const revalidate = 3600  // 每小时重新生成

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  return <ProductDetail product={product} />
}
```

### 选择策略

```
数据是否依赖请求？
├── 是 → 动态渲染（force-dynamic）
│   └── 例：用户个人信息、实时数据
│
└── 否 → 数据变化频率？
    ├── 几乎不变 → 静态渲染（默认）
    │   └── 例：博客文章、产品详情页
    │
    └── 偶尔变化 → ISR（revalidate）
        └── 例：商品库存、评论列表
```

## 数据获取模式

### 服务端组件中直接获取

```tsx
// 推荐：在服务端组件中直接 await
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600 }  // ISR 缓存
  })
  return res.json()
}

export default async function Posts() {
  const posts = await getPosts()
  return <PostList posts={posts} />
}
```

### 并行数据获取

```tsx
// 串行（慢）
export default async function Page() {
  const user = await getUser()       // 200ms
  const posts = await getPosts()     // 300ms
  const stats = await getStats()     // 150ms
  // 总计：650ms
  return <Dashboard user={user} posts={posts} stats={stats} />
}

// 并行（快）
export default async function Page() {
  const [user, posts, stats] = await Promise.all([
    getUser(),    // 200ms
    getPosts(),   // 300ms
    getStats()    // 150ms
  ])
  // 总计：300ms（最慢的那个）
  return <Dashboard user={user} posts={posts} stats={stats} />
}
```

### 流式渲染 + Suspense

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react'
import SlowComponent from './slow-component'
import FastComponent from './fast-component'

export default function Dashboard() {
  return (
    <div>
      {/* 这个组件快，先渲染 */}
      <FastComponent />
      
      {/* 这个组件慢，用 Suspense 包裹，流式发送 */}
      <Suspense fallback={<LoadingSkeleton />}>
        <SlowComponent />
      </Suspense>
    </div>
  )
}

// app/dashboard/slow-component.tsx
async function SlowComponent() {
  const data = await fetchSlowData()  // 可能需要 2 秒
  return <div>{/* ... */}</div>
}
export default SlowComponent
```

流式渲染的效果：用户先看到 FastComponent，SlowComponent 加载完成后自动替换 LoadingSkeleton。不需要等待所有数据就绪。

## 缓存机制：Next.js 的核心

### fetch 缓存

```tsx
// 默认行为：GET 请求会被缓存（相当于 force-cache）
fetch('https://api.example.com/data')

// 显式配置
fetch('https://api.example.com/data', {
  next: { revalidate: 60 }     // ISR：60秒后重新验证
})

fetch('https://api.example.com/data', {
  next: { revalidate: 0 }      // 等同于 no-store
})

fetch('https://api.example.com/data', {
  cache: 'no-store'            // 永不缓存
})

fetch('https://api.example.com/data', {
  cache: 'force-cache'         // 永久缓存（默认）
})
```

### 路由段配置

```tsx
// app/api/route.ts
export const dynamic = 'force-dynamic'        // 强制动态
export const revalidate = 3600                // ISR 重新验证时间
export const fetchCache = 'default-no-store'  // fetch 默认不缓存
export const runtime = 'edge'                 // 使用 Edge Runtime
```

### 手动重新验证

```tsx
// app/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: Request) {
  const { type, key } = await request.json()
  
  if (type === 'path') {
    revalidatePath(key)        // 重新验证特定路径
  } else if (type === 'tag') {
    revalidateTag(key)         // 重新验证特定标签
  }
  
  return Response.json({ revalidated: true })
}

// 使用标签缓存
async function getPosts() {
  return fetch('https://api.example.com/posts', {
    next: { tags: ['posts'] }  // 用 revalidateTag('posts') 清除
  })
}
```

## 服务端操作（Server Actions）

```tsx
// app/todo/page.tsx
'use server'  // 在文件顶部声明（可选）

async function createTodo(formData: FormData) {
  'use server'  // 或在函数顶部声明
  
  const title = formData.get('title') as string
  await db.todo.create({ data: { title } })
  revalidatePath('/todo')  // 重新验证页面
}

export default function TodoPage() {
  return (
    <form action={createTodo}>
      <input name="title" placeholder="新任务..." />
      <button type="submit">添加</button>
    </form>
  )
}
```

Server Actions 的优势：
- 不需要创建 API route
- 自动处理 CSRF 保护
- 支持渐进增强（JS 禁用时表单仍然可用）

## 生产环境部署

### Vercel（推荐）

```bash
# 连接 GitHub 仓库后自动部署
# 每次 push 到 main 自动构建
# 支持 ISR、Edge Runtime、Image Optimization
```

### 自建服务器

```bash
# 构建
npm run build

# 启动（Node.js 服务器）
npm start

# 或使用 standalone 模式（最小化输出）
# next.config.js
module.exports = {
  output: 'standalone'  // 输出独立可部署的包
}

# 输出在 .next/standalone/，只需 Node.js 即可运行
node .next/standalone/server.js
```

### Docker 部署

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "server.js"]
```

## 常见坑点

### 1. 服务端组件不能用 useState

```tsx
// 错误：服务端组件不能使用 hooks
export default function Page() {
  const [count, setCount] = useState(0)  // ❌
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}

// 正确：拆分为客户端组件
export default function Page() {
  return <Counter />  // ✅
}

// components/counter.tsx
'use client'
export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

### 2. 环境变量在服务端和客户端的区分

```bash
# .env.local
DATABASE_URL=postgres://...          # 仅服务端可用
NEXT_PUBLIC_API_URL=https://api...   # 客户端也可用
```

```tsx
// 服务端组件
const db = connect(process.env.DATABASE_URL)  // ✅

// 客户端组件
const api = process.env.NEXT_PUBLIC_API_URL   // ✅
const db = process.env.DATABASE_URL           // ❌ undefined
```

### 3. 图片优化需要配置域名

```tsx
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.picsum.photos' },
    ],
  },
}
```

## 总结

App Router 的核心思想是：**默认在服务端运行，只在需要交互时才切换到客户端**。这个模型让性能优化变得自然——你不需要刻意做 SSR，因为默认就是 SSR。

关键要点：
1. 理解渲染模式的选择策略（静态/动态/ISR）
2. 善用并行数据获取和流式渲染
3. 掌握缓存机制，避免不必要的数据请求
4. Server Actions 简化了表单和服务端交互
5. `'use client'` 是边界，不是默认
