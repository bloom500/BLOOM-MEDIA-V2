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
    <section
      class="manifest"
      aria-label="Manifest"
      string="progress"
      string-enter-vp="top"
    >
      <div class="manifest__inner">
        <p class="manifest-text">
          <span class="manifest-line" string="split" string-split="word" data-anim="surface-dissolve">Există business-uri care cresc</span>
          <span class="manifest-line" string="split" string-split="word" data-anim="surface-dissolve">și business-uri care cheltuiesc.</span>
          <span class="manifest-line" string="split" string-split="word" data-anim="surface-dissolve">Diferența, de cele mai multe ori,</span>
          <span class="manifest-line" string="split" string-split="word" data-anim="surface-dissolve">e o decizie bună luată la momentul potrivit.</span>
        </p>
      </div>
    </section>
    <VideoMeshSection />
    <ServicesSection />
    <ProcessSection />
    <VideoMeshDuo />
    <WhyBloomSection />
    <FaqSection />
    <ContactSection />
    <FooterReveal />
  </main>
</template>

<style scoped>
/* SpringTune footer removed — .site-main no longer needs to mask it */
.site-main {
  background: transparent !important;
}

.manifest {
  min-height: 100svh;
  display: flex;
  align-items: center;
  background: transparent;
  padding: 0 8vw;
  box-sizing: border-box;
}

.manifest__inner {
  width: 100%;
  max-width: 780px;
}

.manifest-text {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(1.6rem, 2.6vw, 3rem);
  line-height: 1.1;
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: -0.01em;
}

.manifest-line {
  display: block;
}

@media (max-width: 768px) {
  .manifest {
    padding: 0 6vw;
    align-items: flex-start;
    padding-top: 25vh;
  }

  .manifest-text {
    font-size: clamp(1.5rem, 6vw, 2.2rem);
    line-height: 1.15;
  }
}
</style>
