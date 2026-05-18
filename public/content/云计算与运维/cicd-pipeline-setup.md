---
title: CI/CD 流水线搭建：从手动部署到自动化交付
date: 2026-05-16
cover: https://picsum.photos/seed/cicd-pipeline/800/400
desc: 分享搭建 CI/CD 流水线的实际经验——GitHub Actions、自动化测试、构建与部署的完整流程
tags: [CI/CD, DevOps, 部署, 自动化]
---

## 手动部署的痛苦

我经历过那种日子：本地跑测试→打包→FTP 上传→SSH 登录→停服→复制文件→重启。每次上线战战兢兢，生怕哪个步骤漏了或者顺序错了。

有一次，我上线时忘了上传某个静态资源文件，页面样式全崩了。紧急修复花了 20 分钟，影响了线上用户。

这之后我花了三天时间搭了一套 CI/CD 流水线。虽然搭建花了些时间，但之后每次上线只需要做一件事：**合并 PR**。后续所有步骤自动完成。

## GitHub Actions：最适合个人和小团队的选择

市面上 CI/CD 工具很多：Jenkins、GitLab CI、CircleCI、Travis CI。如果你不是公司层面的标准统一，我推荐从 **GitHub Actions** 开始。

原因：
1. 和 GitHub 深度集成，PR/Merge 自动触发
2. 免费额度（公共仓库无限制，私有仓库每月 2000 分钟）
3. 配置简单（YAML 文件，和代码一起版本控制）
4. Actions 市场有现成的轮子

### 一个完整的流水线示例

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # Job 1：检查和测试
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Lint
        run: pnpm lint
        
      - name: Type check
        run: pnpm type-check
        
      - name: Run tests
        run: pnpm test
        
      - name: Build
        run: pnpm build

  # Job 2：部署（只推 main 分支时才执行）
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build
        run: |
          pnpm install
          pnpm build
          
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          command: pages deploy dist --project-name=my-blog
```

这个流水线的设计思路：
1. **PR 触发**：只跑 test，不部署
2. **合并到 main**：先 test 再 deploy
3. **环境隔离**：在干净的 runner 上运行，不污染本地环境

## 流水线设计原则

### 快速反馈

测试应该控制在 10 分钟以内。如果超过 15 分钟，开发者就会开始跳过等待、直接合并——那流水线就失去了意义。

如果测试确实慢，可以：
- **并行化**：不同 job 同时运行，比如 lint 和 test 可以并行
- **分层**：快速检查（lint、type-check）跑在前面，耗时的集成测试跑后面
- **缓存依赖**：node_modules 等不常变的内容用缓存

### 每一步都应该幂等

同一份代码在同一个流水线上跑两次，结果必须一样。常见的非幂等问题：

```yaml
# ❌ 依赖远程资源的操作
- name: Deploy
  run: |
    rm -rf dist
    pnpm build
    # 如果远程 CDN 挂了，这个步骤会失败
    
# ✅ 构建和部署分离
- name: Build
  run: pnpm build

# 部署失败可以重试，不影响构建结果
- name: Deploy
  run: |
    # 多次重试的部署脚本
    for i in 1 2 3; do
      deploy_to_server && break
      sleep 5
    done
```

### 失败时要止损

```yaml
- name: Run tests
  run: pnpm test
  
- name: Notify on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "构建失败：${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

失败时发通知，而不是静默失败。

## 环境变量和密钥管理

这个特别重要——不要在代码中写死密钥：

```yaml
# ❌ 不要这样做
- name: Deploy
  run: |
    deploy --api-key "sk-xxxxxx"
    
# ✅ 使用 GitHub Secrets
- name: Deploy
  run: deploy --api-key ${{ secrets.API_KEY }}
```

在 GitHub 仓库的 Settings → Secrets and variables → Actions 中配置。

不同环境用不同密钥：

```yaml
- name: Deploy to staging
  if: github.ref == 'refs/heads/develop'
  run: deploy ${{ secrets.STAGING_API_KEY }}
  
- name: Deploy to production
  if: github.ref == 'refs/heads/main'
  run: deploy ${{ secrets.PROD_API_KEY }}
```

## 多环境部署策略

### 环境分支策略

```
main ← 生产环境
  └── develop ← 预发布环境
       └── feature/xxx ← 开发功能
```

### 自动部署到不同环境

```yaml
name: Deploy

on:
  push:
    branches: [develop, main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install && pnpm build
      
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: build-${{ github.sha }}
          path: dist/

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-${{ github.sha }}
      - name: Deploy to staging
        run: deploy_to_server --env=staging

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-${{ github.sha }}
      - name: Deploy to production
        run: deploy_to_server --env=production
```

`environment: production` 的作用：
1. 生产环境的 secrets 只在此 job 中可用
2. 可以配置审批人——deploy 到生产需要手动批准
3. 审计日志记录谁批准了部署

## 部署策略的选择

### 蓝绿部署

维护两套环境（蓝和绿）。比如蓝色是当前在线版本，绿色是新版本。

```
先部署到绿色环境 → 验证 → 切换流量到绿色 → 蓝色变成备用
```

好处：回滚只需切换流量，不需要重新部署。

### 滚动更新

逐步替换旧版本实例：

```
先停掉 1 个旧实例 → 启动 1 个新实例 → 验证 → 重复
```

好处：没有蓝绿环境那么高的资源消耗。

### 我自己的选择

个人博客用最简单的策略——直接替换。因为停机几分钟对我来说影响不大。

但对于多少面向用户的 SaaS 产品，至少要做到滚动更新或蓝绿部署，确保零停机。

## 写在最后

CI/CD 流水线是一种投资——前期花时间搭建，后期持续受益。

从最简单的配置开始：push → build → deploy。不要一步到位追求完美，因为需求会变，流程也会变。跑起来之后，再逐步加 pre-commit hook、代码检查、自动测试、多环境部署。

关键是：**从手动到自动的那一步，越早迈出去越好**。
