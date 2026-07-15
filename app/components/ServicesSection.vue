<template>
  <section
    class="services"
    aria-labelledby="services-heading"
    string="progress"
    string-enter-vp="top"
  >
    <div class="services__inner">
      <h2 id="services-heading" class="services__title">Sistemul</h2>

      <p class="services__lead">
        <span class="services__line" string="split" string-split="word" data-anim="surface-dissolve">Nu vindem campanii. Instalăm un sistem</span>
        <span class="services__line" string="split" string-split="word" data-anim="surface-dissolve">cu trei componente care lucrează împreună.</span>
      </p>

      <div class="services__grid">
        <NuxtLink
          v-for="(sys, i) in systems"
          :key="sys.label"
          to="/servicii"
          class="services__card"
        >
          <span class="services__num" aria-hidden="true">0{{ i + 1 }}</span>
          <h3 class="services__name">{{ sys.label }}</h3>
          <p class="services__desc">{{ sys.desc }}</p>
          <span class="services__example">{{ sys.example }}</span>
        </NuxtLink>
      </div>

      <NuxtLink to="/servicii" class="services__more">
        Vezi toate sistemele și prețurile →
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const systems = [
  {
    label: 'Atrage',
    desc: 'Campanii Meta, Google și TikTok care aduc oameni cu intenție reală, nu trafic de vanitate.',
    example: 'Ads · Conținut · Video',
  },
  {
    label: 'Convertește',
    desc: 'Site-uri și landing page-uri rapide, construite exclusiv pentru un singur lucru: clientul următor.',
    example: 'Site · Landing · SEO tehnic',
  },
  {
    label: 'Automatizează',
    desc: 'Agenți AI care răspund, califică și urmăresc fiecare lead, non-stop, fără pauze, fără uitări.',
    example: 'Agenți AI · Follow-up · Raportare',
  },
]
</script>

<style scoped>
.services {
  position: relative;
  width: 100%;
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rem 2.5rem;
}

.services__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1100px;
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
  margin: 0 0 3rem 0;
  text-shadow:
    0 0 12px rgba(255, 255, 255, 0.9),
    0 0 24px rgba(255, 255, 255, 0.6);
}

.services__lead {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 2.4vw, 2.6rem);
  font-weight: 300;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
  text-align: center;
  margin: 0 0 5rem;
}

.services__line {
  display: block;
}

.services__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  width: 100%;
  border-top: 0.5px solid var(--color-border-medium);
  border-bottom: 0.5px solid var(--color-border-medium);
}

.services__card {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: 2.75rem 2rem;
  text-decoration: none;
  color: inherit;
  transition: background 0.35s var(--ease-2);
}

.services__card + .services__card {
  border-left: 0.5px solid var(--color-border-medium);
}

.services__card:hover {
  background: rgba(0, 0, 0, 0.035);
}

.services__num {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 0.85rem;
  color: var(--color-text-faint);
  letter-spacing: 0.08em;
}

.services__name {
  font-family: var(--font-display);
  font-weight: 400;
  font-style: italic;
  font-size: clamp(1.6rem, 2.4vw, 2.4rem);
  line-height: 1.05;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
  margin: 0;
}

.services__desc {
  font-family: var(--font-body);
  font-size: 0.85rem;
  line-height: 1.7;
  color: var(--color-text-soft);
  margin: 0;
}

.services__example {
  font-family: var(--font-body);
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--color-text-faint);
  margin-top: auto;
  padding-top: 0.75rem;
}

.services__more {
  font-family: var(--font-body);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-text-muted);
  text-decoration: none;
  margin-top: 3.5rem;
  padding-bottom: 0.4rem;
  border-bottom: 0.5px solid var(--color-border-strong);
  transition: color 0.3s ease, border-color 0.3s ease;
}

.services__more:hover {
  color: var(--color-text);
  border-bottom-color: var(--color-text);
}

@media (max-width: 900px) {
  .services {
    padding: 8rem 1.25rem;
  }

  .services__grid {
    grid-template-columns: 1fr;
  }

  .services__card {
    padding: 2rem 0.5rem;
  }

  .services__card + .services__card {
    border-left: none;
    border-top: 0.5px solid var(--color-border-medium);
  }

  .services__lead {
    font-size: clamp(1.4rem, 5.5vw, 2rem);
    margin-bottom: 3.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .services__lead {
    color: var(--color-text-primary);
    filter: none;
  }
}
</style>
