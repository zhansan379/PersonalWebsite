<script setup lang="ts">
import { computed, ref } from 'vue'
import { useElementBounding, useScroll } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

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
          <div class="flex items-center justify-between">
            <span
              class="font-black text-foreground"
              :style="{
                fontSize: 'clamp(3rem, 10vw, 140px)',
                lineHeight: '0.9',
              }"
            >{{ String(i + 1).padStart(2, '0') }}</span>

            <div class="flex flex-col items-end gap-2 text-right">
              <span class="font-medium uppercase tracking-wider text-sm text-muted sm:text-base">
                {{ project.category }}
              </span>
              <span class="font-bold uppercase text-lg leading-tight text-foreground sm:text-xl md:text-2xl">
                {{ project.name }}
              </span>
            </div>

            <a
              :href="project.link"
              target="_blank"
              rel="noopener noreferrer"
              class="hidden shrink-0 rounded-full border-2 border-border px-8 py-3 font-medium uppercase tracking-widest text-sm text-secondary transition-colors hover:border-accent hover:text-accent sm:px-10 sm:py-3.5 sm:text-base md:inline-flex"
            >{{ t('projects.live') }}</a>
          </div>

          <!-- 项目描述 -->
          <p class="mb-6 max-w-2xl text-sm leading-relaxed text-muted sm:mb-8 sm:text-base">
            {{ project.description }}
          </p>

          <!-- 底行：两栏图片，弹性填满卡片剩余高度，任意视口均一屏且左右等高 -->
          <div class="mt-auto flex min-h-0 flex-1 gap-3 sm:gap-4">
            <!-- 左栏 40%：上下两图按比例平分 -->
            <div class="flex w-2/5 min-h-0 flex-col gap-3 sm:gap-4">
              <img
                :src="project.images.col1_1"
                :alt="project.name"
                loading="lazy"
                class="w-full min-h-0 flex-1 rounded-[40px] object-cover sm:rounded-[50px] md:rounded-[60px]"
              />
              <img
                :src="project.images.col1_2"
                :alt="project.name"
                loading="lazy"
                class="w-full min-h-0 flex-[1.35] rounded-[40px] object-cover sm:rounded-[50px] md:rounded-[60px]"
              />
            </div>
            <!-- 右栏 60%：h-full 填满，与左栏天然等高 -->
            <div class="w-3/5 min-h-0">
              <img
                :src="project.images.col2"
                :alt="project.name"
                loading="lazy"
                class="h-full w-full rounded-[40px] object-cover sm:rounded-[50px] md:rounded-[60px]"
              />
            </div>
          </div>
    </div>
  </div>
</template>