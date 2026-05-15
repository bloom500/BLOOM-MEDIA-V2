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
  min-height: 100vh;
}

/* Servicii page — dark html+body so scroll area never shows white */
html[data-page="servicii"],
html[data-page="servicii"] body {
  background: #060604;
}
</style>
