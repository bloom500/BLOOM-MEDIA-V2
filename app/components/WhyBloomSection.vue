<template>
  <section class="why" aria-labelledby="why-heading">
    <div class="why__grain" aria-hidden="true" />

    <div class="why__header">
      <h2 id="why-heading" class="why__title">
        <span>De ce</span>
        <span class="why__title--accent">Bloom Media</span>
        <span>și nu altcineva.</span>
      </h2>
    </div>

    <div class="why__grid">
      <article class="why-item" string string-repeat data-anim="stagger-item">
        <div class="why-item__icon" aria-hidden="true">
          01
        </div>
        <div class="why-item__content">
          <h3 class="why-item__title">
            Un singur om de contact
          </h3>
          <p class="why-item__desc">
            Nu un call center. Nu un account manager
            care citește brieful cu 10 minute înainte
            de ședință. Ai acces direct la omul care
            face efectiv munca.
          </p>
        </div>
      </article>

      <article class="why-item" string string-repeat data-anim="stagger-item">
        <div class="why-item__icon" aria-hidden="true">
          02
        </div>
        <div class="why-item__content">
          <h3 class="why-item__title">
            Date live, nu rapoarte lunare
          </h3>
          <p class="why-item__desc">
            Dashboard în timp real cu tot ce contează.
            Nu aștepți sfârșitul lunii ca să știi
            ce se întâmplă cu bugetul tău.
          </p>
        </div>
      </article>

      <article class="why-item" string string-repeat data-anim="stagger-item">
        <div class="why-item__icon" aria-hidden="true">
          03
        </div>
        <div class="why-item__content">
          <h3 class="why-item__title">
            Fără contracte pe termen lung
          </h3>
          <p class="why-item__desc">
            Lucrăm pe încredere și rezultate.
            Dacă nu livrăm, ești liber să pleci.
            Asta ne ține focusați pe ce contează
            cu adevărat — performanța ta.
          </p>
        </div>
      </article>

      <article class="why-item" string string-repeat data-anim="stagger-item">
        <div class="why-item__icon" aria-hidden="true">
          04
        </div>
        <div class="why-item__content">
          <h3 class="why-item__title">
            AI integrat în fiecare workflow
          </h3>
          <p class="why-item__desc">
            Automatizări, agenți AI, rapoarte
            generate automat. Nu promitem AI —
            îl folosim efectiv ca să livrăm
            mai rapid și mai precis.
          </p>
        </div>
      </article>

      <article class="why-item" string string-repeat data-anim="stagger-item">
        <div class="why-item__icon" aria-hidden="true">
          05
        </div>
        <div class="why-item__content">
          <h3 class="why-item__title">
            Strategie înainte de execuție
          </h3>
          <p class="why-item__desc">
            Nu lansăm campanii fără audit.
            Fiecare proiect începe cu o înțelegere
            profundă a business-ului tău,
            nu cu un template copy-paste.
          </p>
        </div>
      </article>

      <article class="why-item" string string-repeat data-anim="stagger-item">
        <div class="why-item__icon" aria-hidden="true">
          06
        </div>
        <div class="why-item__content">
          <h3 class="why-item__title">
            Prețuri clare, fără surprize
          </h3>
          <p class="why-item__desc">
            Știi exact ce plătești și ce primești.
            Nicio taxă ascunsă, niciun "cost
            suplimentar" descoperit la final
            de lună.
          </p>
        </div>
      </article>
    </div>

    <div class="why__cta">
      <p class="why__cta-text">
        Sună a fit bun?
      </p>
      <NuxtLink to="/audit" class="why__cta-link">
        Începe cu un audit gratuit →
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.why {
  position: relative;
  overflow: hidden;
  width: 100%;
  min-height: 100vh;
  background: transparent;
  padding: 8rem 2.5rem 6rem;
}

.why__grain {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.06;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 160px 160px;
}

.why__header {
  position: relative;
  z-index: 2;
  margin-bottom: 6rem;
}

.why__title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(3rem, 8vw, 9rem);
  line-height: 0.95;
  color: var(--color-text);
  margin: 0;
  display: flex;
  flex-direction: column;
}

.why__title--accent {
  font-style: italic;
  color: var(--color-text);
  padding-left: 10vw;
}

.why__title span:last-child {
  padding-left: 5vw;
}

/* Grid */
.why__grid {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
}

.why-item {
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 1.5rem;
  padding: 3rem 3rem 3rem 0;
  border-top: 0.5px solid var(--color-border);
  opacity: 0;
  transform: translate3d(0, 40px, 0);
  transition:
    opacity 0.7s var(--ease-2),
    transform 0.7s var(--ease-2),
    background 0.4s ease;
}

.why-item.-inview {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.why-item:nth-child(2) {
  transition-delay: 0.1s;
}

.why-item:nth-child(3) {
  transition-delay: 0.2s;
}

.why-item:nth-child(4) {
  transition-delay: 0.3s;
}

.why-item:nth-child(5) {
  transition-delay: 0.4s;
}

.why-item:nth-child(6) {
  transition-delay: 0.5s;
}

@media (prefers-reduced-motion: reduce) {
  .why-item {
    opacity: 1;
    transform: none;
    transition: background 0.4s ease;
  }
}

.why-item:nth-child(even) {
  padding-left: 3rem;
  border-left: 0.5px solid var(--color-border);
}

.why-item:hover {
  background: rgba(0, 0, 0, 0.03);
}

.why-item__icon {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-style: italic;
  color: var(--color-text-ghost);
  padding-top: 0.3rem;
}

.why-item__content {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.why-item__title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.4rem, 2.5vw, 2rem);
  line-height: 1.1;
  color: var(--color-text);
  margin: 0;
}

.why-item__desc {
  font-family: var(--font-body);
  font-size: 0.85rem;
  line-height: 1.7;
  color: var(--color-text-soft);
  margin: 0;
}

/* Bottom CTA */
.why__cta {
  position: relative;
  z-index: 2;
  margin-top: 6rem;
  padding-top: 3rem;
  border-top: 0.5px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.why__cta-text {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 4rem);
  font-weight: 400;
  font-style: italic;
  color: var(--color-text-muted);
  margin: 0;
}

.why__cta-link {
  font-family: var(--font-body);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-text-muted);
  text-decoration: none;
  padding: 0.8rem 0;
  border-bottom: 0.5px solid var(--color-border-strong);
  transition: all 0.4s ease;
}

.why__cta-link:hover {
  color: var(--color-text);
  border-bottom-color: var(--color-text);
}

@media (max-width: 768px) {
  .why {
    padding: 5rem 1.25rem 3rem;
  }

  .why__title--accent {
    padding-left: 15vw;
  }

  .why__title span:last-child {
    padding-left: 8vw;
  }

  .why__grid {
    grid-template-columns: 1fr;
  }

  .why-item {
    padding: 2.5rem 0;
    border-left: none !important;
    padding-left: 0 !important;
  }

  .why__cta {
    flex-direction: column;
    align-items: flex-start;
    gap: 2rem;
  }
}
</style>
