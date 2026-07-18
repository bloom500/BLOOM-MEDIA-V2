<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const is404 = computed(() => props.error?.statusCode === 404)

useHead({
  title: is404.value ? 'Pagină negăsită | Bloom Media' : 'Eroare | Bloom Media',
  meta: [{ name: 'robots', content: 'noindex' }],
})

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <main class="err">
    <div class="err__inner">
      <span class="err__eyebrow">{{ is404 ? 'Eroare 404' : `Eroare ${error?.statusCode || ''}` }}</span>
      <h1 class="err__title">
        {{ is404 ? 'Pagina asta nu există.' : 'Ceva n-a mers.' }}
      </h1>
      <p class="err__sub">
        {{ is404
          ? 'Linkul e greșit sau pagina a fost mutată. Nimic pierdut, totul e la un click.'
          : 'A apărut o eroare neașteptată. Încearcă din nou sau scrie-ne direct.' }}
      </p>
      <div class="err__actions">
        <button class="err__btn" type="button" @click="goHome">Înapoi acasă</button>
        <NuxtLink class="err__link" to="/audit" @click="goHome">Audit gratuit →</NuxtLink>
      </div>
      <p class="err__contact">
        Sau scrie la <a href="mailto:contact@bloommedia.ro">contact@bloommedia.ro</a>
      </p>
    </div>
  </main>
</template>

<style scoped>
.err {
  min-height: 100svh;
  display: flex;
  align-items: center;
  background: #EDEBE6;
  padding: 0 8vw;
}

.err__inner { max-width: 640px; }

.err__eyebrow {
  display: block;
  font-family: var(--font-body, sans-serif);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #9A9590;
  margin-bottom: 1.4rem;
}

.err__title {
  font-family: var(--font-display, Georgia, serif);
  font-weight: 400;
  font-size: clamp(2.4rem, 5vw, 4.5rem);
  line-height: 1.02;
  letter-spacing: -0.02em;
  color: #1A1814;
  margin: 0 0 1.4rem;
}

.err__sub {
  font-family: var(--font-body, sans-serif);
  font-size: 0.95rem;
  line-height: 1.65;
  color: #625D56;
  max-width: 42ch;
  margin: 0 0 2.4rem;
}

.err__actions {
  display: flex;
  align-items: center;
  gap: 1.6rem;
  flex-wrap: wrap;
}

.err__btn {
  font-family: var(--font-body, sans-serif);
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #EDEBE6;
  background: #1A1814;
  border: none;
  border-radius: 2px;
  padding: 0.85rem 2rem;
  cursor: pointer;
}

.err__btn:hover { opacity: 0.85; }

.err__link {
  font-family: var(--font-body, sans-serif);
  font-size: 0.85rem;
  color: #1A1814;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.err__contact {
  font-family: var(--font-body, sans-serif);
  font-size: 0.78rem;
  color: #9A9590;
  margin-top: 2.4rem;
}

.err__contact a { color: #1A1814; }
</style>
