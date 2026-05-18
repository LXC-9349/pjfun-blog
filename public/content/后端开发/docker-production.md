---
title: Docker 生产环境实践：从 Dockerfile 到容器编排的经验总结
date: 2026-05-16
cover: https://picsum.photos/seed/docker-prod/800/400
desc: 基于多个生产项目的容器化经验，分享 Docker 镜像构建、安全加固和编排部署的实用技巧
tags: [Docker, 容器化, DevOps, 部署, 运维]
---

## Docker 在生产环境不是 `docker run` 就行

刚接触容器化的时候，我以为就是把应用塞进镜像，然后 `docker run` 就完事了。结果第一次上线就出了事故——镜像 1.2GB，部署了 5 分钟，跑起来还 OOM 了。

这篇文章不讲 Docker 入门，讲的是生产环境里真实遇到的问题和对应的解决方案。

## 镜像瘦身：从 1.2GB 到 120MB

### 问题出在基础镜像

很多人用 `node:latest` 或 `python:3.11` 作为基础镜像，这些镜像包含大量编译工具和系统包，生产环境完全用不到。

**错误示范：**

```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

这个镜像大概 1GB 左右。

**正确做法：使用多阶段构建**

```dockerfile
# 第一阶段：构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# 第二阶段：运行
FROM node:20-alpine AS runner
WORKDIR /app

# 创建非 root 用户
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

USER appuser
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

优化后大概 120MB。关键操作：

1. **用 alpine 版本基础镜像**：Alpine Linux 只有 5MB
2. **多阶段构建**：构建阶段的编译工具不会带到最终镜像
3. **`npm ci` 替代 `npm install`**：在 CI 环境中更可靠，且不会更新 lock 文件
4. **只复制需要的东西**：不是整个项目目录

### 进一步瘦身：减少层

Docker 的每个指令都会创建一层。合并 RUN 指令能减少层数：

```dockerfile
# 不推荐：多层
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*

# 推荐合并 RUN
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

`.dockerignore` 也很关键。很多人忘了写这个文件，导致构建上下文包含 `node_modules`、`.git`，构建会慢很多秒甚至一分钟：

```
node_modules
.git
.gitignore
*.md
.env
.env.local
docker-compose.yml
.gitkeep
```

## Dockerfile 的编写顺序影响缓存命中

Docker 构建时会缓存每一层。如果某个层没变化，它就直接用缓存。

合理的顺序是：**把变化频率最低的操作放前面，变化频率最高的放后面。**

```dockerfile
# 1. 基础镜像 - 几乎不变
FROM node:20-alpine AS runner

# 2. 系统依赖 - 很少变
RUN apk add --no-cache tini curl

# 3. 依赖文件 - 只有改依赖时才变
COPY package*.json ./
RUN npm ci --only=production

# 4. 应用代码 - 经常变
COPY dist/ ./dist/

# 5. 入口 - 几乎不变
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]
```

用 `tini` 作为 init 进程解决僵尸进程问题——Docker 容器中 PID 1 的特殊性导致子进程管理需要特殊处理，tini 能优雅地处理信号转发。

## 安全加固：别让容器成为后门

### 不要用 root 用户

容器内默认是 root，这很危险——如果攻击者突破了应用，就拿到了容器内的 root 权限。

```dockerfile
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
```

### 只读根文件系统

```yaml
# docker-compose.yml
services:
  app:
    image: my-app:latest
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
```

应用真的需要写文件时，用 tmpfs 或卷挂载，不要开放整个文件系统的写入权限。

### 不要暴露敏感信息

不要在 Dockerfile 里写死密码：

```dockerfile
# 绝对不要
ENV DB_PASSWORD=supersecret
ARG API_KEY=abc123
```

应该通过运行时环境变量或密钥管理服务传入：

```bash
docker run -e DB_PASSWORD=$(vault get password) my-app
```

### 安全扫描

```bash
# 使用 Trivy 扫描镜像
docker run aquasec/trivy image my-app:latest

# 集成到 CI
trivy image --severity HIGH,CRITICAL --exit-code 1 my-app:latest
```

## Docker Compose 的坑与经验

### healthcheck 很重要

没有健康检查的容器，Docker 不知道它是否真正可用：

```yaml
services:
  app:
    image: my-app:latest
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 依赖等待

```yaml
services:
  app:
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started

  postgres:
    image: postgres:16-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 5s
      retries: 5
```

`depends_on` 默认只检查容器是否启动了，不管里面的服务是否就绪。加上 `condition: service_healthy` 才真正可靠。

### 日志配置

容器默认日志驱动会无限增长，直到占满磁盘：

```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 资源限制

不设资源限制的容器可能把宿主机搞垮：

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## 生产环境部署：从 Compose 到 Swarm/K8s

如果只有几台机器，Docker Compose + Swarm 模式够用了：

```yaml
# docker-stack.yml
version: '3.8'

services:
  app:
    image: registry.example.com/my-app:latest
    ports:
      - target: 3000
        published: 80
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      restart_policy:
        condition: any

  postgres:
    # ...
```

关于更新策略：`order: start-first` 先启动新容器再停掉旧的，实现零停机部署。`parallelism: 1` 一次只更新一个副本，避免新版本有问题时全挂。

## 我踩过的一个真实坑：时区

容器默认时区是 UTC。如果日志用本地时间记录，排查问题时时间对不上会非常痛苦：

```dockerfile
# 在 Dockerfile 中设置时区
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata
```

或者运行时传环境变量：

```yaml
services:
  app:
    environment:
      - TZ=Asia/Shanghai
```

## 写在最后

容器化不是目的，稳定、可维护的部署才是。Docker 工具本身并不复杂，复杂的是围绕它构建的整套部署体系——镜像管理、配置注入、日志收集、监控告警、滚动更新。

先把前面这几件事情做好，你的容器化部署就基本靠谱了。
