<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePosts } from '../composables/usePosts'
import PostList from '../components/blog/PostList.vue'

const { t } = useI18n()
const { all, allTags } = usePosts()

const posts = computed(() => all())
const tags = computed(() => allTags())
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-12 sm:py-16">
    <header class="max-w-2xl">
      <p class="mb-3 font-mono text-xs uppercase tracking-widest text-muted">
        {{ posts.length }} {{ t('post.countSuffix') }}
      </p>
      <h1 class="font-heading text-4xl tracking-tight sm:text-5xl">
        {{ t('blogNav.blog') }}
      </h1>
    </header>

    <!-- Tag filter chips -->
    <div class="flex flex-wrap gap-2">
      <RouterLink
        :to="{ name: 'tags' }"
        class="rounded-full border border-accent px-3 py-1 text-xs text-accent"
      >
        # {{ t('tags.label') }}
      </RouterLink>
      <span
        v-for="tag in tags"
        :key="tag"
        class="rounded-full border border-border px-3 py-1 text-xs text-muted dark:border-border-dark dark:text-muted-dark"
      >
        #{{ tag }}
      </span>
    </div>

    <PostList :posts="posts" />
  </div>
</template>