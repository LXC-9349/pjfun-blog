# PJ Blog - A Modern Static Personal Blog System

<div style="display: flex;gap: 2px; justify-content: center; align-items: center;">

  <img src="https://img.shields.io/badge/Vue-3.x-brightgreen" alt="Vue Version">
  <img src="https://img.shields.io/badge/TypeScript-Support-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</div>
<div align="center">
    <p>
        <a href="https://github.com/LXC-9349/pjfun-blog/blob/main/README.md">简体中文</a> | <a href="https://github.com/LXC-9349/pjfun-blog/blob/main/README.en.md">English</a> | <a href="https://pjfun.top">主页</a>
    </p>
</div>
## 🌟 Introduction

PJ Blog is a **zero-backend, fully static**, high-performance personal blog system with stunning animations and instant global loading. Built with the latest frontend technology stack, it features responsive design, dark mode, smooth scrolling, rich animations, and more — letting you easily own a top-tier technical blog.

Just drop `.md`, `.html`, or `.txt` files into the `public/content` directory → run `pnpm build` → deploy to any static hosting service, and you’ll have your own premium blog in minutes.

## 🚀 Tech Stack

- [Vue 3](https://v3.vuejs.org/) – The Progressive JavaScript Framework
- [TypeScript](https://www.typescriptlang.org/) – Typed superset of JavaScript
- [Vite](https://vitejs.dev/) – Next-generation frontend tooling
- [UnoCSS](https://unocss.dev/) – Instant on-demand Atomic CSS engine
- [Marked](https://marked.js.org/) – High-performance Markdown parser
- [Highlight.js](https://highlightjs.org/) – Syntax highlighting
- [Vue Router](https://router.vuejs.org/) – Official router for Vue.js
- [DOMPurify](https://github.com/cure53/DOMPurify) – XSS sanitization library
- [Giscus](https://giscus.app/) – Comment system powered by GitHub Discussions

## ✨ Features

- 📝 **Markdown Support** – Write posts in Markdown with Frontmatter
- 🌗 **Dark Mode** – Auto-detects system preference or manual toggle
- 🌍 **i18n** – Chinese / English language switching
- 🔍 **Full-text Search** – Fast search across titles, excerpts, and tags (Ctrl+K shortcut)
- 🖼️ **Cover Images** – Custom cover image per article
- 🏷️ **Tag System** – Categorize and filter posts by tags
- 💬 **Comments** – Integrated Giscus comment system
- 📱 **Responsive Design** – Perfectly adapts to all screen sizes
- ⚡ **Blazing Fast** – Pure static site, lightning-fast loading
- 🎨 **Beautiful UI** – Modern interface powered by UnoCSS
- 📚 **Directory Tree** – Auto-generated navigation tree
- 📈 **Reading Time** – Estimated reading time for each article
- 📤 **One-click Code Copy** – Copy code blocks instantly
- 🔝 **Back to Top** – Smooth scroll-to-top button
- 📖 **Sticky Posts** – Pin important articles to the top
- 📋 **Table of Contents** – Auto-generated in-article TOC
- 🖼️ **Image Lightbox** – Click images to zoom
- 📏 **Font Size Adjustment** – Three-level font size switching
- ⚙️ **SEO Optimized** – Structured data, Open Graph, Twitter Cards
- 📡 **RSS Feeds** – Auto-generated RSS, Atom, and JSON Feed
- 📱 **PWA Support** – Installable as a desktop app
- 🌐 **Multi-format Support** – Markdown, HTML, and plain TXT articles

## 🔐 Password Protection

The blog supports optional password protection via environment variable.

### Enable Password Protection

Set the following in your `.env` file or hosting environment variables:

```env
VITE_BLOG_PASSWORD_HASH=your_sha256_password_hash_here
```

### Generate Password Hash

For security, passwords are stored as SHA-256 hashes:

```bash
node scripts/generate-password-hash.js your_password_here
```

Copy the output hash into your `.env` file.

### Usage

When enabled, visitors are redirected to a password prompt. After entering the correct password, full access is granted (stored in localStorage).

### Security Notes

- Uses SHA-256 (much more secure than previous plaintext method)
- Use a strong password in production
- Suitable only for simple private blogs — for high-security needs, use professional authentication solutions

## 📁 Project Structure

```
pjfun-blog/
├── public/
│   └── content/           # Articles (supports Markdown, HTML, TXT)
│       ├── 2025/
│       ├── Learning/
│       ├── Tutorials/
│       └── Notes/
├── src/
│   ├── assets/            # Static assets
│   │   └── icons/         # Local SVG icons
│   ├── components/        # Vue components
│   │   ├── ui/            # UI components
│   │   ├── Footer.vue
│   │   ├── GiscusComment.vue
│   │   ├── NavTree.vue
│   │   └── PasswordProtection.vue
│   ├── constants/         # Site configuration & i18n
│   ├── pages/             # Page components
│   │   ├── archive.vue
│   │   ├── articleDetail.vue
│   │   ├── favorites.vue
│   └── index.vue
│   ├── plugins/
│   ├── utils/
│   ├── App.vue
│   └── main.ts
├── package/               # Build tools
├── index.html
├── uno.config.ts          # UnoCSS config
├── vite.config.ts         # Vite config
└── vite-plugin-gen-nav.ts # Navigation generation plugin
```

## 🚀 Quick Start

### Requirements

- Node.js >= 20.0.0
- pnpm >= 7

### Install Dependencies

```bash
pnpm install
```

### Development Server

```bash
pnpm dev
```

Opens at http://localhost:1022 by default.

### Build for Production

```bash
pnpm build
```

Output goes to the `dist` folder.

### Preview Production Build

```bash
pnpm preview
```

## 📝 Writing Guide

### Creating a New Post

1. Create a file under `public/content/` (`.md`, `.html`, or `.txt`)
2. For Markdown files, use Frontmatter metadata:

```yaml
---
title: My Awesome Post
date: 2025-12-05
cover: /image/pbsh.jpg
desc: A short summary of the article
tags: [Vite, Vue3, UnoCSS, Markdown]
sticky: true    # Optional: pin to top
---

# Title

Your content...
```

### Recommended Folder Structure

```
public/content/
├── 2025/                    # By year
│   └── hello.md
├── Learning/                # By topic
│   ├── Vite-Build-Tool/
│   │   └── advanced-config.md
│   └── Vue-Framework/
│       └── introduction.md
├── Tutorials/
│   └── getting-started.md
└── Notes/
    └── Personal-Thoughts/
        └── on-writing.md
```

## 🎨 Customization

### Site Information

Edit `src/constants/index.ts`:

```ts
export const SITE_CONFIG = {
  icon: 'Pj',
  title: 'Pjfun Blog',
  description: 'A modern personal blog and tech sharing platform',
  author: 'Simon',
  keywords: ['blog', 'tech', 'frontend', 'Vue', 'TypeScript'],
  email: 'pjfun@aliyun.com',
  socialLinks: {
    github: 'https://github.com/LXC-9349/pjfun-blog',
    telegram: 'https://t.me/pjfun_top',
  }
}
```

### Internationalization (i18n)

Translations are also defined in the same file under `I18N_CONFIG`.

## 🔧 Development

- Pages are file-system routed under `src/pages`
- UI components: `src/components/ui`
- Icons: Prefer Iconify (auto-imported), fallback to local SVGs in `src/assets/icons`
- Custom Vite plugin: `vite-plugin-gen-nav.ts` generates navigation automatically
- Styling: Powered by UnoCSS (see `uno.config.ts`)

## 🌐 Deployment

After building (`pnpm build`), deploy the `dist` folder to any static host:

### One-click Deployment

#### Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/LXC-9349/pjfun-blog)

#### Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/LXC-9349/pjfun-blog)

#### Tencent Cloud EdgeOne (Global)
[![Deploy to EdgeOne](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://console.cloud.tencent.com/edgeone/pages/new?template=https://github.com/LXC-9349/pjfun-blog)

#### Cloudflare Pages
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/LXC-9349/pjfun-blog/tree/main)

#### GitHub Pages (via Actions – Recommended)

Just push to `main`, go to Settings → Pages → select "GitHub Actions". Done.

#### Other platforms
Firebase, Azure Static Web Apps, Surge.sh, etc., are all supported.

## 🔍 SEO & RSS

- Full Schema.org structured data
- Open Graph + Twitter Cards
- Auto-generated `/rss.xml`, `/atom.xml`, `/feed.json`

## 📱 PWA

Fully supported — users can "Add to Home Screen" or install as a desktop app.

## 🤝 Contributing

Issues and Pull Requests are very welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

<video controls preload="metadata" style="width: 100%; height: auto; border-radius: 8px;">
  <source src="https://img-baofun.zhhainiao.com/pcwallpaper_ugc/preview/8ded43cfacffefec1c681f99859543cd_preview.mp4" type="video/mp4">
  <source src="https://img-baofun.zhhainiao.com/pcwallpaper_ugc/preview/fd39802e5f1c034fb556b29b3f5c329b_preview.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>