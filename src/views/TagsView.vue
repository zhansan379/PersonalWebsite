<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePosts } from '../composables/usePosts'
import TagCloud from '../components/blog/TagCloud.vue'

const { t } = useI18n()
const { all, allTags } = usePosts()

const posts = computed(() => all())
const query = ref('')

const tags = computed(() => {
  const q = query.value.trim().toLowerCase()
  return allTags()
    .filter((name) => !q || name.toLowerCase().includes(q))
    .map((name) => ({
      name,
      count: posts.value.filter((p) => p.tags.includes(name)).length,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh'))
})
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-12 sm:py-16">
    <header class="max-w-2xl">
      <h1 class="font-heading text-4xl tracking-tight sm:text-5xl">{{ t('tags.title') }}</h1>
      <p class="mt-4 text-secondary dark:text-secondary-dark">{{ t('tags.subtitle') }}</p>

      <label class="relative mt-6 block max-w-md">
        <svg
          class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted dark:text-muted-dark"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
        ><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        <input
          v-model="query"
          type="search"
          :placeholder="t('tags.search')"
          class="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark dark:placeholder:text-muted-dark dark:focus:border-accent"
        />
      </label>
    </header>
    <TagCloud :tags="tags" />

    <p v-if="!tags.length" class="text-sm text-muted dark:text-muted-dark">
      {{ t('tags.none') }}
    </p>
  </div>
</template>