---
title: 数据库索引优化实战指南
date: 2026-05-17
cover: https://picsum.photos/seed/db-index-optimization/800/400
desc: 从 B+ 树原理到执行计划分析，掌握数据库索引优化的核心技能
tags: [数据库, 索引优化, 性能优化, 后端开发]
---

## 为什么索引如此重要

一个没有索引的查询可能需要扫描全表 100 万行数据，而有了正确的索引，可能只需要读取 3-4 个磁盘页。这就是毫秒级和秒级的区别。

## 索引底层：B+ 树

### 结构示意

```
         [10, 20, 30]        ← 根节点（索引页）
        /    |    |    \
   [1-9]  [11-19] [21-29] [31-40]  ← 叶子节点（数据页）
     ↓       ↓       ↓       ↓
   数据     数据     数据     数据
```

### B+ 树的特点

- **所有数据都在叶子节点**——内部节点只存储索引键
- **叶子节点之间有链表连接**——范围查询高效
- **树的高度通常只有 3-4 层**——100 万数据只需 3 次磁盘 I/O

## 索引类型

### 聚簇索引（主键索引）

```sql
-- InnoDB 中，主键自动创建聚簇索引
-- 数据按主键顺序存储在叶子节点
CREATE TABLE users (
    id INT PRIMARY KEY,  -- 聚簇索引
    name VARCHAR(50),
    email VARCHAR(100)
);
```

### 二级索引

```sql
-- 二级索引的叶子节点存储的是 (索引值, 主键值)
CREATE INDEX idx_email ON users(email);

-- 查询流程：
-- 1. 在 idx_email 中找到 email = 'alice@example.com' 的叶子节点
-- 2. 获取对应的主键值 id = 5
-- 3. 在聚簇索引中通过 id = 5 找到完整行数据（回表）
```

### 联合索引（复合索引）

```sql
-- 最左前缀原则
CREATE INDEX idx_name_age ON users(name, age);

-- ✅ 可以使用索引
SELECT * FROM users WHERE name = 'Alice'
SELECT * FROM users WHERE name = 'Alice' AND age = 25

-- ❌ 不能使用索引（跳过了 name）
SELECT * FROM users WHERE age = 25
```

### 覆盖索引

```sql
-- 如果查询的列都在索引中，不需要回表
CREATE INDEX idx_email_name ON users(email, name);

-- 覆盖索引查询（Extra 显示 "Using index"）
SELECT email, name FROM users WHERE email = 'alice@example.com'
```

## 执行计划分析

### EXPLAIN 关键字段

```sql
EXPLAIN SELECT * FROM orders 
WHERE user_id = 100 AND status = 'pending'
ORDER BY created_at DESC
LIMIT 20;
```

| 字段 | 含义 | 理想值 |
|------|------|--------|
| type | 访问类型 | ref / range / const |
| possible_keys | 可能使用的索引 | 有 |
| key | 实际使用的索引 | 有 |
| rows | 预估扫描行数 | 越少越好 |
| Extra | 额外信息 | Using index / Using where |

### type 字段解读

```
从好到坏：
system > const > eq_ref > ref > range > index > ALL

ALL: 全表扫描（最差）
index: 全索引扫描
range: 范围扫描（WHERE id BETWEEN 1 AND 100）
ref: 非唯一索引查找（WHERE email = 'x'）
eq_ref: 唯一索引查找（WHERE id = 1）
const: 主键常量查找（最优）
```

## 索引优化实战

### 场景一：慢查询优化

```sql
-- 原始查询（全表扫描，2 秒）
SELECT * FROM orders 
WHERE YEAR(created_at) = 2026 AND MONTH(created_at) = 5;

-- 问题：函数导致索引失效

-- 优化后（范围扫描，50 毫秒）
SELECT * FROM orders 
WHERE created_at >= '2026-05-01' AND created_at < '2026-06-01';

-- 添加索引
CREATE INDEX idx_created_at ON orders(created_at);
```

### 场景二：分页优化

```sql
-- 深分页问题（OFFSET 100000，扫描 10 万行后丢弃）
SELECT * FROM articles ORDER BY id LIMIT 20 OFFSET 100000;

-- 优化方案一：延迟关联
SELECT a.* FROM articles a
INNER JOIN (
    SELECT id FROM articles ORDER BY id LIMIT 20 OFFSET 100000
) b ON a.id = b.id;

-- 优化方案二：游标分页（推荐）
SELECT * FROM articles 
WHERE id > 100000  -- 上一页最后一条的 id
ORDER BY id 
LIMIT 20;
```

### 场景三：LIKE 查询优化

```sql
-- ❌ 前缀通配符，索引失效
SELECT * FROM users WHERE name LIKE '%张%';

-- ✅ 前缀匹配，可以使用索引
SELECT * FROM users WHERE name LIKE '张%';

-- 需要全文搜索？使用 Elasticsearch
```

### 场景四：ORDER BY 优化

```sql
-- 如果 ORDER BY 的列没有索引，会产生 filesort
SELECT * FROM articles WHERE category_id = 1 ORDER BY views DESC;

-- 添加联合索引
CREATE INDEX idx_category_views ON articles(category_id, views);

-- 现在 ORDER BY 可以直接使用索引，无需 filesort
```

## 索引设计原则

### 应该建索引的场景

| 场景 | 建议 |
|------|------|
| WHERE 条件列 | 频繁查询的条件列 |
| JOIN 列 | 关联查询的外键列 |
| ORDER BY 列 | 排序列 |
| GROUP BY 列 | 分组列 |
| 唯一约束 | 唯一索引 |

### 不应该建索引的场景

| 场景 | 原因 |
|------|------|
| 数据量小的表 | 全表扫描比索引查找更快 |
| 频繁更新的列 | 每次更新都要维护索引 |
| 区分度低的列 | 如性别（只有男/女），索引效果差 |
| TEXT/BLOB 列 | 需要前缀索引或全文索引 |

### 联合索引列顺序

```sql
-- 原则：区分度高的列放前面
-- 错误：status 只有 3 个值，区分度低
CREATE INDEX idx_status_created ON orders(status, created_at);

-- 正确：created_at 区分度高
CREATE INDEX idx_created_status ON orders(created_at, status);
```

## 索引维护

### 查找未使用的索引

```sql
-- MySQL 8.0+
SELECT 
    table_schema, table_name, index_name
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE index_name IS NOT NULL
    AND count_star = 0
    AND table_schema = 'your_database'
ORDER BY table_name, index_name;
```

### 查找重复索引

```sql
-- 以下两个索引重复，可以删除 idx_name
-- KEY idx_name (name)
-- KEY idx_name_age (name, age)
```

### 索引大小监控

```sql
SELECT 
    table_name,
    index_name,
    ROUND(stat_value * @@innodb_page_size / 1024 / 1024, 2) AS size_mb
FROM mysql.innodb_index_stats
WHERE stat_name = 'size'
    AND database_name = 'your_database'
ORDER BY size_mb DESC;
```

## 常见误区

| 误区 | 真相 |
|------|------|
| 索引越多越好 | 索引会增加写入和存储开销 |
| 主键用 UUID | UUID 无序，导致页分裂，推荐自增 ID |
| 所有 WHERE 列都加索引 | 区分度低的列加了也没用 |
| 索引建了就一劳永逸 | 需要定期分析和优化 |

## 总结

索引优化的核心步骤：

1. **慢查询日志**——找到需要优化的查询
2. **EXPLAIN 分析**——理解执行计划
3. **添加合适索引**——联合索引、覆盖索引
4. **验证效果**——对比优化前后的执行时间
5. **定期维护**——清理无用索引

记住：索引是读写之间的权衡。每次添加索引前，先问自己——这个查询真的频繁到需要索引吗？
