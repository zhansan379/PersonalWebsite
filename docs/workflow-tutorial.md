# 教程：用 GitHub workflow 把知识库自动推到博客

> 大白话版。目标是：**你只要在 Obsidian 里改 `wiki/` 并 push 到知识库仓库，博客仓库的内容会自动更新，Vercel 自动重建，全程不用手动复制笔记。**

## 先搞懂原理（1 分钟内）

你有**两个仓库**：

- **知识库仓库**（如 `zhansan379/obsidian-wiki`）：存你 Obsidian 笔记的地方，`wiki/` 是真的内容。
- **博客仓库**（本仓库 `zhansan379/PersonalWebsite`）：跑网站的，靠 `src/content/vault/` 里的笔记渲染 `/vault` 页面。

一句话流程：

```
你在知识库 push 了 wiki/
        ↓（触发 workflow）
workflow 把 wiki/ 同步进博客仓库的 src/content/vault/
        ↓（bot 提交 + 推送）
Vercel 看到博客仓库有更新，自动重新构建
        ↓
网站上的知识库内容变了
```

关键点：**workflow 放在知识库仓库**，用 GitHub 的 token 帮你去改**博客仓库**。内容最终会以 bot 身份提交进博客仓库（所以 `src/content/vault` 不能 gitignore，必须被跟踪）。

---

## 什么都用环境变量配（这是本教程的核心）

`wiki/` 那个**源目录**、以及博客仓库里落脚的**目标目录**，都不写在脚本里写死，而是通过**环境变量**控制：

| 环境变量 | 作用 | 默认值（不设时） |
|---|---|---|
| `VAULT_WIKI` | 源目录 = 从哪个文件夹读笔记 | `D:/Obsidian/data/obsidian_journal/wiki`（本地默认）|
| `VAULT_DEST` | 目标目录 = 写进博客仓库哪里 | 博客仓库的 `src/content/vault` |

本地手动跑、以及 GitHub workflow，都读这两个变量 → **同一个脚本，两处共用**，以后改目录只改配置、不动代码。

---

## 跟着做（三步）

### 第 1 步：在博客仓库造一把"钥匙"（PAT）

这个 key 让 workflow 有权限改博客仓库。用浏览器打开博客仓库 GitHub 页面：

1. 点头像 → **Settings** → 拉到最下 **Developer settings** → **Personal access tokens（Fine-grained tokens）** → **Generate new token**。
2. 填个名字，比如 `blog-sync`。
3. **Repository access** 选 **Only select repositories**，勾上博客仓库 `zhansan379/PersonalWebsite`。
4. **Permissions** → **Contents** 设为 **Read and write**（关键，只给这个，别给别的）。
5. 点 **Generate token**，页面上出现一长串字符，**立刻复制保存**（关掉页面就再也看不见了）。

> 值就是一大段乱码，别乱贴、别提交到代码里。它就是你的"钥匙密码"。

### 第 2 步：在知识库仓库里存好钥匙、仓库地址和目录（secrets 变量）

打开**知识库仓库**的 GitHub 页面：

1. **Settings** → **Secrets and variables** → **Actions**。
2. 在 **Secrets** 下加两个：

   | 名字（name）| 填什么 |
   |---|---|
   | `BLOG_PAT` | 第 1 步复制的那串乱码（钥匙）|
   | `BLOG_REPO` | `zhansan379/PersonalWebsite`（要去改的博客仓库地址）|

   各点一次 **Add secret**。

3. 在 **Variables** 下加一个**可选的目录变量**（想用非默认目录才需要）：

   | 名字（name）| 填什么 |
   |---|---|
   | `VAULT_WIKI` | 源目录名，比如 `wiki`（你笔记真的放在哪个文件夹）|

   点 **Add variable**。

> secret = 加密存、别人看不到；variable = 明文存、通常不敏感。`BLOG_PAT`、`BLOG_REPO` 用 secret；目录名这种不敏感的用 variable 即可。不设变量就用默认值，见下文第三步的 `||` 兜底写法。

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
    env:                            # 目录全靠这里配 → 改目录只动这一块
      VAULT_WIKI: ${{ vars.VAULT_WIKI || 'wiki' }}        # 源目录（本地默认是 D:/Obsidian/...）
      VAULT_DEST: blog/synced_content/vault               # 目标目录（要带 blog/ 前缀，因为博客仓库 checkout 在 blog/ 下）
    steps:
      # 1. 把知识库仓库(wiki)取下来 => 当前工作目录
      - name: Checkout vault
        uses: actions/checkout@v4

      # 2. 把博客仓库也取下来(用钥匙),放在子目录 blog/
      - name: Checkout blog repo
        uses: actions/checkout@v4
        with:
          repository: ${{ secrets.BLOG_REPO }}
          token: ${{ secrets.BLOG_PAT }}
          path: blog

      # 3. 用博客仓库自带的同步脚本，按环境变量把 wiki/ 写进目标目录
      - name: Sync wiki into blog
        run: node blog/scripts/sync-wiki.mjs

      # 4. 让 bot 提交并推送回博客仓库（git -C blog = 在 blog 目录里执行，但 shell 不换目录）
      - name: Commit and push
        run: |
          git -C blog config user.name "obsidian-wiki[bot]"
          git -C blog config user.email "obsidian-wiki[bot]@users.noreply.github.com"
          git -C blog add -A synced_content/vault
          if git -C blog diff --cached --quiet; then
            echo "No changes; skip."; exit 0
          fi
          git -C blog commit -m "chore(vault): sync wiki content [skip ci]"
          git -C blog push origin main
```

每段干嘛，上面注释已经写了。存盘后 commit + push 这个 yml 到知识库仓库的 `main`。

> **为什么用它自带的 `sync-wiki.mjs` 而不是手动 `cp -r`**：这个脚本做了 `#`/`$` 这类会破坏 Vite 打包的文件名消毒、以及笔记间 `[[链接]]` 的改写，`cp` 做不到。workflow 里 `run: node blog/scripts/sync-wiki.mjs` 就是调博客仓库里那份脚本，脚本读取上面 `env` 的两个变量决定从哪读到哪写。

---

## 检验是否成功

- 随便改 `wiki/` 里一篇笔记（或新建一篇），push 到知识库仓库。
- 回 GitHub，知识库仓库的 **Actions** 标签页，能看到一次 `Sync wiki to blog` 运行。
- 运行全绿后，去博客仓库看，目标目录（默认 `src/content/vault/`）已经多了/更新了对应文件。
- 等 Vercel 构建完，刷新网站 `/vault`，内容出来了。

---

## 改目录怎么改（只用配，不动代码）

- **本机手动跑**：`VAULT_WIKI=D:/其它/wiki VAULT_DEST=src/content/别的 node scripts/sync-wiki.mjs`。
- **workflow 自动跑**：改知识库仓库 Actions 里的 **Variables**（`VAULT_WIKI`），或直接改第 3 步 yml 里 `env:` 块的值。两处写成一样即可。

> 注意：`VAULT_DEST` 必须带 `blog/` 前缀（因为博客仓库 checkout 在 `blog/` 子目录下，脚本相对工作目录解析），第 4 步的 `git -C blog add -A synced_content/vault` 引用的是去掉 `blog/` 后的路径——两处要匹配。另外 `on.push.paths: ['wiki/**']` 那一行是 GitHub 触发规则，**不支持读变量**，必须手写真实的源目录路径。

> ⚠️ **换源目录名时的坑（`paths` 和 `VAULT_WIKI` 必须一起改）**：`paths` 是"触发开关"，`VAULT_WIKI` 是"脚本从哪读"，两者管不同的事——`paths` 决定进不进门，`VAULT_WIKI` 决定进门后往哪走。所以默认没问题（两边都写 `wiki`）；但如果你把 `VAULT_WIKI` 改成别的（比如 `notes`），`paths` 里那行**必须同步改成 `notes/**`**，否则你改 `notes/` 时触发规则看的是 `wiki/`，根本不会启动 workflow，白改。

---

## 常见的坑

- **复制笔记没生效**：99% 是 `src/content/vault` 在博客仓库被 gitignore 了。workflow 的 `git add` 默认忽略被 ignore 的文件，push 了个寂寞。**这个目录必须被 git 跟踪**。
- **目录对不上 / 网站空的**：确认本机跑用的 `VAULT_WIKI` 和 workflow 里的值**一致**，别两端不同步。
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