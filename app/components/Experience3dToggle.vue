<template>
  <!--
    Toggle „experiență 3D" — colț dreapta-jos, ca „Off"-ul de pe
    immersive-g.com. Escape hatch pentru baterie/performanță pe mobil;
    pe desktop e discret și nu concurează cu CTA-ul din stânga.
  -->
  <button
    type="button"
    class="x3d-toggle"
    :aria-pressed="enabled"
    @click="toggle"
  >
    3D <span class="x3d-toggle__state">{{ enabled ? 'On' : 'Off' }}</span>
  </button>
</template>

<script setup lang="ts">
import { use3d } from '~/composables/use3d'

const { enabled, toggle } = use3d()
</script>

<style scoped>
.x3d-toggle {
  position: fixed;
  right: 2.5rem;
  bottom: 1.5rem;
  z-index: 9990;
  background: none;
  border: none;
  padding: 0.4rem 0;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-text-muted);
  transition: color 0.25s ease;
}

.x3d-toggle:hover {
  color: var(--color-text-primary);
}

.x3d-toggle__state {
  opacity: 0.6;
}

@media (max-width: 767px) {
  .x3d-toggle {
    right: 1.25rem;
    bottom: 1.25rem;
  }
}
</style>
