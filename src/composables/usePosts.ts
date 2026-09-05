import { useVault } from './useVault'

/**
 * A single "post" as surfaced to the blog-facing views. Since the vault is the
 * single content source, a Post is a thin projection of a vault note — the
 * view layer keeps consuming the same methods as before.
 */
export interface Post {
  /** Vault note id (vault-relative path without `.md`), e.g. `编程/mq/1.什么是消息队列`. Uniquely identifies a note across the single corpus. */
  slug: string
  title: string
  /** ISO date string, e.g. `2026-09-01`; falls back created → updated, or `null` when neither is set. */
  date: string | null
  tags: string[]
  /** Optional short summary; falls back to the first words of the body. */
  excerpt: string
  /** Whether this note is surfaced on the home page (`frontmatter.featured`). */
  featured: boolean
  /** Raw Markdown body (frontmatter stripped). */
  content: string
  /** Reading time in minutes, estimated from word/char count. */
  readingTime: number
}

/** Rough reading-time estimate: CJK ~150 chars/min, Latin ~200 words/min. */
function estimateReadingTime(body: string): number {
  const cjkChars = (body.match(/[一-鿿぀-ヿ가-힯]/g) || [])
    .length
  const words = body.trim().split(/\s+/).filter(Boolean).length
  const minutes = cjkChars / 150 + words / 200
  return Math.max(1, Math.round(minutes))
}

/** First ~140 characters of clean plain text as a fallback excerpt. */
function excerptFromBody(body: string): string {
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

function toPost(note: import('./useVault').VaultNote): Post {
  return {
    slug: note.id,
    title: note.title,
    date: note.created ?? note.updated ?? null,
    tags: note.tags,
    excerpt: excerptFromBody(note.body) || '——',
    featured: note.featured,
    content: note.body,
    readingTime: estimateReadingTime(note.body),
  }
}

/**
 * Blog-facing views read the knowledge base reference-shaped notes. Built
 * eagerly at module load; `all()` is locale-independent (single corpus).
 */
export function usePosts() {
  const api = useVault()
  const posts: Post[] = api.notes.map(toPost)

  function all(): Post[] {
    // 无日期（date 为 null）的文章排到末尾。
    return [...posts].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
  }

  function bySlug(slug: string): Post | undefined {
    return all().find((p) => p.slug === slug)
  }

  function allTags(): string[] {
    return [...new Set(posts.flatMap((p) => p.tags))].sort()
  }

  function byTag(tag: string): Post[] {
    return all().filter((p) => p.tags.includes(tag))
  }

  return { all, bySlug, allTags, byTag }
}

export { estimateReadingTime }