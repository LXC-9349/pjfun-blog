---
title: 微服务实战：什么时候该用，什么时候不该用
date: 2026-05-17
cover: https://picsum.photos/seed/microservices-guide/800/400
desc: 从真实项目经验出发，讨论微服务架构的适用场景、拆分策略和常见陷阱
tags: [微服务, 架构设计, 分布式系统, 后端]
---

## 微服务不是银弹

先说结论：**大多数项目不需要微服务**。

如果你满足以下任一条件，请用单体架构：
- 团队人数 < 10 人
- 日活用户 < 10 万
- 业务还在快速变化中
- 没有专门的运维团队

微服务解决的是**组织问题**，不是技术问题。当你的团队大到无法在同一个代码库中高效协作时，微服务才是解药。

## 什么时候该用微服务

### 适合的场景

1. **多团队并行开发**：5 个以上团队，各自负责不同的业务域，需要独立部署
2. **异构技术栈需求**：推荐引擎用 Python，支付系统用 Java，实时通信用 Go
3. **弹性伸缩需求**：搜索服务需要 10 个实例，用户服务只需要 2 个
4. **故障隔离**：评价服务挂了不应该影响下单

### 不适合的场景

1. **创业初期**：业务方向还没确定，微服务会让改需求变成改 5 个服务
2. **简单 CRUD 应用**：一个博客、一个 CMS，不需要微服务
3. **团队没有分布式系统经验**：微服务的运维复杂度远超想象

## 服务拆分策略

### 按业务领域拆分（推荐）

```
电商系统：
├── 用户服务（User Service）       — 注册、登录、个人信息
├── 商品服务（Product Service）    — 商品 CRUD、库存
├── 订单服务（Order Service）      — 下单、订单状态
├── 支付服务（Payment Service）    — 支付对接、退款
├── 物流服务（Shipping Service）   — 发货、物流追踪
└── 通知服务（Notification Service）— 邮件、短信、推送
```

每个服务：
- 有自己的数据库（**服务间不共享数据库**）
- 有自己的部署流水线
- 有自己的版本管理

### 按技术层拆分（不推荐）

```
❌ 错误示范：
├── API 网关服务
├── 业务逻辑服务
├── 数据库访问服务
└── 缓存服务
```

这种拆分方式本质上是把单体拆成了"分布式单体"——改一个功能还是要同时改多个服务，失去了微服务的意义。

## 服务间通信

### 同步通信：REST / gRPC

```python
# REST 示例（用户服务调用订单服务）
import requests

def get_user_orders(user_id: str):
    response = requests.get(
        f"http://order-service/api/orders?user_id={user_id}",
        timeout=3
    )
    return response.json()
```

```python
# gRPC 示例（性能更好，适合内部服务间通信）
# order.proto
service OrderService {
    rpc GetUserOrders(UserIdRequest) returns (OrderListResponse);
}

# 客户端
channel = grpc.insecure_channel('order-service:50051')
stub = OrderServiceStub(channel)
response = stub.GetUserOrders(UserIdRequest(user_id="123"))
```

**选择建议**：
- 对外 API：REST（通用性好）
- 内部服务间：gRPC（性能好、类型安全）
- 需要浏览器直接调用：REST / GraphQL

### 异步通信：消息队列

```python
# 订单创建后发送事件
import pika

def create_order(order_data):
    # 1. 创建订单
    order = db.orders.insert(order_data)
    
    # 2. 发送事件
    channel.basic_publish(
        exchange='orders',
        routing_key='order.created',
        body=json.dumps({
            'order_id': order.id,
            'user_id': order.user_id,
            'amount': order.total
        })
    )
    
    return order

# 通知服务监听事件
def on_order_created(ch, method, properties, body):
    event = json.loads(body)
    send_email(event['user_id'], f"订单 {event['order_id']} 已创建")
    send_sms(event['user_id'], f"您的订单已提交")
```

**选择建议**：
- 需要即时响应：同步（REST/gRPC）
- 解耦、削峰、异步处理：消息队列（RabbitMQ / Kafka / RocketMQ）
- 事件驱动架构：Kafka（日志型，适合事件溯源）

## 数据一致性

### 本地事务不够用了

单体架构中，一个数据库事务就能保证一致性：

```sql
-- 单体：一个事务搞定
BEGIN;
INSERT INTO orders (...) VALUES (...);
UPDATE inventory SET stock = stock - 1 WHERE product_id = 1;
COMMIT;
```

微服务中，订单和库存在不同服务的不同数据库里，无法用本地事务。

### Saga 模式

Saga 是一系列本地事务，每个事务有对应的补偿操作：

```
创建订单 → 扣减库存 → 发起支付 → 发送通知
   ↓          ↓          ↓          ↓
取消订单 → 恢复库存 → 取消支付 → (无需补偿)
```

```python
# 编排式 Saga
class CreateOrderSaga:
    def execute(self, order_data):
        try:
            order = order_service.create(order_data)
            inventory_service.reserve(order.items)
            payment_service.charge(order.total)
            notification_service.send(order.user_id, "订单创建成功")
        except Exception as e:
            # 补偿（反向操作）
            notification_service.send(order.user_id, "订单创建失败")
            payment_service.refund(order.total)
            inventory_service.release(order.items)
            order_service.cancel(order.id)
            raise
```

### 事件溯源

```python
# 不存储当前状态，存储所有事件
class OrderEventStore:
    def append(self, event):
        db.events.insert(event)
    
    def get_order_state(self, order_id):
        events = db.events.find(order_id=order_id, sort='timestamp')
        state = {}
        for event in events:
            state = apply_event(state, event)
        return state

# 事件流
# OrderCreated → ItemsAdded → PaymentReceived → OrderShipped → OrderDelivered
# 任何时候都可以通过重放事件重建订单状态
```

## 服务治理

### 服务发现

```yaml
# Consul 服务注册
services:
  - name: order-service
    port: 8080
    health_check:
      http: http://localhost:8080/health
      interval: 10s
```

### 熔断器

```python
from pybreaker import CircuitBreaker

# 支付服务熔断器
payment_breaker = CircuitBreaker(
    fail_max=5,        # 连续 5 次失败后打开
    reset_timeout=30   # 30 秒后尝试半开
)

@payment_breaker
def charge_payment(amount):
    return payment_service.charge(amount)

# 状态：Closed（正常）→ Open（熔断）→ Half-Open（试探）→ Closed
```

### 限流

```python
from limits import RateLimitItemPerMinute
from limits.storage import RedisStorage
from limits.strategies import MovingWindowRateLimiter

storage = RedisStorage("redis://localhost:6379")
limiter = MovingWindowRateLimiter(storage)

# 每个用户每分钟最多 10 次请求
rate_limit = RateLimitItemPerMinute(10)

def handle_request(user_id):
    if not limiter.test(rate_limit, user_id):
        return {"error": "请求过于频繁"}, 429
    limiter.hit(rate_limit, user_id)
    return process_request()
```

## 分布式追踪

```python
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider

# 配置追踪
trace.set_tracer_provider(TracerProvider())
jaeger_exporter = JaegerExporter(agent_host_name="jaeger", agent_port=6831)

tracer = trace.get_tracer("order-service")

@tracer.start_as_current_span("create_order")
def create_order(order_data):
    with tracer.start_as_current_span("validate_order"):
        validate(order_data)
    
    with tracer.start_as_current_span("reserve_inventory"):
        inventory_service.reserve(order_data.items)
    
    with tracer.start_as_current_span("process_payment"):
        payment_service.charge(order_data.total)
```

在 Jaeger UI 中可以看到完整的调用链：
```
create_order [250ms]
├── validate_order [15ms]
├── reserve_inventory [80ms]
│   └── inventory-service.check [65ms]
└── process_payment [150ms]
    └── payment-service.charge [140ms]
```

## 真实案例：从单体到微服务的迁移

### 第一阶段：模块化

```
monolith/
├── modules/user/        # 用户模块
├── modules/product/     # 商品模块
├── modules/order/       # 订单模块
└── modules/payment/     # 支付模块
```

先在一个代码库中按业务域划分模块，模块间通过接口调用，不直接访问对方的数据库。

### 第二阶段：数据库拆分

每个模块使用独立的数据库 schema，模块间通过 API 访问对方的数据。

### 第三阶段：服务拆分

将模块拆分为独立部署的服务，逐步迁移流量。

```
# 灰度发布：10% 流量走新服务
upstream order_backend {
    server monolith:8080 weight=90;
    server order-service:8080 weight=10;
}
```

### 第四阶段：完全独立

所有服务独立部署、独立扩缩容、独立监控。

## 微服务的运维成本

很多人只看到了微服务的开发优势，忽略了运维成本：

| 运维项 | 单体 | 微服务（10 个服务） |
|--------|------|---------------------|
| 部署 | 1 个包 | 10 个包 |
| 日志 | 1 个文件 | 10 个文件 + 聚合 |
| 监控 | 1 个 Dashboard | 10 个 Dashboard |
| 排错 | 看日志 | 分布式追踪 |
| 测试 | 一次部署测试 | 集成测试 + 契约测试 |
| CI/CD | 1 条流水线 | 10 条流水线 |

**微服务让开发变快了，但运维变复杂了 10 倍。** 如果你的团队没有专门的运维人员（或 SRE），微服务可能会拖慢整体效率。

## 总结

微服务架构的决策框架：

```
团队 > 10 人？
├── 否 → 用单体
└── 是 → 业务域清晰？
    ├── 否 → 先模块化，再考虑拆分
    └── 是 → 需要独立部署？
        ├── 否 → 用模块化单体
        └── 是 → 有运维能力？
            ├── 否 → 先建立运维能力
            └── 是 → 可以用微服务
```

记住：**好的架构是演进出来的，不是设计出来的。** 从单体开始，当单体真的成为瓶颈时，再考虑微服务。
