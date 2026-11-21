<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import type { Markmap } from 'markmap-view'
import type { Transformer } from 'markmap-lib'

const props = defineProps<{ source: string }>()

const svgRef = ref<SVGSVGElement | null>(null)
const loading = ref(true)

let mm: Markmap | null = null
let transformer: Transformer | null = null

// 中等饱和度调色板：在浅色 #fafaf9 与深色 #0d0d0d 背景上都可读。
const PALETTE = [
  '#6366f1',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
]

// markmap + d3 体积较大，首次渲染时才动态加载（Vite 自动拆成异步 chunk）。
async function ensureLibs(): Promise<boolean> {
  if (mm && transformer) return true
  const [{ Markmap }, { Transformer }] = await Promise.all([
    import('markmap-view'),
    import('markmap-lib'),
  ])
  if (!svgRef.value) return false // 加载期间组件已被卸载
  transformer = new Transformer()
  mm = Markmap.create(svgRef.value, {
    color: (node) => PALETTE[node.state.depth % PALETTE.length],
    duration: 300,
    maxWidth: 320,
    paddingX: 16,
    spacingVertical: 8,
    // 节点多时全展开会让 fit() 缩得过小：默认只展开到「知识点」层（深度 2），
    // 更深的明细/链接层折叠，点击节点圆圈逐层展开。
    initialExpandLevel: 2,
  })
  return true
}

async function render(): Promise<void> {
  if (!(await ensureLibs()) || !mm || !transformer) return
  const { root } = transformer.transform(props.source)
  mm.setData(root)
  await nextTick()
  mm.fit()
  loading.value = false
  // 节点文字在 foreignObject 里，尺寸依赖字体加载；字体就绪前 fit 会算错
  // 缩放与位置（PC 宽容器上尤其明显）。过渡动画结束、字体加载完成后各补一次。
  setTimeout(() => mm?.fit(), 350)
  document.fonts?.ready.then(() => mm?.fit())
}

// 外链新窗口打开（事件代理，fold/unfold 重渲染节点后仍有效）。
function onClick(e: MouseEvent): void {
  const a = (e.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null
  if (!a) return
  const href = a.getAttribute('href') ?? ''
  if (/^https?:\/\//.test(href)) {
    e.preventDefault()
    window.open(href, '_blank', 'noopener')
  }
}

useResizeObserver(svgRef, () => mm?.fit())

onMounted(render)
watch(() => props.source, render)
onBeforeUnmount(() => {
  mm?.destroy()
  mm = null
})
</script>

<template>
  <div
    class="mindmap-view relative h-full w-full overflow-hidden rounded-xl border border-border bg-zinc-50 dark:border-border-dark dark:bg-zinc-900"
    @click="onClick"
  >
    <div
      v-if="loading"
      class="absolute inset-0 grid place-items-center text-sm text-muted dark:text-muted-dark"
    >
      <span class="animate-pulse">…</span>
    </div>
    <svg ref="svgRef" class="h-full w-full"></svg>
  </div>
</template>

<style scoped>
/* 节点文字在 foreignObject 真实 DOM 里，跟随主题 token，深浅色自动切换。 */
.mindmap-view :deep(.markmap-foreign) {
  color: var(--color-foreground);
}
.mindmap-view :deep(a) {
  color: var(--color-accent);
}
</style>
