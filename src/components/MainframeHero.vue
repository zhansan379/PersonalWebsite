<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  DEFAULT_LOCALE,
  type SupportedLocale,
  supportsLocale,
} from '../i18n'
import { useTypewriter } from '../composables/useTypewriter'
import { useVideoScrub } from '../composables/useVideoScrub'

const VIDEO_SRC = '/video/mainframe-hero.mp4'

const EMAIL = '3084824007@qq.com'

const VIDEO_POSITION = '70% center'

const { t, locale } = useI18n()

const videoRef = ref<HTMLVideoElement | null>(null)
const { onVideoSeeked } = useVideoScrub(videoRef)

const menuOpen = ref(false)
const showPills = ref(false)
const copied = ref(false)

const navLinks = computed(() => [
  t('nav.labs'),
  t('nav.studio'),
  t('nav.openings'),
  t('nav.shop'),
])

const pillLabels = computed(() => [
  t('pills.pitch'),
  t('pills.work'),
  t('pills.hello'),
  t('pills.operate'),
])

const typewriterText = computed(() => t('typewriter') ?? '')
const { displayed, done } = useTypewriter(typewriterText)

// Show the language you'd switch *to*: "EN" when reading Chinese, "中文"
// when reading English.
const localeLabel = computed(() =>
  locale.value === 'zh-CN' ? 'EN' : '中文',
)

function toggleLocale(): void {
  const next: SupportedLocale =
    locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
  locale.value = next
  localStorage.setItem('locale', next)
  document.documentElement.lang = next
}

// Restore a saved choice, defaulting to Chinese.
const saved = localStorage.getItem('locale')
locale.value = supportsLocale(saved) ? saved : DEFAULT_LOCALE
document.documentElement.lang = locale.value

let pillsTimer: number | undefined

onMounted(() => {
  // Reveal the action pills shortly after load, independent of typing.
  pillsTimer = window.setTimeout(() => {
    showPills.value = true
  }, 400)
})

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
  <!-- Background video, scrubbed by horizontal mouse movement -->
  <video
    ref="videoRef"
    class="fixed inset-0 z-0 h-full w-full object-cover"
    :style="{ objectPosition: VIDEO_POSITION }"
    :src="VIDEO_SRC"
    muted
    playsinline
    preload="auto"
    @seeked="onVideoSeeked"
  ></video>

  <!-- Navbar -->
  <nav
    class="fixed inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4 text-black sm:px-8 sm:py-5"
  >
    <!-- Logo -->
    <a href="#" class="flex select-none items-center gap-3">
      <span
        class="text-[21px] tracking-tight sm:text-[26px]"
        :style="{ fontFamily: 'var(--font-heading)' }"
      >
        Goto®
      </span>
      <span
        class="select-none text-[25px] sm:text-[30px]"
        :style="{ letterSpacing: '-0.02em' }"
      >
        ✦
      </span>
    </a>

    <!-- Desktop nav links -->
    <div class="hidden items-center text-[23px] md:flex">
      <a
        v-for="(link, index) in navLinks"
        :key="link"
        href="#"
        class="transition-opacity hover:opacity-60"
      >
        <template v-if="index > 0">, </template>{{ link }}
      </a>
    </div>

    <!-- Language toggle + CTA + mobile hamburger -->
    <div class="flex items-center">
      <button
        type="button"
        class="mr-4 text-[15px] font-medium tracking-wide transition-opacity hover:opacity-60 sm:text-[17px] md:mr-6"
        :aria-label="localeLabel"
        @click="toggleLocale"
      >
        {{ localeLabel }}
      </button>

      <a
        href="#"
        class="mr-4 hidden text-[23px] underline underline-offset-2 transition-opacity hover:opacity-60 md:mr-0 md:inline-block"
      >
        {{ t('nav.contact') }}
      </a>

      <button
        class="flex flex-col items-center justify-center gap-[5px] p-1 md:hidden"
        type="button"
        :aria-expanded="menuOpen"
        :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
        @click="menuOpen = !menuOpen"
      >
        <span
          class="h-[2px] w-6 bg-black transition-transform duration-300"
          :class="menuOpen ? 'translate-y-[7px] rotate-45' : ''"
        ></span>
        <span
          class="h-[2px] w-6 bg-black transition-opacity duration-300"
          :class="menuOpen ? 'opacity-0' : ''"
        ></span>
        <span
          class="h-[2px] w-6 bg-black transition-transform duration-300"
          :class="menuOpen ? '-translate-y-[7px] -rotate-45' : ''"
        ></span>
      </button>
    </div>
  </nav>

  <!-- Mobile menu overlay -->
  <div
    class="pointer-events-auto fixed inset-0 z-[9] flex flex-col justify-center gap-8 bg-white/95 px-8 backdrop-blur-sm transition-opacity duration-300 md:hidden"
    :class="menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'"
  >
    <a
      v-for="link in navLinks"
      :key="link"
      href="#"
      class="text-[32px] font-medium text-black"
      @click="menuOpen = false"
    >
      {{ link }}
    </a>
    <a
      href="#"
      class="text-[32px] font-medium text-black underline underline-offset-2"
      @click="menuOpen = false"
    >
      {{ t('nav.contact') }}
    </a>
  </div>

  <!-- Hero content -->
  <main
    class="relative z-[1] flex h-screen flex-col justify-end overflow-hidden px-5 pb-12 sm:px-8 md:justify-center md:px-10 md:pb-0"
  >
    <div class="relative z-10 max-w-xl">
      <!-- Blurred intro label -->
      <p
        class="pointer-events-none mb-5 select-none sm:mb-6"
        :style="{
          fontSize: 'clamp(18px, 4vw, 26px)',
          lineHeight: '1.3',
          fontWeight: 400,
          color: '#000',
          filter: 'blur(1px)',
        }"
      >
        {{ t('intro.line1') }}<br />{{ t('intro.line2') }}
      </p>

      <!-- Typewriter line -->
      <p
        class="mb-5 text-black sm:mb-6"
        :style="{
          fontSize: 'clamp(18px, 4vw, 26px)',
          lineHeight: '1.35',
          fontWeight: 400,
          minHeight: '54px',
        }"
      >
        {{ displayed }}
        <span
          v-if="!done"
          class="ml-[2px] inline-block h-[1.1em] w-[2px] align-middle bg-black"
          style="animation: blink 1s step-end infinite"
        ></span>
      </p>

      <!-- Action pills -->
      <div
        class="flex flex-wrap gap-y-1"
        :class="showPills ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'"
        :style="{ transition: 'opacity 0.4s ease, transform 0.4s ease' }"
      >
        <a
          v-for="label in pillLabels"
          :key="label"
          href="#"
          class="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center whitespace-nowrap rounded-full border border-black/10 bg-white px-4 py-[0.3em] text-[13px] text-black transition-colors duration-200 hover:bg-black hover:text-white sm:px-5 sm:text-[15px]"
        >
          {{ label }}
        </a>

        <button
          type="button"
          class="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white bg-transparent px-4 py-[0.3em] text-[13px] text-white transition-colors duration-200 hover:bg-white hover:text-black sm:gap-3 sm:px-5 sm:text-[15px]"
          @click="copyEmail"
        >
          <span>
            {{ t('pills.reach') }}
            <span class="underline underline-offset-1">{{ EMAIL }}</span>
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
              x="2"
              y="2"
              width="7.5"
              height="7.5"
              rx="1"
              fill="none"
              stroke="currentColor"
              stroke-width="1.2"
            />
            <rect
              x="4.5"
              y="4.5"
              width="7.5"
              height="7.5"
              rx="1"
              fill="none"
              stroke="currentColor"
              stroke-width="1.2"
            />
          </svg>
          <svg
            v-else
            class="shrink-0"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 6.4 4.6 9 10 3.4"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
          </svg>
        </button>
      </div>
    </div>
  </main>
</template>