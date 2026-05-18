---
title: RESTful API 设计原则：我踩过的那些坑
date: 2026-05-16
cover: https://picsum.photos/seed/rest-api/800/400
desc: 从实际项目中的错误案例出发，讲清楚 RESTful API 设计的取舍与最佳实践
tags: [API设计, RESTful, 后端开发, 架构]
---

## 不是所有能调通的接口都是好接口

干了几年后端，我重构过三个项目的 API 层。每次重构的原因都差不多：新需求来了，但现有的接口结构根本扩展不了。要么参数爆炸，要么响应格式不统一，前端每次联调都骂人。

这篇文章不是什么标准规范，是我踩坑踩出来的经验。

## 资源命名的那些破事

### 用名词别用动词

很多人刚写接口时会这样：

```
GET  /getUser/123
POST /createArticle
POST /deleteArticle/456
```

这反 REST。REST 的核心理念是"资源"——用 HTTP 方法表达操作意图：

```
GET    /users/123        # 获取用户
POST   /articles         # 创建文章
DELETE /articles/456     # 删除文章
```

URL 只描述"资源"，动词交给 HTTP 方法。这么写的好处是什么？统一。前端看到 `DELETE /articles/456` 就知道是删除——不需要再问"删除文章的接口叫什么"。

### 复数还是单数

这个问题每个团队都会吵。我的建议是：**统一用复数**。

```
GET /users      # 用户列表
GET /users/123  # 单个用户
```

理由：列表场景 `GET /users` 语义清晰，如果是 `/user`，那单个用户是 `/user/123`，列表变成 `/users`——就不一致了。

### 层级别太深

```
GET /orgs/123/projects/456/sprints/789/tasks/111
```

超过三层的嵌套就要考虑简化了：

```
GET /orgs/123/projects
GET /projects/456/sprints
GET /sprints/789/tasks
GET /tasks/111
```

前端可以通过多个请求组装数据，但接口的复杂度降低了。实际做的时候要考虑性能和前端体验的平衡——如果前端真的需要一次拿全，可以加个参数：

```
GET /sprints/789?include=tasks
```

## HTTP 状态码不是摆设

我见过一个项目，所有请求成功都返回 200，所有失败都返回 400，区别只在 response body 里的 `code` 字段：

```json
// 用户不存在
HTTP 200
{ "code": 1001, "message": "用户不存在" }

// 参数错误
HTTP 200
{ "code": 1002, "message": "参数不合法" }
```

这等于把 HTTP 协议的状态码机制废掉了。正确的做法是：

```json
// 用户不存在
HTTP 404
{ "error": "USER_NOT_FOUND", "message": "用户不存在" }

// 参数错误
HTTP 400
{ "error": "INVALID_PARAMS", "message": "参数不合法" }

// 服务器炸了
HTTP 500
{ "error": "INTERNAL_ERROR", "message": "服务器内部错误" }
```

**常用的状态码就那么几个**，我整理了一张速查表：

| 状态码 | 含义 | 使用场景 |
|--------|------|---------|
| 200 | OK | 正常返回资源或列表 |
| 201 | Created | 创建资源成功 |
| 204 | No Content | 删除成功、更新成功（不需要返回内容） |
| 400 | Bad Request | 参数校验失败、请求体格式错误 |
| 401 | Unauthorized | 未登录或 token 过期 |
| 403 | Forbidden | 已登录但没有权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如用户名重复） |
| 422 | Unprocessable Entity | 业务逻辑校验失败 |
| 429 | Too Many Requests | 限流 |
| 500 | Internal Server Error | 服务器内部错误 |

把状态码用对了，前端不需要先读 body 再判断对错——直接 `response.status` 就知道大概出什么问题了。 

## 响应格式的统一是救命稻草

大项目里 API 数量一多，没有统一的响应格式就是灾难。我推荐一个简单的包裹结构：

```json
// 成功响应
HTTP 200
{
  "data": { "id": 1, "name": "Alice" },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-05-16T10:30:00Z"
  }
}

// 列表响应
HTTP 200
{
  "data": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 58,
    "totalPages": 3
  },
  "meta": { "requestId": "req_abc123", "timestamp": "..." }
}

// 错误响应
HTTP 400
{
  "error": {
    "code": "INVALID_PARAMS",
    "message": "邮箱格式不正确",
    "details": [
      { "field": "email", "message": "不是一个有效的邮箱地址" }
    ]
  },
  "meta": { "requestId": "req_abc123", "timestamp": "..." }
}
```

核心原则：
- **成功**：数据放 data
- **列表**：数据放 data，分页信息放 pagination
- **错误**：统一用 error 结构
- **所有响应**：包含 meta 追踪信息

这样前端可以写一个统一的请求拦截器，不必为每个接口定制解析逻辑。

## 分页、排序、筛选的设计

这三个需求每个接口都有，但实现方式五花八门。我见过的坑包括：页码从 0 开始、分页信息藏在 headers 里、排序字段名不统一。

### 分页

```http
GET /articles?page=1&pageSize=20
```

`page` 从 1 开始，不是 0。`pageSize` 要有上限，我一般设为最大 100，减少恶意请求的伤害。

### 排序

```http
GET /articles?sort=-createdAt
```

负号表示降序，不加负号表示升序。如果有多个排序条件：

```http
GET /articles?sort=-priority,createdAt
```

### 筛选

```http
GET /articles?status=published&tag=Vue
GET /articles?createdAt[gte]=2026-01-01&createdAt[lte]=2026-05-16
```

简单的等值筛选直接用参数名匹配。范围筛选约定 `[gte]`、`[lte]` 等后缀。

## 版本管理

API 要不要版本化？要。怎么做？我推荐两种方式。

**方式一：URL 路径（推荐）**

```
/api/v1/articles
/api/v2/articles
```

**方式二：请求头**

```
Accept: application/vnd.myapp.v1+json
```

开发者的习惯是 URL 路径方式，简单直接。URL 路径的缺点是一旦确定很难改，但可以通过反向代理做重写。

什么时候需要新版本？当接口的**行为变化**会破坏现有客户端时。加字段不需要新版本，改字段名或改字段含义需要。

## 认证与授权

Token 放哪里？我个人推荐用 Authorization header：

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

而不是：

```http
GET /api/users?token=eyJhbGciOiJIUzI1NiIs...
```

Token 在 URL 里会被服务器日志记录，有安全风险。

关于 JWT，几点实际经验：
- 过期时间别设太长，15 分钟到 1 小时
- 用 refresh token 机制延长会话
- 不要在 JWT 里存敏感信息（base64 是可解码的）
- 注销场景需要黑名单机制

## 关于 HATEOAS

REST 规范里有个 HATEOAS（响应中包含链接），但在实践中很少有人真正用。我不建议在新项目中强制使用——它增加了复杂度，而收益在大多数内部 API 场景中不明显。如果哪天需要做超媒体驱动，可以在响应中加链接字段，不冲突。

## 写在最后

API 设计没有银弹。不同的团队规模、不同的业务场景、不同的客户端类型，需要的设计方案都不一样。

但有一条原则我认为是通用的：**一致性**。命名风格统一、错误格式统一、分页方式统一——当团队形成统一风格后，新成员加入成本降低，前后端联调摩擦减少，这些隐性的收益远远大于在一两个接口上"设计得更完美"的收益。

如果你正在设计一个新项目的 API，先和团队定下规范，写一个 API 设计文档，然后严格遵守。前期投入两小时讨论规范，可以省下后面两个月的联调时间。
