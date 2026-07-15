<template>
  <section id="contact" class="contact" aria-labelledby="contact-heading">
    <!--
      grain layer removed: original SVG noise was authored for the old
      light-paper backdrop. On the new black curtain, additive white noise
      at 0.06 opacity lifts the whole section from #000 to ~#0a0a0a, which
      reads as gray rather than the intended pure black.
    -->
    <div class="contact__content">
      <div class="contact__left">
        <h2 id="contact-heading" class="contact__title">
          <span class="contact__title--accent">Începem?</span>
        </h2>
        <p class="contact__sub">
          Luăm un proiect pro bono pe trimestru.
          Dacă e pentru o cauză bună, menționează
          asta la mesaj.
        </p>
      </div>

      <div class="contact__right">
        <div class="contact__channels">
          <a
            href="mailto:hello@bloommedia.ro"
            class="contact__channel"
          >
            <span class="contact__channel-label">Email</span>
            <span class="contact__channel-value">
              hello@bloommedia.ro
            </span>
          </a>

          <a
            href="tel:+40763281168"
            class="contact__channel"
          >
            <span class="contact__channel-label">
              Darius
            </span>
            <span class="contact__channel-value">
              0763 281 168
            </span>
          </a>

          <a
            href="tel:+40734270188"
            class="contact__channel"
          >
            <span class="contact__channel-label">
              Iancu
            </span>
            <span class="contact__channel-value">
              0734 270 188
            </span>
          </a>
        </div>

        <div class="contact__actions">
          <NuxtLink to="/audit" class="contact__btn-primary">
            Audit Gratuit
          </NuxtLink>
          <NuxtLink to="/servicii" class="contact__link-secondary">
            sau estimează investiția →
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.contact {
  position: relative;
  z-index: 1;
  overflow: hidden;
  width: 100%;
  background: transparent;
  color: #fff;
  padding: 8rem 2.5rem 6rem;
  /* Spațiu pentru rampa lungă spre footer (conținutul rămâne deasupra, z-index 3) */
  padding-bottom: clamp(9rem, 28vh, 16rem);
}

/*
 * Rampa cinematică Contact → Footer a fost mutată în .page-tail (index.vue):
 * acum cortina globală face tranziția light → dark înainte de Contact, deci
 * fundalul e deja #0a0a0a aici. Lăsăm doar grain-ul.
 */

.contact__content {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(2rem, 5vw, 5rem);
  align-items: start;
  max-width: 1200px;
  margin: 0 auto;
}

.contact__title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(3rem, 8vw, 7rem);
  line-height: 0.95;
  color: #fff;
  margin: 0 0 2rem;
  display: flex;
  flex-direction: column;
}

.contact__title--accent {
  font-style: italic;
  color: #fff;
}

.contact__sub {
  font-family: var(--font-body);
  font-size: 0.95rem;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.6);
  max-width: 400px;
  margin: 0;
}

.contact__right {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.contact__channels {
  display: flex;
  flex-direction: column;
}

.contact__channel {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1.5rem 0;
  border-top: 0.5px solid rgba(255, 255, 255, 0.14);
  text-decoration: none;
  color: inherit;
  transition: background 0.35s var(--ease-2);
}

.contact__channel:last-of-type {
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.14);
}

.contact__channel:hover {
  background: rgba(255, 255, 255, 0.04);
}

.contact__channel-label {
  font-family: var(--font-body);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: rgba(255, 255, 255, 0.4);
}

.contact__channel-value {
  font-family: var(--font-display);
  font-size: clamp(1.15rem, 2vw, 1.5rem);
  font-weight: 400;
  color: #fff;
}

.contact__channel:hover .contact__channel-value {
  color: #fff;
}

.contact__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.contact__btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.95rem 1.75rem;
  font-family: var(--font-body);
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  text-decoration: none;
  color: #060604;
  background-color: #fff;
  border: 0.5px solid #fff;
  transition:
    background 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
}

.contact__btn-primary:hover {
  background-color: rgba(255, 255, 255, 0.85);
  color: #060604;
}

.contact__link-secondary {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-body);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.55);
  padding: 0.95rem 0;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.25);
  transition: color 0.3s ease, border-color 0.3s ease;
}

.contact__link-secondary:hover {
  color: #fff;
  border-bottom-color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 768px) {
  .contact {
    padding: 5rem 1.25rem clamp(7rem, 22vh, 11rem);
  }

  .contact::after {
    height: clamp(180px, 48vh, 400px);
  }

  .contact__content {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .contact__title--accent {
    padding-left: 0;
  }

  .contact__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .contact__btn-primary {
    width: 100%;
    text-align: center;
  }

  .contact__link-secondary {
    align-self: center;
  }
}
</style>
