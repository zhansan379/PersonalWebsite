<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePosts } from '../composables/usePosts'
import HomeHero from '../components/blog/HomeHero.vue'
import PostCard from '../components/blog/PostCard.vue'

const { t } = useI18n()
const { all } = usePosts()

const featured = computed(() => {
  const posts = all()
  const picks = posts.filter((p) => p.featured)
  return (picks.length ? picks : posts).slice(0, 3)
})
</script>

<template>
  <div class="flex flex-col">
    <!-- Immersive video hero (full bleed) -->
    <HomeHero />

    <!-- Featured posts -->
    <section class="mx-auto w-full max-w-6xl px-5 py-16 sm:py-20">
      <header class="mb-8 flex items-end justify-between">
        <h2 class="font-heading text-2xl tracking-tight sm:text-3xl">
          {{ t('home.featured') }}
        </h2>
        <RouterLink
          :to="{ name: 'blog-index' }"
          class="text-sm text-accent transition-opacity hover:opacity-70"
        >
          {{ t('home.all') }}
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </RouterLink>
      </header>

      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <PostCard v-for="post in featured" :key="post.slug" :post="post" />
      </div>
    </section>
  </div>
</template>