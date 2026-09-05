<script setup lang="ts">
import type { VaultTreeNode } from '../../composables/useVault'
import VaultTreeNodeView from './VaultTreeNode.vue'

defineProps<{
  nodes: VaultTreeNode[]
  activeId?: string
}>()
</script>

<template>
  <nav aria-label="Wiki 目录" class="overflow-y-auto px-1 py-2">
    <ul class="flex flex-col gap-[1px]">
      <VaultTreeNodeView
        v-for="node in nodes"
        :key="node.type + ':' + (node.id ?? node.name)"
        :node="node"
        :active-id="activeId"
        :depth="0"
      />
    </ul>
  </nav>
</template>