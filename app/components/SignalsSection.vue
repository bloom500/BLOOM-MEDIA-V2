<template>
  <section class="signals" aria-label="Condiții de colaborare">
    <div class="signals__inner">
      <div v-for="sig in signals" :key="sig.big" class="signals__item">
        <span class="signals__big">{{ sig.big }}</span>
        <span class="signals__small">{{ sig.small }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { PRICING } from '~/lib/pricing'

const signals = [
  {
    big: `de la ${PRICING.marketingFeeFrom}€/lună`,
    small: 'fee de management, transparent, per canal',
  },
  {
    big: 'zero lock-in',
    small: 'lucrăm lunar, cu o lună preaviz — dacă nu livrăm, pleci',
  },
  {
    big: 'conturile tale',
    small: 'acces total la Meta și Google — datele rămân ale tale',
  },
]
</script>

<style scoped>
.signals {
  position: relative;
  width: 100%;
  padding: 6rem 2.5rem;
}

.signals__inner {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 0.5px solid var(--color-border-medium);
  border-bottom: 0.5px solid var(--color-border-medium);
}

.signals__item {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 3rem 2rem;
}

.signals__item + .signals__item {
  border-left: 0.5px solid var(--color-border-medium);
}

.signals__big {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(1.5rem, 2.6vw, 2.5rem);
  line-height: 1;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
}

.signals__small {
  font-family: var(--font-body);
  font-size: 0.75rem;
  line-height: 1.6;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-soft);
}

@media (max-width: 900px) {
  .signals {
    padding: 4rem 1.25rem;
  }

  .signals__inner {
    grid-template-columns: 1fr;
  }

  .signals__item {
    padding: 1.75rem 0.5rem;
  }

  .signals__item + .signals__item {
    border-left: none;
    border-top: 0.5px solid var(--color-border-medium);
  }
}
</style>
