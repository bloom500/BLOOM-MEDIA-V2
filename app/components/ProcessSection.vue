<template>
  <section class="process">
    <div class="process__grain" aria-hidden="true" />

    <div class="process__header">
      <span class="process__label">03 — Procesul</span>
      <h2 class="process__title">
        <span
          string="split"
          string-split="char"
          string-repeat
          data-anim="char-reveal"
        >Cum</span>
        <span
          class="process__title--accent"
          string="split"
          string-split="char"
          string-repeat
          data-anim="char-reveal"
        >câștigăm</span>
      </h2>
    </div>

    <div class="process__steps">
      <article class="step" string string-repeat>
        <div class="step__num">
          <span
            string="split"
            string-split="char"
            string-repeat
            data-anim="char-reveal"
          >01</span>
          <div class="step__line" aria-hidden="true" />
        </div>
        <div class="step__content">
          <h3 class="step__name">
            <span>Descoperire</span>
          </h3>
          <p class="step__desc">
            Audit profund: business, audiență, competiție, canale. Nu plecăm la drum fără hartă. Identificăm pârghiile reale de creștere și unde se pierd banii acum.
          </p>
          <ul class="step__bullets">
            <li>Analiză business și audiență</li>
            <li>Audit campanii existente</li>
            <li>Analiză competiție</li>
          </ul>
        </div>
      </article>

      <article class="step" string string-repeat>
        <div class="step__num">
          <span
            string="split"
            string-split="char"
            string-repeat
            data-anim="char-reveal"
          >02</span>
          <div class="step__line" aria-hidden="true" />
        </div>
        <div class="step__content">
          <h3 class="step__name">
            <span>Strategie</span>
          </h3>
          <p class="step__desc">
            Plan de execuție pe 90 de zile cu obiective clare, KPI-uri și buget alocat. Fără șabloane — strategia se construiește în jurul situației tale specifice.
          </p>
          <ul class="step__bullets">
            <li>Plan editorial și funnel</li>
            <li>Setup tracking și analytics</li>
            <li>Brief creativ și messaging</li>
          </ul>
        </div>
      </article>

      <article class="step" string string-repeat>
        <div class="step__num">
          <span
            string="split"
            string-split="char"
            string-repeat
            data-anim="char-reveal"
          >03</span>
          <div class="step__line" aria-hidden="true" />
        </div>
        <div class="step__content">
          <h3 class="step__name">
            <span>Execuție</span>
          </h3>
          <p class="step__desc">
            Lansăm campanii, construim landing pages, activăm automatizări. Comunicare săptămânală și acces direct la dashboard cu datele live.
          </p>
          <ul class="step__bullets">
            <li>Campanii Meta și Google Ads</li>
            <li>Landing pages și creative</li>
            <li>Automation flows</li>
          </ul>
        </div>
      </article>

      <article class="step" string string-repeat>
        <div class="step__num">
          <span
            string="split"
            string-split="char"
            string-repeat
            data-anim="char-reveal"
          >04</span>
        </div>
        <div class="step__content">
          <h3 class="step__name">
            <span>Optimizare</span>
          </h3>
          <p class="step__desc">
            Iterație continuă pe baza datelor. Ce funcționează — scalăm. Ce nu — tăiem repede. Raport lunar cu insights și recomandări pentru luna următoare.
          </p>
          <ul class="step__bullets">
            <li>A/B testing și optimizare bid</li>
            <li>Raport lunar cu insights</li>
            <li>Strategy review trimestrial</li>
          </ul>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.process {
  position: relative;
  width: 100%;
  background-color: var(--color-bg);
  padding: 8rem 2.5rem 6rem;
  overflow-x: hidden;
  overflow-y: visible;
}

.process__grain {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.06;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 160px 160px;
}

.process__header {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 6rem;
  text-align: right;
}

.process__label {
  font-family: var(--font-body);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: rgba(245, 240, 232, 0.4);
}

.process__title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(3rem, 8vw, 9rem);
  line-height: 0.95;
  color: rgba(245, 240, 232, 0.92);
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.process__title--accent {
  font-style: italic;
  color: var(--color-accent);
  padding-right: 6vw;
}

.process__steps {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  max-width: 1100px;
  margin: 0 auto;
}

.step {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 3rem;
  padding: 4rem 0;
  border-top: 0.5px solid rgba(245, 240, 232, 0.08);
}

.step:last-child {
  border-bottom: 0.5px solid rgba(245, 240, 232, 0.08);
}

.step__num {
  position: sticky;
  top: 8rem;
  align-self: start;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  height: fit-content;
}

.step__num span {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3.5rem);
  color: rgba(245, 240, 232, 0.5);
  font-style: italic;
}

.step__line {
  width: 1px;
  height: 80px;
  background: linear-gradient(
    to bottom,
    rgba(245, 240, 232, 0.2),
    transparent
  );
}

.step__content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step__name {
  font-family: var(--font-ui);
  font-weight: 600;
  font-size: clamp(2rem, 4vw, 4rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: rgba(245, 240, 232, 0.92);
  margin: 0;
  display: block;
  overflow: hidden;
  padding-bottom: 0.08em;
}

.step__name > span {
  display: block;
  transform: translate3d(0, 100%, 0);
  transition: transform 0.85s var(--ease-1);
}

.step.-inview .step__name > span {
  transform: translate3d(0, 0, 0);
}

.step__desc,
.step__bullets {
  opacity: 0;
  transform: translate3d(0, 16px, 0);
  transition:
    opacity 0.7s var(--ease-2),
    transform 0.7s var(--ease-2);
  transition-delay: 0.15s;
}

.step.-inview .step__desc,
.step.-inview .step__bullets {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.step__bullets {
  transition-delay: 0.25s;
}

@media (prefers-reduced-motion: reduce) {
  .step__name > span,
  .step__desc,
  .step__bullets {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

.step__desc {
  font-family: var(--font-body);
  font-size: 0.95rem;
  line-height: 1.7;
  color: rgba(245, 240, 232, 0.55);
  max-width: 600px;
  margin: 0;
}

.step__bullets {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.step__bullets li {
  font-family: var(--font-body);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(245, 240, 232, 0.45);
  padding-left: 1.2rem;
  position: relative;
}

.step__bullets li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5em;
  width: 6px;
  height: 1px;
  background: var(--color-accent);
}

@media (max-width: 768px) {
  .process {
    padding: 5rem 1.25rem 3rem;
  }

  .process__title--accent {
    padding-right: 8vw;
  }

  .step {
    grid-template-columns: 60px 1fr;
    gap: 1.5rem;
    padding: 2.5rem 0;
  }

  .step__num {
    position: static;
    align-items: flex-start;
  }

  .step__line {
    display: none;
  }
}
</style>
