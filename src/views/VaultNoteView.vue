<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useVault } from '../composables/useVault'
import { slugify } from '../lib/slugify'
import VaultTree from '../components/vault/VaultTree.vue'
import NoteBody from '../components/vault/NoteBody.vue'
import CanvasView from '../components/vault/CanvasView.vue'
import MindmapView from '../components/vault/MindmapView.vue'
import GiscusComments from '../components/comments/GiscusComments.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { root, noteMap, canvasMap } = useVault()

// 返回上一个页面：有历史则回退，否则回知识库首页（适配直接打开深链的场景）。
function goBack(): void {
  if (window.history.state?.back) router.back()
  else router.push({ name: 'vault-index' })
}

const currentId = computed(() => {
  const p = route.params.pathMatch
  if (Array.isArray(p)) return p.join('/')
  return String(p ?? '')
})

// giscus 创建的 Discussion 标题即笔记 id，按它筛选可直接定位到本页对应的讨论
const discussionsManageUrl = computed(
  () =>
    `https://github.com/zhansan379/PersonalWebsite/discussions?discussions_q=${encodeURIComponent(currentId.value)}`,
)

const isCanvas = computed(() => currentId.value.endsWith('.canvas'))
const note = computed(() => noteMap.get(currentId.value) ?? undefined)
const canvasData = computed(() => canvasMap.get(currentId.value) ?? null)

const activeId = computed(() => currentId.value)

// 左侧目录：默认展开，可折叠以扩大正文宽度（状态持久化）。
const treeOpen = ref(localStorage.getItem('vault-tree-open') !== 'closed')
const toggleTree = (): void => {
  treeOpen.value = !treeOpen.value
  localStorage.setItem('vault-tree-open', treeOpen.value ? 'open' : 'closed')
}

// 思维导图笔记：默认导图视图，可切换回 markdown（选择持久化）。
const showMindmap = ref(localStorage.getItem('vault-mindmap-view') !== 'md')
const toggleMindmap = (): void => {
  showMindmap.value = !showMindmap.value
  localStorage.setItem('vault-mindmap-view', showMindmap.value ? 'map' : 'md')
}
const mindmapActive = computed(() => !!note.value?.mindmap && showMindmap.value)

// 复制正文（markdown 原文），带按钮反馈。
const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | undefined
async function copyMarkdown(): Promise<void> {
  const text = note.value?.body ?? ''
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
  copied.value = true
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => (copied.value = false), 1600)
}
onBeforeUnmount(() => clearTimeout(copyTimer))

// 本页目录：取自正文标题（用斜杠锚点滚动需要与渲染出的 id 一致）。
interface TocItem {
  level: number
  text: string
  id: string
}
function tocOf(source: string): TocItem[] {
  const items: TocItem[] = []
  const lines = source.split(/\r?\n/)
  let inFence = false
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const m = /^(#{1,3})\s+(.+)$/.exec(line)
    if (m) {
      const text = m[2].trim()
      items.push({ level: m[1].length, text, id: slugify(text) })
    }
  }
  return items
}
const toc = computed(() => (note.value ? tocOf(note.value.body) : []))

function scrollToHash(): void {
  const hash = route.hash
  if (!hash || hash === '#') return
  const el = document.getElementById(hash.slice(1))
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
onMounted(() => nextTick(scrollToHash))
watch(() => route.fullPath, () => nextTick(scrollToHash))

function scrollToId(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="mx-auto w-full max-w-6xl px-5 py-8">
    <!-- 面包屑 + 操作行 -->
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div class="flex min-w-0 items-center gap-2">
        <!-- 返回上一页 -->
        <button
          type="button"
          class="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border text-secondary transition-colors hover:border-accent hover:text-accent dark:border-border-dark dark:text-secondary-dark"
          :title="t('vault.back')"
          :aria-label="t('vault.back')"
          @click="goBack"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
        </button>

        <nav class="flex min-w-0 flex-wrap items-center gap-1 text-sm text-muted dark:text-muted-dark">
          <RouterLink :to="{ name: 'vault-index' }" class="hover:text-accent">{{ t('vault.directory') }}</RouterLink>
          <template v-if="currentId">
            <span class="select-none text-muted">/</span>
            <span class="truncate font-mono">{{ currentId }}</span>
          </template>
        </nav>
      </div>

      <!-- 折叠左侧目录（桌面端） -->
      <button
        type="button"
        class="hidden h-8 w-8 place-items-center rounded-lg border border-border text-secondary transition-colors hover:border-accent hover:text-accent lg:grid dark:border-border-dark dark:text-secondary-dark"
        :title="treeOpen ? '收起目录' : '展开目录'"
        :aria-expanded="treeOpen"
        :aria-label="'Toggle directory tree'"
        @click="toggleTree"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /></svg>
      </button>
    </div>

    <!-- 移动端目录折叠（笔记与 canvas 都提供，方便切换文件） -->
    <details class="mb-4 rounded-xl border border-border lg:hidden dark:border-border-dark">
      <summary class="cursor-pointer select-none px-4 py-3 text-sm font-medium">{{ t('vault.directory') }}</summary>
      <div class="max-h-[50vh] overflow-y-auto border-t border-border dark:border-border-dark">
        <VaultTree :nodes="root" :active-id="activeId" />
      </div>
    </details>

    <!-- canvas 视图 -->
    <template v-if="isCanvas">
      <header class="mb-4 flex items-center gap-3">
        <svg class="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 12h18M12 3v18" stroke-linecap="round" />
        </svg>
        <h1 class="truncate font-heading text-2xl font-semibold">{{ (currentId ?? '').split('/').pop() }}</h1>
        <span class="rounded-full border border-accent/30 px-2.5 py-0.5 text-xs text-accent">{{ t('vault.openCanvas') }}</span>
      </header>
      <div v-if="canvasData" class="h-[72vh]">
        <CanvasView :data="canvasData" />
      </div>
      <p v-else class="text-sm text-muted dark:text-muted-dark">{{ t('vault.notFound') }}</p>
    </template>

    <!-- 笔记视图 -->
    <template v-else-if="note">
      <!-- 移动端本页目录 -->
      <details v-if="toc.length && !mindmapActive" class="mb-4 rounded-xl border border-border lg:hidden dark:border-border-dark">
        <summary class="cursor-pointer select-none px-4 py-3 text-sm font-medium">{{ t('vault.onThisPage') }}</summary>
        <div class="border-t border-border dark:border-border-dark">
          <ul class="space-y-0.5 p-2 text-sm">
            <li v-for="item in toc" :key="item.id">
              <button
                type="button"
                class="block w-full rounded px-2 py-1 text-left text-secondary transition-colors hover:bg-zinc-100 hover:text-accent dark:text-secondary-dark dark:hover:bg-zinc-800"
                :style="{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }"
                @click="scrollToId(item.id)"
              >
                {{ item.text }}
              </button>
            </li>
          </ul>
        </div>
      </details>

      <div class="flex items-start gap-8">
        <!-- 左侧目录树（桌面，可折叠并独立滚动） -->
        <aside
          v-show="treeOpen"
          class="sticky top-[5.5rem] hidden w-[280px] shrink-0 lg:block"
        >
          <div class="max-h-[calc(100vh-6.5rem)] overflow-y-auto rounded-xl border border-border dark:border-border-dark">
            <VaultTree :nodes="root" :active-id="activeId" />
          </div>
        </aside>

        <!-- 正文 -->
        <article class="prose-zh min-w-0 flex-1 max-w-none">
          <div class="mb-1 flex items-start justify-between gap-3">
            <h1 class="font-heading text-3xl font-semibold tracking-tight">{{ note.title }}</h1>
            <div class="mt-1 flex shrink-0 gap-2">
              <button
                v-if="note.mindmap"
                type="button"
                class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-accent hover:text-accent dark:border-border-dark dark:text-secondary-dark"
                @click="toggleMindmap"
              >
                {{ showMindmap ? t('vault.markdownView') : t('vault.mindmapView') }}
              </button>
              <button
                type="button"
                class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-accent hover:text-accent dark:border-border-dark dark:text-secondary-dark"
                :class="copied ? 'text-accent' : ''"
                @click="copyMarkdown"
              >
                {{ copied ? t('vault.copied') : t('vault.copy') }}
              </button>
            </div>
          </div>
          <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted dark:text-muted-dark">
            <template v-if="note.created"><span>{{ t('vault.created') }} {{ note.created }}</span></template>
            <template v-if="note.updated"><span>{{ t('vault.updated') }} {{ note.updated }}</span></template>
            <span v-for="tag in note.tags" :key="tag" class="rounded-full border border-border px-2 py-0.5 text-xs dark:border-border-dark">#{{ tag }}</span>
          </div>
          <div v-if="mindmapActive" class="mt-6 h-[72vh]">
            <MindmapView :source="note.body" />
          </div>
          <div v-else class="mt-6">
            <NoteBody :source="note.body" :current-id="note.id" />
          </div>
        </article>

        <!-- 右侧本页目录（桌面） -->
        <aside v-if="toc.length && !mindmapActive" class="sticky top-[5.5rem] hidden w-[200px] shrink-0 lg:block">
          <h2 class="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted dark:text-muted-dark">{{ t('vault.onThisPage') }}</h2>
          <ul class="max-h-[calc(100vh-8rem)] space-y-1 overflow-y-auto text-sm">
            <li v-for="item in toc" :key="item.id">
              <button
                type="button"
                class="block w-full rounded px-2 py-1 text-left text-secondary transition-colors hover:bg-zinc-100 hover:text-accent dark:text-secondary-dark dark:hover:bg-zinc-800"
                :style="{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }"
                @click="scrollToId(item.id)"
              >
                {{ item.text }}
              </button>
            </li>
          </ul>
        </aside>
      </div>

      <!-- 评论区（giscus，GitHub 登录；term 用笔记稳定 id） -->
      <section class="mt-12 border-t border-border pt-8 dark:border-border-dark">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h2 class="font-heading text-lg font-semibold">{{ t('comments.title') }}</h2>
          <!-- giscus 组件内不支持编辑/删除，跳到按本笔记筛选的 Discussions 页管理 -->
          <a
            :href="discussionsManageUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="shrink-0 text-sm text-muted transition-colors hover:text-accent dark:text-muted-dark"
          >{{ t('comments.manage') }} ↗</a>
        </div>
        <GiscusComments :term="currentId" />
      </section>
    </template>

    <!-- 未找到 -->
    <template v-else>
      <div class="py-16 text-center">
        <p class="text-lg text-secondary dark:text-secondary-dark">{{ t('vault.notFound') }}</p>
        <p class="mt-2 font-mono text-sm text-muted dark:text-muted-dark">{{ currentId }}</p>
        <RouterLink :to="{ name: 'vault-index' }" class="mt-6 inline-block text-accent underline underline-offset-4">{{ t('vault.backToIndex') }}</RouterLink>
      </div>
    </template>
  </div>
</template>