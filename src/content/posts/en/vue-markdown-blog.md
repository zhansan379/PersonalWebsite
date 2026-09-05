---
slug: vue-markdown-blog
title: A Static Markdown Blog with Vue 3 and Vite
date: 2026-08-20
tags: [frontend, vue, tooling]
featured: true
---

For a backend-free personal blog, Vue 3 + Vite with static Markdown is a great fit.

## The approach

Use `import.meta.glob` to import every `content/posts/**/*.md` up front, and render with `marked`.

```ts
const modules = import.meta.glob('../content/posts/zh/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})
```

## Why this works

| Consideration | Result |
| --- | --- |
| Build | Fully static, hostable anywhere |
| Dependencies | Tiny, no runtime backend |
| Typing | Whole post model is strongly typed |

## Wrap up

Lights and loved — and easy to migrate to any content source later.