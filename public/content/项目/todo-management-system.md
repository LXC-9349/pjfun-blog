---
title: 个人待办事项管理系统实战
date: 2026-05-17
cover: https://picsum.photos/seed/todo-app-project/800/400
desc: 使用 Vue3 + Node.js + SQLite 从零搭建一个全栈待办事项管理系统，包含认证、分类、搜索等完整功能
tags: [全栈开发, Vue3, Node.js, 项目实战]
---

## 项目概述

本文将带你从零搭建一个完整的待办事项管理系统。这个项目涵盖了全栈开发的核心技能点，适合作为练手项目或作品集展示。

### 功能清单

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 用户注册/登录 | JWT 认证 | 高 |
| 待办 CRUD | 创建、读取、更新、删除 | 高 |
| 分类管理 | 为待办添加分类标签 | 中 |
| 搜索与筛选 | 按关键词、状态、分类筛选 | 中 |
| 优先级设置 | 高/中/低三级优先级 | 低 |
| 响应式 UI | 适配桌面和移动端 | 高 |

### 技术选型

```
前端: Vue3 + Vite + Vue Router + Pinia + UnoCSS
后端: Node.js + Express + SQLite + Better-SQLite3
认证: JWT (jsonwebtoken)
部署: Vercel (前端) + Railway (后端)
```

## 后端开发

### 项目初始化

```bash
mkdir todo-api && cd todo-api
npm init -y
npm install express better-sqlite3 jsonwebtoken bcryptjs cors
npm install -D typescript @types/node @types/express @types/bcryptjs @types/cors tsx
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### 数据库设计

```typescript
// src/db.ts
import Database from 'better-sqlite3'

const db = new Database('todo.db')

// 启用 WAL 模式提升并发性能
db.pragma('journal_mode = WAL')

// 创建表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT 0,
    priority TEXT DEFAULT 'medium',
    user_id INTEGER NOT NULL,
    category_id INTEGER,
    due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
`)

export default db
```

### 用户认证

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthRequest extends Request {
  userId?: number
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
    req.userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ error: '无效的认证令牌' })
  }
}
```

```typescript
// src/routes/auth.ts
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// 注册
router.post('/register', (req, res) => {
  const { username, password } = req.body
  
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' })
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (existing) {
    return res.status(409).json({ error: '用户名已存在' })
  }

  const passwordHash = bcrypt.hashSync(password, 10)
  const result = db.prepare(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)'
  ).run(username, passwordHash)

  const token = jwt.sign({ userId: result.lastInsertRowid }, JWT_SECRET, { expiresIn: '7d' })

  res.json({ token, user: { id: result.lastInsertRowid, username } })
})

// 登录
router.post('/login', (req, res) => {
  const { username, password } = req.body
  
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: '用户名或密码错误' })
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })

  res.json({ token, user: { id: user.id, username: user.username } })
})

export default router
```

### 待办 API

```typescript
// src/routes/todos.ts
import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import db from '../db'

const router = Router()

router.use(authMiddleware)

// 获取待办列表
router.get('/', (req: AuthRequest, res) => {
  const { completed, category, search, sort = 'created_at', order = 'desc' } = req.query
  
  let sql = 'SELECT * FROM todos WHERE user_id = ?'
  const params: any[] = [req.userId]

  if (completed !== undefined) {
    sql += ' AND completed = ?'
    params.push(completed === 'true' ? 1 : 0)
  }

  if (category) {
    sql += ' AND category_id = ?'
    params.push(category)
  }

  if (search) {
    sql += ' AND (title LIKE ? OR description LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }

  sql += ` ORDER BY ${sort} ${order}`

  const todos = db.prepare(sql).all(...params)
  res.json(todos)
})

// 创建待办
router.post('/', (req: AuthRequest, res) => {
  const { title, description, priority, category_id, due_date } = req.body

  if (!title) {
    return res.status(400).json({ error: '标题不能为空' })
  }

  const result = db.prepare(`
    INSERT INTO todos (title, description, priority, category_id, due_date, user_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(title, description, priority || 'medium', category_id, due_date, req.userId)

  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(todo)
})

// 更新待办
router.put('/:id', (req: AuthRequest, res) => {
  const { title, description, completed, priority, category_id, due_date } = req.body

  const existing = db.prepare('SELECT * FROM todos WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId)

  if (!existing) {
    return res.status(404).json({ error: '待办不存在' })
  }

  db.prepare(`
    UPDATE todos SET 
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      completed = COALESCE(?, completed),
      priority = COALESCE(?, priority),
      category_id = COALESCE(?, category_id),
      due_date = COALESCE(?, due_date),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).run(title, description, completed, priority, category_id, due_date, req.params.id, req.userId)

  const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id)
  res.json(updated)
})

// 删除待办
router.delete('/:id', (req: AuthRequest, res) => {
  const result = db.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.userId)

  if (result.changes === 0) {
    return res.status(404).json({ error: '待办不存在' })
  }

  res.json({ message: '删除成功' })
})

export default router
```

### 服务器入口

```typescript
// src/index.ts
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import todoRoutes from './routes/todos'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/todos', todoRoutes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
```

## 前端开发

### 项目结构

```
src/
├── api/
│   ├── auth.ts
│   └── todos.ts
├── components/
│   ├── TodoItem.vue
│   ├── TodoForm.vue
│   ├── CategoryFilter.vue
│   └── SearchBar.vue
├── pages/
│   ├── Login.vue
│   ├── Register.vue
│   └── Dashboard.vue
├── stores/
│   ├── auth.ts
│   └── todos.ts
├── types/
│   └── index.ts
└── main.ts
```

### 类型定义

```typescript
// src/types/index.ts
export interface Todo {
  id: number
  title: string
  description: string | null
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  category_id: number | null
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  color: string
}

export interface User {
  id: number
  username: string
}
```

### 状态管理

```typescript
// src/stores/todos.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Todo } from '@/types'
import { fetchTodos, createTodo, updateTodo, deleteTodo } from '@/api/todos'

export const useTodoStore = defineStore('todos', () => {
  const todos = ref<Todo[]>([])
  const loading = ref(false)
  const filter = ref({ completed: undefined, category: undefined, search: '' })

  const filteredTodos = computed(() => {
    return todos.value.filter(todo => {
      if (filter.value.completed !== undefined && todo.completed !== filter.value.completed) return false
      if (filter.value.category && todo.category_id !== filter.value.category) return false
      if (filter.value.search && !todo.title.includes(filter.value.search)) return false
      return true
    })
  })

  async function loadTodos() {
    loading.value = true
    try {
      todos.value = await fetchTodos()
    } finally {
      loading.value = false
    }
  }

  async function addTodo(title: string) {
    const newTodo = await createTodo({ title })
    todos.value.unshift(newTodo)
  }

  async function toggleTodo(todo: Todo) {
    const updated = await updateTodo(todo.id, { completed: !todo.completed })
    Object.assign(todo, updated)
  }

  async function removeTodo(id: number) {
    await deleteTodo(id)
    todos.value = todos.value.filter(t => t.id !== id)
  }

  return { todos, loading, filter, filteredTodos, loadTodos, addTodo, toggleTodo, removeTodo }
})
```

### 待办列表组件

```vue
<!-- src/components/TodoItem.vue -->
<template>
  <div 
    class="todo-item flex items-center gap-3 p-3 rounded-lg border transition"
    :class="{ 'opacity-60': todo.completed, 'border-l-4 border-l-red-500': todo.priority === 'high' }"
  >
    <input 
      type="checkbox" 
      :checked="todo.completed"
      @change="$emit('toggle')"
      class="w-5 h-5 rounded"
    />
    
    <div class="flex-1">
      <h3 :class="{ 'line-through': todo.completed }">{{ todo.title }}</h3>
      <p v-if="todo.description" class="text-sm text-gray-500">{{ todo.description }}</p>
      <div v-if="todo.due_date" class="text-xs text-gray-400">
        截止: {{ formatDate(todo.due_date) }}
      </div>
    </div>

    <button @click="$emit('delete')" class="text-red-500 hover:text-red-700">
      删除
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '@/types'

defineProps<{ todo: Todo }>()
defineEmits<{ toggle: []; delete: [] }>()

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>
```

## 部署方案

### 后端部署（Railway）

```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录并部署
railway login
railway init
railway up
```

### 前端部署（Vercel）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

## 总结

这个项目涵盖了全栈开发的核心技能：

1. **后端**：Express 路由、SQLite 数据库、JWT 认证、RESTful API 设计
2. **前端**：Vue3 组合式 API、Pinia 状态管理、组件化开发
3. **工程化**：TypeScript 全栈类型安全、环境变量、部署流程

完成这个项目后，你可以在此基础上继续扩展：添加实时通知、数据导出、团队协作等功能。
