<template>
  <div ref="overlayRef" class="page-transition" aria-hidden="true" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { setupGsap } from '~/lib/animations/gsap'
import { refreshStringTune, resetStringTuneScroll } from '~/lib/stringtune/client'

const router = useRouter()
const overlayRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!import.meta.client || !overlayRef.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  const { gsap } = setupGsap()

  router.beforeEach((_to, _from, next) => {
    gsap.fromTo(
      overlayRef.value,
      { yPercent: 100 },
      {
        yPercent: 0,
        duration: 0.6,
        ease: 'power2.in',
        onComplete: next
      }
    )
  })

  router.afterEach(() => {
    resetStringTuneScroll()
    gsap.to(overlayRef.value, {
      yPercent: -100,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => {
        gsap.set(overlayRef.value, { yPercent: 100 })
        refreshStringTune()
      }
    })
  })
})
</script>

<style scoped>
.page-transition {
  position: fixed;
  inset: 0;
  z-index: 9997;
  background: #000;
  pointer-events: none;
  transform: translate3d(0, 100%, 0);
  will-change: transform;
}
</style>
