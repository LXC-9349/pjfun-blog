---
title: Docker Compose 实战：常见服务编排模式和最佳实践
date: 2026-05-17
cover: https://picsum.photos/seed/docker-compose-patterns/800/400
desc: 收集了开发环境中最常用的 Docker Compose 编排模式，拿来即用
tags: [Docker, Docker Compose, 开发工具, 运维]
---

## Docker Compose 基础

### 三个核心概念

```yaml
services:    # 容器（你的应用）
  web:
    image: nginx

networks:    # 网络（容器间通信）
  frontend:
    driver: bridge

volumes:     # 存储（数据持久化）
  db-data:
    driver: local
```

**关系**：Service 通过 Network 通信，数据存储在 Volume 中。

## 模式一：Web App + Database

最经典的组合：Nginx + Node.js + PostgreSQL。

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - app
    networks:
      - frontend

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      db:
        condition: service_healthy
    networks:
      - frontend
      - backend

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d mydb"]
      interval: 5s
      timeout: 3s
      retries: 5
    networks:
      - backend

volumes:
  pgdata:

networks:
  frontend:
  backend:
```

**关键点**：
- `depends_on` + `condition: service_healthy` 确保数据库就绪后再启动应用
- 两个 network 隔离：frontend（Nginx ↔ App）和 backend（App ↔ DB）
- Nginx 配置用 `:ro` 只读挂载

## 模式二：微服务 + 消息队列

```yaml
version: '3.8'

services:
  api-gateway:
    build: ./gateway
    ports:
      - "8080:8080"
    environment:
      - USER_SERVICE_URL=http://user-service:3001
      - ORDER_SERVICE_URL=http://order-service:3002
    depends_on:
      - user-service
      - order-service

  user-service:
    build: ./services/user
    environment:
      - DATABASE_URL=postgresql://user:pass@user-db:5432/users
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
    depends_on:
      - user-db
      - rabbitmq

  order-service:
    build: ./services/order
    environment:
      - DATABASE_URL=postgresql://user:pass@order-db:5432/orders
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
    depends_on:
      - order-db
      - rabbitmq

  user-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: users
      POSTGRES_PASSWORD: pass
    volumes:
      - user-db-data:/var/lib/postgresql/data

  order-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: orders
      POSTGRES_PASSWORD: pass
    volumes:
      - order-db-data:/var/lib/postgresql/data

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"    # AMQP
      - "15672:15672"  # 管理界面
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq

volumes:
  user-db-data:
  order-db-data:
  rabbitmq-data:
```

## 模式三：全栈开发环境

前端 + 后端 + 数据库 + 缓存 + 邮件服务。

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:8080

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "8080:8080"
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/app
      - REDIS_URL=redis://redis:6379
      - MAIL_HOST=mailhog
      - MAIL_PORT=1025
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"   # SMTP
      - "8025:8025"   # Web UI

volumes:
  pgdata:
  redisdata:
```

**开发体验**：
- 前端热重载（Vite）
- 后端热重载（nodemon / uvicorn --reload）
- MailHog 捕获所有邮件，不需要真实 SMTP

## 模式四：开发环境热重载

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app              # 挂载源代码
      - /app/node_modules   # 不覆盖容器内的 node_modules
      - /app/.next          # 不覆盖构建产物
    environment:
      - NODE_ENV=development
    command: npm run dev    # 覆盖 Dockerfile 的 CMD
    stdin_open: true
    tty: true
```

**Dockerfile.dev**：
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]
```

## 环境变量管理

### .env 文件

```bash
# .env（不要提交到 Git）
POSTGRES_USER=myuser
POSTGRES_PASSWORD=secret123
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/mydb
REDIS_URL=redis://redis:6379
```

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  
  app:
    environment:
      DATABASE_URL: ${DATABASE_URL}
```

### 多环境配置

```bash
# 基础配置
docker-compose.yml

# 开发覆盖
docker-compose.dev.yml

# 生产覆盖
docker-compose.prod.yml
```

```yaml
# docker-compose.dev.yml
services:
  app:
    environment:
      - DEBUG=true
      - LOG_LEVEL=debug
    volumes:
      - .:/app

# docker-compose.prod.yml
services:
  app:
    environment:
      - DEBUG=false
      - LOG_LEVEL=warning
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

```bash
# 启动开发环境
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# 启动生产环境
docker compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## 健康检查和依赖顺序

```yaml
services:
  db:
    image: postgres:15
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s  # 启动后等待 30 秒再开始检查

  app:
    depends_on:
      db:
        condition: service_healthy  # 等 db 健康后再启动
      redis:
        condition: service_started  # 只需启动，不需要健康检查
```

## 数据持久化

### Named Volume（推荐）

```yaml
volumes:
  pgdata:
    driver: local

services:
  db:
    volumes:
      - pgdata:/var/lib/postgresql/data
```

数据存储在 Docker 管理的目录中（`/var/lib/docker/volumes/`）。

### Bind Mount（开发环境）

```yaml
services:
  app:
    volumes:
      - ./src:/app/src  # 宿主机目录映射到容器
```

适合开发环境，代码修改即时生效。

## 常用命令

```bash
# 启动
docker compose up -d

# 查看日志
docker compose logs -f app

# 进入容器
docker compose exec app sh

# 重启单个服务
docker compose restart app

# 重建（代码变更后）
docker compose up -d --build

# 停止并删除容器（保留数据卷）
docker compose down

# 停止并删除容器和数据卷
docker compose down -v

# 查看服务状态
docker compose ps

# 查看资源使用
docker compose top
```

## 总结

Docker Compose 的核心原则：

1. **每个服务一个职责**——数据库、缓存、应用分开
2. **用 healthcheck 控制启动顺序**——不要只依赖 `depends_on`
3. **开发环境用 bind mount**——代码修改即时生效
4. **生产环境用 named volume**——数据持久化
5. **环境变量用 .env 文件**——不要硬编码
6. **多环境用覆盖文件**——保持基础配置不变
