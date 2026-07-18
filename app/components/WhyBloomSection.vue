<template>
  <section
    class="why"
    aria-labelledby="why-heading"
  >
    <div class="why__grain" aria-hidden="true" />

    <div class="why__inner">
      <h2 id="why-heading" class="why__title">Cu cine lucrăm</h2>

      <div class="why__columns">
        <div class="why__col">
          <p class="why__entry why__entry--label">
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">Lucrăm cu:</span>
          </p>
          <p class="why__entry">
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">Antreprenori cu buget</span>
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">de marketing de minim 800€/lună</span>
          </p>
          <p class="why__entry">
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">Companii care măsoară succesul</span>
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">în vânzări și cost per achiziție, nu în like-uri</span>
          </p>
          <p class="why__entry">
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">Clienți deschiși la feedback direct,</span>
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">chiar și când e incomod</span>
          </p>
          <p class="why__entry">
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">Business-uri care vor un partener</span>
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">cu opinie, nu un executant</span>
          </p>
        </div>

        <div class="why__col">
          <p class="why__entry why__entry--label">
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">Nu lucrăm cu:</span>
          </p>
          <p class="why__entry">
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">Cei care vor să „testeze cu 200€</span>
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">să vadă dacă merge"</span>
          </p>
          <p class="why__entry">
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">Companii care urmăresc followeri,</span>
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">reach și engagement în loc de vânzări</span>
          </p>
          <p class="why__entry">
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">Clienți care vin cu brief finalizat</span>
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">și vor execuție fără input strategic</span>
          </p>
          <p class="why__entry">
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">Cei care caută validare,</span>
            <span class="why__line" string="split" string-split="word" data-anim="surface-dissolve">nu rezultate</span>
          </p>
        </div>
      </div>
    </div>

    <div class="why__cta">
      <p class="why__cta-text">
        Te regăsești?
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
