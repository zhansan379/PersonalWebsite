---
slug: design-system
title: 为个人博客打造轻量设计体系
date: 2026-07-12
tags: [设计, Tailwind]
---

一篇文章既要好看，也要好读。以下是几个关键取舍。

## 字体与间距

- 标题用黑体，正文用衬线，形成节奏对比
- 行高 1.8，段落间距宽松

## 主题切换

浅色与深色通过 CSS 变量 + `data-theme` 切换：

```css
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

:root { --bg: #fafaf9; }
:root[data-theme='dark'] { --bg: #0d0d0d; }
```

## 小结

设计体系不需要很重，几个变量 + 一致的排版规则就够了。