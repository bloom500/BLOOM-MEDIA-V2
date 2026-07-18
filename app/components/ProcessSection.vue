<template>
  <section
    class="process"
    aria-labelledby="process-heading"
  >
    <div class="process__inner">
      <h2 id="process-heading" class="process__title">Cum lucrăm</h2>

      <p class="process__lead">
        <span class="process__line" string="split" string-split="word" data-anim="surface-dissolve">Fără ședințe interminabile.</span>
        <span class="process__line" string="split" string-split="word" data-anim="surface-dissolve">Fiecare pas are o dată și un livrabil.</span>
      </p>

      <ol class="process__steps">
        <li v-for="step in steps" :key="step.when" class="process__step">
          <span class="process__when">{{ step.when }}</span>
          <div class="process__step-body">
            <h3 class="process__step-title">{{ step.title }}</h3>
            <p class="process__step-desc">{{ step.desc }}</p>
          </div>
        </li>
      </ol>

      <div class="process__foot">
        <NuxtLink to="/proces" class="process__more">
          Vezi procesul complet →
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const steps = [
  {
    when: 'Ziua 0',
    title: 'Audit gratuit',
    desc: 'Completezi formularul. Analizăm site-ul, ads-urile și prezența ta, 20 de minute de lucru real, nu un pretext de vânzare.',
  },
  {
    when: 'Ziua 2',
    title: 'Call de 20 de minute',
    desc: 'Îți spunem ce nu merge și ce am face diferit. Direct, chiar dacă e incomod.',
  },
  {
    when: 'Ziua 3',
    title: 'Propunere cu preț fix',
    desc: 'Scope clar, preț fix, fără taxe ascunse. Semnezi doar dacă are sens, lucrăm lunar, cu o lună preaviz.',
  },
  {
    when: 'Săptămâna 2',
    title: 'Primul sistem live',
    desc: 'Site-ul, campania sau agentul AI, primul livrabil funcțional, nu un slide deck.',
  },
]
</script>

<style scoped>
.process {
  position: relative;
  width: 100%;
  padding: 12rem 2.5rem;
}

.process__inner {
  max-width: 900px;
  margin: 0 auto;
}

.process__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(0.9rem, 1.4vw, 1.2rem);
  text-transform: uppercase;
  letter-spacing: 0.28em;
  color: var(--color-text-primary);
  text-align: right;
  margin: 0 0 3rem;
}

.process__lead {
  max-width: 42rem;
  margin: 0 0 5rem auto;
  text-align: right;
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(1.5rem, 2.4vw, 2.6rem);
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
}

.process__line {
  display: block;
}

.process__steps {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 0.5px solid var(--color-border-medium);
}

.process__step {
  display: grid;
  grid-template-columns: 10rem 1fr;
  gap: 2rem;
  padding: 2.5rem 0;
  border-bottom: 0.5px solid var(--color-border-medium);
  align-items: start;
}

.process__when {
  font-family: var(--font-display);
  font-style: italic;
  font-size: clamp(1rem, 1.5vw, 1.3rem);
  color: var(--color-text-faint);
  padding-top: 0.15em;
}

.process__step-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.3rem, 2vw, 1.9rem);
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
  margin: 0 0 0.7rem;
}

.process__step-desc {
  font-family: var(--font-body);
  font-size: 0.88rem;
  line-height: 1.7;
  color: var(--color-text-soft);
  max-width: 560px;
  margin: 0;
}

.process__foot {
  margin-top: 3rem;
  text-align: right;
}

.process__more {
  font-family: var(--font-body);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-text-muted);
  text-decoration: none;
  padding-bottom: 0.4rem;
  border-bottom: 0.5px solid var(--color-border-strong);
  transition: color 0.3s ease, border-color 0.3s ease;
}

.process__more:hover {
  color: var(--color-text);
  border-bottom-color: var(--color-text);
}

@media (max-width: 768px) {
  .process {
    padding: 8rem 1.25rem;
  }

  .process__lead {
    font-size: clamp(1.4rem, 5.5vw, 2rem);
    margin-bottom: 3rem;
  }

  .process__step {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 2rem 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .process__lead {
    color: var(--color-text-primary);
    filter: none;
  }
}
</style>
