---
title: Web 认证安全：从 Session 到 JWT 再到 Passkey
date: 2026-05-17
cover: https://picsum.photos/seed/web-auth-security/800/400
desc: 系统梳理 Web 认证方案的演进，分析每种方案的安全性和适用场景
tags: [认证, JWT, Session, 安全, Passkey]
---

## Session-Cookie：经典但不过时

### 工作原理

```
1. 用户登录 → 服务端验证用户名密码
2. 服务端创建 Session，生成 Session ID
3. Session ID 通过 Set-Cookie 返回给浏览器
4. 浏览器后续请求自动携带 Cookie
5. 服务端通过 Session ID 查找用户信息
```

### 安全要点

```javascript
// 服务端设置 Cookie（Express 示例）
res.cookie('session_id', sessionId, {
  httpOnly: true,    // JS 无法读取（防 XSS）
  secure: true,      // 只通过 HTTPS 传输
  sameSite: 'strict', // 防止 CSRF
  maxAge: 24 * 60 * 60 * 1000,  // 24 小时
  path: '/'
})
```

| 属性 | 作用 | 推荐值 |
|------|------|--------|
| `httpOnly` | 防止 JS 读取 Cookie | `true` |
| `secure` | 只通过 HTTPS 传输 | `true` |
| `sameSite` | 防止 CSRF 攻击 | `strict` 或 `lax` |
| `maxAge` | Cookie 有效期 | 根据业务需求 |
| `domain` | Cookie 作用域 | 不设置（默认当前域名） |

### Session 存储方案

```python
# 方案一：内存（适合单机开发）
sessions = {}

# 方案二：Redis（生产环境推荐）
import redis
redis_client = redis.Redis(host='redis', port=6379, db=0)
redis_client.setex(f"session:{session_id}", 86400, user_json)

# 方案三：数据库（不推荐，性能差）
db.sessions.insert(session_id, user_data, ttl=86400)
```

## JWT：被误解最多的方案

### JWT 是什么

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

三段式：Header（算法）.Payload（数据）.Signature（签名）

### JWT 的优势

- **无状态**：服务端不需要存储 Session
- **跨域友好**：适合微服务架构
- **自包含**：Token 中包含用户信息

### JWT 的常见误区

**误区一：JWT 可以主动失效**

❌ JWT 一旦签发，在过期前无法主动失效。除非：
- 维护一个黑名单（那又变成了有状态）
- 设置很短的过期时间 + Refresh Token

**误区二：JWT 比 Session 更安全**

❌ JWT 存储在 localStorage 中会被 XSS 攻击。正确的做法是：
- JWT 也放在 httpOnly Cookie 中
- 或者放在内存中（SPA 应用）

**误区三：JWT 适合所有场景**

❌ JWT 适合：
- 微服务间的认证
- 第三方 API 的访问令牌
- 移动端 App 认证

JWT 不适合：
- 需要主动踢用户下线的场景
- 权限频繁变化的场景
- 简单的单体应用

### JWT 最佳实践

```python
from datetime import datetime, timedelta
import jwt

SECRET_KEY = "your-secret-key"  # 生产环境用环境变量

def create_tokens(user_id: str):
    # Access Token（短期）
    access_token = jwt.encode({
        "sub": user_id,
        "type": "access",
        "exp": datetime.utcnow() + timedelta(minutes=15),
        "iat": datetime.utcnow()
    }, SECRET_KEY, algorithm="HS256")
    
    # Refresh Token（长期）
    refresh_token = jwt.encode({
        "sub": user_id,
        "type": "refresh",
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow()
    }, SECRET_KEY, algorithm="HS256")
    
    return access_token, refresh_token

def refresh_access_token(refresh_token: str):
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=["HS256"])
        if payload["type"] != "refresh":
            raise ValueError("Invalid token type")
        return create_tokens(payload["sub"])[0]  # 返回新的 Access Token
    except jwt.ExpiredSignatureError:
        raise ValueError("Token expired")
```

## OAuth 2.0 + OIDC

### 授权码流程（Authorization Code Flow）

```
用户 → 你的应用 → 点击"使用 Google 登录"
   ↓
浏览器 → Google 登录页面 → 用户授权
   ↓
Google → 重定向回你的应用 → 带上 authorization_code
   ↓
你的后端 → 用 code 换 access_token（后端直接调用 Google API）
   ↓
Google → 返回 access_token + id_token
   ↓
你的后端 → 验证 id_token → 创建本地 Session/JWT
```

**关键**：access_token 的交换必须在后端完成，不能在前端。否则 code 可能被拦截。

### OIDC（OpenID Connect）

OIDC = OAuth 2.0 + ID Token。ID Token 是一个 JWT，包含用户的基本信息：

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "email_verified": true,
  "picture": "https://example.com/avatar.jpg",
  "iss": "https://accounts.google.com",
  "exp": 1699999999
}
```

## Passkey（WebAuthn）：无密码认证

### 工作原理

```
注册：
1. 用户输入用户名
2. 浏览器调用 navigator.credentials.create()
3. 设备生成密钥对（私钥存在设备中，公钥发给服务器）
4. 服务器存储公钥

登录：
1. 用户输入用户名
2. 浏览器调用 navigator.credentials.get()
3. 设备用私钥签名挑战（challenge）
4. 服务器用公钥验证签名
```

### 前端代码

```javascript
// 注册
async function register(username) {
  const challenge = await fetch('/auth/register/challenge', {
    method: 'POST',
    body: JSON.stringify({ username })
  }).then(r => r.json())
  
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: base64url.decode(challenge),
      rp: { name: 'My App', id: 'myapp.com' },
      user: {
        id: base64url.decode(challenge),
        name: username,
        displayName: username
      },
      pubKeyCredParams: [
        { alg: -7, type: 'publicKey' },   // ES256
        { alg: -257, type: 'publicKey' }  // RS256
      ]
    }
  })
  
  await fetch('/auth/register/verify', {
    method: 'POST',
    body: JSON.stringify({ credential })
  })
}

// 登录
async function login(username) {
  const challenge = await fetch('/auth/login/challenge', {
    method: 'POST',
    body: JSON.stringify({ username })
  }).then(r => r.json())
  
  const credential = await navigator.credentials.get({
    publicKey: {
      challenge: base64url.decode(challenge),
      rpId: 'myapp.com'
    }
  })
  
  const result = await fetch('/auth/login/verify', {
    method: 'POST',
    body: JSON.stringify({ credential })
  })
  
  return result.ok
}
```

### Passkey 的优势

- **无需密码**：用户不需要记住密码
- **防钓鱼**：签名绑定到域名，钓鱼网站无法使用
- **防泄露**：私钥不离开设备
- **跨设备同步**：iCloud Keychain / Google Password Manager 自动同步

## CSRF 攻击和防御

### 攻击原理

```
1. 用户登录了 bank.com
2. 用户访问了 evil.com（还保持着 bank.com 的登录状态）
3. evil.com 有一个隐藏的表单，自动提交到 bank.com/transfer
4. 浏览器自动携带 bank.com 的 Cookie
5. 转账成功，用户不知情
```

### 防御方案

```python
# 方案一：CSRF Token（推荐）
from secrets import token_urlsafe

def generate_csrf_token(session):
    token = token_urlsafe(32)
    session['csrf_token'] = token
    return token

def verify_csrf_token(request, session):
    if request.form.get('csrf_token') != session.get('csrf_token'):
        abort(403)

# 方案二：SameSite Cookie（辅助防御）
Set-Cookie: session_id=xxx; SameSite=Strict
```

## 密码存储

### 为什么 MD5/SHA256 不够

```python
# ❌ 不安全
hashlib.md5(password.encode()).hexdigest()
hashlib.sha256(password.encode()).hexdigest()

# 原因：
# 1. 太快了——GPU 每秒可以计算数十亿次
# 2. 彩虹表攻击——预先计算好常见密码的哈希值
# 3. 没有 salt——相同密码的哈希值相同
```

### 推荐方案

```python
# ✅ bcrypt
import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12))
bcrypt.checkpw(password.encode(), hashed)

# ✅ Argon2（2015 年密码哈希竞赛冠军）
from argon2 import PasswordHasher
ph = PasswordHasher()
hashed = ph.hash(password)
ph.verify(hashed, password)
```

| 算法 | 速度 | 内存 | 推荐度 |
|------|------|------|--------|
| MD5 | 极快 | 低 | ❌ 已破解 |
| SHA256 | 快 | 低 | ❌ 不适合密码 |
| bcrypt | 慢 | 中 | ✅ 广泛使用 |
| Argon2 | 慢 | 高 | ✅✅ 最新推荐 |

## 认证架构选择建议

```
项目类型 → 推荐方案
├── 传统 Web 应用 → Session-Cookie（最简单、最安全）
├── SPA + 后端 API → httpOnly Cookie + Session 或 JWT
├── 微服务架构 → JWT（服务间）+ Session（用户端）
├── 移动端 App → JWT + Refresh Token
├── 第三方登录 → OAuth 2.0 + OIDC
└── 高安全需求 → Passkey（WebAuthn）
```

## 总结

认证安全的核心原则：

1. **密码永远不要明文存储**——用 bcrypt 或 Argon2
2. **Cookie 设置 httpOnly + secure + sameSite**
3. **JWT 不是银弹**——理解它的局限性
4. **HTTPS 是基础**——没有 HTTPS 谈认证安全都是空谈
5. **Passkey 是未来**——尽早支持，用户体验最好
