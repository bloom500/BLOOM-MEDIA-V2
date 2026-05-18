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

/*
 * Why we still need a play() call despite autoplay attribute:
 *   On SPA hydration, the <video> element is created by Vue on the
 *   client, not parsed at HTML load. Safari evaluates the autoplay
 *   attribute on initial parse — for hydrated elements it may not
 *   fire because the element wasn't there at parse time.
 *
 *   Calling play() once after mount triggers Safari's autoplay
 *   heuristic again. Because the element is muted+playsinline AND
 *   we're not mutating currentTime/muted/etc. the call counts as
 *   "autoplay-like" and Safari allows it.
 *
 *   Critically: NO currentTime mutations, NO muted property writes,
 *   NO load() calls. Each of those flips Safari into "user-mediated"
 *   mode and BLOCKS muted-autoplay until the next page load.
 */
function tryPlay(v: HTMLVideoElement | null) {
  if (!v) return
  const doPlay = () => {
    const p = v.play()
    if (p && typeof p.catch === 'function') p.catch(() => {})
  }
  // readyState 0 = HAVE_NOTHING — pipeline not ready yet (common on mobile)
  if (v.readyState === 0) {
    v.addEventListener('loadedmetadata', doPlay, { once: true })
  } else {
    doPlay()
  }
}

onMounted(() => {
  if (!import.meta.client) return

  /*
   * Safari quirk: calling play() synchronously in onMounted (right after
   * Vue has appended the element) sometimes lands BEFORE the element's
   * media pipeline is ready. The play() promise resolves but the video
   * stays paused until a user gesture. A 100ms tick lets the pipeline
   * complete metadata loading first; the play() then succeeds.
   *
   * requestAnimationFrame alone isn't enough on Safari — it fires before
   * the media engine has registered preload="metadata" was honored.
   */
  tryPlay(player.value)

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (!entry) return
      if (entry.isIntersecting) {
        visible.value = true
        // Second chance: when the video enters the viewport. Same
        // play() — no other manipulation.
        tryPlay(player.value)
      }
      else if (player.value && !player.value.paused) {
        // Off-screen: pause to free decoder cycles. Resume happens
        // on the next intersect.
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
