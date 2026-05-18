---
title: 边缘计算与 Serverless：2026 年的后端新范式
date: 2026-05-18
cover: https://picsum.photos/seed/edge-serverless-2026/800/400
desc: Gartner 预测 70% 新工作负载将采用边缘和 Serverless 架构，本文详解 Cloudflare Workers、Vercel Edge 和 Deno Deploy
tags: [边缘计算, Serverless, Cloudflare Workers, Vercel, Deno]
---

## 为什么边缘计算在 2026 年爆发

三个原因：延迟、成本、AI。

**延迟**：用户对慢的容忍度越来越低。研究表明，每增加 100ms 延迟，转化率下降 1%。传统中心化服务器，跨国请求动辄 200-500ms。边缘节点把计算推到离用户最近的地方，延迟可以降到 10-50ms。

**成本**：Serverless 按调用计费，不用为空闲资源买单。对于流量波动大的应用，成本可以降低 60-80%。

**AI**：AI 应用需要快速响应。用户提问后等 5 秒出结果是不可接受的。边缘计算可以做预处理、缓存、流式响应，让 AI 应用更流畅。

## 边缘 vs 传统架构

```
传统架构：
用户 ──────────────► 中心服务器（弗吉尼亚）
        200-500ms

边缘架构：
用户 ───► 边缘节点（东京/上海/新加坡）
        10-50ms
```

| 维度 | 传统服务器 | 边缘计算 |
|------|-----------|---------|
| 延迟 | 100-500ms | 10-50ms |
| 部署 | 分钟级 | 秒级 |
| 扩容 | 手动/自动 | 自动 |
| 成本 | 固定 + 波动 | 纯按量 |
| 冷启动 | 无 | 0-50ms |
| 运维 | 需要团队 | 几乎为零 |
| 限制 | 无 | CPU/内存/时间 |

## 三大平台对比

| 平台 | 冷启动 | 运行时 | 数据库 | 最适合 |
|------|--------|--------|--------|--------|
| Cloudflare Workers | 0-5ms | V8 isolate | D1/KV/R2 | API、代理 |
| Vercel Edge Functions | 0-10ms | V8 isolate | Vercel KV/Postgres | Next.js 应用 |
| Deno Deploy | 0-10ms | Deno | Deno KV | TypeScript 项目 |
| AWS Lambda@Edge | 50-200ms | Node/Python | DynamoDB | 复杂逻辑 |

**冷启动对比**：Cloudflare Workers 最快，因为它用的是 V8 isolate 而不是容器。

## 实战：Cloudflare Workers

### 创建项目

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录
wrangler login

# 创建项目
npm create cloudflare@latest my-api
```

### 编写 Worker

```typescript
// src/index.ts
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // 路由
    if (url.pathname === '/api/hello') {
      return Response.json({ message: 'Hello from the edge!' });
    }
    
    if (url.pathname === '/api/user' && request.method === 'POST') {
      const body = await request.json();
      // 存储到 KV
      await env.MY_KV.put(`user:${body.id}`, JSON.stringify(body));
      return Response.json({ success: true });
    }
    
    if (url.pathname.startsWith('/api/user/')) {
      const id = url.pathname.split('/').pop();
      const data = await env.MY_KV.get(`user:${id}`);
      if (!data) {
        return new Response('Not found', { status: 404 });
      }
      return Response.json(JSON.parse(data));
    }
    
    return new Response('Not found', { status: 404 });
  },
};
```

### 配置 wrangler.toml

```toml
name = "my-api"
main = "src/index.ts"
compatibility_date = "2026-05-18"

# KV 存储
[[kv_namespaces]]
binding = "MY_KV"
id = "your-kv-id"

# D1 数据库（SQLite）
[[d1_databases]]
binding = "DB"
database_name = "my-db"
database_id = "your-db-id"

# 环境变量
[vars]
ENVIRONMENT = "production"

# 密钥（用 wrangler secret put 设置）
# [secrets]
# API_KEY
```

### 本地开发

```bash
wrangler dev
```

### 部署

```bash
wrangler deploy
```

就这么简单。你的 API 现在运行在全球 300+ 边缘节点上。

## 实战：D1 数据库

Cloudflare D1 是运行在边缘的 SQLite 数据库。

### 创建数据库

```bash
# 创建数据库
wrangler d1 create my-db

# 在本地执行 SQL
wrangler d1 execute my-db --local --file=./schema.sql

# 在生产执行
wrangler d1 execute my-db --remote --file=./schema.sql
```

### 使用

```typescript
// schema.sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

```typescript
// src/index.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // 创建用户
    if (url.pathname === '/api/users' && request.method === 'POST') {
      const { name, email } = await request.json();
      const id = crypto.randomUUID();
      
      await env.DB.prepare(
        'INSERT INTO users (id, name, email) VALUES (?, ?, ?)'
      ).bind(id, name, email).run();
      
      return Response.json({ id, name, email });
    }
    
    // 查询用户
    if (url.pathname === '/api/users') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM users ORDER BY created_at DESC LIMIT 100'
      ).all();
      
      return Response.json(results);
    }
    
    // 搜索用户
    if (url.pathname === '/api/users/search') {
      const q = url.searchParams.get('q');
      const { results } = await env.DB.prepare(
        'SELECT * FROM users WHERE name LIKE ? OR email LIKE ?'
      ).bind(`%${q}%`, `%${q}%`).all();
      
      return Response.json(results);
    }
    
    return new Response('Not found', { status: 404 });
  },
};
```

## 实战：AI 推理在边缘

2026 年最热门的场景：在边缘运行 AI 模型。

### 使用 Cloudflare AI

```typescript
// src/index.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { prompt } = await request.json();
    
    // 调用 Workers AI
    const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: 'system', content: '你是一个有帮助的助手' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500
    });
    
    return Response.json(response);
  },
};
```

### 流式响应

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { prompt } = await request.json();
    
    // 流式生成
    const stream = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [{ role: 'user', content: prompt }],
      stream: true
    });
    
    // 返回 SSE 流
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  },
};
```

### 图片生成

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { prompt } = await request.json();
    
    const response = await env.AI.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', {
      prompt
    });
    
    // response 是图片的二进制数据
    return new Response(response, {
      headers: { 'Content-Type': 'image/png' }
    });
  },
};
```

## 边缘计算的限制

边缘计算不是银弹，有一些限制需要知道：

### 1. CPU 时间限制

| 平台 | CPU 时间限制 |
|------|-------------|
| Cloudflare Workers Free | 10ms |
| Cloudflare Workers Paid | 30s |
| Vercel Edge | 60s |
| Deno Deploy | 50ms (free) / 300s (pro) |

**解决方案**：对于耗时任务，使用 Durable Objects 或 Queue。

```typescript
// 使用 Durable Objects 处理长时间任务
export class TaskProcessor {
  async fetch(request: Request): Promise<Response> {
    const { task } = await request.json();
    
    // 这里有更长的 CPU 时间
    const result = await this.processLongTask(task);
    
    return Response.json(result);
  }
  
  async processLongTask(task: any) {
    // 复杂计算...
    return result;
  }
}
```

### 2. 内存限制

- Cloudflare Workers: 128MB
- Vercel Edge: 128MB

**解决方案**：流式处理大数据。

```typescript
// 不要一次性加载大文件
const bad = await request.arrayBuffer(); // 可能 OOM

// 使用流
const good = new Response(
  request.body!.pipeThrough(new TransformStream({
    transform(chunk, controller) {
      // 逐块处理
      controller.enqueue(process(chunk));
    }
  }))
);
```

### 3. 无状态

边缘函数默认无状态，每次请求可能跑在不同节点。

**解决方案**：使用 KV/D1 持久化。

### 4. 冷启动

虽然边缘计算冷启动很快（0-10ms），但依然存在。

**解决方案**：
- 使用定时 ping 保持活跃
- 预热关键路径

```typescript
// 预热脚本（用 Cron 触发）
export default {
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    // 每 5 分钟 ping 一次关键 API
    await fetch('https://your-api.com/api/warmup');
  }
};
```

## 最佳实践

### 1. 缓存策略

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const cacheKey = `cache:${url.pathname}`;
    
    // 先查缓存
    const cached = await env.MY_KV.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 计算结果
    const data = await computeData();
    
    // 存缓存（TTL 60 秒）
    await env.MY_KV.put(cacheKey, JSON.stringify(data), {
      expirationTtl: 60
    });
    
    return Response.json(data);
  },
};
```

### 2. 错误处理

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      // 业务逻辑
      return await handleRequest(request, env);
    } catch (err) {
      // 记录错误
      console.error(err);
      
      // 返回友好错误
      return Response.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  },
};
```

### 3. 请求合并

```typescript
// 使用 Durable Objects 合并重复请求
export class RequestMerger {
  pending: Map<string, Promise<any>> = new Map();
  
  async fetch(request: Request): Promise<Response> {
    const key = await this.getRequestKey(request);
    
    // 如果有相同请求正在处理，等待它
    if (this.pending.has(key)) {
      const result = await this.pending.get(key);
      return Response.json(result);
    }
    
    // 创建新请求
    const promise = this.handleRequest(request);
    this.pending.set(key, promise);
    
    try {
      const result = await promise;
      return Response.json(result);
    } finally {
      this.pending.delete(key);
    }
  }
}
```

## 成本对比

以 100 万次请求/月为例：

| 平台 | 计算成本 | 数据库成本 | 总成本 |
|------|---------|-----------|--------|
| 传统 VPS | $50/月 | $20/月 | $70/月 |
| AWS Lambda | $0.20 | $15 (DynamoDB) | $15.20 |
| Cloudflare Workers | $0 (free tier) | $5 (D1) | $5 |
| Vercel Edge | $0 (free tier) | $10 (KV) | $10 |

**结论**：边缘计算 + Serverless 对于中小项目非常划算。

## 迁移策略

从传统服务器迁移到边缘计算：

### Phase 1：边缘缓存

先把静态资源和 API 响应缓存到边缘。

```typescript
// CDN 缓存静态资源
export default {
  async fetch(request: Request): Promise<Response> {
    const cache = caches.default;
    
    // 检查缓存
    let response = await cache.match(request);
    if (response) {
      return response;
    }
    
    // 回源
    response = await fetch(request);
    
    // 缓存响应
    if (response.ok) {
      const headers = new Headers(response.headers);
      headers.set('Cache-Control', 'public, max-age=3600');
      response = new Response(response.body, { ...response, headers });
      ctx.waitUntil(cache.put(request, response.clone()));
    }
    
    return response;
  },
};
```

### Phase 2：边缘 API

把无状态的 API 迁移到边缘函数。

### Phase 3：数据库迁移

从中心化数据库迁移到边缘数据库（D1/PlanetScale/Neon）。

### Phase 4：全栈边缘

整个应用都跑在边缘上。

## 总结

边缘计算和 Serverless 在 2026 年已经不是新技术，而是默认选项。

选择平台：
- **Cloudflare Workers**：最成熟，生态最好，适合 API 和代理
- **Vercel Edge**：与 Next.js 无缝集成，适合前端团队
- **Deno Deploy**：TypeScript 体验最好，适合 Node.js 开发者

边缘计算的限制（CPU 时间、内存、冷启动）在大多数应用场景下不是问题。如果你在做 AI 应用、实时协作、全球化服务，边缘计算是必然选择。
