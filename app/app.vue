<template>
  <!--
    Fundal 3D: pe / → fishpond (ReliefSlab); pe restul rutelor → plan procedural (Morphing).
    Stacking: morph z-0, relief slab z-1, conținut site z-2 (vezi .site-content).
  -->
  <ClientOnly>
    <SiteBackground3d />
  </ClientOnly>

  <!-- Page content -->
  <div class="site-content">
    <TheNavbar />
    <NuxtPage />
  </div>

  <FixedServicesCta />

  <CustomCursor />
</template>

<script setup>
import { onMounted, nextTick } from 'vue'
import CustomCursor from '~/components/CustomCursor.vue'
import FixedServicesCta from '~/components/FixedServicesCta.vue'
import SiteBackground3d from '~/components/SiteBackground3d.vue'
import { initStringTune, getStringTune } from '~/lib/stringtune/client'
// useViewportHeight kept available but currently unused — see note below.
// import { useViewportHeight } from '~/composables/useViewportHeight'

// Set lang="ro" globally — critical for Romanian SEO and screen readers.
useHead({ htmlAttrs: { lang: 'ro' } })

// useViewportHeight() was wired here for the classic --vh fallback pattern,
// but the codebase migrated to `100svh` everywhere because `dvh` and the
// `var(--vh)` JS-set value both *resize* on iOS browser-bar collapse,
// which retriggers layout, StringTune progress and WebGL canvas resize at
// every scroll-direction change. svh is locked to the small viewport so
// iOS can collapse/expand its bar without touching our flow. Composable
// kept in /composables in case a future section needs it on demand.
// useViewportHeight()

onMounted(async () => {
  await nextTick()
  if (!import.meta.client) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  initStringTune({ loadingTimeout: 450 })
  const st = getStringTune()
  if (st) window.__st = st
})
</script>

<style>
.site-content {
  position: relative;
  z-index: 2;
  /*
   * Like body: track dvh so the freed space below the hero (when iOS
   * collapses its bar) is absorbed by the wrapper, not visible as a
   * gap. Hero itself is pinned to JS-captured pixel height — see
   * HeroSection.vue.
   */
  min-height: 100svh;
  min-height: 100dvh;
}

/* Servicii page — dark html+body so scroll area never shows white */
html[data-page="servicii"],
html[data-page="servicii"] body {
  background: #060604;
}
</style>
