# PersonalWebsite

Goto® — a full-screen creative agency hero landing page, extended with a bilingual blog.

Built with Vue 3 + TypeScript + Vite + Tailwind CSS + Vue Router + vue-i18n.

> 页面截图
>
> ![首页](./screenshots/home.png)
>
> ![博客列表](./screenshots/blog.png)

## Features

- Full-screen background video scrubbed by horizontal mouse movement
- Typewriter headline with blinking caret
- Chinese (简体) / English i18n, switchable from the navbar (default Chinese)
- Local, self-hosted fonts (Latin + 思源宋体 Noto Serif SC in Chinese mode)
- Mobile menu, copy-to-clipboard contact pill
- Blog with Markdown content, reading-time estimate, tag + archive views
- Light / dark theme toggle

## Screenshots

> 页面截图占位

| 页面 | 截图 |
| --- | --- |
| 首页 | ![首页](/assets/screenshots/home.png?raw=true) |
| 博客列表 | ![博客列表](/assets/screenshots/blog.png?raw=true) |
| 文章详情 | ![文章详情](/assets/screenshots/post.png?raw=true) |
| 关于 | ![关于](/assets/screenshots/about.png?raw=true) |

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

Blog posts live as Markdown in `src/content/posts/{zh,en}/`, each with frontmatter (`title`, `date`, `tags`, `featured`, …). About pages are in `src/content/about/`.

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # type-check + production build
npm run preview  # preview the production build
```