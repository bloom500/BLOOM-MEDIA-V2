<template>
  <section class="videoduo" aria-label="Ad showcase duo">
    <div ref="sectionEl" class="videoduo__inner">
      <div class="videoduo__frame videoduo__frame--a" :class="{ 'is-visible': visible }">
        <video
          ref="playerA"
          autoplay
          muted
          loop
          playsinline
          preload="metadata"
          class="videoduo__video"
          :src="currentA"
          @ended="nextA"
        />
      </div>
      <div class="videoduo__frame videoduo__frame--b" :class="{ 'is-visible': visible }">
        <video
          ref="playerB"
          autoplay
          muted
          loop
          playsinline
          preload="metadata"
          class="videoduo__video"
          :src="currentB"
          @ended="nextB"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const playlistA = ['/videos/ad1section2.mp4', '/videos/ad2section2.mp4']
const playlistB = ['/videos/ad3section2.mp4', '/videos/ad4section2.mp4']

const indexA = ref(0)
const indexB = ref(0)
const playerA = ref<HTMLVideoElement | null>(null)
const playerB = ref<HTMLVideoElement | null>(null)
const sectionEl = ref<HTMLElement | null>(null)
const visible = ref(false)

const currentA = computed(() => playlistA[indexA.value])
const currentB = computed(() => playlistB[indexB.value])

function nextA() {
  indexA.value = (indexA.value + 1) % playlistA.length
}
function nextB() {
  indexB.value = (indexB.value + 1) % playlistB.length
}

// See VideoMeshSection.vue for why we play() without any other mutation.
function tryPlay(v: HTMLVideoElement | null) {
  if (!v) return
  const promise = v.play()
  if (promise && typeof promise.catch === 'function') {
    promise.catch(() => { /* native policy */ })
  }
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!import.meta.client) return

  // Safari pipeline-ready delay — see VideoMeshSection.vue.
  setTimeout(() => {
    tryPlay(playerA.value)
    tryPlay(playerB.value)
  }, 100)

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (!entry) return
      if (entry.isIntersecting) {
        visible.value = true
        tryPlay(playerA.value)
        tryPlay(playerB.value)
      }
      else {
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
  justify-content: center;
  align-items: center;
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
  content-visibility: auto;
  contain-intrinsic-size: 380px 676px;
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
    contain-intrinsic-size: 44vw 78vw;
  }

  .videoduo__frame--b {
    transition-delay: 0.1s;
  }
}
</style>
