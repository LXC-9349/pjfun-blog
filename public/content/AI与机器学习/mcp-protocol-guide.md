---
title: MCP 协议深度解析：AI Agent 的 USB-C 时刻
date: 2026-05-18
cover: https://picsum.photos/seed/mcp-protocol/800/400
desc: 深入理解 Model Context Protocol，这个 9700 万下载量的协议正在统一 AI Agent 与工具的连接方式
tags: [MCP, AI Agent, 协议, Anthropic, LLM]
---

## AI Agent 的"接口之争"

2026 年 3 月，AI 圈发生了一件大事：Anthropic 开源的 MCP（Model Context Protocol）下载量突破 9700 万，OpenAI、Google、Microsoft 全部宣布支持。这个协议正在成为 AI Agent 连接外部工具的事实标准。

但就在同一个月，Perplexity 的 CTO Denis Yarats 在内部宣布放弃 MCP，转而使用 API 和 CLI。一时间，"MCP 是不是过度设计"的争论甚嚣尘上。

这篇文章不讲站队，而是帮你搞清楚：MCP 到底解决了什么问题？它适合什么场景？什么情况下不该用它？

## 问题：让 LLM 用工具为什么这么难？

在 MCP 出现之前，让 LLM 调用外部工具大致有三种方式：

### 方式一：Function Calling

```python
# OpenAI Function Calling
functions = [
    {
        "name": "get_weather",
        "description": "获取指定城市的天气",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "城市名称"}
            },
            "required": ["city"]
        }
    }
]

response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "北京今天天气怎么样？"}],
    functions=functions
)
```

**问题**：每个模型厂商的 Function Calling 格式不同，Anthropic、OpenAI、Google 各搞一套。你写了一套工具对接 OpenAI，换成 Claude 就要重写。

### 方式二：System Prompt 描述工具

```text
你是一个助手，可以使用以下工具：
1. 搜索：输入查询词，返回搜索结果
2. 数据库查询：输入 SQL，返回结果
...
使用工具时，请输出 JSON 格式：{"tool": "工具名", "params": {...}}
```

**问题**：
- 提示词越来越长，消耗大量 token
- LLM 经常输出格式错误的 JSON
- 没有标准，每个项目自己定义格式

### 方式三：自己实现 Tool Use 循环

```python
while True:
    response = llm.generate(messages)
    if needs_tool_use(response):
        tool_result = execute_tool(response.tool_call)
        messages.append({"role": "tool", "content": tool_result})
    else:
        break
```

**问题**：每个项目都要实现一遍这个循环，代码重复，调试困难。

## MCP 的解决方案

MCP 的核心思想：**把工具抽象成统一的"资源"概念，用标准化协议连接**。

```
┌─────────────┐     MCP Protocol     ┌─────────────┐
│   AI Agent  │ ◄──────────────────► │ MCP Server  │
│  (Client)   │                      │  (Tools)    │
└─────────────┘                      └─────────────┘
```

### 三个核心概念

1. **Resources**：只读数据，如文件、数据库记录
2. **Prompts**：预定义的提示模板
3. **Tools**：可执行的函数

### 一个最简 MCP Server

```python
from mcp.server import Server
from mcp.types import Tool, TextContent

server = Server("my-server")

@server.list_tools()
async def list_tools():
    return [
        Tool(
            name="get_weather",
            description="获取城市天气",
            inputSchema={
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "城市名称"}
                },
                "required": ["city"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "get_weather":
        city = arguments["city"]
        # 实际调用天气 API
        weather = await fetch_weather(city)
        return [TextContent(type="text", text=f"{city}今天{weather}")]
    raise ValueError(f"Unknown tool: {name}")
```

### 启动 Server

```bash
# 使用 stdio 传输（本地开发）
python server.py

# 使用 SSE 传输（远程部署）
python server.py --transport sse --port 8080
```

## MCP vs Function Calling：有什么区别？

| 维度 | Function Calling | MCP |
|------|-----------------|-----|
| 标准 | 各厂商私有 | 开放标准 |
| 工具定义 | 写在请求里 | 独立 Server |
| 复用性 | 换模型要重写 | 一次编写，多模型通用 |
| 调试 | 难以隔离 | Server 可独立测试 |
| 部署 | 无 | 需要运行 Server |

**MCP 的优势**：
- 工具与模型解耦，同一个 MCP Server 可以被 Claude、GPT、Gemini 共用
- 工具提供方只需要实现一个标准协议
- 社区已经有大量现成的 MCP Server（数据库、文件系统、GitHub、Slack...）

**MCP 的劣势**：
- 需要额外部署 Server，增加了运维复杂度
- 本地调试比直接 Function Calling 多一层
- 对于简单场景，可能是过度设计

## 实战：为你的项目添加 MCP 支持

### 场景：让 AI 能查询你的业务数据库

假设你有一个电商项目，想建一个 AI 助手，能回答"最近一周销量最好的商品是什么"这类问题。

#### Step 1：创建 MCP Server

```python
# mcp_server.py
import asyncpg
from mcp.server import Server
from mcp.types import Tool, TextContent

server = Server("ecommerce-analytics")

# 数据库连接池
pool = None

@server.on_startup()
async def startup():
    global pool
    pool = await asyncpg.create_pool(
        host="localhost",
        database="ecommerce",
        user="postgres",
        password="your_password"
    )

@server.list_tools()
async def list_tools():
    return [
        Tool(
            name="query_top_products",
            description="查询指定时间范围内销量最高的商品",
            inputSchema={
                "type": "object",
                "properties": {
                    "days": {
                        "type": "integer",
                        "description": "查询最近几天的数据",
                        "default": 7
                    },
                    "limit": {
                        "type": "integer", 
                        "description": "返回前几名",
                        "default": 10
                    }
                }
            }
        ),
        Tool(
            name="query_user_orders",
            description="查询用户的订单历史",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "integer"},
                    "status": {
                        "type": "string",
                        "enum": ["pending", "paid", "shipped", "completed"]
                    }
                },
                "required": ["user_id"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    async with pool.acquire() as conn:
        if name == "query_top_products":
            days = arguments.get("days", 7)
            limit = arguments.get("limit", 10)
            
            rows = await conn.fetch("""
                SELECT p.name, COUNT(*) as sales
                FROM orders o
                JOIN order_items oi ON o.id = oi.order_id
                JOIN products p ON oi.product_id = p.id
                WHERE o.created_at > NOW() - INTERVAL '%s days'
                GROUP BY p.id, p.name
                ORDER BY sales DESC
                LIMIT %s
            """, days, limit)
            
            result = "销量排行：\n"
            for i, row in enumerate(rows, 1):
                result += f"{i}. {row['name']} - {row['sales']} 件\n"
            return [TextContent(type="text", text=result)]
            
        elif name == "query_user_orders":
            user_id = arguments["user_id"]
            status = arguments.get("status")
            
            query = """
                SELECT o.id, o.total, o.status, o.created_at
                FROM orders o
                WHERE o.user_id = $1
            """
            params = [user_id]
            
            if status:
                query += " AND o.status = $2"
                params.append(status)
                
            rows = await conn.fetch(query, *params)
            
            result = f"用户 {user_id} 的订单：\n"
            for row in rows:
                result += f"- 订单{row['id']}: ¥{row['total']} ({row['status']})\n"
            return [TextContent(type="text", text=result)]
            
    raise ValueError(f"Unknown tool: {name}")

if __name__ == "__main__":
    server.run()
```

#### Step 2：配置 Claude Desktop 使用你的 MCP Server

```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "ecommerce": {
      "command": "python",
      "args": ["/path/to/mcp_server.py"]
    }
  }
}
```

#### Step 3：在 Claude 里使用

重启 Claude Desktop，然后你就可以问：

> "帮我查一下最近 7 天销量最好的 5 个商品"

Claude 会自动调用你的 MCP Server，执行 SQL 查询，返回结果。

## 生产环境部署

### 使用 SSE 传输（远程部署）

本地开发用 stdio 传输没问题，但生产环境需要：

1. **Server 部署在服务器上**：不能每个用户都本地跑
2. **认证和鉴权**：谁可以调用哪些工具
3. **监控和日志**：工具调用的审计

```python
# 启动 SSE Server
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette

sse = SseServerTransport("/messages")

app = Starlette(
    routes=[
        sse.get_endpoint(server),
        sse.post_endpoint(server),
    ]
)

# 添加认证中间件
@app.middleware("http")
async def auth_middleware(request, call_next):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not validate_token(token):
        return JSONResponse({"error": "Unauthorized"}, status_code=401)
    return await call_next(request)
```

### 使用 Docker 部署

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY mcp_server.py .
EXPOSE 8080

CMD ["python", "-m", "mcp.server.sse", "--port", "8080"]
```

## MCP vs 直接 API：什么时候用什么？

### 用 MCP 的场景

- 你的工具要被多个 AI 应用复用
- 工具逻辑复杂，需要独立测试和维护
- 你想让社区能直接使用你的工具
- 你在构建一个 AI Agent 平台

### 不用 MCP 的场景

- 只有一个 AI 应用，用 Function Calling 够了
- 工具逻辑极其简单，不值得单独部署
- 对延迟敏感，MCP 的额外一跳会增加 10-50ms
- 团队对 MCP 不熟悉，学习成本 > 收益

## 2026 年 MCP 生态现状

### 已有的 MCP Server

| 类别 | 例子 |
|------|------|
| 数据库 | PostgreSQL, MySQL, MongoDB, Redis |
| 文件系统 | 本地文件, S3, Google Drive |
| 开发工具 | GitHub, GitLab, Jira, Linear |
| 通信工具 | Slack, Discord, Email |
| AI 工具 | Puppeteer（浏览器）, Memory, Sequential Thinking |

### 其他协议

- **A2A（Agent-to-Agent）**：Google 推出的 Agent 间通信协议
- **WebMCP**：MCP 的浏览器变体，让网站能暴露工具给 AI Agent
- **ACP/UCP**：其他尝试中的协议

MCP 目前在"Agent 连接工具"这个层面已经赢了，但 Agent 间通信（A2A）和浏览器端（WebMCP）还在竞争中。

## 总结

MCP 解决的核心问题：**让工具与模型解耦**。

就像 USB-C 统一了充电接口，MCP 正在统一 AI Agent 与工具的连接方式。但这不意味着你要在所有场景都用它——简单场景用 Function Calling 依然是最直接的方案。

关键问题是：你的工具需要被多个 AI 应用复用吗？如果答案是肯定的，MCP 值得投入。
