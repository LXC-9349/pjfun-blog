---
title: OWASP Top 10 2026：Web 应用最常见的安全风险
date: 2026-05-17
cover: https://picsum.photos/seed/owasp-top10/800/400
desc: 结合最新 OWASP Top 10，讲解每个漏洞的原理、攻击方式和防御策略
tags: [OWASP, Web安全, 漏洞防护, 后端安全]
---

## 什么是 OWASP Top 10

OWASP（Open Web Application Security Project）是一个非营利组织，每 3-4 年发布一次 Top 10 Web 应用安全风险列表。这份列表基于真实数据——来自数百个组织的漏洞统计。

了解 OWASP Top 10 不是为了应付安全审计，而是为了知道攻击者最常利用的入口在哪里。

## A01: 失效的访问控制（Broken Access Control）

**连续 5 年排名第一**。大多数应用都有这个问题。

### 攻击示例

```
# 水平越权：用户 A 访问用户 B 的数据
GET /api/orders/12345  # 12345 是用户 B 的订单

# 垂直越权：普通用户访问管理员接口
GET /api/admin/users
DELETE /api/users/1
```

### 防御代码

```python
# ❌ 不安全：只验证了登录，没验证权限
@app.route('/api/orders/<order_id>')
def get_order(order_id):
    if not current_user.is_authenticated:
        return abort(401)
    order = db.orders.find_one({"_id": order_id})
    return order

# ✅ 安全：验证订单属于当前用户
@app.route('/api/orders/<order_id>')
def get_order(order_id):
    if not current_user.is_authenticated:
        return abort(401)
    order = db.orders.find_one({
        "_id": order_id,
        "user_id": current_user.id  # 关键：验证归属关系
    })
    if not order:
        return abort(403)
    return order
```

### 检测工具

- **Burp Suite**：自动化越权测试
- **OWASP ZAP**：免费的安全扫描器

## A02: 加密机制失效（Cryptographic Failures）

### 常见问题

```python
# ❌ 用 HTTP 传输敏感数据
POST http://api.example.com/login  # 密码明文传输

# ❌ 弱加密算法
from Crypto.Cipher import DES  # DES 已被破解
cipher = DES.new(key)

# ❌ 硬编码密钥
API_KEY = "sk-1234567890abcdef"  # 提交到 Git

# ❌ 密码用 MD5 存储
password_hash = hashlib.md5(password.encode()).hexdigest()
```

### 防御

```python
# ✅ 强制 HTTPS
# Nginx 配置
server {
    listen 80;
    return 301 https://$host$request_uri;
}

# ✅ 用强加密算法
from cryptography.fernet import Fernet
key = Fernet.generate_key()
cipher = Fernet(key)

# ✅ 密钥管理
import os
API_KEY = os.environ.get("API_KEY")  # 从环境变量读取

# ✅ 密码用 Argon2
from argon2 import PasswordHasher
ph = PasswordHasher()
hashed = ph.hash(password)
```

## A03: 注入（Injection）

### SQL 注入

```python
# ❌ 拼接 SQL
query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
# 输入: username = "admin' --"
# 结果: SELECT * FROM users WHERE username = 'admin' --' AND password = ''

# ✅ 参数化查询
cursor.execute(
    "SELECT * FROM users WHERE username = %s AND password = %s",
    (username, password)
)

# ✅ ORM（SQLAlchemy）
user = db.session.query(User).filter_by(username=username, password=password).first()
```

### 命令注入

```python
# ❌ 拼接命令
import os
os.system(f"ping {user_input}")
# 输入: 127.0.0.1; rm -rf /

# ✅ 使用 subprocess + 参数列表
import subprocess
subprocess.run(["ping", "-c", "1", user_input], check=True)
```

### XSS（跨站脚本）

```html
<!-- 反射型 XSS -->
<!-- 输入: <script>alert(document.cookie)</script> -->
<p>搜索结果: {{ search_query }}</p>

<!-- 防御：转义输出 -->
<p>搜索结果: {{ search_query | escape }}</p>

<!-- 存储型 XSS -->
<!-- 用户评论保存到数据库，其他用户查看时被执行 -->
<div class="comment">{{ comment.content }}</div>

<!-- 防御：服务端转义 + CSP 头 -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">
```

## A04: 不安全的设计（Insecure Design）

这不是代码 bug，而是架构层面的安全问题。

### 案例：密码重置逻辑漏洞

```
1. 用户请求重置密码
2. 系统发送 6 位验证码到邮箱
3. 用户输入验证码 → 设置新密码

漏洞：6 位验证码只有 100 万种组合，暴力破解只需几秒
```

### 修复

```python
import secrets
import time

# ✅ 使用足够长的随机 token
reset_token = secrets.token_urlsafe(32)  # 256 位随机

# ✅ 限制尝试次数
def verify_reset_token(token, attempts):
    if attempts > 5:
        raise TooManyAttemptsError()
    # ...

# ✅ 设置过期时间
def create_reset_token(user_id):
    return {
        "user_id": user_id,
        "token": secrets.token_urlsafe(32),
        "expires_at": time.time() + 3600  # 1 小时过期
    }
```

## A05: 安全配置错误（Security Misconfiguration）

### 常见错误

```yaml
# ❌ 生产环境开启调试模式
DEBUG = True  # 暴露堆栈信息和代码路径

# ❌ 默认密码
admin:admin  # 数据库、管理后台、Redis

# ❌ 暴露敏感端点
GET /.env          # 环境变量
GET /api/swagger   # API 文档（生产环境）
GET /.git/config   # Git 配置

# ❌ 缺少安全头
# 应该设置的 HTTP 头
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0  # 现代浏览器不需要，用 CSP 替代
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Nginx 安全配置

```nginx
server {
    # 隐藏版本号
    server_tokens off;
    
    # 安全头
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'" always;
    
    # 禁止访问敏感文件
    location ~ /\.(env|git|htaccess) {
        deny all;
    }
}
```

## A06: 脆弱和过时的组件（Vulnerable and Outdated Components）

### 问题

```
你的应用可能很安全，但依赖的库有漏洞：
- Log4j (CVE-2021-44228)
- Spring4Shell (CVE-2022-22965)
- OpenSSL Heartbleed (CVE-2014-0160)
```

### 防御

```bash
# 定期扫描依赖漏洞
npm audit           # Node.js
pip-audit           # Python
bundle audit        # Ruby
trivy fs .          # 通用（推荐）

# CI 中集成
# .github/workflows/security.yml
- name: Scan dependencies
  run: |
    pip install pip-audit
    pip-audit --format=json --output=audit-results.json
```

## A07: 身份认证和会话管理失效

### 常见问题

```python
# ❌ 密码策略太弱
# 允许 "123456"、"password" 作为密码

# ✅ 强制密码策略
import re
def validate_password(password):
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'[0-9]', password):
        return False
    return True

# ❌ Session 固定攻击
# 登录前后使用同一个 Session ID

# ✅ 登录后重新生成 Session ID
def login(username, password):
    user = authenticate(username, password)
    if user:
        session.regenerate_id()  # 关键
        session['user_id'] = user.id
```

## A08: 软件和数据完整性故障

### 不安全的反序列化

```python
# ❌ 反序列化不可信数据
import pickle
data = pickle.loads(user_input)  # 可以执行任意代码

# ✅ 使用安全的序列化格式
import json
data = json.loads(user_input)  # 只能解析数据，不能执行代码
```

### CI/CD 管道安全

```yaml
# ❌ 在 CI 中使用不受信任的 Action
- uses: some-random-user/action@v1  # 可能被植入恶意代码

# ✅ 固定 Action 的 commit hash
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
```

## A09: 安全日志和监控不足

### 应该记录的安全事件

```python
import logging

security_logger = logging.getLogger('security')

def log_security_event(event_type, user_id=None, details=None):
    security_logger.warning(
        f"Security event: {event_type}",
        extra={
            "event_type": event_type,
            "user_id": user_id,
            "details": details,
            "ip_address": request.remote_addr,
            "user_agent": request.headers.get('User-Agent')
        }
    )

# 记录以下事件
log_security_event("LOGIN_FAILED", details={"username": "admin"})
log_security_event("PRIVILEGE_ESCALATION", user_id=123)
log_security_event("SENSITIVE_DATA_ACCESS", user_id=123)
log_security_event("RATE_LIMIT_EXCEEDED")
```

### 不应该记录的内容

```python
# ❌ 不要记录
password          # 密码
credit_card       # 信用卡号
session_token     # Session Token
pii_data          # 个人身份信息
```

## A10: 服务端请求伪造（SSRF）

### 攻击原理

```
用户输入 URL → 服务端发起请求 → 攻击者让服务端访问内网

输入: http://169.254.169.254/latest/meta-data/
结果: 服务端访问 AWS 元数据，泄露密钥
```

### 防御

```python
import ipaddress
from urllib.parse import urlparse

ALLOWED_DOMAINS = {'api.example.com', 'images.example.com'}

def is_safe_url(url):
    parsed = urlparse(url)
    
    # 检查域名
    if parsed.hostname not in ALLOWED_DOMAINS:
        return False
    
    # 检查是否是内网 IP
    try:
        ip = ipaddress.ip_address(parsed.hostname)
        if ip.is_private or ip.is_loopback or ip.is_link_local:
            return False
    except ValueError:
        pass
    
    # 检查协议
    if parsed.scheme not in ('http', 'https'):
        return False
    
    return True

def fetch_url(url):
    if not is_safe_url(url):
        raise ValueError("Unsafe URL")
    return requests.get(url, timeout=5)
```

## 总结

OWASP Top 10 不是一份"待办清单"，而是一份"风险地图"。

防御策略的优先级：
1. **输入验证**：所有外部输入都是不可信的
2. **输出编码**：所有输出到浏览器的内容都要转义
3. **最小权限**：每个组件只拥有完成工作所需的最小权限
4. **纵深防御**：不要依赖单一安全措施
5. **持续监控**：安全不是一次性的，是持续的过程
