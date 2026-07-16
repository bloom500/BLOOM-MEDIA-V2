<template>
  <main class="proces">
    <!-- ── Hero ──────────────────────────────────────────────── -->
    <header class="proces__hero">
      <span class="proces__eyebrow">Procesul, de la audit la sistem live</span>
      <h1 class="proces__title">
        Fiecare pas are<br>
        <em>o dată și un livrabil.</em>
      </h1>
      <p class="proces__sub">
        Fără ședințe interminabile, fără rapoarte de 40 de pagini.
        Așa arată prima lună de colaborare, pas cu pas, cu termene pe care
        ni le asumăm public.
      </p>
    </header>

    <!-- ── Luna 1: timeline ──────────────────────────────────── -->
    <section class="proces__section" aria-labelledby="luna1-heading">
      <h2 id="luna1-heading" class="proces__label">Prima lună</h2>
      <ol class="proces__steps">
        <li v-for="step in timeline" :key="step.when" class="proces__step">
          <span class="proces__when">{{ step.when }}</span>
          <div class="proces__step-body">
            <h3 class="proces__step-title">{{ step.title }}</h3>
            <p class="proces__step-desc">{{ step.desc }}</p>
            <span class="proces__deliverable">Primești: {{ step.deliverable }}</span>
          </div>
        </li>
      </ol>
    </section>

    <!-- ── Ritmul lunar ──────────────────────────────────────── -->
    <section class="proces__section" aria-labelledby="ritm-heading">
      <h2 id="ritm-heading" class="proces__label">Apoi, în fiecare lună</h2>
      <div class="proces__rhythm">
        <div v-for="r in rhythm" :key="r.title" class="proces__rhythm-item">
          <h3 class="proces__rhythm-title">{{ r.title }}</h3>
          <p class="proces__rhythm-desc">{{ r.desc }}</p>
        </div>
      </div>
    </section>

    <!-- ── SLA / angajamente ─────────────────────────────────── -->
    <section class="proces__section" aria-labelledby="sla-heading">
      <h2 id="sla-heading" class="proces__label">Ce ne asumăm</h2>
      <ul class="proces__sla" role="list">
        <li v-for="s in slas" :key="s" class="proces__sla-item">{{ s }}</li>
      </ul>
    </section>

    <!-- ── CTA ───────────────────────────────────────────────── -->
    <section class="proces__cta">
      <p class="proces__cta-text">Pasul zero e gratuit.</p>
      <NuxtLink to="/audit" class="proces__cta-btn">
        Începe cu auditul →
      </NuxtLink>
    </section>
  </main>
</template>

<script setup lang="ts">
useHead({
  title: 'Proces: Cum lucrăm | Bloom Media',
  meta: [
    {
      name: 'description',
      content: 'Procesul Bloom Media, pas cu pas: audit gratuit în ziua 0, call de 20 de minute în ziua 2, propunere cu preț fix în ziua 3, primul sistem live în săptămâna 2.',
    },
    { property: 'og:title',       content: 'Proces: Cum lucrăm | Bloom Media' },
    { property: 'og:description', content: 'De la audit gratuit la primul sistem live, în două săptămâni. Fiecare pas are o dată și un livrabil.' },
    { property: 'og:url',         content: 'https://www.bloommedia.ro/proces' },
    { property: 'og:image',       content: 'https://www.bloommedia.ro/og-image.jpg' },
  ],
  link: [{ rel: 'canonical', href: 'https://www.bloommedia.ro/proces' }],
})

const timeline = [
  {
    when: 'Ziua 0',
    title: 'Audit gratuit',
    desc: 'Completezi formularul cu site-ul și canalele tale. Analizăm ce funcționează, ce nu, și ce am face diferit, 20 de minute de lucru real, nu un pretext de vânzare.',
    deliverable: 'analiza inițială, în scris, în 24h',
  },
  {
    when: 'Ziua 2',
    title: 'Call de 20 de minute',
    desc: 'Parcurgem împreună concluziile. Îți spunem direct ce e de corectat, chiar dacă e incomod, chiar dacă decizi să lucrezi cu altcineva.',
    deliverable: 'lista de priorități, cu impact estimat',
  },
  {
    when: 'Ziua 3',
    title: 'Propunere cu preț fix',
    desc: 'Scope clar, preț fix, termene asumate. Fără taxe ascunse, fără contract pe termen lung, lucrăm lunar, cu o lună preaviz.',
    deliverable: 'oferta finală, pe o pagină, nu pe patruzeci',
  },
  {
    when: 'Săptămâna 2',
    title: 'Primul sistem live',
    desc: 'Landing-ul, campania sau agentul AI, primul livrabil e ceva funcțional, care lucrează pentru tine, nu un slide deck.',
    deliverable: 'sistemul live + acces total în conturile tale',
  },
]

const rhythm = [
  {
    title: 'Raport săptămânal',
    desc: 'Scurt, generat automat din datele reale ale conturilor tale: ce am cheltuit, ce a produs, ce schimbăm. Fără dashboard-uri inventate.',
  },
  {
    title: 'Optimizare continuă',
    desc: 'Testăm, măsurăm, tăiem ce nu livrează. Când ceva funcționează, scalăm în direcția aia. Când nu, recunoaștem și schimbăm.',
  },
  {
    title: 'Acces direct',
    desc: 'Vorbești cu cei care execută, nu cu un account manager. Telefon, WhatsApp, email, răspundem în aceeași zi.',
  },
]

const slas = [
  'Răspuns la audit: maxim 24h',
  'Propunere după call: maxim 24h',
  'Site sau landing live: 10-14 zile',
  'Conturile de ads rămân ale tale, cu acces total',
  'Ieșire oricând, cu o lună preaviz',
]
</script>

<style scoped>
.proces {
  max-width: 900px;
  margin: 0 auto;
  padding: clamp(8rem, 12vw, 11rem) clamp(1.25rem, 4vw, 2.5rem) 6rem;
}

/* ── Hero ──────────────────────────────────────────────────────── */
.proces__hero {
  margin-bottom: 7rem;
}

.proces__eyebrow {
  display: block;
  font-family: var(--font-body);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-text-muted);
  margin-bottom: 1.8rem;
}

.proces__title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(2.6rem, 6vw, 5.5rem);
  line-height: 1.02;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  margin: 0 0 2rem;
}

.proces__title em {
  font-style: italic;
}

.proces__sub {
  font-family: var(--font-body);
  font-size: clamp(0.92rem, 1.15vw, 1.02rem);
  line-height: 1.75;
  color: var(--color-text-soft);
  max-width: 52ch;
  margin: 0;
}

/* ── Sections ─────────────────────────────────────────────────── */
.proces__section {
  margin-bottom: 7rem;
}

.proces__label {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(0.85rem, 1.2vw, 1.05rem);
  text-transform: uppercase;
  letter-spacing: 0.28em;
  color: var(--color-text-primary);
  margin: 0 0 3rem;
}

/* Timeline */
.proces__steps {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 0.5px solid var(--color-border-medium);
}

.proces__step {
  display: grid;
  grid-template-columns: 10rem 1fr;
  gap: 2rem;
  padding: 2.75rem 0;
  border-bottom: 0.5px solid var(--color-border-medium);
  align-items: start;
}

.proces__when {
  font-family: var(--font-display);
  font-style: italic;
  font-size: clamp(1.05rem, 1.6vw, 1.4rem);
  color: var(--color-text-faint);
  padding-top: 0.1em;
}

.proces__step-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.4rem, 2.2vw, 2rem);
  line-height: 1.12;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
  margin: 0 0 0.8rem;
}

.proces__step-desc {
  font-family: var(--font-body);
  font-size: 0.9rem;
  line-height: 1.75;
  color: var(--color-text-soft);
  max-width: 560px;
  margin: 0 0 1rem;
}

.proces__deliverable {
  font-family: var(--font-body);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-text-muted);
}

/* Ritmul lunar */
.proces__rhythm {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  border-top: 0.5px solid var(--color-border-medium);
  border-bottom: 0.5px solid var(--color-border-medium);
}

.proces__rhythm-item {
  padding: 2.5rem 2rem 2.5rem 0;
}

.proces__rhythm-item + .proces__rhythm-item {
  border-left: 0.5px solid var(--color-border-medium);
  padding-left: 2rem;
}

.proces__rhythm-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-style: italic;
  font-size: clamp(1.2rem, 1.8vw, 1.6rem);
  color: var(--color-text-primary);
  margin: 0 0 1rem;
}

.proces__rhythm-desc {
  font-family: var(--font-body);
  font-size: 0.85rem;
  line-height: 1.7;
  color: var(--color-text-soft);
  margin: 0;
}

/* SLA */
.proces__sla {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 0.5px solid var(--color-border-medium);
}

.proces__sla-item {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(1.15rem, 1.9vw, 1.7rem);
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
  padding: 1.4rem 0;
  border-bottom: 0.5px solid var(--color-border-medium);
}

/* CTA */
.proces__cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding-top: 3rem;
  border-top: 0.5px solid var(--color-border);
}

.proces__cta-text {
  font-family: var(--font-display);
  font-style: italic;
  font-size: clamp(1.8rem, 3.5vw, 3.2rem);
  font-weight: 400;
  color: var(--color-text-muted);
  margin: 0;
}

.proces__cta-btn {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-bg);
  background: var(--color-text);
  border: 0.5px solid var(--color-text);
  padding: 0.95rem 2rem;
  border-radius: 999px;
  text-decoration: none;
  white-space: nowrap;
  transition: opacity 0.3s ease;
}

.proces__cta-btn:hover {
  opacity: 0.82;
}

/* ── Mobile ───────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .proces__hero {
    margin-bottom: 5rem;
  }

  .proces__section {
    margin-bottom: 5rem;
  }

  .proces__step {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 2rem 0;
  }

  .proces__rhythm {
    grid-template-columns: 1fr;
  }

  .proces__rhythm-item {
    padding: 1.75rem 0;
  }

  .proces__rhythm-item + .proces__rhythm-item {
    border-left: none;
    border-top: 0.5px solid var(--color-border-medium);
    padding-left: 0;
  }

  .proces__cta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
