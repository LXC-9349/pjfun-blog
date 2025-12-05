# PJ Blog - 现代化个人博客系统

<p align="center">
  <img src="public/img/pbsh.jpg" alt="PJ Blog Preview" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.x-brightgreen" alt="Vue Version">
  <img src="https://img.shields.io/badge/TypeScript-Support-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

~~_## 🌟 简介

PJ Blog 是一个零后端、纯静态、顶级动效、全球秒开的现代化个人博客系统。它采用最新的前端技术栈构建，具有响应式设计、暗黑模式、平滑滚动、动画效果等特性，让你轻松拥有一个高性能的技术博客。

只需在 `content` 目录下放置 `.md` 文件 → 运行 `pnpm build` → 部署到任何静态网站托管服务即可拥有属于自己的顶级技术站。

## 🚀 技术栈

- [Vue 3](https://v3.vuejs.org/) - 渐进式 JavaScript 框架
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集，添加了静态类型
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [UnoCSS](https://unocss.dev/) - 即时按需原子 CSS 引擎
- [Lenis](https://github.com/studio-freight/lenis) - 平滑滚动库
- [Markdown-it](https://github.com/markdown-it/markdown-it) - Markdown 解析器
- [Highlight.js](https://highlightjs.org/) - 代码高亮工具
- [Vue Router](https://router.vuejs.org/) - Vue.js 官方路由管理器

## ✨ 特性

- 📝 **Markdown 支持** - 使用 Markdown 编写文章，支持 Frontmatter
- 🌗 **暗黑模式** - 自动适配系统主题或手动切换
- 🌍 **国际化** - 支持中英文切换
- 🔍 **全文搜索** - 快速搜索文章标题、摘要和标签（支持 Ctrl+K 快捷键）
- 🖼️ **封面图片** - 为每篇文章设置封面图
- 🏷️ **标签系统** - 为文章添加标签，方便分类和筛选
- 📱 **响应式设计** - 适配各种设备屏幕尺寸
- ⚡ **高性能** - 静态站点，加载速度快
- 🎨 **精美 UI** - 使用 UnoCSS 和 DaisyUI 构建现代界面
- 📚 **目录结构** - 自动生成文章目录树
- 📈 **阅读时长** - 自动计算文章阅读时间
- 📤 **代码复制与下载** - 一键复制或下载代码块
- 🔝 **回到顶部** - 滚动时显示回到顶部按钮
- 📖 **置顶文章** - 支持文章置顶功能
- 📋 **文章目录** - 自动生成文章内目录导航

## 📁 项目结构

```
pjfun-blog/
├── public/
│   └── content/           # Markdown 文章目录
│       ├── 2025/
│       ├── 学习/
│       ├── 教程/
│       └── 笔记/
├── src/
│   ├── components/        # Vue 组件
│   │   ├── ui/            # UI 组件
│   │   └── NavTree.vue    # 导航树组件
│   ├── constants/         # 常量配置
│   ├── pages/             # 页面组件
│   │   ├── index.vue      # 首页
│   │   └── article.vue    # 文章页
│   ├── plugins/           # 插件
│   ├── utils/             # 工具函数
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── generated/             # 自动生成的导航和目录数据
├── vite-plugin-gen-nav.ts # 导航生成插件
├── uno.config.ts          # UnoCSS 配置
└── vite.config.ts         # Vite 配置
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16
- pnpm >= 7

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

默认会在 http://localhost:3000 启动开发服务器。

### 构建生产版本

```bash
pnpm build
```

构建后的文件会输出到 `dist` 目录。

### 预览生产版本

```bash
pnpm preview
```

## 📝 写作指南

### 创建新文章

1. 在 `public/content/` 目录下创建 Markdown 文件
2. 使用以下格式编写文章元数据：

```markdown
---
title: 文章标题
date: 2025-12-05
cover: /image/pbsh.jpg
desc: 文章摘要
tags: [Vite, Vue3, UnoCSS, Lenis]
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
│   └── hello.md
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

## 🎨 自定义配置

### 站点信息

编辑 `src/constants/index.ts` 文件来修改站点信息：

```typescript
export const SITE_CONFIG = {
  title: 'PJ Blog',
  description: '一个现代化的个人博客和技术分享平台',
  author: 'PJ',
  keywords: ['博客', '技术分享', '前端开发', 'Vue', 'TypeScript'],
  socialLinks: {
    github: 'https://github.com/yourusername',
    twitter: 'https://twitter.com/yourusername',
    linkedin: 'https://linkedin.com/in/yourusername'
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

### 插件机制

项目包含以下自定义插件：
- `vite-plugin-gen-nav.ts` - 自动生成导航和目录结构
- `src/plugins/seo.ts` - SEO优化插件

### 样式系统

项目使用 UnoCSS 作为样式引擎，配置文件为 `uno.config.ts`。支持 Wind 风格的工具类和图标系统。

## 🌐 部署

构建完成后，将 `dist` 目录中的内容部署到任何静态网站托管服务，例如：

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

####  Netlify
点击以下按钮即可将项目快速部署到 Netlify：

<a href="https://app.netlify.com/start/deploy?repository=https://github.com/LXC-9349/pjfun-blog" target="_blank">
  <img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify">
</a>
**注意**：请将按钮链接中的 `https://github.com/LXC-9349/pjfun-blog` 替换为你的实际 Git 仓库地址。

#### 腾讯云 edgeone pages

<a href="https://console.cloud.tencent.com/edgeone/pages/new?template=https://github.com/LXC-9349/pjfun-blog&project-name=pjfun-blog&root-directory=.%2F" target="_blank">
  <img src="https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg" alt="使用 EdgeOne Pages 部署">
</a>
**注意**：请将按钮链接中的 `https://github.com/LXC-9349/pjfun-blog` 替换为你的实际 Git 仓库地址。


####  Cloudflare

<a href="https://deploy.workers.cloudflare.com/?url=https://github.com/LXC-9349/pjfun-blog" target="_blank">
  <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare Workers">
</a>
**注意**：请将按钮链接中的 `https://github.com/LXC-9349/pjfun-blog` 替换为你的实际 Git 仓库地址。



## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 许可证

此项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。