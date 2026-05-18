---
title: 我每天都会用到的 10 个命令行工具
date: 2026-05-16
cover: https://picsum.photos/seed/cli-tools/800/400
desc: 不是花里胡哨的玩具——这些命令行工具实实在在提升了我日常开发的效率
tags: [开发工具, CLI, 效率, 终端]
---

## 为什么用命令行

GUI 工具当然有它的价值。但在日常开发中，很多操作在命令行里完成比在图形界面里快得多——特别是当你需要批量处理、管道组合、或者自动化某个流程时。

这些工具是我日常高频使用的，每个都经过了我至少半年的验证。不是那种装了就忘的玩具。

## 1. ripgrep (rg)：比 grep 快一个数量级

```bash
# 在项目中搜索 "useEffect"，自动忽略 .gitignore 中的目录
rg "useEffect"

# 只看 .ts 文件
rg "useEffect" -t ts

# 显示匹配行号
rg "useEffect" -n

# 替换
rg "oldFunction" --replace "newFunction"
```

为什么不用 `grep`？因为 rg 会自动忽略 node_modules、.git 等目录（读取 .gitignore），而且搜索速度是 grep 的 5-10 倍。在一个几万文件的 monorepo 中搜索，rg 毫秒级返回结果。

安装：`winget install BurntSushi.ripgrep` 或 `pnpm add -g @ast-grep/cli`

## 2. fd：比 find 更好用的文件查找

```bash
# 查找所有 .vue 文件
fd ".vue"

# 在 src 目录下查找包含 "component" 的文件名
fd "component" src/

# 查找大于 100MB 的文件
fd -S +100M

# 查找最近 7 天内修改过的文件
fd --changed-within 7d

# 查找后执行操作（删除所有 .log 文件）
fd ".log$" -X rm
```

`find` 命令的语法我一直记不住（`-name` 还是 `-iname`？）`fd` 的语法直观得多，而且默认支持正则和 glob。

## 3. bat：带语法高亮的 cat

```bash
# 查看文件，带行号和语法高亮
bat src/components/Header.tsx

# 显示不可见字符
bat -A config.yml

# 作为 cat 的替代
bat file1.txt file2.txt
```

bat 会自动检测文件类型并应用语法高亮，还内置了 Git 集成——修改过的行会用颜色标记。作为 pager 也比 less 好用。

## 4. lazygit：Git 操作的 TUI

这是少数我会推荐的 TUI 工具——`lazygit` 把 Git 操作做成了一套终端界面。

```
# 在终端中运行
lazygit
```

打开后你会看到：
- 左上是文件变化列表
- 右上是 diff 预览
- 左下是分支列表
- 右下是 commit 历史

常用的操作：空格键暂存文件、数字键切换面板、`:commit` 提交。全程键盘操作，不需要记 Git 命令。

我用了 lazygit 之后，很多操作不再需要鼠标了——staging、commit、cherry-pick、rebase，都在一个界面里完成。

## 5. jq：处理 JSON 的神器

```bash
# 格式化 JSON
curl api.example.com/users | jq

# 提取字段
curl api.example.com/users | jq '.data[].name'

# 过滤
curl api.example.com/users | jq '.[] | select(.age > 18)'

# 修改 JSON
echo '{"name": "Alice"}' | jq '. + {age: 25}'

# 构建新对象
curl api.example.com/users | jq '{names: [.data[].name], total: .data | length}'
```

jq 的语法初看有点奇怪，但掌握了几个基本操作后，处理 JSON 数据的效率远超手动搜索。配合管道，你可以把 API 请求、数据转换、输出串联成一行命令。

## 6. fzf：模糊搜索

```bash
# 交互式文件搜索（按 Ctrl+T）
vim **<TAB>

# 搜索历史命令（按 Ctrl+R）
# fzf 替换了默认的 Ctrl+R

# 搜索进程
ps aux | fzf

# 结合其他命令
kill -9 $(ps aux | fzf | awk '{print $2}')
```

fzf 是一个通用模糊搜索工具。最常用的场景是 Ctrl+R 搜索命令历史——默认的 bash/zsh 历史搜索只支持前缀匹配，fzf 支持任意位置的模糊匹配，快很多。

## 7. httpie：更好用的 curl

```bash
# GET 请求
https httpbin.org/get

# POST 请求（自动处理 JSON 编码）
https httpbin.org/post name=Alice age=25

# 文件上传
https httpbin.org/post < file.json

# 带 token 的请求
https api.example.com/users Authorization:"Bearer $TOKEN"
```

httpie 的语法比 curl 直观——不需要写 `-H "Content-Type: application/json" -d '{"key":"value"}'`，直接用键值对就行了。而且响应会带语法高亮。

## 8. tldr：简化的 man 手册

```bash
# 查看 tar 命令的常用用法
tldr tar

# 查看 git commit 的用法
tldr git commit
```

`man` 手册太长了，有时候我只想快速看个例子。tldr 用社区维护的示例代替了冗长的文档，每个命令 10-20 个示例，覆盖了 90% 的使用场景。

## 9. hyperfine：基准测试工具

```bash
# 比较两个命令的速度
hyperfine "rg foo" "grep -r foo"

# 运行 10 次取平均值
hyperfine --runs 10 "npm run build"

# 输出比较结果
hyperfine "curl -X POST http://a.com" "curl -X POST http://b.com" --export-markdown result.md
```

当我想比较两个方案哪个更快时，hyperfine 给出了客观的数据。它处理了预热、冷启动、统计异常值等细节。

## 10. ngrok：给本地服务一个公网 URL

```bash
ngrok http 3000
```

运行后，ngrok 给你一个 `https://xxx.ngrok.io` 的 URL，指向你本地的 3000 端口。

我用它来：测试 webhook、给客户展示开发中的页面、在手机上测试本地开发的服务。

## 你不需要全部用上

这里面很多工具解决的是"有更好"的问题，不是"非它不可"的问题。我的建议是：

1. 先装个 fzf 和 ripgrep，这两个最常用
2. 遇到需要处理 JSON 时，用 jq 替代手动搜索
3. 当你觉得某个操作重复了五遍以上时，找找有没有 CLI 工具可以简化它

不需要一次性全部安装。工具的价值在于解决问题，不是为了用工具而用工具。
