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
        disablePictureInPicture
        preload="metadata"
        class="videomesh__video"
        aria-hidden="true"
        @ended="nextVideo"
      >
        <!--
          Sources are always rendered (no v-if) so iOS Safari/Chrome
          register them at parse time and autoplay works without a
          manual .load(). preload="metadata" keeps the network footprint
          tiny until IntersectionObserver triggers a play.
        -->
        <source v-if="currentWebm" :src="currentWebm" type="video/webm" />
        <source :src="currentMp4" type="video/mp4" />
      </video>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

/*
 * Each entry has both formats. WebM is omitted (null) for clips where the
 * VP9 re-encode came out larger than the source — MP4 wins for those.
 * See scripts/convert-videos-webm.ps1 for the conversion pipeline.
 */
const playlist = [
  { mp4: '/videos/ad1demo.mp4', webm: '/videos/ad1demo.webm' },
  { mp4: '/videos/ad2demo.mp4', webm: '/videos/ad2demo.webm' },
  { mp4: '/videos/ad3demo.mp4', webm: null }, // WebM larger than source
  { mp4: '/videos/ad4demo.mp4', webm: '/videos/ad4demo.webm' },
]

const index = ref(0)
const player = ref<HTMLVideoElement | null>(null)
const frame = ref<HTMLElement | null>(null)
const visible = ref(false)

const currentMp4 = computed(() => playlist[index.value].mp4)
const currentWebm = computed(() => playlist[index.value].webm)

function nextVideo() {
  index.value = (index.value + 1) % playlist.length
}

/*
 * iOS playback is finicky: muted+autoplay+playsinline is supposed to be
 * enough, but iOS Safari/Chrome routinely pause inline videos when the
 * tab returns from background, after `currentTime` mutations, etc.
 * forcePlay() recovers from that by nudging currentTime and retrying
 * play(); a watchdog interval catches paused state every 1.5s on iOS.
 *
 * Pattern matches BLOOM-MEDIA-WEBFINAL/Hero.svelte.
 */
let watchdog: ReturnType<typeof setInterval> | null = null
let isResuming = false

async function forcePlay() {
  const v = player.value
  if (!v || isResuming) return
  isResuming = true
  try {
    const t = v.currentTime
    v.currentTime = t + 0.001
    v.muted = true
    v.playsInline = true
    await new Promise(r => setTimeout(r, 50))
    await v.play()
  }
  catch {
    try {
      const t = v.currentTime
      v.load()
      v.currentTime = t
      v.muted = true
      await v.play()
    } catch { /* silent */ }
  } finally {
    isResuming = false
  }
}

watch(currentMp4, () => {
  // Source change → trigger metadata reload then play. forcePlay is
  // safer than .play() directly because iOS may still be in an
  // ambiguous "paused-but-not-really" state after a source swap.
  const v = player.value
  if (!v || !visible.value) return
  v.load()
  forcePlay()
})

let observer: IntersectionObserver | null = null
let onVisibility: (() => void) | null = null
let onPageShow: (() => void) | null = null

onMounted(() => {
  if (!import.meta.client) return

  /*
   * iOS muted-autoplay quirk: the `muted` HTML attribute alone is
   * sometimes not enough — iOS Safari/Chrome occasionally refuse autoplay
   * unless the property AND `defaultMuted` are both set as JS properties
   * before play() is called. Set them as soon as the element exists.
   */
  const v = player.value
  if (v) {
    v.muted = true
    v.defaultMuted = true
    v.playsInline = true
    // Try an early play() — covers the case where the section is in
    // viewport from the start (e.g. user lands directly on it via #hash).
    v.play().catch(() => { /* will retry via observer / forcePlay */ })
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        visible.value = true
        observer?.disconnect()
        observer = null
        nextTick(() => forcePlay())
      }
    },
    { threshold: 0.15 }
  )
  if (frame.value) observer.observe(frame.value)

  // iOS pauses media when the tab is backgrounded. Resume on return.
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  onVisibility = () => {
    if (!document.hidden && player.value?.paused && visible.value) {
      setTimeout(forcePlay, isIOS ? 300 : 150)
    }
  }
  document.addEventListener('visibilitychange', onVisibility)

  // Safari fires pageshow when the user navigates back via swipe/cache.
  onPageShow = () => {
    if (player.value?.paused && visible.value) {
      setTimeout(forcePlay, isIOS ? 300 : 150)
    }
  }
  window.addEventListener('pageshow', onPageShow)

  // Last-resort watchdog only on iOS where pauses can come out of
  // nowhere (audio session interruptions, lock screen, etc.).
  if (isIOS) {
    watchdog = setInterval(() => {
      if (!document.hidden && player.value && visible.value
          && (player.value.paused || player.value.ended)) {
        forcePlay()
      }
    }, 1500)
  }
})

onUnmounted(() => {
  observer?.disconnect()
  observer = null
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
  if (onPageShow) window.removeEventListener('pageshow', onPageShow)
  if (watchdog) clearInterval(watchdog)
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
