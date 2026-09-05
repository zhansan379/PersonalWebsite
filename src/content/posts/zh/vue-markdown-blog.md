---
slug: vue-markdown-blog
title: 用 Vue 3 与 Vite 打造一个纯静态 Markdown 博客
date: 2026-08-20
tags: [前端, Vue, 工程化]
featured: true
---

无后端的个人博客，最适合用 Vue 3 + Vite 的静态 Markdown 方案。

## 方案

利用 `import.meta.glob` 一次性导入 `content/posts/**/*.md`，配合 `marked` 渲染。

```ts
const modules = import.meta.glob('../content/posts/zh/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})
```

## 为什么这样选

| 考量 | 结论 |
| --- | --- |
| 构建 | 纯静态，可挂在任何静态托管 |
| 依赖 | 极小，无后端运行时 |
| 类型 | frontmatter 解析后强类型化 |

## 小结

这样搭建既轻量又具备完整的阅读体验，后续可平滑迁移到任何内容源。