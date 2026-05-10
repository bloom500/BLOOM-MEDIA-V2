<template>
  <header class="navbar">
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

.navbar::before {
  display: none !important;
}

.navbar__brand {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 400;
  color: var(--color-text);
  line-height: 1.1;
  text-decoration: none;
}

.navbar__dot {
  color: var(--color-text);
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
  font-size: 0.65rem;
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
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text);
  background: transparent;
  border: 0.5px solid var(--color-border-strong);
  padding: 0.6rem 1.4rem;
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
</style>
