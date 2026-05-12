<template>
  <footer
    class="footer"
    string="progress"
    string-exit-vp="bottom"
  >
    <div class="footer__inner">
      <div class="footer__top">
        <div class="footer__brand">
          <span class="footer__logo">Bloom<span class="footer__dot">.</span></span>
          <span class="footer__tagline">
            Marketing Digital
          </span>
        </div>

        <nav class="footer__nav" aria-label="Footer">
          <div class="footer__nav-col">
            <span class="footer__nav-title">Pagini</span>
            <NuxtLink to="/">
              Acasă
            </NuxtLink>
            <NuxtLink to="/servicii">
              Servicii
            </NuxtLink>
            <NuxtLink to="/portofoliu">
              Portofoliu
            </NuxtLink>
            <NuxtLink to="/despre">
              Despre
            </NuxtLink>
            <NuxtLink to="/echipa">
              Echipă
            </NuxtLink>
          </div>
          <div class="footer__nav-col">
            <span class="footer__nav-title">Acțiuni</span>
            <NuxtLink to="/audit">
              Audit Gratuit
            </NuxtLink>
            <NuxtLink to="/configurator">
              Configurator
            </NuxtLink>
            <NuxtLink to="/contact">
              Contact
            </NuxtLink>
          </div>
          <div class="footer__nav-col">
            <span class="footer__nav-title">Legal</span>
            <NuxtLink to="/privacy-policy">
              Politică Confidențialitate
            </NuxtLink>
            <NuxtLink to="/termeni">
              Termeni & Condiții
            </NuxtLink>
          </div>
        </nav>
      </div>

      <div class="footer__bottom">
        <span class="footer__copy">
          © 2026 Bloom Media — Bloom Ventures SRL
        </span>
        <span class="footer__vat">
          CIF: RO54500579
        </span>
        <span class="footer__location">
          Cluj-Napoca, România
        </span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* tutorial-01-footer-shifting: overlay + translate pe --progress (StringTune) */
.footer {
  position: relative;
  background-color: #0c0c0c;
  color: var(--color-text);
}

.footer::after {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--color-bg);
  opacity: calc(1 - var(--progress));
  pointer-events: none;
}

.footer__inner {
  position: relative;
  z-index: 1;
  min-height: calc(var(--vh, 1vh) * 100);
  display: grid;
  grid-template-rows: 1fr auto;
  padding: 6rem 2.5rem 3rem;
  transform: translate3d(0, calc(-50% + 50% * var(--progress)), 0);
}

@media (prefers-reduced-motion: reduce) {
  .footer__inner {
    transform: none;
  }

  .footer::after {
    opacity: 0;
  }
}

.footer__top {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
  align-items: start;
}

.footer__brand {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer__logo {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 400;
  color: var(--color-text);
  line-height: 1;
}

.footer__dot {
  color: var(--color-text);
}

.footer__tagline {
  font-family: var(--font-body);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-text-ghost);
}

.footer__nav {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.footer__nav-col {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer__nav-title {
  font-family: var(--font-body);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-text-ghost);
  margin-bottom: 0.5rem;
}

.footer__nav-col a {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer__nav-col a:hover {
  color: var(--color-text);
}

.footer__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 3rem;
  border-top: 0.5px solid var(--color-border);
  flex-wrap: wrap;
  gap: 1rem;
}

.footer__copy,
.footer__vat,
.footer__location {
  font-family: var(--font-body);
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-ghost);
}

@media (max-width: 768px) {
  .footer__inner {
    padding: 4rem 1.25rem 2rem;
  }

  .footer__top {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .footer__nav {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .footer__bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
