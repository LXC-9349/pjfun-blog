---
title: 后端测试策略：单元测试、集成测试和端到端测试的平衡
date: 2026-05-17
cover: https://picsum.photos/seed/backend-testing/800/400
desc: 从实战角度讲解后端测试的分层策略，包括测试金字塔、Mock 技巧和 CI 集成
tags: [测试, 单元测试, 集成测试, 后端工程化]
---

## 测试金字塔：理论 vs 现实

测试金字塔是 Mike Cohn 提出的概念：

```
       /\
      /  \     E2E Tests (少量)
     /────\
    /      \    Integration Tests (适量)
   /────────\
  /          \   Unit Tests (大量)
 /────────────\
```

理论上，单元测试应该最多，集成测试次之，E2E 测试最少。

**但现实中很多团队的金字塔是倒过来的**：

```
 /────────────\    E2E Tests (太多)
/──────────────\
 \            /
  \──────────/    Integration Tests (少量)
   \        /
    \──────/      Unit Tests (几乎没有)
     \    /
      \  /
       \/
```

为什么？因为 E2E 测试最容易写——打开浏览器，点几个按钮，截图对比。但 E2E 测试也最脆弱、最慢、最难维护。

## 单元测试：什么该测，什么不该测

### 该测的

```python
# ✅ 测试业务逻辑
def test_calculate_discount():
    result = calculate_discount(price=100, user_level="VIP")
    assert result == 80

# ✅ 测试边界条件
def test_transfer_insufficient_balance():
    with pytest.raises(InsufficientBalanceError):
        transfer(from_account=A, to_account=B, amount=10000)

# ✅ 测试数据转换
def test_format_currency():
    assert format_currency(1234.5) == "¥1,234.50"
    assert format_currency(0) == "¥0.00"
```

### 不该测的

```python
# ❌ 不要测 getter/setter
def test_user_name():
    user = User()
    user.name = "Alice"
    assert user.name == "Alice"  # 这测的是 Python 本身

# ❌ 不要测第三方库
def test_requests_get():
    response = requests.get("https://api.example.com")
    assert response.status_code == 200  # 这测的是 requests 和网络

# ❌ 不要测 ORM 的基本操作
def test_user_save():
    user = User(name="Alice")
    user.save()
    assert User.objects.get(name="Alice") == user  # 这测的是 Django ORM
```

**原则**：测试你的逻辑，不测试框架和库的逻辑。

## Mock 的正确用法

### 什么时候该 Mock

```python
# ✅ Mock 外部服务
@patch('services.payment_gateway.charge')
def test_order_payment_success(mock_charge):
    mock_charge.return_value = {"status": "success", "transaction_id": "TXN123"}
    
    result = create_order(user_id=1, items=[...])
    
    assert result.status == "paid"
    mock_charge.assert_called_once_with(amount=99.99, method="alipay")

# ✅ Mock 时间
@patch('django.utils.timezone.now')
def test_order_auto_cancel(mock_now):
    mock_now.return_value = datetime(2026, 1, 1, 12, 0)
    
    order = create_order(...)
    mock_now.return_value = datetime(2026, 1, 1, 12, 31)  # 30 分钟后
    
    cancel_expired_orders()
    
    assert order.status == "cancelled"
```

### Mock 的陷阱

```python
# ❌ 过度 Mock：测试变得没有意义
@patch('repo.user_repo.get')
@patch('repo.order_repo.create')
@patch('services.email.send')
@patch('services.payment.charge')
@patch('services.inventory.reserve')
def test_checkout(mock_reserve, mock_charge, mock_send, mock_create, mock_get):
    mock_get.return_value = User(id=1)
    mock_reserve.return_value = True
    mock_charge.return_value = {"status": "success"}
    mock_create.return_value = Order(id=1)
    
    result = checkout(user_id=1, items=[...])
    
    assert result == {"order_id": 1}
    # 这个测试什么都 Mock 了，实际上什么都没测
```

**Mock 的原则**：
1. Mock 外部依赖（HTTP 调用、数据库、文件系统、时间）
2. 不要 Mock 你正在测试的逻辑
3. Mock 后必须验证调用参数（`assert_called_with`）
4. 如果一个测试需要 Mock 5 个以上的东西，考虑重构代码

## 集成测试：数据库测试策略

### 方案一：事务回滚

```python
import pytest
from django.test import TransactionTestCase

@pytest.mark.django_db(transaction=True)
def test_order_creation():
    """测试在事务中创建订单"""
    order = create_order(user_id=1, items=[...])
    assert order.id is not None
    # 测试结束后事务回滚，数据库恢复原状
```

优点：快，不需要清理数据。
缺点：不能测试跨事务的行为（比如一个事务提交后另一个事务读取）。

### 方案二：Testcontainers

```python
import pytest
from testcontainers.postgres import PostgresContainer

@pytest.fixture(scope="session")
def postgres():
    with PostgresContainer("postgres:15") as pg:
        yield pg.get_connection_url()

def test_order_workflow(postgres):
    """在真实 PostgreSQL 中测试完整订单流程"""
    engine = create_engine(postgres)
    # 创建表、插入数据、测试业务逻辑
```

优点：和生产的数据库完全一致。
缺点：慢，需要 Docker。

### 方案选择

| 场景 | 推荐方案 |
|------|----------|
| 单元测试中的数据库操作 | 事务回滚 / SQLite 内存库 |
| 集成测试 | Testcontainers |
| CI 环境 | Testcontainers（Docker 可用） |
| 本地开发 | 事务回滚（快） |

## 端到端测试：什么时候需要

E2E 测试应该只覆盖**关键用户路径**：

```python
# ✅ 应该测的 E2E 场景
def test_complete_purchase_flow(browser):
    """用户从浏览商品到完成支付的完整流程"""
    browser.visit("/products")
    browser.click("商品A")
    browser.click("加入购物车")
    browser.click("结算")
    browser.fill("address", "北京市朝阳区...")
    browser.select("payment", "alipay")
    browser.click("提交订单")
    assert browser.is_text_present("订单提交成功")

# ❌ 不应该用 E2E 测的
def test_discount_calculation(browser):
    """折扣计算逻辑——应该用单元测试"""
    ...
```

**E2E 测试的黄金法则**：如果一个 bug 只能通过 E2E 测试发现，那说明你的单元测试和集成测试覆盖不够。

## 测试覆盖率的意义和误区

### 覆盖率数字的陷阱

```
100% 覆盖率 ≠ 没有 bug
```

```python
def divide(a, b):
    return a / b

# 这个测试让覆盖率达到 100%
def test_divide():
    assert divide(10, 2) == 5

# 但 divide(10, 0) 会抛 ZeroDivisionError
# 覆盖率工具不知道这个 bug
```

### 有意义的覆盖率指标

| 指标 | 建议值 | 说明 |
|------|--------|------|
| 行覆盖率 | 70-80% | 超过 80% 后 ROI 急剧下降 |
| 分支覆盖率 | 60-70% | 比行覆盖率更有意义 |
| 关键路径覆盖率 | 100% | 支付、认证、权限等核心逻辑必须全覆盖 |

## CI 中的测试集成

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run unit tests
        run: pytest tests/unit/ --cov=src/ --cov-report=xml
      
      - name: Run integration tests
        run: pytest tests/integration/
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/testdb
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
```

## 总结

好的测试策略不是追求 100% 覆盖率，而是：

1. **单元测试覆盖业务逻辑**——快、稳定、易维护
2. **集成测试覆盖数据流**——确保各组件协同工作
3. **E2E 测试覆盖关键路径**——少而精，只测最重要的用户流程
4. **Mock 外部依赖，不 Mock 业务逻辑**
5. **CI 中自动运行，PR 必须通过测试才能合并**

测试是一项投资，不是成本。好的测试让你敢于重构、敢于发布、敢于在周五下午部署。
