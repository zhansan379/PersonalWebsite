<script setup lang="ts">
import type { VaultTreeNode as T } from '../../composables/useVault'

defineProps<{
  node: T
  activeId?: string
  depth?: number
}>()

function linkFor(id: string) {
  return { name: 'vault-note' as const, params: { pathMatch: id.split('/') } }
}
</script>

<template>
  <li>
    <!-- 目录 -->
    <details v-if="node.type === 'dir'" :open="(depth ?? 0) < 2" class="group">
      <summary class="flex cursor-pointer select-none items-center gap-1 rounded px-1.5 text-sm text-secondary transition-colors hover:bg-zinc-100 hover:text-foreground dark:text-secondary-dark dark:hover:bg-zinc-800 dark:hover:text-foreground-dark">
        <svg class="h-3.5 w-3.5 shrink-0 transition-transform group-open:rotate-90" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="m6 4 4 4-4 4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M1.5 3.5A1.5 1.5 0 0 1 3 2h3.2a1.5 1.5 0 0 1 1.1.5l.9 1h4.3A1.5 1.5 0 0 1 14 5v7.5A1.5 1.5 0 0 1 12.5 14h-9.5A1.5 1.5 0 0 1 1.5 12.5Z" />
        </svg>
        <span class="truncate font-medium">{{ node.name }}</span>
      </summary>
      <ul v-if="node.children" class="ml-3 border-l border-border pl-2 dark:border-border-dark">
        <VaultTreeNode
          v-for="child in node.children"
          :key="child.type + ':' + (child.id ?? child.name)"
          :node="child"
          :active-id="activeId"
          :depth="(depth ?? 0) + 1"
        />
      </ul>
    </details>

    <!-- 笔记 / canvas -->
    <RouterLink
      v-else
      :to="linkFor(node.id!)"
      class="group flex items-center gap-1.5 rounded px-1.5 py-[1px] text-sm leading-6 transition-colors"
      :class="node.id === activeId
        ? 'bg-accent/10 font-medium text-accent'
        : 'text-secondary hover:bg-zinc-100 hover:text-foreground dark:text-secondary-dark dark:hover:bg-zinc-800 dark:hover:text-foreground-dark'"
    >
      <svg v-if="node.type === 'canvas'" class="h-3.5 w-3.5 shrink-0 text-accent" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <rect x="2" y="2" width="12" height="12" rx="1.5" />
        <path d="M2.5 8h11M8 2.5v11" stroke-linecap="round" />
      </svg>
      <span class="truncate">{{ node.name }}</span>
    </RouterLink>
  </li>
</template>