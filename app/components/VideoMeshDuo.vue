<template>
  <section class="videoduo" aria-label="Ad showcase duo">
    <div ref="sectionEl" class="videoduo__inner">

      <!-- Player A: ad1section2 → ad2section2 -->
      <div class="videoduo__frame videoduo__frame--a" :class="{ 'is-visible': visible }">
        <video
          ref="playerA"
          muted
          playsinline
          preload="none"
          class="videoduo__video"
          aria-hidden="true"
          @ended="nextA"
        >
          <source v-if="visible && currentA.webm" :src="currentA.webm" type="video/webm" />
          <source v-if="visible" :src="currentA.mp4" type="video/mp4" />
        </video>
      </div>

      <!-- Player B: ad3section2 → ad4section2 -->
      <div class="videoduo__frame videoduo__frame--b" :class="{ 'is-visible': visible }">
        <video
          ref="playerB"
          muted
          playsinline
          preload="none"
          class="videoduo__video"
          aria-hidden="true"
          @ended="nextB"
        >
          <source v-if="visible && currentB.webm" :src="currentB.webm" type="video/webm" />
          <source v-if="visible" :src="currentB.mp4" type="video/mp4" />
        </video>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

/*
 * Each playlist entry has both formats. WebM is omitted (null) where the
 * VP9 re-encode came out larger than the source — only ad1section2 had a
 * useful WebM payload after conversion. See scripts/convert-videos-webm.ps1.
 */
const playlistA = [
  { mp4: '/videos/ad1section2.mp4', webm: '/videos/ad1section2.webm' },
  { mp4: '/videos/ad2section2.mp4', webm: null },
]
const playlistB = [
  { mp4: '/videos/ad3section2.mp4', webm: '/videos/ad3section2.webm' },
  { mp4: '/videos/ad4section2.mp4', webm: null },
]

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

watch(currentA, async () => {
  const v = playerA.value
  if (!v) return
  if (!visible.value) return
  v.load()
  await v.play().catch(() => {})
})

watch(currentB, async () => {
  const v = playerB.value
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
        nextTick(() => {
          for (const v of [playerA.value, playerB.value]) {
            if (!v) continue
            v.load()
            v.play().catch(() => {})
          }
        })
      }
    },
    { threshold: 0.15 }
  )
  if (sectionEl.value) observer.observe(sectionEl.value)
})

onUnmounted(() => observer?.disconnect())
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
  /* Allow vertical scroll to pass through on touch — see VideoMeshSection. */
  touch-action: pan-y;

  /* entrance state */
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
  }
}
</style>
