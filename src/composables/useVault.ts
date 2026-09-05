import { slugify } from '../lib/slugify'

/**
 * Vault 数据层：把 `src/content/vault/**`（Obsidian wiki/ 的副本）在构建期静态导入，
 * 产出供目录树、wiki 链接解析、canvas 渲染所用的纯内存数据。
 *
 * 与 `usePosts.ts` 同款手法：`import.meta.glob('?raw' | '?url', eager)` 会把整个内容
 * 图打进 bundle，因此没有网络请求，数据在模块加载时就绪。
 */

const VAULT_PREFIX = '../content/vault/'

const noteModules = import.meta.glob('../content/vault/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const imageModules = import.meta.glob(
  '../content/vault/**/*.{png,jpg,jpeg,gif,webp,svg}',
  { query: '?url', import: 'default', eager: true },
) as Record<string, string>

const canvasModules = import.meta.glob('../content/vault/**/*.canvas', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** vault 内一件可寻址对象（一篇笔记或一个 canvas）。 */
export type VaultItemKind = 'note' | 'canvas'

export interface VaultNote {
  /** 查找键 / URL 用 id：vault 相对路径、去掉 `.md`。 */
  id: string
  /** 带 `.md` 的 vault 相对路径。 */
  path: string
  /** 所在目录（vault 相对，无结尾 `/`）。 */
  dir: string
  /** 文件名（去掉 `.md`，最后一段）。 */
  name: string
  /** 展示名：frontmatter.title → 首个 `# ` 标题 → 文件名。 */
  title: string
  tags: string[]
  /** 是否标记为首页「精选」（frontmatter.featured）。 */
  featured: boolean
  created?: string
  updated?: string
  /** 完整原始内容（含 frontmatter）。 */
  raw: string
  /** 去掉 frontmatter 后的 markdown 正文。 */
  body: string
}

export interface CanvasData {
  nodes: Array<{
    id: string
    type: 'file' | 'text' | 'group'
    file?: string
    text?: string
    x: number
    y: number
    width: number
    height: number
    color?: string
  }>
  edges: Array<{
    id: string
    fromNode: string
    fromSide: string
    toNode: string
    toSide: string
    color?: string
  }>
}

export type VaultTreeNodeType = 'dir' | 'note' | 'canvas'
export interface VaultTreeNode {
  type: VaultTreeNodeType
  name: string
  /** dir 无；note/canvas 为查找键。 */
  id?: string
  children?: VaultTreeNode[]
}

// ---------------------------------------------------------------------------
// 轻量 YAML-lite frontmatter 解析（支持标量、内联数组、块级 `- item` 列表）
// ---------------------------------------------------------------------------
function unquote(s: string): string {
  return s.replace(/^["']|["']$/g, '')
}

interface Frontmatter {
  title?: string
  tags: string[]
  created?: string
  updated?: string
  featured: boolean
  body: string
}

function parseFrontmatter(raw: string): Frontmatter {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!match) return { tags: [], featured: false, body: raw }

  const attrs: Record<string, string | string[]> = {}
  let currentList: string | null = null

  for (const line of match[1].split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue

    if (t.startsWith('- ')) {
      if (currentList && Array.isArray(attrs[currentList])) {
        ;(attrs[currentList] as string[]).push(unquote(t.slice(2).trim()))
      }
      continue
    }

    const sep = line.indexOf(':')
    if (sep === -1) {
      currentList = null
      continue
    }
    const key = line.slice(0, sep).trim()
    const val = line.slice(sep + 1).trim()
    currentList = key
    if (val === '') {
      attrs[key] = []
    } else if (val.startsWith('[')) {
      attrs[key] = val
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((s) => unquote(s.trim()))
        .filter(Boolean)
    } else {
      attrs[key] = unquote(val)
    }
  }

  const tags = Array.isArray(attrs.tags)
    ? (attrs.tags as string[])
    : typeof attrs.tags === 'string'
      ? [attrs.tags]
      : []

  return {
    title: typeof attrs.title === 'string' ? attrs.title : undefined,
    tags,
    created: typeof attrs.created === 'string' ? attrs.created : undefined,
    updated: typeof attrs.updated === 'string' ? attrs.updated : undefined,
    featured: attrs.featured === 'true',
    body: raw.slice(match[0].length).trim(),
  }
}

function firstHeading(body: string): string | undefined {
  const m = /^\s*#\s+(.+)$/m.exec(body)
  return m ? m[1].trim() : undefined
}

// ---------------------------------------------------------------------------
// 生成 vault 相对路径（去掉 glob 前缀）
// ---------------------------------------------------------------------------
function toVaultRel(key: string): string {
  return key.slice(VAULT_PREFIX.length)
}

function withoutExt(p: string, ext: string): string {
  return p.endsWith(ext) ? p.slice(0, -ext.length) : p
}

function dirOf(p: string): string {
  const i = p.lastIndexOf('/')
  return i === -1 ? '' : p.slice(0, i)
}

// ---------------------------------------------------------------------------
// 组装数据
// ---------------------------------------------------------------------------
const noteIds = Object.keys(noteModules)
  .map(toVaultRel)
  .sort()

const noteMap = new Map<string, VaultNote>()
for (const rel of noteIds) {
  const raw = noteModules[VAULT_PREFIX + rel]
  const fm = parseFrontmatter(raw)
  const id = withoutExt(rel, '.md')
  const basename = rel.slice(rel.lastIndexOf('/') + 1)
  noteMap.set(id, {
    id,
    path: rel,
    dir: dirOf(rel),
    name: withoutExt(basename, '.md'),
    title: fm.title ?? firstHeading(fm.body) ?? id,
    tags: fm.tags,
    featured: fm.featured,
    created: fm.created,
    updated: fm.updated,
    raw,
    body: fm.body,
  })
}

// 图片：Obsidian 的 `![[Pasted image xx.png]]` 按「文件名」全库查找。
// 同名冲突时取路径段更少者（Obsidian 的 shortest-path 规则）。
const assetMap = new Map<string, string>()
const assetSegs = new Map<string, number>()
for (const key of Object.keys(imageModules)) {
  const url = imageModules[key]
  const rel = toVaultRel(key)
  const basename = rel.slice(rel.lastIndexOf('/') + 1) // 保留扩展名，如 `Pasted image x.png`
  const segs = rel.split('/').length
  if (!assetSegs.has(basename) || segs < assetSegs.get(basename)!) {
    assetMap.set(basename, url)
    assetSegs.set(basename, segs)
  }
}

const canvasMap = new Map<string, CanvasData>()
for (const key of Object.keys(canvasModules)) {
  const rel = toVaultRel(key)
  try {
    canvasMap.set(rel, JSON.parse(canvasModules[key]) as CanvasData)
  } catch {
    // 单个损坏的 canvas 不阻塞整个站点
  }
}

// ---------------------------------------------------------------------------
// 目录树
// ---------------------------------------------------------------------------
function insertNode(
  children: VaultTreeNode[],
  segments: string[],
  id: string,
  leafType: 'note' | 'canvas',
): void {
  const [head, ...rest] = segments
  if (rest.length === 0) {
    children.push({ type: leafType, name: head, id })
    return
  }
  let dir = children.find((c) => c.type === 'dir' && c.name === head)
  if (!dir) {
    dir = { type: 'dir', name: head, children: [] }
    children.push(dir)
  }
  insertNode(dir.children!, rest, id, leafType)
}

function sortTree(children: VaultTreeNode[]): void {
  children.sort((a, b) => {
    if (a.type === 'dir' && b.type !== 'dir') return -1
    if (a.type !== 'dir' && b.type === 'dir') return 1
    return a.name.localeCompare(b.name, 'zh')
  })
  children.forEach((c) => c.children && sortTree(c.children))
}

const treeRoot: VaultTreeNode[] = []
for (const note of noteMap.values()) {
  insertNode(treeRoot, note.id.split('/'), note.id, 'note')
}
for (const canvasId of canvasMap.keys()) {
  insertNode(treeRoot, canvasId.split('/'), canvasId, 'canvas')
}
sortTree(treeRoot)

// ---------------------------------------------------------------------------
// 导出
// ---------------------------------------------------------------------------
export interface VaultApi {
  notes: VaultNote[]
  root: VaultTreeNode[]
  assetMap: Map<string, string>
  canvasMap: Map<string, CanvasData>
  noteMap: Map<string, VaultNote>
  resolveNote: (target: string) => VaultNote | undefined
}

function buildApi(): VaultApi {
  return {
    notes: [...noteMap.values()],
    root: treeRoot,
    assetMap,
    canvasMap,
    noteMap,
    resolveNote: (target) => noteMap.get(target),
  }
}

const api = buildApi()

/** 全局单例：数据在模块加载时已静态就绪，无需异步。 */
export function useVault(): VaultApi {
  return api
}

export { slugify }