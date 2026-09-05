<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { supportsLocale, type SupportedLocale } from '../i18n'
import { useTheme } from '../composables/useTheme'

const { t, locale } = useI18n()
const { theme, toggle } = useTheme()

const menuOpen = ref(false)

// Restore a saved locale, restoring DOM lang too (App mounts after).
const saved = localStorage.getItem('locale')
if (supportsLocale(saved)) {
  locale.value = saved
}
document.documentElement.lang = locale.value

const localeLabel = computed(() =>
  locale.value === 'zh-CN' ? 'EN' : '中文',
)

const navItems = computed(() => [
  { to: { name: 'home' }, label: t('blogNav.home') },
  { to: { name: 'tags' }, label: t('blogNav.tags') },
  { to: { name: 'archive' }, label: t('blogNav.archive') },
  { to: { name: 'vault-index' }, label: t('blogNav.vault') },
  { to: { name: 'projects' }, label: t('blogNav.projects') },
  { to: { name: 'about' }, label: t('blogNav.about') },
])

function toggleLocale(): void {
  const next: SupportedLocale =
    locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
  locale.value = next
  localStorage.setItem('locale', next)
  document.documentElement.lang = next
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background font-body text-foreground antialiased transition-colors duration-300 dark:bg-background-dark dark:text-foreground-dark">
    <!-- Topbar -->
    <header class="sticky top-0 z-40 border-b border-border backdrop-blur-md dark:border-border-dark">
      <nav class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <RouterLink
          :to="{ name: 'home' }"
          class="font-heading text-lg font-semibold tracking-tight"
        >
          Goto<span class="align-super text-[0.55em] text-accent">®</span>
        </RouterLink>

        <!-- Desktop nav -->
        <div class="hidden items-center gap-8 text-[0.95rem] md:flex">
          <RouterLink
            v-for="item in navItems"
            :key="item.label"
            :to="item.to"
            class="nav-link text-secondary transition-colors hover:text-accent dark:text-secondary-dark"
          >
            {{ item.label }}
          </RouterLink>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <a
            href="https://github.com/zhansan379/PersonalWebsite"
            target="_blank"
            rel="noopener noreferrer"
            class="grid h-9 w-9 place-items-center rounded-full border border-border text-sm text-secondary transition-colors hover:border-accent hover:text-accent dark:border-border-dark dark:text-secondary-dark"
            :aria-label="t('nav.github')"
            :title="t('nav.github')"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.66.41.36.77 1.05.77 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.2.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" /></svg>
          </a>
          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-full border border-border text-sm transition-colors hover:border-accent dark:border-border-dark"
            :aria-label="theme === 'light' ? 'Switch to dark' : 'Switch to light'"
            @click="toggle"
          >
            <!-- Lucide Moon / Sun (no emoji icons) -->
            <svg
              v-if="theme === 'light'"
              xmlns="http://www.w3.org/2000/svg"
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
            ><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
            ><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
          </button>

          <button
            type="button"
            class="font-mono text-xs uppercase tracking-wider transition-opacity hover:opacity-70"
            @click="toggleLocale"
          >
            {{ localeLabel }}
          </button>

          <!-- Mobile hamburger -->
          <button
            type="button"
            class="flex flex-col items-center justify-center gap-[5px] p-1 md:hidden"
            :aria-expanded="menuOpen"
            :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
            @click="menuOpen = !menuOpen"
          >
            <span
              class="h-px w-6 bg-current transition-transform duration-300"
              :class="menuOpen ? 'translate-y-[6px] rotate-45' : ''"
            ></span>
            <span
              class="h-px w-6 bg-current transition-opacity duration-300"
              :class="menuOpen ? 'opacity-0' : ''"
            ></span>
            <span
              class="h-px w-6 bg-current transition-transform duration-300"
              :class="menuOpen ? '-translate-y-[6px] -rotate-45' : ''"
            ></span>
          </button>
        </div>
      </nav>

      <!-- Mobile menu -->
      <transition name="fade">
        <div
          v-if="menuOpen"
          class="border-t border-border px-5 py-4 md:hidden dark:border-border-dark"
        >
          <ul class="flex flex-col gap-4">
            <li v-for="item in navItems" :key="item.label" @click="menuOpen = false">
              <RouterLink
                :to="item.to"
                class="text-lg text-secondary transition-colors hover:text-accent dark:text-secondary-dark"
              >
                {{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </transition>
    </header>

    <!-- Page content: each view manages its own full-bleed / centered containers -->
    <main class="flex flex-1 flex-col">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="border-t border-border pb-10 pt-8 dark:border-border-dark">
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-xs text-muted sm:flex-row dark:text-muted-dark">
        <span>© {{ new Date().getFullYear() }} <span class="font-heading">Goto</span></span>
        <span class="font-mono">{{ t('footer.tagline') }}</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Active nav link */
:deep(.nav-link.router-link-exact-active),
:deep(.nav-link.router-link-active) {
  color: var(--color-accent);
}
</style>