---
title: Docker 常用命令速查笔记
date: 2026-05-17
cover: https://picsum.photos/seed/docker-cheatsheet/800/400
desc: 日常开发中最常用的 Docker 命令整理，涵盖容器、镜像、网络、数据卷和 Compose 操作
tags: [Docker, 容器, 运维, 速查表]
---

## 为什么需要这份速查表

Docker 命令很多，但日常开发中真正高频使用的也就那几十个。这份笔记整理了我最常用的命令，按场景分类，方便快速查阅。

## 容器管理

### 基本操作

```bash
# 运行容器（前台）
docker run -it ubuntu:22.04 /bin/bash

# 运行容器（后台）
docker run -d --name my-nginx -p 8080:80 nginx:latest

# 查看运行中的容器
docker ps

# 查看所有容器（包括已停止的）
docker ps -a

# 停止容器
docker stop my-nginx

# 启动已停止的容器
docker start my-nginx

# 重启容器
docker restart my-nginx

# 删除容器（必须先停止）
docker rm my-nginx

# 强制删除运行中的容器
docker rm -f my-nginx
```

### 进入容器

```bash
# 进入运行中容器的 shell
docker exec -it my-nginx /bin/bash

# 执行单条命令
docker exec my-nginx ls /var/www/html

# 查看容器日志
docker logs my-nginx

# 实时查看日志
docker logs -f my-nginx

# 查看最近 100 行日志
docker logs --tail 100 my-nginx
```

### 容器信息

```bash
# 查看容器详细信息
docker inspect my-nginx

# 查看容器资源使用
docker stats

# 查看容器资源使用（一次性）
docker stats --no-stream

# 查看容器内运行的进程
docker top my-nginx
```

## 镜像管理

### 获取与查看

```bash
# 拉取镜像
docker pull nginx:latest
docker pull nginx:1.25-alpine

# 查看本地镜像
docker images

# 查看本地镜像（精简格式）
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# 搜索镜像
docker search nginx
```

### 构建镜像

```bash
# 从 Dockerfile 构建
docker build -t my-app:1.0 .

# 指定 Dockerfile 路径
docker build -f Dockerfile.prod -t my-app:prod .

# 使用构建参数
docker build --build-arg NODE_ENV=production -t my-app .

# 多阶段构建示例
# Dockerfile:
# FROM node:20-alpine AS builder
# WORKDIR /app
# COPY . .
# RUN npm ci && npm run build
# 
# FROM nginx:alpine
# COPY --from=builder /app/dist /usr/share/nginx/html
```

### 镜像操作

```bash
# 给镜像打标签
docker tag my-app:1.0 registry.example.com/my-app:1.0

# 推送镜像到仓库
docker push registry.example.com/my-app:1.0

# 登录 Docker Hub
docker login

# 登录私有仓库
docker login registry.example.com

# 删除镜像
docker rmi nginx:latest

# 强制删除镜像
docker rmi -f nginx:latest
```

## 数据卷管理

### 基本操作

```bash
# 创建数据卷
docker volume create my-data

# 查看所有数据卷
docker volume ls

# 查看数据卷详情
docker volume inspect my-data

# 删除数据卷
docker volume rm my-data

# 删除所有未使用的数据卷
docker volume prune
```

### 挂载数据卷

```bash
# 挂载命名数据卷
docker run -d -v my-data:/app/data my-app

# 挂载宿主机目录
docker run -d -v /host/path:/container/path my-app

# 只读挂载
docker run -d -v /host/path:/container/path:ro my-app

# 挂载单个文件
docker run -d -v /host/config.json:/app/config.json my-app
```

## 网络管理

### 基本操作

```bash
# 查看网络列表
docker network ls

# 创建自定义网络
docker network create my-network

# 创建指定子网的网络
docker network create --subnet 172.20.0.0/16 my-network

# 查看网络详情
docker network inspect my-network

# 删除网络
docker network rm my-network

# 删除所有未使用的网络
docker network prune
```

### 容器连接网络

```bash
# 运行容器时指定网络
docker run -d --network my-network --name app1 my-app

# 将运行中的容器连接到网络
docker network connect my-network my-nginx

# 从网络中断开容器
docker network disconnect my-network my-nginx
```

## Docker Compose

### 常用命令

```bash
# 启动所有服务（后台）
docker compose up -d

# 启动并查看日志
docker compose up

# 停止所有服务
docker compose down

# 停止并删除数据卷
docker compose down -v

# 重新构建并启动
docker compose up -d --build

# 查看服务状态
docker compose ps

# 查看服务日志
docker compose logs
docker compose logs -f web

# 进入服务容器
docker compose exec web /bin/bash

# 重启单个服务
docker compose restart web

# 扩展服务实例
docker compose up -d --scale worker=3
```

### docker-compose.yml 示例

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    depends_on:
      - db
      - redis
    networks:
      - app-network
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=secret
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    networks:
      - app-network

volumes:
  pgdata:

networks:
  app-network:
    driver: bridge
```

## 清理与维护

```bash
# 清理所有未使用的资源（镜像、容器、网络、构建缓存）
docker system prune

# 清理所有未使用的资源（包括未使用的数据卷）
docker system prune -a --volumes

# 查看 Docker 磁盘使用
docker system df

# 查看详细信息
docker system df -v
```

## 实用技巧

### 端口映射

```bash
# 单端口映射
docker run -p 8080:80 nginx

# 多端口映射
docker run -p 8080:80 -p 8443:443 nginx

# 绑定到特定 IP
docker run -p 127.0.0.1:8080:80 nginx

# 随机端口映射
docker run -P nginx
```

### 环境变量

```bash
# 直接设置
docker run -e NODE_ENV=production -e PORT=3000 my-app

# 从文件读取
docker run --env-file .env my-app

# 继承宿主机环境变量
docker run -e MY_VAR my-app
```

### 资源限制

```bash
# 限制内存
docker run -m 512m my-app

# 限制 CPU
docker run --cpus=1.5 my-app

# 同时限制
docker run -m 512m --cpus=1.5 my-app
```

## 常见问题

| 问题 | 解决方案 |
|------|---------|
| 容器启动后立即退出 | 检查前台进程是否持续运行，使用 `docker logs` 查看错误 |
| 端口被占用 | 使用 `docker ps` 查看占用端口的容器，或更换端口 |
| 权限问题 | 使用 `docker run -u $(id -u):$(id -g)` 指定用户 |
| 磁盘空间不足 | 运行 `docker system prune` 清理无用资源 |
| 网络不通 | 检查容器是否在同一网络，使用 `docker network inspect` 排查 |

这份速查表覆盖了 90% 的日常使用场景。建议收藏，需要时快速查阅。
