<template>
  <section class="videomesh" aria-label="Video showcase">
    <div ref="frame" class="videomesh__frame" :class="{ 'is-visible': visible }">
      <video
        ref="player"
        muted
        playsinline
        preload="none"
        class="videomesh__video"
        aria-hidden="true"
        @ended="nextVideo"
      >
        <!--
          Dual-format: WebM (VP9) preferred for smaller payload on modern
          browsers, MP4 (H.264) as universal fallback. Browser picks the
          first <source> it can decode. v-if="visible" defers the actual
          download until the section enters the viewport.
        -->
        <source v-if="visible && currentWebm" :src="currentWebm" type="video/webm" />
        <source v-if="visible" :src="currentMp4" type="video/mp4" />
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

watch(currentMp4, async () => {
  const v = player.value
  if (!v) return
  if (!visible.value) return
  v.load()
  await v.play().catch(() => {})
})

let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        visible.value = true
        observer?.disconnect()
        // Kick off load + play once we're actually visible.
        nextTick(() => {
          const v = player.value
          if (!v) return
          v.load()
          v.play().catch(() => {})
        })
      }
    },
    { threshold: 0.2 }
  )
  if (frame.value) observer.observe(frame.value)
})

onUnmounted(() => observer?.disconnect())
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
