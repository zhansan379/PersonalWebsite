<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePosts } from '../composables/usePosts'
import PostList from '../components/blog/PostList.vue'

const route = useRoute()
const { t } = useI18n()
const { byTag } = usePosts()

const tag = computed(() => String(route.params.tag))
const posts = computed(() => byTag(tag.value))
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-12 sm:py-16">
    <header class="max-w-2xl">
      <p class="font-mono text-xs uppercase tracking-widest text-muted">#</p>
      <h1 class="font-heading text-4xl tracking-tight sm:text-5xl">{{ tag }}</h1>
      <p class="mt-3 text-muted dark:text-muted-dark">
        {{ posts.length }} {{ t('post.countSuffix') }}
      </p>
    </header>
    <PostList :posts="posts" />
  </div>
</template>