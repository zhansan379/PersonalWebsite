---
title: GitHub Pull Request 使用指南
sort:
tags:
created: 2026-09-09
updated: 2026-09-09
---
## 一、创建 Pull Request

1. **准备分支**
   - 本地创建并切换新分支：`git checkout -b feature/your-feature`
2. **提交变更**
   - `git add .` → `git commit -m "描述变更"`
3. **推送分支**
   - `git push -u origin feature/your-feature`
4. **在 GitHub 上发起 PR**
   - 点击 **Compare & pull request** 按钮，或进入 Pull requests 标签页手动新建。
   - 选择 **base**（目标分支）和 **head**（你的分支），填写标题和描述，点击 **Create pull request**

## 二、更新 Pull Request

### 2.1 新增提交（最常用）
- 本地修改 → `git add .` → `git commit -m "fix: 根据反馈修改"`
- `git push origin feature/your-feature`  
PR 页面会自动新增该提交。

### 2.2 修正最后一个提交（谨慎）
- 修改后：`git add .` → `git commit --amend --no-edit`
- 强制推送：`git push --force-with-lease origin feature/your-feature`

### 2.3 同步主分支（避免冲突）

git checkout main && git pull origin main
git checkout feature/your-feature
git rebase main
git push --force-with-lease origin feature/your-feature

> 若冲突，解决后 `git add .` → `git rebase --continue`

---

## 三、核心认知澄清

- **PR 本质**：GitHub 平台为特定分支创建的 **协作管理工单**，不是 Git 原生命令。必须在 GitHub 网页（或通过 `gh` CLI）发起。
- **分支与 PR 的关系**：创建 PR 后，该分支的所有 **后续 Git 提交**（push）都会自动同步显示在 PR 时间线中。
- **外部操作（如部署）**：手动在 Vercel、阿里云等平台部署 **不会** 自动显示在 PR 中；只有通过 **CI/CD 自动化集成**（如 GitHub Actions）触发构建，状态和预览链接才会回传至 PR 页面。

---

## 四、小建议

- 保持 PR **小而聚焦**，只解决一个问题。
- 描述清晰，注明“为什么”和“如何测试”。
- 定期同步主分支，避免合并时大冲突。
- 及时响应审查意见，积极修改。
