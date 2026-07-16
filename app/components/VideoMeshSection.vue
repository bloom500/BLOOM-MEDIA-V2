<template>
  <section class="videomesh" aria-label="Video showcase">
    <div ref="frame" class="videomesh__frame" :class="{ 'is-visible': visible }">
      <!--
        autoplay + muted + playsinline = the only conditions Safari/iOS
        Chrome require for inline muted-autoplay. Source order: WebM first
        (much smaller — saves ~10MB on the heavy ads) with MP4 fallback
        for Safari < 14. preload="none" until in-viewport; switched to
        "auto" by IntersectionObserver to avoid burning bandwidth on 4
        videos at parse time.
      -->
      <video
        :key="index"
        ref="player"
        autoplay
        muted
        playsinline
        :preload="warm ? 'auto' : 'none'"
        class="videomesh__video"
        @ended="nextVideo"
      >
        <source v-if="currentWebm" :src="currentWebm" type="video/webm" />
        <source :src="currentMp4" type="video/mp4" />
      </video>
    </div>
    <p class="videomesh__note">Video demo — concept creat de noi, nu campanie de client</p>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

/*
 * Each entry: webm (preferred, smaller) + mp4 (fallback). Missing webm =
 * skip the WebM source tag so the browser goes straight to MP4 instead
 * of throwing a decode error and retrying.
 */
const playlist: Array<{ webm: string | null; mp4: string }> = [
  { webm: '/videos/ad1demo.webm', mp4: '/videos/ad1demo.mp4' },
  { webm: '/videos/ad2demo.webm', mp4: '/videos/ad2demo.mp4' },
  // webm: null intenționat — VP9 iese mai mare decât MP4-ul deja comprimat.
  { webm: null,                   mp4: '/videos/ad3demo.mp4' },
  { webm: '/videos/ad4demo.webm', mp4: '/videos/ad4demo.mp4' },
  { webm: null,                   mp4: '/videos/ad6demo.mp4' },
]

const index = ref(0)
const player = ref<HTMLVideoElement | null>(null)
const frame = ref<HTMLElement | null>(null)
const visible = ref(false)
/*
 * warm = fetch+decode pornit cu ~2 viewporturi înainte de intrare. Cu
 * preload legat de `visible` (threshold 0.1) descărcarea începea abia când
 * videoul era DEJA pe ecran — hitch-ul de decode se vedea exact în secunda
 * apariției, în plin scroll.
 */
const warm = ref(false)

const currentWebm = computed(() => playlist[index.value]?.webm ?? null)
const currentMp4 = computed(() => playlist[index.value]?.mp4 ?? '')

function nextVideo() {
  index.value = (index.value + 1) % playlist.length
}

let observer: IntersectionObserver | null = null
let warmObserver: IntersectionObserver | null = null

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

  warmObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        warm.value = true
        warmObserver?.disconnect()
        warmObserver = null
      }
    },
    // Mobil (pointer coarse): ~4.6MB de video porneau la load cu 200% —
    // pe date mobile e risipă; 75% = tot pre-încărcat înainte de intrare.
    { rootMargin: window.matchMedia('(pointer: coarse)').matches ? '75% 0px' : '200% 0px' }
  )
  if (frame.value) warmObserver.observe(frame.value)
})

onUnmounted(() => {
  observer?.disconnect()
  observer = null
  warmObserver?.disconnect()
  warmObserver = null
})
</script>

<style scoped>
.videomesh {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
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

.videomesh__note {
  font-family: var(--font-body);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  margin: 0;
  text-align: center;
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
