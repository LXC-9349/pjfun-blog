---
title: 从零搭建博客系统：我的真实架构选择和踩坑记录
date: 2026-05-16
cover: https://picsum.photos/seed/blog-arch/800/400
desc: 记录我实际构建博客过程中的技术选型思考和遇到的问题——静态 SPA 为什么是正确选择
tags: [架构, 博客, 项目实战, Vue3, Vite]
---

## 这个博客是怎么来的

这个博客（你正在看的这个网站）是我花了大概三周时间搭建的。不是因为它复杂——而是选择太多了。我卡在"用什么技术"这个问题上比实际编码时间还久。这篇文章记录了我的思考过程和踩过的坑。

## 技术选型的思考过程

### 需求分析：我需要什么

先列需求：

```
功能需求：
- 写文章（Markdown）
- 按分类/标签浏览
- 全文搜索
- RSS 订阅
- 响应式（手机和桌面都好看）
- 暗黑模式
- 代码高亮
- 文章目录导航
- 密码保护（部分文章）

非功能需求：
- 加载快（核心）
- 零运维（我不想管服务器）
- 免费托管（或极低成本）
- 可以用 Git 管理内容
- 方便迁移
```

需求分析的结果是一个很明确的信号：**我不需要后端**。因为我不要评论区（可以用 Giscus），不要用户系统，不要数据库。所有内容都是预先生好的静态文件。

### 为什么不是 SSG（静态站点生成器）

这就到了第一个选择题：用 SSG 还是 SPA。

主流的博客方案是 SSG：Next.js、Astro、Hugo、Jekyll 等。SSG 在构建时生成 HTML 文件，部署到 CDN，全球秒开。

但我最终选了 SPA（单页应用），出于几个考虑：

1. **交互体验**：博客有很多前端交互（搜索、目录滚动监听、阅读进度、字体切换），在 SSR 中实现这些要么需要额外 JavaScript 水合，要么就退化成纯客户端交互——那何必 SSR 呢？
2. **部署极简**：SPA 构建后就是一个 `dist` 文件夹，随便扔到任何静态托管服务都能跑
3. **内容即文件**：文章是 `public/content/` 下的 Markdown 文件，新增文章只需创建一个文件然后重新构建

**SSR 的优点我没用上**：我不需要 SEO（技术博客的主要流量来自已有读者和社交分享，不是搜索引擎），也不需要首屏性能到极致（内容型网站用户能接受几百毫秒的加载时间）。

### 技术栈：为什么选这些

选择的标准：**小而精**。

- **Vue 3**：我熟悉，而且比 React 对于内容型网站来说更轻量（Vue 的模板编译优化让运行时更小）
- **Vite**：构建速度快，插件生态好
- **UnoCSS**：按需生成 CSS，不需要加载整个 Tailwind 框架。最终 CSS 只有 15KB
- **Marked**：Markdown 解析器，比 marked 的竞品更轻更快
- **Lenis**：平滑滚动库，用户体验好

不用的东西：TypeScript 用了（项目大时类型检查值），Pinia 没用（状态少到不需要状态管理，localStorage 就够了）。

## 架构设计：内容管线

博客的核心管线是：

```
Markdown 文件 → 构建时提取元数据 → 生成导航 JSON → 
运行时获取 JSON → 匹配路径 → 获取对应 Markdown →
解析渲染 → 叠加前端交互
```

### 构建时：导航生成

我写了一个 Vite 插件，在 `buildStart` 钩子中扫描 `public/content/` 目录：

```typescript
// 伪代码，简化逻辑
async function scanContentDirectory(dir) {
  const entries = await readdir(dir)
  for (const entry of entries) {
    if (entry.endsWith('.md')) {
      const { data } = matter(await readFile(entry))
      nav.push({
        title: data.title,
        path: getRoute(entry),
        tags: data.tags,
        date: data.date,
        excerpt: data.desc,
        cover: data.cover
      })
    }
  }
  await writeFile('public/generated/nav.json', JSON.stringify(nav))
}
```

这个插件的关键设计：**不需要数据库**。文章就是文件，文件就是文章。你想发一篇文章？在 `public/content/` 下创建一个 `.md` 文件，写上 frontmatter 和正文，然后构建，就上线了。

### 运行时：客户端渲染

在浏览器端，文章详情的渲染流程是：

```
路由匹配（vue-router 捕获路径）
  → 获取 nav.json（已缓存）
  → 匹配到对应文章路径
  → fetch 获取 Markdown 文件原始内容
  → 解析 frontmatter
  → marked 渲染 Markdown 为 HTML
  → DOMPurify 消毒
  → highlight.js 高亮代码块
  → 插入到页面 DOM
```

一开始是同步流程，后来改成了**分层加载**：先显示骨架屏，同时加载文章内容，完成后无缝替换。这个改动让感知加载时间从 800ms 降到了几乎感觉不到。

## CDN 策略：多源回退

作为一个静态博客，我选择把第三方依赖（Vue、vue-router、highlight.js 等）从 CDN 加载，而不是打包到 JS 中。

但 CDN 有个问题——会挂。如果某个 CDN 节点挂了，整个网站都打不开。

我的方案是**多源回退**：

```javascript
// 简化示例
function loadScript(url, fallbackUrl) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.onload = resolve
    script.onerror = () => {
      // 主 CDN 挂了，用备用 CDN
      script.src = fallbackUrl
      script.onload = resolve
      script.onerror = reject
    }
    document.head.appendChild(script)
  })
}
```

在构建时，`pj_public.js` 包含主备 CDN 地址列表。加载失败时自动切换到下一个源。

## 踩坑记录

### 坑一：路由路径匹配

我最开始用文件相对路径作为路由：`/content/前端开发/vue3.md`。但这带来两个问题：
1. URL 暴露了文件结构
2. 如果将来要迁移，所有 URL 都失效了

改为用带 slug 的路径：`/article/vue3-composition-api-guide`。slug 可以从文件名获取，也可以手动在 frontmatter 中指定。

### 坑二：中文文件名编码

Git 对中文文件名支持不好，而且 URL 中中文字符需要编码。解决方案：
1. 文件名用英文或拼音（`vue3-composition-api-guide.md`）
2. frontmatter 中的 `title` 字段用中文
3. URL 用英文 slug

### 坑三：缓存策略

最初文章内容没有缓存，每次访问都重新请求。后来加了 localStorage 缓存：

```javascript
async function loadArticle(path) {
  const cacheKey = `article_${path}`
  const cached = localStorage.getItem(cacheKey)
  
  if (cached && Date.now() - JSON.parse(cached).timestamp < 3600000) {
    return JSON.parse(cached).content
  }
  
  const content = await fetchArticle(path)
  localStorage.setItem(cacheKey, JSON.stringify({
    content,
    timestamp: Date.now()
  }))
  return content
}
```

注意：文章更新时，用户可能读到旧缓存。解决方案是在构建时生成一个 content hash，作为 URL 参数（`article.md?v=abc123`），强制刷新缓存。

## 部署与运维

部署方案：**GitHub Actions + GitHub Pages/Cloudflare Pages**。

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install
      - run: pnpm build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

这套方案的好处：**零运维成本**。推代码→自动构建→自动部署。除了域名续费，没有其他开销。

## 写在最后

这个博客系统的搭建过程让我明白一件事：技术选型的核心不是"什么技术最先进"，而是"什么技术最匹配需求"。

我见过有人用微服务架构搭个人博客，也有人用 Notion 直接当博客用。都行——只要你清楚自己的需求是什么。如果只是写文章，一个静态 SPA 加 Markdown 文件就是最好的方案。如果要做内容平台，那可能需要 SSR、数据库、用户系统。

这个博客从开始到现在，所有代码和内容都在 GitHub 上。新增一篇文章的步骤：`git pull → 创建 .md 文件 → git commit → git push`。三分钟内完成。

对我来说，这已经是最好的方案了。
