---
title: 从零开始：2026 年 Web AI 应用开发教程
date: 2026-05-18
cover: https://picsum.photos/seed/web-ai-tutorial/800/400
desc: 手把手教你构建一个 AI 驱动的 Web 应用，涵盖前端 AI 推理、RAG 检索和 Agent 开发
tags: [AI, Web, 教程, RAG, 浏览器]
---

## 你将学到什么

这篇文章带你从零构建一个 AI 驱动的知识库问答系统：

- 浏览器端运行 LLM（无需服务器）
- RAG 检索增强生成
- 对话记忆管理
- 完整的前端部署

最终效果：用户上传文档，提问，AI 基于文档内容回答。

## 技术选型

| 组件 | 技术栈 | 理由 |
|------|--------|------|
| 前端框架 | Next.js 15 | App Router + RSC |
| UI | Tailwind CSS | 快速开发 |
| AI 推理 | Chrome Gemini Nano API | 免费、本地运行 |
| 向量存储 | pgvector | PostgreSQL 扩展，易于部署 |
| Embedding | text-embedding-3-small | 性价比高 |
| 后端 | Vercel Edge Functions | 全球部署 |

## 第一步：初始化项目

```bash
# 创建 Next.js 项目
npx create-next-app@latest ai-knowledge-base
cd ai-knowledge-base

# 安装依赖
npm install ai @ai-sdk/openai pg drizzle-orm
npm install -D drizzle-kit
```

## 第二步：配置数据库

### 创建数据库 Schema

```typescript
// db/schema.ts
import { pgTable, text, vector, timestamp } from 'drizzle-orm/pg-core';

export const documents = pgTable('documents', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const conversations = pgTable('conversations', {
  id: text('id').primaryKey(),
  messages: text('messages').array().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### 配置 Drizzle

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### 迁移数据库

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

## 第三步：实现文档上传和向量化

### API：上传文档

```typescript
// app/api/documents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { documents } from '@/db/schema';
import OpenAI from 'openai';
import { nanoid } from 'nanoid';

const openai = new OpenAI();

// 文本分块
function chunkText(text: string, chunkSize: number = 1000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  
  // 读取文件内容
  const content = await file.text();
  
  // 分块
  const chunks = chunkText(content);
  
  // 向量化并存储
  const results = await Promise.all(
    chunks.map(async (chunk, index) => {
      // 生成 embedding
      const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunk,
      });
      
      // 存储到数据库
      const id = `${nanoid()}-${index}`;
      await db.insert(documents).values({
        id,
        title: file.name,
        content: chunk,
        embedding: embedding.data[0].embedding,
      });
      
      return id;
    })
  );
  
  return NextResponse.json({
    success: true,
    chunks: results.length,
    documentId: results[0].split('-')[0],
  });
}
```

## 第四步：实现 RAG 检索

### API：相似度搜索

```typescript
// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { documents } from '@/db/schema';
import OpenAI from 'openai';
import { sql } from 'drizzle-orm';

const openai = new OpenAI();

export async function POST(request: NextRequest) {
  const { query, limit = 5 } = await request.json();
  
  // 向量化查询
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  
  const queryVector = embedding.data[0].embedding;
  
  // 向量相似度搜索（余弦距离）
  const results = await db.execute(sql`
    SELECT 
      id,
      title,
      content,
      1 - (embedding <=> ${queryVector}::vector) as similarity
    FROM ${documents}
    ORDER BY embedding <=> ${queryVector}::vector
    LIMIT ${limit}
  `);
  
  return NextResponse.json({
    results: results.rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      similarity: r.similarity,
    })),
  });
}
```

## 第五步：实现对话 API

```typescript
// app/api/chat/route.ts
import { NextRequest } from 'next/server';
import { OpenAI } from 'openai';
import { streamText } from 'ai';
import { db } from '@/db';
import { documents } from '@/db/schema';
import { sql } from 'drizzle-orm';

const openai = new OpenAI();

export async function POST(request: NextRequest) {
  const { messages, documentId } = await request.json();
  
  // 获取最后一条用户消息
  const lastMessage = messages[messages.length - 1].content;
  
  // 向量化查询
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: lastMessage,
  });
  
  // 检索相关文档
  const relevantDocs = await db.execute(sql`
    SELECT content, 1 - (embedding <=> ${embedding.data[0].embedding}::vector) as similarity
    FROM ${documents}
    WHERE id LIKE ${documentId + '%'}
    ORDER BY embedding <=> ${embedding.data[0].embedding}::vector
    LIMIT 3
  `);
  
  // 构建上下文
  const context = relevantDocs.rows
    .map((r: any) => r.content)
    .join('\n\n---\n\n');
  
  // 流式生成回复
  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `你是一个知识库助手。基于以下文档内容回答用户问题。
如果文档中没有相关信息，请诚实说明。

文档内容：
${context}`,
    messages,
  });
  
  return result.toDataStreamResponse();
}
```

## 第六步：前端界面

```typescript
// app/page.tsx
'use client';

import { useState, useRef } from 'react';
import { useChat } from 'ai/react';

export default function Home() {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    body: { documentId },
  });
  
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch('/api/documents', {
      method: 'POST',
      body: formData,
    });
    
    const data = await res.json();
    setDocumentId(data.documentId);
    setUploading(false);
  }
  
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">AI 知识库问答</h1>
        
        {/* 文档上传 */}
        <div className="mb-8 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">上传文档</h2>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.json"
            onChange={handleUpload}
            className="mb-4"
          />
          {uploading && <p>正在处理文档...</p>}
          {documentId && (
            <p className="text-green-600">文档已上传，可以开始提问</p>
          )}
        </div>
        
        {/* 对话界面 */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">对话</h2>
          
          {/* 消息列表 */}
          <div className="h-96 overflow-y-auto mb-4 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-3 rounded-lg ${
                  m.role === 'user'
                    ? 'bg-blue-100 ml-auto max-w-[80%]'
                    : 'bg-gray-100 max-w-[80%]'
                }`}
              >
                <p className="font-semibold mb-1">
                  {m.role === 'user' ? '你' : 'AI'}
                </p>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            ))}
            {isLoading && (
              <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
                <p>思考中...</p>
              </div>
            )}
          </div>
          
          {/* 输入框 */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              name="prompt"
              value={input}
              onChange={handleInputChange}
              placeholder="输入你的问题..."
              className="flex-1 p-3 border rounded-lg"
              disabled={!documentId}
            />
            <button
              type="submit"
              disabled={!documentId || isLoading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg disabled:opacity-50"
            >
              发送
            </button>
          </form>
          
          {!documentId && (
            <p className="text-gray-500 mt-2">请先上传文档</p>
          )}
        </div>
      </div>
    </main>
  );
}
```

## 第七步：浏览器端 AI（可选）

如果想在浏览器里运行 AI（无需服务器），使用 Chrome 的 Gemini Nano API：

```typescript
// lib/browser-ai.ts
export async function checkBrowserAISupport() {
  if (!('ai' in self)) {
    return { supported: false, reason: '浏览器不支持 AI API' };
  }
  
  const capabilities = await (self as any).ai.languageModel.capabilities();
  
  return {
    supported: capabilities.available === 'readily' || capabilities.available === 'after-download',
    reason: capabilities.available === 'unavailable' ? '设备不支持' : null,
  };
}

export async function createBrowserSession() {
  const session = await (self as any).ai.languageModel.create({
    systemPrompt: '你是一个有帮助的助手。',
    temperature: 0.7,
    topK: 40,
  });
  
  return session;
}

export async function browserGenerate(session: any, prompt: string) {
  const stream = await session.promptStreaming(prompt);
  
  let result = '';
  for await (const chunk of stream) {
    result += chunk;
  }
  
  return result;
}
```

```typescript
// 在组件中使用
'use client';

import { useState, useEffect } from 'react';

export default function BrowserAI() {
  const [session, setSession] = useState<any>(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    async function init() {
      const { supported } = await checkBrowserAISupport();
      if (supported) {
        const s = await createBrowserSession();
        setSession(s);
      }
    }
    init();
  }, []);
  
  async function handleAsk() {
    if (!session) return;
    
    setLoading(true);
    const result = await browserGenerate(session, '解释一下什么是 RAG？');
    setResponse(result);
    setLoading(false);
  }
  
  return (
    <div>
      <button onClick={handleAsk} disabled={!session || loading}>
        {loading ? '生成中...' : '提问'}
      </button>
      <p>{response}</p>
    </div>
  );
}
```

## 第八步：部署

### Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel
```

### 环境变量

在 Vercel Dashboard 设置：

```
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
```

## 常见问题

### Q: 向量搜索不准确？

检查：
1. Chunk 大小是否合适（500-1500 字符最佳）
2. 是否有重叠（overlap）减少语义割裂
3. 是否使用了正确的 embedding 模型

```typescript
// 改进的分块逻辑
function chunkText(text: string, size = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size - overlap) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}
```

### Q: 回答与文档无关？

可能原因：
1. 检索到的文档不相关（提高相似度阈值）
2. System prompt 不够明确
3. 上下文太长被截断

```typescript
// 过滤低相关度结果
const relevantDocs = results.filter(r => r.similarity > 0.7);
```

### Q: 浏览器 AI 太慢？

Gemini Nano 在不同设备上性能差异大。建议：
1. 首次使用时提示用户下载模型
2. 提供云端 AI 作为备选
3. 使用 Web Worker 避免阻塞 UI

## 总结

这个教程覆盖了 Web AI 应用的核心技术栈：

1. **向量数据库**：pgvector 存储和检索文档向量
2. **RAG**：检索增强生成，让 AI 基于你的数据回答
3. **流式响应**：提升用户体验
4. **浏览器 AI**：Chrome Gemini Nano 本地运行

2026 年，AI 应用开发已经从"调 API"进化到"端到端架构设计"。理解 RAG、向量检索、流式处理这些概念，比知道怎么调某个特定 API 更重要。
