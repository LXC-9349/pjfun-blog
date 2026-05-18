---
title: 可观测性实战：OpenTelemetry + Prometheus + Grafana 完整指南
date: 2026-05-18
cover: https://picsum.photos/seed/observability-otel/800/400
desc: 监控只能发现已知问题，可观测性能定位未知问题。OpenTelemetry 已成为事实标准，本文详解完整实现
tags: [OpenTelemetry, 可观测性, Prometheus, Grafana, 监控]
---

## 监控 vs 可观测性

**监控**：告诉你系统不健康了（已知问题）
**可观测性**：帮你理解为什么系统不健康（未知问题）

```
监控：
- CPU 使用率 90% → 告警
- 响应时间 > 500ms → 告警

可观测性：
- 用户 A 在上海调用 /api/checkout，延迟 2.3s
  → 追踪发现：数据库查询 1.5s + Redis 超时 0.5s
  → 根因：数据库连接池耗尽
```

可观测性三大支柱：

| 支柱 | 用途 | 工具 |
|------|------|------|
| Metrics（指标） | 趋势、告警 | Prometheus |
| Logs（日志） | 事件记录 | Loki, Elasticsearch |
| Traces（追踪） | 请求链路 | Jaeger, Tempo |

## OpenTelemetry：统一标准

2026 年，OpenTelemetry 已成为可观测性的事实标准。它提供：

1. **统一的 API**：一套代码，适配所有后端
2. **跨语言支持**：Go、Java、Python、Node.js、.NET...
3. **厂商中立**：不被锁定在任何云服务商

### 架构

```
┌─────────────┐
│  应用代码    │
│  (OTel SDK) │
└──────┬──────┘
       │ OTLP 协议
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Collector │────►│  Prometheus │────►│   Grafana   │
│   (可选)     │     │   (指标)     │     │  (可视化)    │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       │           ┌─────────────┐
       └──────────►│    Loki     │
                   │   (日志)    │
                   └─────────────┘
       │
       │           ┌─────────────┐
       └──────────►│    Tempo    │
                   │  (追踪)     │
                   └─────────────┘
```

## 实战：Node.js + OpenTelemetry

### 安装依赖

```bash
npm install @opentelemetry/api \
            @opentelemetry/sdk-node \
            @opentelemetry/sdk-trace-node \
            @opentelemetry/sdk-metrics \
            @opentelemetry/exporter-prometheus \
            @opentelemetry/exporter-trace-otlp-grpc \
            @opentelemetry/exporter-metrics-otlp-grpc \
            @opentelemetry/instrumentation-http \
            @opentelemetry/instrumentation-express \
            @opentelemetry/instrumentation-pg
```

### 初始化 OpenTelemetry

```typescript
// telemetry.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

// 配置
const OTEL_COLLECTOR_URL = process.env.OTEL_COLLECTOR_URL || 'http://localhost:4317';
const SERVICE_NAME = process.env.SERVICE_NAME || 'my-service';
const PROMETHEUS_PORT = parseInt(process.env.PROMETHEUS_PORT || '9464');

// 创建资源
const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: SERVICE_NAME,
  [ATTR_SERVICE_VERSION]: '1.0.0',
});

// Trace Exporter (OTLP)
const traceExporter = new OTLPTraceExporter({
  url: OTEL_COLLECTOR_URL,
});

// Metric Exporter (Prometheus)
const metricReader = new PrometheusExporter({
  port: PROMETHEUS_PORT,
});

// 初始化 SDK
export const sdk = new NodeSDK({
  resource,
  traceExporter,
  metricReader,
  instrumentations: [
    ...getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-express': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-pg': {
        enabled: true,
      },
    }),
  ],
});

// 启动
export function startTelemetry() {
  sdk.start();
  console.log(`OpenTelemetry started, Prometheus metrics at :${PROMETHEUS_PORT}/metrics`);
  
  // 优雅关闭
  process.on('SIGTERM', async () => {
    await sdk.shutdown();
    process.exit(0);
  });
}
```

### 在应用中使用

```typescript
// app.ts
import express from 'express';
import { startTelemetry } from './telemetry';
import { trace, metrics } from '@opentelemetry/api';

startTelemetry();

const app = express();
const tracer = trace.getTracer('my-service');
const meter = metrics.getMeter('my-service');

// 自定义指标
const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Total HTTP requests',
});

const requestDuration = meter.createHistogram('http_request_duration_ms', {
  description: 'HTTP request duration in milliseconds',
});

app.get('/api/users', async (req, res) => {
  const startTime = Date.now();
  
  // 创建 Span
  const span = tracer.startSpan('get_users', {
    attributes: {
      'http.method': 'GET',
      'http.route': '/api/users',
    },
  });
  
  try {
    // 模拟数据库查询（自动追踪）
    await trace.getActiveSpan()?.addEvent('fetching_users_from_db');
    
    const users = await fetchUsers();
    
    span.setAttributes({
      'users.count': users.length,
    });
    
    res.json(users);
  } catch (error) {
    span.recordException(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    span.end();
    
    // 记录指标
    requestCounter.add(1, { route: '/api/users', method: 'GET' });
    requestDuration.record(Date.now() - startTime, { route: '/api/users' });
  }
});

app.listen(3000);
```

### 自定义追踪

```typescript
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('my-service');

async function processOrder(orderId: string) {
  return tracer.startActiveSpan('process_order', async (span) => {
    span.setAttributes({ 'order.id': orderId });
    
    try {
      // 子操作
      await tracer.startActiveSpan('validate_order', async (childSpan) => {
        await validateOrder(orderId);
        childSpan.end();
      });
      
      await tracer.startActiveSpan('charge_payment', async (childSpan) => {
        const result = await chargePayment(orderId);
        childSpan.setAttributes({ 'payment.transaction_id': result.txId });
        childSpan.end();
      });
      
      await tracer.startActiveSpan('send_confirmation', async (childSpan) => {
        await sendConfirmation(orderId);
        childSpan.end();
      });
      
      span.setStatus({ code: SpanStatusCode.OK });
      return { success: true };
      
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

## 实战：部署 Collector

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    command: ["--config=/etc/otel-collector-config.yaml"]
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml
    ports:
      - "4317:4317"   # OTLP gRPC
      - "4318:4318"   # OTLP HTTP
      - "8889:8889"   # Prometheus metrics

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_AUTH_ANONYMOUS_ENABLED=true
    volumes:
      - ./grafana-datasources.yml:/etc/grafana/provisioning/datasources/datasources.yml
    ports:
      - "3000:3000"
    depends_on:
      - prometheus

  tempo:
    image: grafana/tempo:latest
    command: ["-config.file=/etc/tempo.yaml"]
    volumes:
      - ./tempo.yaml:/etc/tempo.yaml
    ports:
      - "3200:3200"   # Tempo HTTP

  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
```

### Collector 配置

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 1s
    send_batch_size: 1024

  memory_limiter:
    check_interval: 1s
    limit_mib: 512

exporters:
  prometheus:
    endpoint: "0.0.0.0:8889"
    namespace: "myapp"

  otlp/tempo:
    endpoint: "tempo:4317"
    tls:
      insecure: true

  loki:
    endpoint: "http://loki:3100/loki/api/v1/push"

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlp/tempo]
    
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [prometheus]
    
    logs:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [loki]
```

### Prometheus 配置

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'otel-collector'
    static_configs:
      - targets: ['otel-collector:8889']
  
  - job_name: 'my-service'
    static_configs:
      - targets: ['host.docker.internal:9464']
```

## 实战：Grafana Dashboard

### 关键指标

```promql
# 请求速率
rate(http_requests_total[5m])

# 错误率
sum(rate(http_requests_total{status=~"5.."}[5m])) 
/ sum(rate(http_requests_total[5m]))

# P99 延迟
histogram_quantile(0.99, 
  rate(http_request_duration_ms_bucket[5m])
)

# Apdex 分数（目标 200ms）
(
  sum(rate(http_request_duration_ms_bucket{le="200"}[5m])) 
  + sum(rate(http_request_duration_ms_bucket{le="800"}[5m])) / 2
) / sum(rate(http_request_duration_ms_count[5m]))

# RED 方法
# Rate: 请求速率
# Errors: 错误率
# Duration: 延迟分布
```

### Dashboard JSON（核心面板）

```json
{
  "panels": [
    {
      "title": "Request Rate",
      "type": "timeseries",
      "targets": [{
        "expr": "sum(rate(http_requests_total[5m])) by (service)"
      }]
    },
    {
      "title": "Error Rate",
      "type": "gauge",
      "targets": [{
        "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m])) * 100"
      }],
      "thresholds": {
        "mode": "absolute",
        "steps": [
          { "color": "green", "value": 0 },
          { "color": "yellow", "value": 1 },
          { "color": "red", "value": 5 }
        ]
      }
    },
    {
      "title": "P99 Latency",
      "type": "timeseries",
      "targets": [{
        "expr": "histogram_quantile(0.99, sum(rate(http_request_duration_ms_bucket[5m])) by (le))"
      }]
    }
  ]
}
```

## 日志集成

### 结构化日志

```typescript
import pino from 'pino';

const logger = pino({
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: process.env.SERVICE_NAME,
    version: '1.0.0',
  },
});

// 关联 Trace ID
function logWithContext(message: string, data: object = {}) {
  const activeSpan = trace.getActiveSpan();
  const traceId = activeSpan?.spanContext().traceId;
  
  logger.info({
    ...data,
    trace_id: traceId,
  }, message);
}

// 使用
app.get('/api/orders/:id', async (req, res) => {
  logWithContext('Processing order request', { order_id: req.params.id });
  // ...
});
```

### 在 Grafana 中关联 Trace

在日志面板中添加链接：

```json
{
  "transformations": [
    {
      "id": "organize",
      "options": {
        "excludeByName": {},
        "indexByName": {},
        "renameByName": {
          "trace_id": "Trace ID"
        }
      }
    }
  ],
  "links": [
    {
      "title": "View Trace",
      "url": "/explore?left={\"queries\":[{\"refId\":\"A\",\"datasource\":{\"type\":\"tempo\"},\"query\":\"${__value.trace_id}\"}]}"
    }
  ]
}
```

## 告警规则

### Prometheus Alertmanager 配置

```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m

route:
  receiver: 'default'
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  routes:
    - match:
        severity: critical
      receiver: 'critical'
    - match:
        severity: warning
      receiver: 'warning'

receivers:
  - name: 'default'
    slack_configs:
      - send_resolved: true
        channel: '#alerts'
        
  - name: 'critical'
    slack_configs:
      - send_resolved: true
        channel: '#critical-alerts'
    pagerduty_configs:
      - service_key: 'xxx'
        
  - name: 'warning'
    slack_configs:
      - send_resolved: true
        channel: '#warnings'
```

### 告警规则

```yaml
# alerts.yml
groups:
  - name: service-health
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m])) 
          / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"
          
      - alert: HighLatency
        expr: |
          histogram_quantile(0.99, rate(http_request_duration_ms_bucket[5m])) > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "P99 latency is {{ $value }}ms"
          
      - alert: ServiceDown
        expr: up{job="my-service"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "{{ $labels.instance }} is unreachable"
```

## 最佳实践

### 1. 命名规范

```typescript
// 指标命名
http_requests_total           // Counter
http_request_duration_ms      // Histogram
http_requests_in_progress     // Gauge

// 标签命名
{ method: "GET", route: "/api/users", status: "200" }

// Span 命名
HTTP GET /api/users
DB query users
Cache hit user:123
```

### 2. 采样策略

```typescript
// 对于高流量服务，不是所有请求都需要追踪
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node';

const sampler = new TraceIdRatioBasedSampler(0.1); // 10% 采样

const sdk = new NodeSDK({
  sampler,
  // ...
});
```

### 3. 敏感信息处理

```typescript
// 不要在 Span 或日志中记录敏感信息
app.get('/api/user/:id', async (req, res) => {
  const user = await getUser(req.params.id);
  
  // ❌ 错误
  span.setAttributes({ 'user.email': user.email });
  
  // ✅ 正确
  span.setAttributes({ 'user.id': user.id });
});
```

## 总结

可观测性不是"装个监控就行"，而是系统设计的一部分：

1. **OpenTelemetry**：统一的标准，一个 SDK 接入所有后端
2. **三大支柱**：Metrics（趋势）、Logs（事件）、Traces（链路）
3. **Grafana**：统一可视化平台
4. **告警**：基于 SLO，而非随机阈值

实施路径：
1. 先接入 Metrics，建立基础告警
2. 再接入 Traces，用于问题排查
3. 最后统一 Logs，实现完整可观测性
