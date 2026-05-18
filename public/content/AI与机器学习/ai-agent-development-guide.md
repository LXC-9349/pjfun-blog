---
title: AI Agent 开发实战：从概念到落地的完整指南
date: 2026-05-18
cover: https://picsum.photos/seed/ai-agent-2026/800/400
desc: 基于真实项目经验，讲解 AI Agent 的架构设计、工具调用、记忆系统和多 Agent 协作
tags: [AI Agent, LLM, LangChain, 自动化, 多智能体]
---

## 2026 年的 AI Agent 不再是玩具

两年前，AI Agent 还只是 Tech Demo 里的演示品——让它订个披萨，它能给你订三份还忘了写地址。现在不一样了。2026 年 Q1，AI 创业公司拿到了 2420 亿美元融资，占全球初创融资的 80%。

这篇文章不讲概念，讲的是：**怎么把 AI Agent 做成真正能用的产品**。

## AI Agent 是什么？

定义很简单：**能自主感知环境、制定计划、调用工具、执行多步任务的 AI 系统**。

和普通 LLM 对话的区别：

| 普通对话 | AI Agent |
|---------|----------|
| 一问一答 | 多步推理和执行 |
| 只能生成文本 | 能调用 API、读写文件、执行代码 |
| 无状态 | 有记忆和上下文 |
| 被动响应 | 主动规划和执行 |

一个例子：用户问"帮我分析上个月的销售数据，生成报告发到群里"。

普通 LLM：
> "我无法访问你的数据，请提供数据内容..."

AI Agent：
> 1. 调用数据库查询上个月销售数据
> 2. 调用分析工具处理数据
> 3. 调用文档生成工具创建报告
> 4. 调用 Slack API 发送到指定群组
> 5. 返回执行结果

## 核心架构

```
┌─────────────────────────────────────────────────────────┐
│                      AI Agent 架构                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────┐    ┌─────────┐    ┌─────────────────────┐ │
│  │ 感知层   │───►│ 认知层   │───►│ 执行层              │ │
│  │         │    │         │    │                     │ │
│  │ - 用户输入│    │ - 规划器 │    │ - 工具调用          │ │
│  │ - 环境状态│    │ - 推理器 │    │ - API 请求          │ │
│  │ - 工具反馈│    │ - 决策器 │    │ - 代码执行          │ │
│  └─────────┘    └─────────┘    └─────────────────────┘ │
│                      │                                  │
│                      ▼                                  │
│              ┌─────────────┐                           │
│              │   记忆层     │                           │
│              │ - 短期记忆   │                           │
│              │ - 长期记忆   │                           │
│              │ - 工作记忆   │                           │
│              └─────────────┘                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 实战：构建一个数据分析 Agent

### 场景

用户用自然语言描述分析需求，Agent 自动：
1. 理解需求，生成 SQL
2. 执行查询
3. 分析数据
4. 生成可视化图表

### 核心代码

```python
from dataclasses import dataclass
from typing import Literal
import openai
import asyncpg
import pandas as pd
import matplotlib.pyplot as plt

@dataclass
class AgentState:
    """Agent 状态"""
    task: str                    # 用户任务
    plan: list[str]              # 执行计划
    current_step: int            # 当前步骤
    memory: list[dict]           # 记忆
    result: str | None           # 最终结果

class DataAnalysisAgent:
    def __init__(self, db_url: str, model: str = "gpt-4"):
        self.db_url = db_url
        self.model = model
        self.client = openai.AsyncClient()
        
    async def run(self, task: str) -> str:
        """执行任务"""
        state = AgentState(
            task=task,
            plan=[],
            current_step=0,
            memory=[],
            result=None
        )
        
        # 1. 规划
        state.plan = await self._plan(task)
        state.memory.append({"role": "system", "content": f"计划: {state.plan}"})
        
        # 2. 执行每一步
        for i, step in enumerate(state.plan):
            state.current_step = i
            result = await self._execute_step(step, state)
            state.memory.append({"role": "assistant", "content": f"步骤 {i+1} 结果: {result}"})
        
        # 3. 生成最终报告
        state.result = await self._generate_report(state)
        return state.result
    
    async def _plan(self, task: str) -> list[str]:
        """生成执行计划"""
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": """你是一个数据分析专家。用户会给你一个分析任务，你需要把它分解成具体步骤。

输出格式（JSON数组）：
["步骤1", "步骤2", "步骤3"]

可用的步骤类型：
- query: 执行SQL查询
- analyze: 分析数据
- visualize: 生成图表
- report: 生成报告"""},
                {"role": "user", "content": task}
            ],
            response_format={"type": "json_object"}
        )
        
        import json
        return json.loads(response.choices[0].message.content)
    
    async def _execute_step(self, step: str, state: AgentState) -> str:
        """执行单个步骤"""
        if "query" in step.lower():
            return await self._query(step, state)
        elif "analyze" in step.lower():
            return await self._analyze(state)
        elif "visualize" in step.lower():
            return await self._visualize(state)
        elif "report" in step.lower():
            return await self._report(state)
        else:
            # 让 LLM 决定如何执行
            return await self._llm_execute(step, state)
    
    async def _query(self, step: str, state: AgentState) -> str:
        """执行 SQL 查询"""
        # 从步骤描述生成 SQL
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": """根据用户需求生成 PostgreSQL SQL 查询。

数据库表结构：
- orders(id, user_id, total, status, created_at)
- order_items(id, order_id, product_id, quantity, price)
- products(id, name, category, price)
- users(id, name, email, created_at)

只输出 SQL，不要解释。"""},
                {"role": "user", "content": step}
            ]
        )
        
        sql = response.choices[0].message.content
        
        # 执行查询
        conn = await asyncpg.connect(self.db_url)
        try:
            rows = await conn.fetch(sql)
            # 转换为 DataFrame 并缓存
            df = pd.DataFrame([dict(r) for r in rows])
            state.memory.append({"role": "tool", "name": "query_result", "data": df})
            return f"查询返回 {len(rows)} 行数据"
        finally:
            await conn.close()
    
    async def _analyze(self, state: AgentState) -> str:
        """分析数据"""
        # 从记忆中获取最近的查询结果
        df = None
        for msg in reversed(state.memory):
            if msg.get("name") == "query_result":
                df = msg["data"]
                break
        
        if df is None:
            return "没有找到查询结果"
        
        # 让 LLM 分析
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": f"""分析以下数据，给出洞察。

数据统计：
- 行数: {len(df)}
- 列: {list(df.columns)}
- 描述统计:
{df.describe().to_string()}

请给出 3-5 条关键洞察。"""},
                {"role": "user", "content": state.task}
            ]
        )
        
        analysis = response.choices[0].message.content
        state.memory.append({"role": "tool", "name": "analysis", "content": analysis})
        return analysis
    
    async def _visualize(self, state: AgentState) -> str:
        """生成可视化"""
        df = None
        for msg in reversed(state.memory):
            if msg.get("name") == "query_result":
                df = msg["data"]
                break
        
        if df is None:
            return "没有数据可供可视化"
        
        # 让 LLM 决定可视化方案
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": f"""根据数据特点推荐可视化方案。

数据列: {list(df.columns)}
数据类型: {df.dtypes.to_dict()}

输出格式：
{{"chart_type": "bar/line/pie/scatter", "x": "列名", "y": "列名"}}"""},
                {"role": "user", "content": state.task}
            ],
            response_format={"type": "json_object"}
        )
        
        import json
        config = json.loads(response.choices[0].message.content)
        
        # 生成图表
        plt.figure(figsize=(10, 6))
        if config["chart_type"] == "bar":
            df.plot(kind="bar", x=config["x"], y=config["y"])
        elif config["chart_type"] == "line":
            df.plot(kind="line", x=config["x"], y=config["y"])
        
        plt.savefig("chart.png")
        state.memory.append({"role": "tool", "name": "chart", "path": "chart.png"})
        return "图表已生成: chart.png"
    
    async def _generate_report(self, state: AgentState) -> str:
        """生成最终报告"""
        # 收集所有结果
        context = "\n\n".join([
            f"{m['role']}: {m.get('content', str(m))}"
            for m in state.memory
            if m["role"] in ["assistant", "tool"]
        ])
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "根据执行结果生成最终报告。格式清晰，重点突出。"},
                {"role": "user", "content": f"原始任务: {state.task}\n\n执行结果:\n{context}"}
            ]
        )
        
        return response.choices[0].message.content

# 使用
async def main():
    agent = DataAnalysisAgent("postgresql://localhost/mydb")
    result = await agent.run("分析上个月的销售趋势，找出销量最好的产品类别")
    print(result)

import asyncio
asyncio.run(main())
```

## 记忆系统设计

Agent 的记忆分三层：

### 短期记忆（对话上下文）

```python
# 最简单的实现：直接用 LLM 的上下文窗口
messages = [
    {"role": "system", "content": "你是..."},
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."},
    # ... 继续追加
]
```

问题：上下文窗口有限，对话长了会遗忘。解决方案是**总结 + 滑动窗口**：

```python
MAX_MESSAGES = 20

def manage_memory(messages: list) -> list:
    if len(messages) > MAX_MESSAGES:
        # 保留 system + 最近 N 条 + 总结
        summary = summarize_messages(messages[1:-MAX_MESSAGES//2])
        return [messages[0]] + [summary] + messages[-MAX_MESSAGES//2:]
    return messages
```

### 长期记忆（向量数据库）

```python
import chromadb
from openai import OpenAI

client = OpenAI()
chroma = chromadb.Client()
collection = chroma.create_collection("agent_memory")

async def remember(query: str, k: int = 5) -> list[str]:
    """检索相关记忆"""
    embedding = client.embeddings.create(
        model="text-embedding-3-small",
        input=query
    ).data[0].embedding
    
    results = collection.query(
        query_embeddings=[embedding],
        n_results=k
    )
    return results["documents"][0]

async def memorize(content: str, metadata: dict = None):
    """存储记忆"""
    embedding = client.embeddings.create(
        model="text-embedding-3-small",
        input=content
    ).data[0].embedding
    
    collection.add(
        ids=[str(uuid.uuid4())],
        embeddings=[embedding],
        documents=[content],
        metadatas=[metadata or {}]
    )
```

### 工作记忆（当前任务状态）

```python
from dataclasses import dataclass, field
from typing import Any

@dataclass
class WorkingMemory:
    """工作记忆：当前任务的状态"""
    task: str                           # 当前任务
    plan: list[str] = field(default_factory=list)  # 执行计划
    completed: list[str] = field(default_factory=list)  # 已完成步骤
    variables: dict[str, Any] = field(default_factory=dict)  # 中间变量
    errors: list[str] = field(default_factory=list)  # 错误记录
    
    def get_context(self) -> str:
        """生成上下文摘要"""
        return f"""
当前任务: {self.task}
执行计划: {self.plan}
已完成: {self.completed}
当前变量: {self.variables}
遇到的问题: {self.errors}
"""
```

## 多 Agent 协作

复杂任务需要多个专业 Agent 协作：

```
┌─────────────────────────────────────────────────┐
│                  Orchestrator                    │
│              (任务分解和调度)                     │
└─────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │ Research │   │ Coder    │   │ Reviewer │
   │  Agent   │   │  Agent   │   │  Agent   │
   └──────────┘   └──────────┘   └──────────┘
```

### 实现代码

```python
from abc import ABC, abstractmethod
from typing import Callable
import asyncio

class Agent(ABC):
    """Agent 基类"""
    def __init__(self, name: str, capability: str):
        self.name = name
        self.capability = capability
        self.inbox: asyncio.Queue = asyncio.Queue()
    
    @abstractmethod
    async def process(self, task: str) -> str:
        """处理任务"""
        pass
    
    async def run(self):
        """运行 Agent"""
        while True:
            task = await self.inbox.get()
            result = await self.process(task)
            yield result

class Orchestrator:
    """协调器"""
    def __init__(self):
        self.agents: dict[str, Agent] = {}
    
    def register(self, agent: Agent):
        self.agents[agent.capability] = agent
    
    async def execute(self, task: str) -> str:
        # 1. 分析任务，决定需要哪些 Agent
        plan = await self._plan(task)
        
        # 2. 分配任务
        results = {}
        for step in plan:
            capability = step["capability"]
            subtask = step["task"]
            
            if capability in self.agents:
                result = await self.agents[capability].process(subtask)
                results[capability] = result
        
        # 3. 整合结果
        return await self._integrate(results)
    
    async def _plan(self, task: str) -> list[dict]:
        """根据任务生成执行计划"""
        # 使用 LLM 决定需要哪些 Agent
        # 这里简化为规则匹配
        plan = []
        if "搜索" in task or "查找" in task:
            plan.append({"capability": "research", "task": task})
        if "代码" in task or "实现" in task:
            plan.append({"capability": "coding", "task": task})
        if "审核" in task or "检查" in task:
            plan.append({"capability": "review", "task": task})
        return plan
    
    async def _integrate(self, results: dict) -> str:
        """整合各 Agent 结果"""
        return "\n\n".join([f"## {k}\n{v}" for k, v in results.items()])

# 定义具体 Agent
class ResearchAgent(Agent):
    def __init__(self):
        super().__init__("Researcher", "research")
    
    async def process(self, task: str) -> str:
        # 实现搜索和调研逻辑
        return f"调研结果: ..."

class CoderAgent(Agent):
    def __init__(self):
        super().__init__("Coder", "coding")
    
    async def process(self, task: str) -> str:
        # 实现代码生成逻辑
        return f"生成的代码: ..."

# 使用
orchestrator = Orchestrator()
orchestrator.register(ResearchAgent())
orchestrator.register(CoderAgent())

result = await orchestrator.execute("帮我写一个爬虫，搜索最新的 AI 新闻")
```

## 常见坑和解决方案

### 坑 1：无限循环

Agent 执行任务时陷入循环，不断重试同一个步骤。

**解决方案**：设置最大迭代次数 + 死循环检测

```python
MAX_ITERATIONS = 10

async def run_with_limit(agent, task):
    for i in range(MAX_ITERATIONS):
        result = await agent.step()
        if result.done:
            return result
        if is_stuck(agent.state):  # 检测是否陷入循环
            return "任务执行失败：陷入循环"
    return "任务执行失败：超过最大迭代次数"
```

### 坑 2：工具调用失败

Agent 调用工具时参数错误、超时、权限不足等。

**解决方案**：重试 + 降级 + 人工介入

```python
async def safe_tool_call(tool, params, max_retries=3):
    for attempt in range(max_retries):
        try:
            return await tool.execute(params)
        except ValidationError as e:
            # 参数错误，让 LLM 修正
            params = await llm_fix_params(params, str(e))
        except TimeoutError:
            # 超时，降级处理
            return await fallback_handler(params)
        except PermissionError:
            # 权限不足，请求人工介入
            return await request_human_approval(tool, params)
    
    raise RuntimeError("工具调用失败")
```

### 坑 3：记忆污染

Agent 的记忆里混入了错误信息，导致后续决策错误。

**解决方案**：记忆验证 + 定期清理

```python
async def validate_memory(memory: list) -> list:
    """验证记忆的有效性"""
    validated = []
    for m in memory:
        if await is_factually_correct(m):
            validated.append(m)
        else:
            # 标记为可疑
            validated.append({**m, "confidence": "low"})
    return validated

async def cleanup_memory(memory: list, max_age_hours=24) -> list:
    """清理过期记忆"""
    cutoff = datetime.now() - timedelta(hours=max_age_hours)
    return [m for m in memory if m.get("timestamp", cutoff) > cutoff]
```

## 总结

构建一个能用的 AI Agent，核心是：

1. **清晰的架构**：感知 → 认知 → 执行，每层职责明确
2. **可靠的记忆**：短期 + 长期 + 工作，三层协同
3. **鲁棒的执行**：重试、降级、人工介入，处理各种异常
4. **可观测性**：日志、追踪、审计，知道 Agent 在干什么

2026 年的 AI Agent 已经不是 Demo 玩具，但离"通用智能助手"还有距离。把 Agent 限制在具体场景里，做好边界和容错，是目前最实用的路径。
