---
title: 向量数据库选型与实战指南
date: 2026-05-17
cover: https://picsum.photos/seed/vector-db-guide/800/400
desc: 对比主流向量数据库，掌握在 RAG 系统中的实际应用
tags: [向量数据库, RAG, AI, 数据库]
---

## 什么是向量数据库

向量数据库是专门用于存储和检索向量（Embedding）的数据库。在 AI 应用中，文本、图片、音频都可以转换为向量，然后通过向量数据库进行语义搜索。

### 为什么需要专门的向量数据库

```
传统数据库：精确匹配
SELECT * FROM users WHERE name = 'Alice'

向量数据库：语义相似
找到与 "如何学习编程" 语义最相似的文档
→ "编程入门指南"（相似度 0.92）
→ "Python 基础教程"（相似度 0.85）
→ "今天天气不错"（相似度 0.12）
```

## 主流向量数据库对比

### 对比表

| 数据库 | 类型 | 部署方式 | 特点 | 适合场景 |
|--------|------|---------|------|---------|
| **Milvus** | 专用 | 自建/云 | 功能最全、性能优秀 | 大规模生产环境 |
| **Qdrant** | 专用 | 自建/云 | Rust 编写、API 友好 | 中小规模、快速原型 |
| **Pinecone** | 专用 | SaaS | 全托管、零运维 | 不想运维的团队 |
| **Chroma** | 专用 | 嵌入式 | 轻量、开发友好 | 本地开发、小项目 |
| **pgvector** | 插件 | PostgreSQL | 与 PG 集成 | 已有 PG 基础设施 |
| **Redis Search** | 模块 | Redis | 低延迟 | 实时推荐 |

## Chroma：快速上手

### 安装与基础使用

```bash
npm install chromadb
```

```typescript
import { ChromaClient } from 'chromadb'

const client = new ChromaClient({ path: './chroma_data' })

// 创建集合
const collection = await client.createCollection({
  name: 'documents',
  metadata: { description: '知识库文档' },
})

// 添加文档（自动 embedding）
await collection.add({
  ids: ['doc1', 'doc2', 'doc3'],
  documents: [
    'Vue3 的响应式系统基于 Proxy 实现',
    'React 使用虚拟 DOM 来优化渲染性能',
    'TypeScript 的类型系统是图灵完备的',
  ],
  metadatas: [
    { category: 'frontend', framework: 'vue' },
    { category: 'frontend', framework: 'react' },
    { category: 'frontend', framework: 'typescript' },
  ],
})

// 语义搜索
const results = await collection.query({
  queryTexts: ['前端框架性能对比'],
  nResults: 2,
})

console.log(results.documents[0])
// ['Vue3 的响应式系统基于 Proxy 实现', 'React 使用虚拟 DOM 来优化渲染性能']
```

## Qdrant：生产级选择

### 部署与连接

```bash
# Docker 部署
docker run -p 6333:6333 qdrant/qdrant
```

```typescript
import { QdrantClient } from '@qdrant/js-client-rest'

const client = new QdrantClient({
  url: 'http://localhost:6333',
})

// 创建集合
await client.createCollection('knowledge_base', {
  vectors: { size: 1536, distance: 'Cosine' },
})

// 插入向量
await client.upsert('knowledge_base', {
  points: [
    {
      id: 1,
      vector: [0.1, 0.2, ...], // 1536 维向量
      payload: {
        text: 'Vue3 的响应式系统',
        source: 'docs/vue3.md',
        category: 'frontend',
      },
    },
  ],
})

// 搜索
const results = await client.search('knowledge_base', {
  vector: [0.15, 0.18, ...],
  limit: 5,
  filter: {
    must: [{ key: 'category', match: { value: 'frontend' } }],
  },
})
```

## pgvector：PostgreSQL 扩展

### 安装与配置

```sql
-- 在 PostgreSQL 中启用 pgvector
CREATE EXTENSION vector;

-- 创建带向量列的表
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  text TEXT,
  metadata JSONB,
  embedding vector(1536)
);

-- 创建 HNSW 索引（加速搜索）
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);
```

```typescript
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// 插入向量
async function insertDocument(text: string, embedding: number[]) {
  await pool.query(
    'INSERT INTO documents (text, embedding) VALUES ($1, $2)',
    [text, JSON.stringify(embedding)]
  )
}

// 语义搜索
async function searchDocuments(queryEmbedding: number[], limit = 5) {
  const { rows } = await pool.query(
    `SELECT text, metadata, 
      1 - (embedding <=> $1::vector) as similarity
     FROM documents
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [JSON.stringify(queryEmbedding), limit]
  )
  return rows
}
```

## 实战：构建 RAG 系统

### 完整架构

```
文档 → 分块 → Embedding → 向量数据库
                                    ↓
用户问题 → Embedding → 向量搜索 → 相关文档 → 拼接 Prompt → LLM → 回答
```

### 完整实现

```typescript
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai'
import { QdrantVectorStore } from '@langchain/qdrant'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { QdrantClient } from '@qdrant/js-client-rest'

// 1. 文档处理
async function ingestDocument(text: string, collectionName: string) {
  // 分块
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  })
  const chunks = await splitter.splitText(text)
  
  // 生成 Embedding
  const embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-small' })
  
  // 存储到向量数据库
  const client = new QdrantClient({ url: 'http://localhost:6333' })
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    { client, collectionName }
  )
  
  await vectorStore.addDocuments(
    chunks.map((chunk, i) => ({ pageContent: chunk, metadata: { index: i } }))
  )
  
  console.log(`已导入 ${chunks.length} 个文档块`)
}

// 2. 检索增强生成
async function ragQuery(question: string, collectionName: string) {
  const embeddings = new OpenAIEmbeddings()
  const client = new QdrantClient({ url: 'http://localhost:6333' })
  
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    { client, collectionName }
  )
  
  // 检索相关文档
  const results = await vectorStore.similaritySearch(question, 3)
  const context = results.map(r => r.pageContent).join('\n\n')
  
  // 构建 Prompt
  const prompt = ChatPromptTemplate.fromTemplate(`
你是一个知识助手。请根据以下参考资料回答问题。
如果参考资料中没有相关信息，请明确告知用户。

参考资料：
{context}

问题：{question}

回答：
`)
  
  // 生成回答
  const model = new ChatOpenAI({ model: 'gpt-4o', temperature: 0.3 })
  const chain = prompt.pipe(model)
  
  const response = await chain.invoke({ context, question })
  
  return {
    answer: response.content,
    sources: results.map(r => ({
      text: r.pageContent.substring(0, 100) + '...',
      metadata: r.metadata,
    })),
  }
}

// 3. 使用示例
async function main() {
  // 导入文档
  const docContent = await fs.readFile('docs/vue3-guide.md', 'utf-8')
  await ingestDocument(docContent, 'vue_docs')
  
  // 查询
  const result = await ragQuery(
    'Vue3 的响应式系统是如何工作的？',
    'vue_docs'
  )
  
  console.log('回答:', result.answer)
  console.log('来源:', result.sources)
}
```

## 性能优化

### 批量导入

```typescript
// ❌ 逐条插入（慢）
for (const chunk of chunks) {
  await vectorStore.addDocuments([chunk])
}

// ✅ 批量插入（快）
await vectorStore.addDocuments(chunks.map(c => ({
  pageContent: c,
  metadata: {},
})), { batchSize: 100 })
```

### 混合搜索

```typescript
// 向量搜索 + 关键词搜索结合
async function hybridSearch(query: string) {
  // 向量搜索（语义匹配）
  const vectorResults = await vectorStore.similaritySearch(query, 5)
  
  // 关键词搜索（精确匹配）
  const keywordResults = await client.search('docs', {
    vector: await embeddings.embedQuery(query),
    filter: {
      must: [{
        key: 'text',
        match: { text: query.split(' ')[0] }, // 匹配关键词
      }],
    },
    limit: 3,
  })
  
  // 合并去重
  return mergeResults(vectorResults, keywordResults)
}
```

## 选型建议

| 场景 | 推荐 | 理由 |
|------|------|------|
| 本地开发/原型 | Chroma | 零配置、嵌入式 |
| 中小项目 | Qdrant | 部署简单、API 友好 |
| 大规模生产 | Milvus | 分布式、高可用 |
| 已有 PostgreSQL | pgvector | 无需额外基础设施 |
| 不想运维 | Pinecone | 全托管 SaaS |

## 总结

向量数据库是 RAG 系统的核心组件。选择时考虑：

1. **规模**——数据量决定是否需要分布式方案
2. **运维能力**——有运维团队选 Milvus，没有选 Pinecone
3. **现有基础设施**——有 PostgreSQL 优先考虑 pgvector
4. **搜索需求**——是否需要混合搜索、过滤、排序等高级功能
