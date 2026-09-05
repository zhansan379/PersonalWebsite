<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { CanvasData } from '../../composables/useVault'
import { useVault } from '../../composables/useVault'
import { resolveWikiMarkdown } from '../../lib/wikiLinks'
import { renderMarkdown } from '../../lib/markdown'
import ImageLightbox from './ImageLightbox.vue'

const props = defineProps<{ data: CanvasData }>()

const api = useVault()
const router = useRouter()

// Obsidian 的边 `color` 是 1..6，对应默认调色板。
const EDGE_COLORS = [
  '#8b5cf6', // 1 purple
  '#ec4899', // 2 pink
  '#ef4444', // 3 red
  '#f59e0b', // 4 orange
  '#22c55e', // 5 green
  '#3b82f6', // 6 blue
]

const nodesById = computed(() => new Map(props.data.nodes.map((n) => [n.id, n])))

const minX = computed(() => Math.min(...props.data.nodes.map((n) => n.x)))
const minY = computed(() => Math.min(...props.data.nodes.map((n) => n.y)))
const maxX = computed(() => Math.max(...props.data.nodes.map((n) => n.x + n.width)))
const maxY = computed(() => Math.max(...props.data.nodes.map((n) => n.y + n.height)))
const worldW = computed(() => Math.max(1, maxX.value - minX.value))
const worldH = computed(() => Math.max(1, maxY.value - minY.value))

// 平移 / 缩放
const scale = ref(0.8)
const tx = ref(0)
const ty = ref(0)
const dragging = ref(false)
const zoomRef = ref<HTMLDivElement | null>(null)
let startX = 0
let startY = 0
let startTx = 0
let startTy = 0
let moved = false

// 图片放大
const zoomSrc = ref<string | null>(null)
function onCanvasClick(e: MouseEvent): void {
  const img = (e.target as HTMLElement).closest('img')
  if (img && img.getAttribute('src')) zoomSrc.value = img.getAttribute('src')
}

// 首次进入：把画布自动适配到视口中央（canvas 常含负坐标，否则内容跑到屏幕外）。
function fit(): void {
  const el = zoomRef.value
  if (!el) return
  const vw = el.clientWidth
  const vh = el.clientHeight
  if (!vw || !vh) return
  scale.value = Math.min(1.1, (vw * 0.9) / worldW.value, (vh * 0.9) / worldH.value)
  scale.value = Math.max(0.15, scale.value)
  tx.value = (vw - worldW.value * scale.value) / 2
  ty.value = (vh - worldH.value * scale.value) / 2
}
onMounted(() => fit())

type ViewNode = {
  id: string
  type: 'file' | 'text' | 'group'
  x: number
  y: number
  width: number
  height: number
  color?: string
  html?: string
  noteId?: string
  noteTitle?: string
  preview?: string
}

// 把 markdown 正文压成一两段纯文本预览（剥离图片/链接/代码/强调等）。
function previewOf(body: string, max = 150): string {
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[\[[^\]]*\]\]/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[\[([^\]|]*)(\|[^\]]*)?\]\]/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~`|]/g, '')
    .replace(/^\s*[-+]\s*/gm, '')
    .replace(/^\s*>\s*/gm, '')
    .replace(/[ \t\r\n]+/g, ' ')
    .trim()
  if (text.length <= max) return text
  return text.slice(0, max) + '…'
}

const viewNodes = computed<ViewNode[]>(() =>
  props.data.nodes.map((n) => {
    const x = n.x - minX.value
    const y = n.y - minY.value
    if (n.type === 'file') {
      const rel = (n.file ?? '').replace(/^wiki\//, '')
      const id = rel.replace(/\.md$/, '')
      const note = api.resolveNote(id)
      return {
        id: n.id,
        type: n.type,
        x,
        y,
        width: n.width,
        height: n.height,
        color: n.color,
        noteId: note?.id,
        noteTitle: note?.title ?? (n.file ?? '').split('/').pop() ?? n.id,
        preview: note ? previewOf(note.body) : '',
      }
    }
    const src = n.type === 'text' ? (n.text ?? '') : ''
    return {
      id: n.id,
      type: n.type,
      x,
      y,
      width: n.width,
      height: n.height,
      color: n.color,
      html: src ? renderMarkdown(resolveWikiMarkdown(src, '', api)) : '',
    }
  }),
)

function anchor(n: { x: number; y: number; width: number; height: number }, side: string): [number, number] {
  const x = n.x - minX.value
  const y = n.y - minY.value
  const w = n.width
  const h = n.height
  switch (side) {
    case 'left':
      return [x, y + h / 2]
    case 'right':
      return [x + w, y + h / 2]
    case 'top':
      return [x + w / 2, y]
    case 'bottom':
      return [x + w / 2, y + h]
    default:
      return [x + w / 2, y + h / 2]
  }
}

function edgePath(e: (typeof props.data.edges)[number]): { d: string; color: string } | null {
  const from = nodesById.value.get(e.fromNode)
  const to = nodesById.value.get(e.toNode)
  if (!from || !to) return null
  const [x1, y1] = anchor(from, e.fromSide)
  const [x2, y2] = anchor(to, e.toSide)
  const dx = x2 - x1
  const dy = y2 - y1
  const isHoriz = Math.abs(dx) >= Math.abs(dy)
  const off = Math.max(50, (isHoriz ? Math.abs(dx) : Math.abs(dy)) * 0.4)
  const cx1 = isHoriz ? x1 + Math.sign(dx || 1) * off : x1
  const cy1 = isHoriz ? y1 : y1 + Math.sign(dy || 1) * off
  const cx2 = isHoriz ? x2 - Math.sign(dx || 1) * off : x2
  const cy2 = isHoriz ? y2 : y2 - Math.sign(dy || 1) * off
  const idx = Number(e.color)
  const color = Number.isInteger(idx) && idx >= 1 && idx <= 6 ? EDGE_COLORS[idx - 1] : '#8b5cf6'
  return { d: `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`, color }
}

const edges = computed(() => props.data.edges.map(edgePath).filter((x): x is { d: string; color: string } => !!x))

const worldStyle = computed(() => ({
  transform: `translate(${tx.value}px, ${ty.value}px) scale(${scale.value})`,
  transformOrigin: '0 0' as const,
  width: `${worldW.value}px`,
  height: `${worldH.value}px`,
}))

function onPointerDown(e: PointerEvent): void {
  // 交互元素（文件节点、链接、图片）不启动拖拽，保证可点击
  if ((e.target as HTMLElement).closest('.no-drag')) return
  dragging.value = true
  moved = false
  startX = e.clientX
  startY = e.clientY
  startTx = tx.value
  startTy = ty.value
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onPointerMove(e: PointerEvent): void {
  if (!dragging.value) return
  if (Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY) > 4) moved = true
  tx.value = startTx + (e.clientX - startX)
  ty.value = startTy + (e.clientY - startY)
}
function onPointerUp(e: PointerEvent): void {
  if (!dragging.value) return
  dragging.value = false
  ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
}
function onPointerClick(e: MouseEvent): void {
  if (moved) {
    e.stopPropagation()
    return
  }
  onCanvasClick(e)
}
function onWheel(e: WheelEvent): void {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-e.deltaY * 0.0012))
}
function zoomAt(px: number, py: number, factor: number): void {
  const next = Math.min(3, Math.max(0.15, scale.value * factor))
  if (next === scale.value) return
  tx.value = px - ((px - tx.value) * next) / scale.value
  ty.value = py - ((py - ty.value) * next) / scale.value
  scale.value = next
}

function openNote(id: string): void {
  router.push({ name: 'vault-note', params: { pathMatch: id.split('/') } })
}
</script>

<template>
  <div
    ref="zoomRef"
    class="canvas-viewport relative h-full w-full touch-none overflow-hidden rounded-xl border border-border bg-zinc-50 dark:border-border-dark dark:bg-zinc-900"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @wheel.prevent="onWheel"
    @click="onPointerClick"
  >
    <!-- 重新适应画布 -->
    <button
      type="button"
      class="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-lg border border-border bg-white/90 text-secondary shadow transition-colors hover:border-accent hover:text-accent dark:border-border-dark dark:bg-zinc-800/90 dark:text-secondary-dark"
      :title="'Fit'"
      :aria-label="'Fit canvas'"
      @click.stop="fit"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
    </button>
    <div class="world absolute origin-top-left" :style="worldStyle">
      <!-- 边 -->
      <svg
        class="absolute left-0 top-0 overflow-visible"
        :width="worldW"
        :height="worldH"
        aria-hidden="true"
      >
        <path
          v-for="(edge, i) in edges"
          :key="i"
          :d="edge.d"
          fill="none"
          :stroke="edge.color"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>

      <!-- 节点卡片 -->
      <div
        v-for="n in viewNodes"
        :key="n.id"
        class="absolute overflow-hidden rounded-lg border border-border bg-white/90 shadow-sm dark:border-border-dark dark:bg-zinc-800/90"
        :style="{ left: `${n.x}px`, top: `${n.y}px`, width: `${n.width}px`, height: `${n.height}px` }"
      >
        <!-- 文件节点 -->
        <button
          v-if="n.type === 'file'"
          type="button"
          class="no-drag flex h-full w-full flex-col items-start gap-1.5 overflow-hidden p-2 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
          @click.stop="n.noteId && openNote(n.noteId)"
        >
          <span class="flex items-center gap-1.5 text-[0.7em] font-semibold uppercase tracking-wide text-accent">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /></svg>
            文件
          </span>
          <span class="line-clamp-2 text-sm font-medium leading-snug">{{ n.noteTitle }}</span>
          <p v-if="n.preview" class="line-clamp-[7] text-xs leading-relaxed text-secondary dark:text-secondary-dark">{{ n.preview }}</p>
          <span class="mt-auto shrink-0 text-xs text-muted dark:text-muted-dark">点击查看 →</span>
        </button>

        <!-- 文本节点 -->
        <div
          v-else-if="n.type === 'text'"
          class="prose-sm canvas-text no-drag h-full w-full overflow-hidden p-2"
          v-html="n.html"
        ></div>
      </div>
    </div>

    <ImageLightbox :src="zoomSrc" @close="zoomSrc = null" />
  </div>
</template>

<style scoped>
.canvas-viewport {
  cursor: grab;
  user-select: none;
}
.canvas-viewport.dragging,
.canvas-viewport:active {
  cursor: grabbing;
}

.canvas-text :deep(p) {
  margin: 0.25em 0;
}
.canvas-text :deep(h1),
.canvas-text :deep(h2),
.canvas-text :deep(h3),
.canvas-text :deep(h4) {
  font-size: 1.05em;
  font-weight: 600;
  margin: 0.3em 0 0.2em;
}
.canvas-text :deep(ul),
.canvas-text :deep(ol) {
  padding-left: 1.1em;
  margin: 0.25em 0;
}
.canvas-text :deep(li) {
  margin: 0.15em 0;
}
.canvas-text :deep(a) {
  color: var(--color-accent, #7c5cff);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.canvas-text :deep(code) {
  background: color-mix(in srgb, currentColor 10%, transparent);
  border-radius: 4px;
  padding: 0.05em 0.3em;
  font-size: 0.9em;
}
.canvas-text :deep(img) {
  max-width: 100%;
  border-radius: 6px;
}
.canvas-text :deep(strong) {
  font-weight: 600;
}
</style>