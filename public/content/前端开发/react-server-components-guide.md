---
title: React Server Components 实战指南
date: 2026-05-17
cover: https://picsum.photos/seed/react-rsc-guide/800/400
desc: 全面理解 React Server Components 的概念、使用方式和最佳实践
tags: [React, Server Components, 前端架构, 性能优化]
---

## 什么是 React Server Components

React Server Components (RSC) 是 React 的一项新架构，允许组件在服务端运行，直接访问数据库、文件系统等服务端资源，然后将渲染结果发送给客户端。

### 传统 React 的问题

```
传统 CSR 流程：
1. 下载 HTML（很小）
2. 下载 JS bundle（可能很大）
3. 执行 JS，构建虚拟 DOM
4. 发起 API 请求获取数据
5. 渲染页面

问题：步骤 2-4 都在客户端，首屏慢
```

### RSC 的解决方案

```
RSC 流程：
1. 服务端执行组件，获取数据
2. 服务端渲染为特殊格式（不是 HTML）
3. 客户端接收并"复活"组件树
4. 只 hydration 需要交互的部分

优势：零 bundle 大小的服务端组件
```

## 服务端组件 vs 客户端组件

### 对比表

| 特性 | 服务端组件 | 客户端组件 |
|------|-----------|-----------|
| 运行环境 | 服务端 | 浏览器 |
| 可以访问数据库 | ✅ | ❌ |
| 可以使用 useState | ❌ | ✅ |
| 可以使用 useEffect | ❌ | ✅ |
| 可以添加事件监听 | ❌ | ✅ |
| Bundle 大小 | 0 | 计入 bundle |
| 数据获取 | 直接 await | useEffect / Suspense |

### 如何区分

```tsx
// 默认是服务端组件
async function ServerComponent() {
  const data = await db.query('SELECT * FROM users')
  return <UserList users={data} />
}

// 添加 'use client' 指令变为客户端组件
'use client'

function ClientComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

## 数据获取模式

### 模式一：服务端组件直接获取

```tsx
// app/articles/page.tsx
import { db } from '@/lib/db'

export default async function ArticlesPage() {
  const articles = await db.article.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return (
    <div>
      <h1>最新文章</h1>
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
```

### 模式二：并行数据获取

```tsx
async function DashboardPage() {
  // 并行执行，不会串行等待
  const [users, posts, comments] = await Promise.all([
    db.user.count(),
    db.post.count(),
    db.comment.count(),
  ])

  return (
    <div>
      <StatCard label="用户" value={users} />
      <StatCard label="文章" value={posts} />
      <StatCard label="评论" value={comments} />
    </div>
  )
}
```

### 模式三：串行数据获取

```tsx
async function UserPostsPage({ params }: { params: { userId: string } }) {
  // 先获取用户
  const user = await db.user.findUnique({
    where: { id: params.userId },
  })

  if (!user) {
    notFound()
  }

  // 再获取用户的文章
  const posts = await db.post.findMany({
    where: { authorId: user.id },
  })

  return (
    <div>
      <h1>{user.name} 的文章</h1>
      <PostList posts={posts} />
    </div>
  )
}
```

## Suspense 与流式渲染

### 使用 Suspense 包裹异步组件

```tsx
import { Suspense } from 'react'
import { Comments } from './comments'

function ArticlePage() {
  return (
    <article>
      <h1>文章标题</h1>
      <p>文章内容...</p>
      
      <Suspense fallback={<CommentsSkeleton />}>
        <Comments articleId="123" />
      </Suspense>
    </article>
  )
}

// Comments 是异步服务端组件
async function Comments({ articleId }: { articleId: string }) {
  const comments = await db.comment.findMany({
    where: { articleId },
  })
  
  return (
    <section>
      {comments.map(c => <Comment key={c.id} comment={c} />)}
    </section>
  )
}
```

### 流式 HTML 的优势

```
没有 Suspense:
[等待所有数据] → [一次性发送完整 HTML]

有 Suspense:
[发送骨架屏 HTML] → [数据就绪后发送剩余 HTML]
     ↑ 用户更早看到页面
```

## 服务端组件传递数据给客户端组件

### 正确方式：通过 Props 传递

```tsx
// 服务端组件
async function Page() {
  const user = await db.user.findUnique({ where: { id: 1 } })
  
  // 将数据作为 props 传给客户端组件
  return <ClientProfile user={user} />
}

// 客户端组件
'use client'

function ClientProfile({ user }: { user: User }) {
  const [editing, setEditing] = useState(false)
  
  return (
    <div>
      {editing ? (
        <EditForm user={user} />
      ) : (
        <div>
          <h2>{user.name}</h2>
          <button onClick={() => setEditing(true)}>编辑</button>
        </div>
      )}
    </div>
  )
}
```

### 错误方式：在客户端组件中使用服务端 API

```tsx
'use client'

// ❌ 错误：客户端组件不能直接调用数据库
function BadComponent() {
  const users = db.user.findMany() // 这会报错！
  return <div>{users.map(u => <p>{u.name}</p>)}</div>
}
```

## 常见模式

### 模式一：服务端获取 + 客户端交互

```tsx
// 服务端组件
async function TodoList() {
  const todos = await db.todo.findMany()
  return <TodoItems initialTodos={todos} />
}

// 客户端组件
'use client'

function TodoItems({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState(initialTodos)
  
  const toggleTodo = async (id: number) => {
    await fetch(`/api/todos/${id}/toggle`, { method: 'POST' })
    setTodos(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ))
  }
  
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          <input 
            type="checkbox" 
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
          />
          {todo.title}
        </li>
      ))}
    </ul>
  )
}
```

### 模式二：服务端表单处理

```tsx
// app/contact/page.tsx
import { revalidatePath } from 'next/cache'

async function handleSubmit(formData: FormData) {
  'use server'
  
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const message = formData.get('message') as string
  
  await db.contact.create({ data: { name, email, message } })
  revalidatePath('/contact')
}

export default function ContactPage() {
  return (
    <form action={handleSubmit}>
      <input name="name" placeholder="姓名" required />
      <input name="email" type="email" placeholder="邮箱" required />
      <textarea name="message" placeholder="留言" required />
      <button type="submit">提交</button>
    </form>
  )
}
```

## 性能优化技巧

### 1. 减少客户端组件的使用

```tsx
// ❌ 整个页面都是客户端组件
'use client'
function Page() {
  const [data, setData] = useState(null)
  useEffect(() => { fetch('/api/data').then(r => r.json()).then(setData) }, [])
  return <div>{data?.map(...)}</div>
}

// ✅ 服务端获取 + 最小化客户端组件
async function Page() {
  const data = await fetchData()
  return <DataList items={data} /> // DataList 可以是服务端组件
}
```

### 2. 使用缓存

```tsx
import { cache } from 'react'

// 缓存函数结果
const getUser = cache(async (id: string) => {
  return db.user.findUnique({ where: { id } })
})

// 同一请求在同一个渲染周期内只执行一次
const user1 = await getUser('1')
const user2 = await getUser('1') // 命中缓存
```

### 3. 按需加载客户端组件

```tsx
import dynamic from 'next/dynamic'

// 客户端组件只在需要时加载
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // 不在服务端渲染
})
```

## 常见错误与排查

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| "Cannot access database on the client" | 客户端组件调用了服务端 API | 将数据获取移到服务端组件 |
| "Event handlers cannot be passed to Client Component" | 服务端组件传递了函数给客户端组件 | 使用 `action` 或 `server action` |
| 组件不更新 | 缓存导致 | 使用 `revalidatePath` 或 `revalidateTag` |

## 总结

React Server Components 的核心思想：

1. **默认服务端**：组件默认在服务端运行，零 bundle 开销
2. **按需客户端**：只有需要交互时才标记 `'use client'`
3. **直接数据访问**：服务端组件可以直接查询数据库
4. **流式渲染**：Suspense 让页面逐步加载，提升用户体验

掌握 RSC 后，你的 React 应用将获得更好的首屏性能和更简洁的数据获取逻辑。
