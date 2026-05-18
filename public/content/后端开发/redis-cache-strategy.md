---
title: Redis 缓存策略与实战指南
date: 2026-05-17
cover: https://picsum.photos/seed/redis-cache-guide/800/400
desc: 从缓存模式到数据结构，全面掌握 Redis 在实际项目中的应用
tags: [Redis, 缓存, 后端开发, 性能优化]
---

## 为什么需要 Redis

数据库是大多数应用的瓶颈。Redis 作为内存数据库，读写速度可达 10 万+ QPS，是缓解数据库压力、提升响应速度的最佳选择。

## 五种缓存模式

### 模式一：Cache Aside（旁路缓存）

最常用的模式，读和写分开处理：

```typescript
// 读操作
async function getUser(id: string): Promise<User> {
  // 1. 先查缓存
  const cached = await redis.get(`user:${id}`)
  if (cached) {
    return JSON.parse(cached)
  }
  
  // 2. 缓存未命中，查数据库
  const user = await db.user.findUnique({ where: { id } })
  if (user) {
    // 3. 写入缓存，设置过期时间
    await redis.setex(`user:${id}`, 3600, JSON.stringify(user))
  }
  
  return user
}

// 写操作
async function updateUser(id: string, data: Partial<User>): Promise<User> {
  // 1. 更新数据库
  const user = await db.user.update({ where: { id }, data })
  
  // 2. 删除缓存（不是更新缓存！）
  await redis.del(`user:${id}`)
  
  return user
}
```

**为什么写操作要删除缓存而不是更新缓存？**
- 避免并发写导致缓存和数据库不一致
- 下次读取时自然会重建缓存

### 模式二：Read/Write Through

应用只和缓存交互，由缓存负责与数据库同步：

```typescript
// 需要自定义实现（Redis 本身不支持）
class ThroughCache {
  async get(key: string) {
    let value = await redis.get(key)
    if (!value) {
      value = await this.loadFromDB(key)
      await redis.set(key, value)
    }
    return value
  }

  async set(key: string, value: string) {
    await redis.set(key, value)
    await this.saveToDB(key, value) // 同步写数据库
  }
}
```

### 模式三：Write Behind（异步写回）

写操作只更新缓存，异步批量写入数据库：

```typescript
// 适合写多读少的场景，如日志收集
class WriteBehindCache {
  private writeQueue: Map<string, string> = new Map()
  private flushInterval: NodeJS.Timeout

  constructor() {
    this.flushInterval = setInterval(() => this.flush(), 5000)
  }

  async set(key: string, value: string) {
    await redis.set(key, value)
    this.writeQueue.set(key, value)
  }

  private async flush() {
    if (this.writeQueue.size === 0) return
    
    const batch = Array.from(this.writeQueue.entries())
    this.writeQueue.clear()
    
    // 批量写入数据库
    await db.$transaction(
      batch.map(([key, value]) => 
        db.log.create({ data: { key, value } })
      )
    )
  }
}
```

### 缓存模式对比

| 模式 | 一致性 | 性能 | 复杂度 | 适用场景 |
|------|--------|------|--------|---------|
| Cache Aside | 最终一致 | 高 | 低 | 通用场景 |
| Read Through | 最终一致 | 中 | 中 | 读多写少 |
| Write Through | 强一致 | 低 | 中 | 强一致要求 |
| Write Behind | 最终一致 | 最高 | 高 | 写多读少 |

## Redis 数据结构实战

### String：缓存对象

```typescript
// 缓存用户信息
await redis.setex('user:1001', 3600, JSON.stringify({
  id: 1001,
  name: 'Alice',
  email: 'alice@example.com',
}))

// 计数器
await redis.incr('page:views')
await redis.incrby('article:123:likes', 5)

// 分布式锁
const acquired = await redis.set('lock:order:123', '1', 'EX', 10, 'NX')
if (acquired) {
  try {
    // 执行业务逻辑
  } finally {
    await redis.del('lock:order:123')
  }
}
```

### Hash：存储对象字段

```typescript
// 比 String 更节省内存（适合字段经常单独更新）
await redis.hset('user:1001', {
  name: 'Alice',
  email: 'alice@example.com',
  age: '28',
})

// 单独更新一个字段
await redis.hset('user:1001', 'email', 'new@example.com')

// 获取单个字段
const name = await redis.hget('user:1001', 'name')

// 获取所有字段
const user = await redis.hgetall('user:1001')
```

### List：消息队列

```typescript
// 生产者
await redis.rpush('queue:emails', JSON.stringify({
  to: 'user@example.com',
  subject: 'Welcome!',
  body: '...',
}))

// 消费者（阻塞式）
while (true) {
  const [queue, task] = await redis.blpop('queue:emails', 0)
  if (task) {
    await sendEmail(JSON.parse(task))
  }
}
```

### Set：标签系统

```typescript
// 给文章添加标签
await redis.sadd('article:123:tags', 'Vue', 'TypeScript', '前端')
await redis.sadd('article:456:tags', 'React', 'TypeScript', '前端')

// 查询同时有 "TypeScript" 和 "前端" 标签的文章
const common = await redis.sinter('article:123:tags', 'article:456:tags')
// ['TypeScript', '前端']

// 查询有 "Vue" 或 "React" 标签的文章
const union = await redis.sunion('tag:Vue:articles', 'tag:React:articles')
```

### ZSet：排行榜

```typescript
// 添加分数
await redis.zadd('leaderboard', [
  { score: 1500, value: 'player1' },
  { score: 1200, value: 'player2' },
  { score: 1800, value: 'player3' },
])

// 获取 Top 10
const top10 = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES')

// 获取某个玩家的排名
const rank = await redis.zrevrank('leaderboard', 'player1')

// 增加分数
await redis.zincrby('leaderboard', 100, 'player1')
```

## 缓存穿透、击穿、雪崩

### 缓存穿透：查询不存在的数据

```typescript
// 问题：恶意请求不存在的 ID，每次都打到数据库
async function getProduct(id: string) {
  const cached = await redis.get(`product:${id}`)
  if (cached) return JSON.parse(cached)
  
  const product = await db.product.findUnique({ where: { id } })
  if (product) {
    await redis.setex(`product:${id}`, 3600, JSON.stringify(product))
  } else {
    // ✅ 解决方案：缓存空值，设置较短过期时间
    await redis.setex(`product:${id}`, 60, 'NULL')
  }
  
  return product
}
```

### 缓存击穿：热点 Key 过期

```typescript
// 问题：热点 Key 过期瞬间，大量请求打到数据库
async function getHotArticle(id: string) {
  const cached = await redis.get(`article:${id}`)
  if (cached) return JSON.parse(cached)
  
  // ✅ 解决方案：使用分布式锁，只让一个请求查数据库
  const lockKey = `lock:article:${id}`
  const acquired = await redis.set(lockKey, '1', 'EX', 10, 'NX')
  
  if (acquired) {
    try {
      // 双重检查
      const recheck = await redis.get(`article:${id}`)
      if (recheck) return JSON.parse(recheck)
      
      const article = await db.article.findUnique({ where: { id } })
      if (article) {
        await redis.setex(`article:${id}`, 3600, JSON.stringify(article))
      }
      return article
    } finally {
      await redis.del(lockKey)
    }
  } else {
    // 等待后重试
    await sleep(100)
    return getHotArticle(id)
  }
}
```

### 缓存雪崩：大量 Key 同时过期

```typescript
// 问题：大量 Key 在同一时间过期，数据库压力骤增

// ✅ 解决方案：过期时间加随机值
async function setCache(key: string, value: any, baseTTL: number) {
  // 在基础 TTL 上增加 0-300 秒的随机偏移
  const randomOffset = Math.floor(Math.random() * 300)
  const ttl = baseTTL + randomOffset
  
  await redis.setex(key, ttl, JSON.stringify(value))
}

// 或者使用不同的基础过期时间
const ttlMap = {
  'user': 3600,
  'article': 7200,
  'config': 86400,
}
```

## 缓存更新策略

### 主动更新 vs 被动过期

```typescript
// 主动更新（数据变更时）
async function updateArticle(id: string, data: Partial<Article>) {
  const article = await db.article.update({ where: { id }, data })
  await redis.del(`article:${id}`) // 删除缓存
}

// 被动过期（设置合理的 TTL）
await redis.setex('article:123', 3600, JSON.stringify(article))
```

### 双写一致性方案

| 方案 | 说明 | 适用场景 |
|------|------|---------|
| 先删缓存再更新 DB | 简单，但可能短暂读到旧数据 | 对一致性要求不高 |
| 先更新 DB 再删缓存 | 推荐，一致性更好 | 大多数场景 |
| 延迟双删 | 删缓存 → 更新 DB → 延迟再删 | 高一致性要求 |
| 订阅 Binlog | 通过 Canal 等工具监听 DB 变更 | 大型系统 |

## 监控与运维

### 关键监控指标

```bash
# 查看 Redis 信息
redis-cli info

# 关键指标：
# used_memory: 内存使用量
# connected_clients: 连接数
# ops: 每秒操作数
# hit_rate: 缓存命中率
# evicted_keys: 被驱逐的 Key 数量
```

### 缓存命中率监控

```typescript
// 计算缓存命中率
async function getCacheHitRate() {
  const info = await redis.info('stats')
  const hits = parseInt(info.keyspace_hits)
  const misses = parseInt(info.keyspace_misses)
  const total = hits + misses
  
  return total > 0 ? (hits / total * 100).toFixed(2) + '%' : 'N/A'
}

// 命中率低于 80% 需要关注
```

## 总结

Redis 缓存的核心原则：

1. **选择合适的缓存模式**——Cache Aside 适合大多数场景
2. **善用数据结构**——String、Hash、List、Set、ZSet 各有用途
3. **防范三大问题**——穿透（缓存空值）、击穿（分布式锁）、雪崩（随机 TTL）
4. **监控命中率**——低于 80% 说明缓存策略需要调整

缓存不是银弹，合理的设计比盲目加缓存更重要。
