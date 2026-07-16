<template>
  <!--
    Teleport pe body: evită „containere” cu transform (footer StringTune, secțiuni)
    care fac ca position:fixed al relief-ului să nu mai fie raportat la viewport —
    rezultat: canvas 3D într-o „coloană” centrată în loc de fullscreen.
  -->
  <Teleport to="body">
    <div class="site-bg-3d" :class="{ 'site-bg-3d--home': isHome }" aria-hidden="true">
      <MorphingReliefBackground v-if="deferDone && enabled3d && !isHome && !isServicii && !isDespre" />
      <!--
        Fără gate WebGPU: WebGPURenderer cade automat pe backend-ul WebGL2
        (TSL → GLSL), deci ReliefSlab merge și pe Zen/Firefox — ca la
        immersive-g.com. Lag-ul observat inițial pe WebGL2 era la DPR 2;
        acum randăm la DPR 1 peste tot. Dacă tot e lent undeva, escape
        hatch = toggle-ul 3D On/Off (use3d).
      -->
      <ReliefSlab v-if="deferDone && enabled3d && isHome" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'

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

/*
 * 3D-ul rulează și pe mobil (decizie user, 2026-07-16, după analiza
 * immersive-g.com): pe telefon ReliefSlab recadrează close-up
 * (RELIEF_MOBILE_CLOSEUP_ZOOM) și randează la DPR 1 / 30fps. Costul pe
 * PageSpeed e asumat; escape hatch = toggle-ul 3D On/Off (use3d),
 * dreapta-jos, care persistă în localStorage.
 */
const { enabled: enabled3d } = use3d()

/*
 * Montarea 3D e amânată până după hidratare + un moment de idle. Fetch-ul
 * chunk-ului three + init-ul renderer-ului (compile pipelines) pe main
 * thread concurau cu hidratarea Nuxt și cu pornirea Lenis — de aici
 * „smooth scroll nu e activ instant" și lagul din prima secundă pe Mac.
 * Fundalul static --relief-scene-bg acoperă intervalul.
 */
const deferDone = ref(false)
onMounted(() => {
  const go = () => { deferDone.value = true }
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(go, { timeout: 600 })
  } else {
    // Safari < 18 nu are requestIdleCallback
    setTimeout(go, 250)
  }
})

const route = useRoute()
const isHome     = computed(() => route.path === '/' || route.name === 'index')
const isServicii = computed(() => route.path === '/servicii' || route.name === 'servicii')
const isDespre   = computed(() => route.path === '/despre' || route.name === 'despre')
</script>

<style scoped>
/*
 * Pe home, containerul poartă gri-ul scenei ca fundal static: acoperă
 * intervalul de defer al 3D-ului, toggle-ul 3D Off și telefoanele unde
 * canvas-ul întârzie — altfel se vedea body-ul deschis („fundal alb”,
 * raportat pe mobil 2026-07-17). Aceeași valoare ca RELIEF_SCENE_BG.
 */
.site-bg-3d--home {
  background: #c6c4c0;
}

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
