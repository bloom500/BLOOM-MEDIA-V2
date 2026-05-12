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
    <ResultsSection />
    <TestimonialsSection />
    <TeamPreviewSection />
    <ConfiguratorCtaSection />
    <SalutSection />
  </main>
</template>

<style scoped>
.site-main {
  position: relative;
  z-index: 20;
  background: transparent !important;
}
</style>
