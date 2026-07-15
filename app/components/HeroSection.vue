<template>
  <section class="hero" :style="heroStyle">
    <div class="hero__shell">
      <div class="hero__top">
        <div class="hero__top-left">
          <span class="hero__label">
            AI Growth Systems, Cluj / Remote
          </span>
        </div>
        <div class="hero__top-right" aria-hidden="true" />
      </div>

      <div class="hero__center">
        <div class="hero__stack">
          <h1
            class="hero__statement -splitted"
            string="split"
            string-split="word[start]"
            string-repeat
          >
            Marketingul tău, transformat în sistem.
          </h1>
          <p class="hero__sub">
            Ads, site-uri și agenți AI pentru business-uri care măsoară
            în vânzări, nu în like-uri.
          </p>
          <div class="hero__actions">
            <NuxtLink to="/audit" class="hero__cta">
              Audit gratuit
            </NuxtLink>
            <NuxtLink to="/servicii" class="hero__ghost">
              Vezi sistemele →
            </NuxtLink>
          </div>
        </div>
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
 * iOS browser-bar resize fix — replicated 1:1 from BLOOM-MEDIA-WEBFINAL
 * (sveltekit_app/src/lib/components/Hero.svelte). Capture innerHeight
 * once on mount, freeze the hero to that pixel value.
 *
 * Desktop: re-measure only when width changes (devtools dock, etc.).
 * Mobile: never re-measure. The whole point is to NOT respond to bar
 * collapse — that's the resize event we're trying to ignore.
 *
 * Why JS pixel value beats CSS units:
 *  - dvh stretches the hero live with bar movement
 *  - svh leaves a gap below the hero
 *  - lvh has dead-zone scroll on first swipe
 *  - JS px frozen on mount: hero is invariant, bar movement plays out
 *    in the body's spare height (body has min-height: 100dvh)
 */
const heroHeightPx = ref<string | null>(null)
const heroStyle = computed(() =>
  heroHeightPx.value ? { height: heroHeightPx.value } : {}
)

let removeResize: (() => void) | null = null

onMounted(() => {
  if (!import.meta.client) return

  const isMobileLayout = window.matchMedia('(max-width: 768px)').matches
  const isMobile = isMobileLayout || window.matchMedia('(pointer: coarse)').matches

  const setHeight = () => {
    heroHeightPx.value = `${window.innerHeight}px`
  }
  setHeight()

  if (!isMobileLayout) {
    // Desktop: only update on width changes.
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
  // Mobile: pixel height frozen on mount. No listeners.
  void isMobile
})

onBeforeUnmount(() => {
  removeResize?.()
})
</script>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  width: 100%;
  /*
   * Height comes from JS-set inline style="height: <pixels>px;",
   * captured ONCE on mount. Pre-hydration fallback is svh so SSR
   * doesn't render a giant frame.
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

.hero__stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
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

.hero__sub {
  font-family: var(--font-body);
  font-size: clamp(0.9rem, 1.15vw, 1.05rem);
  line-height: 1.65;
  color: var(--color-text-soft);
  max-width: 44ch;
  margin: 1.75rem 0 0;
}

.hero__actions {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-top: 2.25rem;
}

.hero__cta {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-bg);
  background: var(--color-text);
  border: 0.5px solid var(--color-text);
  padding: 0.9rem 2rem;
  border-radius: 999px;
  text-decoration: none;
  transition: opacity 0.3s ease;
}

.hero__cta:hover {
  opacity: 0.82;
}

.hero__ghost {
  font-family: var(--font-body);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-text-soft);
  text-decoration: none;
  border-bottom: 0.5px solid var(--color-border-strong);
  padding-bottom: 0.35rem;
  transition: color 0.3s ease, border-color 0.3s ease;
}

.hero__ghost:hover {
  color: var(--color-text);
  border-bottom-color: var(--color-text);
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

  .hero__sub {
    font-size: 0.9rem;
    margin-top: 1.25rem;
  }

  .hero__actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
    margin-top: 1.75rem;
  }
}

</style>
