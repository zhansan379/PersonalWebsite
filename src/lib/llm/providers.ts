/**
 * Provider 预设注册表。`custom` 允许完全自由的 baseURL（自建网关、one-api 等）。
 * 注意：部分服务商的浏览器 CORS 不开放（如 DashScope 需实测），不通时引导用户
 * 改用 OpenRouter 或服务端模式。
 */

export interface ProviderPreset {
  id: string
  label: string
  api: 'openai-compatible' | 'anthropic'
  /** 直连默认 baseURL（custom 为空，由用户填写）。 */
  baseURL: string
  /** 设置面板 datalist 建议模型。 */
  models: string[]
  /** 申请 key 的页面（设置面板链接）。 */
  keyURL: string
}

export const PROVIDERS: ProviderPreset[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    api: 'openai-compatible',
    baseURL: 'https://api.openai.com/v1',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'],
    keyURL: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    api: 'openai-compatible',
    baseURL: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    keyURL: 'https://platform.deepseek.com/api_keys',
  },
  {
    id: 'qwen',
    label: '通义千问',
    api: 'openai-compatible',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-plus', 'qwen-turbo', 'qwen-max'],
    keyURL: 'https://bailian.console.aliyun.com/?apiKey=1#/api-key',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    api: 'openai-compatible',
    baseURL: 'https://openrouter.ai/api/v1',
    models: ['openai/gpt-4o-mini', 'anthropic/claude-sonnet-4.5', 'deepseek/deepseek-chat'],
    keyURL: 'https://openrouter.ai/keys',
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    api: 'anthropic',
    baseURL: 'https://api.anthropic.com',
    models: ['claude-haiku-4-5-20251001', 'claude-sonnet-4-5', 'claude-opus-4-5'],
    keyURL: 'https://console.anthropic.com/settings/keys',
  },
  {
    id: 'custom',
    label: '自定义 (OpenAI 兼容)',
    api: 'openai-compatible',
    baseURL: '',
    models: [],
    keyURL: '',
  },
]

export function getProvider(id: string): ProviderPreset {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0]
}
