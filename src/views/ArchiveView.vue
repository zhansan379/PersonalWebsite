<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePosts } from '../composables/usePosts'
import type { Post } from '../composables/usePosts'

const { t, locale } = useI18n()
const { all } = usePosts()

type YearGroup = { year: string; months: { month: string; posts: Post[] }[] }

const groups = computed<YearGroup[]>(() => {
  const posts = all()
  const byYear = new Map<string, Map<string, Post[]>>()
  for (const post of posts) {
    const [y, m] = post.date.split('-')
    if (!byYear.has(y)) byYear.set(y, new Map())
    const months = byYear.get(y)!
    if (!months.has(m)) months.set(m, [])
    months.get(m)!.push(post)
  }
  return [...byYear.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, months]) => ({
      year,
      months: [...months.entries()]
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([month, posts]) => ({ month, posts })),
    }))
})

function monthLabel(year: string, isoMonth: string): string {
  const date = new Date(`${year}-${isoMonth}-01T00:00:00`)
  return date.toLocaleDateString(locale.value.startsWith('zh') ? 'zh-CN' : 'en-US', {
    month: 'long',
  })
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-12 sm:py-16">
    <header class="max-w-2xl">
      <h1 class="font-heading text-4xl tracking-tight sm:text-5xl">{{ t('blogNav.archive') }}</h1>
      <p class="mt-4 text-secondary dark:text-secondary-dark">{{ t('archive.subtitle') }}</p>
    </header>

    <div class="flex flex-col gap-10">
      <section v-for="group in groups" :key="group.year">
        <h2 class="mb-5 font-heading text-2xl tracking-tight">{{ group.year }}</h2>
        <div class="flex flex-col gap-6">
          <section v-for="m in group.months" :key="m.month">
            <h3 class="mb-3 text-sm font-medium uppercase tracking-widest text-muted dark:text-muted-dark">
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
  </div>
</template>