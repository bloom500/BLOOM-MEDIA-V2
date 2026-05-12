<template>
  <section class="salut" string string-repeat>
    <div class="salut__grain" aria-hidden="true" />
    <div class="salut__header">
      <span class="salut__label">12 — Salut</span>
      <h2 class="salut__title">Hai să <span class="salut__title--accent">începem</span> ceva nou.</h2>
    </div>
    <div class="salut__placeholder">
      [Salut / Form Placeholder]
    </div>
  </section>
</template>

<style scoped>
.salut {
  position: relative;
  overflow: hidden;
  width: 100%;
  min-height: 80vh;
  background: transparent;
  padding: 8rem 2.5rem 6rem;
}

.salut__grain {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.06;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 160px 160px;
}

.salut__header {
  position: relative;
  z-index: 2;
  margin-bottom: 4rem;
}

.salut__label {
  display: block;
  font-family: var(--font-body);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--color-text-soft);
  margin-bottom: 2rem;
}

.salut__title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(3rem, 8vw, 7rem);
  line-height: 0.95;
  color: var(--color-text);
  margin: 0;
}

.salut__title--accent {
  font-style: italic;
  color: var(--color-accent);
}

.salut__placeholder {
  position: relative;
  z-index: 2;
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text-muted);
  border: 1px dashed var(--color-border);
  padding: 4rem;
  text-align: center;
}

@media (max-width: 768px) {
  .salut {
    padding: 5rem 1.25rem 3rem;
  }
}
</style>
