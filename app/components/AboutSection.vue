<template>
  <section
    class="about"
    aria-labelledby="about-heading"
    string="progress"
    string-enter-vp="top"
  >
    <div class="about__grain" aria-hidden="true" />

    <!-- ── Hero ──────────────────────────────────────────────── -->
    <div class="about__hero">
      <div class="about__hero-inner">
        <p class="about__eyebrow" id="about-heading">Bloom Media — Cluj-Napoca</p>

        <h1 class="about__headline">
          <span
            class="about__hl-line"
            string="split"
            string-split="word"
            data-anim="surface-dissolve"
          >Livrăm creștere</span>
          <span
            class="about__hl-line about__hl-line--indent"
            string="split"
            string-split="word"
            data-anim="surface-dissolve"
          >măsurabilă.</span>
        </h1>

        <div class="about__hero-cols">
          <p class="about__intro">
            <span
              string="split"
              string-split="word"
              data-anim="surface-dissolve"
            >Suntem o agenție de marketing digital construită în jurul unui singur principiu: testăm înainte să promitem și măsurăm tot ce facem.</span>
          </p>
          <p class="about__intro">
            <span
              string="split"
              string-split="word"
              data-anim="surface-dissolve"
            >Nu lucrăm cu oricine. Lucrăm cu business-uri care știu ce vor și sunt pregătite să crească — și construim strategii care funcționează în realitate, nu în slide-uri.</span>
          </p>
        </div>
      </div>
    </div>

    <!-- ── Filozofia ─────────────────────────────────────────── -->
    <div class="about__philo">
      <div class="about__philo-inner">
        <p class="about__philo-label">Filozofia noastră</p>

        <ul class="about__list" role="list">
          <li
            v-for="(item, i) in philosophy"
            :key="i"
            class="about__item"
          >
            <span class="about__item-num" aria-hidden="true">0{{ i + 1 }}</span>

            <div class="about__item-body">
              <h2
                class="about__item-title"
                string="split"
                string-split="word"
                data-anim="surface-dissolve"
              >{{ item.title }}</h2>
              <p
                class="about__item-desc"
                string="split"
                string-split="word"
                data-anim="surface-dissolve"
              >{{ item.desc }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const philosophy = [
  {
    title: 'Testăm înainte să promitem.',
    desc: 'Înainte să îți spunem că o strategie funcționează, o testăm. Lansăm, vedem ce se întâmplă în realitate, măsurăm în cifre concrete și ajustăm până când funcționează cu adevărat. Fără presupuneri, fără ghiceli.',
  },
  {
    title: 'Dacă merge, creștem. Dacă nu merge, schimbăm.',
    desc: 'Nu ne atașăm de idei care nu livrează rezultate. Când ceva funcționează, investim mai mult în direcția aia. Când nu funcționează, recunoaștem și schimbăm direcția. Simplu.',
  },
  {
    title: 'Orice agenție îți face prezentări frumoase. Puține îți arată și rezultate.',
    desc: 'Noi suntem dintre cele puține. Nu vindem slide-uri colorate, vindem creștere pe care o vezi în cifre reale, în contul tău de business.',
  },
  {
    title: 'Ne gândim unde vrei să fii peste 3 ani, dar începem de mâine.',
    desc: 'Nu lucrăm doar pentru luna curentă. Construim o strategie care să funcționeze pe termen lung, dar primul pas concret îl facem imediat, nu după șase ședințe de planificare.',
  },
  {
    title: 'Îți dăm ce contează, nu ce umple un raport.',
    desc: 'Nu îți trimitem documente de 40 de pagini pe care nu ai timp să le citești. Îți arătăm un singur lucru, dacă investiția ta în marketing crește sau nu.',
  },
]
</script>

<style scoped>
/* ── Base ─────────────────────────────────────────────────────── */
.about {
  position: relative;
  width: 100%;
  background: var(--color-bg-dark);
  color: #edebe6;
  overflow: hidden;
}

.about__grain {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 160px 160px;
}

/* ── Hero ─────────────────────────────────────────────────────── */
.about__hero {
  position: relative;
  z-index: 1;
  min-height: 100svh;
  display: flex;
  align-items: flex-end;
  padding: 8rem 2.5rem 7rem;
}

.about__hero-inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.about__eyebrow {
  font-family: var(--font-body);
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.28em;
  color: var(--color-text-muted);
  margin: 0 0 4rem;
}

.about__headline {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(3rem, 7vw, 8rem);
  line-height: 1.0;
  letter-spacing: -0.02em;
  color: #edebe6;
  margin: 0 0 0;
  display: flex;
  flex-direction: column;
}

.about__hl-line {
  display: block;
}

.about__hl-line--indent {
  font-style: italic;
  padding-left: 14vw;
}

/* Two-column intro below the headline */
.about__hero-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  margin-top: 4rem;
  padding-top: 2.5rem;
  border-top: 0.5px solid rgba(255, 255, 255, 0.1);
}

.about__intro {
  font-family: var(--font-body);
  font-size: clamp(0.92rem, 1.2vw, 1.05rem);
  line-height: 1.8;
  color: var(--color-text-muted);
  margin: 0;
}

/* ── Philosophy ───────────────────────────────────────────────── */
.about__philo {
  position: relative;
  z-index: 1;
  padding: 0 2.5rem 10rem;
}

.about__philo-inner {
  max-width: 1200px;
  margin: 0 auto;
  border-top: 0.5px solid rgba(255, 255, 255, 0.1);
  padding-top: 5rem;
}

.about__philo-label {
  font-family: var(--font-body);
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.28em;
  color: var(--color-text-muted);
  margin: 0 0 5rem;
}

.about__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.about__item {
  display: grid;
  grid-template-columns: 6rem 1fr;
  gap: 2rem 3rem;
  padding: 3.5rem 0;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.07);
  align-items: start;
}

.about__item:first-child {
  border-top: 0.5px solid rgba(255, 255, 255, 0.07);
}

.about__item-num {
  font-family: var(--font-display);
  font-style: italic;
  font-size: clamp(2rem, 3.5vw, 3.5rem);
  line-height: 1;
  color: rgba(237, 235, 230, 0.1);
  padding-top: 0.15em;
  user-select: none;
}

.about__item-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.about__item-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.3rem, 2vw, 2.1rem);
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: #edebe6;
  margin: 0;
}

.about__item-desc {
  font-family: var(--font-body);
  font-size: clamp(0.88rem, 1.1vw, 0.98rem);
  line-height: 1.8;
  color: var(--color-text-muted);
  max-width: 640px;
  margin: 0;
}

/* ── Mobile ───────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .about__hero {
    padding: 9rem 1.25rem 5rem;
    align-items: flex-start;
  }

  .about__hl-line--indent {
    padding-left: 18vw;
  }

  .about__hero-cols {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-top: 2.5rem;
    padding-top: 2rem;
  }

  .about__philo {
    padding: 0 1.25rem 6rem;
  }

  .about__philo-inner {
    padding-top: 3.5rem;
  }

  .about__philo-label {
    margin-bottom: 3.5rem;
  }

  .about__item {
    grid-template-columns: 3.5rem 1fr;
    gap: 1.25rem 1.5rem;
    padding: 2.5rem 0;
  }

  .about__item-num {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .about__headline,
  .about__intro,
  .about__item-title,
  .about__item-desc {
    opacity: 1;
    filter: none;
  }
}
</style>
