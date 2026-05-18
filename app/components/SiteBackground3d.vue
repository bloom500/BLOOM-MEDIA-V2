<template>
  <!--
    Teleport pe body: evită „containere” cu transform (footer StringTune, secțiuni)
    care fac ca position:fixed al relief-ului să nu mai fie raportat la viewport —
    rezultat: canvas 3D într-o „coloană” centrată în loc de fullscreen.
  -->
  <Teleport to="body">
    <div class="site-bg-3d" aria-hidden="true">
      <MorphingReliefBackground v-if="!isHome && !isServicii" />
      <ReliefSlab v-if="isHome" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MorphingReliefBackground from '~/components/MorphingReliefBackground.vue'
import ReliefSlab from '~/components/ReliefSlab.client.vue'

const route = useRoute()
const isHome     = computed(() => route.path === '/' || route.name === 'index')
const isServicii = computed(() => route.path === '/servicii' || route.name === 'servicii')
</script>

<style scoped>
.site-bg-3d {
  position: fixed;
  inset: 0;
  width: 100vw;
  /* svh = stable; canvas resize on iOS bar-collapse triggers WebGL renderer
     resize too, which is expensive on every scroll-direction change. */
  min-height: 100svh;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
</style>
