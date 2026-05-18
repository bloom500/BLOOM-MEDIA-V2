<template>
  <footer
    id="footer-reveal"
    class="footer"
    aria-label="Site footer"
    string="progress"
    string-exit-vp="bottom"
    data-cursor-dark
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
/*
 * tutorial-01-footer-shifting.html (SpringTune):
 * — <footer string="progress" string-exit-vp="bottom">
 * — .footer::after: overlay pagină, opacity: calc(1 - var(--progress))
 * — .footer__inner: translate3d(0, calc(-50% + 50% * var(--progress)), 0)
 * Pe homepage, .site-main are z-index: 20 + fundal opac (main.css) ca .content
 * din tutorial — footer (z-index: 0) se desenează SUB main la translate, nu peste Contact.
 */
.footer {
  position: relative;
  z-index: 0;
  background-color: #0a0a0a;
  color: #fafafa;
}

/* Voal discret — fără „alb” la margine; doar relief pe negru */
.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: clamp(96px, 14vh, 200px);
  pointer-events: none;
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.04) 0%,
    rgba(40, 40, 40, 0.35) 45%,
    rgba(10, 10, 10, 0) 100%
  );
}

/*
 * SpringTune: în tutorial overlay-ul are culoarea secțiunii de deasupra (negru → albastru).
 * La noi Contact-ul se termină în #0a0a0a — NU --color-bg (#fafafa), altfel la progress mic
 * footerul pare alb și textul alb dispare.
 */
.footer::after {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #0a0a0a;
  opacity: calc(1 - var(--progress));
  pointer-events: none;
  z-index: 0;
}

.footer__inner {
  position: relative;
  z-index: 1;
  /* svh = stable; iOS bar-collapse must not reflow the footer reveal. */
  min-height: 100svh;
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
  color: #fafafa;
  line-height: 1;
}

.footer__dot {
  color: #fafafa;
}

.footer__tagline {
  font-family: var(--font-body);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: rgba(250, 250, 250, 0.55);
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
  color: rgba(250, 250, 250, 0.45);
  margin-bottom: 0.5rem;
}

.footer__nav-col a {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: rgba(250, 250, 250, 0.78);
  text-decoration: none;
  transition: color 0.25s ease;
}

.footer__nav-col a:hover {
  color: #ffffff;
}

.footer__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 3rem;
  border-top: 0.5px solid rgba(255, 255, 255, 0.12);
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
  color: rgba(250, 250, 250, 0.5);
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
