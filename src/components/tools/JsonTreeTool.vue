<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import 'jjsontree.js/dist/jsontree.js.css'
import 'jjsontree.js'
import SplitPane from './SplitPane.vue'

/**
 * JSON 树形查看（JsonTree.js，https://github.com/williamtroup/JsonTree.js，
 * 纯本地渲染）。左侧 JSON 输入，右侧树形预览；输入防抖解析，失败保留
 * 上一棵合法树并显示错误条。主题变量按站点深浅色作用域到 .jsontree-scope
 * （库自带主题文件都是裸 :root，直接 import 会全局污染且互相覆盖）。
 *
 * 该库是 UMD 包，挂载全局 $jsontree；包内 d.ts 是空壳，这里声明用到的
 * 最小 API 面。渲染为只读（allowEditing 全关）：树上的编辑无法回写
 * 左侧源码，开放编辑会误导。
 */

interface JsonTreeApi {
  render(el: HTMLElement, options: Record<string, unknown>): JsonTreeApi
  setJson(id: string, json: unknown): JsonTreeApi
  openAll(id: string): JsonTreeApi
  closeAll(id: string): JsonTreeApi
  destroy(id: string): JsonTreeApi
}

const $jsontree = (window as unknown as { $jsontree: JsonTreeApi }).$jsontree
const TREE_ID = 'jsontree-view'

const { t } = useI18n()

const EXAMPLE = `{
  "name": "Goto",
  "site": "https://github.com/zhansan379/PersonalWebsite",
  "tags": ["博客", "知识库", "工具"],
  "stack": {
    "framework": "Vue 3",
    "language": "TypeScript",
    "styling": "Tailwind CSS",
    "deployed": true
  },
  "posts": 42,
  "rating": 4.5,
  "draft": null
}`

const code = ref(EXAMPLE)
const parseError = ref('')
const treeEl = ref<HTMLElement>()
let rendered = false

/** allowEditing 全 false → 纯查看器。 */
const READ_ONLY_EDITING = {
  booleanValues: false,
  floatValues: false,
  stringValues: false,
  dateValues: false,
  numberValues: false,
  bigIntValues: false,
  guidValues: false,
  colorValues: false,
  urlValues: false,
  emailValues: false,
  regExpValues: false,
  symbolValues: false,
  imageValues: false,
  propertyNames: false,
  bulk: false,
}

function parseCode(): { ok: true; data: unknown } | { ok: false; message: string } {
  try {
    return { ok: true, data: JSON.parse(code.value) }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : String(err) }
  }
}

function syncTree(): void {
  if (!treeEl.value) return
  const parsed = parseCode()
  if (!parsed.ok) {
    parseError.value = parsed.message
    return // 保留上一棵合法树
  }
  parseError.value = ''
  if (!rendered) {
    $jsontree.render(treeEl.value, {
      data: parsed.data,
      // 自带 title bar 由 CSS 隐藏（操作按钮集成到外层 Header），
      // 并关掉库自身的全屏切换，统一走外层 Header 的全屏按钮
      title: { text: 'JSON', enableFullScreenToggling: false },
      allowEditing: READ_ONLY_EDITING,
    })
    rendered = true
  } else {
    $jsontree.setJson(TREE_ID, parsed.data)
  }
}

// 外层 Header 操作按钮 → 库的公开 API
function expandAll(): void {
  if (rendered) $jsontree.openAll(TREE_ID)
}

function collapseAll(): void {
  if (rendered) $jsontree.closeAll(TREE_ID)
}

// 全屏：对预览卡片用 Fullscreen API（库自带全屏入口已随 title bar 隐藏）
const previewCard = ref<HTMLElement>()
const isFullscreen = ref(false)

function toggleFullscreen(): void {
  if (document.fullscreenElement) {
    void document.exitFullscreen()
  } else {
    void previewCard.value?.requestFullscreen()
  }
}

function syncFullscreen(): void {
  isFullscreen.value = document.fullscreenElement === previewCard.value
}

// 输入防抖 300ms
let debounce: ReturnType<typeof setTimeout> | undefined
watch(code, () => {
  clearTimeout(debounce)
  debounce = setTimeout(syncTree, 300)
})

function formatCode(): void {
  const parsed = parseCode()
  if (parsed.ok) code.value = JSON.stringify(parsed.data, null, 2)
}

function minifyCode(): void {
  const parsed = parseCode()
  if (parsed.ok) code.value = JSON.stringify(parsed.data)
}

function applyExample(): void {
  code.value = EXAMPLE
}

onMounted(() => {
  syncTree()
  document.addEventListener('fullscreenchange', syncFullscreen)
})

onBeforeUnmount(() => {
  clearTimeout(debounce)
  document.removeEventListener('fullscreenchange', syncFullscreen)
  if (rendered) $jsontree.destroy(TREE_ID)
})
</script>

<template>
  <SplitPane>
    <template #left>
      <!-- 编辑器 -->
      <div class="flex flex-1 flex-col rounded-xl border border-border dark:border-border-dark">
        <div class="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 text-sm dark:border-border-dark">
          <span class="font-medium">{{ t('tools.jsontree.editorLabel') }}</span>
          <div class="ml-auto flex items-center gap-2">
            <button
              type="button"
              class="rounded-md border border-border px-2.5 py-1 text-xs transition-colors hover:border-accent hover:text-accent dark:border-border-dark"
              @click="applyExample"
            >
              {{ t('tools.jsontree.example') }}
            </button>
            <button
              type="button"
              class="rounded-md border border-border px-2.5 py-1 text-xs transition-colors hover:border-accent hover:text-accent dark:border-border-dark"
              @click="formatCode"
            >
              {{ t('tools.jsontree.format') }}
            </button>
            <button
              type="button"
              class="rounded-md border border-border px-2.5 py-1 text-xs transition-colors hover:border-accent hover:text-accent dark:border-border-dark"
              @click="minifyCode"
            >
              {{ t('tools.jsontree.minify') }}
            </button>
          </div>
        </div>
        <textarea
          v-model="code"
          spellcheck="false"
          :placeholder="t('tools.jsontree.placeholder')"
          class="h-96 w-full flex-1 resize-none rounded-b-xl bg-transparent p-4 font-mono text-sm leading-relaxed outline-none lg:h-auto"
        ></textarea>
      </div>
    </template>

    <template #right>
      <!-- 树形预览 -->
      <div
        ref="previewCard"
        class="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-background dark:border-border-dark dark:bg-background-dark"
      >
        <div class="flex items-center gap-3 border-b border-border px-4 py-3 text-sm dark:border-border-dark">
          <span class="font-medium">{{ t('tools.jsontree.previewLabel') }}</span>
          <div class="ml-auto flex items-center gap-2">
            <button
              type="button"
              class="rounded-md border border-border px-2.5 py-1 text-xs transition-colors hover:border-accent hover:text-accent dark:border-border-dark"
              @click="expandAll"
            >
              {{ t('tools.jsontree.expandAll') }}
            </button>
            <button
              type="button"
              class="rounded-md border border-border px-2.5 py-1 text-xs transition-colors hover:border-accent hover:text-accent dark:border-border-dark"
              @click="collapseAll"
            >
              {{ t('tools.jsontree.collapseAll') }}
            </button>
            <button
              type="button"
              class="rounded-md border border-border px-2.5 py-1 text-xs transition-colors hover:border-accent hover:text-accent dark:border-border-dark"
              @click="toggleFullscreen"
            >
              {{ isFullscreen ? t('tools.jsontree.exitFullscreen') : t('tools.jsontree.fullscreen') }}
            </button>
          </div>
        </div>
        <div
          v-if="parseError"
          class="whitespace-pre-wrap break-all border-b border-red-300 bg-red-50 px-4 py-2 font-mono text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {{ t('tools.jsontree.parseError', { message: parseError }) }}
        </div>
        <div class="jsontree-scope h-96 min-h-0 flex-1 overflow-auto p-2 lg:h-auto">
          <div :id="TREE_ID" ref="treeEl"></div>
        </div>
        <div class="border-t border-border px-4 py-2 text-right text-xs text-muted dark:border-border-dark dark:text-muted-dark">
          <a
            href="https://github.com/williamtroup/JsonTree.js"
            target="_blank"
            rel="noopener noreferrer"
            class="transition-colors hover:text-accent"
          >
            {{ t('tools.jsontree.credit') }}
          </a>
        </div>
      </div>
    </template>
  </SplitPane>
</template>

<style>
/*
 * JsonTree.js 主题变量作用域化：库自带的 light/dark 主题文件都是裸 :root
 * 定义，直接 import 会互相覆盖且污染全局。这里把两套变量分别挂到
 * .jsontree-scope（亮色）与 html.dark .jsontree-scope（暗色）下，
 * 取值照抄库自带主题文件。
 */
.jsontree-scope {
  --json-tree-js-color-dark-black: #d8d5d5;
  --json-tree-js-color-black: #f5f5f5;
  --json-tree-js-color-snow-white: #3b3a3a;
  --json-tree-js-color-light-gray: #818080;
  --json-tree-js-color-array: #f28c28;
  --json-tree-js-color-object: #636363;
  --json-tree-js-color-map: #a8a0bd;
  --json-tree-js-color-set: #989800;
  --json-tree-js-color-boolean: #ff0000;
  --json-tree-js-color-float: #f4bb44;
  --json-tree-js-color-number: #666bf9;
  --json-tree-js-color-bigint: #6495ed;
  --json-tree-js-color-string: #097969;
  --json-tree-js-color-date: #a656f5;
  --json-tree-js-color-null: var(--json-tree-js-color-light-gray);
  --json-tree-js-color-undefined: var(--json-tree-js-color-null);
  --json-tree-js-color-symbol: #daa06d;
  --json-tree-js-color-function: var(--json-tree-js-color-null);
  --json-tree-js-color-lambda: var(--json-tree-js-color-function);
  --json-tree-js-color-unknown: var(--json-tree-js-color-null);
  --json-tree-js-color-guid: #c45600;
  --json-tree-js-color-regexp: #aa336a;
  --json-tree-js-color-url: #89cff0;
  --json-tree-js-color-email: #fa8072;
  --json-tree-js-color-link: #0047ab;
  --json-tree-js-color-html: #ff00ff;
  --json-tree-js-editable-text-color: var(--json-tree-js-color-snow-white);
  --json-tree-js-editable-background-color: var(--json-tree-js-color-dark-black);
  --json-tree-js-highlight-selected-color: #aba0a0;
  --json-tree-js-highlight-compare-color: #c3bbbb;
  --json-tree-js-highlight-selected-border-color: var(--json-tree-js-color-black);
  --json-tree-js-tooltip-background-color: var(--json-tree-js-container-background-color);
  --json-tree-js-tooltip-border-color: var(--json-tree-js-container-border-color);
  --json-tree-js-tooltip-text-color: var(--json-tree-js-color-snow-white);
  --json-tree-js-container-background-color: #e8e6e6;
  --json-tree-js-container-border-color: #454c56;
  --json-tree-js-container-object-left-border-color: #677180;
  --json-tree-js-paging-column-background-color: #dbd6d6;
  --json-tree-js-paging-column-border-color: var(--json-tree-js-container-border-color);
  --json-tree-js-button-background-color: #e8e6e6;
  --json-tree-js-button-border-color: var(--json-tree-js-container-border-color);
  --json-tree-js-button-text-color: var(--json-tree-js-color-snow-white);
  --json-tree-js-button-background-color-hover: #cecaca;
  --json-tree-js-button-text-color-hover: var(--json-tree-js-color-snow-white);
  --json-tree-js-button-background-color-active: #a9a2a2;
  --json-tree-js-button-text-color-active: var(--json-tree-js-color-snow-white);
  --json-tree-js-button-color-disabled: var(--json-tree-js-button-background-color-hover);
  --json-tree-js-checkbox-background-color-checked: #818080;
}

html.dark .jsontree-scope {
  --json-tree-js-color-dark-black: #1c2128;
  --json-tree-js-color-black: #3b3a3a;
  --json-tree-js-color-snow-white: #f5f5f5;
  --json-tree-js-color-light-gray: #bbbbbb;
  --json-tree-js-color-array: #f28c28;
  --json-tree-js-color-object: var(--json-tree-js-color-snow-white);
  --json-tree-js-color-map: #bdb5d5;
  --json-tree-js-color-set: #ffd700;
  --json-tree-js-color-boolean: #ff0000;
  --json-tree-js-color-float: #e3c868;
  --json-tree-js-color-number: #666bf9;
  --json-tree-js-color-bigint: #6495ed;
  --json-tree-js-color-string: #78b13f;
  --json-tree-js-color-date: #a656f5;
  --json-tree-js-color-null: var(--json-tree-js-color-light-gray);
  --json-tree-js-color-undefined: var(--json-tree-js-color-null);
  --json-tree-js-color-symbol: #daa06d;
  --json-tree-js-color-function: var(--json-tree-js-color-null);
  --json-tree-js-color-lambda: var(--json-tree-js-color-function);
  --json-tree-js-color-unknown: var(--json-tree-js-color-null);
  --json-tree-js-color-guid: #c45600;
  --json-tree-js-color-regexp: #aa336a;
  --json-tree-js-color-url: #00ffff;
  --json-tree-js-color-email: #fa8072;
  --json-tree-js-color-link: #89cff0;
  --json-tree-js-color-html: #ff00ff;
  --json-tree-js-tooltip-background-color: var(--json-tree-js-container-background-color);
  --json-tree-js-tooltip-border-color: var(--json-tree-js-container-border-color);
  --json-tree-js-tooltip-text-color: var(--json-tree-js-color-snow-white);
  --json-tree-js-container-background-color: #22272e;
  --json-tree-js-container-border-color: #454c56;
  --json-tree-js-paging-column-background-color: #272e37;
  --json-tree-js-paging-column-border-color: var(--json-tree-js-container-border-color);
  --json-tree-js-button-background-color: #2d333b;
  --json-tree-js-button-border-color: var(--json-tree-js-container-border-color);
  --json-tree-js-button-text-color: var(--json-tree-js-color-snow-white);
  --json-tree-js-button-background-color-hover: var(--json-tree-js-container-border-color);
  --json-tree-js-button-text-color-hover: var(--json-tree-js-color-snow-white);
  --json-tree-js-button-background-color-active: #616b79;
  --json-tree-js-button-text-color-active: var(--json-tree-js-color-snow-white);
  --json-tree-js-button-color-disabled: var(--json-tree-js-container-border-color);
}

/*
 * 布局修正（均按作用域提升优先级，覆盖库默认样式）：
 * 1. 宽度自适应：库根容器默认 inline-block，内容多宽就多宽，右侧留白；
 *    改 block + 100% 撑满外层。
 * 2. 头部去重：隐藏库自带 title bar，操作按钮在外层 Header。
 * 3. 长文本折行：值默认 white-space: nowrap，长 URL 撑出横向滚动条；
 *    放开折行并 word-break: break-all。
 */
.jsontree-scope div.json-tree-js {
  display: block;
  width: 100%;
  /* 库默认 max-width: 500px，解除后才能随分栏宽度撑满 */
  max-width: none;
  /* 内容不足一屏时也撑满容器（父级有确定高度，min-height 相对其内容盒解析），
     避免树形背景只到内容底部、下面露出外层底色 */
  min-height: 100%;
  box-sizing: border-box;
}

.jsontree-scope div.json-tree-js div.title-bar {
  display: none;
}

.jsontree-scope div.json-tree-js div.object-type-contents div.object-type-value,
.jsontree-scope div.json-tree-js div.object-type-contents div.object-type-value-wrapped {
  white-space: normal;
}

.jsontree-scope div.json-tree-js div.contents span {
  word-break: break-all;
  overflow-wrap: anywhere;
}
</style>
