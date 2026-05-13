<template>
  <!--
    Teleport + z-index peste .cursor (9998): altfel linkul poate rămâne sub stratul
    fullscreen al cursorului custom (pointer-events: none) și nu se vede în unele browsere.
  -->
  <Teleport to="body">
    <NuxtLink
      to="/servicii"
      class="fixed-services-cta"
    >
      <span>Vezi serviciile</span>
      <span class="fixed-services-cta__dot">:</span>
    </NuxtLink>
  </Teleport>
</template>

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
  color: var(--color-text-muted);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  margin: 0;
}

.fixed-services-cta:hover {
  color: var(--color-text);
}

.fixed-services-cta__dot {
  color: var(--color-text);
}

@media (max-width: 768px) {
  .fixed-services-cta {
    left: 1.25rem;
    bottom: 1.25rem;
  }
}
</style>
