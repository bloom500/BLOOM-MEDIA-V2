<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

useHead({
  title: 'Bloom Media — Agenție de Marketing Digital în Cluj-Napoca',
  meta: [
    {
      name: 'description',
      content: 'Bloom Media este o agenție de marketing digital din Cluj-Napoca. Meta Ads, Google Ads, Web Design și Automatizări AI pentru business-uri care vor creștere reală și rezultate măsurabile.'
    },
    // Open Graph
    { property: 'og:type',        content: 'website' },
    { property: 'og:url',         content: 'https://bloommedia.ro/' },
    { property: 'og:title',       content: 'Bloom Media — Agenție de Marketing Digital în Cluj-Napoca' },
    { property: 'og:description', content: 'Meta Ads, Google Ads, Web Design și Automatizări AI pentru business-uri care vor creștere reală și rezultate măsurabile.' },
    { property: 'og:image',       content: 'https://bloommedia.ro/og-image.jpg' },
    { property: 'og:locale',      content: 'ro_RO' },
    // Twitter / X Cards
    { name: 'twitter:card',        content: 'summary_large_image' },
    { name: 'twitter:title',       content: 'Bloom Media — Agenție de Marketing Digital în Cluj-Napoca' },
    { name: 'twitter:description', content: 'Meta Ads, Google Ads, Web Design și AI pentru business-uri care vor creștere reală.' },
    { name: 'twitter:image',       content: 'https://bloommedia.ro/og-image.jpg' },
    // Crawl
    { name: 'robots', content: 'index, follow' },
    // Geo targeting (ajută pentru căutări locale Cluj)
    { name: 'geo.region',      content: 'RO-CJ' },
    { name: 'geo.placename',   content: 'Cluj-Napoca' },
    { name: 'geo.position',    content: '46.7712;23.6236' },
    { name: 'ICBM',            content: '46.7712, 23.6236' },
  ],
  link: [
    { rel: 'canonical', href: 'https://bloommedia.ro/' },
  ],
  // JSON-LD: LocalBusiness + FAQPage (rich results în SERP)
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': ['Organization', 'LocalBusiness'],
        name: 'Bloom Media',
        legalName: 'Bloom Ventures SRL',
        url: 'https://bloommedia.ro',
        logo: 'https://bloommedia.ro/og-image.jpg',
        description: 'Agenție de marketing digital din Cluj-Napoca. Meta Ads, Google Ads, Web Design și Automatizări AI.',
        vatID: 'RO54500579',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Cluj-Napoca',
          addressRegion: 'Cluj',
          addressCountry: 'RO',
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+40763281168',
            contactType: 'sales',
            areaServed: 'RO',
            availableLanguage: 'Romanian',
          },
        ],
        email: 'hello@bloommedia.ro',
        sameAs: [
          'https://www.facebook.com/profile.php?id=61587068890787',
          'https://www.instagram.com/bloom_media_marketing/',
        ],
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Cât costă serviciile Bloom Media?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Site-urile custom încep de la 2.200€. Marketing-ul pornește de la 800€/lună. Primești ofertă fixă în 24h. Fără taxe ascunse.',
            },
          },
          {
            '@type': 'Question',
            name: 'Există contract pe termen lung?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Nu. Lucrăm lunar, cu o lună preaviz. Dacă nu livrăm, pleci. Ne ține atenți.',
            },
          },
          {
            '@type': 'Question',
            name: 'Cât durează până văd rezultate?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Site: 10–14 zile. Ads: primele semnale în 2–3 săptămâni, rezultate consistente după 60–90 de zile.',
            },
          },
          {
            '@type': 'Question',
            name: 'Cu ce tipuri de business lucrați?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Cu afaceri care au deja tracțiune: clinici, e-commerce, servicii locale, B2B. Nu luăm proiecte la nivel de idee.',
            },
          },
          {
            '@type': 'Question',
            name: 'Oferiți rapoarte și transparență?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Da. Ai acces direct în conturile tale de Google și Meta. Noi trimitem un raport scurt săptămânal. Fără dashboard-uri inventate.',
            },
          },
          {
            '@type': 'Question',
            name: 'Pot lua un singur serviciu?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Da. Doar site, doar ads sau doar consultanță. Nu forțăm pachete.',
            },
          },
          {
            '@type': 'Question',
            name: 'Cum încep colaborarea cu Bloom Media?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Completezi auditul gratuit. Facem un call de 20 de minute. În 24h ai propunerea pe masă.',
            },
          },
        ],
      }),
    },
  ],
})

/*
 * Dark-curtain transition: starts fading in just before FAQ section ends,
 * fully opaque by the time Contact begins. Drives also navbar/CTA color
 * via cursorDark useState, which is already wired into CustomCursor.vue,
 * TheNavbar.vue and FixedServicesCta.vue (after the small additions in
 * those components).
 */
const faqEndAnchor = ref<HTMLElement | null>(null)
const cursorDark = useState('cursorDark', () => false)
const tailEl = ref<HTMLElement | null>(null)
let curtainCtx: { revert: () => void } | null = null

onMounted(async () => {
  if (!import.meta.client) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Skip the scrub animation; just snap dark on once we cross the anchor.
    const obs = new IntersectionObserver(
      ([entry]) => { cursorDark.value = entry.isIntersecting || entry.boundingClientRect.top < 0 },
      { rootMargin: '0px 0px -100% 0px' }
    )
    if (faqEndAnchor.value) obs.observe(faqEndAnchor.value)
    return
  }

  const { gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)

  curtainCtx = gsap.context(() => {
    /*
     * Opacity scrubs from 0 → 1 over a 30vh window starting where the FAQ
     * section ends. Opacity is on .page-curtain (not on individual sections),
     * so the relief 3D background is the thing that actually gets covered.
     */
    ScrollTrigger.create({
      trigger: faqEndAnchor.value,
      start: 'top 65%',
      end: 'top 25%',
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress
        document.documentElement.style.setProperty('--page-curtain-opacity', String(p))
        // Flip cursor/navbar to white once the curtain is mostly drawn.
        cursorDark.value = p > 0.5
      },
    })
  })

  /*
   * Refresh every existing ScrollTrigger after our anchor + page-tail are in
   * the DOM. FooterReveal mounts before us and computes its pin positions
   * relative to the document at that moment — but our 60vh tail pushes the
   * footer down, invalidating those positions. Without this refresh, the
   * footer reveal pin would never trigger and the static footer would render
   * silently below the curtain.
   */
  await nextTick()
  ScrollTrigger.refresh()
})

onBeforeUnmount(() => {
  curtainCtx?.revert()
  cursorDark.value = false
  if (typeof document !== 'undefined') {
    document.documentElement.style.removeProperty('--page-curtain-opacity')
  }
})
</script>

<template>
  <main class="site-main">
    <!--
      Fixed dark curtain. Lives inside .site-main (z:20 stacking context),
      sits behind every section (sections have transparent bg). Crossfades
      in via --page-curtain-opacity, which a ScrollTrigger above scrubs.
    -->
    <div class="page-curtain" aria-hidden="true" />

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

    <!-- Anchor at the FAQ→Contact boundary; ScrollTrigger uses this. -->
    <div ref="faqEndAnchor" class="curtain-anchor" aria-hidden="true" />

    <ContactSection />

    <!-- Two scroll-heights of black breathing room before the footer. -->
    <div ref="tailEl" class="page-tail" aria-hidden="true" />

    <FooterReveal />
  </main>
</template>

<style scoped>
.site-main {
  background: transparent !important;
}

/*
 * Pin every section above the curtain. Targets only the in-flow content
 * sections; deliberately skips:
 *   - the curtain itself
 *   - layout helpers (curtain-anchor, page-tail)
 *   - FooterReveal — it manages its own pin/teleport via ScrollTrigger and
 *     adding z-index here can confuse GSAP's pinning math; the footer is
 *     #000 anyway, so it blends seamlessly with the curtain.
 *
 * :deep() not needed — these are top-level children rendered by index.vue.
 */
.site-main > section,
.site-main > .manifest {
  position: relative;
  z-index: 1;
}

/*
 * Fixed-position black layer driven by --page-curtain-opacity. Sits between
 * the 3D relief (z:0 on body) and homepage sections.
 */
.page-curtain {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  /* #000 to match .footer-curtain in FooterReveal — any drift (#0a0a0a etc.)
     shows as a visible seam between the two layers when the footer reveal
     starts pinning. */
  background: #000;
  opacity: var(--page-curtain-opacity, 0);
  will-change: opacity;
}

.curtain-anchor {
  position: relative;
  height: 1px;
  margin: 0;
  pointer-events: none;
}

/*
 * Breathing room between Contact and Footer — about half a viewport,
 * just enough for the dark to settle before the footer reveal kicks in.
 */
.page-tail {
  position: relative;
  height: 60vh;
  pointer-events: none;
}

@media (max-width: 768px) {
  .page-tail {
    height: 40vh;
  }
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
