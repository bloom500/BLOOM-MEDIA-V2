<template>
  <section class="hero">
    <div class="hero__shell">
      <div class="hero__top">
        <div class="hero__top-left">
          <span class="hero__label">
            Agenție de Marketing Digital
          </span>
        </div>
        <div class="hero__top-right" aria-hidden="true" />
      </div>

      <div class="hero__center">
        <p
          class="hero__statement -splitted"
          string="split"
          string-split="word[start]"
          string-repeat
        >
          Creștem afaceri digitale.
        </p>
      </div>

      <div class="hero__bottom">
        <div class="hero__bottom-left">
          <NuxtLink to="/servicii" class="hero__link">
            <span>Vezi serviciile</span>
            <span class="hero__link-dot">:</span>
          </NuxtLink>
        </div>
        <div class="hero__bottom-right">
          <div class="hero__scroll-circle" aria-hidden="true">
            <svg viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke="currentColor"
                stroke-width="0.5"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100vh;
  min-height: 100svh;
  background: transparent;
}

.hero__shell {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100svh;
  min-height: 100dvh;
  padding: 5rem 2.5rem 1.5rem;
}

.hero__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-top: 0.5rem;
}

.hero__label {
  font-family: var(--font-body);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-text-soft);
}

.hero__center {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 2vw;
}

.hero__statement {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(2rem, 5vw, 5.5rem);
  line-height: 1.1;
  color: var(--color-text);
  max-width: 60vw;
  margin: 0;
}

.hero__bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: 0.5rem;
}

.hero__link {
  font-family: var(--font-body);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-text-muted);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hero__link:hover {
  color: var(--color-text);
}

.hero__link-dot {
  color: var(--color-text);
}

.hero__scroll-circle {
  width: 36px;
  height: 36px;
  color: var(--color-text-faint);
}

.hero__scroll-circle svg {
  display: block;
  width: 100%;
  height: 100%;
}

@keyframes hero-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .hero__shell {
    padding: 4.5rem 1.25rem 1.25rem;
  }

  .hero__statement {
    font-size: clamp(1.8rem, 8vw, 3rem);
    max-width: 90vw;
  }
}

</style>
