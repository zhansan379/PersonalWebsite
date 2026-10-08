<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { renderMermaidSVG, THEMES } from 'beautiful-mermaid'
import { useTheme } from '../../composables/useTheme'
import SplitPane from './SplitPane.vue'

/**
 * Mermaid 在线渲染（beautiful-mermaid，纯本地渲染、零网络请求）。
 * 左编辑右预览；预览区支持滚轮缩放（以光标为中心）、按住拖拽平移、
 * 右下角悬浮控制栏（放大/缩小/重置/全屏），高频事件经 rAF 合帧。
 */

const { t } = useI18n()
const { theme } = useTheme()

const EXAMPLES: Record<string, string> = {
  flowchart: `graph TD
  A[开始] --> B{条件判断}
  B -->|是| C[执行操作]
  B -->|否| D[结束]
  C --> D`,
  sequence: `sequenceDiagram
  participant U as 用户
  participant S as 服务端
  U->>S: 发起请求
  S-->>U: 返回结果`,
  state: `stateDiagram-v2
  [*] --> 待处理
  待处理 --> 进行中: 开始
  进行中 --> 已完成: 提交
  已完成 --> [*]`,
  er: `erDiagram
  USER ||--o{ ORDER : places
  ORDER ||--|{ ITEM : contains`,
  class: `classDiagram
  Animal <|-- Dog
  Animal : +string name
  Animal : +makeSound()`,
}

const code = ref(EXAMPLES.flowchart)
const themeKey = ref<'auto' | string>('auto')
const themeNames = Object.keys(THEMES)

const svg = ref('')
const renderError = ref('')
const copied = ref(false)

/** auto：透明背景 + 跟随站点深浅色的前景色，由库按两色派生整套配色。 */
function renderOptions(): Parameters<typeof renderMermaidSVG>[1] {
  if (themeKey.value === 'auto') {
    return {
      transparent: true,
      fg: theme.value === 'light' ? '#1c1917' : '#f5f5f4',
      accent: theme.value === 'light' ? '#4f46e5' : '#a5b4fc',
    }
  }
  return THEMES[themeKey.value]
}

function renderNow(): void {
  const source = code.value.trim()
  if (!source) {
    svg.value = ''
    renderError.value = ''
    return
  }
  try {
    svg.value = renderMermaidSVG(source, renderOptions())
    renderError.value = ''
  } catch (err) {
    svg.value = ''
    renderError.value = err instanceof Error ? err.message : String(err)
  }
}

// 输入防抖 250ms；主题切换立即重渲
let debounce: ReturnType<typeof setTimeout> | undefined
watch(code, () => {
  clearTimeout(debounce)
  debounce = setTimeout(renderNow, 250)
})
watch([themeKey, theme], renderNow)
renderNow()

function applyExample(key: string): void {
  code.value = EXAMPLES[key] ?? code.value
  renderNow()
}

async function copySvg(): Promise<void> {
  if (!svg.value) return
  try {
    await navigator.clipboard.writeText(svg.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // 剪贴板不可用（非安全上下文等）时静默
  }
}

function downloadSvg(): void {
  if (!svg.value) return
  const blob = new Blob([svg.value], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'diagram.svg'
  a.click()
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// 预览画布：缩放 / 平移 / 全屏
// ---------------------------------------------------------------------------
const previewCard = ref<HTMLElement>()
const viewport = ref<HTMLElement>()

const MIN_SCALE = 0.2
const MAX_SCALE = 5
const scale = ref(1)
const tx = ref(0)
const ty = ref(0)

const canvasStyle = computed(() => ({
  transform: `translate(${tx.value}px, ${ty.value}px) scale(${scale.value})`,
}))
const zoomLabel = computed(() => `${Math.round(scale.value * 100)}%`)

/**
 * 以视口内某点为中心缩放：保持该点下的画布内容不动。
 * canvas 以视口中心定位（transform-origin: center），故有
 * t' = c·(1−k) + t·k，其中 c 为光标相对视口中心的坐标，k = s'/s。
 */
function zoomAt(clientX: number, clientY: number, next: number): void {
  const el = viewport.value
  if (!el) return
  const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next))
  if (clamped === scale.value) return
  const rect = el.getBoundingClientRect()
  const cx = clientX - rect.left - rect.width / 2
  const cy = clientY - rect.top - rect.height / 2
  const k = clamped / scale.value
  tx.value = cx * (1 - k) + tx.value * k
  ty.value = cy * (1 - k) + ty.value * k
  scale.value = clamped
}

// 滚轮缩放：指数因子让缩放手感均匀；prevent 阻止页面滚动，stop 防止冒泡
function onWheel(e: WheelEvent): void {
  e.preventDefault()
  e.stopPropagation()
  zoomAt(e.clientX, e.clientY, scale.value * Math.exp(-e.deltaY * 0.0015))
}

// 平移：pointer capture 保证拖出视口不断线；位移经 rAF 合帧后再写入
let panning = false
let lastX = 0
let lastY = 0
let pendDx = 0
let pendDy = 0
let panRaf = 0

function onPanDown(e: PointerEvent): void {
  if (e.button !== 0) return
  panning = true
  lastX = e.clientX
  lastY = e.clientY
  viewport.value?.setPointerCapture(e.pointerId)
  e.preventDefault()
}

function schedulePanFlush(): void {
  if (panRaf) return
  panRaf = requestAnimationFrame(() => {
    panRaf = 0
    tx.value += pendDx
    ty.value += pendDy
    pendDx = 0
    pendDy = 0
  })
}

function onPanMove(e: PointerEvent): void {
  if (!panning) return
  pendDx += e.clientX - lastX
  pendDy += e.clientY - lastY
  lastX = e.clientX
  lastY = e.clientY
  schedulePanFlush()
}

function onPanUp(): void {
  panning = false
}

// 控制栏
function zoomBy(factor: number): void {
  const el = viewport.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, scale.value * factor)
}

function resetView(): void {
  scale.value = 1
  tx.value = 0
  ty.value = 0
}

const isFullscreen = ref(false)

function toggleFullscreen(): void {
  if (document.fullscreenElement) {
    void document.exitFullscreen()
  } else {
    void previewCard.value?.requestFullscreen()
  }
}

function syncFullscreen(): void {
  isFullscreen.value = document.fullscreenElement === previewCard.value
}

onMounted(() => {
  document.addEventListener('fullscreenchange', syncFullscreen)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', syncFullscreen)
  clearTimeout(debounce)
  if (panRaf) cancelAnimationFrame(panRaf)
})
</script>

<template>
  <SplitPane>
    <template #left>
      <!-- 编辑器 -->
      <div class="flex flex-1 flex-col rounded-xl border border-border dark:border-border-dark">
        <div class="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 text-sm dark:border-border-dark">
          <span class="font-medium">{{ t('tools.mermaid.editorLabel') }}</span>
          <label class="ml-auto flex items-center gap-2 text-secondary dark:text-secondary-dark">
            {{ t('tools.mermaid.example') }}
            <select
              class="rounded-md border border-border bg-transparent px-2 py-1 text-sm dark:border-border-dark"
              @change="applyExample(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="(_, key) in EXAMPLES" :key="key" :value="key">{{ key }}</option>
            </select>
          </label>
          <label class="flex items-center gap-2 text-secondary dark:text-secondary-dark">
            {{ t('tools.mermaid.theme') }}
            <select
              v-model="themeKey"
              class="rounded-md border border-border bg-transparent px-2 py-1 text-sm dark:border-border-dark"
            >
              <option value="auto">{{ t('tools.mermaid.themeAuto') }}</option>
              <option v-for="name in themeNames" :key="name" :value="name">{{ name }}</option>
            </select>
          </label>
        </div>
        <textarea
          v-model="code"
          spellcheck="false"
          :placeholder="t('tools.mermaid.placeholder')"
          class="h-96 w-full flex-1 resize-none rounded-b-xl bg-transparent p-4 font-mono text-sm leading-relaxed outline-none lg:h-auto"
        ></textarea>
      </div>
    </template>

    <template #right>
      <!-- 预览 -->
      <div
        ref="previewCard"
        class="flex flex-1 flex-col rounded-xl border border-border bg-background dark:border-border-dark dark:bg-background-dark"
      >
        <div class="flex items-center gap-3 border-b border-border px-4 py-3 text-sm dark:border-border-dark">
          <span class="font-medium">{{ t('tools.mermaid.previewLabel') }}</span>
          <div class="ml-auto flex items-center gap-2">
            <button
              type="button"
              class="rounded-md border border-border px-2.5 py-1 text-xs transition-colors hover:border-accent hover:text-accent disabled:opacity-40 dark:border-border-dark"
              :disabled="!svg"
              @click="copySvg"
            >
              {{ copied ? t('tools.mermaid.copied') : t('tools.mermaid.copySvg') }}
            </button>
            <button
              type="button"
              class="rounded-md border border-border px-2.5 py-1 text-xs transition-colors hover:border-accent hover:text-accent disabled:opacity-40 dark:border-border-dark"
              :disabled="!svg"
              @click="downloadSvg"
            >
              {{ t('tools.mermaid.downloadSvg') }}
            </button>
          </div>
        </div>

        <!-- 画布视口：滚轮缩放 + 拖拽平移 -->
        <div
          ref="viewport"
          class="relative h-96 flex-1 touch-none overflow-hidden lg:h-auto"
          :class="panning ? 'cursor-grabbing select-none' : 'cursor-grab'"
          @wheel="onWheel"
          @pointerdown="onPanDown"
          @pointermove="onPanMove"
          @pointerup="onPanUp"
          @pointercancel="onPanUp"
          @dblclick="resetView"
        >
          <!-- 画布内容：以视口中心为原点做 transform -->
          <div
            v-if="svg"
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
          >
            <div :style="canvasStyle" class="origin-center [&>svg]:block">
              <!-- 渲染产物来自本地库，非用户 HTML，v-html 安全 -->
              <div v-html="svg"></div>
            </div>
          </div>
          <div
            v-else-if="renderError"
            class="absolute inset-4 overflow-auto whitespace-pre-wrap break-all rounded-md border border-red-300 bg-red-50 p-3 font-mono text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            {{ t('tools.mermaid.renderError', { message: renderError }) }}
          </div>
          <p v-else class="absolute inset-0 grid place-items-center text-sm text-muted dark:text-muted-dark">
            {{ t('tools.mermaid.placeholder') }}
          </p>

          <!-- 悬浮控制栏：阻止事件冒泡到视口，避免触发平移/缩放 -->
          <div
            class="absolute bottom-4 right-4 flex flex-col items-center gap-1 rounded-lg border border-border bg-background/90 p-1 shadow-md backdrop-blur dark:border-border-dark dark:bg-background-dark/90"
            @pointerdown.stop
            @wheel.stop
          >
            <button
              type="button"
              class="grid h-8 w-8 place-items-center rounded-md transition-colors hover:bg-black/5 hover:text-accent dark:hover:bg-white/10"
              :aria-label="t('tools.mermaid.zoomIn')"
              :title="t('tools.mermaid.zoomIn')"
              @click="zoomBy(1.25)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            </button>
            <span class="font-mono text-[10px] text-muted dark:text-muted-dark">{{ zoomLabel }}</span>
            <button
              type="button"
              class="grid h-8 w-8 place-items-center rounded-md transition-colors hover:bg-black/5 hover:text-accent dark:hover:bg-white/10"
              :aria-label="t('tools.mermaid.zoomOut')"
              :title="t('tools.mermaid.zoomOut')"
              @click="zoomBy(0.8)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
            </button>
            <button
              type="button"
              class="grid h-8 w-8 place-items-center rounded-md transition-colors hover:bg-black/5 hover:text-accent dark:hover:bg-white/10"
              :aria-label="t('tools.mermaid.resetView')"
              :title="t('tools.mermaid.resetView')"
              @click="resetView"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
            </button>
            <button
              type="button"
              class="grid h-8 w-8 place-items-center rounded-md transition-colors hover:bg-black/5 hover:text-accent dark:hover:bg-white/10"
              :aria-label="isFullscreen ? t('tools.mermaid.exitFullscreen') : t('tools.mermaid.fullscreen')"
              :title="isFullscreen ? t('tools.mermaid.exitFullscreen') : t('tools.mermaid.fullscreen')"
              @click="toggleFullscreen"
            >
              <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></svg>
            </button>
          </div>
        </div>

        <div class="border-t border-border px-4 py-2 text-right text-xs text-muted dark:border-border-dark dark:text-muted-dark">
          <a
            href="https://github.com/lukilabs/beautiful-mermaid"
            target="_blank"
            rel="noopener noreferrer"
            class="transition-colors hover:text-accent"
          >
            {{ t('tools.mermaid.credit') }}
          </a>
        </div>
      </div>
    </template>
  </SplitPane>
</template>
