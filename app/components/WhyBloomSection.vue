<template>
  <section
    class="why"
    aria-labelledby="why-heading"
    string="progress"
    string-enter-vp="top"
  >
    <div class="why__grain" aria-hidden="true" />

    <div class="why__inner">
      <h2 id="why-heading" class="why__title">Cu cine lucrăm</h2>

      <div class="why__columns">
        <div class="why__col">
          <p class="why__entry why__entry--label">
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">Suntem fit dacă:</span>
          </p>
          <p class="why__entry">
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">Bugetul tău de marketing</span>
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">pornește de la 800€/lună</span>
          </p>
          <p class="why__entry">
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">Măsori succesul în vânzări</span>
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">și cost per achiziție</span>
          </p>
          <p class="why__entry">
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">Ești dispus să schimbi</span>
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">ce nu funcționează</span>
          </p>
          <p class="why__entry">
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">Vrei un partener care</span>
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">îți spune și când greșești</span>
          </p>
        </div>

        <div class="why__col">
          <p class="why__entry why__entry--label">
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">Probabil nu suntem fit dacă:</span>
          </p>
          <p class="why__entry">
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">Vrei să „testezi cu 200€</span>
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">să vezi dacă merge"</span>
          </p>
          <p class="why__entry">
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">Vrei mai mulți followeri</span>
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">și engagement frumos</span>
          </p>
          <p class="why__entry">
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">Știi deja exact ce vrei</span>
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">și cauți pe cineva să execute</span>
          </p>
          <p class="why__entry">
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">Ai nevoie de o agenție</span>
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">care să aprobe orice</span>
          </p>
        </div>
      </div>
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

.why__inner {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.why__title {
  font-family: var(--font-display);
  font-size: clamp(0.9rem, 1.4vw, 1.2rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.28em;
  color: var(--color-text-primary);
  text-align: center;
  margin: 0 0 5rem 0;
  text-shadow:
    0 0 12px rgba(255, 255, 255, 0.9),
    0 0 24px rgba(255, 255, 255, 0.6);
}

.why__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
}

.why__col {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.why__entry {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(1.1rem, 1.6vw, 1.7rem);
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
  margin: 0;
}

.why__entry--label {
  font-weight: 600;
  font-size: clamp(0.85rem, 1.1vw, 1.1rem);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
}

.why__line {
  display: block;
}

/* Bottom CTA */
.why__cta {
  position: relative;
  z-index: 2;
  max-width: 900px;
  margin: 6rem auto 0;
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

  .why__columns {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .why__cta {
    flex-direction: column;
    align-items: flex-start;
    gap: 2rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .why__entry {
    color: var(--color-text-primary);
    filter: none;
  }
}
</style>
