---
title: PJ Blog 完整手册 — 内容写作、参数配置与部署上线
date: 2025-12-05
cover: /img/d1.webp
desc: PJ Blog 一站式文档：项目简介与功能特性、一键环境搭建、创作台写作与发布、内容组织规则、全部环境变量、src/constants 系统参数、屏保与外观配置、构建缓存策略、密码保护机制、部署平台与调优排查。
tags: [PJ Blog, Vue3, Vite, 配置, 文档, 部署]
sticky: true
---

# PJ Blog 完整手册

本文是 PJ Blog 的完整使用手册，既包含 [README](https://github.com/LXC-9349/pjfun-blog/blob/main/README.md) 的全部内容（项目简介、功能特性、技术栈、快速开始、内容管理、部署上线），也在其基础上展开**系统参数**：每个环境变量的默认值与影响范围、`src/constants` 中可调常量的含义与取值边界、构建与缓存策略、密码保护机制，以及调优与排查建议。

- 在线示例：<https://cnblog.pjfun.top>
- 项目仓库：<https://github.com/LXC-9349/pjfun-blog>
- 英文文档：<https://github.com/LXC-9349/pjfun-blog/blob/main/README.en.md>

**阅读路径**

| 你想做什么 | 直接看 |
| --- | --- |
| 第一次跑起来 | 四、快速开始 |
| 写文章 / 发草稿 | 五、内容写作与发布 |
| 改站点名称、配色、评论 | 六、环境变量；七、系统参数 |
| 部署到 Vercel / GitHub Pages / Docker | 十二、部署上线 |
| 页面异常、文章不显示 | 十五、常见问题排查 |

## 一、项目简介

### 1.1 定位

PJ Blog 是一个**零后端、纯静态、顶级动效、全球秒开**的个人博客系统。文章以文件形式存放在 `public/content`，构建时由插件扫描成导航数据，运行时按需拉取并渲染，因此不需要数据库、不需要服务端，部署到任意静态托管即可上线。

它不只“能写文章”：还提供主题设置（背景 / 字体 / 主题色 / 鼠标 / 飘落特效）、全屏屏保（本地视频与 B 站视频）、RSS 与 Sitemap、PWA 离线、Giscus 评论、不蒜子统计、构建版本守卫，以及开发环境内置的**本地创作台**与**内容命令行**，形成从写作到上线的完整闭环。

### 1.2 功能特性

**内容与格式**

- **多格式文档** — Markdown / HTML / TXT / PDF / Word / Excel 统一管理
- **Markdown 增强** — YAML Frontmatter、GFM 标题锚点、代码高亮、表格
- **非 Markdown 元数据** — 同名 `.desc.json` / `.desc.yaml` 配置标题、封面、标签
- **自动目录树** — 构建时扫描目录生成 `nav.json` / `tree.json`
- **置顶与标签** — `sticky` 置顶、标签筛选、热门标签自动统计
- **草稿忽略** — 以 `_` 开头的文件或目录不会被收录
- **创作闭环** — 开发环境内置创作台与 CLI，保存即生效，确认后一键发布

**外观与动效**

- **主题设置面板** — 背景、字体、主题色、鼠标样式、页面特效、屏保六个分组
- **13 种字体** — 系统字体与 10 种在线中文字体（jsdmirror 主源、unpkg 降级）
- **主题色实时调节** — HSL 滑杆 + 6 套预设，全站色阶同步变化
- **背景系统** — `public/bg` 自动扫描、双层交叉淡入、自动轮播、Ken Burns 缩放、遮罩浓度
- **飘落特效** — 银杏 / 樱花 / 枫叶 / 梅花 / 羽毛 / 星星，可多选、可调数量与速度、点击生成发光粒子
- **屏保模式** — 全屏播放视频或图片，支持 B 站视频、静音、暂停、仅图片切换，ESC 退出

**阅读与交互**

- **Ctrl+K 全文搜索** — 标题 / 摘要 / 标签匹配，键盘上下选择
- **阅读进度** — 顶部进度条 + 滚动位置记忆 + 最近浏览
- **文章目录** — IntersectionObserver 滚动高亮
- **代码块** — 语言标签 + 一键复制
- **图片灯箱** — 点击放大预览
- **上一篇 / 下一篇** — 按钮、方向键与移动端左右滑动
- **分享面板** — 微信二维码、微博、QQ、X、Facebook、LinkedIn、Telegram、邮件
- **归档时间线** — 年份徽章 + 月份圆点
- **收藏夹** — 本地存储收藏，移动端抽屉布局

**站点能力**

- **国际化** — 中英文界面一键切换
- **Giscus 评论** — 基于 GitHub Discussions
- **密码保护** — 构建期 PBKDF2-SHA256 哈希（10 万次迭代 + 随机盐）
- **PWA** — 可安装、离线回退、数据请求优先走网络
- **SEO** — 结构化数据、Open Graph、Twitter Cards、sitemap.xml
- **RSS** — 构建生成 rss.xml / atom.xml / feed.json
- **站点统计** — 不蒜子访客数 / 访问量 + ping0 访客信息卡
- **版本守卫** — `version.json` 对比 + 轮询提示刷新，规避 CDN 旧缓存
- **数据管理入口** — 一键打开 StackBlitz / GitHub.dev / VSCode.dev / Bolt.new 在线编辑

## 二、技术栈

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
| 创作工具 | 本地创作台（Vite 中间件）、tsx + 内容 CLI、pinyin-pro |
| 质量 | ESLint 10、Prettier 3、Vitest 4、vue-tsc |

## 三、工作原理

### 3.1 构建阶段

```
public/content 扫描 ─┬─→ nav-version-<构建版本>.json
                     └─→ tree-version-<构建版本>.json
public/bg 扫描      ──→ bg/backgrounds.json（jpg/png 转 WebP）
BLOG_PASSWORD       ──→ PBKDF2-SHA256 哈希（替代明文）
package.json 依赖   ──→ CDN 地址（生产环境外置 vue / vue-router）
文章元数据          ──→ rss.xml / atom.xml / feed.json / sitemap.xml
构建版本            ──→ __APP_VERSION__ / version.json / sw-<版本>.js
```

### 3.2 运行阶段

1. `vite-plugin-pages` 依据 `src/pages` 生成页面路由：`/`、`/archive`、`/favorites`，以及启用密码保护时的 `/password`。
2. 其余所有路径由 `articleDetail.vue` 的通配路由接管。
3. 文章页读取导航数据，按路径找到文件 URL，再拉取原始文件；请求 URL 会附带构建版本参数，避免命中旧缓存。
4. Markdown 经 `marked` 解析、`DOMPurify` 清洗、`highlight.js` 高亮；PDF / Word / Excel 分别交给对应预览组件。

### 3.3 配置分层

配置按优先级从高到低生效：

1. 系统环境变量（CI、容器、命令行注入）
2. `.env`、`.env.local`、`.env.production` 等文件
3. `src/constants/*.ts` 中的代码默认值

浏览器中的用户个性化设置（外观相关）单独存放于 `localStorage`，优先级高于上述默认值。

### 3.4 写作闭环

```
创作台 / CLI 写文件 → 校验 → dev 热重建导航 → 草稿发布 → git 提交 → 确认后推送 → Actions 部署
                                                                    ↓
                                        首页 / 归档 / 搜索 / 标签 / RSS / sitemap 自动派生
```

## 四、快速开始

### 4.1 环境要求

- Node.js ≥ 20（Vite 7 建议 20.19+，CI 使用 Node 20）
- pnpm（仓库包含 `pnpm-lock.yaml`）

### 4.2 一键启动（含 Node.js 自动安装）

| 系统 | 操作 |
| --- | --- |
| Windows | 双击仓库根目录的 `start.bat` |
| Linux / macOS | 执行 `bash start.sh` |

脚本流程：检测 Node.js（缺失时把免安装版下载到项目 `.tools/`，**无需管理员 / sudo**）→ 检测 pnpm（依次尝试 corepack、`npm install -g pnpm`）→ 安装依赖 → 由 `.env.example` 生成 `.env` → 准备草稿目录 → 启动开发服务器。

```bash
start.bat check | setup | build        # Windows
bash start.sh check | setup | build    # Linux / macOS
PJ_NODE_VERSION=22.14.0 bash start.sh  # 指定需要安装的 Node 版本
set PJ_NO_PAUSE=1 && start.bat         # 无人值守，失败不等待按键
```

- 默认安装 Node.js 22.14.0（LTS），依次尝试 npmmirror 与 nodejs.org 镜像
- `.tools/` 已加入 `.gitignore`；已有 Node / pnpm 的机器会直接复用，不重复下载
- Windows 脚本被阻止时：右键 `start.bat` → 属性 → 解除锁定

### 4.3 仅用包管理器搭建

```bash
# 检查 Node / pnpm → 安装依赖 → 由 .env.example 生成 .env → 准备草稿目录
pnpm bootstrap

# 搭建完成后直接启动开发服务器
pnpm start
```

`pnpm start` 会先做环境检查，已安装依赖时自动跳过安装，因此可以作为日常启动命令使用。只想检查环境是否就绪，可以运行 `node scripts/setup.mjs --check`，它不会修改任何文件。

```bash
# 环境已就绪时也可以直接启动
pnpm dev
```

启动后访问 <http://localhost:1022/>（端口被占用时自动顺延）。首页右上角会出现**钢笔图标**入口，点击进入创作台 `/studio`；该入口只在开发环境渲染，生产构建中不存在。

### 4.4 常用脚本

| 命令 | 作用 |
| --- | --- |
| `start.bat` / `bash start.sh` | 系统级一键启动（含 Node.js 自动安装） |
| `pnpm start` | 一键环境搭建并启动开发服务器 |
| `pnpm bootstrap` | 一键环境搭建（依赖 + `.env` + 草稿目录） |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | `vue-tsc -b` 类型检查 + 生产构建 |
| `pnpm preview` | 预览 `dist` |
| `pnpm content:new` | 新建文章（`--dir / --slug / --tags / --cover / --desc / --draft`） |
| `pnpm content:check` | 批量检查文章、附件与路由冲突 |
| `pnpm content:publish` | 把草稿发布到指定分类 |
| `pnpm lint` / `pnpm lint:check` | ESLint 自动修复 / 仅检查 |
| `pnpm format` / `pnpm format:check` | Prettier 格式化 / 检查 |
| `pnpm test` / `pnpm test:run` | Vitest 监视 / 单次运行 |
| `pnpm gen:encrypt-key` | 生成旧版 SHA256 密码哈希 |

## 五、内容写作与发布

内容全部是文件，放在 `public/content` 下即可。项目提供两种写作入口，共用同一套读写与校验逻辑（`tooling/content-core.ts`），行为完全一致。

### 5.1 本地创作台（Studio）

运行 `pnpm dev` 后，从首页钢笔入口或 `/studio` 进入。创作台只在开发环境存在：`tooling/vite-plugin-studio.ts` 只在 dev server 生效，页面路由只在 `import.meta.env.DEV` 下注册，生产构建既没有接口也没有相关代码。

**界面布局**

| 区域 | 内容 |
| --- | --- |
| 左侧 | 文章树（可搜索）、草稿箱、写新文章 / 存草稿 / 传附件 |
| 中间 | Markdown 编辑 + 实时预览，可切换「编辑 / 分栏 / 预览」 |
| 右侧 | 文章设置（标题、日期、封面、摘要、标签、置顶）与发布面板 |
| 顶部 | 返回首页、写作 / 站点参数页签、保存状态、保存按钮 |

**主要能力**

- **新建文章**：标题自动转拼音 slug（可手改），分类支持直接输入新目录；勾选「先存为草稿」写入 `public/content/_drafts`
- **实时预览**：与线上文章页共用同一套 `marked` + `DOMPurify` + `highlight.js` 管线，所见即所得
- **封面**：点击上传、`Ctrl+V` 粘贴、拖入图片，统一保存到 `public/img/covers/`；也可以直接填写图片地址
- **正文图片**：编辑区粘贴截图，自动保存到 `public/content/<分类>/<slug>/` 并插入引用
- **附件**：上传 PDF / Word / Excel，自动生成同名 `.desc.json`，之后可在树中点击该文件继续编辑元数据
- **即时生效**：保存后 dev server 监听 `public/content` 自动重建导航数据，首页、归档、搜索、标签立即出现新文章，无需重启；同时静默整页刷新以免打断写作
- **草稿发布**：把草稿移入正式分类，自动写日期、迁移配图目录并改写正文中的图片引用
- **发布到线上**：「保存版本」执行 `git add public/content`（含封面目录）+ `git commit`；「发布到线上」执行 `git push`，**推送前必须二次确认**，服务端也要求显式确认标志
- **本地缓存**：编辑内容 1.5 秒防抖写入 `localStorage`，意外关闭后可在顶部横幅「恢复 / 丢弃」
- **局域网写作**：默认只允许本机访问；在 `.env` 设置 `STUDIO_TOKEN` 后，手机 / 平板访问 `http://<内网IP>:1022/studio` 并输入同一口令即可

**快捷键**：`Ctrl + S` 保存、`Tab` 缩进；正文区粘贴截图即上传图片。

### 5.2 内容命令行（CLI）

不习惯图形界面时，用命令行完成同样的动作：

```bash
# 新建文章（--draft 存入草稿箱）
pnpm content:new "Vue 3 组合式 API 实战" --dir 前端开发 --tags Vue,TypeScript --cover /img/d2.webp

# 检查全部内容：frontmatter、摘要、封面是否存在、路由冲突、附件缺 .desc.json
pnpm content:check
pnpm content:check --json --no-drafts   # CI 友好，存在阻断项时退出码为 1

# 草稿发布到指定分类
pnpm content:publish _drafts/vue-3-zu-he-shi-api-shi-zhan.md --dir 前端开发
```

CLI 只负责写文件与校验，不会自动提交；导航数据会在下一次 `pnpm dev` / `pnpm build` 时重建（若 dev server 正在运行则实时重建）。

### 5.3 支持的格式与元数据

| 格式 | 扩展名 | 元数据来源 | 内置回退封面 |
| --- | --- | --- | --- |
| Markdown | `.md` | YAML Frontmatter | 无 |
| HTML | `.html` | `.desc.json` / `.desc.yaml`，或 `<title>`、`<meta name="description">` | `/img/d2.webp` |
| 纯文本 | `.txt` | `.desc.json` / `.desc.yaml`，或首行标题 | `/img/d3.webp` |
| PDF | `.pdf` | `.desc.json` / `.desc.yaml` | `/img/d7.webp` |
| Word | `.docx` | `.desc.json` / `.desc.yaml` | `/img/d7.webp` |
| Excel | `.xlsx` | `.desc.json` / `.desc.yaml` | `/img/d7.webp` |

### 5.4 Markdown Frontmatter

```markdown
---
title: 文章标题
date: 2025-12-05
cover: /img/d1.webp
desc: 首页卡片摘要
tags: [Vue, TypeScript, 教程]
sticky: true
---

正文从这里开始。
```

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | String | 否 | 文章标题，缺省为文件名 |
| `date` | Date / String | 否 | 发布日期，支持 `2025-12-05` 或完整 ISO 时间；缺省用文件修改时间 |
| `cover` | String | 否 | 封面图路径，以 `/` 开头则相对 `public` |
| `desc` | String | 否 | 摘要，显示在首页卡片；缺省取正文首行前 120 字符 |
| `tags` | Array | 否 | 标签，参与标签筛选与热门标签统计 |
| `sticky` | Boolean | 否 | `true` 时置顶 |

创作台保存时会重写 frontmatter 区块，未知字段会原样保留，正文内容不受影响。

### 5.5 非 Markdown 元数据

与文档同名创建 `.desc.json` 或 `.desc.yaml`，例如 `sample.pdf` 对应 `sample.pdf.desc.json`：

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

> **易错点**：非 Markdown 文件的摘要字段是 `excerpt`；Markdown 的摘要字段是 `desc`。两者不通用。创作台上传附件时会自动生成这个文件，摘要字段已按 `excerpt` 填好。

### 5.6 构建扫描规则

构建插件 `tooling/vite-plugin-gen-nav.ts`（逻辑在 `tooling/content-core.ts`）会递归扫描 `public/content`：

- **跳过**：以 `_` 开头的文件或目录（可作为草稿区），例如 `_drafts/idea.md`
- **路由**：文件相对路径去掉扩展名，例如 `2025/blog.md` → `/2025/blog`
- **文件 URL**：`/content` + 路由 + 扩展名，例如 `/content/2025/blog.md`
- **日期缺省**：未提供 `date` 时使用文件的最后修改时间
- **标题缺省**：未提供 `title` 时使用文件名
- **摘要缺省**：Markdown 取正文首行前 120 个字符；非 Markdown 取 `excerpt` 字段
- **封面回退**：见 5.3 表格；相对封面在子路径部署时会自动拼接 `VITE_BASE`
- **产物**：`public/generated/nav-version-<版本>.json`、`tree-version-<版本>.json`，同时保留 `nav.json`、`tree.json` 作为兼容回退
- **优先级**：存在 `.desc.json` / `.desc.yaml` 时，其字段优先于文件内解析结果

### 5.7 目录组织

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
├── 笔记/
│   └── 读书笔记.md
└── _drafts/                     # 草稿，构建时忽略
    └── idea.md
```

- 目录层级直接映射为左侧导航树，建议不超过 3 层
- 文件名即 URL 片段，建议使用英文、数字与连字符
- 图片可放 `public/img`（公共）、`public/img/covers`（封面）或文章同级目录（专属）
- 删除或重命名文章后重新构建即可，导航数据每次构建都会重建

### 5.8 图片与封面资源

| 用途 | 位置 | 引用写法 |
| --- | --- | --- |
| 公共图片 | `public/img/` | `/img/d1.webp` |
| 创作台上传封面 | `public/img/covers/` | `/img/covers/cover-<时间戳>.png` |
| 文章专属图片 | `public/content/<分类>/<slug>/` | `/content/2025/文章名/a.png` |
| 站点背景 | `public/bg/` | 由主题设置选择，构建时自动扫描并转 WebP（最大宽 1920，质量 82） |

## 六、环境变量全量参考

复制 `.env.example` 为 `.env` 后修改（`pnpm bootstrap` 会自动完成）。下表列出每个变量的默认值、可选值与影响范围；标号 6.10 说明了在创作台中直接编辑与导出的方式。

### 6.1 构建与部署

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_BASE` | `/` | 部署基础路径，参与路由 base、静态资源、文章封面拼接。子路径部署必须修改 |
| `VITE_APP_VERSION` | 空 | 页脚展示的语义化版本；留空显示 `vYYYY.MM.DD`，仅用于展示 |

### 6.2 站点信息

| 变量 | 默认值 | 影响位置 |
| --- | --- | --- |
| `VITE_SITE_ICON` | `Pj` | Logo 方块首字符、加载动画 |
| `VITE_SITE_TITLE` | `Pjfun Blog` | 标签页标题、导航栏、页脚、PWA `name` |
| `VITE_SITE_DESCRIPTION` | `零后端、纯静态、顶级动效、全球秒开的个人博客系统` | SEO description、PWA `description` |
| `VITE_SITE_AUTHOR` | `Simon` | SEO 作者字段 |
| `VITE_SITE_KEYWORDS` | `博客,技术分享,前端开发,Vue,TypeScript` | `meta keywords`，英文逗号分隔 |
| `VITE_SITE_EMAIL` | `admin@pjfun.com` | 页脚邮件按钮 |
| `VITE_SITE_URL` | `https://pjfun.top` | RSS / Atom / Feed / Sitemap / 结构化数据的绝对地址，结尾不要带 `/` |

### 6.3 首屏与提示文案

| 变量 | 默认值 | 触发场景 |
| --- | --- | --- |
| `VITE_LOADING_TEXT` | `Loading` | 首屏加载动画 |
| `VITE_JS_DISABLED_NOTICE` | `请开启 JavaScript` | `<noscript>` |
| `VITE_RESOURCE_LOAD_FAILED_TEXT` | `资源加载失败,请刷新` | CDN 资源全部加载失败 |
| `VITE_REFRESH_REQUIRED_TEXT` | `页面需要刷新以完成更新...` | 新版本就绪、需要刷新 |

### 6.4 社交、页脚与热榜

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_SOCIAL_GITHUB` | 项目仓库 | 社交按钮，同时解析 `owner/repo` 供「数据管理」入口拼接在线 IDE 地址 |
| `VITE_SOCIAL_TELEGRAM` | 项目频道 | 页脚 Telegram 按钮 |
| `VITE_FOOT_GITHUB` | 项目仓库 | 页脚 GitHub 按钮 |
| `VITE_HOT_RANK_URL` | `https://www.pjfun.top/fun/rank` | 首页「热榜新闻」入口；留空仍会渲染按钮，建议替换为自有地址 |

### 6.5 Giscus 评论

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_GISCUS_ENABLED` | `true` | 关闭后文章页不渲染评论区 |
| `VITE_GISCUS_CLIENT_SRC` | `https://giscus.app/client.js` | 客户端脚本地址 |
| `VITE_GISCUS_REPO` | `LXC-9349/blog-comment` | 存放评论的仓库（owner/repo） |
| `VITE_GISCUS_REPO_ID` | 项目默认值 | 仓库 ID |
| `VITE_GISCUS_CATEGORY` | `Announcements` | Discussion 分类名 |
| `VITE_GISCUS_CATEGORY_ID` | 项目默认值 | 分类 ID |
| `VITE_GISCUS_MAPPING` | `pathname` | 映射方式：`pathname` / `url` / `title` / `og:title` / `specific` |
| `VITE_GISCUS_STRICT` | `false` | 严格匹配标题 |
| `VITE_GISCUS_REACTIONS` | `true` | 启用表情回应 |
| `VITE_GISCUS_METADATA` | `false` | 发送页面元数据 |
| `VITE_GISCUS_POSITION` | `top` | 输入框位置：`top` / `bottom` |
| `VITE_GISCUS_LANG` | `zh-CN` | 评论界面语言 |

> 修改 `VITE_GISCUS_REPO` 等仓库信息时，必须同步更新两个 ID，否则评论区无法加载。

### 6.6 站点统计

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_BUSUANZI_ENDPOINT` | `https://busuanzi.ibruce.info/busuanzi` | 不蒜子 JSONP 接口，超时 8 秒后降级 |
| `VITE_PING0_IMAGE_URL` | `https://ping0.cc/img1` | 首页访客 IP 信息图；不可用时卡片隐藏 |

### 6.7 热门标签

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_HOT_TAGS` | 空 | 手动指定，英文逗号分隔；留空按文章标签出现频次自动生成 |
| `VITE_HOT_TAGS_LIMIT` | `12` | 自动生成的最大数量，非正数时回退为 12 |

### 6.8 密码保护

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `BLOG_PASSWORD` | 空 | 明文密码，构建时生成 PBKDF2 哈希；优先级最高（不要加 `VITE_` 前缀） |
| `VITE_BLOG_PASSWORD_HASH` | 空 | 直接提供哈希，支持 PBKDF2 与旧版 SHA256 |

### 6.9 外观默认值

| 变量 | 默认值 | 取值范围 / 可选值 |
| --- | --- | --- |
| `VITE_DEFAULT_BACKGROUND` | 空 | `public/bg` 文件名（不含扩展名）；子目录用 `目录-文件名`，如 `bb-1` |
| `VITE_DEFAULT_FONT` | `system` | 见 7.2 字体清单 |
| `VITE_DEFAULT_CURSOR` | `default` | `default` / `arrow` / `dot` / `ring` / `target` / `crosshair` |
| `VITE_DEFAULT_ACCENT_H` | `25` | 0 – 360 |
| `VITE_DEFAULT_ACCENT_S` | `94` | 0 – 100 |
| `VITE_DEFAULT_ACCENT_L` | `53` | 0 – 100（对应 500 色阶） |
| `VITE_DEFAULT_AUTO_ROTATE` | `false` | `true` / `false` |
| `VITE_DEFAULT_ROTATE_INTERVAL` | `12` | 秒，建议 5 – 60 |
| `VITE_DEFAULT_KEN_BURNS` | `false` | `true` / `false` |
| `VITE_DEFAULT_OVERLAY` | `35` | 0 – 90，步进 5 |
| `VITE_DEFAULT_EFFECT_ENABLED` | `true` | `true` / `false` |
| `VITE_DEFAULT_PETAL_TYPES` | `yinxing,yinghua1` | 多选逗号分隔，见 7.2 粒子类型 |
| `VITE_DEFAULT_PETAL_COUNT` | `50` | 6 – 150 |
| `VITE_DEFAULT_ROTATION_SPEED` | `1` | 0 – 5 |
| `VITE_DEFAULT_HORIZONTAL_SPEED` | `0.5` | -3 – 3 |
| `VITE_DEFAULT_VERTICAL_SPEED` | `1.5` | 0.1 – 5 |
| `VITE_DEFAULT_PETAL_SWING` | `60` | 0 – 160 |
| `VITE_DEFAULT_PETAL_Z_INDEX` | `-5` | -10 – 999 |

### 6.10 在创作台编辑参数并导出部署配置

`/studio` 顶部的「站点参数」页提供 8 个分组、38 个常用参数（站点信息、社交与链接、内容展示、外观默认值、Giscus 评论、构建与部署、安全）的表单化编辑：

- 保存写入本地 `.env`，**保留原有注释与未纳管的变量**，只更新白名单内的键
- 首次保存时若没有 `.env`，会自动从 `.env.example` 复制一份
- 写入后 Vite 检测到 `.env` 变化会自动重启 dev server，刷新页面即生效
- 「导出部署配置」可生成 `.env` / GitHub Actions YAML / JSON 三种格式，支持复制或下载；默认只导出**与默认值不同的项**，可切换为导出全部非空项
- `STUDIO_TOKEN` 仅用于本地创作台访问控制，永远不会被导出；包含 `BLOG_PASSWORD` 时界面会提示改用平台的加密变量

`.env` 已被 `.gitignore` 忽略，因此托管平台需要在各自的环境变量设置中配置一份，具体见 12.5。


## 七、系统参数手册（src/constants）

所有业务参数集中在 `src/constants`，`index.ts` 只做统一出口。修改后需重新构建（开发模式下重启 `pnpm dev` 生效）。

### 7.1 site.ts — 站点、评论与统计

包含 `SITE_CONFIG`（站点信息、页脚、热榜、首屏文案）、`GISCUS_CONFIG`、`SITE_STATS_CONFIG`。其中 `SITE_STATS_CONFIG.timeout` 为不蒜子请求超时，固定 **8000 ms**，超时后页脚显示「统计服务暂时不可用」。

### 7.2 appearance.ts — 外观

`APPEARANCE_DEFAULTS` 保存全部外观默认值（可由 `VITE_DEFAULT_*` 覆盖），`APPEARANCE_LIMITS` 定义设置面板中滑杆的边界。

**可调范围**

| 参数 | 最小值 | 最大值 | 步进 |
| --- | --- | --- | --- |
| `overlay`（遮罩浓度） | 0 | 90 | 5 |
| `autoRotateInterval`（轮播间隔，秒） | 5 | 60 | 1 |
| `petalCount`（粒子数量） | 6 | 150 | 1 |
| `rotationSpeed`（旋转速度） | 0 | 5 | 0.1 |
| `horizontalSpeed`（水平速度） | -3 | 3 | 0.1 |
| `verticalSpeed`（垂直速度） | 0.1 | 5 | 0.1 |
| `petalSwing`（飘摆幅度） | 0 | 160 | 5 |
| `petalZIndex`（显示层级） | -10 | 999 | 1 |

**字体清单（13 种）**

| id | 名称 | 加载方式 |
| --- | --- | --- |
| `system` | 系统默认 | 本地系统字体 |
| `system-serif` | 系统宋体 | 本地系统字体 |
| `system-kai` | 系统楷体 | 本地系统字体 |
| `noto-sans` | 思源黑体 | 在线（Noto Sans SC） |
| `noto-serif` | 思源宋体 | 在线（Noto Serif SC） |
| `misans` | 小米 MiSans | 在线 |
| `harmony` | 鸿蒙 HarmonyOS Sans | 在线 |
| `wenkai` | 霞鹜文楷 | 在线 |
| `smiley` | 得意黑 | 在线 |
| `zcool-kuaile` | 站酷快乐体 | 在线 |
| `zcool-xiaowei` | 站酷小薇体 | 在线 |
| `ma-shan-zheng` | 马善政楷书 | 在线 |
| `long-cang` | 龙藏体 | 在线 |

在线字体通过 `FONT_CDN` 加载：主源 `https://cdn.jsdmirror.cn/npm`，失败自动降级 `https://unpkg.com`。`FONT_LOADING.stylesheetTimeout` 为单个样式表超时（8000 ms），`FONT_LOADING.preloadConcurrency` 为设置面板预览预加载并发数（3）。

**主题色预设（HSL，l 对应 500 色阶）**

| id | 名称 | H | S | L |
| --- | --- | --- | --- | --- |
| `orange` | 暖橙 | 25 | 94 | 53 |
| `rose` | 玫瑰 | 344 | 82 | 56 |
| `violet` | 紫罗兰 | 262 | 80 | 58 |
| `blue` | 碧海 | 212 | 92 | 52 |
| `cyan` | 青碧 | 188 | 88 | 42 |
| `green` | 松石 | 158 | 72 | 42 |

**鼠标样式**

`default`（系统默认）、`arrow`（精致箭头）、`dot`（主题圆点）、`ring`（主题光环）、`target`（主题准星）、`crosshair`（系统十字）。除 `default` 与 `crosshair` 外，样式颜色跟随主题色动态生成。

**粒子类型**

| id | 名称 | 主色 |
| --- | --- | --- |
| `yinxing` | 银杏 | `#ffcf4d` |
| `yinghua1` | 樱花 | `#ffc2d1` |
| `fengye` | 枫叶 | `#f4a261` |
| `meihua` | 梅花 | `#f7a8c4` |
| `yumao` | 羽毛 | `#dbeafe` |
| `xingxing` | 星星 | `#ffe082` |

**背景清单**

`public/bg` 下的图片由 `tooling/vite-plugin-gen-backgrounds.ts` 自动扫描并生成 `bg/backgrounds.json`，无需手工维护。构建时会把 jpg/png 转为 WebP：最大宽度 **1920**，质量 **82**，并清理被替代的原图。子目录中的图片 id 采用 `目录-文件名` 形式（如 `bb/1.jpg` → `bb-1`）。

### 7.3 screensaver.ts — 屏保

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `interval` | `8` | 图片轮播间隔（秒）；视频循环播放，不受此值控制 |
| `fullscreen` | `true` | 启动时请求浏览器全屏，不支持时降级为沉浸覆盖层 |
| `mediaLoadTimeout` | `15000` | 视频 / B 站加载超时（毫秒） |
| `controlsHideDelay` | `3000` | 控制条自动隐藏延时（毫秒） |
| `minInterval` | `3` | 最小切换间隔（秒） |
| `maxSwitchRetry` | `8` | 随机切换最大重试次数，避免连续重复 |
| `clips` | 7 个源 | 视频源列表，支持直链 MP4 与 B 站 BV 号 |

默认视频源：

| id | 类型 | 内容 |
| --- | --- | --- |
| `bilibili-1` | Bilibili | `BV1qRqPYGEpq` |
| `bilibili-2` | Bilibili | `BV1XDmjYfEGz` |
| `bilibili-3` | Bilibili | `BV1qk4y1u7R8` |
| `ocean` | MP4 | Pexels 海浪 |
| `nature` | MP4 | Pexels 自然 |
| `tech` | MP4 | Pexels 科技 |
| `city` | MP4 | Pexels 城市 |

### 7.4 home.ts — 首页

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `pageSize` | `12` | 每次加载的文章数量 |
| `scrollTopThreshold` | `300` | 显示「回到顶部」的滚动阈值（px） |
| `headerScrollThreshold` | `20` | Header 进入紧凑模式的滚动阈值（px） |
| `backgroundRotateMinInterval` | `5` | 背景自动轮播的最小间隔（秒） |
| `loadMoreCooldown` | `240` | 追加下一页后的冷却时间（ms），避免一次滚动连续追加 |

### 7.5 search.ts — 搜索

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `cacheTtl` | `300000`（5 分钟） | 搜索与导航数据缓存有效期 |
| `maxResults` | `10` | 搜索结果最大条数 |
| `debounceMs` | `180` | 输入防抖时间（ms） |
| `cacheEntries` | `30` | 搜索词缓存条数上限 |

### 7.6 article.ts — 文章详情

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `saveThrottleMs` | `3000` | 阅读进度保存节流（毫秒） |
| `swipeThreshold` | `60` | 左右滑动切换文章的触发距离（px） |
| `backToTopThreshold` | `300` | 显示「回到顶部」的滚动阈值（px） |
| `progressHideDelay` | `1500` | 停止滚动后进度条隐藏延时（毫秒） |
| `tocGenerateDelay` | `200` | 生成文章目录的延迟（毫秒） |

### 7.7 ui.ts — 通用交互

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `dialogZIndex` | `10000` | 自定义对话框层级 |
| `dialogCloseAnimationMs` | `200` | 对话框关闭动画时长（毫秒） |
| `toastAutoCloseMs` | `3000` | 成功 / 信息提示时长 |
| `toastErrorAutoCloseMs` | `5000` | 错误提示时长 |
| `toastWarnAutoCloseMs` | `4000` | 警告提示时长 |
| `scrollbarHideDelay` | `900` | 滚动条自动隐藏延时（毫秒） |
| `scrollToTopDuration` | `1` | 回到顶部滚动时长（秒） |

### 7.8 effects.ts — 粒子特效

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `mouseRadius` | `110` | 鼠标避让半径（px） |
| `maxSpecialPetals` | `48` | 场景内发光粒子上限 |
| `clickSpawnCount` | `3` | 每次点击生成的粒子数 |
| `iconScale` | `1.35` | SVG 图标相对粒子尺寸的缩放 |
| `maxDpr` | `2` | 画布最大像素比，避免高 DPR 屏幕带来额外开销 |
| `clickBottomSafeArea` | `80` | 底部不生成粒子的安全区高度（px） |

### 7.9 preview.ts — 文档预览

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `luckysheetVersion` | `2.1.13` | Excel 预览内核版本 |
| `luckyexcelVersion` | `1.0.1` | xlsx 转换库版本 |
| `jqueryVersion` | `3.7.1` | Luckysheet 依赖 |
| `pdfWorkerMirrors` | 4 个源 | PDF worker 多源地址，按序尝试 |

PDF worker 源按优先级为：`unpkg.pjfun.top` → `unpkg.com` → `cdn.jsdelivr.net/npm` → `esm.sh`。Luckysheet 与 jQuery 通过主 CDN 加载，属于按需资源，不进入首屏。

### 7.10 security.ts — 密码安全

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `pbkdf2Iterations` | `100000` | PBKDF2 迭代次数 |
| `keySizeWords` | `8` | 派生密钥长度（32 位字 × 8 = 256 bit） |

### 7.11 bilibili.ts — B 站播放

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `proxyBase` | `https://jx.ouo.chat/bl/?url=` | 代理地址，302 到带签名的 MP4，可直接交给 `video` 播放 |
| `parseApi` | `https://api.xingzhige.com/API/b_parse/` | 代理失败时的直链解析兜底 |
| `parseTimeout` | `10000` | 解析请求超时（毫秒） |
| `cacheMinTtl` | `60000` | 直链缓存最小剩余有效期（毫秒） |
| `cacheFallbackTtl` | `120000` | 无 deadline 时的缓存时长（毫秒） |

### 7.12 misc.ts — 标签与版本检查

| 项 | 默认值 | 说明 |
| --- | --- | --- |
| `HOT_TAGS` | 空 | 来自 `VITE_HOT_TAGS` |
| `HOT_TAGS_LIMIT` | `12` | 来自 `VITE_HOT_TAGS_LIMIT`，非正数回退 12 |
| `VERSION_CHECK.interval` | `245000`（约 4 分钟） | 新版本轮询间隔 |
| `VERSION_CHECK.snoozeMinutes` | `30` | 点击「稍后提醒」后的静默时长 |

### 7.13 storage.ts — 本地存储

| 键名 | 用途 |
| --- | --- |
| `pjfun_blog_favorites` | 收藏列表 |
| `pjfun_blog_reading_progress` | 阅读进度（最多 20 条） |
| `pjfun_blog_recent_articles` | 最近浏览（最多 5 条） |
| `pjfun_blog_search_cache` | 搜索缓存 |
| `pjfun_blog_nav_data_cache` | 导航数据缓存 |
| `pjfun_blog_nav_tree_state` | 目录树展开状态 |
| `pjfun_blog_appearance` | 外观个性化配置 |
| `blog-access-pwd` | 已通过校验的访问密码 |
| `theme` | 深浅色主题 |
| `language` | 界面语言 |
| `redirect-after-login` | 登录后跳转路径（会话级） |
| `redirectUrl` | SPA 重定向地址（会话级） |
| `pj_blog_web_version` | 客户端记录的版本号 |
| `pjfun_studio_token` | 创作台局域网访问口令（仅开发环境） |
| `pjfun_studio_draft:<文件>` | 创作台未保存的编辑内容备份（仅开发环境） |

`STORAGE_LIMITS` 控制两个列表上限：阅读进度 20 条，最近浏览 5 条。

### 7.14 studio.ts / studio-settings.ts — 创作台参数（仅开发环境）

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `apiPrefix` | `__studio/api` | 创作台接口前缀 |
| `navRebuildDebounceMs` | `300` | 内容变更后重建导航的防抖时间 |
| `reloadMuteMs` | `2500` | 保存后静默整页刷新的时长 |
| `autosaveDraftMs` | `1500` | 编辑内容写入本地缓存的防抖时间 |
| `uploadMaxBytes` | `10485760`（10 MB） | 单个上传文件大小上限 |
| `imageExtensions` | png / jpg / jpeg / webp / gif / avif / svg | 允许上传的图片格式 |
| `attachmentExtensions` | pdf / doc / docx / xls / xlsx | 允许上传的附件格式 |
| `draftDir` | `_drafts` | 草稿目录（构建忽略） |
| `coverDir` | `img/covers` | 封面上传目录（相对 `public`） |
| `commitMessageTemplate` | `docs(content): {title}` | 提交信息模板 |
| `maxTreeDepth` | `4` | 创作台目录树最大层级 |

`studio-settings.ts` 是「站点参数」页的白名单：8 个分组、38 个可编辑环境变量，含类型、取值范围、可选值与提示；`exportable: false` 的键（如 `STUDIO_TOKEN`）不参与部署导出。创作台接口只接受白名单内的键，写入 `.env` 时保留注释与其他变量。

## 八、主题设置与屏保

首页右上角「主题设置」按钮打开面板，包含六个分组：

| 分组 | 可调项 |
| --- | --- |
| 背景 | 选择 `public/bg` 中的图片、遮罩浓度、自动轮播与间隔、缓慢缩放 |
| 字体 | 系统默认 / 系统宋体 / 系统楷体 + 10 种在线中文字体，带预览与失败回退 |
| 主题色 | 6 套预设 + 色相 / 饱和度 / 明度滑杆，全站色阶实时同步 |
| 特效 | 飘落粒子类型（多选）、数量、旋转 / 水平 / 垂直速度、飘摆幅度、显示层级 |
| 鼠标 | 系统默认、精致箭头、主题圆点、主题光环、主题准星、系统十字 |
| 屏保 | 启动全屏屏保、设置说明与特效提示 |

屏保默认播放视频（直链 MP4 与 B 站 BV 号，配置在 `src/constants/screensaver.ts`），可在屏保内切换「仅图片」、静音、暂停、下一张，按 ESC 或右上角关闭退出。视频加载失败会自动跳过并重试，B 站代理失败时回退第三方直链解析。未配置 `poster` 时，占位图自动取自 `public/bg` 中的图片。

个性化设置保存在浏览器 `localStorage`（`pjfun_blog_appearance`），不会影响其他访客；站点级默认值由 `VITE_DEFAULT_*` 决定（见 6.9）。

## 九、评论与统计

- **评论**：由 Giscus 提供，基于 GitHub Discussions。前往 <https://giscus.app/zh-CN> 生成配置，填入 `.env` 的 `VITE_GISCUS_*` 变量（见 6.5）。`VITE_GISCUS_ENABLED=false` 可完全关闭。评论仓库需要公开并安装 giscus App，否则评论区为空。
- **统计**：页脚访客数与访问量来自不蒜子（`VITE_BUSUANZI_ENDPOINT`），首页访客信息卡来自 ping0（`VITE_PING0_IMAGE_URL`）。两者均为第三方服务，请求超时 8 秒后自动降级或隐藏，不影响其他功能。

## 十、密码保护机制

### 10.1 配置方式

```env
# 方式一（推荐）：明文密码，构建时自动哈希；不要加 VITE_ 前缀
BLOG_PASSWORD=your_password

# 方式二：直接填哈希
# PBKDF2 格式：iterations$salt_base64$hash_base64
# 兼容旧版 64 位 SHA256 十六进制
VITE_BLOG_PASSWORD_HASH=your_hash
```

- 两项都为空：不启用密码保护
- `BLOG_PASSWORD` 存在时，构建插件会生成新的 PBKDF2 哈希并覆盖 `VITE_BLOG_PASSWORD_HASH`

### 10.2 哈希格式

新格式（PBKDF2-SHA256）：

```
iterations$salt_base64$hash_base64
```

- 迭代次数 100000，密钥长度 256 bit，盐随机生成（128 bit）
- 校验使用恒定时间比较，降低时序攻击风险

兼容旧格式：64 位十六进制 SHA256 哈希，可用以下命令生成：

```bash
node scripts/generate-password-hash.js your_password
```

### 10.3 访问流程

1. 构建时检测到哈希存在，路由表追加 `/password`
2. 路由守卫在每次跳转时校验 `localStorage` 中的 `blog-access-pwd`
3. 未通过校验时记录目标路径，重定向到 `/password`
4. 校验通过后跳回原路径

密码保护是纯前端的访问门槛，适合个人站点简单防护；高安全场景请使用服务端鉴权。创作台的 `STUDIO_TOKEN` 是另一套独立机制，只限制开发环境下的内容写入接口。

## 十一、构建产物与缓存策略

PJ Blog 针对「静态托管 + CDN + PWA」易出现的旧版本问题做了多层设计。

### 11.1 构建版本

- 构建版本为毫秒时间戳，可通过 `PJ_BUILD_VERSION` 复用（Vite 会多次解析配置，固定版本可避免文件名错位）
- 版本号注入三处：客户端常量 `__APP_VERSION__`、根目录 `version.json`（`{ "v": "<版本>" }`）、Service Worker 文件名 `sw-<版本>.js`
- 导航数据文件名同样绑定版本：`nav-version-<版本>.json` / `tree-version-<版本>.json`

### 11.2 首屏版本守卫

`index.html` 内联脚本在首屏对比 `version.json`：若服务端版本高于当前页面版本，带 `_v` 参数重载；`sessionStorage` 记录已重载的版本，避免刷新死循环。应用启动后会清理该临时查询参数。

### 11.3 运行期检查

每 **245 秒**轮询一次 `version.json`，发现新版本时弹出提示：

- **立即更新**：刷新页面
- **稍后提醒**：静默 **30 分钟**

`VITE_APP_VERSION` 只影响页脚展示，不参与版本比较。

### 11.4 PWA 与运行时缓存

| 策略 | 规则 | 时长 / 容量 |
| --- | --- | --- |
| HTML 导航 | NetworkFirst，超时 3 秒 | 5 条 / 1 天 |
| 导航数据（`generated/*.json`） | NetworkFirst，超时 5 秒 | 10 条 / 24 小时 |
| 文章内容（`content/*`） | NetworkFirst，超时 10 秒 | 50 条 / 7 天 |
| 图片 | CacheFirst | 100 条 / 30 天 |

预缓存只包含 `js / css / ico / svg`；`img/`、`bg/` 与重型 vendor chunk 不预缓存；`index.html` 不预缓存且关闭 `navigateFallback`，确保每次导航都能拿到最新入口。单文件预缓存上限 5 MB。

### 11.5 CDN 与代码分割

- 生产构建将 `vue`、`vue-router` 外置，按 jsdelivr → unpkg → esm.sh 依次尝试，并注入多个国内镜像作为备份
- 开发模式不启用 CDN，全部使用本地依赖
- `highlight.js`、`pdfjs-dist`、`mammoth` 及其依赖各自独立 chunk，仅由异步路由触发
- Markdown 解析链路（`marked`、`marked-gfm-heading-id`、`dompurify`）合并为 `vendor.markdown`，不进入首屏
- 生产使用 terser 压缩，移除 `console.log` / `console.info` 与注释

### 11.6 图片与订阅产物

- `vite-plugin-image-optimizer`：png/jpeg 质量 80，webp 质量 75，GIF 优化级别 3
- 背景图构建期转 WebP（最大宽 1920，质量 82）
- 构建同时输出 `rss.xml`、`atom.xml`、`feed.json`、`sitemap.xml`

### 11.7 开发环境的差异

`pnpm dev` 下创作台会监听 `public/content`，保存文章后重建导航数据（原子写：先写临时文件再改名，避免刷新瞬间读到半截 JSON）。这些插件与接口在生产构建中完全不存在。

## 十二、部署上线

构建产物在 `dist/`，包含 `index.html`、`static/`、`content/`、`bg/`、`rss.xml`、`atom.xml`、`feed.json`、`sitemap.xml`、`version.json`、`sw-<ver>.js`。

### 12.1 基础路径

`VITE_BASE` 必须与最终访问路径一致：

| 部署方式 | 取值 |
| --- | --- |
| 独立域名根目录 | `/` |
| GitHub Pages 项目页 | `/仓库名/` |
| 子目录反向代理 | `/子目录/` |

修改后必须重新构建，否则会出现路由 404 或静态资源白屏。

### 12.2 平台一览

| 平台 | 方式 | 说明 |
| --- | --- | --- |
| Vercel | [一键部署](https://vercel.com/new/clone?repository-url=https://github.com/LXC-9349/pjfun-blog) | 示例：<https://pjfun-blog.vercel.app/> |
| EdgeOne Pages（国内） | [一键部署](https://console.cloud.tencent.com/edgeone/pages/new?template=https://github.com/LXC-9349/pjfun-blog) | 示例：<https://cnblog.pjfun.top/> |
| EdgeOne Pages（国际） | [一键部署](https://console.tencentcloud.com/edgeone/pages/new?template=https://github.com/LXC-9349/pjfun-blog) | `esa.jsonc` 已配置 SPA 回退 |
| Cloudflare Workers | [一键部署](https://deploy.workers.cloudflare.com/?url=https://github.com/LXC-9349/pjfun-blog/tree/main) | `wrangler.jsonc` 指向 `dist` |
| Netlify | [一键部署](https://app.netlify.com/start/deploy?repository=https://github.com/LXC-9349/pjfun-blog) | `netlify.toml` 已配置构建命令 |
| GitHub Pages | 推送 `main` 自动部署 | `.github/workflows/deploy.yml`，需设置 `VITE_BASE` |
| Docker / Nginx | `docker build` + `deploy/nginx.conf` | 见 12.4 |

### 12.3 平台配置文件

| 文件 | 作用 |
| --- | --- |
| `.github/workflows/deploy.yml` | GitHub Pages 自动部署，Node 20，设置 `VITE_BASE=/pjfun-blog/`，构建前安装 `libvips-dev` |
| `netlify.toml` | `npm run build` → `dist`，Node 20，可选 Lighthouse 插件 |
| `wrangler.jsonc` | Cloudflare Workers：入口 `scripts/worker.js`，静态目录 `./dist` |
| `esa.jsonc` | 腾讯云 EdgeOne Pages：`npm install` 安装，`dist` 输出，SPA 回退 |
| `deploy/nginx.conf` | SPA 回退与静态资源缓存（由 Dockerfile 复制进镜像） |
| `Dockerfile` / `docker-compose.yml` | Nginx 镜像，默认映射 `1022:80` |

### 12.4 Docker

```bash
docker build -t pjfun-blog .
docker run -d --restart=always --name blog -p 1022:80 --env-file .env pjfun-blog

# 或
docker compose up -d
```

镜像基于 Nginx，`deploy/nginx.conf` 已包含 SPA 回退与静态资源缓存策略。

### 12.5 部署参数同步

本地 `.env` 不会进入 Git，因此每个平台都需要一份配置：

1. 在创作台「站点参数」页确认参数无误，点击**导出部署配置**
2. 选择格式：
   - **`.env`**：Vercel / EdgeOne / Netlify 逐条粘贴，或 Docker 重命名为 `.env` 后 `--env-file` 使用
   - **GitHub YAML**：`env:` 块可直接放进 workflow，或据此创建 Repository Variables / Secrets
   - **JSON**：适合脚本或支持批量导入的平台
3. 敏感项（`BLOG_PASSWORD`）只放入平台的加密 Secrets，不要写进仓库文件；使用非 `VITE_` 前缀避免明文进入产物
4. GitHub Pages 记得把 `VITE_BASE` 改成 `/仓库名/`
5. 复制、下载或按提示逐条粘贴即可，导出内容不包含 `STUDIO_TOKEN`

### 12.6 写作到上线的日常流程

```bash
pnpm start                       # 一键搭建并启动
# 打开 http://localhost:1022/studio 写文章 → 保存
# 右侧「保存版本」→ 确认后「发布到线上」
```

推送 `main` 后，GitHub Actions 会自动构建并部署；线上通过版本守卫与轮询提示刷新，无需手动清缓存。

## 十三、项目结构

```
pjfun-blog/
├── public/
│   ├── bg/                     # 背景图，构建时自动生成 backgrounds.json 并转 WebP
│   ├── content/                # 全部文章与文档（_drafts 为草稿）
│   ├── generated/              # 构建产物：nav.json / tree.json（版本化文件名）
│   ├── img/                    # 公共图片、PWA 图标；covers/ 为创作台上传的封面
│   ├── favicon.ico             # 站点图标（浏览器默认请求 /favicon.ico）
│   ├── 404.html
│   └── pj_public.js            # CDN 加载与多源回退
├── src/
│   ├── studio/                 # 本地创作台：页面、编辑器、预览、设置与发布面板
│   ├── components/             # 站点组件（ui/ 与 preview/ 子目录）
│   ├── constants/              # 全部配置常量（按职责拆分，含 studio.ts / studio-settings.ts）
│   ├── pages/                  # 首页 / 归档 / 收藏 / 文章详情
│   ├── plugins/seo.ts
│   ├── utils/                  # 外观、密码、Markdown、slug、统计、版本检查等
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
│   ├── content-core.ts         # 内容扫描、校验、读写与导航生成（创作台 / CLI 共用）
│   ├── content-bus.ts          # dev 下导航重建与静默刷新通道
│   └── env-config.ts           # 创作台「站点参数」的 .env 读写
├── scripts/
│   ├── setup.mjs               # 一键环境搭建 / 启动
│   ├── bootstrap-node.ps1      # Windows 免安装 Node.js 下载引导
│   ├── content-cli.ts          # 内容命令行（new / check / publish）
│   ├── generate-password-hash.js
│   └── worker.js               # Cloudflare Workers 入口
├── deploy/
│   └── nginx.conf              # Nginx 站点配置（Dockerfile 引用）
├── start.bat / start.sh        # 一键启动入口
├── change.md                   # 变更日志
├── Dockerfile / docker-compose.yml
├── netlify.toml / wrangler.jsonc / esa.jsonc
└── vite.config.ts / uno.config.ts / vitest.config.ts
```

## 十四、调优建议

### 14.1 性能

- 首页卡片数量由 `HOME_CONFIG.pageSize` 控制，文章很多时可适当下调，减少首屏渲染压力
- 粒子数量默认 50，低端设备可降至 20–30；`PETAL_EFFECT_CONFIG.maxDpr` 已限制为 2
- 背景图建议使用 WebP 且不超过 1920 宽；构建期会自动转换，但源文件过大仍会拖慢构建
- 屏保视频建议使用 720p 直链，过大的文件会延长首帧等待
- 封面建议使用 16:10 或 16:9 的图片，创作台上传不做压缩，过大原图会直接进入产物

### 14.2 动效

- 背景轮播与 Ken Burns 同时开启会持续占用合成层，移动端建议只保留其一
- 遮罩浓度低于 20 时浅色文字可能难以辨认，可提高到 35–50
- 粒子层级为负值时位于内容下方，避免遮挡文字

### 14.3 缓存

- 不要在托管平台为 `index.html` 设置长缓存；入口必须实时
- `version.json` 同样需要 `no-cache`，否则版本守卫失效
- 带 hash 的 `static/` 资源可以设置长缓存

### 14.4 内容组织

- 分类层级控制在 2–3 层，过深会让左侧目录树难以浏览
- 标签尽量复用已有标签（创作台会按出现频次给出候选），避免标签碎片化
- 长期草稿放 `_drafts`，需要长期保留但不发布的资料用 `_` 前缀目录

## 十五、常见问题排查

**文章不显示**
检查文件是否在 `public/content` 下、扩展名是否受支持、frontmatter 是否合法；文件名以 `_` 开头会被忽略。使用创作台保存会自动重建导航；手工改文件后运行 `pnpm dev` 或 `pnpm build`。

**创作台打不开**
创作台只在开发环境提供：先 `pnpm dev` 再访问 `/studio`；生产环境访问 `/studio` 会回到首页。局域网访问需要在 `.env` 设置 `STUDIO_TOKEN` 并在页面输入口令，否则默认只允许本机。

**站点参数保存后没生效**
参数写入本地 `.env`，dev server 会自动重启，刷新页面即可。托管平台不会读取本地 `.env`，请用「导出部署配置」把变量同步到平台。

**封面上传失败**
只接受 png / jpg / jpeg / webp / gif / avif / svg，单文件不超过 10 MB；失败时创作台封面区会显示具体原因。上传成功后地址形如 `/img/covers/cover-<时间戳>.png`。

**封面不显示**
路径需以 `/` 开头（相对 `public`）或为完整 URL；子路径部署时相对封面会自动拼接 `VITE_BASE`，但手写绝对路径时需自行确认。

**元数据不生效**
非 Markdown 文件必须使用与文件完全同名的 `.desc.json` / `.desc.yaml`（如 `a.pdf.desc.json`），并把摘要写在 `excerpt` 字段。

**编辑区或预览滚不动**
创作台内所有滚动容器都带有 `data-lenis-prevent`，用于豁免全局 Lenis 平滑滚动；新增滚动区域时同样需要加上该属性，否则滚轮会被页面接管。

**发布后仍是旧页面**
确认 `version.json` 与 `sw-<版本>.js` 正常更新，且入口 HTML 未被 CDN 强缓存。

**部署到子路径后白屏**
`VITE_BASE` 必须与访问路径一致（如 `/pjfun-blog/`），修改后重新构建。

**密码不生效**
确认构建时环境变量已传入（CI 中需配置 Secrets / Variables），且未同时残留旧的 `VITE_BLOG_PASSWORD_HASH`。明文密码请使用 `BLOG_PASSWORD`（不要加 `VITE_` 前缀）。

**统计不显示**
不蒜子或 ping0 不可用时对应区域会自动降级或隐藏，不影响其他功能；可通过 `VITE_BUSUANZI_ENDPOINT`、`VITE_PING0_IMAGE_URL` 更换地址。

**屏保视频不播放**
部分直链视频或 B 站代理不稳定，组件会自动跳过失败源并重试；可在 `src/constants/screensaver.ts` 中替换为自有视频地址。

**内容检查报错**
运行 `pnpm content:check`，`[错误]` 会阻止发布（如文件名不是英文短横线、路由冲突），`[提示]` 只影响展示效果（如摘要为空、封面文件不存在）。

## 十六、贡献、相关链接与许可

**贡献流程**

1. Fork 仓库
2. 创建分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m "feat: ..."`
4. 推送分支并发起 Pull Request

**相关链接**

- 在线示例：<https://cnblog.pjfun.top>
- 仓库地址：<https://github.com/LXC-9349/pjfun-blog>
- 更新日志：<https://github.com/LXC-9349/pjfun-blog/blob/main/change.md>
- 问题反馈：<https://github.com/LXC-9349/pjfun-blog/issues>

---

本项目基于 MIT License 开源。


### 👨‍💻 关于作者

如果你对这个项目的实现细节感兴趣，或者想交流技术：

* **个人主页：** [https://pjfun.top](https://pjfun.top)
* **闲鱼主页：** [点击跳转](https://www.goofish.com/personal?spm=a21ybx.item.itemHeader.2.67533da6TsN3LC&userId=863031346) 