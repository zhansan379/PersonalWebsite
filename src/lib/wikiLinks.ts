import type { VaultApi } from '../composables/useVault'
import { slugify } from './slugify'

/**
 * Obsidian wiki 链接解析器。
 *
 * 把正文里的 `[[...]]` / `![[...]]` 在喂给 marked 之前，解析成标准 markdown
 * 链接（或占位 HTML），使现有渲染管线能直接展示。数据来自 `useVault()` 的
 * 静态注册表，因此无需网络即可完成全部解析。
 *
 * 支持形态：
 *  - `[[完整路径]]`、`[[短名]]`（按 basename 消歧，重名/不存在→占位）
 *  - `[[note#章节]]`（锚点指向目标页同名标题，两侧都用 slugify 对齐）
 *  - `[[../相对路径]]`（相对当前笔记所在目录）
 *  - `[[路径|显示文字]]`（别名）
 *  - `![[图片.png]]`（经 assetMap 解析为 `<img>`）
 *  - `![[note]]` 反嵌入：降级为导航链接（避免递归；安全兜底）
 */

interface Target {
  id: string
  kind: 'note' | 'canvas'
  title: string
}

type Registry = {
  byId: Map<string, Target>
  byName: Map<string, Target[]>
}

function buildRegistry(api: VaultApi): Registry {
  const byId = new Map<string, Target>()
  const byName = new Map<string, Target[]>()

  for (const note of api.notes) {
    const t: Target = { id: note.id, kind: 'note', title: note.title }
    byId.set(note.id, t)
    pushName(byName, note.name, t)
  }
  for (const rel of api.canvasMap.keys()) {
    const t: Target = { id: rel, kind: 'canvas', title: rel }
    byId.set(rel, t)
    pushName(byName, rel.slice(rel.lastIndexOf('/') + 1), t)
  }
  return { byId, byName }
}

function pushName(map: Map<string, Target[]>, name: string, t: Target): void {
  const list = map.get(name)
  if (list) list.push(t)
  else map.set(name, [t])
}

const registryCache = new WeakMap<VaultApi, Registry>()
function getRegistry(api: VaultApi): Registry {
  let r = registryCache.get(api)
  if (!r) {
    r = buildRegistry(api)
    registryCache.set(api, r)
  }
  return r
}

/** 把 `.` `..` 折叠成规范化路径段，并合并当前所在目录。 */
function normalizeSegments(segs: string[]): string[] {
  const out: string[] = []
  for (const s of segs) {
    if (s === '' || s === '.') continue
    if (s === '..') out.pop()
    else out.push(s)
  }
  return out
}

function dirSegments(dir: string | undefined): string[] {
  return dir ? dir.split('/') : []
}

/**
 * 解析一个「裸目标」（已去掉 `!`、`|别名`、`#锚点`，字面上只含路径/短名）。
 */
function resolve(rawTarget: string, registry: Registry, currentDir: string | undefined): Target | null {
  let target = rawTarget.trim()
  if (target.startsWith('/')) target = target.slice(1)
  if (target.endsWith('.md')) target = target.slice(0, -'.md'.length)

  if (target === '' || target === '.') return null

  // 相对路径
  if (target.startsWith('./') || target.startsWith('../')) {
    const resolved = normalizeSegments([
      ...dirSegments(currentDir),
      ...target.split('/'),
    ])
    const id = resolved.join('/')
    return registry.byId.get(id) ?? null
  }

  // 含分隔符：优先精确 id；否则取“最短路径后缀”消歧
  if (target.includes('/')) {
    const exact = registry.byId.get(target)
    if (exact) return exact
    const suffix = '/' + target
    const cands = [...registry.byId.values()].filter((c) => c.id.endsWith(suffix))
    return pickShortest(cands)
  }

  // 短名
  const cands = registry.byName.get(target)
  if (!cands || cands.length === 0) return null
  if (cands.length === 1) return cands[0]
  // 多个同名：优先与当前笔记同目录 / 子目录者；否则去最短路径
  const local = cands.filter(
    (c) =>
      currentDir &&
      (c.id.startsWith(currentDir + '/') || c.id === currentDir),
  )
  if (local.length === 1) return local[0]
  return pickShortest(cands)
}

function pickShortest(cands: Target[]): Target | null {
  if (cands.length === 0) return null
  return [...cands].sort((a, b) => a.id.length - b.id.length)[0]
}

export interface ResolvedLink {
  /** 目标 id（不含 `.md`；canvas 含 `.canvas`）。 */
  id: string
  kind: Target['kind']
  /** 展示文字。 */
  text: string
  /** slug 化的锚点（可能为空）。 */
  anchor: string
}

/**
 * 解析单个 `[[...]]` 内部内容（不含 `!`，不含外层的双方括号）。
 * 解析失败返回 null（调用方渲染为“未创建”占位）。
 */
export function resolveLink(
  inner: string,
  registry: Registry,
  currentDir: string | undefined,
): ResolvedLink | null {
  // 别名
  const parts = inner.split('|').map((s) => s.trim())
  let targetStr = parts[0]
  let alias = parts.length > 1 ? parts.slice(1).join('|').trim() : ''

  // 锚点（文件名不允许含 `#`，安全）
  let anchor = ''
  const hashIdx = targetStr.lastIndexOf('#')
  if (hashIdx !== -1) {
    anchor = targetStr.slice(hashIdx + 1).trim()
    targetStr = targetStr.slice(0, hashIdx).trim()
  }
  // 块引用 `#^id`：不支持深度定位，退回纯链接（去掉锚点）
  const isBlockRef = anchor.startsWith('^')
  if (isBlockRef) anchor = ''

  let hit = resolve(targetStr, registry, currentDir)
  // Obsidian 也允许 `[[显示|目标]]`（别名在前的写法）
  if (!hit && alias && parts.length > 1) {
    const swapped = resolve(alias, registry, currentDir)
    if (swapped) {
      const tmp = alias
      alias = targetStr
      targetStr = tmp
      // 重新拆分锚点（罕见，此处简化：JSON 起见不重拆）
      hit = swapped
    }
  }

  if (!hit) return null
  return {
    id: hit.id,
    kind: hit.kind,
    text: alias || hit.title || hit.id,
    anchor: anchor ? slugify(anchor) : '',
  }
}

function hrefFor(id: string, anchor: string): string {
  return `/vault/${id}${anchor ? '#' + anchor : ''}`
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * 核心入口：把含 wiki 链接的 markdown 正文，解析为可直接交给 marked 的 markdown。
 */
export function resolveWikiMarkdown(raw: string, currentId: string, api: VaultApi): string {
  const registry = getRegistry(api)
  const currentDir = api.noteMap.get(currentId)?.dir

  // 1) 先处理嵌入 `![[...]]`
  let out = raw.replace(/!\[\[([^\]]+)\]\]/g, (_m, inner: string) => {
    const parts = inner.split('|').map((s) => s.trim())
    const targetStr = (parts[0] || '').trim()
    const alias = parts.length > 1 ? parts.slice(1).join('|').trim() : ''

    // 图片嵌入
    if (isImageTarget(targetStr)) {
      const imgName = lastSegmentOf(targetStr)
      const url = api.assetMap.get(imgName) ?? api.assetMap.get(withoutExtName(imgName))
      if (url) {
        const alt = alias || withoutExtName(lastSegmentOf(targetStr))
        return `![${escapeHtml(alt)}](${url})`
      }
      // 图片没找着：保留文本，回退为普通链接尝试解析
      const link = resolveLink(inner, registry, currentDir)
      if (link) return createAnchor(link)
      return `<span class="wiki-lost">![[${escapeHtml(inner)}]]</span>`
    }

    // 笔记反嵌入：降级为导航链接（避免递归渲染）
    const link = resolveLink(inner, registry, currentDir)
    if (link) return createAnchor(link, true)
    return `<span class="wiki-lost">![[${escapeHtml(inner)}]]</span>`
  })

  // 2) 处理普通 wiki 链接
  out = out.replace(/\[\[([^\]]+)\]\]/g, (_m, inner: string) => {
    const link = resolveLink(inner, registry, currentDir)
    if (!link) {
      const shown = inner.includes('|') ? inner.split('|')[0].trim() : inner.trim()
      return `<span class="wiki-missing" title="目标尚未创建">${escapeHtml(shown)}</span>`
    }
    return createAnchor(link)
  })

  return out
}

function createAnchor(link: ResolvedLink, embed = false): string {
  const cls = embed ? 'wiki-embed' : 'wiki-link'
  const title = link.id.endsWith('.canvas') ? 'canvas' : link.id
  return `<a class="${cls}" href="${hrefFor(link.id, link.anchor)}" title="${escapeHtml(title)}">${escapeHtml(link.text)}</a>`
}

function isImageTarget(t: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg)(#|\||$)/i.test(t.split('#')[0])
}

function lastSegmentOf(p: string): string {
  return p.slice(p.lastIndexOf('/') + 1)
}

function withoutExtName(s: string): string {
  return s.replace(/\.[^.]+$/, '')
}