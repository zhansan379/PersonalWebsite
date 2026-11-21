<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useChat } from '../../composables/useChat'
import ChatMain from './ChatMain.vue'

/** 浮动面板：只负责定位与展开/收起，主体逻辑在 ChatMain（与整页路由共用）。 */
const { t } = useI18n()
const { panelOpen, togglePanel, ensureProbed } = useChat()
const router = useRouter()

function expandToPage(): void {
  togglePanel()
  void router.push({ name: 'assistant' })
}
</script>

<template>
  <transition name="chat-pop">
    <div
      v-if="panelOpen"
      class="fixed inset-0 z-40 flex flex-col border border-border bg-background shadow-2xl md:inset-auto md:bottom-24 md:right-6 md:h-[32rem] md:w-96 md:rounded-2xl dark:border-border-dark dark:bg-background-dark"
      role="dialog"
      :aria-label="t('chat.title')"
      @vue:mounted="ensureProbed()"
    >
      <ChatMain
        class="flex-1"
        closable
        expandable
        @close="togglePanel"
        @expand="expandToPage"
      />
    </div>
  </transition>
</template>

<style scoped>
.chat-pop-enter-active,
.chat-pop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.chat-pop-enter-from,
.chat-pop-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
