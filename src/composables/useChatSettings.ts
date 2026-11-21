import { reactive, watch } from 'vue'
import { getProvider } from '../lib/llm/providers'

/**
 * 聊天设置：单个带版本号的 localStorage key。
 *
 * 隐私红线：apiKey 只存这里，只作为请求头发往用户配置的 baseURL，
 * 不得出现在任何日志、埋点或其他请求中。
 */

const STORAGE_KEY = 'chat.settings.v1'

export interface ChatSettings {
  version: 1
  /** auto：服务端可用走服务端，否则直连；server：只走服务端；direct：只走直连。 */
  mode: 'auto' | 'server' | 'direct'
  provider: string
  baseURL: string
  model: string
  apiKey: string
  temperature: number
  maxTokens: number
}

function defaults(): ChatSettings {
  const preset = getProvider('deepseek')
  return {
    version: 1,
    mode: 'auto',
    provider: preset.id,
    baseURL: preset.baseURL,
    model: preset.models[0] ?? '',
    apiKey: '',
    temperature: 0.3,
    maxTokens: 2048,
  }
}

function load(): ChatSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults()
    const parsed = JSON.parse(raw) as Partial<ChatSettings>
    if (parsed.version !== 1) return defaults()
    return { ...defaults(), ...parsed, version: 1 }
  } catch {
    return defaults()
  }
}

const settings = reactive<ChatSettings>(load())

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // 隐私模式等场景写不进去就静默降级（设置只保留在内存）
  }
}

// 任何字段变化（v-model / update / applyProvider）都自动持久化，无需保存按钮
watch(settings, persist, { deep: true })

export function useChatSettings() {
  function update(patch: Partial<Omit<ChatSettings, 'version'>>): void {
    Object.assign(settings, patch)
  }

  /** 切换 provider 时带上该预设的默认 baseURL 与模型（用户已改过的保留不了——切换即重置为该预设默认）。 */
  function applyProvider(id: string): void {
    const preset = getProvider(id)
    settings.provider = preset.id
    settings.baseURL = preset.baseURL
    settings.model = preset.models[0] ?? settings.model
  }

  function clearApiKey(): void {
    settings.apiKey = ''
  }

  return { settings, update, applyProvider, clearApiKey }
}
