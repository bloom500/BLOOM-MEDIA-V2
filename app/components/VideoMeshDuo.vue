<template>
  <section class="videoduo" aria-label="Ad showcase duo">
    <div ref="sectionEl" class="videoduo__inner">

      <!-- Player A: ad1section2 → ad2section2 -->
      <div class="videoduo__frame videoduo__frame--a" :class="{ 'is-visible': visible }">
        <video
          ref="playerA"
          autoplay
          muted
          loop
          playsinline
          webkit-playsinline
          disablePictureInPicture
          preload="metadata"
          class="videoduo__video"
          aria-hidden="true"
          @ended="nextA"
        >
          <source v-if="currentA.webm" :src="currentA.webm" type="video/webm" />
          <source :src="currentA.mp4" type="video/mp4" />
        </video>
      </div>

      <!-- Player B: ad3section2 → ad4section2 -->
      <div class="videoduo__frame videoduo__frame--b" :class="{ 'is-visible': visible }">
        <video
          ref="playerB"
          autoplay
          muted
          loop
          playsinline
          webkit-playsinline
          disablePictureInPicture
          preload="metadata"
          class="videoduo__video"
          aria-hidden="true"
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

/*
 * iOS playback hardening — same pattern as VideoMeshSection.
 */
let watchdog: ReturnType<typeof setInterval> | null = null
let isResumingA = false
let isResumingB = false

async function forcePlay(v: HTMLVideoElement | null, lock: 'A' | 'B') {
  if (!v) return
  if (lock === 'A' && isResumingA) return
  if (lock === 'B' && isResumingB) return
  if (lock === 'A') isResumingA = true
  else isResumingB = true
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
    if (lock === 'A') isResumingA = false
    else isResumingB = false
  }
}

watch(currentA, () => {
  const v = playerA.value
  if (!v || !visible.value) return
  v.load()
  forcePlay(v, 'A')
})

watch(currentB, () => {
  const v = playerB.value
  if (!v || !visible.value) return
  v.load()
  forcePlay(v, 'B')
})

let observer: IntersectionObserver | null = null
let onVisibility: (() => void) | null = null
let onPageShow: (() => void) | null = null

onMounted(() => {
  if (!import.meta.client) return

  /*
   * iOS muted-autoplay hardening — see VideoMeshSection note. Set the
   * muted properties as JS properties (not just HTML attributes) on
   * both players before any play() attempt.
   */
  for (const v of [playerA.value, playerB.value]) {
    if (!v) continue
    v.muted = true
    v.defaultMuted = true
    v.playsInline = true
    v.play().catch(() => { /* observer / forcePlay handles retry */ })
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        visible.value = true
        observer?.disconnect()
        observer = null
        nextTick(() => {
          forcePlay(playerA.value, 'A')
          forcePlay(playerB.value, 'B')
        })
      }
    },
    { threshold: 0.15 }
  )
  if (sectionEl.value) observer.observe(sectionEl.value)

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  onVisibility = () => {
    if (document.hidden || !visible.value) return
    setTimeout(() => {
      if (playerA.value?.paused) forcePlay(playerA.value, 'A')
      if (playerB.value?.paused) forcePlay(playerB.value, 'B')
    }, isIOS ? 300 : 150)
  }
  document.addEventListener('visibilitychange', onVisibility)

  onPageShow = () => {
    if (!visible.value) return
    setTimeout(() => {
      if (playerA.value?.paused) forcePlay(playerA.value, 'A')
      if (playerB.value?.paused) forcePlay(playerB.value, 'B')
    }, isIOS ? 300 : 150)
  }
  window.addEventListener('pageshow', onPageShow)

  if (isIOS) {
    watchdog = setInterval(() => {
      if (document.hidden || !visible.value) return
      const a = playerA.value
      const b = playerB.value
      if (a && (a.paused || a.ended)) forcePlay(a, 'A')
      if (b && (b.paused || b.ended)) forcePlay(b, 'B')
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
    /* Soft entrance on touch — see VideoMeshSection note. */
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
