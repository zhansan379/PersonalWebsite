<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePosts } from '../composables/usePosts'
import TagCloud from '../components/blog/TagCloud.vue'

const { t } = useI18n()
const { all, allTags } = usePosts()

const posts = computed(() => all())
const tags = computed(() =>
  allTags().map((name) => ({
    name,
    count: posts.value.filter((p) => p.tags.includes(name)).length,
  })),
)
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-12 sm:py-16">
    <header class="max-w-2xl">
      <h1 class="font-heading text-4xl tracking-tight sm:text-5xl">{{ t('tags.title') }}</h1>
      <p class="mt-4 text-secondary dark:text-secondary-dark">{{ t('tags.subtitle') }}</p>
    </header>
    <TagCloud :tags="tags" />
  </div>
</template>