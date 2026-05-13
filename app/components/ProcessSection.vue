<template>
  <section
    class="process"
    string="progress"
    string-enter-vp="top"
  >
    <h2 class="process__title">CUM CREȘTI</h2>
    <div class="process__spacer" aria-hidden="true" />
    <p class="process__body">
      <span class="process__line" string="split" string-split="word" data-anim="surface-dissolve">Oboseala nu vine din volum.</span>
      <span class="process__line" string="split" string-split="word" data-anim="surface-dissolve">Vine din pași pierduți.</span>
      <span class="process__line" string="split" string-split="word" data-anim="surface-dissolve">Un mesaj văzut la timp,</span>
      <span class="process__line" string="split" string-split="word" data-anim="surface-dissolve">o pagină care răspunde corect,</span>
      <span class="process__line" string="split" string-split="word" data-anim="surface-dissolve">un follow-up care nu uită pe nimeni.</span>
      <span class="process__line" string="split" string-split="word" data-anim="surface-dissolve">Pune-le cap la cap</span>
      <span class="process__line" string="split" string-split="word" data-anim="surface-dissolve">și afacerea merge singură.</span>
    </p>
    <div class="process__hint">
      <div class="process__rule" aria-hidden="true" />
      <p class="process__hint-text">AUDIT · STRATEGIE · EXECUȚIE</p>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.process {
  position: relative;
  width: 100%;
  padding: 10rem 1.5rem;
}

.process__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(0.9rem, 1.4vw, 1.2rem);
  text-transform: uppercase;
  letter-spacing: 0.28em;
  color: rgba(64, 58, 52, 0.65);
  text-align: right;
  margin: 0;
}

.process__spacer {
  height: 5rem;
}

.process__body {
  max-width: 42rem;
  margin: 0 0 0 auto;
  text-align: right;
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(1.6rem, 2.6vw, 3rem);
  line-height: 1.1;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
}

.process__line {
  display: block;
}

.process__hint {
  max-width: 42rem;
  margin: 4rem 0 0 auto;
  text-align: right;
}

.process__rule {
  display: inline-block;
  width: 2.5rem;
  height: 1px;
  background: rgba(0, 0, 0, 0.25);
  margin-bottom: 1rem;
}

.process__hint-text {
  font-family: var(--font-body);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.32em;
  color: rgba(26, 24, 20, 0.75);
  margin: 0;
}

@media (max-width: 768px) {
  .process {
    padding: 6rem 1.25rem;
  }

  .process__body {
    font-size: clamp(1.5rem, 6vw, 2.2rem);
    line-height: 1.15;
  }
}

@media (prefers-reduced-motion: reduce) {
  .process__body {
    color: var(--color-text-primary);
    filter: none;
  }
}
</style>
