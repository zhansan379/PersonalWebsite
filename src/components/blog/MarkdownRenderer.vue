<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown } from '../../lib/markdown'

const props = defineProps<{ source: string }>()

const html = computed(() => renderMarkdown(props.source))
</script>

<template>
  <div
    class="prose-zh max-w-none marker:text-current"
    v-html="html"
  ></div>
</template>

<style scoped>
.prose-zh {
  font-size: 1.0625rem;
  line-height: 1.85;
}

/* Headings: serif for titles, generous spacing. */
.prose-zh :deep(h1),
.prose-zh :deep(h2),
.prose-zh :deep(h3),
.prose-zh :deep(h4) {
  font-family: var(--font-heading);
  font-weight: 600;
  line-height: 1.3;
  margin: 2em 0 0.6em;
  letter-spacing: -0.01em;
}
.prose-zh :deep(h1) {
  font-size: 1.75rem;
  margin-top: 0;
  padding-bottom: 0.4em;
  border-bottom: 1px solid color-mix(in srgb, currentColor 15%, transparent);
}
.prose-zh :deep(h2) {
  font-size: 1.45rem;
}
.prose-zh :deep(h3) {
  font-size: 1.2rem;
}
.prose-zh :deep(h4) {
  font-size: 1.05rem;
}

.prose-zh :deep(p) {
  margin: 1.1em 0;
}
.prose-zh :deep(a) {
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: color-mix(in srgb, currentColor 40%, transparent);
  transition: text-decoration-color 0.15s ease;
}
.prose-zh :deep(a:hover) {
  text-decoration-color: currentColor;
}

.prose-zh :deep(ul) {
  list-style: disc;
  padding-left: 1.4em;
  margin: 1em 0;
}
.prose-zh :deep(ol) {
  list-style: decimal;
  padding-left: 1.4em;
  margin: 1em 0;
}
.prose-zh :deep(li) {
  margin: 0.3em 0;
}
.prose-zh :deep(li > ul),
.prose-zh :deep(li > ol) {
  margin: 0.3em 0;
}

/* Quote + code */
.prose-zh :deep(blockquote) {
  margin: 1.4em 0;
  padding: 0.8em 1.2em;
  /* 引用：粗左边框 + 柔和底色。刻意不用 color-mix()、不用斜体、不把文字变淡，
     避免部分手机内核不支持这些特性导致"引用看不见"。中性灰底色明暗主题都可用。 */
  border-left: 4px solid currentColor;
  border-radius: 0 8px 8px 0;
  background: rgba(120, 113, 108, 0.12);
}
.prose-zh :deep(blockquote p) {
  margin: 0.3em 0;
}
.prose-zh :deep(blockquote > :first-child) {
  margin-top: 0;
}
.prose-zh :deep(blockquote > :last-child) {
  margin-bottom: 0;
}
.prose-zh :deep(code) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 0.9em;
  padding: 0.15em 0.4em;
  border-radius: 6px;
  background: color-mix(in srgb, currentColor 8%, transparent);
}
.prose-zh :deep(pre) {
  margin: 1.4em 0;
  padding: 1em 1.2em;
  overflow-x: auto;
  border-radius: 12px;
  line-height: 1.6;
  background: color-mix(in srgb, currentColor 6%, transparent);
}
.prose-zh :deep(pre code) {
  background: transparent;
  padding: 0;
  font-size: 0.875rem;
}

/* Tables (GFM) */
.prose-zh :deep(table) {
  display: block;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  margin: 1.4em 0;
  font-size: 0.95em;
  -webkit-overflow-scrolling: touch;
}
.prose-zh :deep(th),
.prose-zh :deep(td) {
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  padding: 0.5em 0.8em;
  text-align: left;
}
.prose-zh :deep(th) {
  background: color-mix(in srgb, currentColor 5%, transparent);
  font-weight: 600;
}

/* Task lists */
.prose-zh :deep(input[type='checkbox']) {
  margin-right: 0.5em;
  accent-color: currentColor;
}
.prose-zh :deep(hr) {
  margin: 2.5em 0;
  border: 0;
  border-top: 1px solid color-mix(in srgb, currentColor 15%, transparent);
}
.prose-zh :deep(strong) {
  font-weight: 600;
}
.prose-zh :deep(img) {
  max-width: 100%;
  border-radius: 12px;
  margin: 1.4em 0;
}
</style>