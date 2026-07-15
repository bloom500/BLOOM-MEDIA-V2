<template>
  <section class="faq" aria-labelledby="faq-heading">
    <div class="faq__grain" aria-hidden="true" />

    <div class="faq__header">
      <h2 id="faq-heading" class="faq__title">
        <!--
          Fără string-repeat: starea de bază char-reveal n-are transition,
          deci la exit-ul din viewport literele săreau instant sub clip —
          titlul „dispărea brusc" când treceai de el. Reveal o dată, rămâne.
        -->
        <span
          string="split"
          string-split="char"
          data-anim="char-reveal"
        >Ai</span>
        <span
          class="faq__title--accent"
          string="split"
          string-split="char"
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

/*
 * Deschiderea/închiderea unui item schimbă înălțimea documentului, dar
 * ScrollTrigger-ele de pe pagină (cortina din index.vue, pin-ul din
 * FooterReveal) au pozițiile calculate pe layoutul vechi — fără refresh,
 * cortina cădea decalat după ce interacționai cu acordeonul. Debounced
 * după tranziția de 450ms a grid-ului.
 */
let refreshTimer: ReturnType<typeof setTimeout> | undefined

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i
  clearTimeout(refreshTimer)
  refreshTimer = setTimeout(async () => {
    const { setupGsap } = await import('~/lib/animations/gsap')
    setupGsap().ScrollTrigger.refresh()
  }, 500)
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
   * inline, from index.vue's ScrollTrigger onUpdate (same write as the
   * curtain itself). On pages without a curtain, opacity stays 0.06.
   */
  opacity: 0.06;
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

/*
 * char-reveal folosește overflow:hidden ca mască pentru glisarea literelor,
 * dar pe WebKit (iOS) clipul tăia vârfurile glifelor („întrebări?" apărea
 * decapitat), indiferent cât lărgeam cutia de clip — line-height 1 +
 * caractere inline-flex se aliniază diferit față de Blink. Renunțăm la
 * mască doar aici: reveal-ul devine fade + rise, care nu poate trunchia
 * nimic, pe niciun engine. Delay-ul per caracter e păstrat identic.
 */
.faq__title :deep([data-anim="char-reveal"].-splitted) {
  overflow: visible;
}

.faq__title :deep([data-anim="char-reveal"] .-s-char) {
  opacity: 0;
  transform: translate3d(0, 0.35em, 0);
}

.faq__title :deep([data-anim="char-reveal"].-inview .-s-char) {
  opacity: 1;
  transform: translate3d(0, 0, 0);
  transition:
    opacity var(--ease-timing, 1.2s) var(--ease-1, cubic-bezier(0.86, 0, 0.31, 1)),
    transform var(--ease-timing, 1.2s) var(--ease-1, cubic-bezier(0.86, 0, 0.31, 1));
  transition-delay: calc((var(--char-start, 0) / 5) * 0.3s);
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
  /* Obligatoriu pentru acordeonul 0fr→1fr: grid items au min-height:auto
     implicit, care ține rândul la înălțimea conținutului în unele browsere
     chiar cu 0fr — itemul nu se mai închide. */
  min-height: 0;
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
