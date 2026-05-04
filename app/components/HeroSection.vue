<template>
  <section
    ref="heroRef"
    class="hero"
    string="progress"
    string-id="hero"
    string-enter-vp="top"
    string-exit-vp="bottom"
  >
    <div class="hero__grain" aria-hidden="true" />

    <svg
      class="hero__decor"
      viewBox="0 0 1440 900"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M 1200 -50 Q 900 350 150 950"
        stroke="rgba(245,240,232,0.11)"
        stroke-width="0.55"
        fill="none"
      />
      <path
        d="M 400 -50 Q 700 200 1440 550"
        stroke="rgba(245,240,232,0.065)"
        stroke-width="0.55"
        fill="none"
      />
    </svg>

    <div
      class="hero__card hero__card--left"
      string="parallax"
      string-parallax="0.15"
      aria-hidden="true"
    >
      <span class="hero__card-mark">B.</span>
    </div>
    <div
      class="hero__card hero__card--right"
      string="parallax"
      string-parallax="-0.15"
      aria-hidden="true"
    >
      <span class="hero__card-mark">M.</span>
    </div>

    <div class="hero__headline">
      <h1
        class="hero__line hero__line--1 -splitted hero__title-anchor hero__title-anchor--line1"
        string="split"
        string-split="char"
        string-repeat
      >
        Creștem
      </h1>
      <h1
        class="hero__line hero__line--2 -splitted hero__title-anchor hero__title-anchor--mid"
        string="split"
        string-split="char"
        string-repeat
      >
        Afaceri
      </h1>
      <h1
        class="hero__line hero__line--3 -splitted hero__title-anchor hero__title-anchor--line3"
        string="split"
        string-split="char"
        string-repeat
      >
        Digitale.
      </h1>
    </div>

    <div
      class="hero__mascot-wrap"
    >
      <div
        class="hero__mascot"
        string="parallax"
        string-parallax="-0.12"
      >
        <img
          src="/mascota.webp"
          width="440"
          height="440"
          alt="Bloom mascot"
        >
      </div>
    </div>

    <div class="hero__label-left">
      <span>Agenție de Marketing</span>
      <span>Cluj-Napoca, România</span>
    </div>

    <div class="hero__label-right">
      <span>Scroll pentru</span>
      <span>a descoperi</span>
    </div>

    <div class="hero__bottom">
      <span class="hero__bottom-left">
        Marketing care produce<br>rezultate măsurabile
      </span>
      <div class="hero__scroll-indicator" aria-hidden="true">
        <span class="hero__scroll-dot" />
      </div>
      <span class="hero__bottom-right">
        Meta Ads · Web Design<br>AI Automation
      </span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const heroRef = ref<HTMLElement | null>(null)
let ctx: { revert: () => void } | null = null

onMounted(async () => {
  if (!import.meta.client) {
    return
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  const { gsap } = await import('gsap')

  const scope = heroRef.value ?? undefined
  ctx = gsap.context(() => {
    gsap.set('.hero__mascot', {
      y: 140,
      opacity: 0
    })

    gsap.to('.hero__mascot', {
      y: 0,
      opacity: 1,
      duration: 1.6,
      ease: 'power3.out',
      delay: 0.4
    })

    gsap.to('.hero__mascot img', {
      y: -18,
      duration: 2.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 2
    })

    gsap.from('.hero__label-left, .hero__label-right', {
      opacity: 0,
      y: 20,
      duration: 1,
      stagger: 0.1,
      delay: 0.8
    })

    gsap.from('.hero__bottom', {
      opacity: 0,
      y: 18,
      duration: 1,
      delay: 1.1,
      ease: 'power2.out'
    })
  }, scope)
})

onUnmounted(() => {
  ctx?.revert()
  ctx = null
})
</script>

<style scoped>
.hero {
  position: relative;
  width: 100%;
  /* min-height only: evită 100vh care poate bloca / tăia scroll-ul pe mobil */
  min-height: 100svh;
  min-height: 100dvh;
  background-color: var(--color-bg);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero__headline {
  margin: 0;
  padding: 0;
  border: 0;
  position: static;
}

.hero__grain {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.095;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 160px 160px;
}

.hero__decor {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}

.hero__card {
  position: absolute;
  width: 180px;
  height: 240px;
  background: rgba(245, 240, 232, 0.045);
  border: 0.5px solid rgba(245, 240, 232, 0.09);
  border-radius: 3px;
  z-index: 2;
  pointer-events: none;
}

.hero__card--left {
  left: -70px;
  top: 50%;
  transform: translateY(-40%) rotate(-14deg);
}

.hero__card--right {
  right: -70px;
  top: 50%;
  transform: translateY(-60%) rotate(12deg);
}

.hero__card-mark {
  display: block;
  padding: 0.8rem;
  font-family: var(--font-display);
  font-size: 1rem;
  color: rgba(245, 240, 232, 0.32);
}

.hero__label-left,
.hero__label-right {
  position: absolute;
  top: 7rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  z-index: 6;
}

.hero__label-left {
  left: 2.5rem;
}

.hero__label-right {
  right: 2.5rem;
  text-align: right;
}

.hero__label-left span,
.hero__label-right span {
  font-family: var(--font-body);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: rgba(245, 240, 232, 0.3);
  line-height: 1.6;
}

.hero__title-anchor {
  position: absolute;
  left: 50%;
  top: 48%;
  width: 100%;
  pointer-events: none;
  display: block;
}

.hero__title-anchor--mid {
  transform: translate(-50%, -50%);
  z-index: 2;
  text-align: center;
}

.hero__title-anchor--line1 {
  transform: translate(-50%, calc(-50% - 0.82em));
  z-index: 5;
}

.hero__title-anchor--line3 {
  transform: translate(-50%, calc(-50% + 0.92em));
  z-index: 3;
}

.hero__line {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(3.5rem, 9vw, 11rem);
  line-height: 0.88;
  margin: 0;
  white-space: nowrap;
  color: rgba(245, 240, 232, 0.92);
  justify-content: inherit;
}

.hero__line--1 {
  text-align: left;
  padding-left: 4vw;
}

.hero__line--2 {
  text-align: center;
  justify-content: center;
}

.hero__line--3 {
  text-align: right;
  padding-right: 4vw;
  justify-content: flex-end;
}

.hero__line--3 :deep(.-s-char:last-child) {
  color: var(--color-accent);
}

.-splitted {
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
}

.-splitted :deep(.-s-char) {
  display: inline-flex;
  transform: translate3d(0, 110%, 0);
  will-change: transform;
}

.-splitted.-inview :deep(.-s-char) {
  transform: translate3d(0, 0, 0);
  transition: transform 1.1s cubic-bezier(0.86, 0, 0.31, 1);
  transition-delay: calc((var(--char-start) / 5) * 0.08s);
}

.hero__mascot-wrap {
  position: absolute;
  bottom: -20px;
  left: 50%;
  z-index: 4;
  width: clamp(280px, 30vw, 460px);
  pointer-events: none;
  transform:
    translateX(-50%)
    translateY(calc(var(--progress, 0) * 60vh))
    scale(calc(1 - var(--progress, 0) * 0.25));
  opacity: calc(1 - var(--progress, 0) * 1.8);
  will-change: transform, opacity;
}

.hero__mascot {
  width: 100%;
}

.hero__mascot img {
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
}

.hero__bottom {
  position: absolute;
  bottom: 2rem;
  left: 0;
  right: 0;
  z-index: 6;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 2.5rem;
}

.hero__bottom-left,
.hero__bottom-right {
  font-family: var(--font-body);
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.13em;
  color: rgba(245, 240, 232, 0.28);
  line-height: 1.9;
}

.hero__bottom-right {
  text-align: right;
}

.hero__scroll-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.hero__scroll-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent);
}

@media (max-width: 768px) {
  .hero__label-left,
  .hero__label-right {
    display: none;
  }

  .hero__card {
    display: none;
  }

  .hero__line--1 {
    padding-left: 3vw;
  }

  .hero__line--3 {
    padding-right: 3vw;
  }

  .hero__mascot-wrap {
    width: clamp(200px, 58vw, 320px);
  }

  .hero__title-anchor--line1 {
    transform: translate(-50%, calc(-50% - 0.76em));
  }

  .hero__title-anchor--line3 {
    transform: translate(-50%, calc(-50% + 0.82em));
  }

  .hero__bottom {
    padding: 0 1.25rem;
    bottom: 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .-splitted :deep(.-s-char) {
    transform: translate3d(0, 0, 0);
    transition: none;
  }
}
</style>
