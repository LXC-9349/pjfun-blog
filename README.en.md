# PJ Blog - A Modern Personal Blog System

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
        <a target="_blank" href="https://github.com/LXC-9349/pjfun-blog/blob/main/README.md">简体中文</a> | <a href="https://github.com/LXC-9349/pjfun-blog/blob/main/README.en.md" target="_blank">English</a> | <a target="_blank" href="https://pjfun.top">Homepage</a>
    </p>
</div>

[![zread](https://img.shields.io/badge/Ask_Zread-_.svg?style=for-the-badge&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/LXC-9349/pjfun-blog)


## 🌟 Introduction

PJ Blog is a zero-backend, purely static, top-tier animated, globally instant-loading modern personal blog system. Built with the latest front-end technology stack, it features responsive design, dark mode, smooth scrolling, rich animations, and many other modern characteristics, allowing you to easily own a high-performance technical blog.

Simply place `.md`, `.html`, `.txt`, PDF, Word, or Excel files in the `public/content` directory → run `pnpm build` → deploy to any static site hosting service, and you’ll have your own top-tier technical blog.

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
- 🌐 **Multi-format Support** – Supports Markdown, HTML, TXT, PDF, Word, and Excel documents

## ⚙️ Environment Variable Configuration

PJ Blog supports customizing site configuration through environment variables, allowing you to personalize your blog without modifying code.

### Site Basic Information

Configure the following variables in `.env` file:

```env
# Site icon (displayed in browser tab)
VITE_SITE_ICON=Pj

# Site title
VITE_SITE_TITLE=My Blog

# Site description (for SEO)
VITE_SITE_DESCRIPTION=A modern personal blog and tech-sharing platform

# Author name
VITE_SITE_AUTHOR=John Doe

# Site keywords (comma-separated, for SEO)
VITE_SITE_KEYWORDS=blog,tech,frontend,Vue,TypeScript

# Contact email
VITE_SITE_EMAIL=your-email@example.com
```

### Social Links

Configure social media links displayed in footer and other locations:

```env
# GitHub repository URL
VITE_SOCIAL_GITHUB=https://github.com/yourusername/your-repo

# Telegram channel
VITE_SOCIAL_TELEGRAM=https://t.me/your-channel
```

### Footer Links

```env
# Footer GitHub link
VITE_FOOT_GITHUB=https://github.com/yourusername/your-repo
```

### Giscus Comment System Configuration

Get your configuration from [giscus.app](https://giscus.app) and set it in `.env` file:

```env
# Enable comment system (true/false)
VITE_GISCUS_ENABLED=true

# GitHub repository (owner/repo)
VITE_GISCUS_REPO=yourusername/your-repo

# Repository ID
VITE_GISCUS_REPO_ID=R_kgDOxxxxxxxxx

# Discussion category
VITE_GISCUS_CATEGORY=Announcements

# Category ID
VITE_GISCUS_CATEGORY_ID=DIC_kwDOxxxxxxxxx

# Mapping method (pathname, url, title, og:title, specific)
VITE_GISCUS_MAPPING=pathname

# Strict matching (true/false)
VITE_GISCUS_STRICT=false

# Enable reactions (true/false)
VITE_GISCUS_REACTIONS=true

# Emit metadata (true/false)
VITE_GISCUS_METADATA=false

# Input position (top, bottom)
VITE_GISCUS_POSITION=top

# Language (zh-CN, en, etc.)
VITE_GISCUS_LANG=en
```

### Hot Tags Configuration

Customize the hot tags list displayed on the homepage (comma-separated):

```env
VITE_HOT_TAGS=Vue,React,Frontend,TypeScript,JavaScript,Node.js
```

### Configuration Priority

Environment variables have higher priority than default values in code:

1. **System environment variables** (highest priority)
2. **.env file**
3. **Code defaults** (lowest priority)

### Usage Examples

**Scenario 1: Quick deployment of your own blog**

Just modify the `.env` file, no code changes needed:

```env
VITE_SITE_TITLE=My Tech Blog
VITE_SITE_AUTHOR=Jane Smith
VITE_SOCIAL_GITHUB=https://github.com/janesmith/my-blog
```

**Scenario 2: Different configurations for different environments**

Create multiple environment files:

- `.env.development` - Development environment config
- `.env.production` - Production environment config
- `.env.staging` - Staging environment config

**Scenario 3: Dynamic configuration in CI/CD**

Set environment variables in GitHub Actions or other CI/CD platforms:

```yaml
# .github/workflows/deploy.yml
env:
  VITE_SITE_TITLE: ${{ secrets.SITE_TITLE }}
  VITE_SITE_AUTHOR: ${{ secrets.SITE_AUTHOR }}
```

### Complete Configuration Example

Check the `.env.example` file for all configurable environment variables and their default values.

## 🔐 Password Protection

The blog supports optional password protection, enabled via environment variables.

### Enable Password Protection

Add the environment variable in `.env` or configure it in your hosting platform:

```env
# Option 1 (Recommended): Set plain text password, SHA256 hash will be auto-generated during build
VITE_BLOG_PASSWORD=your_password_here

# Option 2: Set pre-generated SHA256 hash directly
VITE_BLOG_PASSWORD_HASH=your_sha256_password_hash_here
```

**⚠️ Priority Notice:**
- **`VITE_BLOG_PASSWORD` has higher priority than `VITE_BLOG_PASSWORD_HASH`**
- If both variables are set, the system will prioritize `VITE_BLOG_PASSWORD` and ignore `VITE_BLOG_PASSWORD_HASH`
- It is recommended to use only one method to avoid confusion

### Generate Password Hash

#### Option 1: Auto-generate Hash (Recommended)
Simply set `VITE_BLOG_PASSWORD` to your plain text password in the `.env` file. The SHA256 hash will be automatically generated during the build process.

```env
VITE_BLOG_PASSWORD=your_password_here
```

#### Option 2: Manually Generate Hash
If you need to manually generate the hash, use one of the following methods:

##### Use the built-in script
```bash
node scripts/generate-password-hash.js your_password_here
```
This will output the SHA256 hash that you should put into the `VITE_BLOG_PASSWORD_HASH` variable in `.env`.

##### Use an online tool (only for testing)
Recommended tool: https://www.convertstring.com/en/Hash/SHA256

**Steps:**
1. Visit the site
2. Enter your password
3. Click "Hash"
4. Copy the generated SHA256 hash
5. Set it in your environment variables:

```env
VITE_BLOG_PASSWORD_HASH=your_generated_sha256_hash_here
```

#### Security Warning
⚠️ **Important**: Online tools transmit your password over the network – there is a security risk. Only use them for development/testing. For production, always use the local script or simply use `VITE_BLOG_PASSWORD` to let the system auto-generate the hash.

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
│   └── content/           # Article directory (supports Markdown, HTML, TXT, PDF, Word, Excel)
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
│   ├── styles/            # Global styles
│   ├── utils/             # Utility functions
│   ├── App.vue
│   └── main.ts
├── package/               # Build-related tools
│   ├── vite-plugin-rss.ts      # RSS generation plugin
│   ├── vite-plugin-cdn.ts      # CDN injection plugin
│   └── build_cdn.ts            # CDN source config
├── index.html
├── uno.config.ts          # UnoCSS config
├── vite.config.ts         # Vite config
├── vite-plugin-gen-nav.ts # Navigation generation plugin
└── vite-plugin-auto-password-hash.ts # Password hash plugin
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

1. Create a Markdown, HTML, TXT, PDF, Word, or Excel file under `public/content/`
2. For Markdown files, use the following Frontmatter format (other formats use `.desc.json` or `.desc.yaml` config files):

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
│   ├── hello.md
│   ├── excel/
│   │   └── sample-excel-file.xlsx
│   ├── pdf/
│   │   └── sample-pdf-file.pdf
│   └── word/
│       └── sample-word-file.docx
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

## 📚 Blog Content Management

PJ Blog uses the file system as its content management system. All blog posts and documents are stored in the `public/content` directory. The system supports multiple file formats with flexible metadata configuration.

### Supported File Formats

| Format | Extension | Metadata Configuration | Description |
|--------|-----------|------------------------|-------------|
| Markdown | `.md` | Frontmatter (file header) | Recommended, full metadata support |
| HTML | `.html` |同名 `.desc.json` or `.desc.yaml` | For rich text content |
| Plain Text | `.txt` |同名 `.desc.json` or `.desc.yaml` | Simple text content |
| PDF | `.pdf` |同名 `.desc.json` or `.desc.yaml` | Built-in PDF reader support |
| Word | `.docx` |同名 `.desc.json` or `.desc.yaml` | Auto-converted to HTML |
| Excel | `.xlsx` |同名 `.desc.json` or `.desc.yaml` | Built-in Excel viewer support |

### Markdown File Metadata Configuration

Markdown files use YAML Frontmatter format at the beginning of the file:

```markdown
---
title: Article Title
date: 2025-12-05
cover: /img/d1.webp
desc: Article summary description
tags: [Vite, Vue3, UnoCSS]
sticky: true
---

# Article content starts here

Your Markdown content...
```

#### Metadata Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `title` | String | ✅ | Article title | `"Hello World"` |
| `date` | Date/String | ✅ | Publication date | `2025-12-05` or `"2025-12-05T10:30:00Z"` |
| `cover` | String | ❌ | Cover image path | `/img/cover.jpg` |
| `desc` | String | ❌ | Article excerpt | `"This is an article about..."` |
| `tags` | Array | ❌ | Tag list | `["Vue", "Frontend"]` |
| `sticky` | Boolean | ❌ | Pin to top | `true` or `false` |

### Non-Markdown File Metadata Configuration

For non-Markdown files (PDF, Word, Excel, HTML, TXT), create a configuration file with the same name to set metadata.

#### JSON Format Configuration File

Create a `.desc.json` file with the same name as the document:

**File Structure Example:**
```
public/content/2025/pdf/
├── prophecy.pdf
└── prophecy.pdf.desc.json
```

**JSON Configuration Content:**
```json
{
  "title": "The Prophecy",
  "date": "2025-12-19",
  "cover": "/img/d5.webp",
  "desc": "A book about extraterrestrial civilization",
  "tags": ["PDF", "Reading", "Sci-Fi"],
  "sticky": false
}
```

#### YAML Format Configuration File

You can also use YAML format by creating a `.desc.yaml` file:

```yaml
title: The Prophecy
date: 2025-12-19
cover: /img/d5.webp
desc: A book about extraterrestrial civilization
tags:
  - PDF
  - Reading
  - Sci-Fi
sticky: false
```

### Folder Organization Strategies

#### 1. By Time

Suitable for diaries and logs:

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

#### 2. By Topic

Suitable for technical blogs and knowledge bases:

```
public/content/
├── Frontend/
│   ├── Vue/
│   │   ├── vue3-guide.md
│   │   └── composition-api.md
│   ├── React/
│   │   └── hooks-tutorial.md
│   └── TypeScript/
│       └── advanced-types.md
├── Backend/
│   ├── Node.js/
│   └── Python/
└── DevOps/
    ├── Docker/
    └── Kubernetes/
```

#### 3. Hybrid Classification

Combine time and topics:

```
public/content/
├── 2025/
│   ├── Learning/
│   │   ├── vite.md
│   │   └── vue3.md
│   └── Projects/
│       └── blog-project.md
├── Tutorials/
│   └── getting-started.md
└── Notes/
    └── personal-thoughts.md
```

### Image Resource Management

#### 1. Global Images

Place images in the `public/img` directory and reference via absolute paths:

```markdown
cover: /img/d1.webp
```

#### 2. Article-Specific Images

Create a dedicated image folder for specific articles:

```
public/content/2025/
├── my-article.md
└── my-article-images/
    ├── cover.jpg
    ├── screenshot1.png
    └── screenshot2.png
```

Reference in Markdown:

```markdown
---
cover: /content/2025/my-article-images/cover.jpg
---

![Screenshot 1](/content/2025/my-article-images/screenshot1.png)
```

### Document Management Workflow

#### Adding New Articles

1. **Choose Category**: Select appropriate folder location
2. **Create File**: Create new `.md` or other format file
3. **Write Metadata**: Fill in title, date, tags, etc.
4. **Write Content**: Compose the article body
5. **Add Cover** (optional): Upload cover image and configure path
6. **Preview Locally**: Run `pnpm dev` to see the result
7. **Build & Deploy**: Run `pnpm build` and deploy

#### Updating Articles

1. Directly modify the corresponding file content
2. To change metadata, edit Frontmatter or `.desc.json` file
3. Rebuild: `pnpm build`

#### Deleting Articles

1. Delete the corresponding document file
2. If there are配套 `.desc.json` or image folders, delete them too
3. Rebuild: `pnpm build`

#### Batch Import

You can batch copy existing documents to the appropriate location in `public/content`:

```bash
# Example: Batch import PDF files
cp ~/Downloads/*.pdf public/content/2025/pdf/

# Create metadata config files for each PDF
# You can write a script to auto-generate .desc.json files
```

### Best Practices

#### 1. Naming Conventions

- **Filenames**: Use meaningful names, avoid special characters
- **Folders**: Use short, clear category names
- **Images**: Use descriptive names like `vue3-composition-api.png`

#### 2. Date Format

Recommended ISO 8601 format:

```yaml
date: 2025-12-05              # Simple format
date: 2025-12-05T10:30:00Z    # Full timestamp
```

#### 3. Tag Management

- Keep tag count moderate (3-5 is ideal)
- Use consistent tag naming
- Avoid overly broad or specific tags

```yaml
tags: [Vue, Frontend, Tutorial]     # ✅ Recommended
tags: [a, b, c, d, e, f, g]         # ❌ Too many
tags: [Vue3CompositionAPIWithScriptSetupSyntaxSugar]  # ❌ Too long
```

#### 4. Cover Image Optimization

- Recommended size: 1200x630 pixels (16:9 ratio)
- Format: WebP (preferred), PNG, JPG
- Size: Keep under 500KB
- Use online tools to compress images

#### 5. Content Organization

- Regularly organize and archive old articles
- Keep folder depth to no more than 3 levels
- Maintain clear and consistent directory structure

### Advanced Features

#### 1. Sticky Articles

Set `sticky: true` to pin articles to the top:

```yaml
---
title: Important Announcement
sticky: true
---
```

#### 2. Draft Management

Manage drafts using these methods:

**Method 1**: Use subfolder
```
public/content/
├── drafts/          # Drafts folder
│   └── work-in-progress.md
└── published/       # Published articles
    └── hello.md
```

**Method 2**: Filename prefix
```
public/content/
├── DRAFT-hello.md   # Draft
└── hello.md         # Officially published
```

#### 3. Multi-language Support

Create separate folders for different languages:

```
public/content/
├── zh/              # Chinese content
│   └── hello.md
└── en/              # English content
    └── hello.md
```

### Troubleshooting

#### Article Not Showing

1. Check if the file is in the `public/content` directory
2. Confirm the file format is supported
3. Verify metadata format is correct
4. Re-run `pnpm dev` or `pnpm build`

#### Metadata Not Working

1. Check if JSON/YAML format is correct
2. Confirm config filename matches document filename exactly
3. Check console for parsing errors

#### Images Not Loading

1. Confirm image path is correct
2. Check if image exists in the `public` directory
3. Verify path starts with `/` (absolute path)

## ☁️ Online Content Management

Although PJ Blog is a pure static blog system, you can achieve online content management and synchronization through various methods.

### Option 1: Online IDE Direct Editing (⭐ Most Recommended)

**This is the simplest and most efficient online management method!** The project has a built-in "One-Click Open Online Editor" feature, allowing you to start writing without any configuration.

#### How to Use

1. **Visit your blog website**
2. **Click the "Edit Online" button** in the footer or navigation bar (if enabled)
3. **Choose your preferred online editor**:
   - **StackBlitz** - Fast startup, supports live preview
   - **GitHub.dev** - GitHub's official VSCode Online
   - **VSCode.dev** - Full VSCode experience
   - **Bolt.new** - AI-assisted development platform

4. **Start editing**: Directly modify files in the `public/content` directory in your browser
5. **Commit changes**: Use the Git panel to commit and push changes
6. **Auto-deploy**: Triggers CI/CD automatic build and deployment

#### Advantages

- ✅ **Zero configuration**: No software installation needed, just open your browser
- ✅ **Live preview**: Some platforms support hot update preview
- ✅ **Full Git integration**: Built-in version control and collaboration features
- ✅ **Cross-device**: Access and edit from any device
- ✅ **Free to use**: All recommended online IDEs have free tiers

#### Supported Online Editors Comparison

| Editor | Features | Use Case | URL Format |
|--------|----------|----------|------------|
| StackBlitz | Fast startup, Node.js support | Quick editing and preview | `https://stackblitz.com/github/{owner}/{repo}` |
| GitHub.dev | GitHub official integration | Preferred for GitHub users | `https://github.dev/{owner}/{repo}` |
| VSCode.dev | Full VSCode experience | Need advanced features | `https://vscode.dev/github/{owner}/{repo}` |
| Bolt.new | AI-assisted programming | AI-assisted creation | `https://bolt.new/github/{owner}/{repo}` |

#### Workflow Example

```
Click "Edit Online" → Choose editor → Browser opens → Edit article → Git commit → Auto-deploy
```

**The entire process takes only a few minutes, all completed in the browser!**

#### Custom Enable Online Editing Feature

If your blog doesn't have an online edit button yet, you can manually add it:

**Add link to page:**

```html
<!-- Replace {owner} and {repo} with your GitHub username and repository name -->
<a href="https://github.dev/{owner}/{repo}" target="_blank">
  📝 Edit Online
</a>
```

**Or use the project's built-in utility function:**

```javascript
import { toDev } from '@/utils/tool'

// Calling this function will display an editor selection dialog
toDev()
```

### Option 2: Git + GitHub/Gitee (Traditional Method)

This is the most common and free content management solution, suitable for personal blogs.

#### Workflow

```
Local Edit → Git Commit → Push to Remote Repository → CI/CD Auto Build & Deploy
```

#### Configuration Steps

**1. Initialize Git Repository**

```bash
cd pjfun-blog
git init
git add .
git commit -m "Initial commit"
```

**2. Link Remote Repository**

```bash
# GitHub
git remote add origin https://github.com/yourusername/pjfun-blog.git

# Gitee (recommended for China)
git remote add origin https://gitee.com/yourusername/pjfun-blog.git
```

**3. Configure Automated Deployment**

The project already includes a GitHub Actions configuration file `.github/workflows/deploy.yml`, which automatically builds and deploys to GitHub Pages after pushing code.

**4. Online Editing Methods**

- **GitHub Web Interface**: Edit Markdown files directly on GitHub
- **GitHub Desktop**: Graphical Git client, easier to use
- **VS Code + GitLens**: Powerful code editor with Git plugin
- **Gitee Web IDE**: Online editor provided by Gitee

#### Advantages

- ✅ Completely free
- ✅ Version control, traceable history
- ✅ Supports multi-person collaboration
- ✅ Automated deployment
- ✅ Data security and reliability

#### Example Workflow

```bash
# 1. Pull latest code
git pull origin main

# 2. Create new article
echo "---
title: My New Article
date: 2025-05-15
tags: [Vue, Tutorial]
---

# Article Content
" > public/content/2025/new-article.md

# 3. Commit changes
git add .
git commit -m "Add new article: My New Article"

# 4. Push to remote (triggers auto-deployment)
git push origin main
```

### Option 3: Cloud Storage Synchronization

Use cloud drive services to sync the `public/content` directory for multi-device editing.

#### Supported Cloud Services

| Service | Features | Use Case |
|---------|----------|----------|
| Dropbox | Stable, cross-platform | International users |
| OneDrive | Good Windows integration | Windows users |
| iCloud Drive | Best for Apple ecosystem | Mac/iOS users |
| Jianguoyun | Fast in China | Chinese users |
| Baidu Netdisk | Large capacity | Large file storage |

#### Configuration Method

**1. Move content directory to cloud drive**

```bash
# Assuming cloud drive path is ~/CloudStorage/Blog
mkdir -p ~/CloudStorage/Blog
mv public/content ~/CloudStorage/Blog/content
ln -s ~/CloudStorage/Blog/content public/content
```

**2. Sync on other devices**

Install the corresponding cloud drive client and log in with the same account to automatically sync.

#### Notes

- ⚠️ Ensure cloud drive doesn't sync `.git` folder
- ⚠️ Avoid editing the same file on multiple devices simultaneously
- ⚠️ Regularly backup important data

### Option 4: Headless CMS Integration

Manage content through Headless CMS, then export as static files.

#### Recommended CMS Platforms

| CMS | Type | Price | Features |
|-----|------|-------|----------|
| Strapi | Self-hosted | Free | Powerful, customizable |
| Contentful | SaaS | Free tier available | Mature and stable |
| Sanity | SaaS | Free tier available | Real-time collaboration |
| Directus | Self-hosted | Free | Database-first |
| Netlify CMS | Static | Free | Git-integrated |

#### Netlify CMS Configuration Example

**1. Create configuration file**

Create `public/admin/config.yml`:

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

**2. Create admin page**

Create `public/admin/index.html`:

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

**3. Access admin panel**

After deployment, visit `https://yourdomain.com/admin/` to use the visual content editor.

#### Advantages

- ✅ Visual editing interface
- ✅ Non-technical users can use it
- ✅ Supports rich text editing
- ✅ Media asset management

### Option 5: API-Driven Dynamic Content

For scenarios requiring dynamic content, combine with API services.

#### Architecture Diagram

```
Static Blog (PJ Blog) + API Service = Hybrid Architecture
```

#### Implementation Methods

**1. Use Serverless Functions**

```javascript
// vercel/functions/get-posts.js
export default async function handler(req, res) {
  // Fetch latest posts from database or CMS
  const posts = await fetchPostsFromAPI();
  res.json(posts);
}
```

**2. Frontend calls API**

```javascript
// In Vue component
import { ref, onMounted } from 'vue'

const dynamicPosts = ref([])

onMounted(async () => {
  const response = await fetch('/api/get-posts')
  dynamicPosts.value = await response.json()
})
```

#### Use Cases

- Comment system (Giscus already integrated)
- Real-time statistics
- User interaction features
- Dynamic recommended content

### Option 6: Webhook Automation

Automatically trigger builds after content updates via Webhooks.

#### Configuration Example (GitHub)

**1. Create Webhook**

In GitHub repository settings:
- Settings → Webhooks → Add webhook
- Payload URL: `https://api.vercel.com/v1/integrations/deploy/xxx`
- Content type: `application/json`
- Events: `Push events`

**2. Webhook Receiving Service**

You can use these platforms:
- Vercel (auto-integrated)
- Netlify (auto-integrated)
- Cloudflare Workers (custom)
- Self-hosted server

### Multi-Device Sync Best Practices

#### 1. Use Git as Single Source of Truth

```bash
# Device A: Edit and commit
git add . && git commit -m "Update articles" && git push

# Device B: Pull latest content
git pull
```

#### 2. Branch Strategy

```
main (production)
  ├── dev (development)
  ├── draft (draft area)
  └── feature/xxx (new features)
```

#### 3. Conflict Resolution

When multiple devices modify the same file:

```bash
# 1. Pull latest code
git pull origin main

# 2. If conflicts occur, resolve manually
git status  # View conflicting files
# Edit conflict files, keep desired content

git add .
git commit -m "Resolve merge conflicts"
git push
```

### Backup Strategy

#### 1. Local Backup

```bash
# Regularly backup entire project
tar -czf blog-backup-$(date +%Y%m%d).tar.gz pjfun-blog/

# Backup only content
tar -czf content-backup-$(date +%Y%m%d).tar.gz public/content/
```

#### 2. Remote Backup

```bash
# Push to multiple remote repositories
git remote add backup https://gitee.com/username/pjfun-blog-backup.git
git push backup main
```

#### 3. Automated Backup Script

Create `scripts/backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="~/backups/blog"
mkdir -p $BACKUP_DIR

# Backup content directory
tar -czf "$BACKUP_DIR/content_$DATE.tar.gz" public/content/

# Backup to cloud storage (example: using rclone)
rclone copy "$BACKUP_DIR" remote:blog-backups/

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Performance Optimization Tips

#### 1. Incremental Builds

For large blogs, only build changed files:

```bash
# Use Vite's incremental build feature
pnpm build --watch
```

#### 2. CDN Acceleration

Deploy static assets to CDN:

- Images: Use imgur, Cloudinary, Alibaba Cloud OSS
- Documents: Use GitHub Raw, jsDelivr

```markdown
cover: https://cdn.jsdelivr.net/gh/username/repo@main/public/img/cover.jpg
```

#### 3. Caching Strategy

Configure browser caching (already configured in nginx.conf):

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Security Recommendations

#### 1. Sensitive Information Protection

Do NOT commit the following to Git:

- `.env` files (containing passwords, keys)
- Private key files
- Database credentials

Ensure `.gitignore` includes:

```gitignore
.env
.env.local
*.key
*.pem
node_modules/
dist/
```

#### 2. Access Control

- Use strong passwords to protect blog (already supported)
- Enable HTTPS
- Restrict admin panel access by IP

#### 3. Regular Updates

```bash
# Regularly update dependencies
pnpm update

# Check for security vulnerabilities
pnpm audit
```

### Monitoring & Analytics

#### 1. Traffic Statistics

Integrate analytics tools:

- Google Analytics
- Umami (open source, privacy-focused)
- Plausible (lightweight)

Add tracking code in `index.html`:

```html
<!-- Umami example -->
<script async defer data-website-id="your-id" src="https://umami.example.com/script.js"></script>
```

#### 2. Error Monitoring

- Sentry
- LogRocket
- Self-hosted logging service

#### 3. Uptime Monitoring

- UptimeRobot
- StatusCake
- Pingdom

### FAQ

#### Q: How to manage content without knowing Git?

A: Recommend using Netlify CMS or Gitee Web IDE, which provide visual editing interfaces.

#### Q: How to avoid conflicts during multi-person collaboration?

A: 
1. Use different folders for division of labor
2. Frequently pull and push code
3. Use branches for isolation
4. Establish communication mechanisms

#### Q: How to handle large amounts of image resources?

A:
1. Use image hosting services (SM.MS, Imgur)
2. Compress images (TinyPNG, Squoosh)
3. Use WebP format
4. Implement lazy loading

#### Q: Can real-time preview be achieved?

A: Yes, run `pnpm dev` to start the development server, which supports hot updates.

#### Q: How to migrate to another platform?

A: Since it's a pure static website, just upload the `dist` directory to the new hosting service.

---

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

Custom plugins:
- `vite-plugin-gen-nav.ts` – automatically generates navigation and directory tree
- `vite-plugin-rss.ts` – generates RSS, Atom, JSON Feed on build
- `vite-plugin-sitemap.ts` – generates sitemap.xml on build
- `vite-plugin-cdn.ts` – multi-CDN auto fallback injection

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
- RSS, Atom, JSON Feed auto-generated (`/rss.xml`, `/atom.xml`, `/feed.json`)
- Sitemap auto-generated (`/sitemap.xml`)

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
