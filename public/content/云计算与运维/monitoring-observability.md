---
title: 可观测性实战：日志、指标和链路追踪的三位一体
date: 2026-05-17
cover: https://picsum.photos/seed/observability/800/400
desc: 从实战角度搭建完整的可观测性体系，涵盖 Prometheus、Grafana、ELK 和 OpenTelemetry
tags: [可观测性, Prometheus, Grafana, 运维监控]
---

## 可观测性的三大支柱

```
         ┌──────────────┐
         │  可观测性     │
         └──────┬───────┘
                │
     ┌──────────┼──────────┐
     ▼          ▼          ▼
 ┌───────┐ ┌───────┐ ┌───────┐
 │ Logs  │ │Metrics│ │Traces │
 │ 日志  │ │ 指标  │ │ 链路  │
 └───────┘ └───────┘ └───────┘
  "发生了什么" "系统状态如何" "请求经过了什么"
```

- **日志（Logs）**：离散的事件记录，回答"发生了什么"
- **指标（Metrics）**：聚合的数值数据，回答"系统状态如何"
- **链路（Traces）**：请求的完整路径，回答"请求经过了哪些服务"

三者缺一不可。只有指标，你不知道为什么 CPU 突然飙升；只有日志，你无法快速定位问题趋势；只有链路，你不知道系统的整体健康状况。

## Prometheus + Grafana：指标监控

### Prometheus 架构

```
[应用] → 暴露 /metrics 端点
   ↓
[Prometheus] → 定期抓取（Pull 模式）→ 存储时序数据
   ↓
[Grafana] → 查询 PromQL → 展示 Dashboard
   ↓
[Alertmanager] → 告警通知（邮件/Slack/钉钉）
```

### 应用暴露指标

```python
# Python + Prometheus 客户端
from prometheus_client import Counter, Histogram, start_http_server
import time

# 定义指标
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'path', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')

start_http_server(8000)  # 在 :8000/metrics 暴露指标

@app.route('/api/users')
def get_users():
    start = time.time()
    try:
        users = db.get_users()
        REQUEST_COUNT.labels(method='GET', path='/api/users', status=200).inc()
        return users
    except Exception:
        REQUEST_COUNT.labels(method='GET', path='/api/users', status=500).inc()
        raise
    finally:
        REQUEST_DURATION.observe(time.time() - start)
```

### Prometheus 配置

```yaml
# prometheus.yml
global:
  scrape_interval: 15s  # 每 15 秒抓取一次

scrape_configs:
  - job_name: 'web-app'
    static_configs:
      - targets: ['web-app:8000']
  
  - job_name: 'node-exporter'  # 主机指标
    static_configs:
      - targets: ['node-exporter:9100']
```

### Grafana Dashboard

关键 Dashboard 面板：

```promql
# QPS（每秒请求数）
rate(http_requests_total[5m])

# 错误率
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100

# P99 响应时间
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# 内存使用率
(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100
```

## RED 方法 vs USE 方法

### RED 方法（面向服务）

| 指标 | 含义 | PromQL 示例 |
|------|------|------------|
| **R**ate | 每秒请求数 | `rate(http_requests_total[5m])` |
| **E**rrors | 每秒失败请求数 | `rate(http_requests_total{status=~"5.."}[5m])` |
| **D**uration | 响应时间分布 | `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))` |

### USE 方法（面向基础设施）

| 指标 | 含义 | PromQL 示例 |
|------|------|------------|
| **U**tilization | 资源使用率 | `node_cpu_usage_percent` |
| **S**aturation | 资源排队程度 | `node_load1` |
| **E**rrors | 资源错误数 | `node_network_receive_errs_total` |

**实践建议**：服务层用 RED，基础设施层用 USE。

## ELK 日志收集

### 架构

```
[应用] → 输出 JSON 日志到 stdout
   ↓
[Filebeat] → 收集日志文件 → 发送到 Logstash
   ↓
[Logstash] → 过滤、解析、转换
   ↓
[Elasticsearch] → 存储和索引
   ↓
[Kibana] → 搜索和可视化
```

### 应用日志格式

```python
import logging
import json

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "message": record.getMessage(),
            "service": "order-service",
            "trace_id": getattr(record, "trace_id", None),
            "user_id": getattr(record, "user_id", None),
        }
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry)

logger = logging.getLogger()
logger.handlers[0].setFormatter(JSONFormatter())
```

**关键**：日志必须是结构化的（JSON），不是纯文本。这样 Kibana 才能按字段搜索和聚合。

### Filebeat 配置

```yaml
# filebeat.yml
filebeat.inputs:
  - type: container
    paths:
      - '/var/lib/docker/containers/*/*.log'
    processors:
      - add_kubernetes_metadata:
          host: ${NODE_NAME}

output.logstash:
  hosts: ["logstash:5044"]
```

## OpenTelemetry 链路追踪

### 配置

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

# 配置追踪
trace.set_tracer_provider(TracerProvider())
otlp_exporter = OTLPSpanExporter(endpoint="jaeger:4317", insecure=True)
span_processor = BatchSpanProcessor(otlp_exporter)
trace.get_tracer_provider().add_span_processor(span_processor)

tracer = trace.get_tracer("order-service")

# 在代码中使用
@tracer.start_as_current_span("process_order")
def process_order(order_id):
    with tracer.start_as_current_span("validate_order"):
        validate(order_id)
    
    with tracer.start_as_current_span("charge_payment"):
        payment_service.charge(order_id)
    
    with tracer.start_as_current_span("update_inventory"):
        inventory_service.update(order_id)
```

### Jaeger UI 中的追踪

```
Trace ID: abc123...
process_order [350ms] ──────────────────────────────────────
├── validate_order [25ms] ──█
├── charge_payment [200ms] ─────────████████████
│   └── payment-service.charge [180ms] ───────██████████
└── update_inventory [120ms] ───────────███████
    └── inventory-service.update [100ms] ────█████
```

一眼就能看出瓶颈在支付服务。

## 告警规则设计

### Prometheus AlertManager

```yaml
# alerting_rules.yml
groups:
  - name: service-alerts
    rules:
      - alert: HighErrorRate
        expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "错误率超过 5%"
          description: "服务 {{ $labels.job }} 的错误率为 {{ $value | humanizePercentage }}"
      
      - alert: HighLatency
        expr: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "P99 延迟超过 1 秒"
```

### 避免告警疲劳

```
❌ 错误做法：
- 任何异常都告警
- 没有分级（所有告警都是 P0）
- 告警后没有 runbook

✅ 正确做法：
- 只告警需要人工介入的问题
- 分级：P0（立即响应）、P1（30 分钟内）、P2（下一个工作日）
- 每个告警附带 runbook（处理步骤）
- 定期回顾告警，消除误报
```

## 完整的 Docker Compose 部署

```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    ports: ["9090:9090"]
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
  
  grafana:
    image: grafana/grafana:latest
    ports: ["3000:3000"]
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana-data:/var/lib/grafana
  
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports: ["16686:16686", "14268:14268", "4317:4317"]
  
  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports: ["9200:9200"]
    volumes:
      - es-data:/usr/share/elasticsearch/data
  
  kibana:
    image: kibana:8.11.0
    ports: ["5601:5601"]
    depends_on: [elasticsearch]

volumes:
  prometheus-data:
  grafana-data:
  es-data:
```

## 总结

可观测性不是"出了问题才想起来加"的东西，而是系统架构的一部分。

搭建顺序建议：
1. **先加指标**（Prometheus）：投入最小，收益最大
2. **再加日志**（ELK）：结构化日志，方便搜索
3. **最后加链路**（OpenTelemetry）：微服务架构必备
4. **配置告警**：只告真正需要人工介入的问题

一个好的可观测性体系，能让你在用户发现问题之前就收到告警，在告警响起时就知道问题在哪。
