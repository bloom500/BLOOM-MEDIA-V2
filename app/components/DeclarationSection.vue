<template>
  <section
    class="declaration"
    string="progress"
    string-enter-vp="top"
    string-exit-vp="bottom"
  >
    <div class="declaration__grain" aria-hidden="true" />

    <div
      class="declaration__content"
      string="parallax"
      string-parallax="0.08"
    >
      <p class="declaration__text">
        <span
          class="declaration__line -splitted"
          string="split"
          string-split="word"
        >Marketing</span>
        <span
          class="declaration__line -splitted"
          string="split"
          string-split="word"
        >care produce</span>
        <span
          class="declaration__line declaration__line--accent -splitted"
          string="split"
          string-split="word"
        >rezultate</span>
        <span
          class="declaration__line -splitted"
          string="split"
          string-split="word"
        >măsurabile.</span>
      </p>
    </div>

    <div class="declaration__bottom">
      <div class="declaration__bottom-left">
        <span>Nu vindem promisiuni.</span>
        <span>Construim sisteme care lucrează pentru tine 24/7.</span>
      </div>
      <div class="declaration__bottom-right">
        <span>Bloom Media —</span>
        <span>Cluj-Napoca, România</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.declaration {
  position: relative;
  overflow: hidden;
  width: 100%;
  min-height: 100svh;
  min-height: 100dvh;
  background: transparent;
  /* Stack above global relief + charcoal base */
  margin-top: -1px;
  padding: 8rem 2.5rem 4rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.declaration__grain {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.08;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 160px 160px;
}

.declaration__content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  flex-grow: 1;
  padding: 4rem 0;
}

.declaration__text {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(3.5rem, 9vw, 11rem);
  /*
   * line-height: 0.95 was clipping descenders (g, p, q, ț, y) and top
   * diacritics (â, î) on the overflow:hidden lines below. 1.05 gives the
   * minimum clearance for Cormorant Garamond's ascenders/descenders while
   * keeping the tight editorial feel.
   */
  line-height: 1.05;
  color: var(--color-text);
  margin: 0;
  display: flex;
  flex-direction: column;
}

.declaration__line {
  display: flex;
  flex-wrap: wrap;
  /*
   * overflow:hidden clips descenders on word-reveal. We compensate with
   * padding/margin so the layout doesn't shift but glyphs have room.
   */
  overflow: hidden;
  padding-bottom: 0.14em;
  margin-bottom: -0.14em;
}

.declaration__line:nth-child(1) {
  padding-left: 0;
}

.declaration__line:nth-child(2) {
  padding-left: 4vw;
}

.declaration__line--accent {
  padding-left: 12vw;
  font-style: italic;
  color: var(--color-text);
}

.declaration__line:nth-child(4) {
  padding-left: 8vw;
}

.declaration__bottom {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 2rem;
}

.declaration__bottom-left,
.declaration__bottom-right {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-family: var(--font-body);
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-text-faint);
  line-height: 1.7;
}

.declaration__bottom-right {
  text-align: right;
}

@media (max-width: 768px) {
  .declaration {
    padding: 5rem 1.25rem 2rem;
  }

  .declaration__text {
    font-size: clamp(2.5rem, 12vw, 5rem);
  }

  .declaration__line:nth-child(2) {
    padding-left: 6vw;
  }

  .declaration__line--accent {
    padding-left: 14vw;
  }

  .declaration__line:nth-child(4) {
    padding-left: 10vw;
  }

  .declaration__bottom {
    flex-direction: column;
    gap: 1.5rem;
    align-items: flex-start;
  }

  .declaration__bottom-right {
    text-align: left;
  }
}
</style>
