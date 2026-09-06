<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Project } from '../components/projects/ProjectsStack.vue'
import ProjectsStack from '../components/projects/ProjectsStack.vue'

const { t } = useI18n()

// computed：切换语言时 category/description 随 t() 更新。
const projects = computed<Project[]>(() => [
  {
    id: 1,
    name: 'Livetalking_Chat',
    category: t('projects.os'),
    description: t('projects.desc1'),
    link: 'https://github.com/zhansan379/Livetalking_Chat',
    images: {
      col1_1: '/projects/livetalk-2.png',
      col1_2: '/projects/livetalk-3.png',
      col2: '/projects/livetalk-main.png',
    },
  },
  {
    id: 2,
    name: 'boss-crawler-skill',
    category: t('projects.os'),
    description: t('projects.desc2'),
    link: 'https://github.com/zhansan379/boss-crawler-skill',
    images: {
      col1_1: '/projects/boss-img10.png',
      col1_2: '/projects/boss-img3.png',
      col2: '/projects/boss-img7.png',
    },
  },
])
</script>

<template>
  <div class="relative z-10 -mt-10 sm:-mt-12 md:-mt-14">
    <section
      class="flex flex-col rounded-t-[40px] bg-background pt-16 sm:rounded-t-[50px] sm:pt-20 md:rounded-t-[60px] md:pt-24"
    >
      <div class="mx-auto w-full max-w-6xl px-5 pb-24">
        <div class="mb-16 sm:mb-20 md:mb-28">
          <h1
            class="hero-heading text-center font-heading font-black uppercase leading-none tracking-tight"
            :style="{
              fontSize: 'clamp(2.25rem, 8vw, 96px)',
              // 给 Noto Serif SC 的大写 J 下探笔画留出空间，再用负 margin 抵消，不额外占版面。
              paddingBottom: '0.16em',
              marginBottom: '-0.16em',
            }"
          >
            {{ t('projects.heading') }}
          </h1>
        </div>

        <ProjectsStack :projects="projects" />
      </div>
    </section>
  </div>
</template>