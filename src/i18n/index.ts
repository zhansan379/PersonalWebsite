import { createI18n } from 'vue-i18n'
import enUS from './locales/en-US'
import zhCN from './locales/zh-CN'
import type { MessageSchema } from './messages'

export type { MessageSchema }

export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: SupportedLocale = 'zh-CN'

export function supportsLocale(value: string | null): value is SupportedLocale {
  return (
    value !== null &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  )
}

const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

export default i18n