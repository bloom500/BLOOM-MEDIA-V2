<template>
  <section class="contact" aria-labelledby="contact-heading">
    <div class="contact__grain" aria-hidden="true" />

    <div class="contact__content">
      <div class="contact__left">
        <span
          class="contact__label"
          string="split"
          string-split="line[center]"
          string-repeat
        >07 — Contact</span>
        <h2 id="contact-heading" class="contact__title">
          <span>Să</span>
          <span class="contact__title--accent">vorbim.</span>
        </h2>
        <p class="contact__sub">
          Fie că ai un proiect concret sau vrei
          să înțelegi cum te putem ajuta —
          suntem la un mesaj distanță.
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
          <NuxtLink
            to="/configurator"
            class="contact__btn-secondary"
          >
            Configurează pachetul
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
  overflow: hidden;
  width: 100%;
  background: transparent;
  padding: 8rem 2.5rem 6rem;
}

.contact__grain {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.06;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 160px 160px;
}

.contact__content {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(2rem, 5vw, 5rem);
  align-items: start;
  max-width: 1200px;
  margin: 0 auto;
}

.contact__label {
  display: block;
  font-family: var(--font-body);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--color-text-soft);
  margin-bottom: 2rem;
}

.contact__title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(3rem, 8vw, 7rem);
  line-height: 0.95;
  color: var(--color-text);
  margin: 0 0 2rem;
  display: flex;
  flex-direction: column;
}

.contact__title--accent {
  font-style: italic;
  color: var(--color-text);
  padding-left: 8vw;
}

.contact__sub {
  font-family: var(--font-body);
  font-size: 0.95rem;
  line-height: 1.75;
  color: var(--color-text-soft);
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
  border-top: 0.5px solid var(--color-border);
  text-decoration: none;
  color: inherit;
  transition: background 0.35s var(--ease-2);
}

.contact__channel:last-of-type {
  border-bottom: 0.5px solid var(--color-border);
}

.contact__channel:hover {
  background: rgba(0, 0, 0, 0.03);
}

.contact__channel-label {
  font-family: var(--font-body);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-text-faint);
}

.contact__channel-value {
  font-family: var(--font-display);
  font-size: clamp(1.15rem, 2vw, 1.5rem);
  font-weight: 400;
  color: var(--color-text);
}

.contact__channel:hover .contact__channel-value {
  color: var(--color-text);
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
  color: #ffffff;
  background-color: var(--color-text);
  border: 0.5px solid var(--color-text);
  transition:
    background 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
}

.contact__btn-primary:hover {
  background-color: rgba(0, 0, 0, 0.85);
  color: #ffffff;
}

.contact__btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.95rem 1.75rem;
  font-family: var(--font-body);
  font-size: 0.68rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  text-decoration: none;
  color: var(--color-text);
  background: transparent;
  border: 0.5px solid var(--color-border-medium);
  transition:
    border-color 0.3s ease,
    color 0.3s ease,
    background 0.3s ease;
}

.contact__btn-secondary:hover {
  border-color: var(--color-border-strong);
  color: var(--color-text);
  background: rgba(0, 0, 0, 0.04);
}

@media (max-width: 768px) {
  .contact {
    padding: 5rem 1.25rem 4rem;
  }

  .contact__content {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .contact__title--accent {
    padding-left: 14vw;
  }

  .contact__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .contact__btn-primary,
  .contact__btn-secondary {
    width: 100%;
    text-align: center;
  }
}
</style>
