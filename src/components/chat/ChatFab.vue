<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useChat } from '../../composables/useChat'

const { t } = useI18n()
const { panelOpen, togglePanel } = useChat()
</script>

<template>
  <button
    type="button"
    class="fixed bottom-6 right-6 z-50 h-12 w-12 place-items-center rounded-full border border-border bg-background text-secondary shadow-lg transition-colors hover:border-accent hover:text-accent dark:border-border-dark dark:bg-background-dark dark:text-secondary-dark"
    :class="panelOpen ? 'hidden md:grid' : 'grid'"
    :aria-label="t('chat.open')"
    :title="t('chat.title')"
    @click="togglePanel"
  >
    <!-- Lucide message-circle / x（不用 emoji 图标） -->
    <svg
      v-if="!panelOpen"
      xmlns="http://www.w3.org/2000/svg"
      width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
    ><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
    ><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  </button>
</template>
