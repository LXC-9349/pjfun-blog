# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**pjfun-blog** is a modern, fully static personal blog built with Vue 3 + Vite. It is a zero-backend SPA that generates all content at build time from Markdown/HTML/TXT/PDF/Word/Excel files placed in `public/content/`. The project serves its own documentation at [pjfun.top](https://pjfun.top).

## Key Design Decisions

1. **Content-driven**: All articles live as files in `public/content/`. The build plugin (`tooling/vite-plugin-gen-nav.ts`) scans them, parses frontmatter (YAML/gray-matter), and generates `nav.json` + `tree.json`.
2. **CDN-first production builds**: Dependencies (Vue, vue-router, highlight.js, pdfjs-dist, mammoth) are externalized and loaded from multiple CDN sources with automatic fallback (`tooling/build_cdn.ts` + `tooling/vite-plugin-cdn.ts`).
3. **Virtual module routing**: `vite-plugin-pages` auto-generates page routes from `src/pages/`. Article detail pages use a catch-all route (`:pathMatch(.*)*`) that resolves content at runtime by fetching `nav.json`.
4. **Client-side content fetching**: Articles are fetched as raw text from the `public/content/` directory at runtime, then rendered through `marked` (Markdown) or `mammoth` (Word) or `pdfjs-dist` (PDF).
5. **Local studio (dev-only)**: `tooling/vite-plugin-studio.ts` serves `/__studio/api/*`, reads/writes `public/content` and `.env` directly, and is excluded from production builds. Shared logic lives in `tooling/content-core.ts` (scan / validate / nav generation) and `tooling/env-config.ts` (`.env` read/write); the CLI reuses the same core.

## UI/UX Features (Current State)

- **Sticky header** with shrink-on-scroll effect (all pages)
- **Page transitions**: fade + translateY between routes (App.vue)
- **Mobile bottom nav** with 4 items (Home/Archive/Favorites/Search), safe-area-aware
- **Dark/light theme** with smooth CSS transition (0.3s)
- **Lenis smooth scroll** used throughout, including anchor navigation
- **Skeleton screens** matching card layout (2-column)
- **Card design**: 16:10 cover → title → excerpt (line-clamp-2) → tags + date + reading time + arrow in single row
- **Sticky badge**: gradient rose→amber pill
- **Right-click context menu** on cards (open in new tab / copy link / toggle favorite)
- **Ctrl+K search modal** with keyboard navigation (↑↓→), search cache
- **Reading progress bar** (top, gradient), auto-saves position
- **Image lightbox** with zoom
- **Code blocks**: language label top-left + copy button top-right, hover reveal
- **Font size toggle**: S/M/L
- **Share modal**: 8 platforms + copy link
- **Table of contents**: scroll-spy with IntersectionObserver, mobile drawer
- **Prev/Next article navigation** + keyboard ← → + mobile touch swipe
- **Tags**: horizontal scrollable pill row
- **Archive page**: timeline design (year badge + vertical line + month dots)
- **Favorites page**: mobile drawer sidebar
- **Local studio (`/studio`, dev only)**: pen entry in the homepage header; searchable article tree; Markdown editor + live preview (both wheel-scrollable via `data-lenis-prevent`); cover upload / paste / drag to `public/img/covers`; PDF/Word/Excel attachments with `.desc.json`; draft box; plain-language commit/push flow with push confirmation; **Site parameters** tab editing whitelisted `.env` keys, with deployment export (`.env` / GitHub Actions YAML / JSON, `STUDIO_TOKEN` excluded)

## Architecture (Build Pipeline)

```
tooling/vite-plugin-gen-nav.ts ──→ nav.json / tree.json
tooling/vite-plugin-studio.ts ──→ /studio + content/config API (dev only)
tooling/content-core.ts ──→ shared scan / validate / nav generation (studio + CLI)
tooling/env-config.ts ──→ read / write .env for site parameters
tooling/vite-plugin-auto-password-hash.ts ──→ SHA256 hash
vite-plugin-external + tooling/vite-plugin-cdn ──→ CDN injection
tooling/vite-plugin-rss.ts ──→ rss.xml / atom.xml / feed.json
tooling/vite-plugin-sitemap.ts ──→ sitemap.xml
vite-plugin-pwa ──→ Service Worker + manifest
vite-plugin-image-optimizer ──→ compressed assets
vite-plugin-html + EJS ──→ index.html with CDN vars
```

## Directory Structure

```
/
├── index.html                    # SPA entry (EJS template with CDN vars)
├── vite.config.ts                # Vite config (plugins, build, CDN, PWA, mime types)
├── uno.config.ts                 # UnoCSS config: keyframes, shortcuts, rules
├── start.bat / start.sh        # One-click launchers (install Node.js when missing)
├── change.md                   # Changelog (newest on top)
├── tooling/                    # All build-time code (Vite plugins + content core)
│   ├── build_cdn.ts              # CDN source config & multi-CDN fallback
│   ├── vite-plugin-cdn.ts        # Replace local JS with CDN scripts
│   ├── vite-plugin-rss.ts        # RSS feed generation
│   ├── vite-plugin-sitemap.ts    # Sitemap XML generation
│   ├── vite-plugin-gen-nav.ts    # Content scan → nav/tree JSON + virtual routes
│   ├── vite-plugin-gen-backgrounds.ts # Background scan / WebP conversion
│   ├── vite-plugin-studio.ts     # Studio API (dev only)
│   ├── vite-plugin-auto-password-hash.ts # SHA256 password hash at build time
│   ├── content-core.ts           # Content scan / validation / nav generation (studio + CLI)
│   ├── content-bus.ts            # Dev-only nav rebuild / silent reload channel
│   └── env-config.ts             # .env reader / writer for studio site parameters
├── deploy/
│   └── nginx.conf                # Nginx site config used by the Dockerfile
├── scripts/
│   ├── setup.mjs                 # One-click setup / start
│   ├── bootstrap-node.ps1        # Portable Node.js downloader (Windows)
│   ├── content-cli.ts            # Content CLI (new / check / publish)
│   ├── generate-encryption-key.cjs  # CLI password hash generator
│   └── worker.js                 # Web worker script
├── src/
│   ├── main.ts                   # App bootstrap: Lenis, theme, i18n, router, PWA, password guard
│   ├── studio/                   # Local studio (dev only): page, editor, preview, settings, publish
│   ├── App.vue                   # Root: router-view + page transition + bottom nav + update notification
│   ├── constants/
│   │   └── index.ts              # SITE_CONFIG, GISCUS_CONFIG, HOT_TAGS, I18N_CONFIG
│   ├── styles/
│   │   └── global.css            # Global styles (scrollbar hide, toc-scrollbar, ease-out-back)
│   ├── pages/
│   │   ├── index.vue             # Home: sticky header, card grid, tag filter, right-click menu, Lenis
│   │   ├── archive.vue           # Timeline: year/month grouped, sticky header
│   │   ├── favorites.vue         # Favorites: card grid, mobile drawer, sticky header
│   │   └── articleDetail.vue     # Article: cover, code blocks, TOC, share, print, keyboard nav, swipe
│   ├── components/
│   │   ├── NavTree.vue           # Recursive nav tree with localStorage persistence
│   │   ├── DocumentViewer.vue    # PDF/Word/Excel viewer wrapper
│   │   ├── GiscusComment.vue     # Giscus comment system
│   │   ├── PasswordProtection.vue  # Password-protected access form
│   │   ├── RecentArticles.vue    # Recent articles sidebar
│   │   ├── Footer.vue            # Footer with Buzuanzi stats
│   │   ├── preview/
│   │   │   ├── PdfToHtml.vue     # PDF renderer (canvas-based, pdfjs-dist)
│   │   │   └── Excel.vue         # Excel renderer (Luckysheet)
│   │   └── ui/
│   │       ├── SearchModal.vue   # Ctrl+K search modal
│   │       ├── ShareModal.vue    # Share modal (8 platforms)
│   │       ├── ThemeToggle.vue   # Dark/light toggle
│   │       ├── IconComponent.vue # Local SVG icon wrapper
│   │       └── MarqueeNotice.vue # Marquee notice bar
│   ├── utils/
│   │   ├── tool.ts               # Env vars, dialog, toast, formatDate, fetchWithFallback
│   │   ├── password.ts           # SHA256 verification
│   │   ├── favorites.ts          # LocalStorage favorites CRUD
│   │   ├── reading-progress.ts   # Progress + recent articles (array-based)
│   │   ├── document-convert.ts   # Word-to-HTML via mammoth
│   │   ├── version-check.ts      # Version polling for update notification
│   │   └── i18n.ts              # Internationalization
│   ├── plugins/
│   │   └── seo.ts                # SEO meta tag management
│   ├── assets/icons/             # SVG icons (qq, telegram, weibo, x)
│   ├── github-markdown.css       # GitHub-style Markdown CSS + dark theme enhancements
│   └── *.d.ts                    # Type declarations
├── public/
│   ├── content/                  # Article files (md, html, txt, pdf, doc, docx, xls, xlsx)
│   ├── generated/                # Auto-generated: nav.json, tree.json
│   ├── favicon.ico               # Site icon (served at /favicon.ico)
│   ├── img/                      # Static images (covers, PWA icons); covers/ for studio uploads
│   └── pj_public.js             # CDN loading orchestration
└── dist/                         # Build output (includes rss.xml, atom.xml, feed.json, sitemap.xml)
```

## Common Commands

```bash
start.bat / bash start.sh   # One-click: install Node.js if missing + deps + .env + dev server
pnpm bootstrap  # One-click setup: deps + .env + drafts folder
pnpm start      # One-click setup + dev server
pnpm install    # Install dependencies
pnpm dev        # Start dev server (http://localhost:1022)
pnpm build      # Production build
pnpm preview    # Preview production build
pnpm content:new "Title" --dir 前端开发 --draft   # Create a post
pnpm content:check                              # Validate content
pnpm content:publish _drafts/foo.md --dir 前端开发  # Publish a draft
pnpm gen:encrypt-key  # Generate password hash
```

## Environment Variables

See `.env.example` for all options. Key variables:

`VITE_BASE`, `VITE_SITE_TITLE`, `VITE_SITE_ICON`, `BLOG_PASSWORD` (not `VITE_` prefixed), `VITE_BLOG_PASSWORD_HASH`, `VITE_GISCUS_*`, `VITE_SOCIAL_*`, `VITE_HOT_TAGS`, `VITE_SITE_URL` (for RSS/sitemap)

## Content Rendering Pipeline

For a Markdown article at `/content/学习/Vue框架/vue3.md`:

0. Studio save → `tooling/vite-plugin-studio.ts` writes the file → `contentBus` regenerates nav → dev watcher mutes full reload so the editor is not interrupted
1. `buildStart` → scan file → extract frontmatter → `nav.json`
2. Route match → `articleDetail.vue` `loadArticle()` fires
3. Fetch `nav.json` → match by `path` → get `url`
4. Fetch raw content with cache-busting timestamp
5. Strip frontmatter → `marked` parse (custom Renderer for `target="_blank"`)
6. `DOMPurify` sanitize (allows onclick, style, custom tags)
7. `highlight.js` on `<pre><code>` blocks
8. Add copy button + language label to code blocks
9. Generate TOC from heading IDs
10. Restore reading progress after 300ms

## State Management (All localStorage)

- **Favorites**: `pjfun_blog_favorites`
- **Reading progress**: `pjfun_blog_reading_progress` (array, 20 max)
- **Recent articles**: `pjfun_blog_recent_articles` (array, 5 max)
- **Theme**: `theme` + `data-theme` on `<html>`
- **Password**: `blog-access-pwd`
- **Language**: `language`
- **Nav tree**: `pjfun_blog_nav_tree_state`
- **Search cache**: `pjfun_blog_search_cache`
- **Nav data cache**: `pjfun_blog_nav_data_cache`
- **Studio token**: `pjfun_studio_token`
- **Studio draft cache**: `pjfun_studio_draft:<file>` (unsaved editor content)

## Known Design Patterns

- All routes use `safe-area-inset-bottom` for notched phones
- Footer padding: `calc(4rem + env(safe-area-inset-bottom, 0px))` on mobile, `lg:pb-0` on desktop
- Theme transition via `html, html * { transition: background-color 0.3s ease, ... }` in github-markdown.css
- Lenis scrollTo() used instead of window.scrollTo in all components
- Search modal uses custom events (`open-search-modal`)
- Custom `fetchWithFallback` for redundant URL fallback (nav.json timestamped name → fallback to nav.json)
- Nav tree persistence via `data-nav-path` attribute + DOM query on mount

## Key Dependencies

vue@3.5, vue-router@4, vite@7, marked@17, mammoth, pdfjs-dist, crypto-js, dompurify, highlight.js, lenis, vue3-toastify, @vueuse/core, @vueuse/motion, giscus, feed, unocss

## Notes

- No test framework configured for UI; `vitest` is available for focused unit tests
- No linter configured at project level
- `tooling/vite-plugin-rss.ts` and `tooling/vite-plugin-sitemap.ts` are enabled (build-time only)
- Build-time code lives in `tooling/` (Vite plugins + content core); do not add new plugins back to the repository root
- Studio is registered only under `import.meta.env.DEV`; production `/studio` redirects to `/`, and the production bundle contains no studio code
- Studio UI scroll containers must keep `data-lenis-prevent` because Lenis owns the wheel globally
- Static RSS feed and sitemap are generated in `dist/` on build
- Cloudflare Workers builds must use build command `npm run build` and deploy command `pnpm exec wrangler deploy`; `wrangler.jsonc` points the entry to `scripts/worker.js` and assets to `./dist`
- Every notable change is recorded in the root `change.md` (newest entry on top, sections: 新增 / 优化 / 修复 / 文档 / 依赖 / 验证)
