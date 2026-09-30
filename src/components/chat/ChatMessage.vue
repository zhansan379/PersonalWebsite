<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { renderMarkdown } from '../../lib/markdown'
import { useVault } from '../../composables/useVault'
import type { ChatUIMessage } from '../../composables/useChat'

const props = defineProps<{ message: ChatUIMessage }>()
const emit = defineEmits<{ navigate: []; openSettings: [] }>()

const { t } = useI18n()
const vault = useVault()

/**
 * XSS 防护：模型输出不可信，先转义 `<`/`>`/`&` 再交给 marked，
 * 聊天场景不需要 raw HTML 能力。
 */
function escapeRawHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const rendered = computed(() =>
  props.message.role === 'assistant' && props.message.content
    ? renderMarkdown(escapeRawHtml(props.message.content))
    : '',
)

const sourceLinks = computed(() =>
  (props.message.sources ?? [])
    .map((id) => ({
      id,
      title: vault.noteMap.get(id)?.title ?? id,
      to: { name: 'vault-note', params: { pathMatch: id.split('/') } },
    })),
)
</script>

<template>
  <div
    class="flex"
    :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
  >
    <div
      class="max-w-[85%] text-sm leading-relaxed"
      :class="
        message.role === 'user'
          ? 'rounded-2xl rounded-br-sm bg-accent/10 px-3.5 py-2 whitespace-pre-wrap'
          : 'py-1'
      "
    >
      <template v-if="message.role === 'assistant'">
        <!-- 内联错误条（no-key / server-down 是引导型错误码，其余为原始错误文本） -->
        <div
          v-if="message.error"
          class="rounded-lg border border-red-300/60 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-300"
        >
          <template v-if="message.error === 'no-key' || message.error === 'server-down'">
            {{ message.error === 'no-key' ? t('chat.keyMissing') : t('chat.serverDown') }}
            <button
              type="button"
              class="ml-2 underline hover:no-underline"
              @click="emit('openSettings')"
            >
              {{ t('chat.goSettings') }}
            </button>
          </template>
          <template v-else>{{ t('chat.errorGeneric') }}: {{ message.error }}</template>
        </div>
        <!-- markdown 正文 + 流式光标 -->
        <div v-if="rendered" class="chat-markdown" v-html="rendered"></div>
        <span v-if="message.streaming" class="animate-pulse text-accent">▍</span>
        <!-- 来源 chips：按实际 read_note 记录确定性渲染，不信模型生成的链接 -->
        <div v-if="sourceLinks.length && !message.streaming" class="mt-2">
          <div class="mb-1 text-[0.7rem] uppercase tracking-wider text-muted dark:text-muted-dark">
            {{ t('chat.sources') }}
          </div>
          <div class="flex flex-wrap gap-1.5">
            <RouterLink
              v-for="s in sourceLinks"
              :key="s.id"
              :to="s.to"
              class="rounded-full border border-border px-2.5 py-0.5 text-xs text-secondary transition-colors hover:border-accent hover:text-accent dark:border-border-dark dark:text-secondary-dark"
              @click="emit('navigate')"
            >
              {{ s.title }}
            </RouterLink>
          </div>
        </div>
      </template>
      <template v-else>{{ message.content }}</template>
    </div>
  </div>
</template>

<style scoped>
.chat-markdown :deep(p) {
  margin: 0.4em 0;
}
.chat-markdown :deep(ul),
.chat-markdown :deep(ol) {
  margin: 0.4em 0;
  padding-left: 1.2em;
}
.chat-markdown :deep(ul) {
  list-style: disc;
}
.chat-markdown :deep(ol) {
  list-style: decimal;
}
.chat-markdown :deep(code) {
  border-radius: 4px;
  background: color-mix(in srgb, currentColor 8%, transparent);
  padding: 0.1em 0.3em;
  font-size: 0.9em;
}
.chat-markdown :deep(pre) {
  margin: 0.5em 0;
  overflow-x: auto;
  border-radius: 8px;
  background: color-mix(in srgb, currentColor 6%, transparent);
  padding: 0.6em 0.8em;
}
.chat-markdown :deep(pre code) {
  background: none;
  padding: 0;
}
.chat-markdown :deep(h1),
.chat-markdown :deep(h2),
.chat-markdown :deep(h3),
.chat-markdown :deep(h4) {
  margin: 0.6em 0 0.3em;
  font-weight: 600;
}
.chat-markdown :deep(a) {
  color: var(--color-accent);
  text-decoration: underline;
}
</style>
