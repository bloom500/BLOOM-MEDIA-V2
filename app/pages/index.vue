<script setup lang="ts">
useHead({
  title: 'Bloom Media — Agenție de Marketing Digital în Cluj-Napoca',
  meta: [
    {
      name: 'description',
      content: 'Bloom Media este o agenție de marketing digital din Cluj-Napoca. Meta Ads, Google Ads, Web Design și Automatizări AI pentru business-uri care vor creștere reală și rezultate măsurabile.'
    },
    { property: 'og:title', content: 'Bloom Media — Agenție de Marketing Digital' },
    { property: 'og:description', content: 'Meta Ads, Google Ads, Web Design și AI pentru business-uri care vor creștere reală.' },
    { name: 'robots', content: 'index, follow' }
  ]
})
</script>

<template>
  <main class="site-main">
    <HeroSection />
    <DeclarationSection />
    <ServicesSection />
    <ProcessSection />
    <WhyBloomSection />
    <FaqSection />
    <ContactSection />
  </main>
</template>

<style scoped>
/*
 * Footer SpringTune: trebuie strat opac peste zona de jos ca footer-ul translat
 * să nu se vadă peste Contact (vezi tutorial-01-footer-shifting + main.css).
 * Gradient: sus transparent → 3D vizibil; jos --color-bg → mască pentru footer.
 */
.site-main {
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 68%,
    var(--color-bg) 76%,
    var(--color-bg) 100%
  ) !important;
}
</style>
