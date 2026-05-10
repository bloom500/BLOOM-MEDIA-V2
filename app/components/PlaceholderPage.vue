<template>
  <main class="placeholder-page">
    <h1 class="placeholder-page__title">
      {{ title }}
    </h1>
    <p class="placeholder-page__text">
      Pagină în lucru — revin în curând cu conținut complet.
    </p>
    <NuxtLink to="/" class="placeholder-page__link">
      ← Înapoi la pagina principală
    </NuxtLink>
  </main>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<style scoped>
.placeholder-page {
  min-height: 55vh;
  padding: 7.5rem 2.5rem 4rem;
  max-width: 36rem;
}

.placeholder-page__title {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 400;
  margin: 0 0 1rem;
  color: var(--color-text);
}

.placeholder-page__text {
  font-family: var(--font-body);
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--color-text-muted);
  margin: 0 0 2rem;
}

.placeholder-page__link {
  font-family: var(--font-body);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-text-soft);
  text-decoration: none;
}

.placeholder-page__link:hover {
  color: var(--color-text);
}
</style>
