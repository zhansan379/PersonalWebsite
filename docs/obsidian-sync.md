# Obsidian 知识库同步到博客

`/vault` 页面展示的是 Obsidian 知识库 `wiki/` 目录的结构化内容（目录树 + `[[wiki 链接]]` + canvas）。内容是**构建期静态内联**的——每次同步把 `wiki/` 镜像进本仓库 `src/content/vault/`，Vite 的 `import.meta.glob` 在 `vue-tsc`/`vite build` 时打进产物。

> 隐私边界：**只发布 `wiki/`**。`raw/`（个人日记、健康、爬取文章等敏感内容）永远不进入本仓库。同步脚本也只读 `wiki/` 这一个目录，路径由 `VAULT_WIKI` 指定，默认 `D:/Obsidian/data/obsidian_journal/wiki`。把知识库推到 GitHub 前请再三确认 `raw/` 被排除（`.gitignore` 或独立仓库）。

## 本地同步（首次 / 手动）

```bash
node scripts/sync-wiki.mjs
# 自定义源：
VAULT_WIKI=D:/path/to/wiki node scripts/sync-wiki.mjs
```

脚本行为：

- **镜像** `wiki/` 完整目录 + 图片到 `src/content/vault/`（幂等，可反复跑）。
- **文件名消毒**：部分文件名含 `# $` 等字符会破坏 Vite 的 `?raw` 静态导入解析，用一个显式映射改名（见脚本内 `RENAME_MAP`）。
- **链接改写**：被改名笔记的库内 `[[wiki 链接]]`（短名 / 全路径）同步改成新 id，保证笔记间互链不断。
- **删除同步**：目标里源中已不存在的文件会被删除，让内容下架也能推送到线上。

抓好笔记、`node scripts/sync-wiki.mjs`、`git add -A && git commit && git push` 即为一次完整更新。构建前可用脚本自检：

```bash
node scripts/_verify-vault.mjs   # 对真实内容断言链接/图片/目录解析
```

## GitHub 全自动（源仓库 Action → 推送博客仓库）

原理：GitHub 不同仓库之间用 **GitHub Actions**（而非 webhook）。在知识库仓库里放一个 Action：`wiki/**` 一有 push，就把 `wiki/` 同步进博客仓库的 `src/content/vault/`（复用同一脚本），提交并 push 到博客仓库 `main`，Vercel 检测到 push 后自动重建。

### 1. 在博客仓库建一个 fine-grained PAT

- Settings → Developer settings → **Personal access tokens → Fine-grained tokens** → New token。
- 只授权博客仓库（如 `zhansan379/PersonalWebsite`）+ `Contents: read + write`。
- 命名为 `BLOG_PAT`，复制 token 值。

### 2. 知识库仓库加两个 secret

假设知识库仓库为 `zhansan379/obsidian-wiki`：

1. `BLOG_PAT` ← 上面的 token 值。
2. `BLOG_REPO` ← `zhansan379/PersonalWebsite`（要同步的目标仓库）。

> 注意：若知识库仓库本身是**私有**的，先确认你确实想让 `wiki/` 内容公开到博客，且 `raw/` 绝不入库。

### 3. 知识库仓库放 Action

在知识库仓库新增 `.github/workflows/sync-blog.yml`：

```yaml
name: Sync wiki to blog
on:
  push:
    branches: [main]
    paths: ['wiki/**']   # 只触发 wiki/ 变化

jobs:
  sync:
    runs-on: ubuntu-latest
    if: "!contains(github.event.head_commit.message, '[skip ci]')"
    steps:
      - name: Checkout vault
        uses: actions/checkout@v4

      - name: Checkout blog repo
        uses: actions/checkout@v4
        with:
          repository: ${{ secrets.BLOG_REPO }}
          token: ${{ secrets.BLOG_PAT }}
          path: blog

      - name: Copy wiki into blog src/content/vault
        run: |
          rm -rf blog/src/content/vault
          cp -r wiki blog/src/content/vault
          rm -f blog/src/content/vault/.obsidian_ignore # 如有需要可作删除占位

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

> **与 `scripts/sync-wiki.mjs` 的关系**：`sync-wiki.mjs` 承担「改文件名、改写链接」这类在复制时需要的转换，适合本仓库独立跑或作为 CI 的参考逻辑。GitHub 上更省心的做法是上面示例——直接从 `wiki/` 平铺复制到 `src/content/vault/`（绝大多数笔记文件名无特殊字符）。若你的库开始出现特殊字符文件名，把 REPO 内改成 `node scripts/sync-wiki.mjs`（需先把脚本/映射同步进博客仓库检出）。

### 4. Vercel 联动

- Vercel 项目绑定博客仓库 `main`，默认随 push 自动构建。无需额外配置。
- 若只想在 vault 内容变化时重建、避免空构建，可选在博客仓库加一个轻量 Action：监听 `src/content/vault/**`，有变化时调用 Vercel Deploy Hook。但显式 commit（上面第 3 步每次真有内容才提交）已经能避免空构建，通常不必再加。

## 与 `wiki/` 保持一致的约定

- `/vault` 是**单一中文语料**：内容恒为中文，不做 locale 拆分或翻译；只有界面 chrome（导航、目录标题、canvas 工具栏、按钮、占位提示）走 i18n。中英文模式都展示同一批笔记。
- 每次合入前：`npm run build` 确保 `vue-tsc -b && vite build` 通过（`_verify-vault.mjs` 是快速回归）。