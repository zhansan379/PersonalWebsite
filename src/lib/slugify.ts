/**
 * 生成与 Obsidian 锚点匹配的「简短 slug」。
 *
 * 用于两个地方：
 * 1. 给渲染后的标题加 `id`，使 `[[note#章节名]]` 能被浏览器滚动到。
 * 2. 在 wiki 链接解析时，对锚点文本做同样的归一化，保证两侧一致。
 *
 * 规则：去首尾空白与小写化；保留字母/数字/中日韩(CJK)字符；其余标点/空格
 * 连续折叠成单个连字符。中英文标题都能可靠地产生稳定 id。
 */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    // 去掉常见的排版引号，避免留在 id 里
    .replace(/[“”‘’`]/g, '')
    // 去掉其它通常不打进 slug 的字符（星号、反引号、重音等）
    .replace(/[*_~#]/g, '')
    // 非字母/数字/CJK 一律折叠为连字符
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    // 去掉首尾连字符，多个连字符已自动压缩
    .replace(/^-+|-+$/g, '')
}