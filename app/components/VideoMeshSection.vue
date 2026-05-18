<template>
  <section class="videomesh" aria-label="Video showcase">
    <div ref="frame" class="videomesh__frame" :class="{ 'is-visible': visible }">
      <video
        ref="player"
        autoplay
        muted
        loop
        playsinline
        webkit-playsinline
        preload="auto"
        class="videomesh__video"
        :src="currentSrc"
        @ended="nextVideo"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

/*
 * Single MP4 source per playlist entry. Audio is stripped at build time
 * (scripts/strip-audio-mp4.ps1), so we can rely entirely on the browser's
 * native autoplay-muted policy. No play() calls, no forcePlay() retries,
 * no watchdog interval — every JS intervention we tried turned out to
 * sabotage the very autoplay it was meant to recover. On Safari (macOS
 * + iOS), mutating currentTime programmatically is treated as a
 * user-mediated seek and disables autoplay-muted on subsequent play().
 *
 * The simplest possible markup IS the most reliable: <video autoplay
 * muted loop playsinline> with a direct src binding. The browser will
 * autoplay because all four conditions of the spec heuristic are met
 * declaratively at parse time.
 */
const playlist = [
  '/videos/ad1demo.mp4',
  '/videos/ad2demo.mp4',
  '/videos/ad3demo.mp4',
  '/videos/ad4demo.mp4',
]

const index = ref(0)
const player = ref<HTMLVideoElement | null>(null)
const frame = ref<HTMLElement | null>(null)
const visible = ref(false)

const currentSrc = computed(() => playlist[index.value])

function nextVideo() {
  index.value = (index.value + 1) % playlist.length
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!import.meta.client) return

  /*
   * Visibility observer drives ONLY two things:
   *  - .is-visible class for the entrance animation
   *  - pause() when the player goes off-screen (perf: stops decoder work
   *    when the user isn't looking at it)
   *  - resume play() when it comes back. Browser still has the muted+
   *    autoplay flags so the resumed play() succeeds without gestures.
   */
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (!entry) return
      if (entry.isIntersecting) {
        visible.value = true
        const v = player.value
        if (v && v.paused) v.play().catch(() => { /* native policy handles it */ })
      }
      else if (player.value && !player.value.paused) {
        player.value.pause()
      }
    },
    { threshold: 0.1 }
  )
  if (frame.value) observer.observe(frame.value)
})

onUnmounted(() => {
  observer?.disconnect()
  observer = null
})
</script>

<style scoped>
.videomesh {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8vw 8vw;
  background: transparent;
}

.videomesh__frame {
  width: min(680px, 80vw);
  aspect-ratio: 1 / 1;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  /*
   * Let vertical scroll pass through the video element on touch devices.
   * Without this iOS Safari can intercept swipes that begin on the video
   * and treat them as media-control gestures.
   */
  touch-action: pan-y;

  /* entrance state */
  opacity: 0;
  transform: translateY(48px) scale(0.97);
  transition:
    opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

.videomesh__frame.is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@media (max-width: 768px) {
  /*
   * Soften the entrance on touch: shorter travel, no scale (which felt
   * snappy/poppy on small screens), longer easing for a calmer feel.
   */
  .videomesh__frame {
    transform: translateY(20px) scale(1);
    transition:
      opacity 1.1s cubic-bezier(0.22, 1, 0.36, 1),
      transform 1.1s cubic-bezier(0.22, 1, 0.36, 1);
  }
}

.videomesh__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0.9;
  filter: saturate(1.25) contrast(1.1);
}

@media (max-width: 600px) {
  .videomesh {
    padding: 12vw 6vw;
  }

  .videomesh__frame {
    width: 88vw;
  }
}
</style>
