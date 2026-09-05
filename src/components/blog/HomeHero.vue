<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTypewriter } from '../../composables/useTypewriter'
import { useVideoScrub } from '../../composables/useVideoScrub'

const VIDEO_SRC = '/video/mainframe-hero@1080.mp4'
const EMAIL = '3084824007@qq.com'
const VIDEO_POSITION = '70% center'
/** 触屏设备取视频这个比例处的一帧做静态背景（不是循环播放）。 */
const CAPTURE_FRACTION = 0.4
/** 触屏判断：主指针是粗指针（手机/平板）→ 鼠标 scrub 不存在，改用静态帧背景。 */
const isTouch =
  typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches

const { t } = useI18n()

const videoRef = ref<HTMLVideoElement | null>(null)
const sectionRef = ref<HTMLElement | null>(null)
const { onVideoSeeked } = useVideoScrub(videoRef)

const introLines = computed(() => [t('hero.introLine1'), t('hero.introLine2')])
const typewriterText = computed(() => t('hero.typewriter') ?? '')
const { displayed, done } = useTypewriter(typewriterText)

const quickLinks = computed(() => [
  { to: { name: 'tags' }, label: t('blogNav.tags') },
  { to: { name: 'archive' }, label: t('blogNav.archive') },
  { to: { name: 'about' }, label: t('blogNav.about') },
])

const showPills = ref(false)
const copied = ref(false)
let pillsTimer: number | undefined

onMounted(() => {
  if (isTouch) captureStaticFrame()
  pillsTimer = window.setTimeout(() => {
    showPills.value = true
  }, 500)
})

/**
 * 触屏设备：不播放视频，而是 seek 到视频某一帧，用 canvas 截出来转成 data URL，
 * 作为整个 hero 的背景图，并隐藏 <video>。桌面（有鼠标）保持 scrub 取帧不变。
 */
function captureStaticFrame(): void {
  const video = videoRef.value
  if (!video) return
  const run = (): void => {
    if (video.readyState < 1) return
    video.pause()
    const dur = Number.isFinite(video.duration) ? video.duration : 0
    if (dur <= 0) return
    const paint = (): void => {
      video.removeEventListener('seeked', paint)
      try {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth || 1280
        canvas.height = video.videoHeight || 720
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        if (sectionRef.value) {
          sectionRef.value.style.backgroundImage = `url(${dataUrl})`
        }
      } catch {
        /* 截帧失败就保持现状（黑底），不阻塞页面。 */
      }
      video.style.visibility = 'hidden'
    }
    video.addEventListener('seeked', paint)
    video.currentTime = Math.max(0, Math.min(dur * CAPTURE_FRACTION, dur - 0.05))
  }
  if (video.readyState >= 1) run()
  else video.addEventListener('loadedmetadata', run, { once: true })
}

onUnmounted(() => {
  if (pillsTimer !== undefined) window.clearTimeout(pillsTimer)
})

async function copyEmail(): Promise<void> {
  try {
    await navigator.clipboard.writeText(EMAIL)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch {
    // Clipboard unavailable — leave state unchanged.
  }
}
</script>

<template>
  <section
    ref="sectionRef"
    class="relative flex min-h-[560px] w-full flex-col justify-end overflow-hidden bg-black"
    style="height: 92svh"
    :style="{ backgroundSize: 'cover', backgroundPosition: VIDEO_POSITION }"
  >
    <!-- Background video, scrubbed by horizontal mouse movement -->
    <video
      ref="videoRef"
      class="absolute inset-0 h-full w-full object-cover"
      :style="{ objectPosition: VIDEO_POSITION }"
      :src="VIDEO_SRC"
      muted
      playsinline
      preload="auto"
      @seeked="onVideoSeeked"
    ></video>

    <!-- Legibility scrim over the video -->
    <div
      class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/40"
    ></div>

    <!-- Hero content -->
    <div class="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 sm:pb-20">
      <!-- Blurred intro label -->
      <p
        v-if="introLines.length"
        class="pointer-events-none mb-4 select-none text-white/80"
        :style="{
          fontSize: 'clamp(17px, 3.6vw, 24px)',
          lineHeight: '1.4',
          filter: 'blur(0.5px)',
        }"
      >
        {{ introLines[0] }}<br />{{ introLines[1] }}
      </p>

      <!-- Typewriter headline -->
      <p
        class="max-w-2xl text-white"
        :style="{
          fontSize: 'clamp(26px, 6vw, 46px)',
          lineHeight: '1.2',
          fontWeight: 600,
          fontFamily: 'var(--font-heading)',
          letterSpacing: '-0.01em',
        }"
      >
        {{ displayed }}
        <span
          v-if="!done"
          class="ml-1 inline-block h-[0.95em] w-[2px] translate-y-[0.1em] bg-white"
          style="animation: blink 1s step-end infinite"
        ></span>
      </p>

      <!-- Quick links + email -->
      <div
        class="mt-9 flex flex-wrap items-center gap-2"
        :class="showPills ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'"
        :style="{ transition: 'opacity 0.4s ease, transform 0.4s ease' }"
      >
        <RouterLink
          v-for="link in quickLinks"
          :key="link.to.name"
          :to="link.to"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-white/35 bg-black/20 px-5 py-2 text-sm text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white hover:text-black"
        >
          {{ link.label }}
        </RouterLink>

        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-5 py-2 text-sm text-black transition-colors duration-200 hover:bg-black hover:text-white"
          @click="copyEmail"
        >
          <span>
            {{ t('hero.reach') }}
            <span class="underline underline-offset-2">{{ EMAIL }}</span>
          </span>
          <svg
            v-if="!copied"
            class="shrink-0"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="2" y="2" width="7.5" height="7.5" rx="1"
              fill="none" stroke="currentColor" stroke-width="1.2"
            />
            <rect
              x="4.5" y="4.5" width="7.5" height="7.5" rx="1"
              fill="none" stroke="currentColor" stroke-width="1.2"
            />
          </svg>
          <svg
            v-else
            class="shrink-0"
            width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"
          >
            <path
              d="M2 6.4 4.6 9 10 3.4"
              stroke="currentColor" stroke-width="1.4" stroke-linecap="round"
              stroke-linejoin="round" fill="none"
            />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>