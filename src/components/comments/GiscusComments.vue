<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * giscus 评论区：评论数据存放在仓库 GitHub Discussions（Announcements 分类，
 * 只有维护者和 giscus bot 能开新讨论，避免被滥用），读者用 GitHub 账号登录即可评论。
 *
 * - mapping = specific，term 用笔记的稳定 id（vault 路径），与 URL 解耦，
 *   以后改路由结构评论也不会丢。
 * - 主题跟随站点的 <html data-theme>（MutationObserver 监听，切换时通过
 *   postMessage 热更新 iframe，无需重载）；语言跟随 i18n locale（需重建 script）。
 *
 * 前置条件（一次性手动操作）：在 https://github.com/apps/giscus 给仓库安装 giscus App。
 */
const props = defineProps<{ term: string }>()

const { locale } = useI18n()
const container = ref<HTMLElement | null>(null)

const GISCUS_ORIGIN = 'https://giscus.app'

const giscusLang = computed(() => (locale.value === 'zh-CN' ? 'zh-CN' : 'en'))

// 自托管主题（public/giscus-{light,dark}.css，基于官方主题 + 布局重排：
// 评论框置顶、reactions 移到评论列表底部）。自定义主题必须给绝对 URL，
// 且响应头带 ACAO: *（vercel.json 已配置）。
// 例外：本地 dev 时 giscus.app（https）抓取 http://localhost 的 CSS 会被
// 浏览器 Private Network Access 拦截，此时退回官方内置主题——颜色正常，
// 只是本地预览看不到表情重排效果，线上不受影响。
const isLocalDev = ['localhost', '127.0.0.1'].includes(window.location.hostname)

function themeUrl(name: ThemeName): string {
  return isLocalDev ? name : `${window.location.origin}/giscus-${name}.css`
}

// 站点主题不经过共享 store（useTheme 每次调用各自建 ref），直接以 DOM 上的
// data-theme 为准，并用 MutationObserver 跟随切换。
type ThemeName = 'light' | 'dark'
const theme = ref<ThemeName>(readDomTheme())
function readDomTheme(): ThemeName {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

let observer: MutationObserver | undefined

function mount(): void {
  const el = container.value
  if (!el) return
  el.innerHTML = ''
  const s = document.createElement('script')
  s.src = `${GISCUS_ORIGIN}/client.js`
  s.async = true
  s.crossOrigin = 'anonymous'
  const attrs: Record<string, string> = {
    repo: 'zhansan379/PersonalWebsite',
    'repo-id': 'R_kgDOUO2GSA',
    category: 'Announcements',
    'category-id': 'DIC_kwDOUO2GSM4DGvOH',
    mapping: 'specific',
    term: props.term,
    strict: '1',
    'reactions-enabled': '1',
    'emit-metadata': '0',
    'input-position': 'top',
    theme: themeUrl(theme.value),
    lang: giscusLang.value,
    loading: 'lazy',
  }
  for (const [key, value] of Object.entries(attrs)) {
    s.setAttribute(`data-${key}`, value)
  }
  el.appendChild(s)
}

/** 主题切换走 setConfig 热更新，避免重载 iframe 丢失输入中的草稿。 */
function sendConfig(config: Record<string, string>): void {
  const iframe = container.value?.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
  iframe?.contentWindow?.postMessage({ giscus: { setConfig: config } }, GISCUS_ORIGIN)
}

watch(theme, (value) => sendConfig({ theme: themeUrl(value) }))
watch(giscusLang, mount)
watch(() => props.term, mount)

onMounted(() => {
  mount()
  observer = new MutationObserver(() => {
    theme.value = readDomTheme()
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="container" class="giscus-container min-h-[150px]" />
</template>
