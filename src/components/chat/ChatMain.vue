<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChat } from '../../composables/useChat'
import ChatMessage from './ChatMessage.vue'
import ChatSettings from './ChatSettings.vue'

/**
 * 聊天主体（头部 + 消息区 + 输入区），ChatPanel（浮动面板）与
 * ChatView（整页路由）共用。会话状态在 useChat 单例里，两种形态无缝共享。
 */
const props = withDefaults(
  defineProps<{
    /** 是否显示关闭按钮（浮动面板用；整页不需要）。 */
    closable?: boolean
    /** 是否显示"整页展开"按钮（仅浮动面板）。 */
    expandable?: boolean
  }>(),
  { closable: false, expandable: false },
)
const emit = defineEmits<{ close: []; expand: [] }>()

const { t } = useI18n()
const {
  messages,
  sending,
  readingTitles,
  activeMode,
  send,
  stop,
  retry,
  clear,
} = useChat()

const showSettings = ref(false)
const draft = ref('')
const listEl = ref<HTMLElement | null>(null)

const examples = ['chat.example1', 'chat.example2', 'chat.example3']

async function scrollToBottom(): Promise<void> {
  await nextTick()
  listEl.value?.scrollTo({ top: listEl.value.scrollHeight })
}

// 新消息与流式追加都滚到底部
watch(
  () => [messages.value.length, messages.value[messages.value.length - 1]?.content],
  scrollToBottom,
)

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    void submit()
  }
}

async function submit(): Promise<void> {
  const text = draft.value
  if (!text.trim() || sending.value) return
  draft.value = ''
  await send(text)
}

function lastIsError(): boolean {
  const last = messages.value[messages.value.length - 1]
  return !!last && last.role === 'assistant' && !!last.error
}

void props // closable/expandable 仅模板使用
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-border px-4 py-3 dark:border-border-dark">
      <div class="flex items-center gap-2">
        <span class="font-heading text-sm font-semibold">{{ t('chat.title') }}</span>
        <span
          class="h-2 w-2 rounded-full"
          :class="{
            'bg-green-500': activeMode === 'server',
            'bg-accent': activeMode === 'direct',
            'bg-muted dark:bg-muted-dark': activeMode === 'none',
          }"
          :title="activeMode"
        ></span>
      </div>
      <div class="flex items-center gap-1">
        <button
          v-if="expandable"
          type="button"
          class="hidden h-7 w-7 place-items-center rounded-full text-secondary transition-colors hover:text-accent md:grid dark:text-secondary-dark"
          :aria-label="t('chat.expand')"
          :title="t('chat.expand')"
          @click="emit('expand')"
        >
          <!-- Lucide maximize-2 -->
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" x2="14" y1="3" y2="10" /><line x1="3" x2="10" y1="21" y2="14" /></svg>
        </button>
        <button
          type="button"
          class="grid h-7 w-7 place-items-center rounded-full text-secondary transition-colors hover:text-accent dark:text-secondary-dark"
          :aria-label="t('chat.settings')"
          :title="t('chat.settings')"
          @click="showSettings = !showSettings"
        >
          <!-- Lucide settings -->
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <button
          v-if="closable"
          type="button"
          class="grid h-7 w-7 place-items-center rounded-full text-secondary transition-colors hover:text-accent dark:text-secondary-dark"
          :aria-label="t('chat.collapse')"
          :title="t('chat.collapse')"
          @click="emit('close')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
        </button>
      </div>
    </div>

    <!-- 设置视图 -->
    <ChatSettings v-if="showSettings" class="flex-1" @close="showSettings = false" />

    <template v-else>
      <!-- 消息列表（min-h-0 保证 flex 容器内独立滚动） -->
      <div ref="listEl" class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
        <!-- 空状态：问候 + 示例问题 -->
        <div v-if="messages.length === 0" class="flex flex-col gap-2 pt-2 text-sm">
          <p class="text-secondary dark:text-secondary-dark">{{ t('chat.greeting') }}</p>
          <button
            v-for="key in examples"
            :key="key"
            type="button"
            class="rounded-xl border border-border px-3 py-2 text-left text-xs text-secondary transition-colors hover:border-accent hover:text-accent dark:border-border-dark dark:text-secondary-dark"
            @click="send(t(key))"
          >
            {{ t(key) }}
          </button>
        </div>

        <ChatMessage
          v-for="m in messages"
          :key="m.id"
          :message="m"
          @navigate="emit('close')"
          @open-settings="showSettings = true"
        />
      </div>

      <!-- 工具状态行 -->
      <div
        v-if="readingTitles.length && sending"
        class="border-t border-border px-4 py-1.5 text-xs text-muted dark:border-border-dark dark:text-muted-dark"
      >
        {{ t('chat.reading', { title: readingTitles[readingTitles.length - 1] }) }}
      </div>

      <!-- 输入区 -->
      <div class="border-t border-border px-3 py-2.5 dark:border-border-dark">
        <div class="flex items-end gap-2">
          <textarea
            v-model="draft"
            rows="1"
            :placeholder="t('chat.placeholder')"
            class="max-h-32 flex-1 resize-none rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent dark:border-border-dark"
            @keydown="onKeydown"
          ></textarea>
          <button
            v-if="sending"
            type="button"
            class="shrink-0 rounded-xl border border-red-300 px-3 py-2 text-xs text-red-500 transition-colors hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/40"
            @click="stop"
          >
            {{ t('chat.stop') }}
          </button>
          <button
            v-else
            type="button"
            class="shrink-0 rounded-xl border border-border px-3 py-2 text-xs text-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-40 dark:border-border-dark dark:text-secondary-dark"
            :disabled="!draft.trim()"
            @click="submit"
          >
            {{ t('chat.send') }}
          </button>
        </div>
        <div class="mt-1.5 flex justify-between px-1 text-[0.7rem] text-muted dark:text-muted-dark">
          <button
            v-if="lastIsError()"
            type="button"
            class="hover:text-accent"
            @click="retry"
          >
            ↻ {{ t('chat.retry') }}
          </button>
          <span v-else></span>
          <button
            v-if="messages.length"
            type="button"
            class="hover:text-accent"
            @click="clear"
          >
            {{ t('chat.clear') }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
