# PJ Blog - 现代化个人博客系统

<div align="center" style="display: flex;gap: 2px; justify-content: center; align-items: center;">

  <img src="https://img.shields.io/badge/Vue-3.x-brightgreen" alt="Vue Version">
  <img src="https://img.shields.io/badge/TypeScript-Support-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
   <a target="_blank" style="display: grid" href="https://zread.ai/LXC-9349/pjfun-blog">
   <img src="https://img.shields.io/badge/Ask_Zread-_.svg?style=flat&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff" alt="License">
   </a>  
</div>
<div align="center">
    <p>
        <a href="https://github.com/LXC-9349/pjfun-blog/blob/main/README.md">简体中文</a> | <a href="https://github.com/LXC-9349/pjfun-blog/blob/main/README.en.md">English</a> | <a href="https://pjfun.top">主页</a>
    </p>
</div>

[![zread](https://img.shields.io/badge/Ask_Zread-_.svg?style=for-the-badge&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/LXC-9349/pjfun-blog)


## 🌟 简介

PJ Blog 是一个零后端、纯静态、顶级动效、全球秒开的现代化个人博客系统。它采用最新的前端技术栈构建，具有响应式设计、暗黑模式、平滑滚动、动画效果等特性，让你轻松拥有一个高性能的技术博客。

只需在 `public/content` 目录下放置 `.md`、`.html`、`.txt`、PDF、Word 或 Excel 文件 → 运行 `pnpm build` → 部署到任何静态网站托管服务即可拥有属于自己的顶级技术站。

## 🚀 技术栈

- [Vue 3](https://v3.vuejs.org/) - 渐进式 JavaScript 框架
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集，添加了静态类型
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [UnoCSS](https://unocss.dev/) - 即时按需原子 CSS 引擎
- [Marked](https://marked.js.org/) - 高性能 Markdown 解析器
- [Highlight.js](https://highlightjs.org/) - 代码高亮工具
- [Vue Router](https://router.vuejs.org/) - Vue.js 官方路由管理器
- [DOMPurify](https://github.com/cure53/DOMPurify) - DOM XSS 清理工具
- [Giscus](https://giscus.app/zh-CN) - 基于 GitHub Discussions 的评论系统

## ✨ 特性

- 📝 **Markdown 支持** - 使用 Markdown 编写文章，支持 Frontmatter
- 🌗 **暗黑模式** - 自动适配系统主题或手动切换
- 🌍 **国际化** - 支持中英文切换
- 🔍 **全文搜索** - 快速搜索文章标题、摘要和标签（支持 Ctrl+K 快捷键）
- 🖼️ **封面图片** - 为每篇文章设置封面图
- 🏷️ **标签系统** - 为文章添加标签，方便分类和筛选
- 💬 **评论系统** - 集成 Giscus 评论系统
- 📱 **响应式设计** - 适配各种设备屏幕尺寸
- ⚡ **高性能** - 静态站点，加载速度快
- 🎨 **精美 UI** - 使用 UnoCSS 构建现代界面
- 📚 **目录结构** - 自动生成文章目录树
- 📈 **阅读时长** - 自动计算文章阅读时间
- 📤 **代码复制** - 一键复制代码块
- 🔝 **回到顶部** - 滚动时显示回到顶部按钮
- 📖 **置顶文章** - 支持文章置顶功能
- 📋 **文章目录** - 自动生成文章内目录导航
- 🖼️ **图片灯箱** - 点击文章图片可放大预览
- 📏 **字体大小调节** - 可在三种字体大小间切换
- ⚙️ **SEO优化** - 支持结构化数据、Open Graph和Twitter Cards
- 📡 **RSS支持** - 自动生成RSS、Atom和JSON Feed
- 📱 **PWA支持** - 可安装为桌面应用
- 🌐 **多格式支持** - 支持 Markdown、HTML、TXT、PDF、Word 和 Excel 文档

## ⚙️ 环境变量配置

PJ Blog 支持通过环境变量自定义站点配置，无需修改代码即可个性化您的博客。

### 站点基本信息

在 `.env` 文件中配置以下变量：

```env
# 站点图标（显示在浏览器标签页）
VITE_SITE_ICON=Pj

# 站点标题
VITE_SITE_TITLE=我的博客

# 站点描述（用于 SEO）
VITE_SITE_DESCRIPTION=一个现代化的个人博客和技术分享平台

# 作者名称
VITE_SITE_AUTHOR=张三

# 站点关键词（用逗号分隔，用于 SEO）
VITE_SITE_KEYWORDS=博客,技术分享,前端开发,Vue,TypeScript

# 联系邮箱
VITE_SITE_EMAIL=your-email@example.com
```

### 社交链接

配置社交媒体链接，显示在页脚等位置：

```env
# GitHub 仓库地址
VITE_SOCIAL_GITHUB=https://github.com/yourusername/your-repo

# Telegram 频道
VITE_SOCIAL_TELEGRAM=https://t.me/your-channel
```

### 页脚链接

```env
# 页脚 GitHub 链接
VITE_FOOT_GITHUB=https://github.com/yourusername/your-repo
```

### Giscus 评论系统配置

通过 [giscus.app](https://giscus.app/zh-CN) 获取配置信息后，在 `.env` 文件中设置：

```env
# 是否启用评论系统 (true/false)
VITE_GISCUS_ENABLED=true

# GitHub 仓库 (owner/repo)
VITE_GISCUS_REPO=yourusername/your-repo

# 仓库 ID
VITE_GISCUS_REPO_ID=R_kgDOxxxxxxxxx

# Discussion 分类
VITE_GISCUS_CATEGORY=Announcements

# 分类 ID
VITE_GISCUS_CATEGORY_ID=DIC_kwDOxxxxxxxxx

# 映射方式 (pathname, url, title, og:title, specific)
VITE_GISCUS_MAPPING=pathname

# 严格匹配 (true/false)
VITE_GISCUS_STRICT=false

# 启用反应 (true/false)
VITE_GISCUS_REACTIONS=true

# 发送元数据 (true/false)
VITE_GISCUS_METADATA=false

# 输入框位置 (top, bottom)
VITE_GISCUS_POSITION=top

# 语言 (zh-CN, en, 等)
VITE_GISCUS_LANG=zh-CN
```

### 热门标签配置

自定义首页显示的热门标签列表（逗号分隔）：

```env
VITE_HOT_TAGS=Vue,React,前端开发,TypeScript,JavaScript,Node.js
```

### 配置优先级

环境变量的优先级高于代码中的默认值：

1. **系统环境变量**（最高优先级）
2. **.env 文件**
3. **代码默认值**（最低优先级）

### 使用示例

**场景一：快速部署自己的博客**

只需修改 `.env` 文件，无需改动任何代码：

```env
VITE_SITE_TITLE=我的技术博客
VITE_SITE_AUTHOR=李四
VITE_SOCIAL_GITHUB=https://github.com/lisi/my-blog
```

**场景二：不同环境使用不同配置**

创建多个环境文件：

- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置
- `.env.staging` - 测试环境配置

**场景三：CI/CD 中动态配置**

在 GitHub Actions 或其他 CI/CD 平台中设置环境变量：

```yaml
# .github/workflows/deploy.yml
env:
  VITE_SITE_TITLE: ${{ secrets.SITE_TITLE }}
  VITE_SITE_AUTHOR: ${{ secrets.SITE_AUTHOR }}
```

### 完整配置示例

查看 `.env.example` 文件获取所有可配置的环境变量及其默认值。

## 🔐 密码保护功能

博客支持密码保护功能，可以通过环境变量启用。

### 启用密码保护

在各个pages中配置环境变量或者在.env中配置：

```env
# 方式一（推荐）：设置明文密码，构建时会自动生成SHA256哈希
VITE_BLOG_PASSWORD=your_password_here

# 方式二：直接设置预生成的SHA256哈希值
VITE_BLOG_PASSWORD_HASH=your_sha256_password_hash_here
```

**⚠️ 优先级说明：**
- **`VITE_BLOG_PASSWORD` 优先级高于 `VITE_BLOG_PASSWORD_HASH`**
- 如果同时设置了两个变量，系统会优先使用 `VITE_BLOG_PASSWORD`，并忽略 `VITE_BLOG_PASSWORD_HASH`
- 建议只使用其中一种方式，避免混淆

### 生成密码哈希

#### 方法一：自动哈希（推荐）
只需在 `.env` 文件中设置 `VITE_BLOG_PASSWORD` 为明文密码，构建时会自动生成 SHA256 哈希值。

```env
VITE_BLOG_PASSWORD=your_password_here
```

#### 方法二：手动生成哈希
如果需要手动生成哈希值，可以使用以下方法：

##### 使用项目脚本生成SHA256密码哈希
```bash
node scripts/generate-password-hash.js your_password_here
```
这将输出密码的 SHA256 哈希值，您需要将该值添加到 `.env` 文件中的 `VITE_BLOG_PASSWORD_HASH` 变量。

##### 使用在线工具生成SHA256密码哈希
- [https://www.convertstring.com/zh_CN/Hash/SHA256](https://www.convertstring.com/zh_CN/Hash/SHA256)

**步骤：**
1. 访问上述网站
2. 在输入框中输入您的密码
3. 点击"Hash"按钮生成SHA256哈希值
4. 复制生成的哈希值
5. 将哈希值配置到环境变量中：

```env
VITE_BLOG_PASSWORD_HASH=your_generated_sha256_hash_here
```

#### 安全提醒
⚠️ **重要**: 使用在线工具存在安全风险，因为您的密码会通过网络传输。建议仅在开发测试环境中使用，在生产环境中应使用本地脚本生成或直接使用 `VITE_BLOG_PASSWORD` 让系统自动生成哈希。

### 使用密码保护

启用密码保护后，访问博客时会跳转到密码输入页面。输入正确的密码后即可访问博客内容。

### 安全注意事项

- 我们现在使用 SHA256 哈希算法来存储密码，比以前的明文存储更加安全
- 生产环境中请使用强密码
- 密码保护仅适用于简单场景，对于高安全性需求建议使用专业解决方案

## 📁 项目结构

```
pjfun-blog/
├── public/
│   └── content/           # 文章目录 (支持 Markdown, HTML, TXT, PDF, Word, Excel)
│       ├── 2025/
│       ├── 学习/
│       ├── 教程/
│       └── 笔记/
├── src/
│   ├── assets/            # 静态资源
│   │   └── icons/         # 本地 SVG 图标
│   ├── components/        # Vue 组件
│   │   ├── ui/            # UI 组件
│   │   ├── Footer.vue     # 页脚组件
│   │   ├── GiscusComment.vue # 评论组件
│   │   ├── NavTree.vue    # 导航树组件
│   │   └── PasswordProtection.vue # 密码保护组件
│   ├── constants/         # 常量配置
│   ├── pages/             # 页面组件
│   │   ├── archive.vue    # 归档页面
│   │   ├── articleDetail.vue # 文章详情页
│   │   ├── favorites.vue  # 收藏页面
│   │   └── index.vue      # 首页
│   ├── plugins/           # 插件
│   ├── styles/            # 全局样式
│   ├── utils/             # 工具函数
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── package/               # 构建相关工具
│   ├── vite-plugin-rss.ts      # RSS 生成插件
│   └── vite-plugin-cdn.ts      # CDN 注入插件
├── index.html             # HTML 模板
├── uno.config.ts          # UnoCSS 配置
├── vite.config.ts         # Vite 配置
├── vite-plugin-gen-nav.ts # 导航生成插件
└── vite-plugin-auto-password-hash.ts # 密码哈希插件
```

## 🚀 快速开始

### 环境要求

- Node.js >= 20.18.1
- pnpm >= 7

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

默认会在 http://localhost:1022 启动开发服务器。

### 构建生产版本

```bash
pnpm build
```

构建后的文件会输出到 `dist` 目录。

### 预览生产版本

```bash
pnpm preview
```

## 🐳 Docker 部署

### 使用 Docker 运行

如果您更喜欢使用 Docker 来部署，可以使用以下命令：

```bash
# 构建并运行 Docker 容器
docker build -t pjfun-blog .
docker run -d --restart=always --name blog -p 1022:80 pjfun-blog
```

### 使用 Docker Compose 运行

项目还提供了 docker-compose.yml 配置文件，可以使用以下命令运行：

```bash
# 构建并启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 停止服务
docker-compose down
```

### 自定义配置

您可以通过环境变量来配置应用，创建 `.env` 文件来配置密码保护等功能：

```bash
# 复制 .env.example 为 .env 并根据需要修改配置
VITE_BLOG_PASSWORD_HASH=your_sha256_password_hash_here
VITE_BASE=/
```

在 Docker 中使用自定义环境变量：

```bash
# 使用环境变量文件
docker run -d --restart=always --name blog -p 1022:80 --env-file .env pjfun-blog
```

或者在 docker-compose 中使用环境变量：

```bash
# 编辑 .env 文件以配置您的设置
vim .env  # 或使用您喜欢的编辑器

# 使用 docker-compose 启动服务
docker-compose up -d
```

## 📝 写作指南

### 创建新文章

1. 在 `public/content/` 目录下创建 Markdown、HTML、TXT、PDF、Word 或 Excel 文件
2. 使用以下格式编写文章元数据（仅 Markdown 支持元数据，其他格式使用 `.desc.json` 或 `.desc.yaml` 配置文件）：

> 对于非 Markdown 文件（如 PDF、Word、Excel），可以创建同名的 `.desc.json` 或 `.desc.yaml` 配置文件来设置元数据。
>
> 例如：对于 `sample.pdf` 文件，可以创建 `sample.pdf.desc.json` 配置文件：
>
> ```json
> {
>   "title": "示例PDF文档",
>   "date": "2025-12-05",
>   "cover": "/image/sample-pdf-cover.jpg",
>   "desc": "这是一个示例PDF文档",
>   "tags": ["PDF", "文档", "示例"],
>   "sticky": false
> }
> ```

```
---
title: 文章标题
date: 2025-12-05
cover: /image/pbsh.jpg
desc: 文章摘要
tags: [Vite, Vue3, UnoCSS, Marked]
sticky: true # 可选，设置为置顶文章
---

# 标题

文章内容...

```

### 目录结构

推荐按照以下方式组织文章：

```
public/content/
├── 2025/                 # 按年份分类
│   ├── hello.md
│   ├── excel/
│   │   └── 示例Excel文件.xlsx
│   ├── pdf/
│   │   └── 示例PDF文件.pdf
│   └── word/
│       └── 示例Word文件.docx
├── 学习/                 # 按主题分类
│   ├── Vite构建工具/
│   │   └── advanced-configurations.md
│   └── Vue框架/
│       └── introduction.md
├── 教程/
│   └── getting-started.md
└── 笔记/
    └── 个人思考/
        └── on-writing.md
```

## 📚 博客文档数据管理

PJ Blog 采用文件系统作为内容管理系统，所有博客文章和文档都存储在 `public/content` 目录下。系统支持多种文件格式，并提供灵活的元数据配置方式。

### 支持的文件格式

| 格式 | 扩展名 | 元数据配置方式 | 说明 |
|------|--------|----------------|------|
| Markdown | `.md` | Frontmatter（文件头部） | 推荐使用，支持完整的元数据配置 |
| HTML | `.html` | 同名的 `.desc.json` 或 `.desc.yaml` | 适合富文本内容 |
| 纯文本 | `.txt` | 同名的 `.desc.json` 或 `.desc.yaml` | 简单文本内容 |
| PDF | `.pdf` | 同名的 `.desc.json` 或 `.desc.yaml` | 内置PDF阅读器支持 |
| Word | `.docx` | 同名的 `.desc.json` 或 `.desc.yaml` | 自动转换为HTML显示 |
| Excel | `.xlsx` | 同名的 `.desc.json` 或 `.desc.yaml` | 内置Excel查看器支持 |

### Markdown 文件元数据配置

Markdown 文件使用 YAML Frontmatter 格式在文件开头定义元数据：

```markdown
---
title: 文章标题
date: 2025-12-05
cover: /img/d1.webp
desc: 文章摘要描述
tags: [Vite, Vue3, UnoCSS]
sticky: true
---

# 文章内容从这里开始

你的 Markdown 内容...
```

#### 元数据字段说明

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `title` | String | ✅ | 文章标题 | `"Hello World"` |
| `date` | Date/String | ✅ | 发布日期 | `2025-12-05` 或 `"2025-12-05T10:30:00Z"` |
| `cover` | String | ❌ | 封面图片路径 | `/img/cover.jpg` |
| `desc` | String | ❌ | 文章摘要 | `"这是一篇关于...的文章"` |
| `tags` | Array | ❌ | 标签列表 | `["Vue", "前端"]` |
| `sticky` | Boolean | ❌ | 是否置顶 | `true` 或 `false` |

### 非 Markdown 文件元数据配置

对于非 Markdown 文件（PDF、Word、Excel、HTML、TXT），需要创建同名的配置文件来设置元数据。

#### JSON 格式配置文件

创建与文档文件同名的 `.desc.json` 文件：

**文件结构示例：**
```
public/content/2025/pdf/
├── 海奥华预言.pdf
└── 海奥华预言.pdf.desc.json
```

**JSON 配置文件内容：**
```json
{
  "title": "海奥华预言",
  "date": "2025-12-19",
  "cover": "/img/d5.webp",
  "desc": "这是一本关于外星文明的书籍",
  "tags": ["PDF", "阅读", "科幻"],
  "sticky": false
}
```

#### YAML 格式配置文件

也可以使用 YAML 格式，创建 `.desc.yaml` 文件：

```yaml
title: 海奥华预言
date: 2025-12-19
cover: /img/d5.webp
desc: 这是一本关于外星文明的书籍
tags:
  - PDF
  - 阅读
  - 科幻
sticky: false
```

### 文件夹组织结构

#### 1. 按时间分类

适合日记、日志类内容：

```
public/content/
├── 2024/
│   ├── 01-january.md
│   ├── 02-february.md
│   └── 12-december.md
├── 2025/
│   ├── spring.md
│   └── winter.md
```

#### 2. 按主题分类

适合技术博客、知识库：

```
public/content/
├── 前端开发/
│   ├── Vue/
│   │   ├── vue3-guide.md
│   │   └── composition-api.md
│   ├── React/
│   │   └── hooks-tutorial.md
│   └── TypeScript/
│       └── advanced-types.md
├── 后端开发/
│   ├── Node.js/
│   └── Python/
└── DevOps/
    ├── Docker/
    └── Kubernetes/
```

#### 3. 混合分类

结合时间和主题：

```
public/content/
├── 2025/
│   ├── 学习/
│   │   ├── vite.md
│   │   └── vue3.md
│   └── 项目/
│       └── blog-project.md
├── 教程/
│   └── getting-started.md
└── 笔记/
    └── personal-thoughts.md
```

### 图片资源管理

#### 1. 全局图片资源

将图片放在 `public/img` 目录下，通过绝对路径引用：

```markdown
cover: /img/d1.webp
```

#### 2. 文章专属图片

为特定文章创建专属图片文件夹：

```
public/content/2025/
├── my-article.md
└── my-article-images/
    ├── cover.jpg
    ├── screenshot1.png
    └── screenshot2.png
```

在 Markdown 中引用：

```markdown
---
cover: /content/2025/my-article-images/cover.jpg
---

![截图1](/content/2025/my-article-images/screenshot1.png)
```

### 文档管理工作流

#### 新增文章

1. **确定分类**：选择合适的文件夹位置
2. **创建文件**：新建 `.md` 或其他格式文件
3. **编写元数据**：填写标题、日期、标签等信息
4. **编写内容**：撰写文章正文
5. **添加封面**（可选）：上传封面图片并配置路径
6. **本地预览**：运行 `pnpm dev` 查看效果
7. **构建发布**：运行 `pnpm build` 并部署

#### 更新文章

1. 直接修改对应的文件内容
2. 如需修改元数据，编辑 Frontmatter 或 `.desc.json` 文件
3. 重新构建：`pnpm build`

#### 删除文章

1. 删除对应的文档文件
2. 如果存在配套的 `.desc.json` 或图片文件夹，一并删除
3. 重新构建：`pnpm build`

#### 批量导入

可以将现有的文档批量复制到 `public/content` 目录的相应位置：

```bash
# 示例：批量导入 PDF 文件
cp ~/Downloads/*.pdf public/content/2025/pdf/

# 为每个 PDF 创建元数据配置文件
# 可以编写脚本自动生成 .desc.json 文件
```

### 最佳实践

#### 1. 命名规范

- **文件名**：使用有意义的名称，避免中文特殊字符
- **文件夹**：使用简短清晰的分类名称
- **图片**：使用描述性名称，如 `vue3-composition-api.png`

#### 2. 日期格式

推荐使用 ISO 8601 格式：

```yaml
date: 2025-12-05              # 简洁格式
date: 2025-12-05T10:30:00Z    # 完整时间戳
```

#### 3. 标签管理

- 保持标签数量适中（3-5个为宜）
- 使用统一的标签命名
- 避免过于宽泛或过于具体的标签

```yaml
tags: [Vue, 前端开发, 教程]     # ✅ 推荐
tags: [a, b, c, d, e, f, g]   # ❌ 过多
tags: [Vue3CompositionAPIWithScriptSetupSyntaxSugar]  # ❌ 过长
```

#### 4. 封面图片优化

- 推荐尺寸：1200x630 像素（16:9 比例）
- 格式：WebP（首选）、PNG、JPG
- 大小：控制在 500KB 以内
- 使用在线工具压缩图片

#### 5. 内容组织

- 定期整理和归档旧文章
- 使用文件夹层级不超过 3 层
- 保持目录结构清晰一致

### 高级功能

#### 1. 置顶文章

设置 `sticky: true` 将文章置顶显示：

```yaml
---
title: 重要公告
sticky: true
---
```

#### 2. 草稿管理

可以通过以下方式管理草稿：

**方法一**：使用子文件夹
```
public/content/
├── drafts/          # 草稿文件夹
│   └── work-in-progress.md
└── published/       # 已发布文章
    └── hello.md
```

**方法二**：文件名前缀
```
public/content/
├── DRAFT-hello.md   # 草稿
└── hello.md         # 正式发布
```

#### 3. 多语言支持

为不同语言创建独立的文件夹：

```
public/content/
├── zh/              # 中文内容
│   └── hello.md
└── en/              # 英文内容
    └── hello.md
```

### 故障排查

#### 文章不显示

1. 检查文件是否在 `public/content` 目录下
2. 确认文件格式是否受支持
3. 验证元数据格式是否正确
4. 重新运行 `pnpm dev` 或 `pnpm build`

#### 元数据不生效

1. 检查 JSON/YAML 格式是否正确
2. 确认配置文件名与文档文件名完全匹配
3. 查看控制台是否有解析错误

#### 图片无法加载

1. 确认图片路径是否正确
2. 检查图片是否存在于 `public` 目录下
3. 验证路径是否以 `/` 开头（绝对路径）

## ☁️ 在线数据管理

虽然 PJ Blog 是一个纯静态博客系统，但您可以通过多种方式实现在线内容管理和同步。

### 方案一：在线 IDE 直接编辑（⭐ 最推荐）

**这是最简单、最高效的在线管理方式！** 项目内置了「一键打开在线编辑器」功能，无需任何配置即可开始写作。

#### 使用方法

1. **访问您的博客网站**
2. **点击页脚或导航栏中的「在线编辑」按钮**（如果已启用）
3. **选择您喜欢的在线编辑器**：
   - **StackBlitz** - 快速启动，支持实时预览
   - **GitHub.dev** - GitHub 官方的 VSCode Online
   - **VSCode.dev** - 完整的 VSCode 体验
   - **Bolt.new** - AI 辅助开发平台

4. **开始编辑**：直接在浏览器中修改 `public/content` 目录下的文件
5. **提交更改**：使用 Git 面板提交并推送更改
6. **自动部署**：触发 CI/CD 自动构建和部署

#### 优势

- ✅ **零配置**：无需安装任何软件，打开浏览器即可使用
- ✅ **实时预览**：部分平台支持热更新预览
- ✅ **完整 Git 集成**：内置版本控制和协作功能
- ✅ **跨设备**：在任何设备上都能访问和编辑
- ✅ **免费使用**：所有推荐的在线 IDE 都有免费套餐

#### 支持的在线编辑器对比

| 编辑器 | 特点 | 适用场景 | 网址格式 |
|--------|------|----------|----------|
| StackBlitz | 启动快，支持 Node.js | 快速编辑和预览 | `https://stackblitz.com/github/{owner}/{repo}` |
| GitHub.dev | GitHub 官方集成 | GitHub 用户首选 | `https://github.dev/{owner}/{repo}` |
| VSCode.dev | 完整 VSCode 体验 | 需要高级功能 | `https://vscode.dev/github/{owner}/{repo}` |
| Bolt.new | AI 辅助编程 | AI 辅助创作 | `https://bolt.new/github/{owner}/{repo}` |

#### 工作流程示例

```
点击「在线编辑」 → 选择编辑器 → 浏览器打开 → 编辑文章 → Git 提交 → 自动部署
```

**整个过程只需几分钟，完全在浏览器中完成！**

#### 自定义启用在线编辑功能

如果您的博客还没有在线编辑按钮，可以手动添加：

**在页面中添加链接：**

```html
<!-- 替换 {owner} 和 {repo} 为您的 GitHub 用户名和仓库名 -->
<a href="https://github.dev/{owner}/{repo}" target="_blank">
  📝 在线编辑
</a>
```

**或使用项目内置的工具函数：**

```javascript
import { toDev } from '@/utils/tool'

// 调用此函数会显示编辑器选择对话框
toDev()
```

### 方案二：Git + GitHub/Gitee（传统方式）

这是经典的内容管理方案，适合喜欢本地编辑的用户。

#### 工作流程

```
本地编辑 → Git 提交 → 推送到远程仓库 → CI/CD 自动构建部署
```

#### 配置步骤

**1. 初始化 Git 仓库**

```bash
cd pjfun-blog
git init
git add .
git commit -m "Initial commit"
```

**2. 关联远程仓库**

```bash
# GitHub
git remote add origin https://github.com/yourusername/pjfun-blog.git

# Gitee（国内推荐）
git remote add origin https://gitee.com/yourusername/pjfun-blog.git
```

**3. 配置自动化部署**

项目已包含 GitHub Actions 配置文件 `.github/workflows/deploy.yml`，推送代码后会自动构建并部署到 GitHub Pages。

#### 优势

- ✅ 完全免费
- ✅ 版本控制，可追溯历史
- ✅ 支持多人协作
- ✅ 自动化部署
- ✅ 数据安全可靠

#### 示例工作流

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 创建新文章
echo "---
title: 我的新文章
date: 2025-05-15
tags: [Vue, 教程]
---

# 文章内容
" > public/content/2025/new-article.md

# 3. 提交更改
git add .
git commit -m "Add new article: 我的新文章"

# 4. 推送到远程（触发自动部署）
git push origin main
```

### 方案三：云存储同步

使用云盘服务同步 `public/content` 目录，实现多设备编辑。

#### 支持的云服务

| 服务 | 特点 | 适用场景 |
|------|------|----------|
| Dropbox | 稳定可靠，跨平台 | 国际用户 |
| OneDrive | 与 Windows 集成好 | Windows 用户 |
| iCloud Drive | Apple 生态最佳 | Mac/iOS 用户 |
| 坚果云 | 国内速度快 | 国内用户 |
| 百度网盘 | 容量大 | 大文件存储 |

#### 配置方法

**1. 将 content 目录移到云盘**

```bash
# 假设云盘路径为 ~/CloudStorage/Blog
mkdir -p ~/CloudStorage/Blog
mv public/content ~/CloudStorage/Blog/content
ln -s ~/CloudStorage/Blog/content public/content
```

**2. 在其他设备上同步**

安装对应的云盘客户端，登录同一账号即可自动同步。

#### 注意事项

- ⚠️ 确保云盘不会同步 `.git` 文件夹
- ⚠️ 避免同时在多个设备编辑同一文件
- ⚠️ 定期备份重要数据

### 方案四：Headless CMS 集成

通过 Headless CMS 管理内容，然后导出为静态文件。

#### 推荐的 CMS 平台

| CMS | 类型 | 价格 | 特点 |
|-----|------|------|------|
| Strapi | 自托管 | 免费 | 功能强大，可定制 |
| Contentful | SaaS | 有免费层 | 成熟稳定 |
| Sanity | SaaS | 有免费层 | 实时协作 |
| Directus | 自托管 | 免费 | 数据库优先 |
| Netlify CMS | 静态 | 免费 | 与 Git 集成 |

#### Netlify CMS 配置示例

**1. 创建配置文件**

在 `public/admin/config.yml` 创建：

```yaml
backend:
  name: git-gateway
  branch: main

media_folder: "public/img"
public_folder: "/img"

collections:
  - name: "blog"
    label: "Blog Posts"
    folder: "public/content"
    create: true
    slug: "{{year}}/{{slug}}"
    fields:
      - {label: "Title", name: "title", widget: "string"}
      - {label: "Date", name: "date", widget: "datetime"}
      - {label: "Cover Image", name: "cover", widget: "image", required: false}
      - {label: "Description", name: "desc", widget: "text", required: false}
      - {label: "Tags", name: "tags", widget: "list", required: false}
      - {label: "Sticky", name: "sticky", widget: "boolean", default: false}
      - {label: "Body", name: "body", widget: "markdown"}
```

**2. 创建管理页面**

在 `public/admin/index.html` 创建：

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Content Manager</title>
</head>
<body>
  <!-- Include the script that builds the page and powers Netlify CMS -->
  <script src="https://unpkg.com/netlify-cms@^2.0.0/dist/netlify-cms.js"></script>
</body>
</html>
```

**3. 访问管理后台**

部署后访问 `https://yourdomain.com/admin/` 即可使用可视化的内容编辑器。

#### 优势

- ✅ 可视化编辑界面
- ✅ 非技术人员也可使用
- ✅ 支持富文本编辑
- ✅ 媒体资源管理

### 方案五：API 驱动的动态内容

对于需要动态内容的场景，可以结合 API 服务。

#### 架构示意

```
静态博客（PJ Blog） + API 服务 = 混合架构
```

#### 实现方式

**1. 使用 Serverless Functions**

```javascript
// vercel/functions/get-posts.js
export default async function handler(req, res) {
  // 从数据库或 CMS 获取最新文章
  const posts = await fetchPostsFromAPI();
  res.json(posts);
}
```

**2. 前端调用 API**

```javascript
// 在 Vue 组件中
import { ref, onMounted } from 'vue'

const dynamicPosts = ref([])

onMounted(async () => {
  const response = await fetch('/api/get-posts')
  dynamicPosts.value = await response.json()
})
```

#### 适用场景

- 评论系统（已集成 Giscus）
- 实时统计数据
- 用户交互功能
- 动态推荐内容

### 方案六：Webhook 自动化

通过 Webhook 实现内容更新后自动触发构建。

#### 配置示例（GitHub）

**1. 创建 Webhook**

在 GitHub 仓库设置中：
- Settings → Webhooks → Add webhook
- Payload URL: `https://api.vercel.com/v1/integrations/deploy/xxx`
- Content type: `application/json`
- Events: `Push events`

**2. 接收 Webhook 的服务**

可以使用以下平台：
- Vercel（自动集成）
- Netlify（自动集成）
- Cloudflare Workers（自定义）
- 自建服务器

### 多设备同步最佳实践

#### 1. 使用 Git 作为单一数据源

```bash
# 设备 A：编辑并提交
git add . && git commit -m "Update articles" && git push

# 设备 B：拉取最新内容
git pull
```

#### 2. 分支策略

```
main (生产环境)
  ├── dev (开发环境)
  ├── draft (草稿区)
  └── feature/xxx (新功能)
```

#### 3. 冲突解决

当多个设备修改同一文件时：

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 如果有冲突，手动解决
git status  # 查看冲突文件
# 编辑冲突文件，保留需要的内容

git add .
git commit -m "Resolve merge conflicts"
git push
```

### 备份策略

#### 1. 本地备份

```bash
# 定期备份整个项目
tar -czf blog-backup-$(date +%Y%m%d).tar.gz pjfun-blog/

# 只备份内容
tar -czf content-backup-$(date +%Y%m%d).tar.gz public/content/
```

#### 2. 远程备份

```bash
# 推送到多个远程仓库
git remote add backup https://gitee.com/username/pjfun-blog-backup.git
git push backup main
```

#### 3. 自动化备份脚本

创建 `scripts/backup.sh`：

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="~/backups/blog"
mkdir -p $BACKUP_DIR

# 备份内容目录
tar -czf "$BACKUP_DIR/content_$DATE.tar.gz" public/content/

# 备份到云存储（示例：使用 rclone）
rclone copy "$BACKUP_DIR" remote:blog-backups/

# 删除30天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### 性能优化建议

#### 1. 增量构建

对于大型博客，只构建变更的文件：

```bash
# 使用 Vite 的增量构建特性
pnpm build --watch
```

#### 2. CDN 加速

将静态资源部署到 CDN：

- 图片：使用 imgur、Cloudinary、阿里云 OSS
- 文档：使用 GitHub Raw、jsDelivr

```markdown
cover: https://cdn.jsdelivr.net/gh/username/repo@main/public/img/cover.jpg
```

#### 3. 缓存策略

配置浏览器缓存（已在 nginx.conf 中配置）：

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 安全建议

#### 1. 敏感信息保护

不要将以下内容提交到 Git：

- `.env` 文件（包含密码、密钥）
- 私钥文件
- 数据库凭证

确保 `.gitignore` 包含：

```gitignore
.env
.env.local
*.key
*.pem
node_modules/
dist/
```

#### 2. 访问控制

- 使用强密码保护博客（已支持）
- 启用 HTTPS
- 限制管理后台访问 IP

#### 3. 定期更新

```bash
# 定期更新依赖
pnpm update

# 检查安全漏洞
pnpm audit
```

### 监控与分析

#### 1. 访问统计

集成分析工具：

- Google Analytics
- Umami（开源，注重隐私）
- Plausible（轻量级）

在 `index.html` 中添加跟踪代码：

```html
<!-- Umami 示例 -->
<script async defer data-website-id="your-id" src="https://umami.example.com/script.js"></script>
```

#### 2. 错误监控

- Sentry
- LogRocket
- 自建日志服务

#### 3.  uptime 监控

- UptimeRobot
- StatusCake
- Pingdom

### 常见问题

#### Q: 如何在不熟悉 Git 的情况下管理内容？

A: 推荐使用 Netlify CMS 或 Gitee Web IDE，提供可视化编辑界面。

#### Q: 多人协作时如何避免冲突？

A: 
1. 使用不同的文件夹分工
2. 频繁拉取和推送代码
3. 使用分支进行隔离
4. 建立沟通机制

#### Q: 如何处理大量图片资源？

A:
1. 使用图床服务（SM.MS、Imgur）
2. 压缩图片（TinyPNG、Squoosh）
3. 使用 WebP 格式
4. 实施懒加载

#### Q: 能否实现实时预览？

A: 可以，运行 `pnpm dev` 启动开发服务器，支持热更新。

#### Q: 如何迁移到其他平台？

A: 由于是纯静态网站，只需将 `dist` 目录上传到新的托管服务即可。

---

## 🎨 自定义配置

### 站点信息

编辑 `src/constants/index.ts` 文件来修改站点信息：

```typescript
export const SITE_CONFIG = {
  icon: 'Pj',
  title: 'Pjfun Blog',
  description: '一个现代化的个人博客和技术分享平台',
  author: 'Simon',
  keywords: ['博客', '技术分享', '前端开发', 'Vue', 'TypeScript'],
  email:'pjfun@aliyun.com',
  socialLinks: {
    github: 'https://github.com/LXC-9349/pjfun-blog',
    Telegram: 'https://t.me/pjfun_top',
  }
}
```

### 国际化

在同一个文件中可以修改中英文翻译：

```typescript
export const I18N_CONFIG = {
  zh: {
    // 中文翻译
  },
  en: {
    // 英文翻译
  }
}
```

## 🔧 开发指南

### 组件系统

项目采用基于文件系统的路由方案，页面组件位于 `src/pages` 目录下。UI组件位于 `src/components/ui`，功能性组件位于 `src/components`。

### 图标系统

项目支持两种图标使用方式：
1. 本地 SVG 图标：位于 `src/assets/icons` 目录，通过 `IconComponent` 组件使用
2. Iconify 图标：通过 `unplugin-icons` 自动生成组件，如 `IconCarbonHome`

推荐优先使用 Iconify 图标，因为它们提供更多选择并且自动按需加载。

### 插件机制

项目包含以下自定义插件：
- `vite-plugin-gen-nav.ts` - 自动生成导航和目录结构
- `vite-plugin-rss.ts` - 构建时生成 RSS、Atom 和 JSON Feed 订阅文件
- `vite-plugin-sitemap.ts` - 构建时生成 sitemap.xml 站点地图
- `vite-plugin-cdn.ts` - 多 CDN 自动 fallback 注入

### 样式系统

项目使用 UnoCSS 作为样式引擎，配置文件为 `uno.config.ts`。支持 Wind 风格的工具类和图标系统。

### 国际化

项目支持中英文切换，翻译内容定义在 `src/constants/index.ts` 文件中。

### 密码保护

博客支持简单的密码保护功能，可通过环境变量 `VITE_BLOG_PASSWORD_HASH` 启用。

### 评论系统

博客集成了 Giscus 评论系统，基于 GitHub Discussions。可以在 `src/constants/index.ts` 中配置相关参数。

## 🌐 部署

构建完成后，将 `dist` 目录中的内容部署到任何静态网站托管服务，例如：

## 🔍 SEO & RSS 支持

本项目现已支持SEO优化和RSS订阅：

- 自动生成结构化数据（Schema.org）
- 支持Open Graph和Twitter Cards
- 自动生成RSS、Atom和JSON Feed
- 自动生成Sitemap（站点地图）
- RSS源文件位于 `/rss.xml`、`/atom.xml` 和 `/feed.json`

## 📱 PWA 支持

项目支持PWA（渐进式Web应用），用户可以将博客安装为桌面应用，提供类似原生应用的体验。

- [Vercel](https://vercel.com/)
- [Netlify](https://netlify.com/)
- [GitHub Pages](https://pages.github.com/)
- [EdgeOne Pages](https://edgeone.ai/products/pages)

### 一键部署
####  Vercel
点击以下按钮即可将项目快速部署到 Vercel：

<a href="https://vercel.com/new/clone?repository-url=https://github.com/LXC-9349/pjfun-blog&project-name=pjfun-blog&repository-name=pjfun-blog" target="_blank">
  <img src="https://vercel.com/button" alt="Deploy with Vercel">
</a>


**注意**：请将按钮链接中的 `https://github.com/LXC-9349/pjfun-blog` 替换为你的实际 Git 仓库地址。
**注意**：- vercel在国内被墙，请配合代理或绑定自定义域名使用_~~

[示例网站：https://pjfun-blog.vercel.app/](https://pjfun-blog.vercel.app/)
访问密码：123456

#### 腾讯云(国内) edgeone pages

<a href="https://console.cloud.tencent.com/edgeone/pages/new?template=https://github.com/LXC-9349/pjfun-blog&project-name=pjfun-blog&root-directory=.%2F" target="_blank">
  <img src="https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg" alt="使用 EdgeOne Pages 部署">
</a>

[示例网站：https://cnblog.pjfun.top/](https://cnblog.pjfun.top/)



#### 腾讯云(国际) edgeone pages

<a href="https://console.tencentcloud.com/edgeone/pages/new?template=https://github.com/LXC-9349/pjfun-blog&project-name=pjfun-blog&root-directory=.%2F" target="_blank">
  <img src="https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg" alt="使用 EdgeOne Pages 部署">
</a>



####  Cloudflare
<a href="https://deploy.workers.cloudflare.com/?url=https://github.com/LXC-9349/pjfun-blog/tree/main" target="_blank">
  <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare Workers">
</a>

[示例网站：https://demoblog.pjfun.top/](https://demoblog.pjfun.top/)

#### GitHub Pages

要将项目部署到 GitHub Pages，您可以使用 GitHub Actions 自动化部署流程。我们已经为您准备好了一个工作流配置文件。

##### 方法一：使用 GitHub Actions 自动部署（推荐）

1. 将您的代码推送到 GitHub 仓库（确保分支名为 `main`）
2. 提交并推送更改到 GitHub
3. 在 GitHub 仓库中，进入 Settings > Pages
4. 在 "Build and deployment" 部分，将 "Source" 设置为 "GitHub Actions"
5. 等待 Actions 运行完成，您的网站将在 `https://<username>.github.io/<repository>/` 上线


[示例网站：https://lxc-9349.github.io/pjfun-blog/](https://lxc-9349.github.io/pjfun-blog/)
##### 方法二：手动部署

如果您想手动部署到 GitHub Pages：

1. 构建项目：
   ```bash
   pnpm build
   ```

2. 将 `dist` 目录的内容推送到 `gh-pages` 分支：
   ```bash
   # 安装 gh-pages 包（如果尚未安装）
   pnpm add -D gh-pages
   
   # 添加部署脚本到 package.json
   # 在 scripts 部分添加: "deploy": "gh-pages -d dist"
   
   # 部署
   pnpm deploy
   ```

3. 在 GitHub 仓库中，进入 Settings > Pages
4. 将 "Source" 设置为 "Deploy from a branch"
5. 选择 `gh-pages` 分支并保存

**注意**：请将 `<username>` 替换为您的 GitHub 用户名，将 `<repository>` 替换为您的仓库名称。


####  Netlify(免费的不推荐)
点击以下按钮即可将项目快速部署到 Netlify：

<a href="https://app.netlify.com/start/deploy?repository=https://github.com/LXC-9349/pjfun-blog" target="_blank">
  <img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify">
</a>

**注意**：请将按钮链接中的 `https://github.com/LXC-9349/pjfun-blog` 替换为你的实际 Git 仓库地址。


[//]: # ([示例网站：https://stately-crisp-a560ad.netlify.app/]&#40;https://stately-crisp-a560ad.netlify.app/&#41;)


#### Firebase Hosting

安装 Firebase CLI 并运行以下命令：

```bash
firebase init hosting
firebase deploy
```

**注意**：需要先在 Firebase 控制台创建项目，并安装 `firebase-tools`。

#### Azure Static Web Apps

<a href="https://portal.azure.com/#create/Microsoft.StaticApp" target="_blank">
  <img style="height: 50px;" src="https://azurecomcdn.azureedge.net/cvt-4fd6fa9f1d5510b6339fa7243038120d6e3003656ac48e00c4e4e6e530abecba/images/page/services/static-web-apps/01-Overview/swa-button.svg" alt="Deploy to Azure Static Web Apps">
</a>

**注意**：需要 Azure 账户，在创建应用时指定源代码仓库。

#### Surge.sh

安装 Surge 并运行以下命令：

```bash
npm install -g surge
surge dist/
```

**注意**：需要先安装 `surge` CLI 工具，并确保构建输出在 `dist` 目录。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 许可证

此项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

<video controls preload="metadata" style="width: 100%; height: auto; border-radius: 8px;">
  <source src="https://img-baofun.zhhainiao.com/pcwallpaper_ugc/preview/8ded43cfacffefec1c681f99859543cd_preview.mp4" type="video/mp4">
  <source src="https://img-baofun.zhhainiao.com/pcwallpaper_ugc/preview/fd39802e5f1c034fb556b29b3f5c329b_preview.mp4" type="video/mp4">
  您的浏览器不支持视频播放。
</video>