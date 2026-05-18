---
title: 数据库设计实战：从需求到 SQL 的完整流程
date: 2026-05-17
cover: https://picsum.photos/seed/db-design-practical/800/400
desc: 结合实际项目经验，讲解数据库设计的完整流程——从需求分析、ER 图设计、范式选择到索引优化
tags: [数据库设计, SQL, MySQL, 后端架构]
---

## 从需求到数据模型

数据库设计最大的坑不是技术，而是**没有理解业务就开始建表**。我见过太多项目，一开始建了 20 张表，三个月后发现 15 张要改。

### 第一步：列出业务实体

拿一个电商系统来说，先别想表结构，先列出"这个世界里有什么"：

```
用户、商品、分类、购物车、订单、订单项、支付记录、收货地址、评价
```

### 第二步：确定关系

```
用户 1:N 订单        （一个用户可以有多个订单）
订单 1:N 订单项      （一个订单包含多个商品）
商品 N:M 分类        （一个商品可以属于多个分类）
用户 1:N 收货地址    （一个用户可以有多个地址）
订单 1:1 支付记录    （一个订单对应一次支付）
```

### 第三步：画 ER 图

不需要专业工具，纸笔就行。关键是理清关系，不是画得好看。

## 表结构设计

### 用户表

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,
    status TINYINT NOT NULL DEFAULT 1 COMMENT '0=禁用, 1=正常',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**设计要点**：
- 主键用 `BIGINT UNSIGNED AUTO_INCREMENT`，不用 UUID（UUID 作为主键会导致 B+ 树页分裂）
- 所有表统一 `created_at`、`updated_at`
- 软删除用 `deleted_at`，不用 `is_deleted`（保留删除时间有审计价值）
- 字符集用 `utf8mb4`，不是 `utf8`（utf8 在 MySQL 中是 3 字节，存不了 emoji）

### 订单表

```sql
CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(32) NOT NULL UNIQUE COMMENT '业务订单号',
    user_id BIGINT UNSIGNED NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL COMMENT '订单总金额（分）',
    discount_amount DECIMAL(10, 2) DEFAULT 0.00 COMMENT '优惠金额',
    pay_amount DECIMAL(10, 2) NOT NULL COMMENT '实付金额',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '0=待支付, 1=已支付, 2=已发货, 3=已完成, 4=已取消',
    pay_type TINYINT DEFAULT NULL COMMENT '1=支付宝, 2=微信, 3=银行卡',
    pay_time TIMESTAMP NULL DEFAULT NULL,
    ship_time TIMESTAMP NULL DEFAULT NULL,
    finish_time TIMESTAMP NULL DEFAULT NULL,
    receiver_name VARCHAR(50) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    receiver_address VARCHAR(500) NOT NULL,
    remark VARCHAR(500) DEFAULT NULL COMMENT '用户备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_order_no (order_no),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**金额为什么用 DECIMAL 不用 INT（分）？**

很多人说金额用 INT 存"分"避免精度问题。实际上 `DECIMAL(10, 2)` 在 MySQL 中也是精确的，而且查询时不需要 `/ 100` 转换。除非你有特殊的高频交易场景，否则 DECIMAL 更直观。

## 范式 vs 反范式

### 第三范式（3NF）

3NF 要求：每个非主键列都直接依赖于主键，不依赖于其他非主键列。

```sql
-- 符合 3NF
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,
    total_amount DECIMAL(10, 2)
)

CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50)
)

-- 查询需要 JOIN
SELECT o.id, o.total_amount, u.username 
FROM orders o JOIN users u ON o.user_id = u.id
```

### 什么时候该反范式

当查询性能成为瓶颈时，适当的冗余是值得的：

```sql
-- 反范式：在订单表中冗余用户名
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,
    username VARCHAR(50),  -- 冗余字段
    total_amount DECIMAL(10, 2)
)

-- 查询不需要 JOIN
SELECT id, total_amount, username FROM orders WHERE user_id = 123
```

**反范式的原则**：
1. 冗余的字段应该是**读多写少**的（用户名很少改）
2. 冗余的字段应该是**高频查询**的（订单列表页每页都显示用户名）
3. 更新时必须保证一致性（用事务或事件驱动）

## 索引设计

### B+ 树索引原理简述

MySQL InnoDB 的索引是 B+ 树结构：
- 叶子节点存储实际数据（聚簇索引）或主键值（二级索引）
- 非叶子节点只存储索引值，用于导航
- 叶子节点之间用双向链表连接（范围查询高效）

### 联合索引的最左前缀原则

```sql
-- 创建联合索引
ALTER TABLE orders ADD INDEX idx_user_status (user_id, status);

-- 能用到索引的查询
SELECT * FROM orders WHERE user_id = 1                    -- ✅ 用到索引
SELECT * FROM orders WHERE user_id = 1 AND status = 1     -- ✅ 用到索引
SELECT * FROM orders WHERE user_id = 1 ORDER BY status    -- ✅ 用到索引

-- 用不到索引的查询
SELECT * FROM orders WHERE status = 1                     -- ❌ 缺少最左列
SELECT * FROM orders WHERE status = 1 AND user_id = 1     -- ✅ 优化器会调整顺序
```

### 覆盖索引

```sql
-- 如果查询只需要 user_id 和 status
SELECT user_id, status FROM orders WHERE user_id = 1

-- idx_user_status 就是覆盖索引，不需要回表查数据
```

覆盖索引是性能优化的利器——如果索引包含了查询需要的所有列，就不需要回表查数据行。

### 索引不是越多越好

每个索引都有代价：
- **写操作变慢**：INSERT/UPDATE/DELETE 需要更新所有相关索引
- **占用磁盘空间**：一个索引大约占数据量的 20-40%
- **优化器选择困难**：索引太多可能导致优化器选错索引

**经验法则**：单表索引不超过 5 个。超过的话，考虑是否表设计有问题。

## 分库分表

### 什么时候需要

- 单表数据量超过 **2000 万行**
- 单表大小超过 **10GB**
- 单表 QPS 超过 **5000**

### 分表策略

```sql
-- 按用户 ID 哈希分表
-- orders_0, orders_1, ..., orders_15 (16 张表)
-- 表名 = orders_(user_id % 16)

-- 按时间范围分表
-- orders_202601, orders_202602, orders_202603
-- 适合有时间范围查询的场景
```

### 分表后的问题

1. **跨分片查询**：需要中间件（ShardingSphere、MyCat）或应用层聚合
2. **分布式 ID**：雪花算法、号段模式、Redis 自增
3. **分布式事务**：Seata、Saga 模式
4. **排序和分页**：需要在应用层合并结果

## 实战案例：电商订单系统

完整的表结构设计：

```sql
-- 商品表
CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category_id BIGINT UNSIGNED,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category_id),
    INDEX idx_status (status)
);

-- 购物车表
CREATE TABLE cart_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_product (user_id, product_id),
    INDEX idx_user (user_id)
);

-- 订单表（见上文）

-- 订单项表
CREATE TABLE order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    product_name VARCHAR(200) NOT NULL COMMENT '冗余，防止商品改名后订单显示不一致',
    product_price DECIMAL(10, 2) NOT NULL COMMENT '下单时的价格',
    quantity INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    INDEX idx_order (order_id)
);

-- 支付记录表
CREATE TABLE payment_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL UNIQUE,
    transaction_id VARCHAR(64) NOT NULL COMMENT '第三方支付流水号',
    amount DECIMAL(10, 2) NOT NULL,
    pay_type TINYINT NOT NULL,
    status TINYINT DEFAULT 0 COMMENT '0=处理中, 1=成功, 2=失败',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_transaction (transaction_id)
);
```

## 总结

数据库设计没有银弹。好的设计来自：
1. **理解业务**：比理解技术更重要
2. **适度冗余**：3NF 是起点，不是终点
3. **索引谨慎**：每个索引都要有明确的查询场景
4. **预留扩展**：字段类型留有余地（VARCHAR 长度、DECIMAL 精度）
5. **持续优化**：上线后根据慢查询日志调整
