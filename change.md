# PJ Blog 变更日志

说明：记录内容写作工具、站点配置与部署相关的变更，**最新条目置顶**。
条目分类：新增 / 优化 / 修复 / 文档 / 依赖 / 验证。
`README.md` 与 `README.en.md` 顶部均链接到本文件。

## [2026-10-23] 导航与目录树按最新文章日期排序

背景：`tree.json` 此前直接按 `readdir()` 顺序输出，目录顺序取决于文件系统（Windows 与 Docker / CI 下可能不同），且文件夹与文章混排，与内容新鲜度无关。

### 优化

- **目录树**：每层改为「文件夹优先 + 按最新文章日期倒序」；文件夹自身没有日期，取所有后代文章的最大值（递归聚合），空目录排最后
- **nav.json**：同步改为按发布日期倒序、同日期按标题排序，文章页的上一篇 / 下一篇随之沿时间轴切换
- **排序兜底**：日期并列或非法时按标题 `localeCompare('zh-CN')`，保证不同系统扫描出的产物顺序一致（`tree.json` 结构未变，不新增字段）
- **日期来源**：Markdown 缺少 frontmatter `date` 时回退文件 `mtime`，此前为空会被排到最末

### 验证

- `pnpm exec vue-tsc -b`：0 错误
- `pnpm test:run`：18 个用例通过（`tooling/content-core.spec.ts` 新增 2 个：目录树排序、nav 排序）
- `pnpm build`：成功，91 篇文章 → sitemap 93 URL、RSS 正常生成
- 产物抽查：根目录 7 个 `2026-05-18` 目录 → 10 个 `2026-05-17` → 4 个 `2026-05-16`，组内标题有序；`2025` 目录内 5 个文件夹全部前置于 2 篇文章

### 已知限制

- 现有 91 篇示例内容只分布在 6 个日期上（43 篇为 2026-05-17），同日期只能按标题兜底，视觉上接近拼音序；新文章写入当天日期后会自然浮到最前
- 同日期兜底使用 `localeCompare('zh-CN')`：汉字按拼音排在拉丁字母之前，所以 `AI与机器学习`、`Python`、`React` 这类英文目录在并列时会靠后
- 无 `date` 的文件依赖 `mtime`，CI / Docker 中 `git checkout` 会重置为检出时间，这类文件并列时同样退化为标题排序

## [2026-10-22] 根目录文件归类整理

背景：根目录堆到 34 个文件，构建插件、类型声明、站点图标与部署配置混在一起，查找成本高。

### 调整

- **`package/` 更名为 `tooling/`**，并集中全部构建期代码：从根目录移入 `vite-plugin-gen-nav.ts`、`vite-plugin-gen-backgrounds.ts`、`vite-plugin-studio.ts`、`vite-plugin-auto-password-hash.ts`（原有 `build_cdn.ts`、`vite-plugin-cdn.ts`、`vite-plugin-rss.ts`、`vite-plugin-sitemap.ts`、`content-core.ts`、`content-bus.ts`、`env-config.ts` 定位置不变）
- **新增 `deploy/`**：`nginx.conf` 移入，避免与 `Dockerfile`、`docker-compose.yml` 平铺在一起
- **`favicon.ico` → `public/favicon.ico`**：对外 URL 仍为 `/favicon.ico`；顺带修复此前根目录图标不会被复制进 `dist`、导致 RSS 里的 `favicon` 地址 404 的问题
- **`vite-env.d.ts` → `src/typings/vite-env.d.ts`**：根目录版本不在任何 tsconfig 范围内（实际未生效），移入后生效，并删除与 `src/shims-vue.d.ts` 重复的 `virtual:generated-pages` / `virtual:svg-icons-register` 声明，只保留 `virtual:pwa-register`
- 根目录文件从 34 个减少到 27 个；留下的均为工具链强制要求放在根目录的文件（`index.html`、`package.json`、`pnpm-lock.yaml`、`tsconfig*.json`、`vite.config.ts`、`uno.config.ts`、`vitest.config.ts`、`eslint.config.js`、`.prettierrc`、`.gitignore`、`.dockerignore`、`.env.example`、`Dockerfile`、`docker-compose.yml`、`netlify.toml`、`wrangler.jsonc`、`esa.jsonc`、`LICENSE`、`README*.md`、`CLAUDE.md`、`change.md`、`start.bat`、`start.sh`）

### 同步引用

- `vite.config.ts`：所有插件导入改为 `./tooling/...`
- `tooling/vite-plugin-gen-nav.ts`、`tooling/vite-plugin-studio.ts`：内部导入改为同级引用，`src/constants` 改为 `../src/...`
- `scripts/content-cli.ts`：导入改为 `../tooling/content-core`
- `Dockerfile`：`COPY deploy/nginx.conf /etc/nginx/nginx.conf`
- 文档：`README.md`、`README.en.md`、`CLAUDE.md`、`public/content/2025/blog.md` 的目录树与路径引用全部更新
- `src/studio/types.ts` 注释中的 `package/content-core.ts` 改为 `tooling/content-core.ts`

### 验证

- `pnpm exec vue-tsc -b`：0 错误
- `pnpm build`：成功，产物结构正常
- 创作台接口、`pnpm content:check`、`start.bat check` 均通过

## [2026-10-22] 变更日志改名为 change.md

- **变更**：`change.log` → `change.md`，同时改用 Markdown 结构，GitHub 页面与站内预览可直接渲染
- **同步**：`README.md`、`README.en.md`、`start.bat` 中的链接与提示文案一并更新
- **清理**：`.gitignore` 中为绕过 `*.log` 规则而添加的 `!change.log` 例外已移除（`.md` 不受该规则影响）

## [2026-10-22] 一键启动脚本（Windows / Linux，含 Node.js 自动安装）

背景：新机器原先需要先手动装 Node 和 pnpm 才能跑起来，门槛偏高；现在双击（或一条命令）即可完成从装运行时到启动开发服务器的全部步骤。

### 新增

- `start.bat`（Windows）：双击即启动，支持 `check` / `setup` / `build` 参数
- `start.sh`（Linux / macOS）：`bash start.sh`，同样支持 `check` / `setup` / `build`
- `scripts/bootstrap-node.ps1`：Windows 免安装 Node.js 下载引导，镜像顺序 npmmirror → cdn.npmmirror → nodejs.org
- Node 缺失时下载到项目内 `.tools/`，不需要管理员 / sudo；已安装则直接复用
- pnpm 缺失时依次尝试 `corepack enable pnpm` → `npm install -g pnpm`

### 优化

- `scripts/setup.mjs` 支持 `--pm <命令>`，可由启动脚本传入定位到的 pnpm
- `setup.mjs` 输出补充一键启动提示

### 配置

- `.gitignore` 新增 `.tools/`，避免下载的运行时进入仓库
- 可选环境变量：`PJ_NODE_VERSION`（默认 22.14.0）、`PJ_NO_PAUSE`（无人值守）、`PJ_NODE_PLATFORM`（强制平台，如 `linux-x64`，用于离线验证）

### 文档

- `README.md` / `README.en.md`：新增「一键启动」章节、启动方式表与目录结构更新
- `public/content/2025/blog.md`：4.2 一键启动、4.3 仅用包管理器搭建、4.4 常用脚本

### 验证

- `start.bat check`：通过（Node 24.15.0 / pnpm 10.33.0，退出码 0，中文输出正常）
- `bash start.sh check` / `bash start.sh setup`：均退出码 0
- `bash -n start.sh`：语法检查通过
- Windows 下执行 `start.sh` 会明确提示改用 `start.bat`

### 已知限制

- `start.bat` 提示语使用英文：cmd 以 GBK 代码页解析含中文的 UTF-8 批处理会错行执行，因此批处理保持纯 ASCII（运行时再 `chcp 65001` 以正常显示 Node 的中文输出），中文说明放在 README 与站内手册
- 下载的 Node 版本固定为 22.14.0，可用 `PJ_NODE_VERSION` 覆盖

## [2026-10-22] 本地创作台 Studio、内容 CLI 与站点参数编辑

本次目标：打通「写作 → 校验 → 生效 → 发布 → 上线」的完整闭环，并让站点参数可以在开发环境内直接编辑、导出给部署平台使用。

### 新增：创作台（仅 `pnpm dev` 生效，生产构建不含任何相关代码）

- 入口：首页右上角钢笔按钮，或直接访问 `/studio`；生产环境访问该路径回到首页
- 三栏工作区：文章树（搜索 / 草稿箱）/ Markdown 编辑 + 实时预览 / 文章设置与发布
- 新建文章：标题自动转拼音 slug（可手改），分类可输入新目录并自动创建
- 草稿：写入 `public/content/_drafts`，构建天然忽略；发布时移入正式目录、自动写日期、迁移配图目录并改写正文中的图片引用
- 封面：点击上传、`Ctrl+V` 粘贴、拖入图片、读取系统剪贴板，统一保存到 `public/img/covers/`，也可切换为手填图片地址
- 正文图片：编辑区粘贴截图自动保存到 `public/content/<分类>/<slug>/` 并插入引用
- 附件：上传 PDF / Word / Excel 自动生成同名 `.desc.json`（摘要字段为 `excerpt`）
- 发布到线上：保存版本（`git add public/content` + 封面目录，再 commit）与发布到线上（`git push`）分离，推送必须二次确认，服务端同时校验确认标志
- 编辑内容 1.5s 防抖写入 `localStorage`，重新打开可恢复或丢弃
- 访问控制：默认仅本机可调用创作台接口；在 `.env` 配置 `STUDIO_TOKEN` 后，手机 / 平板可通过内网地址访问并输入口令
- 站点参数页：8 个分组、38 个常用环境变量表单化编辑，写入本地 `.env` 时保留原有注释与未纳管变量，保存后 dev server 自动重启生效
- 导出部署配置：生成 `.env` / GitHub Actions YAML / JSON 三种格式，支持复制与下载；默认只导出与默认值不同的项，`STUDIO_TOKEN` 永不导出，含访问密码时提示改用平台 Secrets

### 新增：内容命令行 `scripts/content-cli.ts`（与创作台共用同一套核心逻辑）

- `pnpm content:new "标题" [--dir 分类] [--slug x] [--tags a,b] [--cover /img/x.webp] [--desc 摘要] [--draft]`
- `pnpm content:check [--json] [--no-drafts]`：校验 frontmatter、摘要长度、封面文件是否存在、路由冲突、附件缺 `.desc.json`
- `pnpm content:publish _drafts/xxx.md --dir 分类`
- 不加参数运行 new / publish 会进入交互式提问；`--json` 有阻断项时退出码为 1

### 新增：一键环境搭建 `scripts/setup.mjs`

- `pnpm bootstrap`：检查 Node / pnpm → 安装依赖 → 由 `.env.example` 生成 `.env` → 准备草稿目录
- `pnpm start`：搭建完成后直接启动开发服务器（依赖已存在时自动跳过安装）
- `node scripts/setup.mjs --check`：只检查环境，不写任何文件

### 新增：模块与文件

| 文件 | 职责 |
| --- | --- |
| `package/content-core.ts` | 内容扫描、frontmatter 解析与序列化、校验、导航生成、读写与上传 |
| `package/content-bus.ts` | dev 下导航重建与静默刷新通道 |
| `package/env-config.ts` | `.env` 白名单读写（保留注释、追加缺失键） |
| `vite-plugin-studio.ts` | 创作台接口：tree / post / create / save / publish / upload / upload-cover / attachment-meta / config / git |
| `src/utils/markdown.ts` | 文章页与创作台共用的 marked + DOMPurify 管线 |
| `src/utils/slug.ts` | 标题转拼音 slug 与合法性校验 |
| `src/constants/studio.ts` | 创作台参数（防抖、上传限制、目录、提交模板等） |
| `src/constants/studio-settings.ts` | 站点参数白名单（分组、类型、取值范围、是否可导出） |
| `src/studio/` | StudioPage.vue、api.ts、types.ts 与编辑器 / 预览 / 目录树 / 元数据 / 发布 / 参数 / 弹窗等组件 |

### 优化

- `vite-plugin-gen-nav.ts` 在 dev 下监听 `public/content`，保存后 300ms 防抖重建导航，首页、归档、搜索、标签、RSS 数据源同步更新，无需重启
- 导航与 `.env` 写入改为「临时文件 + rename」原子替换，dev 重建不再清空 `public/generated`
- 创作台预览与线上文章页使用同一套解析与净化配置，避免所见非所得
- 保存文章后清空导航响应缓存，SPA 返回首页即可看到新文章
- 界面文案去技术化：发布到线上 / 保存版本 / 这篇还是草稿 / 检查未通过需处理
- 右侧设置栏断点由 `xl` 降到 `lg`，125% 缩放的笔记本也能直接看到
- 小屏默认单栏编辑，移动端目录与设置改为抽屉；文章树支持搜索过滤
- 新建弹窗把 slug 收进「高级设置」，标题输入自动聚焦

### 修复

- 创作台编辑区与预览区鼠标滚轮无法滚动：为所有内部滚动容器补 `data-lenis-prevent`，并在进入 Studio 时 `lenis.stop()`、离开时 `lenis.start()`（实测：预览 scrollTop 600、编辑区 800、设置栏 400，`window.scrollY` 恒为 0）
- frontmatter 中的数字标签（如 `tags: [2026]`）导致目录树接口 500：标签统计统一转字符串
- dev server 重启时新旧实例写同名临时文件导致 ENOENT：临时名加入时间戳与随机后缀
- 生产环境访问 `/studio` 会落到「文章加载失败」页：改为显式重定向到首页

### 文档

- `README.md` / `README.en.md`：新增本地创作台、内容 CLI、一键环境、站点参数与部署导出说明；更新常用脚本表、图片资源、项目结构、环境变量与常见问题
- `CLAUDE.md`：补充创作台架构与文件、命令、目录结构、Studio 滚动约定与生产隔离说明
- `.env.example`：新增 `STUDIO_TOKEN` 及中文注释
- `public/content/2025/blog.md`：由《PJ Blog 系统参数手册》扩充为《PJ Blog 完整手册》，并入 README 全部内容（项目简介、技术栈、快速开始、内容写作与发布、部署上线、FAQ），同时保留并扩展原有的环境变量与 `src/constants` 参数细节

### 依赖

- 新增 devDependency：`pinyin-pro`（标题转拼音 slug）、`tsx`（运行 TypeScript 内容 CLI）

### 验证

- `pnpm exec vue-tsc -b`：0 错误
- `pnpm build`：成功；产物中无 studio chunk，也无创作台相关字符串
- 导航一致性：重构后 `nav.json` / `tree.json` 与改造前逐条深度对比 0 差异（91 篇）
- 接口实测：草稿创建 → 保存 → 不进导航 → 发布 → 进导航；图片与附件上传；封面上传与 git 归类；`.env` 读取 / 保存 / 导出均正常
- 浏览器实测：首页钢笔入口、创作台三栏与站点参数页、导出弹窗、无 error 级控制台日志

### 后续待办

- 文章重命名与删除、批量标签整理
- 编辑器语法高亮（CodeMirror）与更多快捷键
- 创作台内直接预览「未发布文章」的独立链接
