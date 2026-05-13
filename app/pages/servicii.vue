<template>
  <main class="site-main">
    <ClientOnly>
      <ServicesHero3D />
    </ClientOnly>
    <section class="configurator">
      <div class="configurator__grain" aria-hidden="true" />

      <div class="configurator__header">
        <span
          class="configurator__label"
          string="split"
          string-split="line[center]"
          string-repeat
        >Configurator / Calificare</span>
        <h1 class="configurator__title">
          <span
            string="split"
            string-split="char"
            string-repeat
            data-anim="char-reveal"
          >Definește</span>
          <span
            class="configurator__title--accent"
            string="split"
            string-split="char"
            string-repeat
            data-anim="char-reveal"
          >parametrii</span>
        </h1>
        <p class="configurator__subtitle">
          Acest configurator este un mecanism de disciplină. Dacă nu poți defini clar ce ai nevoie, nu ești gata să lucrezi cu noi. Selectează doar ceea ce ai nevoie pentru conversii măsurabile.
        </p>
      </div>

      <div class="configurator__categories">

        <!-- CAPTURARE -->
        <div class="config-cat">
          <div class="config-cat__header">
            <span class="config-cat__num">01</span>
            <h2 class="config-cat__title">Capturare</h2>
            <span class="config-cat__count">{{ selected.capturare.length }} / 4</span>
          </div>
          <div class="config-cat__items">
            <label
              v-for="item in catalog.capturare"
              :key="item.id"
              class="config-item"
              :class="{ '-selected': selected.capturare.includes(item.id) }"
              string
              string-repeat
              data-anim="stagger-item"
            >
              <input
                type="checkbox"
                :value="item.id"
                v-model="selected.capturare"
                class="config-item__checkbox"
              />
              <div class="config-item__check" aria-hidden="true">
                <svg viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="config-item__body">
                <div class="config-item__name">{{ item.name }}</div>
                <div class="config-item__desc">{{ item.desc }}</div>
              </div>
              <div class="config-item__price">
                <span class="config-item__price-value">{{ item.price }}</span>
                <span v-if="item.oneTime" class="config-item__price-note"> one-time</span>
                <span v-else class="config-item__price-note"> / lună</span>
              </div>
            </label>
          </div>
        </div>

        <!-- CONVERSIE -->
        <div class="config-cat">
          <div class="config-cat__header">
            <span class="config-cat__num">02</span>
            <h2 class="config-cat__title">Conversie</h2>
            <span class="config-cat__count">{{ selected.conversie.length }} / 3</span>
          </div>
          <div class="config-cat__items">
            <label
              v-for="item in catalog.conversie"
              :key="item.id"
              class="config-item"
              :class="{ '-selected': selected.conversie.includes(item.id) }"
              string
              string-repeat
              data-anim="stagger-item"
            >
              <input
                type="checkbox"
                :value="item.id"
                v-model="selected.conversie"
                class="config-item__checkbox"
              />
              <div class="config-item__check" aria-hidden="true">
                <svg viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="config-item__body">
                <div class="config-item__name">{{ item.name }}</div>
                <div class="config-item__desc">{{ item.desc }}</div>
              </div>
              <div class="config-item__price">
                <span class="config-item__price-value">{{ item.price }}</span>
                <span class="config-item__price-note"> / lună</span>
              </div>
            </label>
          </div>
        </div>

        <!-- INFRASTRUCTURĂ -->
        <div class="config-cat">
          <div class="config-cat__header">
            <span class="config-cat__num">03</span>
            <h2 class="config-cat__title">Infrastructură</h2>
            <span class="config-cat__count">{{ selected.infrastructura.length }} / 4</span>
          </div>
          <div class="config-cat__items">
            <label
              v-for="item in catalog.infrastructura"
              :key="item.id"
              class="config-item"
              :class="{ '-selected': selected.infrastructura.includes(item.id) }"
              string
              string-repeat
              data-anim="stagger-item"
            >
              <input
                type="checkbox"
                :value="item.id"
                v-model="selected.infrastructura"
                class="config-item__checkbox"
              />
              <div class="config-item__check" aria-hidden="true">
                <svg viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="config-item__body">
                <div class="config-item__name">{{ item.name }}</div>
                <div class="config-item__desc">{{ item.desc }}</div>
              </div>
              <div class="config-item__price">
                <span class="config-item__price-value">{{ item.price }}</span>
                <span v-if="item.oneTime" class="config-item__price-note"> one-time</span>
                <span v-else class="config-item__price-note"> / lună</span>
              </div>
            </label>
          </div>
        </div>

      </div>

      <!-- FORMULAR + TOTAL -->
      <div class="configurator__footer">
        <div class="config-total">
          <div class="config-total__label">Investiție</div>
          <div class="config-total__amount">
            <span class="config-total__currency">€</span>
            <span class="config-total__value">{{ monthlyTotal }}</span>
          </div>
          <p class="config-total__note">Fee Consultanță &amp; Management €{{ monthlyTotal }}</p>
        </div>

        <form class="config-form" @submit.prevent="handleSubmit" novalidate>
          <div class="config-form__fields">
            <div class="config-form__field">
              <label class="config-form__label" for="business-name">Business Name</label>
              <input
                id="business-name"
                v-model="form.businessName"
                type="text"
                class="config-form__input"
                placeholder="Bloom Media SRL"
                required
              />
            </div>
            <div class="config-form__field">
              <label class="config-form__label" for="your-name">Your Name</label>
              <input
                id="your-name"
                v-model="form.yourName"
                type="text"
                class="config-form__input"
                placeholder="Ion Popescu"
                required
              />
            </div>
            <div class="config-form__field">
              <label class="config-form__label" for="email">Email Address</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="config-form__input"
                placeholder="ion@bloommedia.ro"
                required
              />
            </div>
            <div class="config-form__field">
              <label class="config-form__label" for="phone">Phone Number</label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                class="config-form__input"
                placeholder="+40 721 234 567"
                required
              />
            </div>
            <div class="config-form__field config-form__field--full">
              <label class="config-form__label" for="objectives">Obiective Revenue / Detalii Sistem Actual (Opțional)</label>
              <textarea
                id="objectives"
                v-model="form.objectives"
                class="config-form__input config-form__input--textarea"
                placeholder="Vrem să creștem ROAS de la 1.2x la 3x în 6 luni..."
                rows="4"
              />
            </div>
          </div>

          <div class="config-form__submit-row">
            <div class="config-form__total-line">
              <span>Total</span>
              <strong>€{{ monthlyTotal }}</strong>
            </div>
            <button
              type="submit"
              class="config-form__submit"
              :disabled="!formValid || isSubmitting"
            >
              <span v-if="!isSubmitting">Transmite cererea</span>
              <span v-else>Se trimite...</span>
            </button>
          </div>
        </form>
      </div>

    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import ServicesHero3D from '~/components/ServicesHero3D.client.vue'

useHead({
  title: 'Servicii — Bloom Media',
  meta: [
    {
      name: 'description',
      content: 'Configurează-ți pachetul de marketing digital. Meta Ads, Google Ads, Web Design, AI Automatizări —透明 preturi, zero surprize.'
    },
    { property: 'og:title', content: 'Servicii — Bloom Media' },
    { property: 'og:description', content: 'Configurează-ți pachetul de marketing digital.' },
  ]
})

const catalog = {
  capturare: [
    {
      id: 'capturare-content',
      name: 'Management Conținut',
      desc: 'Sistem consistent de creație conținut care capturează atenție și generează interacțiuni măsurabile pe canale sociale.',
      price: '150',
      oneTime: false,
    },
    {
      id: 'capturare-video',
      name: 'Pachet 4x Video Reels (Short-Form)',
      desc: '4 clipuri/lună (1 pe săptămână). Scripting, editare dinamică și optimizare pentru Ads. Stop-scroll garantat.',
      price: '250',
      oneTime: false,
    },
    {
      id: 'capturare-creatives',
      name: 'Pachet Creatives Static (Ads)',
      desc: 'Set de bannere performante pentru campanii. Focus pe CTR (Click-Through-Rate).',
      price: '50',
      oneTime: false,
    },
    {
      id: 'capturare-community',
      name: 'Community Management',
      desc: 'Moderare comentarii și mesaje cu focus pe direcționare către conversie. Engagement = mijloc, nu scop.',
      price: '50',
      oneTime: false,
    },
  ],
  conversie: [
    {
      id: 'conversie-meta',
      name: 'Meta Ads',
      desc: 'Include strategie completă de Retargeting și optimizare cost/lead. Campanii de achiziție pe Facebook & Instagram.',
      price: '250',
      oneTime: false,
    },
    {
      id: 'conversie-google',
      name: 'Google Ads (Search Intent & YouTube)',
      desc: 'Targetare intenție de căutare pentru capturare lead direct din nevoie exprimată.',
      price: '150',
      oneTime: false,
    },
    {
      id: 'conversie-tiktok',
      name: 'TikTok Ads',
      desc: 'Scalare achiziție prin platforme video unde audiența ta consumă conținut.',
      price: '150',
      oneTime: false,
    },
  ],
  infrastructura: [
    {
      id: 'infra-landing',
      name: 'Landing Page Conversie',
      desc: 'Landing page de viteză maximă, construită exclusiv pentru conversie. Zero distracții.',
      price: '300',
      oneTime: true,
    },
    {
      id: 'infra-ecommerce',
      name: 'E-commerce Development',
      desc: 'Platformă e-commerce scalabilă cu checkout optimizat pentru finalizare tranzacție.',
      price: '300',
      oneTime: true,
    },
    {
      id: 'infra-seo',
      name: 'SEO Tehnic',
      desc: 'Viteză site, indexare, tehnică pură pentru reducere fricțiune conversie.',
      price: '100',
      oneTime: false,
    },
    {
      id: 'infra-ai',
      name: 'Automatizări AI & Chatboți',
      desc: 'Chatboți și automatizări workflow pentru calificare lead și reducere timp răspuns.',
      price: '150',
      oneTime: true,
    },
  ],
}

const selected = reactive({
  capturare: [],
  conversie: [],
  infrastructura: [],
})

const form = reactive({
  businessName: '',
  yourName: '',
  email: '',
  phone: '',
  objectives: '',
})

const isSubmitting = ref(false)

const monthlyTotal = computed(() => {
  let total = 0
  for (const id of selected.capturare) {
    const item = catalog.capturare.find(i => i.id === id)
    if (item) total += parseFloat(item.price)
  }
  for (const id of selected.conversie) {
    const item = catalog.conversie.find(i => i.id === id)
    if (item) total += parseFloat(item.price)
  }
  for (const id of selected.infrastructura) {
    const item = catalog.infrastructura.find(i => i.id === id)
    if (item) total += parseFloat(item.price)
  }
  return total.toFixed(2)
})

const formValid = computed(() => {
  return form.businessName.trim() && form.yourName.trim() && form.email.trim() && form.phone.trim()
})

async function handleSubmit() {
  if (!formValid.value || isSubmitting.value) return
  isSubmitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1200))
    alert(`Cerere transmisă! Total: €${monthlyTotal.value}`)
  } catch {
    alert('Eroare la trimitere. Încearcă din nou.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style>
/* Global: suprascriem opacity/transform din animations.css pentru config-item,
   altfel rămân invizibile dacă GSAP ScrollTrigger.batch nu le prinde corect. */
[data-anim="stagger-item"].config-item {
  opacity: 1 !important;
  transform: none !important;
  transition: none !important;
}
</style>

<style scoped>
.site-main {
  background: transparent;
}

/* ─── CONFIGURATOR ─────────────────────────────────────────────── */
.configurator {
  position: relative;
  z-index: 2;
  overflow: hidden;
  width: 100%;
  min-height: 100svh;
  min-height: 100dvh;
  background: rgba(250, 250, 250, 0.82);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 8rem 2.5rem 6rem;
}

.configurator__grain {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.06;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 160px 160px;
}

/* ─── HEADER ──────────────────────────────────────────────────── */
.configurator__header {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 6rem;
  max-width: 900px;
}

.configurator__label {
  font-family: var(--font-body);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--color-text-soft);
}

.configurator__title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(3rem, 8vw, 9rem);
  line-height: 0.95;
  color: var(--color-text);
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.configurator__title--accent {
  font-style: italic;
  padding-left: 8vw;
}

.configurator__subtitle {
  font-family: var(--font-body);
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--color-text-muted);
  max-width: 560px;
  margin: 0.5rem 0 0;
}

/* ─── CATEGORII ───────────────────────────────────────────────── */
.configurator__categories {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 5rem;
  margin-bottom: 6rem;
}

.config-cat__header {
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 0.5px solid var(--color-border);
}

.config-cat__num {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-style: italic;
  color: var(--color-text-soft);
}

.config-cat__title {
  font-family: var(--font-ui);
  font-weight: 600;
  font-size: clamp(1.6rem, 3vw, 2.5rem);
  letter-spacing: -0.02em;
  color: var(--color-text);
  margin: 0;
  flex: 1;
}

.config-cat__count {
  font-family: var(--font-body);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-text-faint);
}

.config-cat__items {
  display: flex;
  flex-direction: column;
}

/* ─── ITEM ────────────────────────────────────────────────────── */
.config-item {
  display: grid;
  grid-template-columns: 24px 1fr auto;
  gap: 1.5rem;
  align-items: start;
  padding: 2rem 0;
  border-top: 0.5px solid var(--color-border);
  cursor: pointer;
  opacity: 0;
  transform: translate3d(0, 24px, 0);
  transition:
    opacity 0.55s var(--ease-2),
    transform 0.55s var(--ease-2),
    padding-left 0.4s var(--ease-2);
}

.config-item.-selected {
  padding-left: 1.5rem;
}

.config-item:last-child {
  border-bottom: 0.5px solid var(--color-border);
}

@media (prefers-reduced-motion: reduce) {
  .config-item {
    opacity: 1;
    transform: none;
  }
}

.config-item__checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.config-item__check {
  width: 22px;
  height: 22px;
  border: 0.5px solid var(--color-border-medium);
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.2rem;
  transition:
    border-color 0.25s,
    background 0.25s,
    color 0.25s;
  color: transparent;
}

.config-item__check svg {
  width: 12px;
  height: 12px;
  display: block;
}

.config-item.-selected .config-item__check {
  border-color: var(--color-text);
  background: var(--color-text);
  color: var(--color-bg);
}

.config-item__body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.config-item__name {
  font-family: var(--font-ui);
  font-weight: 600;
  font-size: clamp(1.4rem, 2.5vw, 2rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: #111111;
  margin: 0;
}

.config-item__desc {
  font-family: var(--font-body);
  font-size: 0.82rem;
  line-height: 1.6;
  color: rgba(17, 17, 17, 0.75);
  max-width: 560px;
  margin: 0;
}

.config-item__price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}

.config-item__price-value {
  font-family: var(--font-display);
  font-size: clamp(1.2rem, 2vw, 1.6rem);
  color: #fafafa;
  white-space: nowrap;
}

.config-item__price-note {
  font-family: var(--font-body);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(250, 250, 250, 0.62);
}

/* ─── FOOTER / FORM ──────────────────────────────────────────── */
.configurator__footer {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
  align-items: start;
  padding-top: 5rem;
  border-top: 0.5px solid var(--color-border);
  max-width: 1100px;
}

.config-total__label {
  font-family: var(--font-body);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--color-text-soft);
  margin-bottom: 0.75rem;
}

.config-total__amount {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.config-total__currency {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 3vw, 2.5rem);
  color: var(--color-text-muted);
}

.config-total__value {
  font-family: var(--font-display);
  font-size: clamp(3rem, 6vw, 6rem);
  line-height: 1;
  color: var(--color-text);
}

.config-total__note {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--color-text-faint);
  margin: 0.5rem 0 0;
  max-width: 200px;
  line-height: 1.5;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.config-form__fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.config-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.config-form__field--full {
  grid-column: 1 / -1;
}

.config-form__label {
  font-family: var(--font-body);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-text-soft);
}

.config-form__input {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text);
  background: transparent;
  border: 0.5px solid var(--color-border-medium);
  border-radius: 2px;
  padding: 0.75rem 1rem;
  outline: none;
  transition: border-color 0.25s;
  width: 100%;
}

.config-form__input::placeholder {
  color: var(--color-text-faint);
}

.config-form__input:focus {
  border-color: var(--color-text);
}

.config-form__input--textarea {
  resize: vertical;
  min-height: 100px;
  font-family: var(--font-body);
}

.config-form__submit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.config-form__total-line {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.config-form__total-line span {
  font-family: var(--font-body);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-text-soft);
}

.config-form__total-line strong {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 3vw, 2.5rem);
  font-weight: 400;
  color: var(--color-text);
}

.config-form__submit {
  font-family: var(--font-body);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-bg);
  background: var(--color-text);
  border: none;
  border-radius: 2px;
  padding: 1rem 2rem;
  cursor: pointer;
  transition:
    opacity 0.25s,
    transform 0.2s;
}

.config-form__submit:hover:not(:disabled) {
  opacity: 0.85;
}

.config-form__submit:active:not(:disabled) {
  transform: scale(0.98);
}

.config-form__submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ─── RESPONSIVE ──────────────────────────────────────────────── */
@media (max-width: 900px) {
  .configurator__footer {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}

@media (max-width: 640px) {
  .configurator {
    padding: 5rem 1.25rem 3rem;
  }

  .config-item {
    grid-template-columns: 20px 1fr;
    gap: 1rem;
  }

  .config-item__price {
    grid-column: 2;
    grid-row: 3;
    align-items: flex-start;
    flex-direction: row;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }

  .config-cat__items .config-item:nth-child(2) {
    transition-delay: 0.08s;
  }
  .config-cat__items .config-item:nth-child(3) {
    transition-delay: 0.16s;
  }
  .config-cat__items .config-item:nth-child(4) {
    transition-delay: 0.24s;
  }

  .config-form__fields {
    grid-template-columns: 1fr;
  }

  .configurator__title--accent {
    padding-left: 12vw;
  }
}
</style>
