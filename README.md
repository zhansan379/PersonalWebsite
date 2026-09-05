# PersonalWebsite

Goto® — a full-screen creative agency hero landing page, extended with a bilingual blog.

Built with Vue 3 + TypeScript + Vite + Tailwind CSS + Vue Router + vue-i18n.

> 页面截图
>
> <img width="2549" height="1191" alt="image" src="https://github.com/user-attachments/assets/2f40ce1a-dee4-4525-90d4-e6158f13ee52" />
>
> <img width="2549" height="1191" alt="image" src="https://github.com/user-attachments/assets/4f2070ea-8298-4ece-bab2-7bd307ceef0c" />
> 
> <img width="2549" height="1191" alt="image" src="https://github.com/user-attachments/assets/b676447f-9a58-4317-8a90-83713c1b9754" />
> 


## Features

- Full-screen background video scrubbed by horizontal mouse movement
- Typewriter headline with blinking caret
- Chinese (简体) / English i18n, switchable from the navbar (default Chinese)
- Local, self-hosted fonts (Latin + 思源宋体 Noto Serif SC in Chinese mode)
- Mobile menu, copy-to-clipboard contact pill
- Blog with Markdown content, reading-time estimate, tag + archive views
- Light / dark theme toggle

## Routes

| Path | Description |
| --- | --- |
| `/` | Home |
| `/blog` | Blog index |
| `/blog/:slug` | Post detail |
| `/tags` | Tags |
| `/tags/:tag` | Posts by tag |
| `/archive` | Archive |
| `/about` | About |

## Content

Blog / vault notes are one Chinese-language corpus synced in from an Obsidian knowledge base into `src/content/vault/`. About pages are in `src/content/about/`.

## Vault sync (GitHub workflow)

The `/vault` pages are driven by the Obsidian knowledge base. To have notes auto-pushed from your knowledge-base repo into this one on every commit, follow [`docs/workflow-tutorial.md`](docs/workflow-tutorial.md) — a plain-language guide covering:

- the GitHub Actions workflow (`paths` trigger + `VAULT_WIKI`/`VAULT_DEST` env config),
- the `BLOG_PAT` / `BLOG_REPO` secrets,
- optional push-to-a-branch and switching sync directories.

For local use you can run `npm run sync:vault` to copy the wiki into `src/content/vault/` without a workflow.

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # type-check + production build
npm run preview  # preview the production build
```
