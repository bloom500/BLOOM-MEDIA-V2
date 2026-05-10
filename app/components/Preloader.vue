<template>
  <div ref="overlayRef" class="preloader" aria-hidden="true">
    <div class="preloader__brand">
      <span ref="brandRef" class="preloader__brand-text">Bloom Media</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { setupGsap } from '~/lib/animations/gsap'

const overlayRef = ref<HTMLElement | null>(null)
const brandRef = ref<HTMLElement | null>(null)
let observer: MutationObserver | null = null
let played = false

function playIntro() {
  if (played || !overlayRef.value || !brandRef.value) {
    return
  }

  played = true

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    overlayRef.value.style.display = 'none'
    return
  }

  const { gsap } = setupGsap()

  const timeline = gsap.timeline({
    defaults: {
      ease: 'power3.out'
    },
    onComplete: () => {
      overlayRef.value?.remove()
    }
  })

  timeline
    .set(brandRef.value, {
      yPercent: 110,
      opacity: 0
    })
    .to(brandRef.value, {
      yPercent: 0,
      opacity: 1,
      duration: 0.9
    })
    .to(brandRef.value, {
      yPercent: -105,
      opacity: 0,
      duration: 0.75,
      ease: 'power2.inOut'
    }, '+=0.35')
    .to(overlayRef.value, {
      yPercent: -100,
      duration: 0.75,
      ease: 'power3.inOut'
    }, '-=0.35')
}

onMounted(() => {
  if (!import.meta.client) {
    return
  }

  if (document.documentElement.classList.contains('-loaded')) {
    playIntro()
    return
  }

  observer = new MutationObserver(() => {
    if (document.documentElement.classList.contains('-loaded')) {
      playIntro()
    }
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.preloader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  background: transparent;
  color: var(--color-text);
  pointer-events: none;
}

.preloader__brand {
  overflow: hidden;
  padding: 0.1em 0.04em;
}

.preloader__brand-text {
  display: block;
  font-family: var(--font-display);
  font-size: clamp(3rem, 9vw, 8rem);
  font-weight: 400;
  letter-spacing: 0;
  line-height: 0.95;
}
</style>
