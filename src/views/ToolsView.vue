<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MermaidTool from '../components/tools/MermaidTool.vue'
import JsonTreeTool from '../components/tools/JsonTreeTool.vue'

/**
 * 常用工具页 tab 壳：新工具在 TOOLS 登记 id、在下方加面板组件即可。
 * KeepAlive 保住各工具切换 tab 时的编辑状态。
 */

const { t } = useI18n()

const TOOLS = [
  { id: 'mermaid', component: MermaidTool },
  { id: 'jsontree', component: JsonTreeTool },
] as const

const activeTool = ref<(typeof TOOLS)[number]['id']>('mermaid')
</script>

<template>
  <div class="mx-auto w-full max-w-6xl px-5 py-6">
    <!-- 工具 tab：后续新工具在此扩展 -->
    <div class="flex gap-1 border-b border-border dark:border-border-dark">
      <button
        v-for="tool in TOOLS"
        :key="tool.id"
        type="button"
        class="-mb-px border-b-2 px-4 py-2 text-sm transition-colors"
        :class="
          activeTool === tool.id
            ? 'border-accent font-medium text-accent'
            : 'border-transparent text-secondary hover:text-foreground dark:text-secondary-dark dark:hover:text-foreground-dark'
        "
        @click="activeTool = tool.id"
      >
        {{ t(`tools.${tool.id}.tab`) }}
      </button>
    </div>

    <KeepAlive>
      <component :is="TOOLS.find((tool) => tool.id === activeTool)!.component" />
    </KeepAlive>
  </div>
</template>
