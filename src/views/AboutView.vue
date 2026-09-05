<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MarkdownRenderer from '../components/blog/MarkdownRenderer.vue'

const aboutZh = import.meta.glob('../content/about/zh.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})
const aboutEn = import.meta.glob('../content/about/en.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const { locale } = useI18n()

const source = computed(() => {
  const zh = Object.values(aboutZh)[0]
  const en = Object.values(aboutEn)[0]
  return (locale.value.startsWith('zh') ? zh : en) as string
})
</script>

<template>
  <div class="mx-auto flex w-full max-w-2xl flex-col px-5 py-12 sm:py-16">
    <h1 class="mb-8 font-heading text-4xl tracking-tight sm:text-5xl">About</h1>
    <MarkdownRenderer :source="source" />
  </div>
</template>