<template>
  <section class="videomesh" aria-label="Video showcase">
    <div ref="frame" class="videomesh__frame" :class="{ 'is-visible': visible }">
      <video
        ref="player"
        autoplay
        muted
        playsinline
        preload="auto"
        class="videomesh__video"
        aria-hidden="true"
        @ended="nextVideo"
      >
        <source :src="currentSrc" type="video/mp4" />
      </video>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

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

watch(currentSrc, async () => {
  const v = player.value
  if (!v) return
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
