<script setup lang="ts">
interface TagEntry {
  name: string
  count: number
}

defineProps<{ tags: TagEntry[] }>()
</script>

<template>
  <ul class="flex flex-wrap gap-3">
    <li v-for="tag in tags" :key="tag.name">
      <RouterLink
        :to="{ name: 'tag-posts', params: { tag: tag.name } }"
        class="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent dark:border-border-dark dark:hover:border-accent"
      >
        <span>#{{ tag.name }}</span>
        <span class="font-mono text-xs opacity-70">{{ tag.count }}</span>
      </RouterLink>
    </li>
  </ul>
</template>