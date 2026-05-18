<template>
  <section class="videomesh" aria-label="Video showcase">
    <div ref="frame" class="videomesh__frame" :class="{ 'is-visible': visible }">
      <!--
        autoplay + muted + playsinline = the only conditions Safari/iOS
        Chrome require for inline muted-autoplay. We bind src directly
        so the element is fully formed at parse time. preload=metadata
        loads enough to start playing without buffering the whole file.
      -->
      <video
        ref="player"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
        class="videomesh__video"
        :src="currentSrc"
        @ended="nextVideo"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

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

function tryPlay(v: HTMLVideoElement | null) {
  if (!v) return
  v.muted = true
  const doPlay = () => {
    const p = v.play()
    if (p && typeof p.catch === 'function') p.catch(() => {})
  }
  if (v.readyState === 0) {
    v.addEventListener('loadedmetadata', doPlay, { once: true })
  } else {
    doPlay()
  }
}

onMounted(() => {
  if (!import.meta.client) return

  tryPlay(player.value)

  // iOS Chrome/Safari: even muted autoplay requires a WebKit "user gesture
  // context". touchstart fires on the first scroll tap — invisible to the
  // user but enough to unlock autoplay for muted elements.
  document.addEventListener('touchstart', () => tryPlay(player.value), { once: true, passive: true })

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (!entry) return
      if (entry.isIntersecting) {
        visible.value = true
        tryPlay(player.value)
      } else if (player.value && !player.value.paused) {
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
  touch-action: pan-y;

  opacity: 0;
  transform: translateY(48px) scale(0.97);
  transition:
    opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  /*
   * content-visibility: auto on entrance allows the browser to skip
   * rendering this frame until it's near viewport. Major TBT win.
   */
}

.videomesh__frame.is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@media (max-width: 768px) {
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
