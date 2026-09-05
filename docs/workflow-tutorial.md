# 教程：用 GitHub workflow 把知识库自动推到博客

> 大白话版。目标是：**你只要在 Obsidian 里改 `wiki/` 并 push 到知识库仓库，博客仓库的内容会自动更新，Vercel 自动重建，全程不用手动复制笔记。**

## 先搞懂原理（1 分钟内）

你有**两个仓库**：

- **知识库仓库**（如 `zhansan379/obsidian-wiki`）：存你 Obsidian 笔记的地方，`wiki/` 是真的内容。
- **博客仓库**（本仓库 `zhansan379/PersonalWebsite`）：跑网站的，靠 `src/content/vault/` 里的笔记渲染 `/vault` 页面。

一句话流程：

```
你在知识库 push 了 wiki/
        ↓（触发迈 workflow）
workflow 把 wiki/ 复制进博客仓库的 src/content/vault/
        ↓（bot 提交 + 推送）
Vercel 看到博客仓库有更新，自动重新构建
        ↓
网站上的知识库内容变了
```

关键点：**workflow 放在知识库仓库**，用 GitHub 的 token 帮你去改**博客仓库**。内容最终会以 bot 身份提交进博客仓库（所以 `src/content/vault` 不能 gitignore，必须被跟踪）。

---

## 跟着做（三步）

### 第 1 步：在博客仓库造一把"钥匙"（PAT）

这个 key 让 workflow 有权限改博客仓库。用浏览器打开博客仓库 GitHub 页面：

1. 点头像 → **Settings** → 拉到最下 **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**。
2. 填个名字，比如 `blog-sync`。
3. **Repository access** 选 **Only select repositories**，勾上博客仓库 `zhansan379/PersonalWebsite`。
4. **Permissions** → **Contents** 设为 **Read and write**（关键，只给这个，别给别的）。
5. 点 **Generate token**，页面上出现一长串字符，**立刻复制保存**（关掉页面就再也看不见了）。

> 值就是一大段乱码，别乱贴、别提交到代码里。它就是你的"钥匙密码"。

### 第 2 步：在知识库仓库里存好钥匙和地址（secrets）

打开**知识库仓库**的 GitHub 页面：

1. **Settings** → **Secrets and variables** → **Actions** → **New repository secret**。
2. 加两个：

   | 名字（name）| 填什么 |
   |---|---|
   | `BLOG_PAT` | 第 1 步复制的那串乱码（钥匙）|
   | `BLOG_REPO` | `zhansan379/PersonalWebsite`（要去改的博客仓库地址）|

3. 各点一次 **Add secret**。

> secret = 加密存起来的配置项，workflow 运行时才能读到，别人看不到。`BLOG_REPO` 告诉 workflow"往谁家跑"，`BLOG_PAT` 告诉 workflow"用什么钥匙进门"。

### 第 3 步：在知识库仓库放一个 workflow 文件

在知识库仓库（即 `obsidian-wiki`）新建文件 `.github/workflows/sync-blog.yml`，内容如下：

```yaml
name: Sync wiki to blog
on:
  push:
    branches: [main]
    paths: ['wiki/**']              # 只有 wiki/ 变了才跑

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      # 1. 把知识库仓库(wiki)和历史/代码取下来
      - name: Checkout vault
        uses: actions/checkout@v4

      # 2. 把博客仓库也取下来(用钥匙),放在子目录 blog/
      - name: Checkout blog repo
        uses: actions/checkout@v4
        with:
          repository: ${{ secrets.BLOG_REPO }}
          token: ${{ secrets.BLOG_PAT }}
          path: blog

      # 3. 删掉博客里旧的知识库，拷进新的 wiki/
      - name: Copy wiki into blog
        run: |
          rm -rf blog/src/content/vault
          cp -r wiki blog/src/content/vault

      # 4. 让 bot 提交并推送回博客仓库
      - name: Commit and push
        run: |
          cd blog
          git config user.name "obsidian-wiki[bot]"
          git config user.email "obsidian-wiki[bot]@users.noreply.github.com"
          git add -A src/content/vault
          if git diff --cached --quiet; then
            echo "No changes; skip."; exit 0
          fi
          git commit -m "chore(vault): sync wiki content [skip ci]"
          git push origin main
```

每一段干嘛，上面注释已经写了。存盘后 commit + push 这个 yml 到知识库仓库的 `main`。

---

## 检验是否成功

- 随便改 `wiki/` 里一篇笔记（或新建一篇），push 到知识库仓库。
- 回 GitHub，知识库仓库的 **Actions** 标签页，能看到一次 `Sync wiki to blog` 运行。
- 运行全绿后，去博客仓库看，`src/content/vault/` 已经多了/更新了对应文件。
- 等 Vercel 构建完，刷新网站 `/vault`，内容出来了。

---

## 常见的坑

- **复制笔记没生效**：99% 是 `src/content/vault` 在博客仓库被 gitignore 了。workflow 的 `git add` 默认忽略被 ignore 的文件，push 了个寂寞。**这个目录必须被 git 跟踪**。
- **workflow 报权限错误（403/permission）**：钥匙配错了，去第 1 步重刷，确认 scope 勾的是 `Contents: Read and write`，且只授权了博客仓库。
- **每次笔记空跑**：`[skip ci]` 那段是防止"内容没变也提交"。如果 wiki 没变，会打印 `No changes; skip.`，正常。
- **私有知识库**：如果 `obsidian-wiki` 是私有的，记住 `wiki/` 推出去后博客仓库是**公开**的，`wiki/` 内容就等于公开了。`raw/` 这类私人内容**绝对不要**放在 `wiki/` 下。
- **两条同步路径**：本机 `npm run sync:vault` 和这套 GitHub workflow 是同一种作用的两种方式，别混着用当成唯一真源，以 workflow 为准即可保持一致。

---

## 什么时候用哪套

| 场景 | 做法 |
|---|---|
| 想让线上自动跟着笔记变 | 这套 GitHub workflow（推荐，省心）|
| 只想本地调试网站、不急着上线 | 本机 `npm run sync:vault` |
| 一次就够 / 没有自动化需求 | 手动复制或跑脚本 |