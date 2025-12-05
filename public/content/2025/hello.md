---
title: Hello pjfun-blog！2025 最强纯前端博客
date: 2025-12-05
cover: /img/pbsh.jpg
desc: 零后端、纯静态、顶级动效、全球秒开的个人博客
tags: [Vite, Vue3, UnoCSS, Lenis]
sticky: true
---

# Hello pjfun-blog！

欢迎使用 pjfun-blog！这是一个零后端、纯静态、顶级动效、全球秒开的现代化个人博客系统。

## 🌟 特性亮点

- **纯静态部署** - 无需服务器，支持部署到任何静态网站托管服务
- **顶级动效** - 使用 Vue 3 和现代动画库打造流畅用户体验
- **极速加载** - 利用 Vite 构建工具实现毫秒级加载速度
- **响应式设计** - 完美适配桌面端和移动端设备
- **暗黑模式** - 自动跟随系统主题或手动切换
- **全文搜索** - 支持 Ctrl+K 快捷键快速搜索文章内容
- **代码高亮** - 内置 Highlight.js，支持多种编程语言

## 🚀 快速开始

只需简单三步即可拥有你自己的技术博客：

1. 在 `public/content/` 目录下创建 `.md` Markdown 文件
2. 运行 `pnpm build` 构建静态站点
3. 将生成的 `dist/` 目录部署到静态网站托管服务

```ts
// 示例代码
console.log('pjfun-blog 已就绪！')
```

## 📁 目录结构

推荐按以下方式组织你的文章：

```
public/content/
├── 2025/                 # 按年份归档
│   └── hello.md
├── 学习笔记/              # 按主题分类
│   ├── 前端开发/
│   └── 后端技术/
├── 项目实战/
│   └── 开源项目解析.md
└── 生活随笔/
    └── 旅行见闻.md
```

## 🎨 Markdown 扩展语法

除了标准 Markdown 语法，我们还支持 Frontmatter 配置：

```markdown
---
title: 文章标题
date: 2025-12-05
cover: /path/to/cover.jpg
desc: 文章摘要
tags: [标签1, 标签2]
sticky: true # 是否置顶
---

# 标题

文章内容...
```

## 🤝 参与贡献

pjfun-blog 是一个开源项目，欢迎你通过以下方式参与贡献：

1. 提交 Issue 报告 Bug 或建议新功能
2. Fork 项目并提交 Pull Request
3. 编写博客文章分享使用经验
4. 帮助完善文档和示例

让我们一起打造最好的静态博客系统！✨