import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    // giscus 自定义主题 CSS 需要 ACAO: *（iframe 在 giscus.app 域下抓取）
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
})