<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PROVIDERS, getProvider } from '../../lib/llm/providers'
import { useChat } from '../../composables/useChat'
import { useChatSettings } from '../../composables/useChatSettings'

const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const { settings, applyProvider, clearApiKey } = useChatSettings()
const { serverInfo, ensureProbed } = useChat()

const currentPreset = computed(() => getProvider(settings.provider))

// 所有字段 v-model 直绑模块级 settings 单例，useChatSettings 内的 deep watch 自动持久化
function onProviderChange(e: Event): void {
  applyProvider((e.target as HTMLSelectElement).value)
}

const temperatureLabel = computed(() => settings.temperature.toFixed(1))
</script>

<template>
  <div class="flex h-full flex-col overflow-y-auto px-4 py-3 text-sm">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="font-heading text-base font-semibold">{{ t('chat.settings') }}</h2>
      <button
        type="button"
        class="text-xs text-secondary transition-colors hover:text-accent dark:text-secondary-dark"
        @click="emit('close')"
      >
        ← {{ t('chat.back') }}
      </button>
    </div>

    <div class="flex flex-col gap-4">
      <!-- 接入方式 -->
      <label class="flex flex-col gap-1.5">
        <span class="text-xs text-muted dark:text-muted-dark">{{ t('chat.mode') }}</span>
        <select
          v-model="settings.mode"
          class="rounded-lg border border-border bg-transparent px-2.5 py-1.5 outline-none focus:border-accent dark:border-border-dark"
        >
          <option value="auto">{{ t('chat.modeAuto') }}</option>
          <option value="server">{{ t('chat.modeServer') }}</option>
          <option value="direct">{{ t('chat.modeDirect') }}</option>
        </select>
      </label>

      <!-- 服务端探测状态 -->
      <div class="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs dark:border-border-dark">
        <span class="flex items-center gap-2">
          <span
            class="h-2 w-2 rounded-full"
            :class="serverInfo.available ? 'bg-green-500' : 'bg-muted dark:bg-muted-dark'"
          ></span>
          {{ serverInfo.available ? t('chat.serverOn') : t('chat.serverOff') }}
          <span v-if="serverInfo.available && serverInfo.model" class="text-muted dark:text-muted-dark">
            ({{ serverInfo.model }})
          </span>
        </span>
        <button
          type="button"
          class="text-secondary transition-colors hover:text-accent dark:text-secondary-dark"
          @click="ensureProbed(true)"
        >
          {{ t('chat.recheck') }}
        </button>
      </div>

      <!-- Provider -->
      <label class="flex flex-col gap-1.5">
        <span class="text-xs text-muted dark:text-muted-dark">{{ t('chat.provider') }}</span>
        <select
          :value="settings.provider"
          class="rounded-lg border border-border bg-transparent px-2.5 py-1.5 outline-none focus:border-accent dark:border-border-dark"
          @change="onProviderChange"
        >
          <option v-for="p in PROVIDERS" :key="p.id" :value="p.id">{{ p.label }}</option>
        </select>
      </label>

      <!-- Model -->
      <label class="flex flex-col gap-1.5">
        <span class="text-xs text-muted dark:text-muted-dark">{{ t('chat.model') }}</span>
        <input
          v-model="settings.model"
          :list="'chat-models'"
          class="rounded-lg border border-border bg-transparent px-2.5 py-1.5 outline-none focus:border-accent dark:border-border-dark"
        />
        <datalist id="chat-models">
          <option v-for="m in currentPreset.models" :key="m" :value="m" />
        </datalist>
      </label>

      <!-- Base URL -->
      <label class="flex flex-col gap-1.5">
        <span class="text-xs text-muted dark:text-muted-dark">{{ t('chat.baseURL') }}</span>
        <input
          v-model="settings.baseURL"
          :placeholder="currentPreset.baseURL || 'https://…/v1'"
          class="rounded-lg border border-border bg-transparent px-2.5 py-1.5 font-mono text-xs outline-none focus:border-accent dark:border-border-dark"
        />
      </label>

      <!-- API Key -->
      <label class="flex flex-col gap-1.5">
        <span class="flex items-center justify-between text-xs text-muted dark:text-muted-dark">
          {{ t('chat.apiKey') }}
          <a
            v-if="currentPreset.keyURL"
            :href="currentPreset.keyURL"
            target="_blank"
            rel="noopener noreferrer"
            class="text-accent hover:underline"
          >{{ t('chat.getKey') }} ↗</a>
        </span>
        <div class="flex gap-2">
          <input
            v-model="settings.apiKey"
            type="password"
            :placeholder="t('chat.apiKeyPlaceholder')"
            autocomplete="off"
            class="min-w-0 flex-1 rounded-lg border border-border bg-transparent px-2.5 py-1.5 font-mono text-xs outline-none focus:border-accent dark:border-border-dark"
          />
          <button
            v-if="settings.apiKey"
            type="button"
            class="shrink-0 rounded-lg border border-border px-2.5 text-xs text-secondary transition-colors hover:border-red-400 hover:text-red-500 dark:border-border-dark dark:text-secondary-dark"
            @click="clearApiKey"
          >
            {{ t('chat.clearKey') }}
          </button>
        </div>
      </label>

      <!-- Temperature -->
      <label class="flex flex-col gap-1.5">
        <span class="text-xs text-muted dark:text-muted-dark">
          {{ t('chat.temperature') }} · {{ temperatureLabel }}
        </span>
        <input
          v-model.number="settings.temperature"
          type="range"
          min="0"
          max="1"
          step="0.1"
          class="accent-accent"
        />
      </label>

      <!-- 自动保存 + 隐私提示 -->
      <p class="text-[0.7rem] text-muted dark:text-muted-dark">✓ {{ t('chat.autoSaved') }}</p>
      <p class="rounded-lg bg-accent/5 px-3 py-2 text-xs leading-relaxed text-secondary dark:text-secondary-dark">
        {{ t('chat.privacyNote', { baseURL: settings.baseURL || '—' }) }}
      </p>
    </div>
  </div>
</template>
