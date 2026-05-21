<script setup lang="ts">
useHead({
  title: 'Portofoliu — Bloom Media',
  meta: [
    { name: 'description', content: 'Proiectele noastre sunt în curs de pregătire. Revin în curând cu studii de caz și rezultate.' },
    { name: 'robots', content: 'noindex, follow' },
  ],
})
</script>

<template>
  <main class="port">
    <div class="port__inner">

      <div class="port__top">
        <span class="port__eyebrow">Portofoliu / 2026</span>
        <div class="port__rule" aria-hidden="true" />
      </div>

      <div class="port__body">
        <h1 class="port__title">
          În<br>lucru.
        </h1>

        <div class="port__right">
          <p class="port__desc">
            Pregătim studii de caz cu rezultate reale — ROAS, cost/lead, creșteri
            de trafic organic. Fără cifre umflate, fără proiecte fictive.
          </p>
          <p class="port__desc">
            Până atunci, cea mai bună mostră din munca noastră e o
            conversație directă.
          </p>
          <NuxtLink to="/audit" class="port__cta">
            Cere un audit gratuit
            <span class="port__cta-arrow" aria-hidden="true">→</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Decorative index grid -->
      <ul class="port__grid" aria-hidden="true">
        <li v-for="n in 6" :key="n" class="port__card">
          <span class="port__card-num">0{{ n }}</span>
          <span class="port__card-label">În pregătire</span>
        </li>
      </ul>

    </div>
  </main>
</template>

<style scoped>
.port {
  min-height: 100svh;
  padding: clamp(7rem, 10vw, 10rem) clamp(2rem, 6vw, 6rem) clamp(4rem, 8vw, 8rem);
  box-sizing: border-box;
}

.port__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 5rem;
}

/* ── Top bar ── */
.port__top {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.port__eyebrow {
  font-family: var(--font-body);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.port__rule {
  flex: 1;
  height: 0.5px;
  background: var(--color-divider);
}

/* ── Body ── */
.port__body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
  align-items: start;
}

.port__title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(5rem, 12vw, 11rem);
  line-height: 0.9;
  letter-spacing: -0.03em;
  color: var(--color-text-primary);
  margin: 0;
  font-variant-ligatures: no-common-ligatures;
  font-feature-settings: 'liga' 0, 'clig' 0;
}

.port__right {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  padding-top: 1rem;
}

.port__desc {
  font-family: var(--font-body);
  font-size: clamp(0.88rem, 1.1vw, 1rem);
  line-height: 1.75;
  color: var(--color-text-muted);
  max-width: 44ch;
}

.port__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.8rem;
  font-family: var(--font-body);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-primary);
  text-decoration: none;
  border-bottom: 0.5px solid var(--color-text-primary);
  padding-bottom: 0.25rem;
  transition: opacity 0.2s ease;
}

.port__cta:hover { opacity: 0.55; }

.port__cta-arrow {
  transition: transform 0.2s ease;
}

.port__cta:hover .port__cta-arrow {
  transform: translateX(4px);
}

/* ── Index grid ── */
.port__grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  border-top: 0.5px solid var(--color-divider);
}

.port__card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 2rem 2rem 2.5rem;
  border-right: 0.5px solid var(--color-divider);
  border-bottom: 0.5px solid var(--color-divider);
}

.port__card:nth-child(3n) {
  border-right: none;
}

.port__card-num {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 400;
  color: var(--color-divider);
  line-height: 1;
  letter-spacing: -0.02em;
}

.port__card-label {
  font-family: var(--font-body);
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-divider);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .port__body {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .port__title {
    font-size: clamp(4rem, 16vw, 6rem);
  }

  .port__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .port__card:nth-child(3n) {
    border-right: 0.5px solid var(--color-divider);
  }

  .port__card:nth-child(2n) {
    border-right: none;
  }
}

@media (max-width: 480px) {
  .port__grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
