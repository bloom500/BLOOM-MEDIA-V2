<template>
  <section class="hero" :style="heroStyle">
    <div class="hero__shell">
      <div class="hero__top">
        <div class="hero__top-left">
          <span class="hero__label">
            Agenție de Marketing Digital
          </span>
        </div>
        <div class="hero__top-right" aria-hidden="true" />
      </div>

      <div class="hero__center">
        <h1
          class="hero__statement -splitted"
          string="split"
          string-split="word[start]"
          string-repeat
        >
          Rezultate, nu promisiuni.
        </h1>
      </div>

      <div class="hero__bottom">
        <div class="hero__bottom-right">
          <div class="hero__scroll-circle" aria-hidden="true">
            <svg viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke="currentColor"
                stroke-width="0.5"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

/*
 * iOS browser-bar resize fix.
 *
 * Strategy: pin the hero to a JS-set pixel height (NOT dvh/svh/lvh which
 * either jitter or leave gaps). On mobile we resync the pixel value
 * whenever the visible viewport actually changes — that catches the
 * Chrome iOS / Safari bar collapse and expand WITHOUT firing on every
 * scroll frame. window.innerHeight only updates when the bar actually
 * snaps to a new state, so reading it from a scroll/visualViewport
 * resize listener gives us natural growth/shrinkage.
 *
 * Why JS-set pixels with viewport sync, not dvh:
 *  - dvh interpolates live with bar movement → hero "stretches" on every
 *    swipe (the bug that started this thread).
 *  - svh: locked to small viewport → leaves a gray gap when bar collapses.
 *  - lvh: locked to large → first scroll has dead-zone before content moves.
 *  - JS px synced on visualViewport.resize: jumps only at the bar's
 *    discrete snap points (collapsed / expanded), filling the available
 *    space cleanly without micro-resizes during the scroll itself.
 */
const heroHeightPx = ref<string | null>(null)
const heroStyle = computed(() =>
  heroHeightPx.value ? { height: heroHeightPx.value } : {}
)

let removeResize: (() => void) | null = null
let removeOrientation: (() => void) | null = null
let removeVVResize: (() => void) | null = null

onMounted(() => {
  if (!import.meta.client) return

  const isMobileLayout = window.matchMedia('(max-width: 768px)').matches
  const isCoarse = window.matchMedia('(pointer: coarse)').matches
  const isMobile = isMobileLayout || isCoarse

  const setHeight = () => {
    /*
     * visualViewport.height (where supported) reports the actual visible
     * area excluding the bar; window.innerHeight is the fallback. Both
     * give the same result when the bar is collapsed; visualViewport is
     * just more reliable on iOS Safari.
     */
    const h = (window.visualViewport?.height ?? window.innerHeight)
    heroHeightPx.value = `${Math.round(h)}px`
  }
  setHeight()

  if (!isMobile) {
    // Desktop: only update on width changes (keyboard / devtools docking).
    let lastWidth = window.innerWidth
    const onResize = () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth
        setHeight()
      }
    }
    window.addEventListener('resize', onResize, { passive: true })
    removeResize = () => window.removeEventListener('resize', onResize)
  }
  else {
    /*
     * Mobile: sync to visualViewport.resize. iOS fires this event ONLY
     * when the bar actually snaps to a new state (collapsed/expanded),
     * NOT on every scroll frame. So we get smooth two-state height
     * transitions without the "live stretching" of dvh.
     *
     * Fallback to window.resize if visualViewport API is unavailable.
     */
    if (window.visualViewport) {
      const onVV = () => setHeight()
      window.visualViewport.addEventListener('resize', onVV, { passive: true } as AddEventListenerOptions)
      removeVVResize = () => window.visualViewport?.removeEventListener('resize', onVV)
    }
    else {
      const onResize = () => setHeight()
      window.addEventListener('resize', onResize, { passive: true })
      removeResize = () => window.removeEventListener('resize', onResize)
    }

    // Re-measure on real orientation changes too. Two RAFs because iOS
    // reports stale innerHeight in the orientationchange event itself.
    const onOrientation = () => {
      requestAnimationFrame(() =>
        requestAnimationFrame(setHeight)
      )
    }
    window.addEventListener('orientationchange', onOrientation, { passive: true })
    removeOrientation = () => window.removeEventListener('orientationchange', onOrientation)
  }
})

onBeforeUnmount(() => {
  removeResize?.()
  removeOrientation?.()
  removeVVResize?.()
})
</script>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  width: 100%;
  /*
   * Height comes from JS-set inline style="height: <pixels>px;", synced
   * to visualViewport on bar collapse/expand. Smooth tween on the JS
   * change keeps the snap from feeling abrupt — bar collapse animation
   * and our height update finish at the same time visually.
   * Fallbacks here are pre-hydration only (SSR + before onMounted).
   */
  height: 100svh;
  min-height: 100svh;
  background: transparent;
  transition: height 0.32s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero__shell {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-rows: auto 1fr auto;
  /* svh, not dvh — see .hero comment above. Stable height = no jitter. */
  min-height: 100svh;
  padding: 5rem 2.5rem 1.5rem;
}

.hero__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-top: 0.5rem;
}

.hero__label {
  font-family: var(--font-body);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-text-soft);
}

.hero__center {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 2vw;
}

.hero__statement {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(2rem, 5vw, 5.5rem);
  line-height: 1.1;
  color: var(--color-text);
  max-width: 60vw;
  margin: 0;
}

.hero__bottom {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  padding-bottom: 0.5rem;
}

.hero__scroll-circle {
  width: 36px;
  height: 36px;
  color: var(--color-text-faint);
}

.hero__scroll-circle svg {
  display: block;
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  .hero__shell {
    padding: 4.5rem 1.25rem 1.25rem;
  }

  .hero__statement {
    font-size: clamp(1.8rem, 8vw, 3rem);
    max-width: 90vw;
  }
}

</style>
