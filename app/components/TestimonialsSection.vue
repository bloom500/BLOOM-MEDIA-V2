<template>
  <section class="testimonials" string string-repeat>
    <div class="testimonials__grain" aria-hidden="true" />
    <div class="testimonials__header">
      <span class="testimonials__label">10 — Testimoniale</span>
      <h2 class="testimonials__title">Ce spun <span class="testimonials__title--accent">partenerii</span> noștri.</h2>
    </div>
    <div class="testimonials__placeholder">
      [Testimonials Placeholder]
    </div>
  </section>
</template>

<style scoped>
.testimonials {
  position: relative;
  overflow: hidden;
  width: 100%;
  min-height: 80vh;
  background: transparent;
  padding: 8rem 2.5rem 6rem;
}

.testimonials__grain {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.06;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 160px 160px;
}

.testimonials__header {
  position: relative;
  z-index: 2;
  margin-bottom: 4rem;
}

.testimonials__label {
  display: block;
  font-family: var(--font-body);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--color-text-soft);
  margin-bottom: 2rem;
}

.testimonials__title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(3rem, 8vw, 7rem);
  line-height: 0.95;
  color: var(--color-text);
  margin: 0;
}

.testimonials__title--accent {
  font-style: italic;
}

.testimonials__placeholder {
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
  .testimonials {
    padding: 5rem 1.25rem 3rem;
  }
}
</style>
