import { onMounted, readonly, ref, watch } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

const stored = readStoredTheme()

/**
 * Light/dark theme, persisted to localStorage and reflected on `<html>`
 * via the `data-theme` attribute (so both CSS-variable switchers and the
 * Tailwind `dark:` variant can react to the same source of truth).
 */
export function useTheme() {
  const theme = ref<Theme>(stored)

  function setTheme(next: Theme): void {
    theme.value = next
  }

  function toggle(): void {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  watch(theme, (value) => {
    localStorage.setItem(STORAGE_KEY, value)
    document.documentElement.dataset.theme = value
    document.documentElement.classList.toggle('dark', value === 'dark')
  })

  onMounted(applyToDom)

  return { theme: readonly(theme), setTheme, toggle }
}

function applyToDom(): void {
  document.documentElement.dataset.theme = themeInDom()
  document.documentElement.classList.toggle(
    'dark',
    themeInDom() === 'dark',
  )
}

function themeInDom(): Theme {
  return document.documentElement.dataset.theme === 'dark'
    ? 'dark'
    : 'light'
}

function readStoredTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}