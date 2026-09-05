import { onUnmounted, ref, watch, type Ref } from 'vue'

export interface UseTypewriter {
  /** The text revealed so far. */
  displayed: Ref<string>
  /** True once the full text has been revealed. */
  done: Ref<boolean>
}

/**
 * Reveals `text` one character at a time.
 *
 * Reacts to changes in `text` (e.g. a locale switch): each new value is reset
 * and typed out again after `startDelay` ms, appending a character every
 * `speed` ms until the whole string is shown.
 */
export function useTypewriter(
  text: Ref<string>,
  speed = 38,
  startDelay = 600,
): UseTypewriter {
  const displayed = ref('')
  const done = ref(false)

  let delayTimer: number | undefined
  let interval: number | undefined

  function stop(): void {
    if (delayTimer !== undefined) {
      window.clearTimeout(delayTimer)
      delayTimer = undefined
    }
    if (interval !== undefined) {
      window.clearInterval(interval)
      interval = undefined
    }
  }

  function start(target: string): void {
    stop()
    displayed.value = ''
    done.value = false

    delayTimer = window.setTimeout(() => {
      let index = 0
      interval = window.setInterval(() => {
        index += 1
        displayed.value = target.slice(0, index)
        if (index >= target.length) {
          done.value = true
          window.clearInterval(interval)
          interval = undefined
        }
      }, speed)
    }, startDelay)
  }

  // `immediate` covers the first render; subsequent fires handle locale
  // switches mid-session.
  watch(text, (next) => start(next), { immediate: true })

  onUnmounted(stop)

  return { displayed, done }
}