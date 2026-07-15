<template>
  <section class="faq" aria-labelledby="faq-heading">
    <div class="faq__grain" aria-hidden="true" />

    <div class="faq__header">
      <h2 id="faq-heading" class="faq__title">
        <span
          string="split"
          string-split="char"
          string-repeat
          data-anim="char-reveal"
        >Ai</span>
        <span
          class="faq__title--accent"
          string="split"
          string-split="char"
          string-repeat
          data-anim="char-reveal"
        >întrebări?</span>
      </h2>
    </div>

    <div class="faq__list">
      <div
        v-for="(item, i) in items"
        :key="i"
        class="faq__item"
        :class="{ 'faq__item--open': openIndex === i }"
      >
        <button
          class="faq__question"
          :aria-expanded="openIndex === i"
          @click="toggle(i)"
        >
          {{ item.q }}
        </button>
        <div class="faq__body">
          <p class="faq__answer">{{ item.a }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { faqItems } from '~/lib/pricing'

const openIndex = ref<number | null>(null)

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i
}

const items = faqItems
</script>

<style scoped>
.faq {
  position: relative;
  overflow: hidden;
  width: 100%;
  background: transparent;
  padding: 8rem 2.5rem 6rem;
}

.faq__grain {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  /*
   * Grain authored for the original light backdrop; on the homepage it
   * sits above the dark curtain (.faq is z=1, curtain z=0), so additive
   * white noise creates a gray lift relative to the curtain-only sections
   * below (Contact). We fade the grain out in lockstep with the curtain
   * via --page-curtain-opacity (set by index.vue's ScrollTrigger). On
   * pages without a curtain, the var defaults to 0 → opacity stays 0.06.
   */
  opacity: calc(0.06 * (1 - var(--page-curtain-opacity, 0)));
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 160px 160px;
}

.faq__header {
  position: relative;
  z-index: 2;
  margin-bottom: 5rem;
}

.faq__title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(3rem, 8vw, 9rem);
  /*
   * line-height: 0.95 was cutting off top diacritics (â, î, ă) and the
   * top of ascenders in 'î' from „întrebări". 1.0 is the minimum safe
   * value for Cormorant Garamond at display sizes with Romanian glyphs.
   */
  line-height: 1.0;
  color: var(--color-text);
  margin: 0;
  display: flex;
  flex-direction: column;
}

.faq__title--accent {
  font-style: italic;
  color: var(--color-text);
  padding-left: 12vw;
}

.faq__list {
  position: relative;
  z-index: 2;
  max-width: 900px;
  margin: 0 auto;
}

.faq__item {
  border-top: 0.5px solid var(--color-border);
  display: grid;
  grid-template-rows: auto 0fr;
  transition: grid-template-rows 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.faq__item:last-child {
  border-bottom: 0.5px solid var(--color-border);
}

.faq__item--open {
  grid-template-rows: auto 1fr;
}

.faq__question {
  all: unset;
  display: block;
  width: 100%;
  box-sizing: border-box;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.2rem, 2.5vw, 1.8rem);
  color: var(--color-text);
  padding: 2rem 3rem 2rem 0;
  cursor: pointer;
  position: relative;
  transition: color 0.3s ease;
}

.faq__question::after {
  content: '+';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-body);
  font-size: 1.4rem;
  font-weight: 300;
  color: var(--color-text-ghost);
  transition:
    transform 0.4s var(--ease-2),
    color 0.3s ease;
}

.faq__item--open .faq__question::after {
  transform: translateY(-50%) rotate(45deg);
  color: var(--color-text);
}

.faq__item--open .faq__question {
  color: var(--color-text);
}

.faq__body {
  overflow: hidden;
}

.faq__answer {
  font-family: var(--font-body);
  font-size: 0.9rem;
  line-height: 1.8;
  color: var(--color-text-soft);
  padding: 0 3rem 2.5rem 0;
  max-width: 680px;
  margin: 0;
}

@media (max-width: 768px) {
  .faq {
    padding: 5rem 1.25rem 4rem;
  }

  .faq__title--accent {
    padding-left: 16vw;
  }

  .faq__question {
    padding-right: 2rem;
  }

  .faq__answer {
    padding-right: 0;
  }
}
</style>
