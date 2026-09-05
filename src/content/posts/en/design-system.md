---
slug: design-system
title: A Lightweight Design System for a Personal Blog
date: 2026-07-12
tags: [design, tailwind]
---

A post should read well, not just look well. Here are the trade-offs.

## Type and spacing

- Sans-serif for headings, serif for body — a rhythm of contrast
- Line-height 1.8, generous paragraph spacing

## Theme switching

Light and dark switch through CSS variables and `data-theme`:

```css
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

:root { --bg: #fafaf9; }
:root[data-theme='dark'] { --bg: #0d0d0d; }
```

## Wrap up

A design system doesn't have to be heavy — a few tokens and consistent rules are enough.