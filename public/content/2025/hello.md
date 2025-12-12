---
title: Hello pjfun-blog！2025 最强纯前端博客
date: 2025-12-05
cover: /img/d1.webp
desc: 零后端、纯静态、顶级动效、全球秒开的个人博客
tags: [Vite, Vue3, UnoCSS, Lenis]
sticky: true
---
# PJ Blog - 现代化个人博客系统

<div align="center" style="display: flex;gap: 2px; justify-content: center; align-items: center;">

  <img src="https://img.shields.io/badge/Vue-3.x-brightgreen" alt="Vue Version">
  <img src="https://img.shields.io/badge/TypeScript-Support-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</div>

<div align="center">
    <p>
        <a target="_blank" href="https://github.com/LXC-9349/pjfun-blog/blob/main/README.md">简体中文</a> | <a target="_blank"  href="https://github.com/LXC-9349/pjfun-blog/blob/main/README.en.md">English</a> | <a target="_blank"  href="https://pjfun.top">主页</a>
    </p>
</div>

## 🌟 简介

PJ Blog 是一个零后端、纯静态、顶级动效、全球秒开的现代化个人博客系统。它采用最新的前端技术栈构建，具有响应式设计、暗黑模式、平滑滚动、动画效果等特性，让你轻松拥有一个高性能的技术博客。

只需在 `public/content` 目录下放置 [.md](file://E:\3.0\pjfun-blog\public\content\2025\hello.md)、[.html](file://E:\3.0\pjfun-blog\index.html) 或 [.txt](file://E:\3.0\pjfun-blog\public\content\2025\文本\示例文本格式.txt) 文件 → 运行 `pnpm build` → 部署到任何静态网站托管服务即可拥有属于自己的顶级技术站。

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
- 🌐 **多格式支持** - 支持 Markdown、HTML 和 TXT 格式文章

## 🔐 密码保护功能

博客支持密码保护功能，可以通过环境变量启用。

### 启用密码保护

在各个pages中配置环境变量或者在.env中配置：
   ```
   VITE_BLOG_PASSWORD_HASH=your_sha256_password_hash_here
   ```

### 生成密码哈希

### 使用在线工具生成SHA256密码哈希
除了使用项目自带的generate-password-hash.js脚本外，您也可以使用在线工具来生成SHA256哈希值用于博客密码保护功能。
#### 推荐在线工具

- [https://www.convertstring.com/zh_CN/Hash/SHA256](https://www.convertstring.com/zh_CN/Hash/SHA256)

#### 使用步骤

1. 访问上述网站
2. 在输入框中输入您的密码
3. 点击"Hash"按钮生成SHA256哈希值
4. 复制生成的哈希值

#### 配置到博客

将生成的SHA256哈希值配置到环境变量中：

```env
VITE_BLOG_PASSWORD_HASH=your_generated_sha256_hash_here
```

#### 安全提醒
⚠️ **重要**: 使用在线工具存在安全风险，因为您的密码会通过网络传输。建议仅在开发测试环境中使用，在生产环境中应使用本地脚本生成：
```bash
node scripts/generate-password-hash.js your_password_here
```
这将输出密码的 SHA256 哈希值，您需要将该值添加到 `.env` 文件中。

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
│   └── content/           # 文章目录 (支持 Markdown, HTML, TXT)
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
│   ├── utils/             # 工具函数
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── package/               # 构建相关工具
├── index.html             # HTML 模板
├── uno.config.ts          # UnoCSS 配置
├── vite.config.ts         # Vite 配置
└── vite-plugin-gen-nav.ts # 导航生成插件
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

## 📝 写作指南

### 创建新文章

1. 在 `public/content/` 目录下创建 Markdown、HTML 或 TXT 文件
2. 使用以下格式编写文章元数据（仅 Markdown 支持元数据）：

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