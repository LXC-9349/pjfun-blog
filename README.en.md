# PJ Blog - A Zero-Backend, Fully Static Blog System

<div align="center">

  <img src="https://img.shields.io/badge/Vue-3.5-brightgreen" alt="Vue Version">
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-7-purple" alt="Vite">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
  <a href="https://zread.ai/LXC-9349/pjfun-blog">
    <img src="https://img.shields.io/badge/Ask_Zread-_.svg?style=flat&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff" alt="Ask Zread">
  </a>

  <p>
    <a href="README.md">简体中文</a> | <a href="README.en.md">English</a> | <a href="https://pjfun.top">Live Demo</a>
  </p>
</div>


## 🌟 Introduction

PJ Blog is a **zero-backend, fully static, animation-rich, globally fast** personal blog system. Articles live as plain files under `public/content`; a build plugin scans them into navigation data, and the SPA fetches and renders content on demand. No database, no server — deploy the `dist` folder to any static host and you are online.

It is more than a writer's tool: it ships with a theme panel (background / font / accent / cursor / petal effects), a fullscreen screensaver (local MP4 and Bilibili videos), RSS and sitemap generation, PWA offline support, Giscus comments, Busuanzi statistics, and a build-version guard against CDN staleness.

- Live demo: <https://pjfun.top>
- 中文文档：[README.md](README.md)
- In-site full manual (writing / configuration / deployment): `public/content/2025/blog.md`
- Changelog: [change.md](change.md)

## ✨ Features

### Content and formats

- **Multi-format documents** — Markdown / HTML / TXT / PDF / Word / Excel
- **Markdown enhancements** — YAML frontmatter, GFM heading anchors, code highlighting, tables
- **Metadata for non-Markdown files** — sibling `.desc.json` / `.desc.yaml` for title, cover and tags
- **Generated navigation tree** — `nav.json` / `tree.json` produced at build time
- **Sticky posts and tags** — `sticky` flag, tag filtering, auto-ranked hot tags
- **Draft exclusion** — files or folders starting with `_` are skipped

### Appearance and motion

- **Theme settings panel** — background, font, accent color, cursor, page effects, screensaver
- **13 fonts** — system fonts plus 10 online Chinese webfonts (jsdmirror primary, unpkg fallback)
- **Live accent tuning** — HSL sliders plus 6 presets, applied across the whole color scale
- **Background system** — auto-scanned `public/bg`, cross-fading layers, auto rotation, Ken Burns, overlay opacity
- **Petal effects** — ginkgo / sakura / maple / plum / feather / star, multi-select, adjustable count and speed, click-to-spawn glowing particles
- **Screensaver** — fullscreen video or photo playback, Bilibili support, mute / pause / images-only toggle, ESC to exit

### Reading and interaction

- **Ctrl+K search** — matches title, excerpt and tags, keyboard navigation
- **Reading progress** — top progress bar, scroll position memory, recently viewed list
- **Table of contents** — scroll-spy highlighting via IntersectionObserver
- **Code blocks** — language label and one-click copy
- **Image lightbox** — click to zoom
- **Previous / next article** — buttons, arrow keys, mobile swipe
- **Share panel** — WeChat QR, Weibo, QQ, X, Facebook, LinkedIn, Telegram, email
- **Archive timeline** — year badges with month dots
- **Favorites** — stored locally, mobile drawer layout

### Site capabilities

- **i18n** — one-click Chinese / English switch
- **Giscus comments** — powered by GitHub Discussions
- **Password protection** — build-time PBKDF2-SHA256 (100k iterations, random salt)
- **PWA** — installable, offline fallback, network-first for data
- **SEO** — structured data, Open Graph, Twitter Cards, `sitemap.xml`
- **RSS** — `rss.xml`, `atom.xml`, `feed.json` generated at build time
- **Site statistics** — Busuanzi visitor/page views plus a ping0 visitor card
- **Version guard** — `version.json` comparison and polling refresh prompt
- **Data manager** — open StackBlitz / GitHub.dev / VSCode.dev / Bolt.new in one click

## 🚀 Tech Stack

| Category | Technology |
| --- | --- |
| Framework | Vue 3.5 + TypeScript 5.9 |
| Build | Vite 7 + UnoCSS 66 (presetWind3) |
| Routing | Vue Router 4 + vite-plugin-pages (file-system routes) |
| Markdown | Marked 17 + marked-gfm-heading-id + DOMPurify |
| Highlighting | highlight.js 11 (lazy loaded) |
| Document rendering | pdfjs-dist (PDF), mammoth (Word), Luckysheet + LuckyExcel (Excel, via CDN) |
| Scrolling and motion | Lenis, @vueuse/motion, @vueuse/core |
| Icons | Iconify Carbon (on demand) + local SVG sprite |
| Comments and feeds | Giscus, feed |
| PWA and optimization | vite-plugin-pwa, vite-plugin-image-optimizer, sharp |
| Quality | ESLint 10, Prettier 3, Vitest 4, vue-tsc |

## 🏗️ How It Works

**Build time** (`pnpm build`):

```
scan public/content ──→ nav-version-<ver>.json / tree-version-<ver>.json
scan public/bg      ──→ bg/backgrounds.json (jpg/png converted to WebP)
BLOG_PASSWORD  ──→ PBKDF2 hash (plaintext never shipped)
externalize deps    ──→ vue / vue-router with multi-CDN fallback
site + article data ──→ rss.xml / atom.xml / feed.json / sitemap.xml
build version       ──→ __APP_VERSION__, version.json, sw-<ver>.js
```

**Runtime**:

1. `vite-plugin-pages` generates `/`, `/archive`, `/favorites`; every other path is handled by `articleDetail.vue`
2. The article page loads navigation data, resolves the file URL by path, then fetches the raw file (URLs carry the build version, which avoids stale caches)
3. Markdown is parsed by `marked`, sanitized by `DOMPurify` and highlighted by `highlight.js`; PDF / Word / Excel use dedicated preview components

## ⚡ Quick Start

### Requirements

- Node.js ≥ 20 (CI uses Node 20)
- pnpm (the repository ships a `pnpm-lock.yaml`)

### One-click launch (installs Node.js too)

| OS | How |
| --- | --- |
| Windows | Double-click `start.bat` in the repository root (or run `start.bat`) |
| Linux / macOS | Run `bash start.sh` (optionally `chmod +x start.sh` first) |

The launcher checks Node.js (downloading a portable build into `.tools/` when missing — **no admin / sudo required**), checks pnpm (falls back to corepack, then `npm install -g pnpm`), installs dependencies, creates `.env` from `.env.example`, prepares the drafts folder and starts the dev server at <http://localhost:1022/>.

```bash
# Windows
start.bat            # set up and start
start.bat check      # only check the environment, write nothing
start.bat setup      # only prepare the environment
start.bat build      # prepare + production build

# Linux / macOS
bash start.sh            # set up and start
bash start.sh check      # only check the environment
bash start.sh setup      # only prepare the environment
bash start.sh build      # prepare + production build
PJ_NODE_VERSION=22.14.0 bash start.sh   # pin the Node.js version to install
```

Notes:

- Node.js `22.14.0` (LTS) is installed by default, trying npmmirror first and nodejs.org as a fallback; override with `PJ_NODE_VERSION`
- `.tools/` is git-ignored, so downloaded runtimes never pollute the repository
- Machines that already have Node.js / pnpm reuse them and skip every download

### Install and run

```bash
# Install dependencies
pnpm install

# One-click setup: dependencies -> .env -> drafts
pnpm bootstrap

# Setup and start the dev server in one go
pnpm start

# Or start directly once the environment is ready
pnpm dev

# Production build: type check first, output to dist/
pnpm build

# Preview the build locally
pnpm preview
```

> Open <http://localhost:1022/> after starting. The pen button in the homepage header opens the studio at `/studio` (development only).

### Scripts

| Command | Description |
| --- | --- |
| `start.bat` / `bash start.sh` | System-level one-click launch (installs Node.js as well) |
| `pnpm start` | One-click setup + dev server |
| `pnpm bootstrap` | One-click setup (dependencies + `.env` + drafts folder) |
| `pnpm dev` | Start the dev server |
| `pnpm build` | `vue-tsc -b` type check + production build |
| `pnpm preview` | Preview `dist` |
| `pnpm content:new` | Create an article (`--dir / --tags / --draft`) |
| `pnpm content:check` | Validate articles, attachments and route conflicts |
| `pnpm content:publish` | Publish a draft into a category |
| `pnpm lint` / `pnpm lint:check` | ESLint with / without auto-fix |
| `pnpm format` / `pnpm format:check` | Prettier write / check |
| `pnpm test` / `pnpm test:run` | Vitest watch / single run |

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and edit (or let `pnpm bootstrap` do it). Priority: **system environment variables > `.env.*` files > defaults in `src/constants`**. Frequently changed values can also be edited in the studio under **Site parameters**.

### Build and site

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_BASE` | `/` | Deployment base path; must match a sub-path deploy (e.g. `/pjfun-blog/`) |
| `VITE_APP_VERSION` | empty | Semantic version shown in the footer; empty falls back to the build date |
| `VITE_SITE_ICON` | `Pj` | First character used as the logo |
| `VITE_SITE_TITLE` | `Pjfun Blog` | Site title (tab, PWA) |
| `VITE_SITE_DESCRIPTION` | see `.env.example` | SEO and PWA description |
| `VITE_SITE_AUTHOR` | `Simon` | Author |
| `VITE_SITE_KEYWORDS` | see `.env.example` | SEO keywords, comma-separated |
| `VITE_SITE_EMAIL` | `admin@pjfun.com` | Footer email |
| `VITE_SITE_URL` | `https://pjfun.top` | Canonical domain for RSS / sitemap / structured data |

### Copy and links

| Variable | Description |
| --- | --- |
| `VITE_LOADING_TEXT` | First-paint loading text |
| `VITE_JS_DISABLED_NOTICE` | `<noscript>` message |
| `VITE_RESOURCE_LOAD_FAILED_TEXT` | CDN resource failure message |
| `VITE_REFRESH_REQUIRED_TEXT` | Refresh-required message |
| `VITE_SOCIAL_GITHUB` | GitHub repository; also parsed into owner/repo for the online editor |
| `VITE_SOCIAL_TELEGRAM` | Telegram link |
| `VITE_FOOT_GITHUB` | Footer GitHub link |
| `VITE_HOT_RANK_URL` | Homepage "Hot news" entry |

### Comments, statistics and tags

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_GISCUS_ENABLED` | `true` | Enable comments |
| `VITE_GISCUS_REPO` / `VITE_GISCUS_REPO_ID` | see `.env.example` | Comment repository and ID |
| `VITE_GISCUS_CATEGORY` / `VITE_GISCUS_CATEGORY_ID` | see `.env.example` | Discussion category |
| `VITE_GISCUS_MAPPING` | `pathname` | Thread mapping method |
| `VITE_GISCUS_STRICT` / `REACTIONS` / `METADATA` | `false` / `true` / `false` | Strict matching, reactions, metadata |
| `VITE_GISCUS_POSITION` / `VITE_GISCUS_LANG` | `top` / `zh-CN` | Input position and language |
| `VITE_BUSUANZI_ENDPOINT` | official endpoint | Busuanzi statistics endpoint |
| `VITE_PING0_IMAGE_URL` | `https://ping0.cc/img1` | Visitor info image |
| `VITE_HOT_TAGS` | empty | Manual hot tags; empty auto-generates by frequency |
| `VITE_HOT_TAGS_LIMIT` | `12` | Auto-generation limit |

### Appearance defaults

The `VITE_DEFAULT_*` group controls the **first-visit** appearance: background, font, cursor, accent color (HSL), background rotation, Ken Burns, overlay opacity, and petal effect type / count / speed / z-index. User settings stored in the browser take precedence and can be changed anytime in the theme panel.

See [.env.example](.env.example) for the full key list and value ranges.

## 🎛️ System Parameters

Beyond environment variables, site behavior is centralized in `src/constants` (`index.ts` is export-only). Rebuild after changing them.

| File | Contents |
| --- | --- |
| `site.ts` | Site info, Giscus, statistics endpoints, hot-rank entry |
| `appearance.ts` | `APPEARANCE_DEFAULTS`, `APPEARANCE_LIMITS`, font list, accent presets, cursor presets, font CDN |
| `screensaver.ts` | Rotation interval, fullscreen flag, video sources (MP4 / Bilibili BV), timeouts and retries |
| `home.ts` | Page size 12, scroll thresholds, minimum background rotation interval, load cooldown |
| `search.ts` | 5-minute cache, max 10 results, 180 ms debounce |
| `article.ts` | Progress throttle 3 s, swipe threshold 60 px, TOC delay 200 ms |
| `ui.ts` | Dialog z-index, toast durations, scrollbar hide delay, scroll-to-top duration |
| `effects.ts` | Mouse avoidance radius, glowing particle cap, click spawn count, DPR cap |
| `preview.ts` | Luckysheet / LuckyExcel / jQuery versions, PDF worker mirrors |
| `security.ts` | PBKDF2 iteration count and key length |
| `bilibili.ts` | Proxy base, parse API, timeout, direct-link cache |
| `misc.ts` | Hot tag limit, 245 s version polling, 30-minute snooze |
| `storage.ts` | Every localStorage key and list size limit |
| `i18n.ts` | Chinese / English copy |

The in-site article `public/content/2025/blog.md` mirrors everything in this README (introduction, quick start, writing with the studio, deployment) and documents every default, range and tuning note.

## ✍️ Content Management

### Local studio (development only)

A visual writing studio ships with the dev server: use the pen button in the homepage header or open <http://localhost:1022/studio>. It only exists under `pnpm dev`; the production build contains no studio code.

- **Three-column workspace** — searchable article tree and draft box / Markdown editor with live preview / article settings and publishing
- **Create** — the title is converted into a pinyin slug; type a new category to create it; drafts live in `public/content/_drafts` and are ignored at build time
- **Cover** — click to upload, paste with `Ctrl+V`, or drop an image; files are stored in `public/img/covers/`
- **Inline images** — pasted screenshots are saved to `public/content/<category>/<slug>/` and inserted automatically
- **Attachments** — upload PDF / Word / Excel and a sibling `.desc.json` is generated
- **Instant feedback** — saving rebuilds navigation data in dev, so the homepage, archive and search update without a restart
- **Publish** — “Save version” runs `git commit`; “Publish online” runs `git push` after an explicit confirmation
- **Site parameters** — edit common environment variables (site info, social links, appearance defaults, Giscus, security) from the top tab; saved to the local `.env` and applied after the automatic restart
- **Deployment export** — the local `.env` is never committed; use “Export deployment config” to generate `.env` / GitHub Actions YAML / JSON plus setup notes for Vercel, EdgeOne, Netlify and Docker

CLI equivalents:

```bash
pnpm content:new "My article" --dir frontend --tags Vue,TypeScript
pnpm content:check
pnpm content:publish _drafts/my-article.md --dir frontend
```

### Supported formats

| Format | Extension | Metadata |
| --- | --- | --- |
| Markdown | `.md` | YAML frontmatter |
| HTML | `.html` | `.desc.json` / `.desc.yaml`, or `<title>` and `<meta name="description">` |
| Plain text | `.txt` | `.desc.json` / `.desc.yaml`; first line becomes the title |
| PDF | `.pdf` | `.desc.json` / `.desc.yaml` |
| Word | `.docx` | `.desc.json` / `.desc.yaml` |
| Excel | `.xlsx` | `.desc.json` / `.desc.yaml` |

### Markdown frontmatter

```markdown
---
title: Article title
date: 2025-12-05
cover: /img/d1.webp
desc: Excerpt shown on the homepage card
tags: [Vue, TypeScript, Tutorial]
sticky: true
---

Body starts here.
```

| Field | Required | Notes |
| --- | --- | --- |
| `title` | No | Falls back to the file name |
| `date` | No | Falls back to the file mtime |
| `cover` | No | Cover path; empty falls back to a built-in placeholder per format |
| `desc` | No | Excerpt; falls back to the first 120 characters of the body |
| `tags` | No | Tag array |
| `sticky` | No | `true` pins the post |

### Metadata for non-Markdown files

Create a sibling file with the same name, e.g. `sample.pdf` → `sample.pdf.desc.json`:

```json
{
  "title": "Sample PDF document",
  "date": "2025-12-19",
  "cover": "/img/d5.webp",
  "tags": ["PDF", "Reading"],
  "excerpt": "Excerpt shown on the homepage card",
  "sticky": false
}
```

> Note: the excerpt field for non-Markdown files is `excerpt` (Markdown uses `desc`).

### Directory layout

```
public/content/
├── 2025/
│   ├── blog.md
│   ├── pdf/     example.pdf + example.pdf.desc.json
│   ├── word/    example.docx
│   └── excel/   example.xlsx
├── frontend/
│   ├── vue3-reactivity-deep-dive.md
│   └── typescript-advanced-patterns.md
└── notes/
    └── reading-notes.md
```

- Folder depth becomes the navigation tree; 3 levels or fewer is recommended
- The file name becomes the route (`/frontend/vue3-reactivity-deep-dive`); date and cover come from metadata
- Files or folders starting with `_` are ignored at build time — handy for drafts
- Deleting or renaming an article only requires a rebuild; navigation data is regenerated every build

### Images

- Shared images: `public/img/`, referenced as `/img/d1.webp`
- Uploaded covers: `public/img/covers/`, referenced as `/img/covers/xxx.png`
- Article-specific images: a folder next to the article, referenced as `/content/2025/my-article/a.png`
- Backgrounds: `public/bg/`, auto-scanned and converted to WebP at build time (max width 1920, quality 82); no manifest to maintain

## 🌈 Theme and Screensaver

Open the theme panel from the button in the top-right corner of the homepage:

| Group | Options |
| --- | --- |
| Background | Pick a `public/bg` image, overlay opacity, auto rotation and interval, slow zoom |
| Font | System default / serif / kai plus 10 online Chinese fonts, with preview and fallback |
| Accent | 6 presets plus hue / saturation / lightness sliders, applied site-wide |
| Effects | Petal types (multi-select), count, rotation / horizontal / vertical speed, swing, z-index |
| Cursor | System, arrow, dot, ring, target, crosshair |
| Screensaver | Launch fullscreen screensaver, plus config and effect hints |

The screensaver plays video by default (direct MP4 and Bilibili BV numbers configured in `src/constants/screensaver.ts`). Inside the screensaver you can toggle images-only, mute, pause, jump to the next item, and exit with ESC or the close button. Failed videos are skipped and retried; Bilibili proxy failures fall back to a third-party direct-link resolver.

Personalization is stored in `localStorage` (`pjfun_blog_appearance`) and never affects other visitors.

## 🔐 Password Protection

Pick one of two options:

```env
# Option 1 (recommended): plaintext password, hashed with PBKDF2-SHA256 at build time
# (100,000 iterations, 128-bit random salt)
# Do NOT use the VITE_ prefix, otherwise Vite will bundle the plaintext into the client output.
BLOG_PASSWORD=your_password

# Option 2: provide a precomputed hash
# PBKDF2 format: iterations$salt_base64$hash_base64
# Legacy 64-character SHA256 hex is also supported
VITE_BLOG_PASSWORD_HASH=your_hash
```

- `BLOG_PASSWORD` wins and overrides `VITE_BLOG_PASSWORD_HASH`
- Legacy `VITE_BLOG_PASSWORD` is still accepted but stripped from the client env; prefer `BLOG_PASSWORD`
- Leaving both empty disables protection
- When enabled, unauthenticated visits are redirected to `/password` and sent back after verification
- Generate a legacy SHA256 hash with `node scripts/generate-password-hash.js <password>`
- This is a client-side gate for personal sites; use server-side auth for high-security needs

## 💬 Comments

Comments are provided by Giscus (GitHub Discussions). Get the configuration from [giscus.app](https://giscus.app) and fill in the `VITE_GISCUS_*` variables. Set `VITE_GISCUS_ENABLED=false` to disable comments entirely.

## 🧱 Build Output and Caching Strategy

The project is built for static hosting behind CDNs:

- **Single build version** — `PJ_BUILD_VERSION` (ms timestamp) is injected into `__APP_VERSION__`, `version.json` and `sw-<ver>.js`
- **Versioned data files** — navigation output is `nav-version-<ver>.json` / `tree-version-<ver>.json`, so every release gets new URLs
- **Entry version guard** — an inline script compares `version.json` and reloads with a version query when the entry HTML is stale (`sessionStorage` prevents loops)
- **Runtime polling** — checks every 245 s and offers "Update now / Remind me later (30 min)"
- **PWA strategy** — inline registration; `index.html`, `bg/`, `img/` and heavy vendor chunks are not precached; `navigateFallback` is disabled
- **Runtime caching** — navigation JSON and article content use NetworkFirst; images use CacheFirst (30 days)
- **CDN externals** — production builds externalize `vue` and `vue-router` with jsdelivr → unpkg → esm.sh and several mirrors; disabled in dev
- **Code splitting** — Markdown parsing, highlight.js, pdfjs-dist and mammoth each get their own chunk and stay out of the first screen
- **Image optimization** — `vite-plugin-image-optimizer` compresses assets; backgrounds become WebP and the originals are removed

## 🚀 Deployment

`dist/` contains `index.html`, `static/`, `content/`, `bg/`, `rss.xml`, `atom.xml`, `feed.json`, `sitemap.xml`, `version.json` and `sw-<ver>.js`.

| Platform | How | Notes |
| --- | --- | --- |
| Vercel | [Deploy](https://vercel.com/new/clone?repository-url=https://github.com/LXC-9349/pjfun-blog) | Demo: <https://pjfun-blog.vercel.app/> |
| EdgeOne Pages (China) | [Deploy](https://console.cloud.tencent.com/edgeone/pages/new?template=https://github.com/LXC-9349/pjfun-blog) | Demo: <https://blog.pjfun.top/> |
| EdgeOne Pages (Global) | [Deploy](https://console.tencentcloud.com/edgeone/pages/new?template=https://github.com/LXC-9349/pjfun-blog) | `esa.jsonc` enables SPA fallback |
| Cloudflare Workers | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/LXC-9349/pjfun-blog/tree/main) | Build `npm run build`, deploy `pnpm exec wrangler deploy` |
| Netlify | [Deploy](https://app.netlify.com/start/deploy?repository=https://github.com/LXC-9349/pjfun-blog) | `netlify.toml` defines the build |
| GitHub Pages | Push to `main` | `.github/workflows/deploy.yml`; set `VITE_BASE` |
| Docker / Nginx | `docker build` + `deploy/nginx.conf` | See below |

### GitHub Pages

The workflow sets `VITE_BASE: /pjfun-blog/`. If you rename the repository, update this value too — otherwise assets 404 and the page stays blank. Set Settings → Pages → Source to **GitHub Actions**.

### Cloudflare Workers

In the Cloudflare dashboard (Workers & Pages → Create → import a Git repository), fill in the table below — **do not keep the default deploy command**:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `pnpm exec wrangler deploy` |

- Build with `npm`: it matches how the build environment installs dependencies, avoiding failures from `pnpm` not being ready or version drift
- Deploy with `pnpm exec wrangler`: it runs the `wrangler` from `devDependencies`, so the version matches your local one instead of a throwaway install
- `wrangler.jsonc` already sets `scripts/worker.js` as the entry and `dist` as the asset directory — no output directory needed
- Configure environment variables under the Worker's “Variables and Secrets”; keep `VITE_BASE` at `/`

### Docker

```bash
# .env is copied into the build context at build time; the runtime container only serves static files
docker build -t pjfun-blog .
docker run -d --restart=always --name blog -p 1022:80 pjfun-blog

# or with compose
docker compose up -d
```

The image is Nginx-based; `deploy/nginx.conf` already handles SPA fallback and static asset caching. Re-run `docker build` after changing `.env`.

## 📁 Project Structure

```
pjfun-blog/
├── public/
│   ├── bg/                     # Backgrounds; scanned and converted to WebP at build time
│   ├── content/                # All articles and documents (_drafts for drafts)
│   ├── generated/              # nav.json / tree.json (versioned file names)
│   ├── img/                    # Shared images and PWA icons; covers/ for studio uploads
│   ├── favicon.ico             # Site icon (browser default /favicon.ico request)
│   ├── 404.html
│   └── pj_public.js            # CDN loading with fallback
├── src/
│   ├── studio/                 # Local studio: page, editor, preview, settings and publish panels
│   ├── components/
│   │   ├── ui/                 # Search, share, theme panel, screensaver, petals, theme toggle
│   │   ├── preview/            # PDF / Excel preview
│   │   ├── DocumentViewer.vue  # Format dispatcher
│   │   ├── NavTree.vue         # Navigation tree
│   │   ├── Footer.vue          # Footer (version, statistics, data manager)
│   │   ├── GiscusComment.vue
│   │   ├── PasswordProtection.vue
│   │   ├── SiteStats.vue
│   │   ├── Ping0VisitorCard.vue
│   │   ├── HotTagList.vue
│   │   ├── HotRankLink.vue
│   │   └── RecentArticles.vue
│   ├── constants/              # All configuration constants, split by concern
│   ├── pages/                  # Home, archive, favorites, article detail
│   ├── plugins/seo.ts
│   ├── utils/                  # Appearance, password, Bilibili, stats, version check, conversion
│   ├── styles/global.css
│   ├── App.vue                 # Page transitions, mobile nav, update prompt
│   └── main.ts                 # Lenis, theme, i18n, router guards, password check
├── tooling/
│   ├── build_cdn.ts            # CDN sources and externals
│   ├── vite-plugin-cdn.ts      # CDN injection
│   ├── vite-plugin-rss.ts      # RSS / Atom / JSON Feed
│   ├── vite-plugin-sitemap.ts  # sitemap.xml
│   ├── vite-plugin-gen-nav.ts  # Content scan → navigation data + catch-all route
│   ├── vite-plugin-gen-backgrounds.ts # Background scan / WebP conversion
│   ├── vite-plugin-studio.ts   # Studio API (dev only)
│   ├── vite-plugin-auto-password-hash.ts # Build-time PBKDF2
│   ├── content-core.ts         # Scanning, validation, I/O and navigation data (studio + CLI)
│   ├── content-bus.ts          # Dev-only navigation rebuild / silent reload channel
│   └── env-config.ts           # .env reader / writer for studio site parameters
├── scripts/
│   ├── setup.mjs               # One-click setup / start
│   ├── bootstrap-node.ps1      # Portable Node.js downloader for Windows
│   ├── content-cli.ts          # Content CLI (new / check / publish)
│   ├── generate-password-hash.js
│   └── worker.js               # Cloudflare Workers entry
├── deploy/
│   └── nginx.conf              # Nginx site config (referenced by the Dockerfile)
├── start.bat / start.sh        # One-click launchers
├── change.md                   # Changelog
├── Dockerfile / docker-compose.yml
├── netlify.toml / wrangler.jsonc / esa.jsonc
└── vite.config.ts / uno.config.ts / vitest.config.ts
```

## ❓ FAQ

**An article is missing from the list.**
Make sure it is under `public/content`, uses a supported extension and has valid metadata. Files starting with `_` are ignored. Saving from the studio rebuilds navigation automatically; for manual edits run `pnpm dev` or `pnpm build`.

**The studio does not open.**
The studio is development-only: run `pnpm dev` and open `/studio`; in production `/studio` redirects to the homepage. LAN access requires `STUDIO_TOKEN` in `.env` and the same token in the page.

**Site parameters did not take effect.**
They are written to the local `.env` and the dev server restarts automatically — refresh the page. Hosting platforms (Vercel / EdgeOne / GitHub Pages) do not read your local `.env`; use “Export deployment config” in the site parameters tab and copy the generated variables into the platform.

**The cover does not render.**
Paths must start with `/` (relative to `public`) or be absolute URLs. On sub-path deployments, relative covers are prefixed with `VITE_BASE` automatically.

**Blank page after deploying to a sub-path.**
`VITE_BASE` must match the public path (e.g. `/pjfun-blog/`). Rebuild after changing it.

**The site still serves an old page after a release.**
Versioned file names, the `version.json` guard and the PWA strategy are designed to prevent this. If it persists, check whether the host caches `index.html` aggressively and whether `sw-<ver>.js` updates correctly.

**Password protection does not work.**
Confirm the variable reaches the build (CI needs secrets/variables) and that no stale `VITE_BLOG_PASSWORD_HASH` remains. Use `BLOG_PASSWORD` (without the `VITE_` prefix) for plaintext passwords.

**The Cloudflare Workers build fails.**
Check that the build command is `npm run build` and the deploy command is `pnpm exec wrangler deploy`; using `pnpm` to build or `npx` to deploy tends to fail or pull a different `wrangler` version on CI.

**Statistics are missing.**
Busuanzi or ping0 may be unavailable; the UI degrades or hides those blocks without breaking anything. Override the endpoints with `VITE_BUSUANZI_ENDPOINT` and `VITE_PING0_IMAGE_URL`.

**Screensaver videos do not play.**
Some direct links or Bilibili proxies are unstable; failed sources are skipped and retried. Replace them in `src/constants/screensaver.ts`.

## 🤝 Contributing

Issues and pull requests are welcome:

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: ..."`
4. Push the branch and open a pull request

## 📄 License

Released under the [MIT License](LICENSE).

### 👨‍💻 关于作者

如果你对这个项目的实现细节感兴趣，或者想交流技术：

* **个人主页：** [https://pjfun.top](https://pjfun.top)
* **闲鱼主页：** [点击跳转](https://www.goofish.com/personal?userId=863031346) 