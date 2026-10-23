# PJ Blog - 零后端纯静态博客系统

<div align="center">

  <img src="https://img.shields.io/badge/Vue-3.5-brightgreen" alt="Vue Version">
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-7-purple" alt="Vite">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
  <a href="https://zread.ai/LXC-9349/pjfun-blog">
    <img src="https://img.shields.io/badge/Ask_Zread-_.svg?style=flat&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff" alt="Ask Zread">
  </a>

  <p>
    <a href="README.md">简体中文</a> | <a href="README.en.md">English</a> | <a href="https://cnblog.pjfun.top">在线示例</a>
  </p>
</div>

[![zread](https://img.shields.io/badge/Ask_Zread-_.svg?style=for-the-badge&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/LXC-9349/pjfun-blog)


## 🌟 项目简介

PJ Blog 是一个**零后端、纯静态、顶级动效、全球秒开**的个人博客系统。文章以文件形式存放在 `public/content`，构建时由插件扫描成导航数据，运行时按需拉取并渲染，因此不需要数据库、不需要服务端，部署到任意静态托管即可上线。

它不只“能写文章”：还提供主题设置（背景 / 字体 / 主题色 / 鼠标 / 飘落特效）、全屏屏保（本地视频与 B 站视频）、RSS 与 Sitemap、PWA 离线、Giscus 评论、不蒜子统计、构建版本守卫等一整套站点能力。

- 在线示例：<https://cnblog.pjfun.top>
- 英文文档：[README.en.md](README.en.md)
- 站内完整手册（写作 / 配置 / 部署）：[public/content/2025/blog.md](public/content/2025/blog.md)
- 更新日志：[change.md](change.md)

## ✨ 功能特性

### 内容与格式

- **多格式文档** — Markdown / HTML / TXT / PDF / Word / Excel 统一管理
- **Markdown 增强** — YAML Frontmatter、GFM 标题锚点、代码高亮、表格
- **非 Markdown 元数据** — 同名 `.desc.json` / `.desc.yaml` 配置标题、封面、标签
- **自动目录树** — 构建时扫描目录生成 `nav.json` / `tree.json`
- **置顶与标签** — `sticky` 置顶、标签筛选、热门标签自动统计
- **草稿忽略** — 以 `_` 开头的文件或目录不会被收录

### 外观与动效

- **主题设置面板** — 背景、字体、主题色、鼠标样式、页面特效、屏保六个分组
- **13 种字体** — 系统字体与 10 种在线中文字体（jsdmirror 主源、unpkg 降级）
- **主题色实时调节** — HSL 滑杆 + 6 套预设，全站色阶同步变化
- **背景系统** — `public/bg` 自动扫描、双层交叉淡入、自动轮播、Ken Burns 缩放、遮罩浓度
- **飘落特效** — 银杏 / 樱花 / 枫叶 / 梅花 / 羽毛 / 星星，可多选、可调数量与速度、点击生成发光粒子
- **屏保模式** — 全屏播放视频或图片，支持 B 站视频、静音、暂停、仅图片切换，ESC 退出

### 阅读与交互

- **Ctrl+K 全文搜索** — 标题 / 摘要 / 标签匹配，键盘上下选择
- **阅读进度** — 顶部进度条 + 滚动位置记忆 + 最近浏览
- **文章目录** — IntersectionObserver 滚动高亮
- **代码块** — 语言标签 + 一键复制
- **图片灯箱** — 点击放大预览
- **上一篇 / 下一篇** — 按钮、方向键与移动端左右滑动
- **分享面板** — 微信二维码、微博、QQ、X、Facebook、LinkedIn、Telegram、邮件
- **归档时间线** — 年份徽章 + 月份圆点
- **收藏夹** — 本地存储收藏，移动端抽屉布局

### 站点能力

- **国际化** — 中英文界面一键切换
- **Giscus 评论** — 基于 GitHub Discussions
- **密码保护** — 构建期 PBKDF2-SHA256 哈希（10 万次迭代 + 随机盐）
- **PWA** — 可安装、离线回退、数据请求优先走网络
- **SEO** — 结构化数据、Open Graph、Twitter Cards、sitemap.xml
- **RSS** — 构建生成 rss.xml / atom.xml / feed.json
- **站点统计** — 不蒜子访客数 / 访问量 + ping0 访客信息卡
- **版本守卫** — `version.json` 对比 + 轮询提示刷新，规避 CDN 旧缓存
- **数据管理入口** — 一键打开 StackBlitz / GitHub.dev / VSCode.dev / Bolt.new 在线编辑

## 🚀 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Vue 3.5 + TypeScript 5.9 |
| 构建 | Vite 7 + UnoCSS 66（presetWind3） |
| 路由 | Vue Router 4 + vite-plugin-pages（文件系统路由） |
| Markdown | Marked 17 + marked-gfm-heading-id + DOMPurify |
| 代码高亮 | highlight.js 11（异步加载） |
| 文档渲染 | pdfjs-dist（PDF）、mammoth（Word）、Luckysheet + LuckyExcel（Excel，CDN 加载） |
| 滚动与动效 | Lenis、@vueuse/motion、@vueuse/core |
| 图标 | Iconify Carbon（按需）+ 本地 SVG sprite |
| 评论与订阅 | Giscus、feed |
| PWA 与优化 | vite-plugin-pwa、vite-plugin-image-optimizer、sharp |
| 质量 | ESLint 10、Prettier 3、Vitest 4、vue-tsc |

## 🏗️ 工作原理

**构建阶段**（`pnpm build`）：

```
public/content 扫描 ──→ nav-version-<ver>.json / tree-version-<ver>.json
public/bg 扫描     ──→ bg/backgrounds.json（jpg/png 转 WebP）
BLOG_PASSWORD ──→ PBKDF2 哈希（明文不进入产物）
依赖外置           ──→ vue / vue-router 多 CDN fallback 注入
文章与站点数据     ──→ rss.xml / atom.xml / feed.json / sitemap.xml
构建版本           ──→ __APP_VERSION__、version.json、sw-<ver>.js
```

**运行阶段**：

1. `vite-plugin-pages` 生成 `/`、`/archive`、`/favorites` 等路由，其余路径交给 `articleDetail.vue` 兜底
2. 文章页先读取导航数据，按路径匹配文章 URL，再拉取原始文件（URL 带构建版本号，天然规避旧缓存）
3. Markdown 经 `marked` 解析、`DOMPurify` 清洗、`highlight.js` 高亮后渲染；PDF / Word / Excel 走各自的预览组件

## ⚡ 快速开始

### 环境要求

- Node.js ≥ 20（CI 使用 Node 20）
- pnpm（仓库包含 `pnpm-lock.yaml`）

### 一键启动（含 Node.js 自动安装）

| 系统 | 操作 |
| --- | --- |
| Windows | 双击仓库根目录的 `start.bat`（或在终端执行 `start.bat`） |
| Linux / macOS | 执行 `bash start.sh`（首次可先 `chmod +x start.sh`） |

脚本会依次完成：检测 Node.js（缺失时下载免安装版到项目 `.tools/`，**不需要管理员 / sudo**）→ 检测 pnpm（缺失时依次尝试 corepack、`npm install -g pnpm`）→ 安装依赖 → 由 `.env.example` 生成 `.env` → 准备草稿目录 → 启动开发服务器并打开 <http://localhost:1022/>。

```bash
# Windows
start.bat            # 搭建并启动
start.bat check      # 只检查环境，不写文件
start.bat setup      # 只搭建环境
start.bat build      # 搭建环境 + 生产构建

# Linux / macOS
bash start.sh            # 搭建并启动
bash start.sh check      # 只检查环境
bash start.sh setup      # 只搭建环境
bash start.sh build      # 搭建环境 + 生产构建
PJ_NODE_VERSION=22.14.0 bash start.sh   # 指定需要安装的 Node 版本
```

说明：

- 默认安装 Node.js `22.14.0`（LTS），依次尝试 npmmirror 与 nodejs.org 镜像，可用 `PJ_NODE_VERSION` 覆盖
- `.tools/` 已加入 `.gitignore`，下载的运行时不会污染仓库
- Windows 若提示脚本被阻止：右键 `start.bat` → 属性 → 解除锁定；若 PowerShell 策略受限，用 `powershell -NoProfile -ExecutionPolicy Bypass -File scripts\bootstrap-node.ps1 -Version 22.14.0 -Dest .tools` 手动下载
- 已安装过 Node / pnpm 的机器会直接复用，不会重复下载

### 手动安装与运行

```bash
# 安装依赖
pnpm install

# 一键环境搭建（依赖 + .env + 草稿目录）
pnpm bootstrap

# 一键环境搭建并启动开发服务器
pnpm start

# 环境就绪后直接启动
pnpm dev

# 生产构建：先类型检查，再输出到 dist/
pnpm build

# 本地预览构建产物
pnpm preview
```

> 启动后访问 <http://localhost:1022/>。首页右上角的钢笔按钮可进入创作台 `/studio`（仅开发环境显示）。

### 常用脚本

| 命令 | 作用 |
| --- | --- |
| `start.bat` / `bash start.sh` | 系统级一键启动（含 Node.js 自动安装） |
| `pnpm start` | 一键环境搭建并启动开发服务器 |
| `pnpm bootstrap` | 一键环境搭建（依赖 + `.env` + 草稿目录） |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | `vue-tsc -b` 类型检查 + 生产构建 |
| `pnpm preview` | 预览 `dist` |
| `pnpm content:new` | 新建文章（支持 `--dir / --tags / --draft`） |
| `pnpm content:check` | 批量检查文章、附件与路由冲突 |
| `pnpm content:publish` | 把草稿发布到指定分类 |
| `pnpm lint` / `pnpm lint:check` | ESLint 自动修复 / 仅检查 |
| `pnpm format` / `pnpm format:check` | Prettier 格式化 / 检查 |
| `pnpm test` / `pnpm test:run` | Vitest 监视 / 单次运行 |

## ⚙️ 环境变量

复制 `.env.example` 为 `.env` 后修改（`pnpm bootstrap` 会自动完成）。变量优先级：**系统环境变量 > `.env.*` 文件 > `src/constants` 代码默认值**。常用参数也可以直接在创作台「站点参数」页编辑。

### 构建与站点

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_BASE` | `/` | 部署基础路径，子路径部署时必改（如 `/pjfun-blog/`） |
| `VITE_APP_VERSION` | 空 | 页脚展示的语义化版本；留空显示构建日期 |
| `VITE_SITE_ICON` | `Pj` | 站点图标首字符 |
| `VITE_SITE_TITLE` | `Pjfun Blog` | 站点标题（标签页 / PWA） |
| `VITE_SITE_DESCRIPTION` | 见 `.env.example` | SEO 与 PWA 描述 |
| `VITE_SITE_AUTHOR` | `Simon` | 作者 |
| `VITE_SITE_KEYWORDS` | 见 `.env.example` | SEO 关键词，英文逗号分隔 |
| `VITE_SITE_EMAIL` | `admin@pjfun.com` | 页脚邮箱 |
| `VITE_SITE_URL` | `https://pjfun.top` | 站点域名，供 RSS / sitemap / 结构化数据使用 |

### 文案与链接

| 变量 | 说明 |
| --- | --- |
| `VITE_LOADING_TEXT` | 首屏加载文案 |
| `VITE_JS_DISABLED_NOTICE` | 禁用 JS 提示 |
| `VITE_RESOURCE_LOAD_FAILED_TEXT` | CDN 资源加载失败提示 |
| `VITE_REFRESH_REQUIRED_TEXT` | 需要刷新页面提示 |
| `VITE_SOCIAL_GITHUB` | GitHub 仓库，同时用于解析在线编辑器地址 |
| `VITE_SOCIAL_TELEGRAM` | Telegram 链接 |
| `VITE_FOOT_GITHUB` | 页脚 GitHub 链接 |
| `VITE_HOT_RANK_URL` | 首页「热榜新闻」入口地址 |

### 评论、统计与标签

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_GISCUS_ENABLED` | `true` | 是否启用评论 |
| `VITE_GISCUS_REPO` / `VITE_GISCUS_REPO_ID` | 见 `.env.example` | 评论仓库与 ID |
| `VITE_GISCUS_CATEGORY` / `VITE_GISCUS_CATEGORY_ID` | 见 `.env.example` | Discussion 分类 |
| `VITE_GISCUS_MAPPING` | `pathname` | 文章映射方式 |
| `VITE_GISCUS_STRICT` / `REACTIONS` / `METADATA` | `false` / `true` / `false` | 严格匹配、表情回应、元数据 |
| `VITE_GISCUS_POSITION` / `VITE_GISCUS_LANG` | `top` / `zh-CN` | 输入框位置与语言 |
| `VITE_BUSUANZI_ENDPOINT` | 官方接口 | 不蒜子统计接口 |
| `VITE_PING0_IMAGE_URL` | `https://ping0.cc/img1` | 访客信息图地址 |
| `VITE_HOT_TAGS` | 空 | 手动热门标签；留空按频次自动生成 |
| `VITE_HOT_TAGS_LIMIT` | `12` | 自动生成上限 |

### 外观默认值

`VITE_DEFAULT_*` 系列用于设置**首次访问的默认外观**：背景、字体、鼠标样式、主题色（HSL）、背景轮播、Ken Burns、遮罩、飘落特效的类型 / 数量 / 速度 / 层级。浏览器中已保存的用户配置优先级更高，用户可在「主题设置」面板随时覆盖。

完整键名、取值范围与可选值见 [.env.example](.env.example)。

## 🎛️ 系统参数

除环境变量外，站点行为由 `src/constants` 下的文件集中管理（`index.ts` 仅做统一出口）。修改后需重新构建。

| 文件 | 主要内容 |
| --- | --- |
| `site.ts` | 站点信息、Giscus、统计接口、热榜入口 |
| `appearance.ts` | 外观默认值 `APPEARANCE_DEFAULTS`、可调范围 `APPEARANCE_LIMITS`、字体清单、主题色预设、鼠标预设、字体 CDN |
| `screensaver.ts` | 屏保切换间隔、全屏开关、视频源（直链 MP4 / B 站 BV 号）、超时与重试 |
| `home.ts` | 首页分页 12 篇、滚动阈值、背景轮播最小间隔、加载冷却 |
| `search.ts` | 搜索缓存 5 分钟、最多 10 条、180ms 防抖 |
| `article.ts` | 阅读进度节流 3s、滑动阈值 60px、目录生成延迟 200ms |
| `ui.ts` | 对话框层级、Toast 时长、滚动条隐藏延时、回到顶部时长 |
| `effects.ts` | 粒子鼠标避让半径、发光粒子上限、点击生成数量、DPR 上限 |
| `preview.ts` | Luckysheet / LuckyExcel / jQuery 版本、PDF worker 多源 |
| `security.ts` | PBKDF2 迭代次数与密钥长度 |
| `bilibili.ts` | B 站代理地址、解析接口、超时与直链缓存 |
| `misc.ts` | 热门标签上限、版本检查间隔 245s、稍后提醒 30 分钟 |
| `storage.ts` | 全部 localStorage 键名与条数上限 |
| `i18n.ts` | 中英文文案 |

站内文章《PJ Blog 完整手册》（`public/content/2025/blog.md`）收录了本 README 的全部内容（项目简介、快速开始、内容写作与创作台、部署上线），并展开每个参数的默认值、取值范围与调优建议。

## ✍️ 内容管理

### 本地创作台（Studio）

开发环境内置可视化写作台：首页右上角钢笔按钮，或直接访问 <http://localhost:1022/studio>。它仅在 `pnpm dev` 下存在，生产构建不会打包相关代码。

- **三栏工作区**：左侧文章树（支持搜索、草稿箱）/ 中间 Markdown 编辑 + 实时预览 / 右侧文章设置与发布
- **新建文章**：标题自动转拼音 slug，分类可直接输入新目录；支持先存草稿（`public/content/_drafts`，构建时自动忽略）
- **封面**：点击上传、`Ctrl+V` 粘贴或拖入图片，统一保存到 `public/img/covers/`
- **正文图片**：编辑区粘贴截图会自动保存到 `public/content/<分类>/<slug>/` 并插入引用
- **附件**：上传 PDF / Word / Excel 后自动生成同名 `.desc.json` 元数据
- **即时生效**：保存后 dev server 热重建导航，首页、归档、搜索立即更新，无需重启
- **发布到线上**：先「保存版本」（git commit），再「发布到线上」（push，推送前二次确认）
- **站点参数**：顶部「站点参数」页可编辑常用环境变量（站点信息、社交链接、外观默认值、Giscus、安全等），保存写入本地 `.env` 并自动重启
- **部署导出**：本地 `.env` 不提交，站点参数页的「导出部署配置」可生成 `.env` / GitHub Actions YAML / JSON，并附 Vercel、EdgeOne、Netlify、Docker 的配置说明

命令行写作同样可用：

```bash
pnpm content:new "文章标题" --dir 前端开发 --tags Vue,TypeScript
pnpm content:check
pnpm content:publish _drafts/xxx.md --dir 前端开发
```

### 支持的格式

| 格式 | 扩展名 | 元数据方式 |
| --- | --- | --- |
| Markdown | `.md` | YAML Frontmatter |
| HTML | `.html` | `.desc.json` / `.desc.yaml`，或 `<title>` 与 `<meta name="description">` |
| 纯文本 | `.txt` | `.desc.json` / `.desc.yaml`，首行作为标题 |
| PDF | `.pdf` | `.desc.json` / `.desc.yaml` |
| Word | `.docx` | `.desc.json` / `.desc.yaml` |
| Excel | `.xlsx` | `.desc.json` / `.desc.yaml` |

### Markdown Frontmatter

```markdown
---
title: 文章标题
date: 2025-12-05
cover: /img/d1.webp
desc: 文章摘要，显示在首页卡片
tags: [Vue, TypeScript, 教程]
sticky: true
---

正文从这里开始。
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 否 | 缺省使用文件名 |
| `date` | 否 | 缺省使用文件修改时间 |
| `cover` | 否 | 封面图路径；留空时按格式回退到内置占位图 |
| `desc` | 否 | 摘要；缺省取正文首行前 120 字符 |
| `tags` | 否 | 标签数组 |
| `sticky` | 否 | `true` 置顶 |

### 非 Markdown 元数据

与文档**同名**创建配置文件，例如 `sample.pdf` 对应 `sample.pdf.desc.json`：

```json
{
  "title": "示例 PDF 文档",
  "date": "2025-12-19",
  "cover": "/img/d5.webp",
  "tags": ["PDF", "阅读"],
  "excerpt": "显示在首页卡片的摘要",
  "sticky": false
}
```

> 注意：非 Markdown 文件的摘要字段是 `excerpt`（Markdown 用的是 `desc`）。

### 目录组织

```
public/content/
├── 2025/
│   ├── blog.md
│   ├── pdf/     example.pdf + example.pdf.desc.json
│   ├── word/    example.docx
│   └── excel/   example.xlsx
├── 前端开发/
│   ├── vue3-reactivity-deep-dive.md
│   └── typescript-advanced-patterns.md
└── 笔记/
    └── 读书笔记.md
```

- 目录层级即导航树层级，建议不超过 3 层
- 文件名即路由（`/前端开发/vue3-reactivity-deep-dive`），日期与封面由元数据决定
- 以 `_` 开头的文件或目录会被构建忽略，可用于存放草稿
- 删除或重命名文章后重新构建即可，导航数据每次构建都会重建

### 图片资源

- 公共图片：`public/img/`，引用 `/img/d1.webp`
- 封面上传：`public/img/covers/`，由创作台自动命名，引用 `/img/covers/xxx.png`
- 文章专属图片：与文章同目录建文件夹，引用 `/content/2025/文章名/a.png`
- 背景图：`public/bg/`，构建时自动扫描并转 WebP（最大宽 1920，质量 82），无需手写清单

## 🌈 主题与屏保

首页右上角「主题设置」按钮打开面板，包含六个分组：

| 分组 | 可调项 |
| --- | --- |
| 背景 | 选择 `public/bg` 中的图片、遮罩浓度、自动轮播与间隔、缓慢缩放 |
| 字体 | 系统默认 / 系统宋体 / 系统楷体 + 10 种在线中文字体，带预览与失败回退 |
| 主题色 | 6 套预设 + 色相 / 饱和度 / 明度滑杆，全站色阶实时同步 |
| 特效 | 飘落粒子类型（多选）、数量、旋转 / 水平 / 垂直速度、飘摆幅度、显示层级 |
| 鼠标 | 系统默认、精致箭头、主题圆点、主题光环、主题准星、系统十字 |
| 屏保 | 启动全屏屏保、设置说明与特效提示 |

屏保默认播放视频（直链 MP4 与 B 站 BV 号，配置在 `src/constants/screensaver.ts`），可在屏保内切换「仅图片」、静音、暂停、下一张，按 ESC 或右上角关闭退出。视频加载失败会自动跳过并重试，B 站代理失败时回退第三方直链解析。

个性化设置保存在浏览器 `localStorage`（`pjfun_blog_appearance`），不会影响其他访客。

## 🔐 密码保护

两种配置方式，二选一：

```env
# 方式一（推荐）：明文密码，构建时生成 PBKDF2-SHA256 哈希（10 万次迭代 + 128 位随机盐）
# 注意：明文密码不要加 VITE_ 前缀，否则会被 Vite 打包进前端产物
BLOG_PASSWORD=your_password

# 方式二：直接填哈希
# PBKDF2 格式：iterations$salt_base64$hash_base64
# 兼容旧版 64 位 SHA256 十六进制
VITE_BLOG_PASSWORD_HASH=your_hash
```

- `BLOG_PASSWORD` 存在时优先使用，并覆盖 `VITE_BLOG_PASSWORD_HASH`
- 旧版 `VITE_BLOG_PASSWORD` 仍兼容，但会在构建时从客户端环境移除，建议改用 `BLOG_PASSWORD`
- 两项都为空则不启用密码保护
- 启用后，未通过验证的访问会被重定向到 `/password`，验证通过后跳回原路径
- 生成旧版 SHA256 哈希：`node scripts/generate-password-hash.js <密码>`
- 密码保护是纯前端的访问门槛，适合个人站点简单防护，高安全需求请使用服务端鉴权

## 💬 评论

评论由 Giscus 提供，基于 GitHub Discussions。前往 [giscus.app](https://giscus.app/zh-CN) 生成配置，填入 `.env` 的 `VITE_GISCUS_*` 系列变量即可。`VITE_GISCUS_ENABLED=false` 可完全关闭。

## 🧱 构建产物与缓存策略

项目针对「静态托管 + CDN」做了完整的缓存规避设计：

- **统一构建版本**：`PJ_BUILD_VERSION`（毫秒时间戳）同时注入 `__APP_VERSION__`、`version.json`、`sw-<ver>.js`
- **数据文件版本化**：导航与目录数据输出为 `nav-version-<ver>.json`、`tree-version-<ver>.json`，每次发布都是全新 URL
- **首屏版本守卫**：`index.html` 内联脚本对比 `version.json`，发现入口 HTML 落后时带版本参数重载（`sessionStorage` 防死循环）
- **运行期轮询**：每 245 秒检查一次新版本，提示「立即更新 / 稍后提醒（30 分钟）」
- **PWA 策略**：注册代码内联；不预缓存 `index.html`、`bg/`、`img/` 与重型 vendor chunk；关闭 `navigateFallback`
- **运行时缓存**：导航 JSON 与文章内容 NetworkFirst，图片 CacheFirst（30 天）
- **CDN 外置**：生产构建将 `vue`、`vue-router` 外置，按 jsdelivr → unpkg → esm.sh 及多个镜像依次回退；开发模式不启用
- **代码分割**：Markdown 解析、highlight.js、pdfjs-dist、mammoth 各自独立 chunk，不进入首屏
- **图片优化**：`vite-plugin-image-optimizer` 压缩资源；背景图构建期转 WebP 并清理原图

## 🚀 部署

构建产物在 `dist/`，包含 `index.html`、`static/`、`content/`、`bg/`、`rss.xml`、`atom.xml`、`feed.json`、`sitemap.xml`、`version.json`、`sw-<ver>.js`。

| 平台 | 方式 | 说明 |
| --- | --- | --- |
| Vercel | [一键部署](https://vercel.com/new/clone?repository-url=https://github.com/LXC-9349/pjfun-blog) | 示例：<https://pjfun-blog.vercel.app/> |
| EdgeOne Pages（国内） | [一键部署](https://console.cloud.tencent.com/edgeone/pages/new?template=https://github.com/LXC-9349/pjfun-blog) | 示例：<https://cnblog.pjfun.top/> |
| EdgeOne Pages（国际） | [一键部署](https://console.tencentcloud.com/edgeone/pages/new?template=https://github.com/LXC-9349/pjfun-blog) | `esa.jsonc` 已配置 SPA 回退 |
| Cloudflare Workers | [一键部署](https://deploy.workers.cloudflare.com/?url=https://github.com/LXC-9349/pjfun-blog/tree/main) | `wrangler.jsonc` 指向 `dist` |
| Netlify | [一键部署](https://app.netlify.com/start/deploy?repository=https://github.com/LXC-9349/pjfun-blog) | `netlify.toml` 已配置构建命令 |
| GitHub Pages | 推送 `main` 自动部署 | `.github/workflows/deploy.yml`，需设置 `VITE_BASE` |
| Docker / Nginx | `docker build` + `deploy/nginx.conf` | 见下 |

### GitHub Pages

工作流已设置 `VITE_BASE: /pjfun-blog/`。如果你把仓库改名为其他名称，需同步修改该值，否则会出现白屏或资源 404。仓库 Settings → Pages → Source 选择 **GitHub Actions** 即可。

### Docker

```bash
# .env 在构建阶段被复制进构建上下文；运行时容器只提供静态文件
docker build -t pjfun-blog .
docker run -d --restart=always --name blog -p 1022:80 pjfun-blog

# 或使用 compose
docker compose up -d
```

镜像基于 Nginx，`deploy/nginx.conf` 已包含 SPA 回退与静态资源缓存策略。修改 `.env` 后需要重新 `docker build`。

## 📁 项目结构

```
pjfun-blog/
├── public/
│   ├── bg/                     # 背景图，构建时自动生成 backgrounds.json 并转 WebP
│   ├── content/                # 全部文章与文档（_drafts 为草稿）
│   ├── generated/              # 构建产物：nav.json / tree.json（版本化文件名）
│   ├── img/                    # 公共图片、PWA 图标；covers/ 为创作台上传的封面
│   ├── favicon.ico             # 站点图标（兼容浏览器默认请求 /favicon.ico）
│   ├── 404.html
│   └── pj_public.js            # CDN 加载与多源回退
├── src/
│   ├── studio/                 # 本地创作台：页面、编辑器、预览、设置与发布面板
│   ├── components/
│   │   ├── ui/                 # 搜索、分享、主题设置、屏保、粒子、主题切换
│   │   ├── preview/            # PDF / Excel 预览
│   │   ├── DocumentViewer.vue  # 文档分发
│   │   ├── NavTree.vue         # 目录树
│   │   ├── Footer.vue          # 页脚（版本、统计、数据管理入口）
│   │   ├── GiscusComment.vue
│   │   ├── PasswordProtection.vue
│   │   ├── SiteStats.vue
│   │   ├── Ping0VisitorCard.vue
│   │   ├── HotTagList.vue
│   │   ├── HotRankLink.vue
│   │   └── RecentArticles.vue
│   ├── constants/              # 全部配置常量（按职责拆分）
│   ├── pages/                  # 首页 / 归档 / 收藏 / 文章详情
│   ├── plugins/seo.ts
│   ├── utils/                  # 外观、密码、B 站、统计、版本检查、文件转换等
│   ├── styles/global.css
│   ├── App.vue                 # 页面过渡、移动端底栏、更新提示
│   └── main.ts                 # Lenis、主题、i18n、路由守卫、密码校验
├── tooling/
│   ├── build_cdn.ts            # CDN 源与依赖外置配置
│   ├── vite-plugin-cdn.ts      # CDN 注入
│   ├── vite-plugin-rss.ts      # RSS / Atom / JSON Feed
│   ├── vite-plugin-sitemap.ts  # sitemap.xml
│   ├── vite-plugin-gen-nav.ts  # 内容扫描 → 导航数据 + 通配路由
│   ├── vite-plugin-gen-backgrounds.ts # 背景扫描 / WebP 转换
│   ├── vite-plugin-studio.ts   # 创作台接口（仅 dev）
│   ├── vite-plugin-auto-password-hash.ts # 构建期 PBKDF2
│   ├── content-core.ts         # 内容扫描、校验、读写与导航生成（CLI / Studio 共用）
│   ├── content-bus.ts          # dev 下导航重建与静默刷新通道
│   └── env-config.ts           # 创作台「站点参数」的 .env 读写
├── scripts/
│   ├── setup.mjs               # 一键环境搭建 / 启动
│   ├── bootstrap-node.ps1      # Windows 免安装 Node.js 下载引导
│   ├── content-cli.ts          # 内容命令行（new / check / publish）
│   ├── generate-password-hash.js
│   └── worker.js               # Cloudflare Workers 入口
├── deploy/
│   └── nginx.conf              # Nginx 站点配置（由 Dockerfile 引用）
├── start.bat / start.sh        # Windows / Linux・macOS 一键启动入口
├── change.md                   # 变更日志
├── Dockerfile / docker-compose.yml
├── netlify.toml / wrangler.jsonc / esa.jsonc
└── vite.config.ts / uno.config.ts / vitest.config.ts
```

## ❓ 常见问题

**文章没有出现在列表里？**
确认文件在 `public/content` 下、扩展名受支持、元数据格式正确；文件名以 `_` 开头会被忽略。使用创作台保存时会自动重建导航；手工修改文件后运行 `pnpm dev` 或 `pnpm build`。

**创作台打不开？**
创作台只在开发环境提供：先运行 `pnpm dev`，再访问 `/studio`；生产环境访问 `/studio` 会回到首页。局域网访问需要在 `.env` 中设置 `STUDIO_TOKEN` 并在页面输入口令。

**站点参数保存后没生效？**
参数写入本地 `.env`，dev server 会自动重启；刷新页面即可。部署平台（Vercel / EdgeOne / GitHub Pages 等）不会读取本地 `.env`，请在站点参数页点「导出部署配置」，把生成的变量同步到平台的环境变量中。

**封面不显示？**
路径需以 `/` 开头（相对 `public` 目录），或使用完整 URL。子路径部署时，相对封面会自动拼接 `VITE_BASE`。

**部署到子路径后白屏？**
`VITE_BASE` 必须与访问路径一致（如 `/pjfun-blog/`），修改后重新构建。

**发布后访问到的还是旧页面？**
项目已通过版本化文件名、`version.json` 守卫与 PWA 策略规避缓存。若仍异常，检查托管平台是否为 `index.html` 设置了强缓存，并确认 `sw-<ver>.js` 正常更新。

**密码不生效？**
确认构建时环境变量已传入（CI 中需配置 Secrets / Variables），且未同时残留旧的 `VITE_BLOG_PASSWORD_HASH`。明文密码请使用 `BLOG_PASSWORD`（不要加 `VITE_` 前缀）。

**统计不显示？**
不蒜子或 ping0 不可用时对应区域会自动降级或隐藏，不影响其他功能；可通过 `VITE_BUSUANZI_ENDPOINT`、`VITE_PING0_IMAGE_URL` 更换地址。

**屏保视频不播放？**
部分直链视频或 B 站代理不稳定，组件会自动跳过失败源并重试；可在 `src/constants/screensaver.ts` 中替换为自有视频地址。

## 🤝 贡献

欢迎提交 Issue 与 Pull Request：

1. Fork 本仓库
2. 创建分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m "feat: ..."`
4. 推送分支并发起 Pull Request

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

### 👨‍💻 关于作者

如果你对这个项目的实现细节感兴趣，或者想交流技术：

* **个人主页：** [https://pjfun.top](https://pjfun.top)
* **闲鱼主页：** [点击跳转](https://www.goofish.com/personal?userId=863031346) 