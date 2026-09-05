<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Post } from '../../composables/usePosts'
import PostCard from './PostCard.vue'

defineProps<{ posts: Post[] }>()

const { t } = useI18n()
</script>

<template>
  <div v-if="posts.length">
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <PostCard v-for="post in posts" :key="post.slug" :post="post" />
    </div>
  </div>

  <div
    v-else
    class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center dark:border-border-dark"
  >
    <p class="text-lg font-medium">{{ t('post.empty') }}</p>
    <p class="text-sm text-muted dark:text-muted-dark">
      {{ t('post.emptyHint') }}
    </p>
  </div>
</template>