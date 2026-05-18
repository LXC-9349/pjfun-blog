---
title: 欢迎来到 PJ Blog — 零后端纯静态博客系统
date: 2025-12-05
cover: /img/d1.webp
desc: PJ Blog 是一个零后端、纯静态、顶级动效、全球秒开的现代化个人博客系统。支持 Markdown/HTML/PDF/Word/Excel，一键部署到 Vercel/EdgeOne/GitHub Pages。
tags: [Vite, Vue3, UnoCSS, Lenis, 博客, 前端]
sticky: true
---

# PJ Blog - 现代化个人博客系统

<p align="center">
  <a href="README.md">简体中文</a> | <a href="README.en.md">English</a> | <a href="https://pjfun.top">主页</a>
</p>

## 🌟 简介

PJ Blog 是一个**零后端、纯静态、顶级动效、全球秒开**的现代化个人博客系统。它采用最新的前端技术栈构建，具有响应式设计、暗黑模式、平滑滚动、动画效果等特性，让你轻松拥有一个高性能的技术博客。

只需在 `public/content` 目录下放置 `.md`、`.html`、`.txt`、PDF、Word 或 Excel 文件 → 运行 `pnpm build` → 部署到任何静态网站托管服务即可拥有属于自己的顶级技术站。

**在线示例：[https://pjfun.top](https://pjfun.top)**

## 🚀 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3.5 + TypeScript |
| 构建 | Vite 7 + UnoCSS (presetWind3) |
| 路由 | Vue Router 4 + vite-plugin-pages (文件系统路由) |
| Markdown 渲染 | Marked 17 + marked-gfm-heading-id |
| 代码高亮 | highlight.js 11 |
| 安全清洗 | DOMPurify |
| 文档渲染 | mammoth (Word) + pdfjs-dist (PDF) + Luckysheet (Excel) |
| 平滑滚动 | Lenis |
| 动效 | @vueuse/motion |
| 图标 | Iconify Carbon (自动按需加载) + 本地 SVG |
| 评论 | Giscus (基于 GitHub Discussions) |
| PWA | vite-plugin-pwa |
| CDN | 多 CDN 自动 fallback |
| 动画 | UnoCSS 自定义 + @keyframes |
| 通知 | vue3-toastify |
| 工具 | @vueuse/core |

## ✨ 特性一览

### 📝 内容创作
- **Markdown 支持** — 使用 Markdown 编写文章，支持 YAML Frontmatter
- **多格式支持** — Markdown / HTML / TXT / PDF / Word / Excel
- **封面图片** — 每篇文章独立封面
- **标签系统** — 文章标签分类和首页筛选
- **文章置顶** — 支持 `sticky` 属性
- **非 Markdown 元数据** — `.desc.json` / `.desc.yaml` 配置

### 🎨 界面体验
- **吸顶导航栏** — 滚动时自动收缩 + shadow 效果
- **深色/浅色主题** — 跟随系统 + 手动切换，0.3s 平滑过渡
- **页面过渡动画** — 路由切换 fade + translateY
- **平滑滚动** — Lenis 驱动，锚点导航也使用 Lenis
- **首页卡片设计** — 16:10 封面 → 标题 → 摘要(2行) → 标签/日期/阅读时间/箭头 单行底部
- **骨架屏** — 贴合真实卡片布局的加载占位
- **归档时间线** — 年份圆形徽章 + 垂直时间线 + 月份圆点
- **收藏夹页面** — 卡片网格 + 移动端抽屉侧栏

### ⌨️ 交互操作
- **Ctrl+K 搜索** — 全站快速搜索，支持 ↑↓ 键盘导航，搜索结果缓存
- **键盘导航** — ← → 切换上一篇/下一篇
- **触摸滑动** — 移动端左右滑动翻页
- **右键菜单** — 文章卡片右键：新标签打开/复制链接/收藏切换
- **代码复制** — 代码块 hover 显示复制按钮
- **代码语言标签** — 自动识别并显示代码语言
- **图片灯箱** — 点击图片放大预览
- **字号调节** — 小/中/大三档
- **字体调节** — 阅读时自由切换字号

### 📱 移动端适配
- **底部导航栏** — 4 按钮：首页/归档/收藏/搜索
- **移动端抽屉** — 左滑出导航菜单
- **触摸滑动翻页** — 60px 阈值手势识别
- **安全区适配** — `env(safe-area-inset-bottom)` 适配刘海屏
- **文章操作浮动栏** — 返回顶部/目录/字号/分享

### 📖 阅读体验
- **阅读进度条** — 顶部渐变进度条
- **阅读进度保存** — 自动保存滚动位置，再次进入恢复
- **阅读时间** — 首页卡片 + 文章详情显示
- **最近浏览** — 侧栏显示最近 5 篇文章
- **文章目录** — IntersectionObserver 滚动监听 + 高亮
- **上一篇/下一篇** — 文章底部导航
- **相关文章推荐** — 基于标签的相关文章

### 🔧 站点功能
- **国际化** — 中英文界面切换
- **Giscus 评论** — 基于 GitHub Discussions
- **密码保护** — 构建时 SHA256 哈希加密
- **PWA** — 可安装为桌面应用，离线支持
- **SEO** — 结构化数据 + Open Graph + Twitter Cards
- **RSS 订阅** — 构建自动生成 rss.xml / atom.xml / feed.json
- **Sitemap** — 构建自动生成 sitemap.xml
- **站点统计** — 不蒜子访客统计
- **版本更新提示** — 检测新版本并提示刷新
- **在线编辑** — 一键打开 StackBlitz / GitHub.dev / VSCode.dev / Bolt.new

### ⚙️ 开发插件
- `vite-plugin-gen-nav` — 内容扫描 → nav.json / tree.json
- `vite-plugin-auto-password-hash` — 构建时 SHA256 自动哈希
- `vite-plugin-cdn` — 多 CDN fallback 注入
- `vite-plugin-rss` — RSS / Atom / JSON Feed 生成
- `vite-plugin-sitemap` — sitemap.xml 生成
- `vite-plugin-pwa` — Service Worker + Manifest
- `vite-plugin-image-optimizer` — 图片压缩
- `vite-plugin-html` — EJS 模板注入

## 🗺️ 架构图

```
                        ┌─────────────────────────────┐
                        │     Vite Build Pipeline       │
                        │  gen-nav  → nav.json/tree.json│
                        │  password → SHA256 hash       │
                        │  CDN      → external deps     │
                        │  RSS      → rss.xml           │
                        │  sitemap  → sitemap.xml       │
                        │  PWA      → sw + manifest     │
                        └──────────┬────────────────────┘
                                   │
                        ┌──────────▼────────────────────┐
                        │      Vue 3 SPA (Browser)       │
                        │  main.ts → App.vue → Router    │
                        │    ├── / (index.vue)           │
                        │    ├── /archive                │
                        │    ├── /favorites              │
                        │    ├── /password               │
                        │    └── /:pathMatch (article)   │
                        └───────────────────────────────┘
```

## ⚙️ 环境变量配置

PJ Blog 支持通过环境变量自定义站点配置，无需修改代码即可个性化博客。

### 站点基本信息

```env
VITE_SITE_ICON=Pj                           # 站点图标
VITE_SITE_TITLE=Pjfun Blog                   # 站点标题
VITE_SITE_DESCRIPTION=零后端、纯静态...        # 站点描述
VITE_SITE_AUTHOR=Simon                       # 作者
VITE_SITE_KEYWORDS=博客,技术,Vue,TypeScript   # SEO 关键词
VITE_SITE_EMAIL=pjfun@aliyun.com             # 邮箱
VITE_SITE_URL=https://pjfun.top              # 站点域名（用于 RSS/Sitemap）
```

### 社交链接

```env
VITE_SOCIAL_GITHUB=https://github.com/yourusername/your-repo
VITE_SOCIAL_TELEGRAM=https://t.me/your-channel
VITE_FOOT_GITHUB=https://github.com/yourusername/your-repo
```

### Giscus 评论系统

通过 [giscus.app](https://giscus.app/zh-CN) 获取配置：

```env
VITE_GISCUS_ENABLED=true
VITE_GISCUS_REPO=yourusername/your-repo
VITE_GISCUS_REPO_ID=R_kgDOxxxxxxxxx
VITE_GISCUS_CATEGORY=Announcements
VITE_GISCUS_CATEGORY_ID=DIC_kwDOxxxxxxxxx
VITE_GISCUS_MAPPING=pathname
VITE_GISCUS_LANG=zh-CN
```

### 热门标签

```env
VITE_HOT_TAGS=Vue,网页,文本,编程教程,Vite,TypeScript
```

### 密码保护

```env
# 方式一（推荐）：明文密码，构建时自动 SHA256
VITE_BLOG_PASSWORD=your_password
# 方式二：预生成 SHA256 哈希
VITE_BLOG_PASSWORD_HASH=your_sha256_hash
```

**⚠️ `VITE_BLOG_PASSWORD` 优先级高于 `VITE_BLOG_PASSWORD_HASH`**

### 配置优先级

1. **系统环境变量**（最高）
2. **.env 文件**
3. **代码默认值**（最低）

## 📁 项目结构

```
pjfun-blog/
├── public/
│   ├── content/           # 文章目录 (md/html/txt/pdf/docx/xlsx)
│   ├── generated/         # 自动生成：nav.json, tree.json
│   ├── img/               # 静态图片
│   └── pj_public.js      # CDN 加载脚本
├── src/
│   ├── pages/             # 页面组件
│   │   ├── index.vue      # 首页
│   │   ├── archive.vue    # 归档（时间线）
│   │   ├── favorites.vue  # 收藏
│   │   └── articleDetail.vue # 文章详情
│   ├── components/        # Vue 组件
│   │   ├── ui/            # 通用 UI
│   │   ├── NavTree.vue    # 导航树
│   │   ├── Footer.vue     # 页脚
│   │   └── ...
│   ├── utils/             # 工具函数
│   ├── constants/         # 常量配置 + 国际化
│   ├── plugins/           # 插件
│   ├── styles/            # 全局样式
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口
├── package/               # 构建插件
│   ├── vite-plugin-rss.ts      # RSS 生成
│   ├── vite-plugin-sitemap.ts  # Sitemap 生成
│   ├── vite-plugin-cdn.ts      # CDN 注入
│   └── build_cdn.ts            # CDN 配置
├── uno.config.ts          # UnoCSS 配置
├── vite.config.ts         # Vite 配置
└── vite-plugin-gen-nav.ts # 导航生成
```

## 🚀 快速开始

### 环境要求

- Node.js >= 20.18.1
- pnpm >= 7

```bash
# 安装依赖
pnpm install

# 开发模式 → http://localhost:1022
pnpm dev

# 生产构建 → dist/
pnpm build

# 预览构建结果
pnpm preview

# 生成密码哈希
pnpm gen:encrypt-key
```

## 📝 写作指南

### 创建新文章

在 `public/content/` 下新建文件，Markdown 格式使用 Frontmatter：

```markdown
---
title: 文章标题
date: 2025-12-05
cover: /img/cover.jpg
desc: 文章摘要
tags: [Vue, TypeScript]
sticky: true    # 可选，置顶
---

# 文章标题

正文内容...
```

非 Markdown 文件使用同名的 `.desc.json` 或 `.desc.yaml` 配置文件。

### 支持的文件格式

| 格式 | 扩展名 | 元数据方式 |
|------|--------|-----------|
| Markdown | `.md` | YAML Frontmatter |
| HTML | `.html` | `.desc.json` / `.desc.yaml` |
| 纯文本 | `.txt` | `.desc.json` / `.desc.yaml` |
| PDF | `.pdf` | `.desc.json` / `.desc.yaml` |
| Word | `.docx` | `.desc.json` / `.desc.yaml` |
| Excel | `.xlsx` | `.desc.json` / `.desc.yaml` |

### 推荐目录结构

```
public/content/
├── 2025/                    # 按年份
│   ├── hello.md
│   ├── excel/
│   ├── pdf/
│   └── word/
├── 学习/                    # 按主题
│   ├── Vue框架/
│   └── Vite构建工具/
└── ...
```

## 🔐 密码保护

在 `.env` 中配置：

```env
# 推荐：自动构建时生成 SHA256
VITE_BLOG_PASSWORD=your_password

# 或：手动指定哈希
VITE_BLOG_PASSWORD_HASH=your_sha256_hash
```

启用后访问博客会跳转到 `/password` 页面，输入正确密码后方可浏览。

## 🌐 部署

构建完成后将 `dist/` 目录部署到任意静态托管服务：

| 平台 | 说明 |
|------|------|
| **Vercel** | [一键部署](https://vercel.com/new/clone?repository-url=https://github.com/LXC-9349/pjfun-blog) |
| **EdgeOne Pages** (腾讯云国内) | [部署](https://console.cloud.tencent.com/edgeone/pages/new?template=https://github.com/LXC-9349/pjfun-blog) |
| **EdgeOne Pages** (腾讯云国际) | [部署](https://console.tencentcloud.com/edgeone/pages/new?template=https://github.com/LXC-9349/pjfun-blog) |
| **Cloudflare Pages** | [部署](https://deploy.workers.cloudflare.com/?url=https://github.com/LXC-9349/pjfun-blog) |
| **GitHub Pages** | GitHub Actions 自动部署 |
| **Netlify** | [部署](https://app.netlify.com/start/deploy?repository=https://github.com/LXC-9349/pjfun-blog) |
| **Surge.sh** | `surge dist/` |

## 在线数据管理

博客内置「一键打开在线编辑器」功能，点击页脚或导航栏的 GitHub 按钮即可选择编辑器：

- **StackBlitz** — 快速启动，实时预览
- **GitHub.dev** — GitHub 官方 VSCode Online
- **VSCode.dev** — 完整 VSCode 体验
- **Bolt.new** — AI 辅助开发

## 📄 许可证

MIT License

---

**示例站点：[https://pjfun.top](https://pjfun.top)**
**GitHub 仓库：[https://github.com/LXC-9349/pjfun-blog](https://github.com/LXC-9349/pjfun-blog)**
