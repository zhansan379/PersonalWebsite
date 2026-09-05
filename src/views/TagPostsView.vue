<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePosts } from '../composables/usePosts'
import PostList from '../components/blog/PostList.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { byTag } = usePosts()

const tag = computed(() => String(route.params.tag))
const posts = computed(() => byTag(tag.value))

// 标签页由知识库「标签」子视图钻取而来：有历史则回退，否则回落该子视图。
function goBack(): void {
  if (window.history.state?.back) router.back()
  else router.push({ name: 'vault-index', query: { tab: 'tags' } })
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-12 sm:py-16">
    <header class="max-w-2xl">
      <button
        type="button"
        class="mb-5 grid h-8 w-8 place-items-center rounded-lg border border-border text-secondary transition-colors hover:border-accent hover:text-accent dark:border-border-dark dark:text-secondary-dark"
        :title="t('vault.back')"
        :aria-label="t('vault.back')"
        @click="goBack"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
      </button>
      <p class="font-mono text-xs uppercase tracking-widest text-muted">#</p>
      <h1 class="font-heading text-4xl tracking-tight sm:text-5xl">{{ tag }}</h1>
      <p class="mt-3 text-muted dark:text-muted-dark">
        {{ posts.length }} {{ t('post.countSuffix') }}
      </p>
    </header>
    <PostList :posts="posts" />
  </div>
</template>