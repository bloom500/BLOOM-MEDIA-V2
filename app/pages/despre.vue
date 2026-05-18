<template>
  <div class="site-main">
    <AboutSection />
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import AboutSection from '~/components/AboutSection.vue'
import TheFooter from '~/components/TheFooter.vue'

useHead({
  title: 'Despre — Bloom Media',
  htmlAttrs: { 'data-page': 'despre' },
  meta: [
    {
      name: 'description',
      content: 'Bloom Media este o agenție de marketing digital din Cluj-Napoca. Construim strategii testate, măsurabile și ajustate până când funcționează cu adevărat.',
    },
    { property: 'og:title',       content: 'Despre — Bloom Media' },
    { property: 'og:description', content: 'Strategie, onestitate și rezultate măsurabile. Aflați cum lucrăm și ce ne diferențiază.' },
    { property: 'og:url',         content: 'https://bloommedia.ro/despre' },
    { name: 'robots',             content: 'index, follow' },
  ],
  link: [{ rel: 'canonical', href: 'https://bloommedia.ro/despre' }],
})
</script>
