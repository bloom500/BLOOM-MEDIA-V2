<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getConsent, setConsent, loadAnalytics } from '~/composables/useAnalytics'

const visible = ref(false)

onMounted(() => {
  const consent = getConsent()
  if (consent === null) visible.value = true
  else if (consent === 'yes') loadAnalytics()
})

function answer(value: 'yes' | 'no') {
  setConsent(value)
  visible.value = false
}
</script>

<template>
  <Transition name="consent">
    <aside v-if="visible" class="consent" role="dialog" aria-label="Preferințe cookie-uri">
      <p class="consent__text">
        Folosim cookie-uri de măsurare (Meta, Google) doar cu acordul tău,
        ca să știm ce funcționează. Detalii în
        <NuxtLink to="/privacy-policy">politica de confidențialitate</NuxtLink>.
      </p>
      <div class="consent__actions">
        <button class="consent__btn consent__btn--ghost" type="button" @click="answer('no')">Refuz</button>
        <button class="consent__btn" type="button" @click="answer('yes')">Accept</button>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.consent {
  position: fixed;
  left: 1rem;
  right: 1rem;
  bottom: 1rem;
  z-index: 10000;
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  background: #1A1814;
  color: #EDEBE6;
  border-radius: 4px;
  padding: 0.9rem 1.2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}

.consent__text {
  font-family: var(--font-body, sans-serif);
  font-size: 0.72rem;
  line-height: 1.55;
  margin: 0;
  color: rgba(237, 235, 230, 0.85);
}

.consent__text a {
  color: #EDEBE6;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.consent__actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.consent__btn {
  font-family: var(--font-body, sans-serif);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #1A1814;
  background: #EDEBE6;
  border: 1px solid #EDEBE6;
  border-radius: 2px;
  padding: 0.55rem 1.1rem;
  cursor: pointer;
}

.consent__btn--ghost {
  color: rgba(237, 235, 230, 0.8);
  background: transparent;
  border-color: rgba(237, 235, 230, 0.35);
}

.consent-enter-active,
.consent-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.consent-enter-from,
.consent-leave-to { opacity: 0; transform: translateY(12px); }

@media (max-width: 560px) {
  .consent { flex-direction: column; align-items: stretch; gap: 0.8rem; }
  .consent__actions { justify-content: flex-end; }
}

@media (prefers-reduced-motion: reduce) {
  .consent-enter-active,
  .consent-leave-active { transition: none; }
}
</style>
