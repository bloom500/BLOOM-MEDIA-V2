<template>
  <header class="navbar" :class="{ 'navbar--scrolled': isScrolled }">
    <div class="navbar__backdrop" aria-hidden="true" />

    <div class="navbar__inner">
      <div class="navbar__left">
        <div class="navbar__brand">
          <NuxtLink to="/" class="navbar__wordmark" aria-label="Bloom Media — acasă">
            <span class="navbar__wordmarkLine1">Bloom</span>
            <span class="navbar__wordmarkLine2">Media<span class="navbar__wordmarkDot">.</span></span>
          </NuxtLink>
          <p class="navbar__tagline">Marketing Digital</p>
        </div>
      </div>

      <nav class="navbar__center" aria-label="Principal">
        <div class="navbar__pill">
          <NuxtLink
            v-for="item in navLinks"
            :key="item.to"
            :to="item.to"
            class="navbar__pillLink"
          >
            {{ item.label }}
          </NuxtLink>
        </div>
      </nav>

      <div class="navbar__right">
        <NuxtLink to="/audit" class="navbar__cta">
          <span class="navbar__ctaIcon" aria-hidden="true">
            <span class="navbar__ctaIconLine" />
            <span class="navbar__ctaIconLine" />
          </span>
          <span class="navbar__ctaText">Audit Gratuit</span>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const navLinks = [
  { to: '/servicii', label: 'Servicii' },
  { to: '/portofoliu', label: 'Portofoliu' },
  { to: '/despre', label: 'Despre' },
  { to: '/contact', label: 'Contact' }
]

const isScrolled = ref(false)
let onScroll: (() => void) | null = null

onMounted(() => {
  if (!import.meta.client) {
    return
  }
  onScroll = () => {
    isScrolled.value = window.scrollY > 80
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  if (onScroll) {
    window.removeEventListener('scroll', onScroll)
  }
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  color: var(--color-text);
}

.navbar__backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: rgba(8, 8, 8, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(245, 240, 232, 0);
  transition:
    background-color 0.35s var(--ease-2),
    border-bottom-color 0.35s var(--ease-2),
    backdrop-filter 0.35s var(--ease-2);
}

.navbar--scrolled .navbar__backdrop {
  background: rgba(8, 8, 8, 0.85);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom-color: rgba(245, 240, 232, 0.1);
}

.navbar__inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  column-gap: clamp(1rem, 3vw, 2.5rem);
  max-width: 100%;
  padding: 1.35rem clamp(1.25rem, 4vw, 2.85rem);
}

.navbar__left {
  display: flex;
  align-items: flex-start;
  gap: clamp(0.85rem, 2.2vw, 1.85rem);
  justify-self: start;
  min-width: 0;
}

.navbar__brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
}

.navbar__wordmark {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  text-decoration: none;
  color: var(--color-text);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.1rem;
  line-height: 1.1;
  letter-spacing: -0.035em;
}

.navbar__wordmarkLine1,
.navbar__wordmarkLine2 {
  color: var(--color-text);
}

.navbar__wordmarkDot {
  color: var(--color-accent);
  font-weight: 600;
}

.navbar__tagline {
  margin: 0;
  max-width: 10rem;
  font-family: var(--font-ui);
  font-size: 0.55rem;
  font-weight: 400;
  line-height: 1.45;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(245, 240, 232, 0.3);
}

.navbar__center {
  justify-self: center;
}

.navbar__pill {
  display: flex;
  align-items: stretch;
  border-radius: 100px;
  border: 1px solid rgba(245, 240, 232, 0.14);
  background: rgba(255, 255, 255, 0.04);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  overflow: hidden;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.navbar__pillLink {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.58rem clamp(0.75rem, 1.6vw, 1.35rem);
  font-family: var(--font-ui);
  font-size: 0.625rem;
  font-weight: 500;
  letter-spacing: 0.17em;
  text-transform: uppercase;
  text-decoration: none;
  color: rgba(245, 240, 232, 0.52);
  white-space: nowrap;
  transition: color 0.25s ease, background-color 0.25s ease;
}

.navbar__pillLink:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 22%;
  bottom: 22%;
  right: 0;
  width: 1px;
  background: rgba(245, 240, 232, 0.12);
}

.navbar__pillLink:hover,
.navbar__pillLink.router-link-active {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.05);
}

.navbar__right {
  justify-self: end;
}

.navbar__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.62rem;
  padding: 0.52rem 1.15rem 0.52rem 0.92rem;
  border-radius: 100px;
  background: #f5f0e8;
  color: #080808;
  text-decoration: none;
  font-family: var(--font-ui);
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  white-space: nowrap;
  border: 1px solid rgba(245, 240, 232, 0.35);
  transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}

.navbar__cta:hover {
  background: #fff;
  color: #000;
  border-color: rgba(255, 255, 255, 0.55);
}

.navbar__ctaIcon {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 14px;
  flex-shrink: 0;
}

.navbar__ctaIconLine {
  display: block;
  height: 1px;
  width: 100%;
  background: currentColor;
  border-radius: 1px;
}

.navbar__ctaText {
  line-height: 1;
}

@media (max-width: 1024px) {
  .navbar__pillLink {
    padding: 0.52rem clamp(0.55rem, 1.2vw, 1rem);
    font-size: 0.5625rem;
    letter-spacing: 0.14em;
  }
}

@media (max-width: 768px) {
  .navbar__inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 1.15rem 1.2rem;
  }

  .navbar__center {
    display: none;
  }

  .navbar__left {
    gap: 0;
  }

  .navbar__cta {
    padding: 0.48rem 0.95rem 0.48rem 0.78rem;
    font-size: 0.5625rem;
    letter-spacing: 0.11em;
  }

  .navbar__ctaIcon {
    width: 12px;
    gap: 4px;
  }
}

@media (max-width: 375px) {
  .navbar__inner {
    padding: 1rem 1rem;
  }

  .navbar__wordmark {
    font-size: 1rem;
  }
}
</style>
