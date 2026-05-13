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
      <details class="faq__item">
        <summary class="faq__question">
          Cât costă serviciile Bloom Media?
        </summary>
        <p class="faq__answer">
          Depinde de serviciile alese și complexitatea
          proiectului. Completează configuratorul sau
          scrie-ne direct — îți facem o propunere
          clară în 24h, fără obligații.
        </p>
      </details>

      <details class="faq__item">
        <summary class="faq__question">
          Există contract pe termen lung?
        </summary>
        <p class="faq__answer">
          Nu. Lucrăm pe retainer lunar sau per proiect.
          Dacă nu ești mulțumit, oprești cu o lună
          preaviz. Asta ne ține focusați pe rezultatele
          tale, nu pe retenția artificială.
        </p>
      </details>

      <details class="faq__item">
        <summary class="faq__question">
          Cât durează până văd rezultate?
        </summary>
        <p class="faq__answer">
          Primele semne apar în 2-4 săptămâni.
          Rezultatele semnificative vin după
          60-90 de zile de optimizare continuă.
          Nu promitem magie overnight.
        </p>
      </details>

      <details class="faq__item">
        <summary class="faq__question">
          Cu ce tipuri de business lucrați?
        </summary>
        <p class="faq__answer">
          Medical, e-commerce, servicii B2B, retail.
          Important e să existe un produs validat
          și un buget de marketing realist.
          Nu lucrăm cu proiecte fără fundament.
        </p>
      </details>

      <details class="faq__item">
        <summary class="faq__question">
          Oferiți rapoarte și transparență?
        </summary>
        <p class="faq__answer">
          Da. Raport săptămânal + dashboard live
          cu toate datele în timp real.
          Nu vei afla niciodată ce se întâmplă
          cu bugetul tău din rapoarte lunare vagi.
        </p>
      </details>

      <details class="faq__item">
        <summary class="faq__question">
          Pot lua un singur serviciu?
        </summary>
        <p class="faq__answer">
          Da. Doar Meta Ads, doar un landing page
          sau doar consultanță. Nu te obligăm
          la pachete complete dacă nu ai nevoie.
        </p>
      </details>

      <details class="faq__item">
        <summary class="faq__question">
          Cum încep colaborarea?
        </summary>
        <p class="faq__answer">
          Completezi formularul de audit gratuit
          sau ne contactezi direct. Facem un call
          de 30 de minute să înțelegem situația ta,
          după care îți trimitem o propunere concretă.
        </p>
      </details>
    </div>
  </section>
</template>

<script setup lang="ts">
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
  line-height: 0.95;
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
}

.faq__item:last-child {
  border-bottom: 0.5px solid var(--color-border);
}

.faq__question {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.2rem, 2.5vw, 1.8rem);
  color: var(--color-text-muted);
  padding: 2rem 3rem 2rem 0;
  cursor: pointer;
  list-style: none;
  position: relative;
  transition: color 0.3s ease;
}

.faq__question::-webkit-details-marker {
  display: none;
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

.faq__item[open] .faq__question::after {
  transform: translateY(-50%) rotate(45deg);
  color: var(--color-text);
}

.faq__item[open] .faq__question {
  color: var(--color-text);
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
