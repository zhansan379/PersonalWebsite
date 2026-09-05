<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useVault } from '../../composables/useVault'
import { resolveWikiMarkdown } from '../../lib/wikiLinks'
import MarkdownRenderer from '../blog/MarkdownRenderer.vue'
import ImageLightbox from './ImageLightbox.vue'

const props = defineProps<{
  source: string
  currentId: string
}>()

const router = useRouter()
const wrap = ref<HTMLElement | null>(null)
const zoomSrc = ref<string | null>(null)

const resolved = computed(() =>
  resolveWikiMarkdown(props.source, props.currentId, useVault()),
)

// 拦截 `<a href="/vault/...">`，用 router.push 实现 SPA 导航（保留 hash 锚点）；
// 拦截 `<img>`，点击放大。
function onClick(e: MouseEvent): void {
  const target = e.target as HTMLElement
  const img = target.closest('img') as HTMLImageElement | null
  if (img && img.getAttribute('src')) {
    zoomSrc.value = img.getAttribute('src')
    return
  }
  const a = target.closest('a[href^="/vault/"]') as HTMLAnchorElement | null
  if (!a) return
  e.preventDefault()
  const raw = a.getAttribute('href') ?? ''
  const hashIdx = raw.indexOf('#')
  const path = hashIdx === -1 ? raw : raw.slice(0, hashIdx)
  const hash = hashIdx === -1 ? '' : raw.slice(hashIdx)
  router.push({ path, hash })
}

onMounted(() => wrap.value?.addEventListener('click', onClick))
onBeforeUnmount(() => wrap.value?.removeEventListener('click', onClick))
</script>

<template>
  <div ref="wrap" class="flex-1">
    <MarkdownRenderer :source="resolved" />
    <ImageLightbox :src="zoomSrc" @close="zoomSrc = null" />
  </div>
</template>

<style scoped>
:deep(img) {
  cursor: zoom-in;
}
</style>