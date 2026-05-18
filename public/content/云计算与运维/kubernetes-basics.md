---
title: Kubernetes 入门：从 Docker Compose 到 K8s 的平滑过渡
date: 2026-05-17
cover: https://picsum.photos/seed/k8s-basics/800/400
desc: 为熟悉 Docker 的开发者讲解 Kubernetes 的核心概念，通过对比 Docker Compose 帮助快速理解
tags: [Kubernetes, Docker, 容器编排, 运维]
---

## 为什么需要 Kubernetes

Docker Compose 很好用，但当你遇到以下问题时，就需要 K8s 了：

| 场景 | Docker Compose | Kubernetes |
|------|---------------|------------|
| 容器挂了自动重启 | ✅ restart: always | ✅ 自动重启 + 健康检查 |
| 跨多台主机部署 | ❌ | ✅ |
| 自动扩缩容 | ❌ | ✅ HPA |
| 服务发现和负载均衡 | ⚠️ 基础 | ✅ 内置 |
| 滚动更新（零停机） | ❌ | ✅ |
| 配置和密钥管理 | ⚠️ .env 文件 | ✅ ConfigMap / Secret |
| 自愈（节点故障迁移） | ❌ | ✅ |

**简单说**：Docker Compose 适合单机开发环境，K8s 适合生产环境。

## 核心概念对照表

| Docker Compose | Kubernetes | 说明 |
|---------------|------------|------|
| `service` | `Pod` | 最小部署单元 |
| `docker-compose.yml` | `Deployment` YAML | 定义如何运行容器 |
| `ports` | `Service` | 网络暴露和负载均衡 |
| `networks` | `Service` + `NetworkPolicy` | 服务间通信 |
| `volumes` | `PersistentVolume` + `PVC` | 持久化存储 |
| `environment` | `ConfigMap` / `Secret` | 配置管理 |
| `depends_on` | 无直接对应 | K8s 通过 readiness probe 控制 |
| N/A | `Ingress` | HTTP 路由和 TLS |

## 从 docker-compose.yml 到 K8s

### Docker Compose 示例

```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "80:3000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/mydb
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: pass
    volumes:
      - pgdata:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

### 对应的 K8s 配置

#### 1. ConfigMap 和 Secret

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DATABASE_HOST: "postgres-service"
  DATABASE_NAME: "mydb"
  REDIS_URL: "redis://redis-service:6379"

# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  # echo -n "pass" | base64
  POSTGRES_PASSWORD: cGFzcw==
  DATABASE_USER: dXNlcg==
```

#### 2. Deployment

```yaml
# web-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3  # 3 个副本
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: myapp:latest
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: app-config
            - secretRef:
                name: app-secret
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 20
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "500m"
```

#### 3. Service

```yaml
# web-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP  # 集群内部访问

# 如果需要外部访问
---
apiVersion: v1
kind: Service
metadata:
  name: web-service-external
spec:
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 3000
  type: LoadBalancer  # 云提供商会自动分配负载均衡器
```

#### 4. Ingress（HTTP 路由）

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - myapp.example.com
      secretName: myapp-tls
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-service
                port:
                  number: 80
```

## Pod、Deployment、Service 的关系

```
                    ┌─────────────────┐
                    │    Ingress      │  ← 外部流量入口
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │    Service      │  ← 稳定的 IP 和 DNS
                    │  (负载均衡器)    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼───┐  ┌──────▼──────┐  ┌────▼─────┐
     │   Pod 1    │  │    Pod 2    │  │  Pod 3   │
     │ (容器组)    │  │  (容器组)    │  │ (容器组)  │
     └────────────┘  └─────────────┘  └──────────┘
              ▲
              │
     ┌────────┴────────┐
     │   Deployment    │  ← 管理 Pod 的生命周期
     │  (副本数: 3)    │
     └─────────────────┘
```

- **Pod**：K8s 最小部署单元，包含一个或多个容器
- **Deployment**：管理 Pod 的创建、更新、回滚
- **Service**：为 Pod 提供稳定的网络入口（Pod IP 会变，Service IP 不变）

## 水平扩缩容（HPA）

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70  # CPU 使用率超过 70% 时扩容
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

## 常见排错命令

```bash
# 查看 Pod 状态
kubectl get pods
kubectl get pods -w  # 实时监控

# 查看 Pod 详情（排错第一步）
kubectl describe pod <pod-name>

# 查看日志
kubectl logs <pod-name>
kubectl logs <pod-name> -f  # 实时日志
kubectl logs <pod-name> --previous  # 上一次运行的日志（崩溃后）

# 进入容器
kubectl exec -it <pod-name> -- /bin/sh

# 查看 Service
kubectl get svc
kubectl describe svc <service-name>

# 查看事件（排错利器）
kubectl get events --sort-by='.lastTimestamp'

# 查看资源使用
kubectl top pods
kubectl top nodes
```

## 总结

从 Docker Compose 到 K8s 的迁移路径：

1. **先理解概念映射**：service → Pod + Deployment + Service
2. **从 Minikube 开始**：本地开发用 Minikube 或 kind
3. **逐步迁移**：先迁移无状态服务，再迁移有状态服务
4. **用 Helm 管理配置**：避免 YAML 文件爆炸
5. **建立监控**：Prometheus + Grafana 是 K8s 的标准监控方案

K8s 的学习曲线确实陡，但一旦掌握，它会成为你最强大的运维工具。
