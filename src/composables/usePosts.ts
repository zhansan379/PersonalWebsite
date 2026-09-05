import type { SupportedLocale } from '../i18n'
import { useI18n } from 'vue-i18n'

/**
 * A single blog post, derived from a Markdown file's frontmatter + body.
 * `slug` uniquely identifies a post across locales (`/blog/:slug`).
 */
export interface Post {
  slug: string
  title: string
  /** ISO date string, e.g. `2026-09-01`. */
  date: string
  tags: string[]
  /** Optional short summary; falls back to the first words of the body. */
  excerpt: string
  /** Whether to surface this post on the home page. */
  featured: boolean
  /** Raw Markdown body (frontmatter stripped). */
  content: string
  /** Reading time in minutes, estimated from word/char count. */
  readingTime: number
}

interface RawPost {
  slug: string
  title: string
  date: string
  tags: string[]
  excerpt: string
  featured: boolean
  content: string
}

type RawValues = {
  slug?: string
  title?: string
  date?: string
  tags?: string[]
  excerpt?: string
  featured?: boolean
}

/**
 * Import every Markdown post eagerly, by locale directory, so that the type
 * check and bundler know the full content graph ahead of time (pure static).
 */
const zhModules = import.meta.glob('../content/posts/zh/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})
const enModules = import.meta.glob('../content/posts/en/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const rawByLocale: Record<SupportedLocale, Record<string, string>> = {
  'zh-CN': zhModules as unknown as Record<string, string>,
  'en-US': enModules as unknown as Record<string, string>,
}

/** Strip leading `---\n…\n---` frontmatter and parse each `key: value` line. */
function parseFrontmatter(raw: string): {
  attributes: RawValues
  body: string
} {
  const match = /^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!match) return { attributes: {}, body: raw }
  const values: RawValues = {}
  const unquote = (s: string): string => s.replace(/^["']|["']$/g, '')
  for (const line of match[1].split(/\r?\n/)) {
    const sep = line.indexOf(':')
    if (!line.trim() || line.trim().startsWith('#') || sep === -1) continue
    const key = line.slice(0, sep).trim()
    const value = line.slice(sep + 1).trim()
    if (key === 'slug' || key === 'title' || key === 'date' || key === 'excerpt') {
      values[key] = unquote(value)
    } else if (key === 'tags') {
      values.tags = value
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((s) => unquote(s.trim()))
        .filter(Boolean)
    } else if (key === 'featured') {
      values.featured = value.trim().toLowerCase() === 'true'
    }
  }
  return { attributes: values, body: raw.slice(match[0].length) }
}

/** Rough reading-time estimate: CJK ~150 chars/min, Latin ~200 words/min. */
function estimateReadingTime(body: string): number {
  const cjkChars = (body.match(/[一-鿿぀-ヿ가-힯]/g) || [])
    .length
  const words = body.trim().split(/\s+/).filter(Boolean).length
  const minutes = cjkChars / 150 + words / 200
  return Math.max(1, Math.round(minutes))
}

/** First ~140 characters of plain text as a fallback excerpt. */
function excerptFromBody(body: string): string {
  const text = body.replace(/^#{1,6}\s+/gm, '').replace(/`[^`]*`/g, '')
  return text.split(/\s+/).filter(Boolean).slice(0, 40).join(' ').slice(0, 140)
}

function buildPost(filePath: string, raw: string): Post {
  const { attributes, body } = parseFrontmatter(raw)
  const { slug, title, date } = attributes
  const tags = attributes.tags ?? []
  const excerpt =
    attributes.excerpt?.trim() || excerptFromBody(body) || '——'
  return {
    slug: String(slug ?? filePath.split('/').pop() ?? 'post'),
    title: String(title ?? 'Untitled'),
    date: String(date ?? '1970-01-01'),
    tags,
    excerpt,
    featured: Boolean(attributes.featured),
    content: body.trim(),
    readingTime: estimateReadingTime(body),
  }
}

const postsByLocale = (Object.keys(rawByLocale) as SupportedLocale[]).reduce(
  (acc, locale) => {
    acc[locale] = Object.entries(rawByLocale[locale]).map(([path, raw]) =>
      buildPost(path, raw),
    )
    return acc
  },
  {} as Record<SupportedLocale, Post[]>,
)

/** All posts for the current locale, newest first. */
export function usePosts() {
  const { locale } = useI18n()

  function all(): Post[] {
    const key = locale.value as SupportedLocale
    return [...(postsByLocale[key] ?? [])].sort((a, b) =>
      b.date.localeCompare(a.date),
    )
  }

  function bySlug(slug: string): Post | undefined {
    return all().find((p) => p.slug === slug)
  }

  function allTags(): string[] {
    return [...new Set(all().flatMap((p) => p.tags))].sort()
  }

  function byTag(tag: string): Post[] {
    return all().filter((p) => p.tags.includes(tag))
  }

  return { all, bySlug, allTags, byTag }
}

export type { RawPost }
export { buildPost, estimateReadingTime }