<script setup lang="ts">
import { computed, ref } from 'vue'
import { useElementBounding, useScroll } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import ImageLightbox from '../vault/ImageLightbox.vue'

export interface Project {
  id: number
  name: string
  category: string
  description: string
  link: string
  images: {
    col1_1: string
    col1_2: string
    col2: string
  }
}

const props = defineProps<{ projects: Project[] }>()
const { t } = useI18n()

const containerRef = ref<HTMLElement>()

/** 点击放大的图片地址；null 表示灯箱关闭。复用知识库的 ImageLightbox。 */
const zoomSrc = ref<string | null>(null)

/** 窗口滚动 Y（px）。页面用 window 滚动，容器只是纵向长度被拉长的“滚动空间”。 */
const { y } = useScroll(window)
const { top, height } = useElementBounding(containerRef)

/** 整个堆叠区的规范化滚动进度 0→1：容器顶进入视口顶 → 容器底离开视口底。 */
const progress = computed(() => {
  const h = height.value
  if (h <= 0) return 0
  const viewport = window.innerHeight
  const containerTop = y.value + top.value // 容器在文档中的绝对位置
  const denom = h - viewport
  if (denom <= 0) return 1
  return Math.min(1, Math.max(0, (y.value - containerTop) / denom))
})

/**
 * 规范公式：targetScale = 1 - (总卡数 - 1 - index) * 0.03。
 * 卡片在“尚未成为最上层”时保持该缩放，在其上一层交接窗口内 lerp 到 1。
 */
function scaleFor(index: number): number {
  const n = props.projects.length
  if (n <= 1) return 1
  const target = 1 - (n - 1 - index) * 0.03
  const start = (index - 1) / (n - 1)
  const end = index / (n - 1)
  if (progress.value <= start) return target
  if (progress.value >= end) return 1
  const k = (progress.value - start) / (end - start)
  return target + (1 - target) * k
}
</script>

<template>
  <div ref="containerRef" class="relative">
    <div
      v-for="(project, i) in projects"
      :key="project.id"
      class="flex h-[85vh] flex-col overflow-hidden rounded-2xl border border-border bg-background p-4 transition-colors hover:border-accent/40 sm:rounded-3xl sm:p-6 md:p-8"
      :style="{
        position: 'sticky',
        top: `${96 + i * 28}px`,
        zIndex: i,
        transform: `translateZ(0) scale(${scaleFor(i)})`,
        willChange: 'transform',
      }"
    >
          <!-- 顶行 -->
          <div class="flex items-center justify-between gap-3 sm:gap-4">
            <span
              class="shrink-0 font-black text-foreground"
              :style="{
                fontSize: 'clamp(2.5rem, 10vw, 140px)',
                lineHeight: '0.9',
              }"
            >{{ String(i + 1).padStart(2, '0') }}</span>

            <div class="flex min-w-0 flex-col items-end gap-2 text-right">
              <span class="font-medium uppercase tracking-wider text-xs text-muted sm:text-sm md:text-base">
                {{ project.category }}
              </span>
              <span class="break-all font-bold uppercase text-base leading-tight text-foreground sm:text-xl md:text-2xl">
                {{ project.name }}
              </span>
            </div>

            <!-- 移动端空间不足，收成图标圆钮；md 起展开为文字胶囊。 -->
            <a
              :href="project.link"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="`${project.name} — ${t('projects.live')}`"
              :title="t('projects.live')"
              class="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-border font-medium uppercase tracking-widest text-secondary transition-colors hover:border-accent hover:text-accent sm:h-11 sm:w-11 md:inline-flex md:h-auto md:w-auto md:px-10 md:py-3.5 md:text-base"
            >
              <svg
                class="h-5 w-5 md:hidden"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.55v-1.94c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.19 1.78 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.19-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.73 0c2.18-1.49 3.14-1.18 3.14-1.18.63 1.59.24 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.41-2.7 5.38-5.26 5.67.42.36.79 1.07.79 2.15v3.19c0 .31.21.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
              </svg>
              <span class="hidden md:inline">{{ t('projects.live') }}</span>
            </a>
          </div>

          <!-- 项目描述 -->
          <p class="mb-6 max-w-2xl text-sm leading-relaxed text-muted sm:mb-8 sm:text-base">
            {{ project.description }}
          </p>

          <!-- 底行：两栏图片，弹性填满卡片剩余高度，任意视口均一屏且左右等高。点击放大。 -->
          <div class="mt-auto flex min-h-0 flex-1 gap-3 sm:gap-4">
            <!-- 左栏 40%：上下两图按比例平分 -->
            <div class="flex w-2/5 min-h-0 flex-col gap-3 sm:gap-4">
              <img
                :src="project.images.col1_1"
                :alt="project.name"
                loading="lazy"
                class="w-full min-h-0 flex-1 cursor-zoom-in rounded-[40px] object-cover sm:rounded-[50px] md:rounded-[60px]"
                @click="zoomSrc = project.images.col1_1"
              />
              <img
                :src="project.images.col1_2"
                :alt="project.name"
                loading="lazy"
                class="w-full min-h-0 flex-[1.35] cursor-zoom-in rounded-[40px] object-cover sm:rounded-[50px] md:rounded-[60px]"
                @click="zoomSrc = project.images.col1_2"
              />
            </div>
            <!-- 右栏 60%：h-full 填满，与左栏天然等高 -->
            <div class="w-3/5 min-h-0">
              <img
                :src="project.images.col2"
                :alt="project.name"
                loading="lazy"
                class="h-full w-full cursor-zoom-in rounded-[40px] object-cover sm:rounded-[50px] md:rounded-[60px]"
                @click="zoomSrc = project.images.col2"
              />
            </div>
          </div>
    </div>

    <ImageLightbox :src="zoomSrc" @close="zoomSrc = null" />
  </div>
</template>