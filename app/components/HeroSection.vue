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
 * iOS browser-bar resize fix (1:1 with the WEBFINAL Svelte original).
 *
 * Capture window.innerHeight ONCE on mount and pin the hero to that
 * exact pixel value. iOS Safari/Chrome browser bars then collapse and
 * expand without changing the hero's height — the bar movement plays out
 * in the body's spare height (body has min-height: 100dvh which absorbs
 * the freed space below the hero), not by stretching the hero itself.
 *
 * Why JS-set pixels beat dvh/svh/lvh:
 *  - dvh: tracks the bar live → hero visibly grows/shrinks every scroll
 *  - svh: locked to small viewport → leaves a gray gap below the hero
 *  - lvh: locked to large → first scroll has dead-zone before content moves
 *  - JS px: locked to whatever the viewport was AT LOAD → no jumps, no gaps
 *
 * On mobile we deliberately don't listen to resize (only orientation).
 * The point is to NOT respond to bar collapse; resize fires for that.
 */
const heroHeightPx = ref<string | null>(null)
const heroStyle = computed(() =>
  heroHeightPx.value ? { height: heroHeightPx.value } : {}
)

let removeResize: (() => void) | null = null
let removeOrientation: (() => void) | null = null

onMounted(() => {
  if (!import.meta.client) return

  const isMobileLayout = window.matchMedia('(max-width: 768px)').matches
  const isCoarse = window.matchMedia('(pointer: coarse)').matches
  const isMobile = isMobileLayout || isCoarse

  const setHeight = () => {
    heroHeightPx.value = `${window.innerHeight}px`
  }
  setHeight()

  if (!isMobile) {
    // Desktop: only update on width changes (keyboard / devtools docking).
    // Height-only resizes (window manager) shouldn't disturb the hero.
    let lastWidth = window.innerWidth
    const onResize = () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth
        setHeight()
      }
    }
    window.addEventListener('resize', onResize, { passive: true })
    removeResize = () => window.removeEventListener('resize', onResize)
  } else {
    // Mobile: only re-measure on real orientation changes. Browser-bar
    // collapse fires resize too, which is exactly what we want to ignore.
    const onOrientation = () => {
      // Two RAFs: iOS reports stale innerHeight on the orientationchange
      // event itself; the next two paint cycles have the correct value.
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
})
</script>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  width: 100%;
  /*
   * Height comes from JS-set inline style="height: <innerHeight>px;",
   * captured ONCE on mount. See the script block above for the rationale.
   * Fallback values here are only used pre-hydration / before onMounted
   * fires — keep them at svh so SSR doesn't render a giant initial frame.
   */
  height: 100svh;
  min-height: 100svh;
  background: transparent;
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
