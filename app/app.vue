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
import { useViewportHeight } from '~/composables/useViewportHeight'

// Set lang="ro" globally — critical for Romanian SEO and screen readers.
useHead({ htmlAttrs: { lang: 'ro' } })

// iOS Safari 100vh fix — sets --vh on resize/orientation. Sections that
// need full-bleed height should use min-height: calc(var(--vh, 1dvh) * 100)
// so modern browsers stay on native 1dvh while iOS 15 falls back to JS.
useViewportHeight()

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
  /* Fall back order: 1dvh (modern), then JS-set --vh (iOS 15 / older). */
  min-height: 100dvh;
  min-height: calc(var(--vh, 1dvh) * 100);
}

/* Servicii page — dark html+body so scroll area never shows white */
html[data-page="servicii"],
html[data-page="servicii"] body {
  background: #060604;
}
</style>
