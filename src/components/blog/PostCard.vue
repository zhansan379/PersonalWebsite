<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Post } from '../../composables/usePosts'

defineProps<{ post: Post }>()

const { t, locale } = useI18n()

function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString(
    locale.value.startsWith('zh') ? 'zh-CN' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' },
  )
}
</script>

<template>
  <article
    class="group flex flex-col gap-3 rounded-2xl border border-border p-6 transition-colors hover:border-accent/40 dark:border-border-dark dark:hover:border-accent/50"
  >
    <header class="flex items-center gap-x-3 text-sm text-muted dark:text-muted-dark">
      <template v-if="post.date">
        <time :datetime="post.date" class="font-mono">{{ formatDate(post.date) }}</time>
        <span aria-hidden="true">·</span>
      </template>
      <span>{{ t('post.readTime', { minutes: post.readingTime }) }}</span>
    </header>

    <h3 class="font-heading text-xl leading-snug">
      <RouterLink
        :to="{ name: 'vault-note', params: { pathMatch: post.slug.split('/') } }"
        class="transition-colors hover:text-accent dark:hover:text-accent"
      >
        {{ post.title }}
      </RouterLink>
    </h3>

    <p class="line-clamp-3 text-[0.95rem] leading-relaxed text-muted dark:text-muted-dark">
      {{ post.excerpt }}
    </p>

    <footer class="mt-auto flex flex-wrap gap-2 pt-1">
      <RouterLink
        v-for="tag in post.tags"
        :key="tag"
        :to="{ name: 'tag-posts', params: { tag } }"
        class="rounded-full border border-border px-3 py-1 text-xs text-secondary transition-colors hover:border-accent hover:text-accent dark:border-border-dark dark:text-secondary-dark"
      >
        #{{ tag }}
      </RouterLink>
    </footer>
  </article>
</template>