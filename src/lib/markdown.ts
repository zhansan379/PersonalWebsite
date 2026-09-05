import { marked } from 'marked'
import { slugify } from './slugify'

/**
 * 统一的 marked 入口：保证标题 slug id 扩展只注册一次，无论从哪个页面进入。
 *
 * - 给 h1–h3 补 slug id，供 wiki 链接 `#章节` 锚点滚动
 * - `MarkdownRenderer` / canvas 文本节点都走这里，避免重复注册
 */
marked.use({
  renderer: {
    heading(
      this: unknown,
      token: { depth?: number; tokens?: Array<{ text?: string; raw?: string }> },
    ): string {
      const depth = token.depth ?? 2
      const text = (token.tokens ?? [])
        .map((t) => t.text ?? t.raw ?? '')
        .join('')
      const id = slugify(text)
      const parser = (this as { parser?: { parseInline: (t: unknown) => string } })
        .parser
      const body = parser?.parseInline(token.tokens) ?? ''
      return body
        ? `<h${depth} id="${id}">${body}</h${depth}>\n`
        : `<h${depth} id="${id}"></h${depth}>\n`
    },
  },
})

/** 把 markdown 源码渲染为 HTML 字符串。 */
export function renderMarkdown(source: string): string {
  return marked.parse(source, { async: false }) as string
}