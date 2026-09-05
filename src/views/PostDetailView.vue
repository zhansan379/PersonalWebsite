<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePosts } from '../composables/usePosts'
import MarkdownRenderer from '../components/blog/MarkdownRenderer.vue'

const route = useRoute()
const { t, locale } = useI18n()
const { bySlug, all } = usePosts()

const post = computed(() => bySlug(String(route.params.slug)))

const siblings = computed(() => {
  const list = all()
  const idx = list.findIndex((p) => p.slug === route.params.slug)
  if (idx === -1) return { prev: undefined, next: undefined }
  return { prev: list[idx + 1], next: list[idx - 1] }
})

function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString(locale.value.startsWith('zh') ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div v-if="post" class="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-12 sm:py-16">
    <article class="mx-auto w-full max-w-2xl">
      <!-- Post header -->
      <header class="mb-10">
        <div class="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted dark:text-muted-dark">
          <time :datetime="post.date" class="font-mono">{{ formatDate(post.date) }}</time>
          <span aria-hidden="true">·</span>
          <span>{{ t('post.readTime', { minutes: post.readingTime }) }}</span>
        </div>

        <h1 class="font-heading text-3xl leading-tight tracking-tight sm:text-4xl">
          {{ post.title }}
        </h1>

        <p v-if="post.excerpt" class="mt-4 text-lg text-secondary dark:text-secondary-dark">
          {{ post.excerpt }}
        </p>

        <div class="mt-5 flex flex-wrap gap-2">
          <RouterLink
            v-for="tag in post.tags"
            :key="tag"
            :to="{ name: 'tag-posts', params: { tag } }"
            class="rounded-full border border-border px-3 py-1 text-xs text-muted transition-colors hover:border-accent hover:text-accent dark:border-border-dark dark:text-muted-dark"
          >
            #{{ tag }}
          </RouterLink>
        </div>
      </header>

      <!-- Body -->
      <MarkdownRenderer :source="post.content" />
    </article>

    <!-- Prev / next navigation -->
    <nav
      class="mx-auto grid w-full max-w-2xl gap-4 border-t border-border pt-8 sm:grid-cols-2 dark:border-border-dark"
    >
      <RouterLink
        v-if="siblings.prev"
        :to="{ name: 'post-detail', params: { slug: siblings.prev.slug } }"
        class="group flex flex-col gap-1 rounded-xl border border-border p-5 transition-colors hover:border-accent dark:border-border-dark"
      >
        <span class="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted dark:text-muted-dark"
                ><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg
                >{{ t('post.prev') }}</span>
        <span class="font-medium group-hover:text-accent">{{ siblings.prev.title }}</span>
      </RouterLink>
      <span v-else></span>

      <RouterLink
        v-if="siblings.next"
        :to="{ name: 'post-detail', params: { slug: siblings.next.slug } }"
        class="group flex flex-col gap-1 rounded-xl border border-border p-5 text-right transition-colors hover:border-accent dark:border-border-dark"
      >
        <span class="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted dark:text-muted-dark"
                >{{ t('post.next') }}<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg></span>
        <span class="font-medium group-hover:text-accent">{{ siblings.next.title }}</span>
      </RouterLink>
      <span v-else></span>
    </nav>
  </div>

  <!-- Not found -->
  <div
    v-else
    class="mx-auto flex w-full max-w-2xl flex-col items-start gap-4 px-5 py-20"
  >
    <p class="font-mono text-sm text-muted">404</p>
    <h1 class="font-heading text-3xl">{{ t('post.notFound') }}</h1>
    <RouterLink :to="{ name: 'blog-index' }" class="text-accent underline underline-offset-4">
      <span class="inline-flex items-center gap-1">{{ t('post.backToBlog') }}<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></span>
    </RouterLink>
  </div>
</template>