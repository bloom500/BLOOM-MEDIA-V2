<template>
  <section class="services">
    <div class="services__grain" aria-hidden="true" />

    <div class="services__header">
      <h2 class="services__title">
        <span
          string="split"
          string-split="char"
          string-repeat
          data-anim="char-reveal"
        >Ce</span>
        <span
          class="services__title--accent"
          string="split"
          string-split="char"
          string-repeat
          data-anim="char-reveal"
        >construim</span>
      </h2>
    </div>

    <div class="services__list">
      <article class="service" string string-repeat data-anim="stagger-item">
        <div class="service__num">
          01
        </div>
        <div class="service__main">
          <h3 class="service__name">
            Meta și Google Ads
          </h3>
          <p class="service__desc">
            Campanii plătite cu ROAS transparent. Targetăm exact audiența care cumpără — nu aruncăm bugetul la întâmplare. KPI-uri clare de la prima ședință.
          </p>
        </div>
        <div class="service__tag">
          Performance
        </div>
      </article>

      <article class="service" string string-repeat data-anim="stagger-item">
        <div class="service__num">
          02
        </div>
        <div class="service__main">
          <h3 class="service__name">
            Web Design și Landing Pages
          </h3>
          <p class="service__desc">
            Site-uri și landing pages care transformă vizitatorii în clienți. De la concept la deploy în Nuxt, SvelteKit sau WordPress — rapid, curat, optimizat pentru conversii.
          </p>
        </div>
        <div class="service__tag">
          Design
        </div>
      </article>

      <article class="service" string string-repeat data-anim="stagger-item">
        <div class="service__num">
          03
        </div>
        <div class="service__main">
          <h3 class="service__name">
            Automatizare și AI
          </h3>
          <p class="service__desc">
            Fluxuri automate care elimină munca repetitivă din business-ul tău — lead scoring, follow-up, rapoarte. Tu te concentrezi pe strategie, automatizările fac restul.
          </p>
        </div>
        <div class="service__tag">
          AI
        </div>
      </article>

      <article class="service" string string-repeat data-anim="stagger-item">
        <div class="service__num">
          04
        </div>
        <div class="service__main">
          <h3 class="service__name">
            Consultanță Strategică
          </h3>
          <p class="service__desc">
            Analizăm unde se pierd banii acum și construim planul de creștere pentru următoarele 90 de zile. Fără șabloane, fără promisiuni vagi.
          </p>
        </div>
        <div class="service__tag">
          Strategy
        </div>
      </article>
    </div>

    <div class="services__footer">
      <NuxtLink to="/servicii" class="services__cta">
        Vezi toate detaliile →
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.services {
  position: relative;
  overflow: hidden;
  width: 100%;
  min-height: 100svh;
  min-height: 100dvh;
  background: transparent;
  padding: 8rem 2.5rem 6rem;
}

.services__grain {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.06;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 160px 160px;
}

.services__header {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 6rem;
}

.services__title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(3rem, 8vw, 9rem);
  line-height: 0.95;
  color: var(--color-text);
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.services__title--accent {
  font-style: italic;
  color: var(--color-text);
  padding-left: 8vw;
}

.services__list {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
}

.service {
  display: grid;
  grid-template-columns: 80px 1fr 140px;
  gap: 2rem;
  align-items: start;
  padding: 2.5rem 0;
  border-top: 0.5px solid var(--color-border);
  opacity: 0;
  transform: translate3d(0, 30px, 0);
  transition:
    opacity 0.6s var(--ease-2),
    transform 0.6s var(--ease-2),
    padding 0.5s var(--ease-2);
}

.service.-inview {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.service:nth-child(2) {
  transition-delay: 0.1s;
}

.service:nth-child(3) {
  transition-delay: 0.2s;
}

.service:nth-child(4) {
  transition-delay: 0.3s;
}

@media (prefers-reduced-motion: reduce) {
  .service {
    opacity: 1;
    transform: none;
    transition: padding 0.5s var(--ease-2);
  }
}

.service:last-child {
  border-bottom: 0.5px solid var(--color-border);
}

.service:hover {
  padding-left: 1.5rem;
}

.service__num {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--color-text-soft);
  padding-top: 0.4rem;
}

.service__main {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.service__name {
  font-family: var(--font-ui);
  font-weight: 600;
  font-size: clamp(1.8rem, 3.5vw, 3.5rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--color-text);
  margin: 0;
}

.service__desc {
  font-family: var(--font-body);
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--color-text-muted);
  max-width: 540px;
  margin: 0;
}

.service__tag {
  justify-self: end;
  align-self: start;
  font-family: var(--font-body);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-text-faint);
  padding: 0.4rem 0.9rem;
  border: 0.5px solid var(--color-border-medium);
  border-radius: 999px;
  margin-top: 0.6rem;
}

.services__footer {
  position: relative;
  z-index: 2;
  margin-top: 4rem;
  display: flex;
  justify-content: flex-end;
}

.services__cta {
  font-family: var(--font-body);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-text-muted);
  text-decoration: none;
  padding: 0.8rem 0;
  border-bottom: 0.5px solid var(--color-border-strong);
  transition:
    color 0.4s var(--ease-2),
    border-bottom-color 0.4s var(--ease-2);
}

.services__cta:hover {
  color: var(--color-text);
  border-bottom-color: var(--color-text);
}

@media (max-width: 768px) {
  .services {
    padding: 5rem 1.25rem 3rem;
  }

  .services__title--accent {
    padding-left: 12vw;
  }

  .service {
    grid-template-columns: 50px 1fr;
    gap: 1rem;
    padding: 2rem 0;
  }

  .service__num {
    grid-column: 1;
    grid-row: 1;
  }

  .service__main {
    grid-column: 2;
    grid-row: 1;
  }

  .service__tag {
    grid-column: 2;
    grid-row: 2;
    justify-self: start;
    margin-top: 0;
  }

  .service:hover {
    padding-left: 0;
  }
}
</style>
