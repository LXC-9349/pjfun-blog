---
title: 现代 CSS 布局完全指南：Flexbox + Grid + 容器查询
date: 2026-05-16
cover: https://picsum.photos/seed/modern-css/800/400
desc: 从 Flexbox 到 Grid 再到容器查询，系统掌握现代 CSS 布局技术
tags: [CSS, 布局, 前端开发, 响应式设计]
---

## 前言

CSS 布局在过去的十年经历了从"黑魔法"到"科学"的转变。从 Table 布局到 Float + Position，再到今天的 Flexbox 和 Grid，我们终于拥有了强大而直观的布局工具。本文将系统梳理现代 CSS 布局的核心技术。

## Flexbox：一维布局利器

Flexbox 适合一维布局——要么水平排列，要么垂直排列。

### 核心概念

Flexbox 有两个轴：主轴（main axis）和交叉轴（cross axis），方向由 `flex-direction` 决定。

```css
.container {
  display: flex;
  flex-direction: row;      /* 默认：水平排列 */
  /* flex-direction: column; */ /* 垂直排列 */
  /* flex-direction: row-reverse; */ /* 反向水平 */
}
```

### 主轴对齐：justify-content

```css
.container {
  display: flex;
  justify-content: flex-start;  /* 默认：起始对齐 */
  justify-content: center;      /* 居中对齐 */
  justify-content: space-between; /* 两端对齐，中间等距 */
  justify-content: space-around;  /* 每个项目两侧间距相等 */
  justify-content: space-evenly;  /* 所有间距完全相等 */
}
```

### 交叉轴对齐

```css
.container {
  display: flex;
  align-items: stretch;    /* 默认：拉伸填满 */
  align-items: flex-start; /* 起始对齐 */
  align-items: center;     /* 居中对齐 */
  align-items: flex-end;   /* 结束对齐 */
}
```

### flex 属性的精妙设计

`flex` 是三个属性的缩写：`flex-grow`、`flex-shrink`、`flex-basis`

```css
.item {
  /* 经典用法 */
  flex: 1;              /* flex: 1 1 0% */
  flex: auto;           /* flex: 1 1 auto */
  flex: none;           /* flex: 0 0 auto */
  flex: 0 0 200px;      /* 固定宽度 200px，不伸缩 */
}
```

### 实战：圣杯布局（经典三栏）

```html
<div class="holy-grail">
  <header>Header</header>
  <div class="content">
    <nav>Left Sidebar</nav>
    <main>Main Content</main>
    <aside>Right Sidebar</aside>
  </div>
  <footer>Footer</footer>
</div>
```

```css
.holy-grail {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  display: flex;
  flex: 1;
}

nav { flex: 0 0 200px; }   /* 固定宽度 */
main { flex: 1; }           /* 自适应 */
aside { flex: 0 0 150px; }  /* 固定宽度 */

@media (max-width: 768px) {
  .content { flex-direction: column; }
  nav, aside { flex: 0 0 auto; }
}
```

## CSS Grid：二维布局之王

Grid 是第一个真正的二维布局系统，同时控制行和列。

### 定义网格

```css
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;  /* 三列等宽 */
  grid-template-rows: auto 1fr auto;    /* 行定义 */
  gap: 16px;                             /* 间距 */
}
```

### fr 单位的魔力

`fr` 是 Grid 特有的弹性单位，按比例分配剩余空间：

```css
.grid {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;
  /* 第一列 200px，剩下的空间 1:1 分配给后两列 */
  grid-template-columns: repeat(3, 1fr);
  /* 3列等宽，等价于 1fr 1fr 1fr */
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  /* 响应式：每列至少250px，自动填充 */
}
```

### 网格线定位

```css
.layout {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: auto 1fr auto;
  gap: 16px;
}

.header  { grid-column: 1 / -1; }            /* 跨所有列 */
.sidebar { grid-column: 1 / 4;  }             /* 占 3 列 */
.main    { grid-column: 4 / -1; }             /* 占剩余列 */
.footer  { grid-column: 1 / -1; }
```

### 命名网格区域

```css
.layout {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header  header  header"
    "sidebar main    aside"
    "footer  footer  footer";
  gap: 16px;
  min-height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.aside   { grid-area: aside; }
.footer  { grid-area: footer; }
```

响应式调整只需改变 `grid-template-areas`：

```css
@media (max-width: 768px) {
  .layout {
    grid-template-areas:
      "header"
      "sidebar"
      "main"
      "aside"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

### 隐式网格与自动排列

```css
.masonry-like {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: minmax(100px, auto);  /* 隐式行高 */
  gap: 16px;
}
```

## 容器查询 Container Queries

容器查询是 CSS 布局的里程碑——它让组件能基于自身容器的大小而非视口来调整样式。

### 基础用法

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* 当容器宽度 >= 400px 时 */
@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
  }
}

/* 当容器宽度 < 400px 时 */
@container card (max-width: 399px) {
  .card {
    display: flex;
    flex-direction: column;
  }
}
```

### 实战：自适应组件

```html
<div class="card-container">
  <div class="card">
    <img src="photo.jpg" alt="Photo" class="card-image" />
    <div class="card-content">
      <h2>Card Title</h2>
      <p>Card description text here...</p>
    </div>
  </div>
</div>
```

```css
.card-container {
  container-type: inline-size;
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

/* 宽布局：图左文右 */
@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 16px;
  }
  .card-image {
    height: 100%;
    border-radius: 8px 0 0 8px;
  }
}

/* 窄布局：图文上下 */
@container (max-width: 399px) {
  .card-image {
    border-radius: 8px 8px 0 0;
  }
}
```

### 容器查询单位

```css
.card {
  /* cqw = 容器宽度的 1% */
  font-size: clamp(1rem, 2.5cqw, 1.5rem);
  padding: 2cqw;
  border-radius: 1cqw;
}
```

## 响应式设计实战

### 现代响应式策略

```css
/* 移动优先 */
/* 基础样式：移动端 */
.page { padding: 16px; }

/* 平板 */
@media (min-width: 768px) {
  .page { padding: 24px; }
}

/* 桌面 */
@media (min-width: 1024px) {
  .page {
    padding: 32px;
    max-width: 1200px;
    margin: 0 auto;
  }
}

/* 宽屏 */
@media (min-width: 1440px) {
  .page { max-width: 1400px; }
}
```

### 完整布局示例

```html
<div class="dashboard">
  <header class="dashboard-header">Header</header>
  <nav class="dashboard-nav">Navigation</nav>
  <main class="dashboard-main">
    <div class="card-grid">
      <div class="card" * 6></div>
    </div>
  </main>
  <aside class="dashboard-aside">Sidebar</aside>
</div>
```

```css
.dashboard {
  display: grid;
  grid-template-columns: 250px 1fr 300px;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "header header header"
    "nav    main   aside";
  min-height: 100vh;
  gap: 16px;
  padding: 16px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

@media (max-width: 1200px) {
  .dashboard {
    grid-template-columns: 200px 1fr;
    grid-template-areas:
      "header header"
      "nav    main";
  }
  .dashboard-aside { display: none; }
}

@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main";
  }
  .dashboard-nav { display: none; }
}
```

## 常见布局模式

### 居中布局

```css
/* 方法一：Grid */
.centered {
  display: grid;
  place-items: center;  /* 同时居中水平和垂直 */
}

/* 方法二：Flexbox */
.centered {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 方法三：自动外边距（经典） */
.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### 粘性页脚

```css
/* 方法一：Grid */
body {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

/* 方法二：Flexbox */
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
footer { margin-top: auto; }
```

## 总结

现代 CSS 布局技术已经足够成熟和强大：

- **Flexbox**：适合导航栏、按钮组、居中等一维布局场景
- **Grid**：适合页面整体架构、卡片网格、仪表盘等二维布局
- **容器查询**：让组件真正可复用，不再依赖全局视口

掌握这三种技术后，曾经需要 JavaScript 辅助的布局问题现在都可以用纯 CSS 解决。布局不再是"黑魔法"，而是一门可以系统学习的工程科学。
