---
title: LangChain 构建 AI 应用完整指南
date: 2026-05-17
cover: https://picsum.photos/seed/langchain-guide/800/400
desc: 从基础概念到实战项目，全面掌握使用 LangChain 构建 AI 应用的方法
tags: [LangChain, AI, LLM, 应用开发]
---

## 什么是 LangChain

LangChain 是一个用于构建大语言模型应用的框架。它提供了标准化的接口，让你可以轻松组合不同的组件（模型、提示词、工具、记忆）来构建复杂的 AI 应用。

## 核心概念

### 六大模块

```
LangChain 核心模块
├── Models（模型）     - LLM、ChatModel、Embedding
├── Prompts（提示词）  - PromptTemplate、ChatPromptTemplate
├── Chains（链）       - 组合多个组件的执行流程
├── Memory（记忆）     - 对话历史管理
├── Tools（工具）      - 外部 API、数据库、计算器
└── Agents（智能体）   - 自主决策使用哪些工具
```

## 模型集成

### 使用不同的 LLM

```typescript
import { ChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatOllama } from '@langchain/ollama'

// OpenAI
const openai = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
})

// Anthropic
const anthropic = new ChatAnthropic({
  model: 'claude-sonnet-4-20250514',
  temperature: 0.7,
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// 本地模型（Ollama）
const ollama = new ChatOllama({
  model: 'llama3',
  temperature: 0.7,
  baseUrl: 'http://localhost:11434',
})
```

### 统一接口调用

```typescript
import { HumanMessage, SystemMessage } from '@langchain/core/messages'

async function chat(model: BaseChatModel, question: string) {
  const response = await model.invoke([
    new SystemMessage('你是一个有帮助的助手。'),
    new HumanMessage(question),
  ])
  
  return response.content
}

// 可以无缝切换模型
const answer = await chat(openai, '解释一下量子计算')
```

## 提示词工程

### 基础模板

```typescript
import { PromptTemplate } from '@langchain/core/prompts'

const prompt = PromptTemplate.fromTemplate(`
你是一个{role}，请用{tone}的语气回答。

问题：{question}
`)

const formatted = await prompt.format({
  role: '技术专家',
  tone: '专业但易懂',
  question: '什么是微服务？',
})
```

### Chat 提示词模板

```typescript
import { ChatPromptTemplate } from '@langchain/core/prompts'

const prompt = ChatPromptTemplate.fromMessages([
  ['system', '你是一个{expertise}领域的专家助手。'],
  ['human', '{question}'],
  ['ai', '{previous_answer}'],
  ['human', '请进一步解释：{follow_up}'],
])

const messages = await prompt.formatMessages({
  expertise: '前端开发',
  question: 'Vue 和 React 有什么区别？',
  previous_answer: 'Vue 使用响应式系统，React 使用状态管理...',
  follow_up: '性能方面呢？',
})
```

### Few-shot 提示词

```typescript
import { FewShotPromptTemplate } from '@langchain/core/prompts'

const examples = [
  {
    input: '今天心情不好',
    output: '我理解你的感受。能告诉我发生了什么吗？',
  },
  {
    input: '我升职了！',
    output: '太棒了！这是你努力的结果，恭喜你！',
  },
]

const examplePrompt = PromptTemplate.fromTemplate(
  '用户说：{input}\n回复：{output}'
)

const fewShot = new FewShotPromptTemplate({
  examples,
  examplePrompt,
  prefix: '你是一个情感支持助手，请根据用户的情绪给出合适的回复。',
  suffix: '用户说：{input}\n回复：',
  inputVariables: ['input'],
})
```

## Chains 链式调用

### 基础链

```typescript
import { RunnableSequence } from '@langchain/core/runnables'

const chain = RunnableSequence.from([
  prompt,
  model,
  // 可以添加输出解析器
  new StringOutputParser(),
])

const result = await chain.invoke({
  role: '翻译',
  tone: '正式',
  question: 'Hello, how are you?',
})
```

### 多链组合

```typescript
import { RunnableParallel, RunnableBranch } from '@langchain/core/runnables'

// 并行执行
const parallel = RunnableParallel.from({
  summary: summaryChain,
  translation: translationChain,
  sentiment: sentimentChain,
})

const results = await parallel.invoke({ text: '今天天气真好' })
// { summary: '...', translation: '...', sentiment: 'positive' }

// 条件分支
const branch = RunnableBranch.from([
  [
    (input) => input.language === 'chinese',
    chineseChain,
  ],
  [
    (input) => input.language === 'english',
    englishChain,
  ],
  defaultChain, // 默认链
])
```

## Memory 记忆管理

### 对话历史

```typescript
import { BufferMemory } from 'langchain/memory'
import { ConversationChain } from 'langchain/chains'

const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: 'chat_history',
})

const chain = new ConversationChain({
  llm: model,
  memory,
})

// 第一轮对话
await chain.invoke({ input: '我叫小明' })

// 第二轮对话 - 模型记得第一轮的内容
await chain.invoke({ input: '我叫什么名字？' })
// 输出: "你叫小明。"
```

### 窗口记忆

```typescript
import { BufferWindowMemory } from 'langchain/memory'

// 只保留最近 5 轮对话
const memory = new BufferWindowMemory({
  k: 5,
  returnMessages: true,
})
```

### 摘要记忆

```typescript
import { ConversationSummaryMemory } from 'langchain/memory'

// 自动将对话历史压缩为摘要
const memory = new ConversationSummaryMemory({
  llm: model,
  memoryKey: 'chat_history',
})
```

## Tools 工具使用

### 内置工具

```typescript
import { Calculator } from '@langchain/community/tools/calculator'
import { SerpAPI } from '@langchain/community/tools/serpapi'

const calculator = new Calculator()
const result = await calculator.invoke('2^10 + sqrt(144)')
// 1036

const search = new SerpAPI(process.env.SERPAPI_API_KEY)
const searchResult = await search.invoke('2026年AI最新趋势')
```

### 自定义工具

```typescript
import { tool } from '@langchain/core/tools'
import { z } from 'zod'

const weatherTool = tool(
  async ({ location }) => {
    const response = await fetch(
      `https://api.weather.com/v1/current?location=${location}`
    )
    const data = await response.json()
    return `当前${location}的天气：${data.condition}，${data.temperature}°C`
  },
  {
    name: 'get_weather',
    description: '获取指定城市的天气信息',
    schema: z.object({
      location: z.string().describe('城市名称，如：北京、上海'),
    }),
  }
)
```

## Agents 智能体

### ReAct Agent

```typescript
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { ChatOpenAI } from '@langchain/openai'

const model = new ChatOpenAI({ model: 'gpt-4o' })

const agent = createReactAgent({
  llm: model,
  tools: [calculator, weatherTool, search],
})

const result = await agent.invoke({
  messages: [new HumanMessage('北京今天天气怎么样？如果温度低于10度，提醒我穿厚点')],
})
```

### 执行流程

```
用户输入 → Agent 思考 → 选择工具 → 执行工具 → 观察结果 → 继续思考 → ... → 最终回答
```

## 实战：智能客服系统

### 完整架构

```typescript
import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { BufferMemory } from 'langchain/memory'
import { tool } from '@langchain/core/tools'
import { z } from 'zod'

// 1. 定义工具
const orderLookupTool = tool(
  async ({ orderId }) => {
    const order = await db.order.findUnique({ where: { id: orderId } })
    if (!order) return `订单 ${orderId} 不存在`
    return `订单状态：${order.status}，预计送达：${order.estimatedDelivery}`
  },
  {
    name: 'lookup_order',
    description: '查询订单状态和物流信息',
    schema: z.object({ orderId: z.string() }),
  }
)

const refundTool = tool(
  async ({ orderId, reason }) => {
    await db.refund.create({ data: { orderId, reason } })
    return `退款申请已提交，订单 ${orderId}，原因：${reason}`
  },
  {
    name: 'request_refund',
    description: '申请退款',
    schema: z.object({
      orderId: z.string(),
      reason: z.string(),
    }),
  }
)

// 2. 创建提示词
const customerServicePrompt = ChatPromptTemplate.fromMessages([
  ['system', `你是某电商平台的客服助手。
你的职责是：
1. 回答用户关于订单的问题
2. 帮助用户查询订单状态
3. 协助用户申请退款
请用友好、专业的语气回答。`],
  ['placeholder', '{chat_history}'],
  ['human', '{input}'],
])

// 3. 创建 Agent
const model = new ChatOpenAI({ model: 'gpt-4o', temperature: 0.3 })

const agent = createReactAgent({
  llm: model,
  tools: [orderLookupTool, refundTool],
  prompt: customerServicePrompt,
})

// 4. 使用
async function handleCustomerQuery(input: string, sessionId: string) {
  const memory = await getMemory(sessionId) // 从 Redis 获取对话历史
  
  const result = await agent.invoke({
    messages: [new HumanMessage(input)],
    memory,
  })
  
  return result.messages[result.messages.length - 1].content
}
```

## 最佳实践

| 实践 | 说明 |
|------|------|
| 温度设置 | 事实性问题用 0-0.3，创意性内容用 0.7-1.0 |
| 提示词结构 | 角色 → 任务 → 规则 → 输出格式 → 示例 |
| 工具设计 | 每个工具职责单一，有清晰的输入输出 |
| 错误处理 | 工具调用失败时要有降级方案 |
| 成本控制 | 使用缓存、摘要记忆减少 token 消耗 |

## 总结

LangChain 的核心价值：

1. **标准化接口**——不同模型和工具的统一调用方式
2. **组件化设计**——像搭积木一样组合 AI 应用
3. **链式编排**——将复杂流程分解为可管理的步骤
4. **智能体能力**——让 AI 自主决策使用工具

掌握 LangChain 后，你可以快速构建从简单问答到复杂智能体的各种 AI 应用。
