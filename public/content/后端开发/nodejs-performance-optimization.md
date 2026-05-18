---
title: Node.js 性能优化实战
date: 2026-05-17
cover: https://picsum.photos/seed/nodejs-performance/800/400
desc: 从事件循环到内存管理，全面掌握 Node.js 性能调优技巧
tags: [Node.js, 性能优化, 后端开发, 事件循环]
---

## Node.js 性能的核心：事件循环

Node.js 是单线程的，但它的事件循环模型让它能高效处理大量并发请求。理解事件循环是性能优化的第一步。

### 事件循环的六个阶段

```
   ┌───────────────────────────┐
┌─>│           timers          │  setTimeout, setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  系统操作回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     idle, prepare         │  内部使用
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  I/O 回调（最重要的阶段）
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──│      close callbacks      │  close 事件回调
   └───────────────────────────┘
```

### 阻塞事件循环的代价

```javascript
// ❌ 错误：同步计算阻塞事件循环
app.get('/slow', (req, res) => {
  let result = 0
  for (let i = 0; i < 1e9; i++) {
    result += i
  }
  res.json({ result })
  // 在这几秒内，所有其他请求都被阻塞
})

// ✅ 正确：使用异步或 Worker Threads
const { Worker } = require('worker_threads')

app.get('/fast', (req, res) => {
  const worker = new Worker('./compute.js')
  worker.on('message', (result) => res.json({ result }))
  worker.on('error', (err) => res.status(500).json({ error: err.message }))
})
```

## 内存管理

### 内存泄漏的常见场景

```javascript
// 场景一：全局变量累积
const cache = {} // 没有清理机制
function getData(key) {
  if (!cache[key]) {
    cache[key] = fetchData(key) // 无限增长
  }
  return cache[key]
}

// 场景二：未清理的定时器
function scheduleTask() {
  setInterval(() => {
    doSomething()
  }, 1000)
  // 每次调用都创建新的 interval，旧的永远不会被清理
}

// 场景三：闭包引用
function createHandler() {
  const largeObject = new Array(1000000).fill('data')
  return function handler() {
    console.log('handled')
    // largeObject 永远不会被 GC，因为被闭包引用
  }
}
```

### 解决方案

```javascript
// 使用 LRU 缓存替代无限增长的对象
import { LRUCache } from 'lru-cache'

const cache = new LRUCache({
  max: 500,        // 最多 500 条
  ttl: 1000 * 60 * 5, // 5 分钟过期
})

// 使用 WeakMap 避免内存泄漏
const metadata = new WeakMap()
function setMetadata(obj, data) {
  metadata.set(obj, data)
  // obj 被 GC 时，metadata 中的对应条目也会被清理
}
```

### 内存分析工具

```bash
# 启动时开启内存分析
node --inspect server.js

# 在 Chrome DevTools 中：
# 1. 打开 chrome://inspect
# 2. 点击 "Open dedicated DevTools for Node"
# 3. 切换到 Memory 标签
# 4. 拍摄堆快照 (Heap Snapshot)
# 5. 对比快照找出内存泄漏
```

## CPU 性能优化

### 使用集群模式

```javascript
import cluster from 'node:cluster'
import { availableParallelism } from 'node:os'
import process from 'node:process'

const numCPUs = availableParallelism()

if (cluster.isPrimary) {
  console.log(`主进程 ${process.pid} 正在运行`)

  // 为每个 CPU 核心创建 worker
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} 已退出`)
    cluster.fork() // 自动重启
  })
} else {
  // Worker 进程运行服务器
  import('./server.js')
  console.log(`Worker ${process.pid} 已启动`)
}
```

### 异步 I/O 最佳实践

```javascript
// ❌ 同步文件读取（阻塞事件循环）
const data = fs.readFileSync('config.json', 'utf8')

// ✅ 异步文件读取
const data = await fs.promises.readFile('config.json', 'utf8')

// ❌ 同步数据库查询（使用 better-sqlite3）
const users = db.prepare('SELECT * FROM users').all()

// ✅ 异步数据库查询（使用 node-postgres）
const { rows } = await pool.query('SELECT * FROM users')
```

### 流式处理大数据

```javascript
// ❌ 一次性读取大文件
const content = fs.readFileSync('large-file.csv', 'utf8')
const lines = content.split('\n') // 内存爆炸

// ✅ 使用流式处理
import { createReadStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Transform } from 'node:stream'

const processLine = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    // 逐行处理
    callback(null, process(chunk))
  }
})

await pipeline(
  createReadStream('large-file.csv'),
  parse(),       // csv parser
  processLine,
  createWriteStream('output.json')
)
```

## 网络性能优化

### 连接池

```javascript
// ❌ 每次请求创建新连接
async function query(sql) {
  const conn = await mysql.createConnection(config)
  const result = await conn.query(sql)
  await conn.end()
  return result
}

// ✅ 使用连接池
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'myapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

async function query(sql) {
  const [rows] = await pool.execute(sql)
  return rows
}
```

### HTTP 压缩

```javascript
import compression from 'compression'
import express from 'express'

const app = express()

// 启用 gzip 压缩
app.use(compression({
  level: 6, // 0-9，6 是性能和压缩率的平衡点
  threshold: 1024, // 只压缩大于 1KB 的响应
}))
```

### 响应缓存

```javascript
import express from 'express'

const app = express()
const cache = new Map()

function cacheMiddleware(duration: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const key = req.originalUrl
    
    if (cache.has(key)) {
      const { body, timestamp } = cache.get(key)
      if (Date.now() - timestamp < duration * 1000) {
        return res.json(body)
      }
      cache.delete(key)
    }
    
    const originalJson = res.json.bind(res)
    res.json = (body) => {
      cache.set(key, { body, timestamp: Date.now() })
      return originalJson(body)
    }
    
    next()
  }
}

// 使用
app.get('/api/articles', cacheMiddleware(60), getArticles)
```

## 性能监控

### 内置性能 API

```javascript
import { performance, PerformanceObserver } from 'node:perf_hooks'

// 测量代码段执行时间
performance.mark('start-query')
const result = await db.query('SELECT * FROM users')
performance.mark('end-query')
performance.measure('query-time', 'start-query', 'end-query')

// 观察性能指标
const obs = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`)
  })
})
obs.observe({ entryTypes: ['measure'] })
```

### 关键指标监控

```javascript
import { monitorEventLoopDelay } from 'node:perf_hooks'

const delayMonitor = monitorEventLoopDelay({ resolution: 10 })
delayMonitor.enable()

setInterval(() => {
  const p50 = delayMonitor.percentile(50) / 1e6
  const p99 = delayMonitor.percentile(99) / 1e6
  
  console.log(`事件循环延迟 - P50: ${p50}ms, P99: ${p99}ms`)
  
  if (p99 > 100) {
    console.warn('⚠️ 事件循环延迟过高！')
  }
}, 5000)
```

## 性能优化清单

| 优化项 | 影响 | 难度 |
|--------|------|------|
| 使用集群模式 | 充分利用多核 CPU | 低 |
| 连接池 | 减少连接开销 | 低 |
| 启用压缩 | 减少传输体积 60-80% | 低 |
| 响应缓存 | 减少重复计算 | 中 |
| 流式处理 | 降低内存占用 | 中 |
| Worker Threads | 处理 CPU 密集型任务 | 中 |
| 内存泄漏排查 | 防止 OOM | 高 |
| 数据库索引优化 | 加速查询 | 高 |

## 总结

Node.js 性能优化的核心原则：

1. **永远不要阻塞事件循环**——CPU 密集型任务交给 Worker Threads
2. **管理好内存**——使用 LRU 缓存、WeakMap，定期排查泄漏
3. **善用连接池和缓存**——减少重复开销
4. **监控是关键**——没有监控的优化是盲人摸象

记住：先测量，再优化。不要凭感觉优化代码。
