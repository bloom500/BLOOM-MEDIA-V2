<template>
  <!--
    Teleport the entire navbar to <body> so it escapes .site-content's
    stacking context (z-index: 2). Without this, the mobile drawer
    (teleported to body) would always sit on top of the navbar and the
    burger would become un-tappable once the drawer is open.
  -->
  <Teleport to="body">
    <header class="navbar" :class="{ 'navbar--light': isLightOnDark, 'is-menu-open': isMenuOpen }">
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

    <!--
      Burger only on mobile (≤900px). aria-controls links it to the drawer
      teleported below, aria-expanded reflects state for screen readers.
    -->
    <button
      class="navbar__burger"
      :class="{ 'is-active': isMenuOpen }"
      :aria-expanded="String(isMenuOpen)"
      aria-controls="mobile-drawer"
      :aria-label="isMenuOpen ? 'Închide meniul' : 'Deschide meniul'"
      @click="toggleMenu"
    >
      <span class="navbar__burger-bar" aria-hidden="true" />
      <span class="navbar__burger-bar" aria-hidden="true" />
    </button>
  </header>
  </Teleport>

  <!--
    Mobile drawer — teleported to <body> so it escapes the navbar's
    stacking context and can sit above all page content (including the
    fixed 3D backgrounds and the navbar gradient scrim).
  -->
  <Teleport to="body">
    <div
      id="mobile-drawer"
      class="mobile-drawer"
      :class="{ 'is-open': isMenuOpen }"
      :aria-hidden="String(!isMenuOpen)"
    >
      <nav class="mobile-drawer__nav" aria-label="Mobile">
        <NuxtLink
          v-for="(item, i) in navLinks"
          :key="item.to"
          :to="item.to"
          class="mobile-drawer__link"
          :style="{ '--i': i }"
          @click="closeMenu"
        >
          <span class="mobile-drawer__num">0{{ i + 1 }}</span>
          <span class="mobile-drawer__label">{{ item.label }}</span>
        </NuxtLink>

        <NuxtLink
          to="/audit"
          class="mobile-drawer__cta"
          :style="{ '--i': navLinks.length }"
          @click="closeMenu"
        >
          Audit gratuit
        </NuxtLink>
      </nav>

      <footer class="mobile-drawer__foot">
        <a href="mailto:hello@bloommedia.ro">hello@bloommedia.ro</a>
        <span>Cluj-Napoca, RO</span>
      </footer>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'

const route = useRoute()
// Shared signal — set by FooterReveal (curtain over footer) and by index.vue
// (FAQ → Contact dark transition). When true, navbar flips to white.
const cursorDark = useState('cursorDark', () => false)

// Pages with a dark full-bleed background that need white navbar text
const darkBgRoutes = ['/servicii', '/despre']
const isLightOnDark = computed(() => darkBgRoutes.includes(route.path) || cursorDark.value)

// Portofoliu scos intenționat — lansăm fără portofoliu, fără link mort în nav.
const navLinks = [
  { to: '/servicii', label: 'Servicii' },
  { to: '/proces', label: 'Proces' },
  { to: '/despre', label: 'Despre' },
  { to: '/#contact', label: 'Contact' },
]

// ── Mobile drawer state ───────────────────────────────────────
const isMenuOpen = ref(false)

function openMenu() {
  isMenuOpen.value = true
}
function closeMenu() {
  isMenuOpen.value = false
}
function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

// Close on route change so navigation actually feels like it dismisses.
watch(() => route.fullPath, () => {
  if (isMenuOpen.value) closeMenu()
})

// Lock body scroll while drawer is open. Using position:fixed on <body>
// (with saved scroll offset) avoids the layout thrash that overflow:hidden
// on <html> causes — the reflow was happening right as the clip-path
// animation started, causing a visible stutter on mobile.
let savedScrollY = 0
watch(isMenuOpen, (open) => {
  if (!import.meta.client) return
  if (open) {
    savedScrollY = window.scrollY
    // Defer the position:fixed lock by one rAF so the opacity/transform
    // animation starts on a clean frame without a layout flush alongside it.
    requestAnimationFrame(() => {
      document.body.style.top = `-${savedScrollY}px`
      document.documentElement.classList.add('drawer-open')
    })
  }
  else {
    document.documentElement.classList.remove('drawer-open')
    document.body.style.top = ''
    window.scrollTo({ top: savedScrollY, behavior: 'instant' })
  }
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  document.documentElement.classList.remove('drawer-open')
  document.body.style.top = ''
})
</script>

<style>
/*
 * Unscoped because the navbar is teleported to <body> — Vue scoped CSS
 * (data-v-* attribute) is inherited by descendants but not always by
 * teleported roots in some renderer states. Class names are unique
 * (.navbar*) so there's no conflict with other components.
 */
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
  position: relative;
  z-index: 2;
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
  position: relative;
  z-index: 2;
}

.navbar__btn:hover {
  background: var(--color-text);
  color: var(--color-bg);
  border-color: var(--color-text);
}

/* ─── Burger ───────────────────────────────────────────────────
   Hidden on desktop, shown ≤900px in place of the nav row + button.
*/
.navbar__burger {
  display: none;
  position: relative;
  z-index: 2;
  width: 44px;
  height: 44px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  display: none; /* overridden by media query below */
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}

.navbar__burger-bar {
  position: absolute;
  /*
   * Anchor both bars at the center, then translateY apart for the
   * default "= =" state. Animating only transform (no layout
   * properties like `top`) keeps the burger morph compositor-only
   * and smooth on mobile — the previous version animated `top` which
   * triggered layout on every frame on iOS.
   */
  top: 50%;
  left: 50%;
  width: 22px;
  height: 1.5px;
  background: var(--color-text);
  transform-origin: center;
  transform: translate3d(-50%, calc(-50% - 4px), 0);
  transition:
    transform 0.45s cubic-bezier(0.65, 0, 0.35, 1),
    background 0.3s ease;
  will-change: transform;
}

.navbar__burger-bar:nth-child(2) {
  transform: translate3d(-50%, calc(-50% + 4px), 0);
}

.navbar__burger.is-active .navbar__burger-bar:nth-child(1) {
  transform: translate3d(-50%, -50%, 0) rotate(45deg);
}

.navbar__burger.is-active .navbar__burger-bar:nth-child(2) {
  transform: translate3d(-50%, -50%, 0) rotate(-45deg);
}

/* When drawer is open, force burger to white on the dark drawer */
.navbar.is-menu-open .navbar__burger-bar {
  background: #fff;
}

@media (max-width: 900px) {
  .navbar__nav { display: none; }
  .navbar__btn { display: none; }
  .navbar__burger { display: inline-flex; }

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
  color: #000000;
  border-color: #fff;
}

.navbar--light .navbar__burger-bar {
  background: #fff;
}
</style>

<!--
  Drawer styles are unscoped (or rather, scoped via separate <style>
  with v-deep-equivalent) because the Teleport target lives in <body>
  outside this component's scoped scope.
-->
<style>
.mobile-drawer {
  position: fixed;
  inset: 0;
  /*
   * Drawer must sit BELOW the navbar so the burger remains tappable to
   * close the menu. Navbar is z-index 100 inside .site-content (its
   * stacking context resolves to z-index 2 against the body), so the
   * drawer at z-index 90 still appears above all page content but lets
   * the navbar's burger stay clickable on top.
   */
  z-index: 90;
  background: #000000;
  /* Cover the whole visible viewport including under the iOS bar. */
  min-height: 100lvh;
  /*
   * opacity + transform instead of clip-path: both are compositor-only
   * on mobile (no layout/paint), so the drawer enters/exits smoothly
   * even on low-end devices. clip-path circle() at 150% was triggering
   * software rasterisation on iOS Safari, causing the stutter on tap.
   */
  opacity: 0;
  transform: translateY(-8px);
  transition:
    opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, transform;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 6rem 2rem 3rem;
  box-sizing: border-box;
}

.mobile-drawer.is-open {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.mobile-drawer__nav {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
  justify-content: center;
}

.mobile-drawer__link {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: baseline;
  gap: 1.25rem;
  padding: 1.1rem 0;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.08);
  text-decoration: none;
  color: #fff;
  /* Stagger entrance keyed to --i, only when drawer is open */
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: 0s;
  -webkit-tap-highlight-color: transparent;
}

.mobile-drawer.is-open .mobile-drawer__link {
  opacity: 1;
  transform: translateY(0);
  transition-delay: calc(0.28s + var(--i, 0) * 0.06s);
}

.mobile-drawer__num {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.05em;
}

.mobile-drawer__label {
  font-family: var(--font-display);
  font-style: italic;
  font-size: clamp(2rem, 9vw, 3.2rem);
  font-weight: 400;
  letter-spacing: -0.01em;
  line-height: 1.05;
  /* Reserve room for descenders inside the overflow-hidden parent */
  padding-bottom: 0.05em;
}

.mobile-drawer__cta {
  margin-top: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.6rem;
  font-family: var(--font-body);
  font-size: 0.72rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #000000;
  background: #fff;
  border-radius: 999px;
  text-decoration: none;
  align-self: flex-start;
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.mobile-drawer.is-open .mobile-drawer__cta {
  opacity: 1;
  transform: translateY(0);
  transition-delay: calc(0.18s + var(--i, 4) * 0.06s);
}

.mobile-drawer__foot {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 2rem;
  margin-top: 2rem;
  border-top: 0.5px solid rgba(255, 255, 255, 0.1);
  font-family: var(--font-body);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: rgba(255, 255, 255, 0.5);
  opacity: 0;
  transition: opacity 0.5s ease;
  transition-delay: 0.4s;
}

.mobile-drawer.is-open .mobile-drawer__foot {
  opacity: 1;
  transition-delay: 0.55s;
}

.mobile-drawer__foot a {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.15rem;
  text-transform: none;
  letter-spacing: 0;
}

/* While drawer is open, freeze body scroll.
   position:fixed (with top set by JS to saved scroll offset) prevents
   overflow:hidden from triggering a layout on <html>, which was causing
   a stutter right as the clip-path animation started on mobile. */
html.drawer-open body {
  position: fixed;
  left: 0;
  right: 0;
  overflow-y: scroll; /* keep scrollbar gutter stable on desktop */
}
</style>
