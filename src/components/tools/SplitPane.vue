<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 可拖拽的左右 Split Pane：桌面端（≥lg）左右分栏 + 拖拽条调比例，
 * 小屏退化为上下堆叠。左右内容经 slot 注入，拖拽与比例逻辑全部在此封装。
 */

const splitEl = ref<HTMLElement>()
const leftPct = ref(45)
const isLg = ref(false)

let mq: MediaQueryList | undefined
function onMqChange(): void {
  isLg.value = mq?.matches ?? false
}

const leftStyle = computed(() => (isLg.value ? { width: `${leftPct.value}%` } : undefined))

let splitting = false
let splitClientX = 0
let splitRaf = 0

function onSplitDown(e: PointerEvent): void {
  splitting = true
  splitClientX = e.clientX
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  e.preventDefault()
  e.stopPropagation()
}

/** rAF 合帧：一次事件循环内多次 pointermove 只应用最后一次位移。 */
function scheduleSplitFlush(): void {
  if (splitRaf) return
  splitRaf = requestAnimationFrame(() => {
    splitRaf = 0
    const el = splitEl.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width === 0) return
    const pct = ((splitClientX - rect.left) / rect.width) * 100
    leftPct.value = Math.min(75, Math.max(25, pct))
  })
}

function onSplitMove(e: PointerEvent): void {
  if (!splitting) return
  splitClientX = e.clientX
  scheduleSplitFlush()
}

function onSplitUp(): void {
  splitting = false
}

onMounted(() => {
  mq = window.matchMedia('(min-width: 1024px)')
  onMqChange()
  mq.addEventListener('change', onMqChange)
})

onBeforeUnmount(() => {
  mq?.removeEventListener('change', onMqChange)
  if (splitRaf) cancelAnimationFrame(splitRaf)
})
</script>

<template>
  <div ref="splitEl" class="mt-6 flex flex-col lg:h-[72vh] lg:flex-row">
    <div class="flex min-w-0 flex-col" :style="leftStyle">
      <slot name="left" />
    </div>

    <!-- 拖拽条（仅桌面端） -->
    <div
      class="group hidden w-3 shrink-0 cursor-col-resize touch-none items-center justify-center lg:flex"
      role="separator"
      aria-orientation="vertical"
      @pointerdown="onSplitDown"
      @pointermove="onSplitMove"
      @pointerup="onSplitUp"
      @pointercancel="onSplitUp"
    >
      <div class="h-12 w-1 rounded-full bg-border transition-colors group-hover:bg-accent dark:bg-border-dark"></div>
    </div>

    <div class="mt-5 flex min-h-0 min-w-0 flex-1 flex-col lg:mt-0">
      <slot name="right" />
    </div>
  </div>
</template>
