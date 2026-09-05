import type { MessageSchema } from './index'

declare module 'vue-i18n' {
  interface DefineLocaleMessage extends MessageSchema {}
}