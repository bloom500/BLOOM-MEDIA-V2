<template>
  <!--
    Scroll anchor on desktop (100vh, black) — drives ScrollTrigger.
    On mobile/SSR this is the static footer with visible content.
  -->
  <footer
    id="footer-reveal"
    ref="footerEl"
    class="footer-reveal"
    aria-label="Site footer"
  >
    <div v-if="!isDesktop" class="footer-static">
      <!-- Top-right socials -->
      <div class="footer-static__socials">
        <a
          href="https://www.instagram.com/bloom_media_marketing/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <circle cx="12" cy="12" r="4.5"/>
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </a>
        <a
          href="https://www.facebook.com/profile.php?id=61587068890787"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
          </svg>
        </a>
        <a
          href="https://github.com/bloom500/feral"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="FERAL pe GitHub"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 2.87-.39c.97 0 1.95.13 2.87.39 2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.83 1.18 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14 0 1.54-.01 2.79-.01 3.17 0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>
          </svg>
        </a>
      </div>

      <!-- Center: statement + email -->
      <div class="footer-static__center">
        <p class="footer-static__statement">
          <span>Unele lucruri</span>
          <span>merită făcute bine.</span>
        </p>
        <a href="mailto:hello@bloommedia.ro" class="footer-static__email">
          hello@bloommedia.ro
        </a>
      </div>

      <!-- Bottom bar: legal + CUI -->
      <div class="footer-static__bottom">
        <NuxtLink to="/privacy-policy" class="footer-static__legal-link">Politică Confidențialitate</NuxtLink>
        <span class="footer-dot">·</span>
        <NuxtLink to="/termeni" class="footer-static__legal-link">Termeni &amp; Condiții</NuxtLink>
        <span class="footer-static__cui">CUI: 50654818 · TVA: RO54500579</span>
      </div>
    </div>
  </footer>

  <!--
    Teleported to <body> so fixed children escape site-content's stacking context (z:2).
    Curtain: z-index 9997 covers everything except cursor (9999) and CTA (10000).
    Stage: z-index 9998, sits above curtain.
  -->
  <Teleport v-if="isDesktop" to="body">
    <div ref="curtainEl" class="footer-curtain" aria-hidden="true"></div>
    <div ref="stageEl" class="footer-stage" data-cursor-dark>

      <!-- Top-right: social icons -->
      <div ref="socialsEl" class="footer-stage__socials">
        <a
          href="https://www.instagram.com/bloom_media_marketing/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          class="footer-stage__social"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <circle cx="12" cy="12" r="4.5"/>
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </a>
        <a
          href="https://www.facebook.com/profile.php?id=61587068890787"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          class="footer-stage__social"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
          </svg>
        </a>
        <a
          href="https://github.com/bloom500/feral"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="FERAL pe GitHub"
          class="footer-stage__social"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 2.87-.39c.97 0 1.95.13 2.87.39 2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.83 1.18 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14 0 1.54-.01 2.79-.01 3.17 0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>
          </svg>
        </a>
      </div>

      <!-- Center: statement + email -->
      <div class="footer-stage__center">
        <p ref="statementEl" class="footer-stage__statement">
          <span class="footer-stage__line">Unele lucruri</span>
          <span class="footer-stage__line">merită făcute bine.</span>
        </p>
        <a
          ref="emailEl"
          href="mailto:hello@bloommedia.ro"
          class="footer-stage__email"
        >
          hello@bloommedia.ro
        </a>
      </div>

      <!-- Bottom bar: legal + CUI -->
      <div ref="metaEl" class="footer-stage__bottom">
        <NuxtLink to="/privacy-policy" class="footer-stage__legal-link">Politică Confidențialitate</NuxtLink>
        <span class="footer-dot">·</span>
        <NuxtLink to="/termeni" class="footer-stage__legal-link">Termeni &amp; Condiții</NuxtLink>
        <span class="footer-stage__cui">CUI: 50654818 · TVA: RO54500579</span>
      </div>

    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'

const footerEl = ref<HTMLElement | null>(null)
const curtainEl = ref<HTMLElement | null>(null)
const stageEl = ref<HTMLElement | null>(null)
const statementEl = ref<HTMLElement | null>(null)
const emailEl = ref<HTMLElement | null>(null)
const metaEl = ref<HTMLElement | null>(null)
const socialsEl = ref<HTMLElement | null>(null)

const isDesktop = ref(false)
let ctx: any = null

// cursorDark is now driven by the homepage curtain (index.vue). FooterReveal
// no longer touches it, so we don't need a ref here either.

onMounted(async () => {
  if (!import.meta.client) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (window.matchMedia('(max-width: 767px)').matches) return

  isDesktop.value = true
  await nextTick()

  // Reuse the bundled gsap singleton instead of pulling a duplicate chunk.
  const { setupGsap } = await import('~/lib/animations/gsap')
  const { gsap, ScrollTrigger } = setupGsap()

  ctx = gsap.context(() => {
    const lines = statementEl.value!.querySelectorAll('.footer-stage__line')

    gsap.set(curtainEl.value, { opacity: 0 })
    gsap.set([lines, emailEl.value, metaEl.value, socialsEl.value], { opacity: 0, y: 24 })

    // cursorDark is owned by the homepage curtain transition (index.vue) —
    // it goes white at the FAQ→Contact crossover and stays white through
    // page-tail and the footer. We don't manage it here anymore to avoid
    // a flip-back when scrolling up from the footer toward Contact.

    // Phase 1: full-viewport curtain fades in as footer approaches top
    gsap.timeline({
      scrollTrigger: {
        trigger: footerEl.value,
        start: 'top 80%',
        end: 'top 8%',
        scrub: 0.7,
      },
    }).to(curtainEl.value, { opacity: 1, ease: 'power1.inOut' })

    // Phase 2: pin + reveal content
    gsap.timeline({
      scrollTrigger: {
        trigger: footerEl.value,
        start: 'top top',
        end: '+=75%',
        pin: true,
        scrub: 0.9,
      },
    })
      .to(socialsEl.value, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })
      .to(lines, { opacity: 1, y: 0, duration: 0.5, stagger: 0.14, ease: 'power2.out' }, '>-0.1')
      .to(emailEl.value, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '>+0.06')
      .to(metaEl.value, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '>+0.06')
  })
})

onBeforeUnmount(() => {
  ctx?.revert()
  // Don't toggle cursorDark here — the homepage curtain owns it on this page.
})
</script>

<style scoped>
.footer-reveal {
  position: relative;
  background: #000;
  /* svh = stable; iOS bar-collapse doesn't break ScrollTrigger pin offset. */
  min-height: 100svh;
}

@media (max-width: 767px) {
  .footer-reveal {
    min-height: 100svh;
    display: flex;
    flex-direction: column;
  }
}

/* ── Mobile / SSR static layout ── */
.footer-static {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 100svh;
  padding: 5rem 2rem 3rem;
}

.footer-static__socials {
  position: absolute;
  top: 2.5rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.footer-static__socials a {
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  transition: color 0.25s ease;
}

.footer-static__socials a:hover {
  color: #fff;
}

.footer-static__center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  text-align: center;
  flex: 1;
  justify-content: center;
}

.footer-static__statement {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(2rem, 9vw, 3rem);
  line-height: 1.05;
  color: #fff;
  letter-spacing: -0.02em;
}

.footer-static__statement span {
  display: block;
  /*
   * Override main.css rule `footer span { color: var(--color-text) }` —
   * direct rule on the descendant beats inherited #fff from the parent <p>,
   * so without this the headline turns black-on-black on the static (mobile)
   * footer variant.
   */
  color: inherit;
}

.footer-static__email {
  font-family: var(--font-body);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.45);
  text-decoration: none;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.12);
  padding-bottom: 3px;
  transition: color 0.3s ease, border-color 0.3s ease;
}

.footer-static__email:hover {
  color: rgba(255, 255, 255, 0.88);
  border-bottom-color: rgba(255, 255, 255, 0.4);
}

.footer-static__bottom {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 3rem;
}

.footer-static__legal-link {
  font-family: var(--font-body);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.25s ease;
}

.footer-static__legal-link:hover {
  color: rgba(255, 255, 255, 0.9);
}

.footer-dot {
  color: rgba(255, 255, 255, 0.2);
}

.footer-static__cui {
  font-family: var(--font-body);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(255, 255, 255, 0.2);
  margin-left: 0.5rem;
}
</style>

<!-- Global: teleported elements are outside this component's scoped DOM -->
<style>
.footer-curtain {
  position: fixed;
  inset: 0;
  background: #000;
  opacity: 0;
  pointer-events: none;
  z-index: 9997;
}

.footer-stage {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Top-right: social icons */
.footer-stage__socials {
  position: absolute;
  top: 2.5rem;
  right: 2.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.footer-stage__social {
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  transition: color 0.25s ease;
  pointer-events: auto;
}

.footer-stage__social:hover {
  color: #fff;
}

/* Center: statement + email */
.footer-stage__center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 80px;
  text-align: center;
  flex: 1;
  justify-content: center;
}

.footer-stage__statement {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(2.8rem, 5.5vw, 5.5rem);
  line-height: 1.05;
  color: #fff;
  letter-spacing: -0.02em;
}

.footer-stage__line {
  display: block;
}

.footer-stage__email {
  font-family: var(--font-body);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.45);
  text-decoration: none;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.12);
  padding-bottom: 3px;
  transition: color 0.3s ease, border-color 0.3s ease;
  pointer-events: auto;
}

.footer-stage__email:hover {
  color: rgba(255, 255, 255, 0.88);
  border-bottom-color: rgba(255, 255, 255, 0.4);
}

/* Bottom bar: legal links + CUI */
.footer-stage__bottom {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 0.5rem;
}

.footer-stage .footer-dot {
  color: rgba(255, 255, 255, 0.2);
}

.footer-stage__legal-link {
  font-family: var(--font-body);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.25s ease;
  pointer-events: auto;
}

.footer-stage__legal-link:hover {
  color: rgba(255, 255, 255, 0.9);
}

.footer-stage__cui {
  font-family: var(--font-body);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(255, 255, 255, 0.2);
  margin-left: 0.5rem;
}
</style>
