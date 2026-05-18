---
title: GitHub Actions CI/CD 完全指南：从入门到生产级流水线
date: 2026-05-17
cover: https://picsum.photos/seed/github-actions-cicd/800/400
desc: 系统讲解 GitHub Actions 的使用，从基础 workflow 到复杂的多阶段部署
tags: [CI/CD, GitHub Actions, DevOps, 自动化]
---

## 核心概念

```yaml
# .github/workflows/ci.yml

name: CI                    # Workflow 名称
on: [push, pull_request]    # 触发器

jobs:                       # 任务（可并行或串行）
  test:                     # Job ID
    runs-on: ubuntu-latest  # 运行环境
    steps:                  # 步骤（顺序执行）
      - uses: actions/checkout@v4    # 使用 Action
      - run: npm install             # 运行命令
      - run: npm test
```

- **Workflow**：一个 YAML 文件，定义完整的自动化流程
- **Job**：Workflow 中的任务，可以在不同机器上并行运行
- **Step**：Job 中的步骤，顺序执行
- **Action**：可复用的步骤（`uses`）

## 触发器

```yaml
on:
  # 推送时触发
  push:
    branches: [main, develop]
    tags: ['v*']
  
  # PR 时触发
  pull_request:
    branches: [main]
  
  # 定时触发（cron 表达式，UTC 时间）
  schedule:
    - cron: '0 2 * * 1'  # 每周一凌晨 2 点
  
  # 手动触发
  workflow_dispatch:
    inputs:
      environment:
        description: '部署环境'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
  
  # 其他 workflow 完成后触发
  workflow_run:
    workflows: ["Build"]
    types: [completed]
```

## 缓存依赖

```yaml
- name: Cache node_modules
  uses: actions/cache@v4
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

- name: Cache pip
  uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
```

**效果**：首次安装 2 分钟，后续从缓存恢复只需 10 秒。

## 矩阵构建

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20, 22]
        # 排除不需要的组合
        exclude:
          - os: windows-latest
            node-version: 18
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm test
```

这会创建 3 × 3 - 1 = 8 个并行任务。

## 环境变量和 Secrets

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # 需要环境审批
    env:
      NODE_ENV: production
      API_URL: https://api.example.com
    
    steps:
      - run: echo "Deploying to $API_URL"
      
      # 使用 Secrets（在 Settings → Secrets 中配置）
      - run: |
          echo "${{ secrets.DEPLOY_KEY }}" > deploy_key
          chmod 600 deploy_key
          ssh -i deploy_key user@server "deploy.sh"
```

**安全规则**：
- Secrets 不会打印在日志中
- PR 从 fork 来的 workflow 无法访问 Secrets
- 使用 `environment` 可以设置审批流程

## Artifact 和 Report

```yaml
- name: Upload test results
  if: always()  # 即使测试失败也上传
  uses: actions/upload-artifact@v4
  with:
    name: test-results-${{ matrix.node-version }}
    path: |
      coverage/
      test-results.xml
    retention-days: 30

- name: Upload build output
  uses: actions/upload-artifact@v4
  with:
    name: build-output
    path: dist/
```

## 多阶段部署

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test
      - run: npm run build
    
    outputs:
      version: ${{ steps.version.outputs.version }}
    
    steps:
      - id: version
        run: echo "version=$(node -p "require('./package.json').version")" >> $GITHUB_OUTPUT

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - run: ./scripts/deploy.sh staging

  deploy-production:
    needs: [test, deploy-staging]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      # 在 Settings → Environments 中配置审批人
    steps:
      - uses: actions/checkout@v4
      - run: ./scripts/deploy.sh production
```

**流程**：
```
push to develop → test → deploy-staging
push to main    → test → deploy-staging → (审批) → deploy-production
```

## 条件执行

```yaml
steps:
  # 只在 main 分支运行
  - if: github.ref == 'refs/heads/main'
    run: echo "Deploying to production"
  
  # 只在 PR 时运行
  - if: github.event_name == 'pull_request'
    run: echo "Running PR checks"
  
  # 上一步成功时运行
  - if: success()
    run: echo "Tests passed"
  
  # 上一步失败时运行
  - if: failure()
    run: echo "Tests failed, sending notification"
  
  # 总是运行（无论上一步结果）
  - if: always()
    run: echo "Cleaning up"
```

## 自定义 Action

### JavaScript Action

```javascript
// action.js
const core = require('@actions/core')

async function run() {
  const name = core.getInput('name')
  core.setOutput('greeting', `Hello, ${name}!`)
  core.info(`Greeting: Hello, ${name}!`)
}

run().catch(err => core.setFailed(err.message))
```

```yaml
# action.yml
name: 'Greeting Action'
description: 'Say hello'
inputs:
  name:
    description: 'Name to greet'
    required: true
    default: 'World'
outputs:
  greeting:
    description: 'The greeting message'
runs:
  using: 'node20'
  main: 'action.js'
```

### Docker Action

```dockerfile
# Dockerfile
FROM alpine:3.19
RUN apk add --no-cache curl jq
COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
```

```yaml
# action.yml
runs:
  using: 'docker'
  image: 'Dockerfile'
```

## 实际案例：Vue 项目完整 CI/CD

```yaml
name: Vue CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          projectName: my-blog-staging
          directory: dist/

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          projectName: my-blog
          directory: dist/
```

## 总结

GitHub Actions 最佳实践：

1. **固定 Action 版本**——用 commit hash 而不是 tag（安全）
2. **缓存依赖**——大幅加速 CI
3. **矩阵测试**——并行跑多版本/多平台
4. **环境审批**——生产部署需要人工确认
5. **Artifact 传递**——build 一次，部署多次
6. **条件执行**——不同分支走不同流程
