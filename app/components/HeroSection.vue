<template>
  <section class="hero">
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
</script>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  width: 100%;
  /*
   * Stable height across iOS browser-bar collapse/expand. Sequence of
   * fallbacks that all evaluate to "fixed = small viewport, bar visible":
   *   - 100vh: legacy unit, on iOS evaluates to lvh (large) and *grows*
   *     when the bar collapses — that's the bug we're avoiding.
   *   - 100svh: small viewport height, locked to the size with the bar
   *     fully visible. Never changes during scroll. This is what we want.
   *   - dvh would track the bar dynamically (resizes the hero as the bar
   *     animates) — feels alive on first swipe but creates the "hero
   *     stretches/shrinks every scroll" sensation we're seeing.
   *
   * Tradeoff: ~50px of black space appears under the hero once the bar
   * collapses, before the manifest section. Acceptable; consistent with
   * editorial reference sites.
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
