# PJ Blog - A Modern Personal Blog System

<div align="center" style="display: flex;gap: 2px; justify-content: center; align-items: center;">

  <img src="https://img.shields.io/badge/Vue-3.x-brightgreen" alt="Vue Version">
  <img src="https://img.shields.io/badge/TypeScript-Support-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</div>
<div align="center">
    <p>
        <a href="https://github.com/LXC-9349/pjfun-blog/blob/main/README.md">简体中文</a> | <a href="https://github.com/LXC-9349/pjfun-blog/blob/main/README.en.md">English</a> | <a href="https://pjfun.top">Homepage</a>
    </p>
</div>

## 🌟 Introduction

PJ Blog is a zero-backend, purely static, top-tier animated, globally instant-loading modern personal blog system. Built with the latest front-end technology stack, it features responsive design, dark mode, smooth scrolling, rich animations, and many other modern characteristics, allowing you to easily own a high-performance technical blog.

Simply place `.md`, `.html`, or `.txt` files in the `public/content` directory → run `pnpm build` → deploy to any static site hosting service, and you’ll have your own top-tier technical blog.

## 🚀 Tech Stack

- [Vue 3](https://v3.vuejs.org/) – The Progressive JavaScript Framework
- [TypeScript](https://www.typescriptlang.org/) – JavaScript with syntax for types
- [Vite](https://vitejs.dev/) – Next-generation frontend tooling
- [UnoCSS](https://unocss.dev/) – The instant on-demand Atomic CSS engine
- [Marked](https://marked.js.org/) – A fast and performant Markdown parser
- [Highlight.js](https://highlightjs.org/) – Syntax highlighting for code
- [Vue Router](https://router.vuejs.org/) – Official router for Vue.js
- [DOMPurify](https://github.com/cure53/DOMPurify) – A DOM-only XSS sanitizer
- [Giscus](https://giscus.app/) – A comment system powered by GitHub Discussions

## ✨ Features

- 📝 **Markdown Support** – Write articles in Markdown with Frontmatter support
- 🌗 **Dark Mode** – Auto-detects system theme or manual toggle
- 🌍 **Internationalization** – Supports Chinese/English switching
- 🔍 **Full-text Search** – Fast search across titles, summaries, and tags (Ctrl+K shortcut)
- 🖼️ **Cover Images** – Set a cover image for each article
- 🏷️ **Tag System** – Add tags to articles for easy categorization and filtering
- 💬 **Comment System** – Integrated Giscus comment system
- 📱 **Responsive Design** – Adapts to all screen sizes
- ⚡ **High Performance** – Static site with extremely fast loading
- 🎨 **Beautiful UI** – Modern interface built with UnoCSS
- 📚 **Directory Tree** – Automatically generates article navigation tree
- 📈 **Reading Time** – Automatically calculates estimated reading time
- 📤 **One-click Code Copy** – Copy code blocks with a single click
- 🔝 **Back to Top** – Button appears when scrolling
- 📖 **Sticky Posts** – Support for pinning articles to the top
- 📋 **Table of Contents** – Auto-generated TOC for articles
- 🖼️ **Image Lightbox** – Click images in articles to enlarge
- 📏 **Font Size Adjustment** – Switch between three font sizes
- ⚙️ **SEO Optimized** – Structured data, Open Graph, and Twitter Cards
- 📡 **RSS Support** – Auto-generates RSS, Atom, and JSON Feed
- 📱 **PWA Support** – Can be installed as a desktop app
- 🌐 **Multi-format Support** – Supports Markdown, HTML, and TXT articles

## 🔐 Password Protection

The blog supports optional password protection, enabled via environment variables.

### Enable Password Protection

Add the environment variable in `.env` or configure it in your hosting platform:

```env
VITE_BLOG_PASSWORD_HASH=your_sha256_password_hash_here
```

### Generate Password Hash

#### Option 1: Use the built-in script (recommended for production)

```bash
node scripts/generate-password-hash.js your_password_here
```

This will output the SHA256 hash that you should put into `.env`.

#### Option 2: Use an online tool (only for testing)

Recommended tool: https://www.convertstring.com/en/Hash/SHA256

Steps:
1. Visit the site
2. Enter your password
3. Click “Hash”
4. Copy the generated SHA256 hash

Then set:

```env
VITE_BLOG_PASSWORD_HASH=your_generated_sha256_hash_here
```

#### Security Warning
⚠️ **Important**: Online tools transmit your password over the network – there is a security risk. Only use them for development/testing. For production, always use the local script.

### Using Password Protection

Once enabled, visitors will be redirected to a password entry page. After entering the correct password, they can access the full site.

### Security Notes

- We now use SHA256 hashing (much safer than previous plaintext storage)
- Use a strong password in production
- This feature is intended for simple use cases only; for high-security needs, use a professional solution

## 📁 Project Structure

```
pjfun-blog/
├── public/
│   └── content/           # Article directory (supports Markdown, HTML, TXT)
│       ├── 2025/
│       ├── 学习/
│       ├── 教程/
│       └── 笔记/
├── src/
│   ├── assets/            # Static assets
│   │   └── icons/         # Local SVG icons
│   ├── components/        # Vue components
│   │   ├── ui/            # UI components
│   │   ├── Footer.vue
│   │   ├── GiscusComment.vue
│   │   ├── NavTree.vue
│   │   └── PasswordProtection.vue
│   ├── constants/         # Configuration constants
│   ├── pages/             # Page components
│   │   ├── archive.vue
│   │   ├── articleDetail.vue
│   │   ├── favorites.vue
│   │   └── index.vue
│   ├── plugins/           # Plugins
│   ├── utils/             # Utility functions
│   ├── App.vue
│   └── main.ts
├── package/               # Build-related tools
├── index.html
├── uno.config.ts          # UnoCSS config
├── vite.config.ts         # Vite config
└── vite-plugin-gen-nav.ts # Navigation generation plugin
```

## 🚀 Quick Start

### Requirements

- Node.js >= 20.18.1 or higher
- pnpm 7 or higher

### Install Dependencies

```bash
pnpm install
```

### Development Server

```bash
pnpm dev
```

Opens by default at http://localhost:1022

### Build for Production

```bash
pnpm build
```

Output will be in the `dist` folder.

### Preview Production Build

```bash
pnpm preview
```

## 📝 Writing Articles

### Create a New Article

1. Create a Markdown, HTML, or TXT file under `public/content/`
2. For Markdown files, use the following Frontmatter format:

```markdown
---
title: Article Title
date: 2025-12-05
cover: /image/pbsh.jpg
desc: Article summary
tags: [Vite, Vue3, UnoCSS, Marked]
sticky: true # Optional – pin to top
---

# Heading

Article content...
```

### Recommended Directory Structure

```
public/content/
├── 2025/                 # By year
│   └── hello.md
├── Study/                # By topic
│   ├── Vite/
│   │   └── advanced-configurations.md
│   └── Vue/
│       └── introduction.md
├── Tutorials/
│   └── getting-started.md
└── Notes/
    └── Personal/
        └── on-writing.md
```

## 🎨 Customization

### Site Information

Edit `src/constants/index.ts`:

```typescript
export const SITE_CONFIG = {
  icon: 'Pj',
  title: 'Pjfun Blog',
  description: 'A modern personal blog and tech-sharing platform',
  author: 'Simon',
  keywords: ['blog', 'tech', 'frontend', 'Vue', 'TypeScript'],
  email: 'pjfun@aliyun.com',
  socialLinks: {
    github: 'https://github.com/LXC-9349/pjfun-blog',
    Telegram: 'https://t.me/pjfun_top',
  }
}
```

### Internationalization

Translations are also defined in the same file (`I18N_CONFIG`).

## 🔧 Development Guide

### Component System

The project uses file-system-based routing. Pages are in `src/pages`, UI components in `src/components/ui`, and functional components in `src/components`.

### Icon System

Two ways:
1. Local SVG icons in `src/assets/icons` (used via `IconComponent`)
2. Iconify icons (auto-imported by `unplugin-icons`), e.g., `<IconCarbonHome />`

Prefer Iconify for richer choices and on-demand loading.

### Plugins

Custom plugin: `vite-plugin-gen-nav.ts` – automatically generates navigation and directory tree.

### Styling

Uses UnoCSS (configured in `uno.config.ts`). Supports utility classes and Iconify integration.

### Password Protection & Comments

Configured via environment variables and `src/constants/index.ts`.

## 🌐 Deployment

After building, upload the `dist` folder to any static hosting service.

### One-click Deployment Options

#### Vercel
<a href="https://vercel.com/new/clone?repository-url=https://github.com/LXC-9349/pjfun-blog&project-name=pjfun-blog&repository-name=pjfun-blog" target="_blank">
  <img src="https://vercel.com/button" alt="Deploy with Vercel">
</a>

**Note**: Replace the repo URL with your own fork. Vercel may be blocked in mainland China – use a proxy or custom domain.

Demo (password: 123456): https://pjfun-blog.vercel.app/

#### Tencent Cloud EdgeOne Pages (China)
<a href="https://console.cloud.tencent.com/edgeone/pages/new?template=https://github.com/LXC-9349/pjfun-blog&project-name=pjfun-blog&root-directory=.%2F" target="_blank">
  <img src="https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg" alt="Deploy with EdgeOne Pages">
</a>

Demo: https://cnblog.pjfun.top/

#### Tencent Cloud EdgeOne Pages (International)
<a href="https://console.tencentcloud.com/edgeone/pages/new?template=https://github.com/LXC-9349/pjfun-blog&project-name=pjfun-blog&root-directory=.%2F" target="_blank">
  <img src="https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg" alt="Deploy with EdgeOne Pages">
</a>

#### Cloudflare Pages
<a href="https://deploy.workers.cloudflare.com/?url=https://github.com/LXC-9349/pjfun-blog/tree/main" target="_blank">
  <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare Workers">
</a>

Demo: https://demoblog.pjfun.top/

#### GitHub Pages

##### Method 1 – GitHub Actions (recommended)

1. Push code to `main` branch
2. Go to Settings → Pages → Source → GitHub Actions
3. Wait for the workflow to complete

Demo: https://lxc-9349.github.io/pjfun-blog/

##### Method 2 – Manual

```bash
pnpm add -D gh-pages
# Add to package.json scripts: "deploy": "gh-pages -d dist"
pnpm deploy
```

Then set Pages source to the `gh-pages` branch.

#### Netlify
<a href="https://app.netlify.com/start/deploy?repository=https://github.com/LXC-9349/pjfun-blog" target="_blank">
  <img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify">
</a>

Replace the repo URL with your own.

#### Firebase Hosting

```bash
firebase init hosting
firebase deploy
```

#### Azure Static Web Apps
<a href="https://portal.azure.com/#create/Microsoft.StaticApp" target="_blank">
  <img style="height: 50px;" src="https://azurecomcdn.azureedge.net/cvt-4fd6fa9f1d5510b6339fa7243038120d6e3003656ac48e00c4e4e6e530abecba/images/page/services/static-web-apps/01-Overview/swa-button.svg" alt="Deploy to Azure Static Web Apps">
</a>

#### Surge.sh

```bash
npm install -g surge
surge dist/
```

## 🔍 SEO & RSS

- Structured data (Schema.org)
- Open Graph & Twitter Cards
- Auto-generated `/rss.xml`, `/atom.xml`, `/feed.json`

## 📱 PWA Support

The site can be installed as a Progressive Web App, providing an app-like experience.

## 🤝 Contributing

Issues and Pull Requests are welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

<video controls preload="metadata" style="width: 100%; height: auto; border-radius: 8px;">
  <source src="https://img-baofun.zhhainiao.com/pcwallpaper_ugc/preview/8ded43cfacffefec1c681f99859543cd_preview.mp4" type="video/mp4">
  <source src="https://img-baofun.zhhainiao.com/pcwallpaper_ugc/preview/fd39802e5f1c034fb556b29b3f5c329b_preview.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
