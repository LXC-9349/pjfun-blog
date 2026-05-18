---
title: Code Review 不是找茬：如何让审查成为最好的学习机会
date: 2026-05-16
cover: https://picsum.photos/seed/code-review/800/400
desc: 我在经历了 1000+ 次 Code Review 后总结出的经验——不仅仅是找 Bug，更是建立团队技术文化
tags: [Code Review, 团队协作, 代码质量, 工程文化]
---

## Code Review 不是为了抓住你的错误

我在第一家公司的时候，Code Review 是"找茬"的代名词。提交代码后，senior 会找出一堆问题，然后你修改，再提交，再被找出新问题。整个过程毫无学习氛围——只有压力。

后来换了一家公司，Code Review 的画风完全不同了。评论不再是"这里错了"，而是"这个方法可不可以改成这样？"或者"我之前遇到过类似的情况，用了另一种思路，你看看会不会更好？"

同样是发现问题，体验完全不同。前者让人防御，后者让人学习。

## 审查清单：到底要看什么

一个好的 Code Review 不是逐行扫下来找错别字。我按照重要性排序：

### 第一优先级：正确性和安全

```typescript
// ❌ 这段代码看似没问题
app.post('/api/transfer', (req, res) => {
  const amount = req.body.amount
  User.updateBalance(req.user.id, amount)
  // 安全问题：没有验证金额是否为正数
  // 安全问题：没有校验扣除后余额不会变成负数
  // 业务问题：没有用事务，两步操作可能只成功一步
})

// ✅ 应该这样
app.post('/api/transfer', (req, res) => {
  const amount = Number(req.body.amount)
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: '无效金额' })
  }
  
  // 使用事务确保原子性
  const result = await db.transaction(async (trx) => {
    const user = await trx('users').where({ id: req.user.id }).first()
    if (user.balance < amount) throw new Error('余额不足')
    return trx('users').where({ id: req.user.id }).decrement('balance', amount)
  })
})
```

审查时要问的问题：
- 边界情况处理了吗？（空数组、null、极端值）
- 错误处理完整吗？
- 有安全漏洞吗？（注入、权限检查缺失、敏感信息泄露）
- 并发冲突考虑了没有？

### 第二优先级：可维护性

```typescript
// ❌ 魔法数字
function calculateDiscount(amount) {
  if (amount > 1000) return amount * 0.9
  if (amount > 500) return amount * 0.95
  return amount
}

// ✅ 命名常量
const DISCOUNT_TIERS = [
  { threshold: 1000, rate: 0.9 },
  { threshold: 500, rate: 0.95 },
]

function calculateDiscount(amount) {
  const tier = DISCOUNT_TIERS.find(t => amount > t.threshold)
  return tier ? amount * tier.rate : amount
}
```

- 命名是否能表达意图？
- 函数是否只做一件事？
- 有没有硬编码的魔法值？
- 逻辑是否容易被误解？

### 第三优先级：性能

```typescript
// ❌ 循环中查询数据库
async function getUserNames(userIds) {
  const names = []
  for (const id of userIds) {
    const user = await db('users').where({ id }).first()
    names.push(user.name)
  }
  return names
}

// ✅ 一次查询
async function getUserNames(userIds) {
  const users = await db('users').whereIn('id', userIds)
  return users.map(u => u.name)
}
```

- 有没有不必要的重复计算？
- 循环中有没有可以提取的常量？
- 有没有 N+1 查询？
- 缓存用对了吗？

## 如何写出好的审查意见

### 用提问代替评判

```
❌ "你这个实现不对，应该用 Map 而不是 Object"
✅ "这里用 Map 会不会更合适？因为我们需要频繁地遍历和删除操作"
```

即使你的判断是对的，提出问题和建议比直接说"不对"更容易让人接受。

### 区分"必须改"和"建议"

```
🛑 阻塞性（必须改）：逻辑错误、安全漏洞、性能问题
💡 建议性（可以不改）：命名建议、风格偏好、可选的优化
```

如果不加区分，所有评论混在一起，提交者很难判断优先级——要么全改（浪费时间），要么全无视（错过真正的问题）。

### 解释为什么

```
❌ "改用 async/await"
✅ "这里用 async/await 比 .then() 链式调用可读性更好，
   因为错误处理可以统一用 try/catch"

❌ "移到 utils 里"
✅ "这个格式化逻辑在其他组件中也有用到，
   移到 utils/format.ts 可以减少代码重复"
```

"怎么做"是信息，"为什么这么做"是知识。review 是传递知识的最佳机会。

## 如何处理审查中的分歧

分歧不可避免。这是正常的——不同背景的人对同一段代码有不同的看法。

**应对原则：**

1. **把问题还原到具体场景**。"这个代码可读性差"太抽象了——"这个函数的参数顺序容易混淆，调用时经常需要查定义"就具体了

2. **用数据说话**。"性能差"不如"这个方案在 10000 条数据上需要 3.2 秒，另一种方案只需要 0.8 秒"

3. **维护者最终决定**。Code Review 是讨论，不是投票。PR 的作者最终对代码负责。如果你的建议确实更好但作者不愿意改，和经理沟通或者接受这个差异——不值得为了一次 review 搞僵关系

## PR 大小：越大越痛苦

```text
一个 PR 修改的文件数    Review 质量
─────────────────────────────────
1-3 个文件              高质量，能发现深层问题
4-8 个文件              中等质量，主要看表面
8+ 个文件               基本只扫一眼，放行
```

这是人性决定的——面对一个改了 30 个文件的 PR，没人有精力细看。

**建议：PR 控制在 200 行以内。** 超过这个数的改动，拆成多个 PR。

拆 PR 的方式不是按时间切（"这个是今天写的，明天写那个"），而是按**逻辑单元**切：

```
PR 1: 重构数据访问层（新增 repository 模式）
PR 2: 替换业务逻辑中使用直接查询的地方
PR 3: 添加新功能（基于新数据层）
```

每个 PR 都是独立的、可审查的、可部署的。

## Code Review 文化的建设

如果团队还没建立起好的 review 文化，可以从几个小习惯开始：

1. **把 review 加入日常工作流**。每天留出 30 分钟专门做 review，而不是"有空的时候看看"
2. **设定响应时间目标**。24 小时内给出初步反馈。等人三天才 review，开发节奏被打断，提交者也会沮丧
3. **不在 review 中讨论架构变更**。大的架构决策应该在设计文档或 RFC 阶段讨论。在代码实现的 review 中推翻架构设计，双方都难受
4. **庆祝好的 review 评论**。当有人说"这条评论让我学到了新东西"时，公开发出来感谢。这会鼓励大家写更有价值的评论

## 写在最后

Code Review 不是代码检查工具，是人之间交流的方式。技术问题大多可以通过讨论找到答案。最难处理的是"这个代码我看了不舒服但说不清为什么"——这种时候信任你的直觉，试着把感觉转化成具体的问题去问，答案往往在讨论的过程中浮现出来。

写代码是写给人看的，顺便能在机器上运行。Code Review 是确保"人"那部分做对了。
