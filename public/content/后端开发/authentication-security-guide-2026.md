---
title: 认证与安全实战：2026 年的应用安全指南
date: 2026-05-18
cover: https://picsum.photos/seed/auth-security-2026/800/400
desc: 从密码存储到 Passkey，从 JWT 到 OAuth 2.1，完整覆盖现代应用认证安全的最佳实践
tags: [认证, 安全, JWT, OAuth, Passkey, WebAuthn]
---

## 安全事故的代价

2025 年，22% 的数据泄露始于凭证盗用，平均每次事件损失 440 万美元。

最常见的漏洞：
- 凭证填充攻击
- Session 管理不当
- JWT 配置错误
- MFA 执行不充分

这篇文章不讲理论，讲的是：**如何在 2026 年构建一个真正安全的认证系统**。

## 认证方式演进

```
2020年之前：
密码 → 密码 + 验证码 → 密码 + 短信验证

2020-2024年：
密码 + TOTP → OAuth → Magic Link

2025-2026年：
Passkey（无密码） → Passkey + 设备绑定 → AI Agent 认证
```

## 核心原则

1. **最小权限**：只授予完成任务所需的最小权限
2. **纵深防御**：多层安全措施，单点失败不导致系统崩溃
3. **零信任**：不信任任何请求，每次都验证
4. **安全默认**：默认配置就是安全的

## 密码存储

### 永远不要做的事

```javascript
// ❌ 绝对不要
const hashed = md5(password);
const hashed = sha256(password);
const hashed = bcrypt.hashSync(password, 5); // rounds 太低

// ❌ 不要自己实现加密
const hashed = myCustomEncryption(password);
```

### 正确做法：Argon2id

2026 年的推荐算法：**Argon2id**

```typescript
import argon2 from 'argon2';

// 注册时
async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,  // 19 MB
    timeCost: 2,        // 2 迭代
    parallelism: 1,     // 1 线程
    saltLength: 16,     // 16 字节 salt
  });
}

// 登录时验证
async function verifyPassword(
  hashedPassword: string,
  inputPassword: string
): Promise<boolean> {
  try {
    return await argon2.verify(hashedPassword, inputPassword);
  } catch {
    return false;
  }
}
```

### 为什么选 Argon2id？

| 算法 | GPU 抵抗 | 侧信道抵抗 | 2026 推荐度 |
|------|----------|-----------|-------------|
| MD5 | ❌ | ❌ | 禁止使用 |
| SHA-256 | ❌ | ❌ | 禁止使用 |
| bcrypt | ✅ | ⚠️ | 可接受 |
| scrypt | ✅ | ✅ | 可接受 |
| Argon2id | ✅ | ✅ | 推荐 |

## JWT 的正确用法

### JWT 的常见错误

```typescript
// ❌ 错误 1：算法设置为 none
const token = jwt.sign(payload, secret, { algorithm: 'none' });

// ❌ 错误 2：密钥太弱
const secret = 'password123';

// ❌ 错误 3：永不过期
const token = jwt.sign(payload, secret, { expiresIn: '100y' });

// ❌ 错误 4：存储在 localStorage
localStorage.setItem('token', token);

// ❌ 错误 5：包含敏感信息
const payload = { id: 1, password: 'secret', ssn: '123-45-6789' };
```

### 正确做法

```typescript
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// 1. 使用强密钥（至少 256 位）
const generateSecret = () => crypto.randomBytes(32).toString('hex');

// 2. Access Token：短期（15 分钟）
const generateAccessToken = (userId: string) => {
  return jwt.sign(
    { sub: userId, type: 'access' },  // 只放必要信息
    process.env.JWT_SECRET!,
    { 
      algorithm: 'HS256',
      expiresIn: '15m',
      issuer: 'your-app',
      audience: 'your-app-users',
    }
  );
};

// 3. Refresh Token：长期（7 天），存储在数据库
const generateRefreshToken = (userId: string) => {
  const token = crypto.randomBytes(32).toString('hex');
  // 存储到数据库，关联用户
  await db.insert(refreshTokens).values({
    token,
    userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  return token;
};

// 4. Token 验证
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ['HS256'],  // 明确指定算法，防止算法切换攻击
      issuer: 'your-app',
      audience: 'your-app-users',
    });
  } catch (err) {
    // 区分错误类型
    if (err.name === 'TokenExpiredError') {
      throw new Error('TOKEN_EXPIRED');
    }
    if (err.name === 'JsonWebTokenError') {
      throw new Error('TOKEN_INVALID');
    }
    throw err;
  }
};

// 5. Token 刷新流程
const refreshTokens = async (refreshToken: string) => {
  // 验证 refresh token 在数据库中存在且未过期
  const stored = await db.query.refreshTokens.findFirst({
    where: eq(refreshTokens.token, refreshToken),
  });
  
  if (!stored || stored.expiresAt < new Date()) {
    throw new Error('REFRESH_TOKEN_INVALID');
  }
  
  // 生成新的 access token
  const newAccessToken = generateAccessToken(stored.userId);
  
  // 可选：轮换 refresh token（更安全）
  await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
  const newRefreshToken = await generateRefreshToken(stored.userId);
  
  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};
```

### Token 存储位置

| 位置 | XSS 风险 | CSRF 风险 | 推荐度 |
|------|----------|----------|--------|
| localStorage | ❌ 高 | ✅ 低 | 禁止 |
| sessionStorage | ❌ 高 | ✅ 低 | 不推荐 |
| 内存 | ✅ 低 | ✅ 低 | 可接受 |
| HttpOnly Cookie | ✅ 低 | ❌ 高 | 推荐 |

```typescript
// 设置 HttpOnly Cookie
app.post('/login', async (req, res) => {
  const { accessToken, refreshToken } = await authenticateUser(req.body);
  
  // Access Token：短期，HttpOnly
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,        // 仅 HTTPS
    sameSite: 'strict',  // 防止 CSRF
    maxAge: 15 * 60 * 1000, // 15 分钟
    path: '/',
  });
  
  // Refresh Token：长期，HttpOnly
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
    path: '/auth/refresh', // 只在刷新时发送
  });
  
  res.json({ success: true });
});
```

## OAuth 2.1 最佳实践

### 授权码流程（最安全）

```typescript
// 1. 重定向到授权服务器
app.get('/auth/login', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  
  // 存储 state 和 code_verifier
  session.set('oauth_state', state);
  session.set('code_verifier', codeVerifier);
  
  // PKCE challenge
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  
  const authUrl = new URL('https://auth.provider.com/authorize');
  authUrl.searchParams.set('client_id', process.env.OAUTH_CLIENT_ID!);
  authUrl.searchParams.set('redirect_uri', 'https://your-app.com/auth/callback');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  
  res.redirect(authUrl.toString());
});

// 2. 处理回调
app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // 验证 state
  if (state !== session.get('oauth_state')) {
    return res.status(400).json({ error: 'Invalid state' });
  }
  
  // 用 code 换 token
  const tokenResponse = await fetch('https://auth.provider.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code as string,
      redirect_uri: 'https://your-app.com/auth/callback',
      client_id: process.env.OAUTH_CLIENT_ID!,
      code_verifier: session.get('code_verifier'),
    }),
  });
  
  const tokens = await tokenResponse.json();
  
  // 存储 tokens，创建用户 session
  // ...
  
  res.redirect('/');
});
```

### 为什么用 PKCE？

| 攻击场景 | 无 PKCE | 有 PKCE |
|---------|---------|---------|
| 授权码拦截 | ❌ 可被攻击 | ✅ 安全 |
| 恶意应用冒充 | ❌ 可被攻击 | ✅ 安全 |
| Token 泄露后 | ❌ 可持续使用 | ✅ 有 scope 限制 |

## Passkey：无密码认证的未来

2026 年，所有主流平台都支持 Passkey：
- iOS/macOS：iCloud 钥匙串
- Android：Google 密码管理器
- Windows：Windows Hello
- 浏览器：Chrome、Safari、Edge

### 实现 WebAuthn

```typescript
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';

// 1. 注册开始：生成挑战
app.post('/auth/passkey/register/start', async (req, res) => {
  const user = req.user;
  
  const options = await generateRegistrationOptions({
    rpName: 'My App',
    rpID: 'myapp.com',
    userID: user.id,
    userName: user.email,
    userDisplayName: user.name,
    attestationType: 'none',
    excludeCredentials: user.authenticators.map(a => ({
      id: a.credentialID,
      type: 'public-key',
    })),
    authenticatorSelection: {
      authenticatorAttachment: 'platform', // 或 'cross-platform'
      userVerification: 'preferred',
    },
  });
  
  // 存储 challenge
  session.set('registration_challenge', options.challenge);
  
  res.json(options);
});

// 2. 注册完成：验证签名
app.post('/auth/passkey/register/complete', async (req, res) => {
  const { credential } = req.body;
  const expectedChallenge = session.get('registration_challenge');
  
  const verification = await verifyRegistrationResponse({
    credential,
    expectedChallenge,
    expectedOrigin: 'https://myapp.com',
    expectedRPID: 'myapp.com',
  });
  
  if (!verification.verified) {
    return res.status(400).json({ error: 'Verification failed' });
  }
  
  // 保存 authenticator
  await db.insert(authenticators).values({
    credentialID: verification.registrationInfo!.credentialID,
    publicKey: verification.registrationInfo!.credentialPublicKey,
    counter: verification.registrationInfo!.counter,
    userId: req.user.id,
  });
  
  res.json({ verified: true });
});

// 3. 登录：验证
app.post('/auth/passkey/login/start', async (req, res) => {
  const options = await generateAuthenticationOptions({
    rpID: 'myapp.com',
    userVerification: 'preferred',
  });
  
  session.set('authentication_challenge', options.challenge);
  res.json(options);
});

app.post('/auth/passkey/login/complete', async (req, res) => {
  const { credential } = req.body;
  const expectedChallenge = session.get('authentication_challenge');
  
  // 从数据库获取 authenticator
  const authenticator = await db.query.authenticators.findFirst({
    where: eq(authenticators.credentialID, credential.id),
  });
  
  const verification = await verifyAuthenticationResponse({
    credential,
    expectedChallenge,
    expectedOrigin: 'https://myapp.com',
    expectedRPID: 'myapp.com',
    authenticator: {
      credentialID: authenticator.credentialID,
      credentialPublicKey: authenticator.publicKey,
      counter: authenticator.counter,
    },
  });
  
  if (!verification.verified) {
    return res.status(400).json({ error: 'Verification failed' });
  }
  
  // 更新 counter（防止克隆攻击）
  await db.update(authenticators)
    .set({ counter: verification.authenticationInfo.newCounter })
    .where(eq(authenticators.id, authenticator.id));
  
  // 创建 session
  // ...
  
  res.json({ verified: true });
});
```

### Passkey 的优势

| 维度 | 密码 | TOTP | Passkey |
|------|------|------|---------|
| 钓鱼抵抗 | ❌ | ❌ | ✅ |
| 用户记忆 | ❌ 需要 | ✅ 不需要 | ✅ 不需要 |
| 设备依赖 | ✅ 无 | ⚠️ 需要手机 | ⚠️ 需要注册设备 |
| 恢复机制 | 重置密码 | 重新绑定 | 账户恢复流程 |

## API 安全清单

### 请求验证

```typescript
import { z } from 'zod';

// 所有输入都要验证
const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

app.post('/login', async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  // ...
});
```

### 速率限制

```typescript
import rateLimit from 'express-rate-limit';

// 登录接口：严格限制
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 5, // 每个 IP 最多 5 次尝试
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/login', loginLimiter, handleLogin);

// API 接口：宽松限制
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 100, // 每个 IP 最多 100 次请求
});

app.use('/api/', apiLimiter);
```

### 安全 Headers

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.example.com'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-origin' },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
```

### CORS 配置

```typescript
import cors from 'cors';

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ['https://myapp.com', 'https://admin.myapp.com'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400,
}));
```

## AI Agent 认证

2026 年的新问题：如何为 AI Agent 分配身份？

### 方案：Scoped API Keys

```typescript
// 创建 Agent 专用凭证
app.post('/agents', authenticateUser, async (req, res) => {
  const { name, scopes } = req.body;
  
  const apiKey = `agent_${crypto.randomBytes(32).toString('base64url')}`;
  const apiKeyHash = await argon2.hash(apiKey);
  
  await db.insert(agentCredentials).values({
    userId: req.user.id,
    name,
    keyHash: apiKeyHash,
    scopes: JSON.stringify(scopes), // ['read:documents', 'write:reports']
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 天
  });
  
  res.json({ apiKey }); // 只返回一次，让用户保存
});

// Agent 请求验证
const authenticateAgent = async (req, res, next) => {
  const apiKey = req.headers['x-agent-key'];
  if (!apiKey) return res.status(401).json({ error: 'Missing API key' });
  
  const credentials = await db.query.agentCredentials.findMany();
  let matched = null;
  
  for (const cred of credentials) {
    if (await argon2.verify(cred.keyHash, apiKey)) {
      matched = cred;
      break;
    }
  }
  
  if (!matched || matched.expiresAt < new Date()) {
    return res.status(401).json({ error: 'Invalid or expired API key' });
  }
  
  // 检查 scope
  const requiredScope = getRequiredScope(req);
  const scopes = JSON.parse(matched.scopes);
  if (!scopes.includes(requiredScope)) {
    return res.status(403).json({ error: 'Insufficient scope' });
  }
  
  req.agent = { id: matched.id, userId: matched.userId, scopes };
  next();
};
```

## 安全审计清单

部署前检查：

- [ ] 所有密码使用 Argon2id 存储
- [ ] JWT 有效期 ≤ 15 分钟
- [ ] JWT 使用 HttpOnly Cookie 存储
- [ ] OAuth 使用 PKCE
- [ ] 所有 API 都有速率限制
- [ ] 所有输入都有验证
- [ ] 安全 Headers 配置正确
- [ ] CORS 限制正确域名
- [ ] 敏感操作有二次验证
- [ ] 日志不包含密码、token 等敏感信息
- [ ] 有入侵检测和告警

## 总结

2026 年的认证安全，核心是：

1. **密码**：Argon2id，或者干脆用 Passkey 替代
2. **Token**：短期 JWT + HttpOnly Cookie + Refresh Token 轮换
3. **OAuth**：必须用 PKCE
4. **Passkey**：开始支持，这是未来的趋势
5. **AI Agent**：用 Scoped API Key，不要复用用户凭证

安全不是一次性工作，而是持续的过程。每季度检查一次依赖更新，每年做一次渗透测试，保持警惕。
