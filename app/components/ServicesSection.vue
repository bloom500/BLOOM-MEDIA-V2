<template>
  <section
    class="services"
    string="progress"
    string-enter-vp="top"
  >
    <div class="services__inner">
      <h2 class="services__title">Ce Construim</h2>

      <p class="services__body">
        <span class="services__line" string="split" string-split="word" data-anim="surface-dissolve">Unele drumuri consumă, altele construiesc.</span>
        <span class="services__line" string="split" string-split="word" data-anim="surface-dissolve">Diferența nu este norocul.</span>
        <span class="services__line" string="split" string-split="word" data-anim="surface-dissolve">Este o campanie care se plătește singură,</span>
        <span class="services__line" string="split" string-split="word" data-anim="surface-dissolve">un site care vinde fără să insiști,</span>
        <span class="services__line" string="split" string-split="word" data-anim="surface-dissolve">o automatizare care nu lasă niciun lead să se piardă.</span>
        <span class="services__line" string="split" string-split="word" data-anim="surface-dissolve">Asta facem. Aducem linia de plutire după haos.</span>
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.services {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10rem 1.5rem;
}

.services__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
}

.services__title {
  font-family: var(--font-display);
  font-size: clamp(0.9rem, 1.4vw, 1.2rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.28em;
  color: var(--color-text-primary);
  text-align: center;
  margin: 0 0 4rem 0;
  text-shadow:
    0 0 12px rgba(255, 255, 255, 0.9),
    0 0 24px rgba(255, 255, 255, 0.6);
}

.services__body {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 2.6vw, 3rem);
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
  text-align: center;
  margin: 0;
}

.services__line {
  display: block;
}

@media (max-width: 768px) {
  .services {
    padding: 6rem 1.5rem;
  }

  .services__body {
    font-size: clamp(1.5rem, 6vw, 2.2rem);
    line-height: 1.15;
  }
}

@media (prefers-reduced-motion: reduce) {
  .services__body {
    color: var(--color-text-primary);
    filter: none;
  }
}
</style>
