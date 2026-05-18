---
title: Git 进阶：那些你不敢用的操作
date: 2026-05-16
cover: https://picsum.photos/seed/git-advanced/800/400
desc: rebase、bisect、reflog、cherry-pick——这些 Git 高级功能在什么场景下用、怎么用、出了问题怎么办
tags: [Git, 版本控制, 团队协作, 开发工具]
---

## 不敢用高级 Git 操作的原因

大部分人不用 rebase 不是因为不会，是怕。怕搞丢代码、怕冲突解不完、怕被同事骂。

这个恐惧是有道理的——高级 Git 操作确实有破坏性。但真正的问题不是"该不该用"，而是"该在什么时候用"。本文不讲 Git 原理（虽然理解原理很重要），而是讲每个操作对应的真实场景和撤离方案。

## Rebase：不是用来替代 merge 的

很多人觉得 rebase 和 merge 是二选一的关系。其实它们是不同场景的工具。

### 什么时候用 merge

当你有一个长期分支（比如 main），需要把功能分支合并回来时，用 merge。

```bash
git checkout main
git merge feature/login
```

merge 保留了完整的历史拓扑——你知道哪些提交来自哪个分支。这在多人协作时很有价值。

### 什么时候用 rebase

当你在功能分支上开发，需要同步 main 的最新代码时，用 rebase：

```bash
# 在 feature/login 分支上
git fetch origin
git rebase origin/main
```

这会把你的提交"搬到" main 的最新提交之后，历史变成一条直线：

```
Before rebase:
    A---B---C feature/login
   /
D---E---F main

After rebase:
            A'--B'--C' feature/login
           /
D---E---F main
```

rebase 的好处是提交历史干净，没有多余的 merge commit。但代价是 **你的提交被重写了**。

### 铁律

```
不要 rebase 已经推送到远程共享分支上的代码
```

这条规则很简单：如果有人基于你的分支做了开发，你 rebase 了，他的 Git 历史就和你的对不上了。后果是灾难性的冲突。

### 推送 rebase 后的分支

如果你 rebase 的是自己的分支（只有你在上面工作），推送时需要 force push：

```bash
git push --force-with-lease  # 比 --force 安全
```

`--force-with-lease` 会检查远程分支在你上次拉取后有没有变化——如果有人也推了代码，它会阻止你覆盖。

## Reflog：Git 的后悔药

这是我最想让新手知道的命令——`git reflog`。

每次 HEAD 发生变化（commit、checkout、merge、rebase、reset），Git 都会记录在 reflog 中。

```bash
# 查看所有历史操作
git reflog

# 输出类似：
# abc1234 HEAD@{0}: commit: 修复登录 Bug
# def5678 HEAD@{1}: rebase finished
# ghi9012 HEAD@{2}: checkout: moving to main
# jkl3456 HEAD@{3}: commit: 添加用户管理功能
```

假设你做了 reset 或 rebase 后发现代码丢了：

```bash
# 找回被 reset 的提交
git reflog  # 找到你想回去的提交 hash
git checkout abc1234  # 或者 git reset abc1234

# 或者直接恢复到某个时间点的 HEAD
git reset HEAD@{2}
```

reflog 是你的最后一道防线。只要你在本地做过 commit，reflog 里就有记录。**即使你删除了分支，提交也不会立即消失**——只要在 reflog 的保留期内（默认 90 天）就能找回。

## Bisect：二分查找 Bug 引入点

这是一个很少人用但极其高效的调试工具。当你发现一个 Bug 存在，但不知道是哪个 commit 引入的：

```bash
# 开始二分查找
git bisect start

# 标记当前版本为"坏"
git bisect bad

# 标记某个历史版本为"好"
git bisect good v1.2.0

# Git 会 checkout 一个中间版本，你来判断：
# 检查代码，如果没 Bug：
git bisect good
# 如果有 Bug：
git bisect bad

# 重复这个过程，Git 用二分法缩小范围
# 大约 log2(N) 步就能找到罪魁祸首

# 找到后退出
git bisect reset
```

在 1000 个 commit 中定位 Bug，bisect 只需要大约 10 步。比肉眼翻 commit log 高效太多了。

更高级的用法是自动化 bisect：

```bash
git bisect start HEAD v1.2.0
git bisect run npm test  # 自动用测试命令判断好坏
```

## Cherry-Pick：精确搬运，不拖家带口

场景：你在 feature 分支上做了 3 个 commit，但 reviewer 说其中 2 个可以上线了，第 3 个还需要改。你不能直接把整个分支合进去。

```bash
# 只把 commit abc123 和 def456 搬到 main 上
git checkout main
git cherry-pick abc123
git cherry-pick def456
```

或者在 rebase 过程中跳过某个 commit。

Cherry-pick 的本质是"应用一个补丁"。它会在当前分支创建一个新的 commit，内容和源 commit 相同，但 hash 不同。同样的改动，不同的身份。

**冲突处理：** cherry-pick 也可能产生冲突。解完冲突后：

```bash
git cherry-pick --continue
# 或者放弃
git cherry-pick --abort
```

## Reset 的三种模式

`git reset` 的三种模式对应了不同的"破坏程度"：

```bash
# --soft：只移动 HEAD，工作区和暂存区不变
git reset --soft HEAD~1
# 相当于"撤销 commit，但保留改动，并自动 staging"
# 适合：commit 后发现忘了加文件

# --mixed（默认）：移动 HEAD、重置暂存区，工作区不变
git reset HEAD~1
# 相当于"撤销 commit 和 staging，但保留文件改动"
# 适合：commit 后发现改错了，想重新改

# --hard：移动 HEAD、清空暂存区、还原工作区
git reset --hard HEAD~1
# 相当于"彻底删除这个 commit 的所有改动"
# 适合：commit 了不该改的东西，想完全丢弃
```

我个人的使用习惯：`--soft` 是最常用的，`--hard` 用得最少。每次用 `--hard` 之前都先确认 reflog 已经记住了。

## Stash 的隐藏用法

`git stash` 不只是暂存工作区：

```bash
# 带名称的 stash
git stash push -m "WIP: refactoring auth module"

# 查看 stash 列表
git stash list
# stash@{0}: On feature/login: WIP: refactoring auth module
# stash@{1}: On main: 修复样式问题

# 应用指定 stash
git stash apply stash@{1}

# 弹出指定 stash
git stash pop stash@{0}

# 从 stash 创建分支
git stash branch new-feature stash@{0}
```

`stash branch` 这个命令很实用——如果你 stash 的时候是在一个"脏"的分支上，可以直接从 stash 的内容创建一个新分支。

## 团队 Git 工作流建议

### 不要一个人用一套规范

团队 Git 规范最重要的是：**所有人用同一套**。rebase 还是 merge、squash 还是保留历史——这些争论不重要，重要的是统一。不一致的 Git 使用习惯产生的混乱比任何一种方式本身的问题都大。

### 推荐做法

1. **功能分支开发**：每个功能/修复从 main 切出独立分支
2. **本地 rebase 保持干净**：提交前用 `rebase` 同步 main
3. **PR/MR 合并用 merge commit**：保留拓扑信息和时间线
4. **commit message 遵循规范**：推荐 Conventional Commits 格式

```bash
feat: 添加用户注册功能
fix: 修复登录页面样式错乱
docs: 更新 API 文档
refactor: 重构数据库查询逻辑
test: 添加支付模块单元测试
chore: 更新依赖版本
```

这个约定不是花架子。规范化的 commit message 可以直接生成 changelog，也方便在 blame 时快速理解每个改动的目的。

## 写在最后

Git 高级操作最重要的不是记住命令——是理解每个操作对 Git 对象模型做了什么。当你理解了 commit 是有向无环图上的一个节点、branch 是指向 commit 的指针、HEAD 是当前所在位置——那些看起来吓人的操作就变得可预测了。

还有一个建议：搞不定了先不要慌。Git 不会轻易丢数据，reflog 是你最后的救星。先 `git reflog` 看看自己在哪，然后想清楚下一步要干什么再动手。
