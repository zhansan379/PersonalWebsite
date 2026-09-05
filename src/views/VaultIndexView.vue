<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useVault } from '../composables/useVault'
import { usePosts, type Post } from '../composables/usePosts'
import VaultTree from '../components/vault/VaultTree.vue'
import TagCloud from '../components/blog/TagCloud.vue'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const { root, notes, canvasMap } = useVault()
const { all, allTags } = usePosts()

// 三种浏览方式：目录树 / 按时间 / 按标签（search 为跨模式的全局搜索）
type BrowseMode = 'directory' | 'timeline' | 'tags'

const MODES: BrowseMode[] = ['directory', 'timeline', 'tags']

// 初始模式来自 `?tab=`（供首页 hero 快捷入口深链各子视图）；非法值回退到目录。
const mode = ref<BrowseMode>(
  MODES.includes(route.query.tab as BrowseMode) ? (route.query.tab as BrowseMode) : 'directory',
)

function selectMode(next: BrowseMode): void {
  mode.value = next
  router.replace({ query: next === 'directory' ? {} : { tab: next } })
}

const counts = computed(() => ({
  notes: notes.length,
  canvases: canvasMap.size,
}))

// 知识库完全为空（无笔记也无画布）时展示整页空状态。
const isEmpty = computed(() => notes.length === 0 && canvasMap.size === 0)

const canvasList = computed(() =>
  [...canvasMap.entries()].map(([id]) => ({
    id,
    name: id.slice(id.lastIndexOf('/') + 1),
  })),
)

function canvasLink(id: string) {
  return { name: 'vault-note' as const, params: { pathMatch: id.split('/') } }
}

// ---------- 全局搜索：匹配标题 / 路径(id) / 标签 ----------
// 标题前缀命中优先，其余按路径排序。
const query = ref('')

interface NoteHit {
  id: string
  title: string
  dir: string
  tags: string[]
}

const hits = computed<NoteHit[]>(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  const scored = notes.flatMap((n) => {
    const titleHit = n.title.toLowerCase().includes(q)
    const pathHit = n.id.toLowerCase().includes(q)
    const tagHit = n.tags.some((tag) => tag.toLowerCase().includes(q))
    if (!titleHit && !pathHit && !tagHit) return []
    const score = n.title.toLowerCase().startsWith(q) ? 0 : titleHit ? 1 : 2
    return [{ id: n.id, title: n.title, dir: n.dir, tags: n.tags, score }]
  })
  return scored
    .sort((a, b) => a.score - b.score || a.id.localeCompare(b.id, 'zh'))
    .map(({ id, title, dir, tags }) => ({ id, title, dir, tags }))
})

function noteLink(id: string) {
  return { name: 'vault-note' as const, params: { pathMatch: id.split('/') } }
}

// ---------- 按时间视图（原归档页） ----------
type YearGroup = { year: string; months: { month: string; posts: Post[] }[] }

/** 无日期文章的归档分组占位（显示为翻译后的「未标注日期」）。 */
const UNDATED = '__undated__'

const timelineGroups = computed<YearGroup[]>(() => {
  const posts = all()
  const byYear = new Map<string, Map<string, Post[]>>()
  const undated: Post[] = []
  for (const post of posts) {
    if (!post.date) {
      undated.push(post)
      continue
    }
    const [y, m] = post.date.split('-')
    if (!byYear.has(y)) byYear.set(y, new Map())
    const months = byYear.get(y)!
    if (!months.has(m)) months.set(m, [])
    months.get(m)!.push(post)
  }
  const result = [...byYear.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, months]) => ({
      year,
      months: [...months.entries()]
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([month, posts]) => ({ month, posts })),
    }))
  if (undated.length) {
    result.push({ year: UNDATED, months: [{ month: UNDATED, posts: undated }] })
  }
  return result
})

function monthLabel(year: string, isoMonth: string): string {
  const date = new Date(`${year}-${isoMonth}-01T00:00:00`)
  return date.toLocaleDateString(locale.value.startsWith('zh') ? 'zh-CN' : 'en-US', {
    month: 'long',
  })
}

// ---------- 按标签视图（原标签页） ----------
const postsAll = computed(() => all())

const tags = computed(() =>
  allTags()
    .map((name) => ({
      name,
      count: postsAll.value.filter((p) => p.tags.includes(name)).length,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh')),
)

const tabItems = computed(() => [
  { key: 'directory' as const, label: t('vault.tabs.directory') },
  { key: 'timeline' as const, label: t('vault.tabs.timeline') },
  { key: 'tags' as const, label: t('vault.tabs.tags') },
])
</script>

<template>
  <div class="mx-auto w-full max-w-6xl px-5 py-10">
    <header class="mb-6">
      <h1 class="font-heading text-3xl font-semibold tracking-tight">{{ t('vault.title') }}</h1>
      <p class="mt-2 max-w-2xl text-secondary dark:text-secondary-dark">{{ t('vault.subtitle') }}</p>

      <label class="relative mt-5 block max-w-xl">
        <svg
          class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted dark:text-muted-dark"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
        ><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        <input
          v-model="query"
          type="search"
          :placeholder="t('vault.search')"
          class="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark dark:placeholder:text-muted-dark dark:focus:border-accent"
        />
      </label>

      <div class="mt-4 flex flex-wrap gap-2 text-xs">
        <span class="rounded-full border border-border bg-zinc-50 px-3 py-1 font-mono dark:border-border-dark dark:bg-zinc-900">
          {{ counts.notes }} {{ t('vault.notes') }}
        </span>
        <span class="rounded-full border border-border bg-zinc-50 px-3 py-1 font-mono dark:border-border-dark dark:bg-zinc-900">
          {{ counts.canvases }} {{ t('vault.canvases') }}
        </span>
      </div>

      <!-- 浏览方式切换（搜索中时隐藏，结果优先） -->
      <nav v-if="!query.trim()" class="mt-5 flex gap-1 text-sm">
        <button
          v-for="tab in tabItems"
          :key="tab.key"
          type="button"
          class="rounded-lg px-3 py-1.5 transition-colors"
          :class="mode === tab.key
            ? 'bg-accent/10 font-medium text-accent'
            : 'text-secondary hover:text-accent dark:text-secondary-dark'"
          @click="selectMode(tab.key)"
        >
          {{ tab.label }}
        </button>
      </nav>
    </header>

    <!-- 知识库为空：无笔记也无画布 -->
    <div
      v-if="isEmpty"
      class="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-24 text-center dark:border-border-dark"
    >
      <svg
        class="h-12 w-12 text-muted dark:text-muted-dark"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
      ><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15A2.5 2.5 0 0 0 6.5 22H20V17" /><path d="M9 7h6M9 11h6M9 15h3" /></svg>
      <p class="text-lg font-medium text-secondary dark:text-secondary-dark">{{ t('vault.emptyTitle') }}</p>
      <p class="max-w-md text-sm text-muted dark:text-muted-dark">{{ t('vault.emptyHint') }}</p>
    </div>

    <!-- 有数据的分支：搜索 或 按模式浏览 -->
    <template v-else>

    <!-- 搜索结果：有查询词时替代所有浏览模式 -->
    <div v-if="query.trim()" class="flex flex-col gap-1">
      <p class="mb-3 text-sm text-muted dark:text-muted-dark">
        {{ hits.length }} {{ t('post.countSuffix') }}
      </p>
      <ul v-if="hits.length" class="flex flex-col divide-y divide-border rounded-xl border border-border dark:divide-border-dark dark:border-border-dark">
        <li v-for="hit in hits" :key="hit.id">
          <RouterLink
            :to="noteLink(hit.id)"
            class="group flex items-center justify-between gap-4 px-4 py-3"
          >
            <div class="min-w-0">
              <p class="truncate font-medium transition-colors group-hover:text-accent">{{ hit.title }}</p>
              <p v-if="hit.dir" class="truncate font-mono text-xs text-muted dark:text-muted-dark">{{ hit.id }}</p>
            </div>
            <div v-if="hit.tags.length" class="hidden shrink-0 flex-wrap gap-1 sm:flex">
              <span
                v-for="tag in hit.tags"
                :key="tag"
                class="rounded-full border border-border px-2 py-0.5 text-xs dark:border-border-dark"
              >#{{ tag }}</span>
            </div>
          </RouterLink>
        </li>
      </ul>
      <p v-else class="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted dark:border-border-dark dark:text-muted-dark">
        {{ t('vault.noResults', { query: query.trim() }) }}
      </p>
    </div>

    <!-- 目录树（默认）：目录树 +（有画布时）画布 -->
    <div
      v-else-if="mode === 'directory'"
      class="grid items-start gap-8"
      :class="canvasList.length ? 'lg:grid-cols-[272px_1fr]' : ''"
    >
      <aside class="lg:sticky lg:top-[5.5rem]">
        <h2 class="mb-1 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted dark:text-muted-dark">
          <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M1.5 3.5A1.5 1.5 0 0 1 3 2h2.6a1.5 1.5 0 0 1 1.1.5l.9 1h4.3A1.5 1.5 0 0 1 13 5v7.5A1.5 1.5 0 0 1 11.5 14h-8A1.5 1.5 0 0 1 2 12.5Z" /></svg>
          {{ t('vault.directory') }}
        </h2>
        <div class="rounded-xl border border-border dark:border-border-dark lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
          <VaultTree :nodes="root" />
        </div>
      </aside>

      <section v-if="canvasList.length">
        <h2 class="mb-3 text-lg font-semibold">{{ t('vault.canvases') }}</h2>
        <div class="grid gap-3 sm:grid-cols-2">
          <RouterLink
            v-for="c in canvasList"
            :key="c.id"
            :to="canvasLink(c.id)"
            class="flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:border-accent dark:border-border-dark"
          >
            <svg class="h-5 w-5 shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 12h18M12 3v18" stroke-linecap="round" />
            </svg>
            <div class="min-w-0">
              <p class="truncate font-medium">{{ c.name }}</p>
              <p class="font-mono text-xs text-muted dark:text-muted-dark">{{ c.id }}</p>
            </div>
          </RouterLink>
        </div>
      </section>
    </div>

    <!-- 按时间：年 → 月 分组 -->
    <div v-else-if="mode === 'timeline'" class="flex flex-col gap-10">
      <section v-for="group in timelineGroups" :key="group.year">
        <h2 class="mb-5 font-heading text-2xl tracking-tight">
          {{ group.year === UNDATED ? t('archive.undated') : group.year }}
        </h2>
        <div class="flex flex-col gap-6">
          <section v-for="m in group.months" :key="m.month">
            <h3
              v-if="m.month !== UNDATED"
              class="mb-3 text-sm font-medium uppercase tracking-widest text-muted dark:text-muted-dark"
            >
              {{ monthLabel(group.year, m.month) }}
            </h3>
            <ul class="flex flex-col divide-y divide-border dark:divide-border-dark">
              <li v-for="post in m.posts" :key="post.slug">
                <RouterLink
                  :to="{ name: 'vault-note', params: { pathMatch: post.slug.split('/') } }"
                  class="group flex items-baseline justify-between gap-4 py-3"
                >
                  <span class="font-medium transition-colors group-hover:text-accent">{{ post.title }}</span>
                  <span v-if="post.tags.length" class="hidden font-mono text-xs text-muted sm:inline dark:text-muted-dark">
                    #{{ post.tags[0] }}
                  </span>
                </RouterLink>
              </li>
            </ul>
          </section>
        </div>
      </section>
    </div>

    <!-- 按标签：标签云 -->
    <div v-else-if="mode === 'tags'" class="flex flex-col gap-6">
      <p v-if="!tags.length" class="text-sm text-muted dark:text-muted-dark">
        {{ t('tags.none') }}
      </p>
      <TagCloud :tags="tags" v-else />
    </div>
    </template>
  </div>
</template>