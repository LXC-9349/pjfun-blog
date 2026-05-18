---
title: RAG 系统架构设计：从原理到生产环境部署
date: 2026-05-17
cover: https://picsum.photos/seed/rag-system/800/400
desc: 深入讲解检索增强生成（RAG）的完整架构，包括向量数据库、Embedding 模型和生成策略
tags: [RAG, 向量数据库, LLM, AI架构]
---

## 为什么需要 RAG

LLM 有两个根本问题：

1. **知识截止**：GPT-4 的训练数据截止到 2024 年，不知道 2025 年的事
2. **幻觉**：LLM 会编造看起来合理但完全错误的信息

RAG（Retrieval-Augmented Generation）的解决思路：**先检索相关知识，再让 LLM 基于这些知识回答**。

```
用户提问 → 检索相关知识 → 将知识 + 问题一起发给 LLM → 基于知识的回答
```

## 完整架构

```
┌─────────────────────────────────────────────────────┐
│                    索引阶段（离线）                    │
│                                                     │
│  文档 → 分块(Chunking) → Embedding → 向量数据库存储   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                    查询阶段（在线）                    │
│                                                     │
│  用户问题 → Embedding → 向量检索 → Top-K 相关文档     │
│       → 组装 Prompt → LLM 生成 → 返回答案             │
└─────────────────────────────────────────────────────┘
```

## Embedding 模型选择

### 主流模型对比

| 模型 | 维度 | 中文支持 | 速度 | 质量 |
|------|------|----------|------|------|
| text-embedding-3-large (OpenAI) | 3072 | 一般 | 快 | ⭐⭐⭐⭐⭐ |
| text-embedding-3-small (OpenAI) | 1536 | 一般 | 快 | ⭐⭐⭐⭐ |
| BGE-m3 (开源) | 1024 | 优秀 | 中 | ⭐⭐⭐⭐⭐ |
| M3E (开源) | 1024 | 优秀 | 中 | ⭐⭐⭐⭐ |
| GTE-Qwen2-7B (开源) | 3584 | 优秀 | 慢 | ⭐⭐⭐⭐⭐ |

### 选择建议

```
需要最好的中文效果 → BGE-m3 或 GTE-Qwen2-7B
需要快速部署 → text-embedding-3-small
预算有限（开源） → BGE-m3
多语言支持 → BGE-m3（支持 100+ 语言）
```

### 代码示例

```python
# 使用 BGE-m3
from FlagEmbedding import BGEM3FlagModel

model = BGEM3FlagModel('BAAI/bge-m3', use_fp16=True)

texts = ["什么是机器学习？", "Python 编程入门"]
embeddings = model.encode(texts)['dense_vecs']

# 计算相似度
from sklearn.metrics.pairwise import cosine_similarity
similarity = cosine_similarity([embeddings[0]], [embeddings[1]])
print(f"相似度: {similarity[0][0]:.4f}")
```

## 向量数据库对比

| 数据库 | 部署方式 | 规模 | 特点 |
|--------|----------|------|------|
| **Milvus** | 自建/云 | 十亿级 | 功能最全，适合大规模 |
| **Chroma** | 本地 | 百万级 | 轻量，适合开发和小项目 |
| **pgvector** | PostgreSQL 插件 | 千万级 | 和关系型数据一起查询 |
| **Qdrant** | 自建/云 | 十亿级 | Rust 编写，性能好 |
| **Pinecone** | SaaS | 十亿级 | 全托管，零运维 |

### 选择建议

```
开发/原型 → Chroma（pip install 即可用）
已有 PostgreSQL → pgvector（零额外部署）
生产环境大规模 → Milvus 或 Qdrant
不想运维 → Pinecone
```

## Chunking 策略

### 固定长度分块

```python
def chunk_by_fixed_size(text: str, chunk_size: int = 500, overlap: int = 50):
    """按固定字符数分块，带重叠"""
    chunks = []
    for i in range(0, len(text), chunk_size - overlap):
        chunks.append(text[i:i + chunk_size])
    return chunks
```

### 按段落分块（推荐）

```python
def chunk_by_paragraphs(text: str, max_chunk_size: int = 1000):
    """按段落分块，合并小段落"""
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = ""
    
    for para in paragraphs:
        if len(current_chunk) + len(para) > max_chunk_size:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = para
        else:
            current_chunk += "\n\n" + para if current_chunk else para
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return chunks
```

### 语义分块

```python
from langchain.text_splitter import SemanticChunker

# 基于语义相似度自动分块
chunker = SemanticChunker(
    embeddings=embedding_model,
    breakpoint_threshold_type="percentile",
    breakpoint_threshold_amount=95
)
chunks = chunker.split_text(long_document)
```

**经验法则**：
- 代码文档：按函数/类分块
- 文章：按段落分块
- 法律/合同：按条款分块
- 通用：固定长度 + 重叠（chunk_size=500, overlap=50）

## 检索优化

### 混合检索（BM25 + 向量）

```python
from rank_bm25 import BM25Okapi

class HybridRetriever:
    def __init__(self, vector_db, documents):
        self.vector_db = vector_db
        # BM25 索引
        tokenized = [doc.split() for doc in documents]
        self.bm25 = BM25Okapi(tokenized)
    
    def search(self, query: str, top_k: int = 5):
        # 向量检索
        vector_results = self.vector_db.search(query, top_k=top_k)
        
        # BM25 检索
        query_tokens = query.split()
        bm25_scores = self.bm25.get_scores(query_tokens)
        bm25_results = sorted(enumerate(bm25_scores), key=lambda x: -x[1])[:top_k]
        
        # RRF（Reciprocal Rank Fusion）融合
        fused = {}
        for rank, (idx, score) in enumerate(vector_results):
            fused[idx] = fused.get(idx, 0) + 1 / (rank + 60)
        for rank, (idx, score) in enumerate(bm25_results):
            fused[idx] = fused.get(idx, 0) + 1 / (rank + 60)
        
        return sorted(fused.items(), key=lambda x: -x[1])[:top_k]
```

### 重排序（Rerank）

```python
# 先用向量检索 Top-50，再用 Rerank 模型精排 Top-5
from FlagEmbedding import FlagReranker

reranker = FlagReranker('BAAI/bge-reranker-v2-m3', use_fp16=True)

def rerank_results(query: str, candidates: list, top_k: int = 5):
    pairs = [(query, doc) for doc in candidates]
    scores = reranker.compute_score(pairs, normalize=True)
    
    ranked = sorted(zip(candidates, scores), key=lambda x: -x[1])
    return ranked[:top_k]
```

## 生产环境部署

### 完整架构

```python
from fastapi import FastAPI
import asyncio

app = FastAPI()

class RAGSystem:
    def __init__(self):
        self.embedding_model = load_embedding_model()
        self.vector_db = connect_vector_db()
        self.reranker = load_reranker()
        self.llm = init_llm_client()
        # 缓存
        self.cache = {}
    
    async def query(self, question: str) -> dict:
        # 1. 检查缓存
        cache_key = hash(question)
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        # 2. 检索
        query_embedding = self.embedding_model.encode([question])
        docs = self.vector_db.search(query_embedding, top_k=20)
        
        # 3. 重排序
        reranked = self.reranker.rerank(question, docs, top_k=5)
        
        # 4. 组装 Prompt
        context = "\n\n".join([doc.content for doc in reranked])
        prompt = f"""基于以下信息回答问题：

{context}

问题：{question}

如果以上信息不足以回答问题，请说明"根据现有资料无法回答"。"""
        
        # 5. 生成
        response = await self.llm.generate(prompt)
        
        # 6. 缓存结果
        self.cache[cache_key] = {
            "answer": response,
            "sources": [doc.metadata for doc in reranked]
        }
        
        return self.cache[cache_key]

rag = RAGSystem()

@app.post("/query")
async def query_endpoint(question: str):
    return await rag.query(question)
```

### 延迟优化

| 阶段 | 优化前 | 优化后 |
|------|--------|--------|
| Embedding | 200ms | 50ms（本地模型 + 批处理） |
| 向量检索 | 100ms | 20ms（HNSW 索引） |
| Rerank | 300ms | 100ms（只 rerank Top-20） |
| LLM 生成 | 2000ms | 800ms（流式输出） |
| **总计** | **2600ms** | **970ms** |

## 实际案例：企业内部知识库

```python
# 文档处理流水线
import os
from pathlib import Path

def process_documents(doc_dir: str):
    """处理文档目录，构建向量索引"""
    for file_path in Path(doc_dir).rglob("*"):
        if file_path.suffix == '.md':
            content = file_path.read_text()
            
            # 分块
            chunks = chunk_by_paragraphs(content)
            
            # Embedding
            embeddings = embedding_model.encode(chunks)
            
            # 存储
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                vector_db.insert(
                    vector=embedding,
                    metadata={
                        "file": str(file_path),
                        "chunk_index": i,
                        "content": chunk
                    }
                )

# 使用
process_documents("./company-docs/")
```

## 总结

RAG 系统的核心要点：

1. **Embedding 模型决定检索质量**——中文场景选 BGE-m3
2. **Chunking 策略影响上下文完整性**——按语义分块优于固定长度
3. **混合检索 + Rerank 是最佳实践**——向量检索召回 + BM25 补充 + Rerank 精排
4. **缓存是延迟优化的关键**——相同问题不要重复检索和生成
5. **流式输出提升用户体验**——用户不需要等完整答案
