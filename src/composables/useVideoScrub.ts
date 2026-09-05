import { onMounted, onUnmounted, ref, type Ref } from 'vue'

const SENSITIVITY = 0.8

/**
 * Mouse-scrub video player.
 *
 * Horizontal mouse movement on the window seeks the background video
 * forward/backward. A single in-flight seek is tracked so rapid movement
 * queues the latest target instead of flooding the element with seek calls.
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
  /** True while a seek is in flight; gates the next seek. */
  const seeking = ref(false)

  function clampToDuration(time: number, duration: number): number {
    return Math.min(Math.max(time, 0), duration)
  }

  /**
   * Advance toward the latest target time, but only when a seek isn't
   * already in flight. Reached from mousemove and again from `seeked`.
   */
  function requestSeek(): void {
    const video = videoRef.value
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0)
      return
    if (seeking.value) return

    const next = clampToDuration(targetTime.value, video.duration)
    if (Math.abs(next - video.currentTime) > 0.01) {
      seeking.value = true
      video.currentTime = next
    }
  }

  function onMouseMove(event: MouseEvent): void {
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

  onMounted(() => {
    window.addEventListener('mousemove', onMouseMove)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove)
  })

  return { onVideoSeeked }
}