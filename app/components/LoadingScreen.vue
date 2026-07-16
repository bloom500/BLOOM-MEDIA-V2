<template>
  <!--
    Loading screen — pattern immersive-g.com: logo singur pe fundalul
    site-ului + o linie fină de progres; site-ul se dezvăluie doar când
    fonturile și (pe home) modelul 3D sunt gata. Randat și în SSR, deci
    e vizibil înaintea hidratării — nimic nu mai „apare" pe parcurs.
  -->
  <div v-if="visible" class="loading-screen" :class="{ 'is-leaving': leaving }" aria-hidden="true">
    <span class="loading-screen__logo">Bloom Media.</span>
    <span class="loading-screen__bar"><span class="loading-screen__fill" :style="{ transform: `scaleX(${progress})` }" /></span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const visible = ref(true)
const leaving = ref(false)
const progress = ref(0.15)

/*
 * Semnale așteptate:
 *  - document.fonts.ready (Gloock/Geist — titlurile nu mai fac swap)
 *  - pe home: 'bloom:relief-ready' de la ReliefSlab (model încărcat)
 * Fiecare semnal împinge bara; hard timeout 6s ca un asset căzut să nu
 * țină site-ul ostatic. Minim 500ms pe ecran ca să nu fie un flash.
 */
const HARD_TIMEOUT_MS = 6000
const MIN_SHOW_MS = 500

onMounted(() => {
  const t0 = performance.now()
  const route = useRoute()
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // ReliefSlab montează doar pe home, cu WebGPU, cu 3D-ul pornit.
  const waitRelief = route.path === '/' && !reduced
    && !!(navigator as { gpu?: unknown }).gpu
    && localStorage.getItem('bloom-3d') !== 'off'

  document.documentElement.style.overflow = 'hidden'

  let fontsDone = false
  let reliefDone = !waitRelief

  const update = () => {
    progress.value = 0.15 + (fontsDone ? 0.35 : 0) + (reliefDone ? 0.5 : 0)
    if (fontsDone && reliefDone) finish()
  }

  const finish = () => {
    if (leaving.value) return
    const wait = Math.max(0, MIN_SHOW_MS - (performance.now() - t0))
    setTimeout(() => {
      progress.value = 1
      leaving.value = true
      document.documentElement.style.overflow = ''
      // ține pasul cu transition-ul de opacity din CSS
      setTimeout(() => { visible.value = false }, 700)
    }, wait)
  }

  document.fonts.ready.then(() => { fontsDone = true; update() })
  if (waitRelief) {
    window.addEventListener('bloom:relief-ready', () => { reliefDone = true; update() }, { once: true })
  }
  setTimeout(() => { fontsDone = true; reliefDone = true; update() }, HARD_TIMEOUT_MS)
  update()
})
</script>

<style scoped>
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 100001; /* peste tot, inclusiv CTA (10000) și CustomCursor (99999) */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.4rem;
  /* Se aliniază cu fundalul fiecărei pagini (html[data-page] îl poate schimba). */
  background: var(--color-bg, #EDEBE6);
  opacity: 1;
  transition: opacity 0.65s ease;
}

.loading-screen.is-leaving {
  opacity: 0;
  pointer-events: none;
}

.loading-screen__logo {
  font-family: var(--font-display);
  font-size: 1.35rem;
  letter-spacing: 0.01em;
  color: var(--color-text, #1A1814);
}

.loading-screen__bar {
  width: min(220px, 40vw);
  height: 1px;
  background: color-mix(in srgb, var(--color-text, #000) 12%, transparent);
  overflow: hidden;
}

.loading-screen__fill {
  display: block;
  height: 100%;
  width: 100%;
  background: color-mix(in srgb, var(--color-text, #000) 55%, transparent);
  transform-origin: left center;
  transition: transform 0.5s ease;
}
</style>
