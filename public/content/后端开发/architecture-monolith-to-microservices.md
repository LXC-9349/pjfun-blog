---
title: 系统架构设计：从单体到微服务
date: 2026-05-17
cover: https://picsum.photos/seed/architecture-evolution/800/400
desc: 理解架构演进的每个阶段，掌握何时以及如何从单体架构迁移到微服务
tags: [架构设计, 微服务, 系统设计, 后端开发]
---

## 架构不是越复杂越好

很多团队在项目初期就引入微服务、消息队列、服务网格——结果 80% 的时间花在运维上，只有 20% 的时间在做业务功能。好的架构是演进出来的，不是设计出来的。

## 架构演进的四个阶段

```
阶段一：单体应用
  ↓ 团队扩大、部署变慢
阶段二：模块化单体
  ↓ 独立部署需求
阶段三：微服务
  ↓ 服务间通信复杂
阶段四：服务网格 + 事件驱动
```

## 阶段一：单体应用

### 适用场景

- 初创团队（1-5 人）
- 产品验证阶段
- 业务逻辑简单

### 典型架构

```
┌─────────────────────────┐
│       单体应用           │
│  ┌─────┬─────┬─────┐   │
│  │用户  │订单  │支付  │   │
│  │模块  │模块  │模块  │   │
│  └─────┴─────┴─────┘   │
│         ↓               │
│      数据库              │
└─────────────────────────┘
```

### 优点与缺点

| 优点 | 缺点 |
|------|------|
| 开发简单，一个项目搞定 | 代码耦合度高 |
| 部署简单，一次部署 | 扩展只能整体扩展 |
| 调试方便，一个日志 | 技术栈锁定 |
| 事务简单，一个数据库 | 大团队协作冲突多 |

## 阶段二：模块化单体

### 何时演进

- 团队超过 10 人
- 代码库超过 10 万行
- 构建时间超过 5 分钟

### 核心思想

保持单体部署，但在代码层面严格模块化：

```
monolith/
├── modules/
│   ├── user/
│   │   ├── models/
│   │   ├── services/
│   │   ├── controllers/
│   │   └── __init__.py
│   ├── order/
│   │   ├── models/
│   │   ├── services/
│   │   ├── controllers/
│   │   └── __init__.py
│   └── payment/
│       ├── models/
│       ├── services/
│       ├── controllers/
│       └── __init__.py
├── shared/
│   ├── utils/
│   └── middleware/
└── main.py
```

### 模块间通信规则

```python
# ✅ 正确：通过公共接口
from modules.order.services import OrderService

order_service = OrderService()
order = order_service.create_order(user_id, items)

# ❌ 错误：直接访问其他模块的内部实现
from modules.order.models import Order
order = Order.objects.create(...)  # 绕过了业务逻辑
```

## 阶段三：微服务

### 何时演进

- 不同模块需要独立扩展（如订单模块需要 10 个实例，用户模块只需要 2 个）
- 不同模块需要不同技术栈
- 团队需要独立部署和发布

### 微服务架构

```
                    API Gateway
                         ↓
    ┌──────────┬─────────┼─────────┬──────────┐
    ↓          ↓         ↓         ↓          ↓
  用户服务    订单服务   支付服务  通知服务   搜索服务
    ↓          ↓         ↓         ↓          ↓
  用户DB     订单DB    支付DB    Redis      ES
```

### 服务拆分原则

| 原则 | 说明 | 示例 |
|------|------|------|
| 单一职责 | 每个服务只做一件事 | 订单服务只管订单 |
| 数据自治 | 每个服务有自己的数据库 | 不共享数据库 |
| 独立部署 | 可以单独发布不影响其他服务 | 订单服务发布不影响用户服务 |
| 团队对齐 | 一个服务由一个团队负责 | 2-pizza team |

### 服务间通信

```python
# 方式一：同步 HTTP
import httpx

async def get_user(user_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"http://user-service/users/{user_id}")
        return response.json()

# 方式二：异步消息（推荐用于解耦）
from aio_pika import connect, Message

async def publish_event(event_type: str, data: dict):
    connection = await connect("amqp://rabbitmq/")
    channel = await connection.channel()
    exchange = await channel.declare_exchange("events", type="topic")
    
    await exchange.publish(
        Message(body=json.dumps(data).encode()),
        routing_key=f"order.{event_type}",
    )
```

## 阶段四：事件驱动架构

### 核心概念

```
订单服务 ──发布──→ [事件总线] ──订阅──→ 通知服务
                                    ──订阅──→ 库存服务
                                    ──订阅──→ 数据分析服务
```

### 实现示例

```python
# 事件定义
from pydantic import BaseModel
from datetime import datetime

class OrderCreated(BaseModel):
    order_id: str
    user_id: str
    total: float
    timestamp: datetime

class OrderPaid(BaseModel):
    order_id: str
    payment_method: str
    timestamp: datetime

# 事件发布
async def create_order(data: OrderData):
    order = await db.orders.create(data)
    
    # 发布事件
    await event_bus.publish(OrderCreated(
        order_id=order.id,
        user_id=order.user_id,
        total=order.total,
        timestamp=datetime.now(),
    ))
    
    return order

# 事件处理
@event_bus.subscribe(OrderCreated)
async def send_confirmation_email(event: OrderCreated):
    user = await user_service.get(event.user_id)
    await email_service.send(user.email, "订单确认", ...)

@event_bus.subscribe(OrderCreated)
async def reserve_inventory(event: OrderCreated):
    await inventory_service.reserve(event.order_id)
```

## 微服务的代价

### 运维复杂度

| 单体 | 微服务 |
|------|--------|
| 1 个服务部署 | N 个服务部署 |
| 1 个数据库备份 | N 个数据库备份 |
| 1 套监控 | N 套监控 + 链路追踪 |
| 本地调试 | 需要本地服务网格 |
| 简单事务 | 分布式事务/SAGA |

### 分布式事务

```python
# SAGA 模式：补偿事务
async def create_order_saga(user_id, items):
    try:
        # 步骤 1：创建订单
        order = await order_service.create(user_id, items)
        
        # 步骤 2：扣减库存
        await inventory_service.reserve(order.id, items)
        
        # 步骤 3：创建支付
        payment = await payment_service.create(order.id, order.total)
        
        return order
    except Exception as e:
        # 补偿：回滚已执行的操作
        await compensate(order.id)
        raise
```

## 架构决策清单

在决定引入微服务之前，先回答这些问题：

- [ ] 团队是否超过 15 人？
- [ ] 是否有明确的独立扩展需求？
- [ ] 是否有运维能力或 DevOps 团队？
- [ ] 是否能接受调试复杂度增加？
- [ ] 是否能接受部署流程变复杂？

如果大部分答案是"否"，建议继续使用模块化单体。

## 总结

架构演进的关键原则：

1. **从简单开始**——单体应用是大多数项目的最佳起点
2. **按需演进**——遇到瓶颈再拆分，不要提前优化
3. **模块化先行**——即使不拆微服务，也要保持代码模块化
4. **运维成本是真实成本**——微服务的运维开销远超想象

记住 Martin Fowler 的话："如果你不确定是否需要微服务，那你就不需要。"
