<template>
  <!--
    Teleport + z-index peste .cursor (9998): altfel linkul poate rămâne sub stratul
    fullscreen al cursorului custom (pointer-events: none) și nu se vede în unele browsere.
  -->
  <Teleport to="body">
    <NuxtLink
      to="/servicii"
      class="fixed-services-cta"
      :class="{ '-in-footer': inFooter || cursorDark }"
    >
      <span>Vezi serviciile</span>
      <span class="fixed-services-cta__dot">:</span>
    </NuxtLink>
  </Teleport>
</template>

<script setup lang="ts">
const inFooter = ref(false)
// Shared signal — same useState used by CustomCursor / Navbar / FooterReveal /
// the homepage curtain transition. When true, CTA flips to white.
const cursorDark = useState('cursorDark', () => false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  const footer = document.querySelector('footer.footer-reveal')
  if (!footer) return

  observer = new IntersectionObserver(
    ([entry]) => { inFooter.value = entry.isIntersecting },
    { threshold: 0.05 }
  )
  observer.observe(footer)
})

onUnmounted(() => {
  observer?.disconnect()
  observer = null
})
</script>

<style scoped>
.fixed-services-cta {
  position: fixed;
  left: 2.5rem;
  bottom: 1.5rem;
  z-index: 10000;
  pointer-events: auto;
  font-family: var(--font-body);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #000000;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  margin: 0;
  transition: color 0.4s ease;
}

.fixed-services-cta.-in-footer {
  color: #ffffff;
}

.fixed-services-cta:hover {
  opacity: 0.65;
}

.fixed-services-cta__dot {
  color: inherit;
}

@media (max-width: 768px) {
  .fixed-services-cta {
    left: 1.25rem;
    bottom: 1.25rem;
  }
}
</style>
