<template>
  <header class="navbar" :class="{ 'navbar--light': isLightOnDark }">
    <NuxtLink to="/" class="navbar__brand" aria-label="Bloom Media — acasă">
      Bloom Media<span class="navbar__dot">.</span>
    </NuxtLink>

    <nav class="navbar__nav" aria-label="Principal">
      <NuxtLink
        v-for="item in navLinks"
        :key="item.to"
        :to="item.to"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>

    <NuxtLink to="/audit" class="navbar__btn">
      Audit gratuit
    </NuxtLink>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
// Shared signal — set by FooterReveal (curtain over footer) and by index.vue
// (FAQ → Contact dark transition). When true, navbar flips to white.
const cursorDark = useState('cursorDark', () => false)

// Pages with a dark full-bleed background that need white navbar text
const darkBgRoutes = ['/servicii']
const isLightOnDark = computed(() => darkBgRoutes.includes(route.path) || cursorDark.value)

const navLinks = [
  { to: '/servicii', label: 'Servicii' },
  { to: '/portofoliu', label: 'Portofoliu' },
  { to: '/despre', label: 'Despre' },
  { to: '/contact', label: 'Contact' },
]
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2.5rem;
  background: transparent !important;
  mix-blend-mode: normal;
}

/*
 * On dark pages with 3D backgrounds (servicii), the transparent navbar
 * becomes unreadable when the model bleeds into the top zone. A solid
 * gradient scrim restores legibility without looking like a hard bar.
 */
.navbar::after {
  content: '';
  position: absolute;
  inset: 0;
  bottom: -3rem;
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(6, 6, 4, 0.95) 0%,
    rgba(6, 6, 4, 0.8) 40%,
    rgba(6, 6, 4, 0.4) 70%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
}

.navbar--light::after {
  opacity: 1;
}

.navbar__brand {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 400;
  color: var(--color-text);
  line-height: 1.1;
  text-decoration: none;
  transition: color 0.4s ease;
}

.navbar__dot {
  color: var(--color-text);
  transition: color 0.4s ease;
}

.navbar__nav {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2.5rem;
}

.navbar__nav a {
  font-family: var(--font-body);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-text-soft);
  text-decoration: none;
  transition: color 0.3s ease;
}

.navbar__nav a:hover,
.navbar__nav a.router-link-active {
  color: var(--color-text);
}

.navbar__btn {
  font-family: var(--font-body);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text);
  background: transparent;
  border: 0.5px solid var(--color-border-strong);
  padding: 0.7rem 1.6rem;
  border-radius: 999px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.navbar__btn:hover {
  background: var(--color-text);
  color: var(--color-bg);
  border-color: var(--color-text);
}

@media (max-width: 900px) {
  .navbar__nav {
    display: none;
  }

  .navbar {
    padding: 1.25rem 1.25rem;
  }
}

/* ─── White-on-dark variant ───────────────────────────────────── */
.navbar--light .navbar__brand,
.navbar--light .navbar__dot {
  color: #fff;
}

.navbar--light .navbar__nav a {
  color: rgba(255, 255, 255, 0.55);
}

.navbar--light .navbar__nav a:hover,
.navbar--light .navbar__nav a.router-link-active {
  color: #fff;
}

.navbar--light .navbar__btn {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.35);
}

.navbar--light .navbar__btn:hover {
  background: #fff;
  color: #060604;
  border-color: #fff;
}
</style>
