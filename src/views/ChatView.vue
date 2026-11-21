<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ChatMain from '../components/chat/ChatMain.vue'
import { useChat } from '../composables/useChat'

/** 知识库助手整页形态：与浮动面板共享 useChat 会话状态，内容无缝衔接。 */
const { t } = useI18n()
const { ensureProbed } = useChat()

onMounted(() => {
  void ensureProbed()
})
</script>

<template>
  <!-- 高度锁定为视口减顶栏：消息区内部滚动、输入框固定卡片底部，页面本身不滚动 -->
  <div class="mx-auto flex h-[calc(100dvh-4.3rem)] w-full max-w-3xl flex-col px-4 py-4">
    <div
      class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border dark:border-border-dark"
      :aria-label="t('chat.title')"
    >
      <ChatMain class="flex-1" />
    </div>
  </div>
</template>
