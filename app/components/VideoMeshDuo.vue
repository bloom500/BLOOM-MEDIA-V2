<template>
  <section class="videoduo" aria-label="Ad showcase duo">
    <div ref="sectionEl" class="videoduo__inner">
      <div class="videoduo__frame videoduo__frame--a" :class="{ 'is-visible': visible }">
        <video
          :key="`a-${indexA}`"
          ref="playerA"
          autoplay
          muted
          loop
          playsinline
          :preload="visible ? 'auto' : 'none'"
          class="videoduo__video"
          @ended="nextA"
        >
          <source v-if="currentA.webm" :src="currentA.webm" type="video/webm" />
          <source :src="currentA.mp4" type="video/mp4" />
        </video>
      </div>
      <div class="videoduo__frame videoduo__frame--b" :class="{ 'is-visible': visible }">
        <video
          :key="`b-${indexB}`"
          ref="playerB"
          autoplay
          muted
          loop
          playsinline
          :preload="visible ? 'auto' : 'none'"
          class="videoduo__video"
          @ended="nextB"
        >
          <source v-if="currentB.webm" :src="currentB.webm" type="video/webm" />
          <source :src="currentB.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

/*
 * WebM-first with MP4 fallback. ad2section2 and ad4section2 don't have
 * WebM encodes — webm:null tells the template to skip the WebM <source>
 * tag so the browser doesn't waste a request on a missing file.
 */
type VideoEntry = { webm: string | null; mp4: string }
const playlistA: VideoEntry[] = [
  { webm: '/videos/ad1section2.webm', mp4: '/videos/ad1section2.mp4' },
  { webm: null,                       mp4: '/videos/ad2section2.mp4' },
]
const playlistB: VideoEntry[] = [
  { webm: '/videos/ad3section2.webm', mp4: '/videos/ad3section2.mp4' },
  { webm: null,                       mp4: '/videos/ad4section2.mp4' },
]

const indexA = ref(0)
const indexB = ref(0)
const playerA = ref<HTMLVideoElement | null>(null)
const playerB = ref<HTMLVideoElement | null>(null)
const sectionEl = ref<HTMLElement | null>(null)
const visible = ref(false)

const currentA = computed(() => playlistA[indexA.value] ?? playlistA[0])
const currentB = computed(() => playlistB[indexB.value] ?? playlistB[0])

function nextA() {
  indexA.value = (indexA.value + 1) % playlistA.length
}
function nextB() {
  indexB.value = (indexB.value + 1) % playlistB.length
}

function tryPlay(v: HTMLVideoElement | null) {
  if (!v) return
  v.muted = true  // iOS Safari SPA fix — see VideoMeshSection.vue
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

let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!import.meta.client) return

  tryPlay(playerA.value)
  tryPlay(playerB.value)

  // iOS unlock — same pattern as VideoMeshSection
  document.addEventListener('touchstart', () => {
    tryPlay(playerA.value)
    tryPlay(playerB.value)
  }, { once: true, passive: true })

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (!entry) return
      if (entry.isIntersecting) {
        visible.value = true
        tryPlay(playerA.value)
        tryPlay(playerB.value)
      } else {
        for (const v of [playerA.value, playerB.value]) {
          if (v && !v.paused) v.pause()
        }
      }
    },
    { threshold: 0.1 }
  )
  if (sectionEl.value) observer.observe(sectionEl.value)
})

onUnmounted(() => {
  observer?.disconnect()
  observer = null
})
</script>

<style scoped>
.videoduo {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  padding: 14rem 8vw;
  background: transparent;
}

.videoduo__inner {
  display: flex;
  flex-direction: row;
  gap: clamp(4rem, 10vw, 10rem);
  align-items: center;
  justify-content: center;
}

.videoduo__frame {
  width: min(380px, 30vw);
  aspect-ratio: 9 / 16;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  touch-action: pan-y;

  opacity: 0;
  transform: translateY(48px) scale(0.97);
  transition:
    opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

.videoduo__frame--b {
  transition-delay: 0.15s;
}

.videoduo__frame.is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.videoduo__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0.9;
  filter: saturate(1.25) contrast(1.1);
}

@media (max-width: 768px) {
  .videoduo {
    padding: 8rem 6vw;
  }

  .videoduo__frame {
    width: min(200px, 44vw);
    transform: translateY(20px) scale(1);
    transition:
      opacity 1.1s cubic-bezier(0.22, 1, 0.36, 1),
      transform 1.1s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .videoduo__frame--b {
    transition-delay: 0.1s;
  }
}
</style>
