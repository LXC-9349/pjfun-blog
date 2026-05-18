---
title: VSCode 配置实战：我不再用 IDE 的原因
date: 2026-05-16
cover: https://picsum.photos/seed/vscode-tips/800/400
desc: 分享我三年 VSCode 使用经验——从编辑配置、快捷键绑定到工作区自动化，打造属于你的开发环境
tags: [VSCode, 开发工具, IDE, 效率]
---

## 为什么从 WebStorm 转到 VSCode

我在 WebStorm 上用了三年，对它的智能提示和重构功能非常满意。但有个问题越来越难以忍受——慢。打开一个大项目需要几分钟，输入的时候偶尔会有延迟感。换到 VSCode 后，启动 3 秒，打字流畅，插件生态还更丰富。

当然这不是说 VSCode 比 WebStorm 好——如果你是 Java 或 PHP 开发者，JetBrains 产品的深度集成是 VSCode 比不了的。但对于前端和 Node.js 开发，VSCode 现在是更合适的选择。

## 基础配置：让编辑器为你工作

### settings.json 里的关键配置

VSCode 的 GUI 设置面板只能覆盖 70% 的配置项。要真正定制 VSCode，建议直接编辑 settings.json：

```json
{
  // 编辑器基础
  "editor.fontSize": 14,
  "editor.lineHeight": 24,
  "editor.fontFamily": "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  "editor.fontLigatures": true,
  "editor.tabSize": 2,
  "editor.renderWhitespace": "trailing",
  "editor.minimap.enabled": false,

  // 保存时自动格式化
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },

  // 编辑器行为
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": "active",
  "editor.stickyScroll.enabled": true,
  "editor.smoothScrolling": true,
  "editor.cursorSmoothCaretAnimation": "on",
  "editor.cursorBlinking": "phase",

  // 文件相关
  "files.autoSave": "onFocusChange",
  "files.exclude": {
    "**/node_modules": true,
    "**/.git": true,
    "**/dist": true
  },

  // 终端
  "terminal.integrated.fontSize": 13,
  "terminal.integrated.fontFamily": "JetBrains Mono",
  "terminal.integrated.defaultProfile.windows": "PowerShell",

  // 搜索
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/pnpm-lock.yaml": true
  },
  "search.useIgnoreFiles": true,

  // 工作台
  "workbench.startupEditor": "none",
  "workbench.colorTheme": "One Dark Pro",
  "workbench.iconTheme": "material-icon-theme",
  "workbench.tree.indent": 20,

  // 更新
  "update.mode": "none"
}
```

### 快捷键绑定

我改了几个最常用的快捷键，大幅减少了鼠标使用：

```json
// keybindings.json
[
  // 使用 Ctrl+E 代替 Ctrl+P（选择最近文件而不是搜索所有文件）
  {
    "key": "ctrl+e",
    "command": "workbench.action.quickOpen"
  },
  // 用 Alt+↑/↓ 移动行
  {
    "key": "alt+up",
    "command": "editor.action.moveLinesUpAction"
  },
  {
    "key": "alt+down",
    "command": "editor.action.moveLinesDownAction"
  },
  // 用 Ctrl+Shift+E 聚焦到文件资源管理器
  {
    "key": "ctrl+shift+e",
    "command": "workbench.view.explorer"
  },
  // 用 Ctrl+B 切换侧边栏
  {
    "key": "ctrl+b",
    "command": "workbench.action.toggleSidebarVisibility"
  }
]
```

## 必装扩展：按场景分类

### 核心工具

- **Error Lens**：错误信息直接显示在代码行尾，不用 hover 看
- **GitLens**：每一行代码旁边显示谁最后修改的、什么时候、哪个 commit
- **Git History**：可视化查看分支和提交记录
- **Prettier**：统一代码格式
- **ESLint**：规则检查

### 前端开发

- **Vue - Official**：Vue 3 的官方支持（替代了 Vetur）
- **Tailwind CSS IntelliSense**：Tailwind/UnoCSS 类名补全
- **Path Intellisense**：路径自动补全
- **Auto Rename Tag**：重命名 HTML/JSX 标签时自动匹配

### 通用增强

- **Code Spell Checker**：英文拼写检查（我常拼错变量名）
- **Todo Tree**：高亮项目中的 TODO/FIXME 注释
- **Thunder Client**：轻量 API 调试（不用开 Postman）
- **Markdown Preview Enhanced**：Markdown 实时预览

## 项目级配置：工作区设置

`.vscode/settings.json` 可以放在项目中：

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "eslint.validate": ["typescript", "javascript", "vue"],
  "files.associations": {
    "*.env.*": "dotenv",
    "*.css": "tailwindcss"
  },
  "css.lint.unknownAtRules": "ignore",
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/dist/**": true,
    "**/node_modules/**": true
  }
}
```

`.vscode/extensions.json` 可以向项目协作者推荐扩展：

```json
{
  "recommendations": [
    "vue.volar",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "eamodio.gitlens"
  ]
}
```

这样新成员 clone 项目后，VSCode 会自动提示安装推荐的扩展。省去了反复沟通"你用哪个插件"的时间。

## Snippets：自定义代码片段

我写了一个常用的 Vue 3 组件片段：

```json
{
  "Vue 3 Component": {
    "prefix": "v3c",
    "body": [
      "<template>",
      "  <div class=\"$1\">",
      "    $2",
      "  </div>",
      "</template>",
      "",
      "<script setup lang=\"ts\">",
      "$3",
      "</script>",
      "",
      "<style scoped>",
      "$4",
      "</style>"
    ],
    "description": "Vue 3 Component with setup"
  },
  "Vue composable": {
    "prefix": "v3h",
    "body": [
      "import { ref, computed } from 'vue'",
      "",
      "export function use${1:Feature}() {",
      "  const ${2:state} = ref(${3:initial})",
      "",
      "  const ${4:computed} = computed(() => ${2:state}.value)",
      "",
      "  return {",
      "    ${2:state},",
      "    ${4:computed}",
      "  }",
      "}"
    ],
    "description": "Vue 3 composable hook"
  }
}
```

## 调试配置

很多人调试时用 `console.log` 大法，其实 VSCode 的调试器很强大。`.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "启动应用",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "调试当前测试文件",
      "program": "${workspaceRoot}/node_modules/vitest/vitest.mjs",
      "args": ["run", "${relativeFile}"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

配置好之后，按 F5 调试，直接在代码行号左侧设置断点，比 `console.log` 效率高太多。

## 性能优化

VSCode 用久了会变慢。几个优化点：

1. **禁用不需要的扩展**：不用的扩展就禁掉，它们会拖慢启动和编辑速度
2. **排除大目录**：在 `files.watcherExclude` 中添加不常用的目录
3. **关闭 minimap**：虽然看着帅，但消耗资源
4. **限制搜索范围**：`search.exclude` 配置排除 node_modules 等目录

```json
{
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/.git/**": true
  }
}
```

## 写在最后

VSCode 最强大的地方不是它开箱即用的功能，而是它的可定制性。同一个 VSCode，在不同人手上是完全不同的工具。

但有个提醒：**不要在配置上花太多时间**。我见过有些人在 VSCode 上折腾了半个月——换主题、调字体、试了 50 个扩展——但真正写代码的时间没多少。花一两天时间把基础配置好，剩下的需求真的遇到了再查怎么配，这样效率最高。
