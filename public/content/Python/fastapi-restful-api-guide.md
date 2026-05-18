---
title: FastAPI 构建 RESTful API 完整指南
date: 2026-05-17
cover: https://picsum.photos/seed/fastapi-guide/800/400
desc: 从基础路由到异步任务，全面掌握 FastAPI 框架的最佳实践
tags: [FastAPI, Python, RESTful API, 后端开发]
---

## 为什么选择 FastAPI

FastAPI 是 Python 生态中最现代的 Web 框架之一。它基于 Python 类型提示，自动生成 API 文档，性能接近 Node.js 和 Go 框架。

### 核心优势

| 特性 | 说明 |
|------|------|
| 高性能 | 基于 Starlette 和 Pydantic，性能优秀 |
| 自动文档 | 自动生成 Swagger UI 和 ReDoc |
| 类型安全 | 基于 Python 类型提示，编辑器友好 |
| 异步支持 | 原生支持 async/await |
| 数据验证 | Pydantic 自动验证请求数据 |

## 快速开始

### 安装

```bash
pip install fastapi uvicorn[standard]
```

### 第一个 API

```python
from fastapi import FastAPI

app = FastAPI(title="我的 API", version="1.0.0")

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
async def get_item(item_id: int):
    return {"item_id": item_id, "name": f"Item {item_id}"}

# 启动
# uvicorn main:app --reload
```

访问 `http://localhost:8000/docs` 即可看到自动生成的 Swagger UI。

## 路由与请求处理

### 路径参数

```python
from fastapi import Path

@app.get("/users/{user_id}/posts/{post_id}")
async def get_user_post(
    user_id: int = Path(..., ge=1, description="用户ID"),
    post_id: int = Path(..., ge=1, description="文章ID"),
):
    return {"user_id": user_id, "post_id": post_id}
```

### 查询参数

```python
from fastapi import Query
from typing import Optional

@app.get("/articles")
async def list_articles(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    status: Optional[str] = Query(None, pattern="^(published|draft|archived)$"),
    tag: list[str] = Query([], description="标签筛选"),
):
    return {
        "page": page,
        "page_size": page_size,
        "status": status,
        "tags": tag,
    }
```

### 请求体

```python
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str | None = Field(None, max_length=100)
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "username": "alice",
                    "email": "alice@example.com",
                    "password": "secure123",
                    "full_name": "Alice Wang",
                }
            ]
        }
    }

@app.post("/users", status_code=201)
async def create_user(user: UserCreate):
    # user 已经通过 Pydantic 自动验证
    return {"message": f"用户 {user.username} 创建成功", "user_id": 1}
```

## 响应模型

```python
from pydantic import BaseModel

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str | None
    created_at: datetime
    
    model_config = {
        "from_attributes": True,  # 支持从 ORM 对象创建
    }

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    user = db.get_user(user_id)  # 返回 ORM 对象
    return user  # 自动转换为 UserResponse 格式
```

### 排除敏感字段

```python
class UserPublic(BaseModel):
    id: int
    username: str
    email: str

class UserPrivate(UserPublic):
    password_hash: str
    api_key: str

# 使用 response_model 自动排除敏感字段
@app.get("/users/{user_id}", response_model=UserPublic)
async def get_user_public(user_id: int):
    return db.get_user(user_id)  # password_hash 不会出现在响应中
```

## 依赖注入

### 基础依赖

```python
from fastapi import Depends, HTTPException

async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(
    token: str = Header(...),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.token == token).first()
    if not user:
        raise HTTPException(status_code=401, detail="无效的认证令牌")
    return user

@app.get("/users/me")
async def get_me(user: User = Depends(get_current_user)):
    return user
```

### 依赖复用

```python
from fastapi import APIRouter

router = APIRouter(
    prefix="/articles",
    tags=["文章"],
    dependencies=[Depends(get_current_user)],  # 所有路由都需要认证
)

@router.get("/")
async def list_articles():
    pass

@router.post("/")
async def create_article():
    pass
```

## 中间件

### CORS 中间件

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://myapp.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 自定义中间件

```python
import time
from starlette.middleware.base import BaseHTTPMiddleware

class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response

app.add_middleware(TimingMiddleware)
```

## 异步任务

### Background Tasks

```python
from fastapi import BackgroundTasks

def send_welcome_email(email: str, name: str):
    # 发送邮件（耗时操作）
    print(f"Sending welcome email to {email}")

@app.post("/register")
async def register(
    user: UserCreate,
    background_tasks: BackgroundTasks,
):
    # 创建用户
    db_user = create_user_in_db(user)
    
    # 异步发送邮件（不会阻塞响应）
    background_tasks.add_task(send_welcome_email, user.email, user.username)
    
    return {"message": "注册成功"}
```

### Celery 异步任务

```python
from celery import Celery

celery_app = Celery(
    "tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1",
)

@celery_app.task
def generate_report(user_id: int):
    # 耗时任务
    report = build_report(user_id)
    save_report(user_id, report)
    return report

@app.post("/reports")
async def create_report(user_id: int):
    task = generate_report.delay(user_id)
    return {"task_id": task.id, "status": "processing"}

@app.get("/reports/{task_id}")
async def get_report_status(task_id: str):
    task = generate_report.AsyncResult(task_id)
    return {
        "status": task.status,
        "result": task.result if task.ready() else None,
    }
```

## 错误处理

### 自定义异常处理器

```python
from fastapi import Request
from fastapi.responses import JSONResponse

class AppException(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
            }
        },
    )

# 使用
@app.get("/articles/{article_id}")
async def get_article(article_id: int):
    article = db.get_article(article_id)
    if not article:
        raise AppException(
            code="ARTICLE_NOT_FOUND",
            message=f"文章 {article_id} 不存在",
            status_code=404,
        )
    return article
```

## 项目结构

```
app/
├── main.py              # 应用入口
├── config.py            # 配置管理
├── dependencies.py      # 依赖注入
├── exceptions.py        # 自定义异常
├── models/              # Pydantic 模型
│   ├── user.py
│   └── article.py
├── routers/             # 路由模块
│   ├── user.py
│   └── article.py
├── services/            # 业务逻辑
│   ├── user_service.py
│   └── article_service.py
├── database.py          # 数据库连接
└── middleware/          # 中间件
    └── auth.py
```

## 配置管理

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "My API"
    debug: bool = False
    database_url: str
    secret_key: str
    redis_url: str = "redis://localhost:6379"
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }

settings = Settings()
```

## 测试

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

def test_create_user():
    response = client.post("/users", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123",
    })
    assert response.status_code == 201

def test_validation_error():
    response = client.post("/users", json={
        "username": "ab",  # 太短
        "email": "invalid",
        "password": "123",  # 太短
    })
    assert response.status_code == 422
```

## 部署

### Docker 部署

```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Gunicorn + Uvicorn

```bash
gunicorn main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000
```

## 总结

FastAPI 的核心优势：

1. **类型提示**——编辑器自动补全、类型检查、自动文档
2. **Pydantic 验证**——请求数据自动校验，减少样板代码
3. **依赖注入**——清晰的代码组织，易于测试
4. **异步支持**——原生 async/await，高并发场景表现优秀
5. **自动文档**——Swagger UI 和 ReDoc 开箱即用

对于 Python 后端开发来说，FastAPI 是目前最推荐的 Web 框架选择。
