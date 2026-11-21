/** First ~140 characters of clean plain text as a fallback excerpt. */
export function excerptFromBody(body: string): string {
  const text = body
    .replace(/^#{1,6}\s+/gm, '')              // ATX 标题
    .replace(/^\s*>\s?/gm, '')                // 块引用 `>`
    .replace(/^\s*[-+*]\s+/gm, '')            // 无序列表 `-` `*` `+`
    .replace(/^\s*\d+[.)]\s+/gm, '')          // 有序列表 `1.`
    .replace(/`([^`]*)`/g, '$1')              // 行内代码 → 取出代码文字
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')     // 图片 `![alt](url)`
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')  // 链接 → 只留文字
    .replace(/\[\[([^\]|]*)(?:\|[^\]]*)?\]\]/g, '$1') // wiki 链接 → 目标文字
    .replace(/^---+$/gm, '')                  // 分隔线
    .replace(/[*_]+/g, '')                    // 加粗/斜体/删除线等强调标记
  return text.split(/\s+/).filter(Boolean).slice(0, 40).join(' ').slice(0, 140)
}
