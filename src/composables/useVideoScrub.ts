import { onMounted, onUnmounted, ref, type Ref } from 'vue'

const SENSITIVITY = 0.8

/**
 * Mouse-scrub video player.
 *
 * Horizontal mouse movement on the window seeks the background video
 * forward/backward. To keep a full-screen (even optimized) source smooth:
 *   - seeks are coalesced to one per animation frame via requestAnimationFrame,
 *     so fast mousemove never floods the element with seek calls;
 *   - an IntersectionObserver gates all work while the video is off-screen
 *     (scrolled past), so we don't waste decode cycles on an invisible frame.
 */
export interface UseVideoScrub {
  /** Handler to attach to the video element's `@seeked` event. */
  onVideoSeeked: () => void
}

export function useVideoScrub(
  videoRef: Ref<HTMLVideoElement | null>,
): UseVideoScrub {
  /** Desired playback position, driven by mouse deltas. */
  const targetTime = ref(0)
  /** Previous pointer x, used to compute the delta. `null` until first move. */
  const prevX = ref<number | null>(null)
  /** True while a seek is in flight; gates the next real seek. */
  const seeking = ref(false)
  /** Pending rAF so multiple `requestSeek`s collapse into one per frame. */
  const rafPending = ref(false)
  /** Whether the element is currently on-screen (via IntersectionObserver). */
  const visible = ref(true)

  let observer: IntersectionObserver | undefined
  let rafId: number | undefined

  function clampToDuration(time: number, duration: number): number {
    return Math.min(Math.max(time, 0), duration)
  }

  /** The single seek that runs once per animation frame. */
  function doSeek(): void {
    rafPending.value = false
    rafId = undefined
    if (!visible.value || seeking.value) return
    const video = videoRef.value
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0)
      return

    const next = clampToDuration(targetTime.value, video.duration)
    if (Math.abs(next - video.currentTime) > 0.01) {
      seeking.value = true
      video.currentTime = next
    }
  }

  /** Coalesced seek request — at most one rAF is scheduled at a time. */
  function requestSeek(): void {
    if (!visible.value || rafPending.value) return
    rafPending.value = true
    rafId = requestAnimationFrame(doSeek)
  }

  function onMouseMove(event: MouseEvent): void {
    if (!visible.value) return
    const video = videoRef.value
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0)
      return

    // Ignore the first event so the pointer's resting position isn't
    // interpreted as a huge jump from 0.
    if (prevX.value === null) {
      prevX.value = event.clientX
      return
    }

    const delta = event.clientX - prevX.value
    prevX.value = event.clientX

    targetTime.value = clampToDuration(
      targetTime.value + (delta / window.innerWidth) * SENSITIVITY * video.duration,
      video.duration,
    )
    requestSeek()
  }

  function onVideoSeeked(): void {
    // Seek finished; if the target moved meanwhile, chase it.
    seeking.value = false
    requestSeek()
  }

  function onVisibility(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      visible.value = entry.isIntersecting
      // On return, reset the pointer baseline so the first move isn't a jump.
      if (visible.value) prevX.value = null
    }
  }

  onMounted(() => {
    window.addEventListener('mousemove', onMouseMove)
    observer = new IntersectionObserver(onVisibility, { threshold: 0.1 })
    if (videoRef.value) observer.observe(videoRef.value)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove)
    if (observer) observer.disconnect()
    if (rafId !== undefined) cancelAnimationFrame(rafId)
  })

  return { onVideoSeeked }
}