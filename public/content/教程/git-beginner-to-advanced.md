---
title: Git 从入门到精通完整指南
date: 2026-05-17
cover: https://picsum.photos/seed/git-guide/800/400
desc: 从基础概念到高级技巧，全面掌握 Git 版本控制，包含大量实战示例
tags: [Git, 版本控制, 教程, 开发工具]
---

## 为什么需要 Git

Git 是现代软件开发的基础设施。无论是个人项目还是团队协作，掌握 Git 都是程序员的必备技能。本文将从零开始，带你系统学习 Git 的每一个重要概念和操作。

## 核心概念

### 三个工作区域

```
工作区 (Working Directory)  →  暂存区 (Staging Area)  →  本地仓库 (Local Repository)
         git add                      git commit
```

| 区域 | 说明 | 对应命令 |
|------|------|---------|
| 工作区 | 你正在编辑的文件 | - |
| 暂存区 | 准备提交的文件快照 | `git add` |
| 本地仓库 | 已提交的历史记录 | `git commit` |

### 四个状态

```
Untracked → Unmodified → Modified → Staged
  新文件      未修改        已修改      已暂存
```

## 基础操作

### 初始化仓库

```bash
# 初始化新仓库
git init

# 克隆远程仓库
git clone https://github.com/user/repo.git

# 克隆到指定目录
git clone https://github.com/user/repo.git my-project
```

### 日常提交

```bash
# 查看文件状态
git status

# 添加单个文件到暂存区
git add src/main.ts

# 添加所有修改的文件
git add .

# 添加所有 .ts 文件
git add "*.ts"

# 提交
git commit -m "feat: 添加用户登录功能"

# 修改最后一次提交（不创建新提交）
git commit --amend

# 查看提交历史
git log

# 简洁的提交历史
git log --oneline --graph --all
```

### 提交信息规范

推荐使用 Conventional Commits 规范：

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构（既不是新功能也不是修复）
test: 测试相关
chore: 构建过程或辅助工具变动
```

## 分支管理

### 基本操作

```bash
# 查看所有分支
git branch

# 创建新分支
git branch feature/user-auth

# 切换分支
git checkout feature/user-auth

# 创建并切换分支（推荐）
git checkout -b feature/user-auth

# 删除本地分支
git branch -d feature/user-auth

# 强制删除本地分支
git branch -D feature/user-auth

# 查看远程分支
git branch -r

# 查看所有分支（本地+远程）
git branch -a
```

### 分支合并

```bash
# 切换到目标分支
git checkout main

# 合并 feature 分支
git merge feature/user-auth

# 合并时创建合并提交（即使可以快进）
git merge --no-ff feature/user-auth

# 变基合并（保持线性历史）
git rebase feature/user-auth
```

### Merge vs Rebase

```
# Merge - 保留完整历史
A---B---C  main
     \
      D---E  feature
            \
             F  main + merge commit

# Rebase - 线性历史
A---B---C  main
         \
          D'---E'  feature (rebased)
```

**选择建议**：
- 个人分支用 `rebase`，保持历史清晰
- 公共分支用 `merge`，保留协作历史

## 远程仓库操作

```bash
# 添加远程仓库
git remote add origin https://github.com/user/repo.git

# 查看远程仓库
git remote -v

# 推送到远程
git push origin main

# 首次推送并设置上游分支
git push -u origin main

# 拉取并合并
git pull origin main

# 仅拉取不合并
git fetch origin

# 删除远程分支
git push origin --delete feature/old-branch
```

## 解决冲突

### 冲突场景

当两个分支修改了同一文件的同一区域时，合并会产生冲突：

```bash
# 合并时出现冲突
git merge feature/user-auth
# CONFLICT (content): Merge conflict in src/main.ts
```

### 解决步骤

```bash
# 1. 查看冲突文件
git status

# 2. 打开冲突文件，找到冲突标记
# <<<<<<< HEAD
# 当前分支的代码
# =======
# 被合并分支的代码
# >>>>>>> feature/user-auth

# 3. 手动编辑，保留需要的代码，删除冲突标记

# 4. 标记为已解决
git add src/main.ts

# 5. 完成合并
git commit
```

### 使用工具辅助

```bash
# 使用 mergetool（需要配置）
git mergetool

# 配置 VS Code 为 mergetool
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'
```

## 高级操作

### Stash - 临时保存工作

```bash
# 保存当前修改
git stash

# 保存并添加描述
git stash save "WIP: 用户登录功能"

# 查看所有 stash
git stash list

# 恢复最新的 stash
git stash pop

# 恢复指定的 stash
git stash pop stash@{2}

# 应用但不删除
git stash apply

# 删除 stash
git stash drop stash@{0}

# 清空所有 stash
git stash clear
```

### Cherry-pick - 挑选提交

```bash
# 查看提交 hash
git log --oneline

# 挑选指定提交到当前分支
git cherry-pick abc1234

# 挑选多个提交
git cherry-pick abc1234 def5678

# 挑选一个范围的提交
git cherry-pick abc1234..def5678
```

### Bisect - 二分查找 Bug

```bash
# 开始 bisect
git bisect start

# 标记当前为坏（有 bug）
git bisect bad

# 标记某个提交为好（没有 bug）
git bisect good v1.0.0

# Git 会自动切换到中间提交，测试后标记
git bisect good  # 或 git bisect bad

# 找到问题提交后结束
git bisect reset
```

### Reset vs Revert

```bash
# Reset - 移动 HEAD指针（会丢失历史）
git reset --soft HEAD~1    # 撤销提交，保留暂存区
git reset --mixed HEAD~1   # 撤销提交，保留工作区（默认）
git reset --hard HEAD~1    # 撤销提交，丢弃所有修改

# Revert - 创建新提交来撤销（安全，推荐用于公共分支）
git revert abc1234
```

## .gitignore 最佳实践

```gitignore
# 依赖
node_modules/
.pnp/
.pnp.js

# 构建输出
dist/
build/
*.local

# 编辑器
.vscode/*
!.vscode/extensions.json
.idea/
*.swp
*.swo

# 操作系统
.DS_Store
Thumbs.db

# 环境变量
.env
.env.local
.env.*.local

# 日志
*.log
npm-debug.log*

# 测试覆盖率
coverage/

# TypeScript
*.tsbuildinfo
```

## Git Hook

### 配置 Husky

```bash
# 安装 Husky
npx husky-init
npm install

# 添加 pre-commit hook
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint
npm run type-check
```

### 提交信息校验

```bash
# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx commitlint --edit $1
```

## 团队协作工作流

### Git Flow

```
main (生产)
  └── develop (开发)
        ├── feature/user-auth
        ├── feature/payment
        └── release/v1.0
              └── hotfix/bug-fix
```

| 分支 | 用途 | 生命周期 |
|------|------|---------|
| main | 生产环境代码 | 永久 |
| develop | 开发集成 | 永久 |
| feature/* | 新功能开发 | 临时 |
| release/* | 发布准备 | 临时 |
| hotfix/* | 紧急修复 | 临时 |

### GitHub Flow（更简单）

```
main
  └── feature-branch → PR → merge → main
```

适合持续部署的团队，规则更简单。

## 常见问题排查

| 问题 | 解决方案 |
|------|---------|
| 提交错了分支 | `git stash` → 切换到正确分支 → `git stash pop` → 提交 |
| 想撤销最后一次提交 | `git reset --soft HEAD~1` |
| 误删了分支 | `git reflog` 找到 commit hash → `git branch recovered <hash>` |
| 推送被拒绝 | `git pull --rebase` 后再 push |
| 大文件误提交 | 使用 `git filter-branch` 或 BFG Repo-Cleaner |

## 实用别名配置

```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.lg "log --oneline --graph --all"
git config --global alias.unstage "reset HEAD --"
git config --global alias.last "log -1 HEAD"
```

配置后可以使用 `git lg`、`git st` 等简短命令。

## 总结

Git 的学习曲线是渐进的：

1. **入门阶段**：掌握 init、add、commit、push、pull
2. **进阶阶段**：熟练使用分支、合并、解决冲突
3. **高级阶段**：rebase、cherry-pick、bisect、hook
4. **精通阶段**：理解底层原理、自定义工作流

建议在日常开发中刻意练习，遇到问题先查文档再操作。Git 的官方文档（`git help <command>`）是最好的参考资料。
