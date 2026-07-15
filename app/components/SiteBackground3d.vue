<template>
  <!--
    Teleport pe body: evită „containere” cu transform (footer StringTune, secțiuni)
    care fac ca position:fixed al relief-ului să nu mai fie raportat la viewport —
    rezultat: canvas 3D într-o „coloană” centrată în loc de fullscreen.
  -->
  <Teleport to="body">
    <div class="site-bg-3d" aria-hidden="true">
      <MorphingReliefBackground v-if="!isHome && !isServicii && !isDespre" />
      <!--
        Gate WebGPU: ReliefSlab e scris pe WebGPURenderer + TSL; fallback-ul
        WebGL2 al lui three e inutilizabil de lent pe browserele fără WebGPU
        (Firefox non-Windows, forkuri gen Zen) — lag care blochează pagina.
        Fără navigator.gpu nu montăm deloc: rămâne fundalul static
        --relief-scene-bg din main.css, iar bundle-ul three/webgpu nici nu
        se mai descarcă.
      -->
      <ReliefSlab v-if="isHome && hasWebGPU" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'

/*
 * Async-loaded so each route only ships the renderer it actually uses.
 * MorphingReliefBackground uses three (~600KB), ReliefSlab uses
 * three/webgpu and TSL — heavier still. Static imports were forcing
 * both bundles onto every page. Async cuts initial-load JS for any
 * non-home/non-servicii route by hundreds of KB.
 */
const MorphingReliefBackground = defineAsyncComponent(() =>
  import('~/components/MorphingReliefBackground.vue')
)
const ReliefSlab = defineAsyncComponent(() =>
  import('~/components/ReliefSlab.client.vue')
)

// SiteBackground3d e montat sub <ClientOnly>, deci navigator există la setup.
const hasWebGPU = typeof navigator !== 'undefined' && !!navigator.gpu

const route = useRoute()
const isHome     = computed(() => route.path === '/' || route.name === 'index')
const isServicii = computed(() => route.path === '/servicii' || route.name === 'servicii')
const isDespre   = computed(() => route.path === '/despre' || route.name === 'despre')
</script>

<style scoped>
.site-bg-3d {
  position: fixed;
  inset: 0;
  width: 100vw;
  /*
   * lvh = LARGE viewport (URL bar collapsed). Extends behind the iOS bar
   * so that when the bar collapses on scroll, the freshly revealed area
   * is still covered by the 3D background. svh would leave a strip of
   * exposed body underneath = visible gap.
   */
  min-height: 100lvh;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
</style>
