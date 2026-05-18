---
title: 数据库选型指南：PostgreSQL vs MongoDB vs 向量数据库
date: 2026-05-18
cover: https://picsum.photos/seed/database-guide-2026/800/400
desc: PostgreSQL 采用率达 55.6%，67% 的 AI 项目从 MongoDB 迁移。2026 年如何选择最适合的数据库？
tags: [PostgreSQL, MongoDB, 向量数据库, 数据库, 架构设计]
---

## 2026 年数据库格局的变化

Stack Overflow 2025 调查显示：PostgreSQL 采用率从 48.7% 飙升到 55.6%，创历史最大年增幅。MongoDB 首次出现负增长（-0.7%）。

67% 的 AI 创业公司在 2024-2025 年从 MongoDB 迁移到了 PostgreSQL。

发生了什么？

**三个趋势**：
1. **关系数据 + 向量搜索**：pgvector 让 PostgreSQL 兼具传统数据库和向量数据库能力
2. **成本压力**：MongoDB Atlas 托管成本比自建 PostgreSQL 高 3-5 倍
3. **AI 工作负载**：向量搜索成为标配，专用向量数据库 vs 扩展方案的选择

这篇文章帮你理清 2026 年的数据库选型逻辑。

## 数据库分类

```
┌─────────────────────────────────────────────────────────────┐
│                      2026 数据库全景                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  关系型 (SQL)          NoSQL              向量数据库          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │ PostgreSQL   │    │ MongoDB      │    │ Pinecone    │   │
│  │ MySQL        │    │ Redis        │    │ Qdrant      │   │
│  │ SQLite       │    │ Cassandra    │    │ Weaviate    │   │
│  └──────────────┘    │ DynamoDB     │    │ Milvus      │   │
│                      └──────────────┘    │ Chroma      │   │
│                                          └──────────────┘   │
│                                                             │
│  混合方案：PostgreSQL + pgvector = 关系 + 向量               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## PostgreSQL：2026 年的默认选择

### 为什么 PostgreSQL 赢了

| 维度 | PostgreSQL | MySQL | MongoDB |
|------|------------|-------|---------|
| 功能完整性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| 扩展生态 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| JSON 支持 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 全文搜索 | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| 向量搜索 | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐⭐ |
| 社区活跃度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

### 适合场景

1. **传统业务系统**：用户、订单、商品等关系数据
2. **AI 应用**：pgvector 支持向量搜索
3. **JSON 数据**：JSONB 类型性能优秀
4. **复杂查询**：窗口函数、CTE、存储过程

### 实战：pgvector 向量搜索

```sql
-- 启用扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 创建带向量的表
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  content TEXT,
  embedding vector(1536)
);

-- 创建向量索引（HNSW，性能最好）
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);

-- 插入数据
INSERT INTO documents (content, embedding)
VALUES ('Hello world', '[0.1, 0.2, ...]'::vector);

-- 向量搜索（余弦相似度）
SELECT 
  id,
  content,
  1 - (embedding <=> '[0.15, 0.25, ...]'::vector) AS similarity
FROM documents
ORDER BY embedding <=> '[0.15, 0.25, ...]'::vector
LIMIT 10;
```

### 实战：JSONB 查询

```sql
-- 存储 JSON 数据
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建 GIN 索引
CREATE INDEX idx_events_data ON events USING gin (data);

-- 高效查询 JSON 字段
SELECT * FROM events
WHERE data->>'type' = 'click'
  AND data->'metadata'->>'page' = '/home';

-- 聚合 JSON 数组
SELECT 
  data->>'type' AS event_type,
  COUNT(*) AS count
FROM events
GROUP BY data->>'type';
```

### 性能调优

```sql
-- 查看慢查询
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- 分析查询计划
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

-- 调整配置
-- postgresql.conf
shared_buffers = 256MB          -- 内存的 25%
effective_cache_size = 768MB    -- 内存的 75%
work_mem = 16MB                 -- 每个操作的内存
maintenance_work_mem = 128MB    -- 维护操作内存
```

## MongoDB：什么时候还值得用

### 仍然适合的场景

1. **快速迭代**：Schema 变化频繁，不需要迁移
2. **文档数据**：嵌套结构，如文章、评论
3. **时序数据**：日志、事件流
4. **地理空间**：位置服务（GeoJSON 支持好）

### 不适合的场景

1. **复杂关系**：多表关联效率低
2. **事务密集**：虽然有事务，但性能不如 SQL
3. **成本敏感**：Atlas 托管成本高

### 实战：MongoDB 聚合管道

```javascript
// 订单统计分析
db.orders.aggregate([
  // 筛选条件
  { $match: { status: 'completed', createdAt: { $gte: ISODate('2026-01-01') } } },
  
  // 按产品分组
  { $group: {
    _id: '$productId',
    totalSales: { $sum: '$total' },
    orderCount: { $sum: 1 },
    avgOrderValue: { $avg: '$total' }
  }},
  
  // 关联产品信息
  { $lookup: {
    from: 'products',
    localField: '_id',
    foreignField: '_id',
    as: 'product'
  }},
  
  // 展开数组
  { $unwind: '$product' },
  
  // 格式化输出
  { $project: {
    productName: '$product.name',
    totalSales: 1,
    orderCount: 1,
    avgOrderValue: { $round: ['$avgOrderValue', 2] }
  }},
  
  // 排序
  { $sort: { totalSales: -1 } },
  
  // 分页
  { $skip: 0 },
  { $limit: 20 }
]);
```

### MongoDB Atlas vs 自建 PostgreSQL 成本对比

| 配置 | MongoDB Atlas | 自建 PostgreSQL |
|------|---------------|-----------------|
| 4vCPU, 16GB RAM | $0.80/小时 | $0.20/小时（云主机） |
| 存储 100GB | $0.25/GB/月 | $0.10/GB/月 |
| 备份 | $0.12/GB/月 | 包含 |
| **月成本** | ~$650 | ~$180 |

差距 3.6 倍。

## 向量数据库：AI 应用的选择

### 8 大向量数据库对比

| 数据库 | 类型 | 性能 | 易用性 | 成本 | 最适合 |
|--------|------|------|--------|------|--------|
| Pinecone | 托管 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $$$ | 企业级生产 |
| Qdrant | 开源/托管 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $$ | 高性能场景 |
| Weaviate | 开源/托管 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $$ | 混合搜索 |
| Milvus | 开源/托管 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | $ | 大规模 |
| Chroma | 开源 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 免费 | 开发/原型 |
| pgvector | 扩展 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 免费 | 已有 PostgreSQL |
| Vespa | 开源 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | $ | 大规模混合 |

### 选择逻辑

```
你有 PostgreSQL 吗？
├─ 是 → 数据量 < 1000 万向量？
│        ├─ 是 → 用 pgvector
│        └─ 否 → 考虑 Qdrant 或 Milvus
│
└─ 否 → 需要托管服务？
         ├─ 是 → Pinecone（最成熟）或 Qdrant Cloud
         └─ 否 → Qdrant（自建性能最好）
```

### 实战：Qdrant 向量搜索

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from openai import OpenAI

# 初始化
qdrant = QdrantClient(":memory:")  # 或 "http://localhost:6333"
openai = OpenAI()

# 创建集合
qdrant.create_collection(
    collection_name="documents",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
)

# 插入数据
async def index_document(doc_id: str, content: str):
    # 生成 embedding
    embedding = openai.embeddings.create(
        model="text-embedding-3-small",
        input=content,
    ).data[0].embedding
    
    # 插入向量
    qdrant.upsert(
        collection_name="documents",
        points=[
            PointStruct(
                id=doc_id,
                vector=embedding,
                payload={"content": content}
            )
        ]
    )

# 搜索
async def search(query: str, limit: int = 10):
    query_embedding = openai.embeddings.create(
        model="text-embedding-3-small",
        input=query,
    ).data[0].embedding
    
    results = qdrant.search(
        collection_name="documents",
        query_vector=query_embedding,
        limit=limit,
    )
    
    return [
        {"id": r.id, "score": r.score, "content": r.payload["content"]}
        for r in results
    ]
```

### 性能基准（1000 万向量，1536 维）

| 数据库 | 索引时间 | 查询延迟 (P99) | 内存占用 |
|--------|----------|----------------|----------|
| Pinecone | 2h | 15ms | 托管 |
| Qdrant (HNSW) | 1.5h | 8ms | 12GB |
| Milvus | 1h | 10ms | 10GB |
| pgvector (HNSW) | 3h | 25ms | 8GB |
| Chroma | 4h | 50ms | 15GB |

## 混合方案：最佳实践

### 场景 1：电商系统

```
PostgreSQL（主数据库）
├─ users（用户）
├─ orders（订单）
├─ products（商品）
├─ reviews（评论）+ embedding 向量
└─ 全文搜索（内置）

Redis（缓存）
├─ 会话
├─ 购物车
└─ 热点商品
```

### 场景 2：内容平台

```
PostgreSQL
├─ 用户数据
├─ 内容元数据
└─ 评论

MongoDB
├─ 文章内容（嵌套结构）
└─ 用户行为日志

Qdrant
└─ 内容向量搜索
```

### 场景 3：AI 应用

```
PostgreSQL + pgvector
├─ 用户数据
├─ 对话历史
├─ 文档 + embedding
└─ 向量搜索

Redis
├─ Rate Limiting
└─ 缓存热门答案
```

## 迁移建议

### 从 MongoDB 迁移到 PostgreSQL

```python
# 迁移脚本示例
import pymongo
import psycopg2
from psycopg2.extras import execute_batch

mongo = pymongo.MongoClient("mongodb://localhost:27017")
pg = psycopg2.connect("postgresql://user:pass@localhost/db")

# 读取 MongoDB 数据
users = mongo.mydb.users.find({})

# 批量写入 PostgreSQL
cursor = pg.cursor()
for user in users:
    cursor.execute("""
        INSERT INTO users (id, email, name, metadata, created_at)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            metadata = EXCLUDED.metadata
    """, (
        str(user["_id"]),
        user["email"],
        user["name"],
        Json(user.get("metadata", {})),
        user.get("createdAt"),
    ))

pg.commit()
```

### 数据模型转换

| MongoDB | PostgreSQL |
|---------|------------|
| `{ _id, name, email }` | `id, name, email` 表字段 |
| `{ _id, tags: [] }` | `id` + `tags` 表（一对多） |
| `{ _id, profile: {...} }` | `id` + `profile` JSONB 字段 |
| `{ _id, embedded: [{...}] }` | `id` + `embedded` 表或 JSONB 数组 |

## 总结

2026 年的数据库选型：

1. **默认选择 PostgreSQL**：功能最全，生态最好，pgvector 支持向量搜索
2. **MongoDB 用在特定场景**：文档数据、快速迭代、时序日志
3. **向量数据库按需选择**：小规模用 pgvector，大规模用 Qdrant/Milvus
4. **混合使用**：一个项目用多个数据库很正常

关键问题：你的数据是什么结构？查询模式是什么？规模多大？回答这些问题后，选型就清晰了。
