<template>
  <main class="cfg" data-cursor-dark>
    <div class="cfg-grain" aria-hidden="true" />

    <div class="cfg-wrap">
      <!-- ── LEFT: catalogue ──────────────────────────────────── -->
      <div class="cfg-left">
        <header class="cfg-header">
          <span class="cfg-eyebrow">Calificare / 2026</span>
          <h1 class="cfg-title">
            <span>Definește</span>
            <em>parametrii</em>
          </h1>
          <p class="cfg-intro">
            Dacă nu poți defini clar ce ai nevoie, nu ești gata să lucrezi cu noi.
            Selectează ceea ce servește conversia.
          </p>
        </header>

        <div class="cfg-cats">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="cfg-cat"
            :class="{ 'is-open': openCats[cat.id] }"
          >
            <button
              class="cfg-cat-head"
              @click="toggleCat(cat.id)"
              :aria-expanded="String(openCats[cat.id])"
            >
              <span class="cfg-cat-num">{{ cat.num }}</span>
              <span class="cfg-cat-label">{{ cat.label }}</span>
              <span class="cfg-cat-sub" :class="{ 'is-visible': catTotal(cat.id) > 0 }">
                €{{ catTotal(cat.id) }}
              </span>
              <span class="cfg-cat-toggle" aria-hidden="true">
                {{ openCats[cat.id] ? '−' : '+' }}
              </span>
            </button>

            <div class="cfg-cat-body">
              <div class="cfg-cat-inner">
                <button
                  v-for="item in cat.items"
                  :key="item.id"
                  class="cfg-item"
                  :class="{ 'is-sel': selIds.has(item.id) }"
                  @click="toggle(item.id)"
                  :aria-pressed="String(selIds.has(item.id))"
                  type="button"
                >
                  <!-- The editorial annotation: a scaleY bar -->
                  <span class="cfg-item-bar" aria-hidden="true" />
                  <span class="cfg-item-body">
                    <span class="cfg-item-name">{{ item.name }}</span>
                    <span class="cfg-item-desc">{{ item.desc }}</span>
                  </span>
                  <span class="cfg-item-price">
                    <span class="cfg-item-price-val">€{{ item.price }}</span>
                    <span class="cfg-item-price-per">{{ item.oneTime ? 'one‑time' : '/ lună' }}</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── RIGHT: presence + totals ──────────────────────────── -->
      <aside class="cfg-right">
        <!--
          Statue placeholder — replace .cfg-presence-form contents with a
          Three.js <canvas> when the statue .glb is ready.
          Drive opacity via: style="opacity: presenceRatio"
        -->
        <div class="cfg-presence" :style="{ '--p': presenceRatio }">
          <div class="cfg-presence-form" aria-hidden="true">
            <span class="cfg-pf-rule cfg-pf-rule--a" />
            <span class="cfg-pf-word">Bloom</span>
            <span class="cfg-pf-rule cfg-pf-rule--b" />
            <span class="cfg-pf-word cfg-pf-word--sub">Media</span>
            <span class="cfg-pf-rule cfg-pf-rule--c" />
          </div>
          <p class="cfg-presence-msg" :class="{ 'is-visible': presenceRatio >= 1 }">
            Brief complet. Suntem gata.
          </p>
        </div>

        <div class="cfg-totals">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="cfg-totals-row"
            :class="{ 'is-active': catTotal(cat.id) > 0 }"
          >
            <span>{{ cat.label }}</span>
            <span>€{{ catTotal(cat.id) }}</span>
          </div>
          <div class="cfg-totals-grand">
            <span>Investiție</span>
            <strong>€{{ grandTotal }}</strong>
          </div>
        </div>
      </aside>
    </div>

    <!-- ── FORM: appears once any item is selected ──────────────── -->
    <Transition name="form-reveal">
      <section v-if="grandTotal > 0" class="cfg-form-wrap">
        <div class="cfg-form-head">
          <span class="cfg-eyebrow">Pasul următor</span>
          <h2 class="cfg-form-title">Transmite brieful</h2>
        </div>
        <form class="cfg-form" @submit.prevent="handleSubmit" novalidate>
          <div class="cfg-form-grid">
            <div class="cfg-field">
              <label for="cfg-biz">Companie</label>
              <input
                id="cfg-biz"
                v-model="form.biz"
                type="text"
                placeholder="Bloom Media SRL"
                autocomplete="organization"
                required
              />
            </div>
            <div class="cfg-field">
              <label for="cfg-name">Nume</label>
              <input
                id="cfg-name"
                v-model="form.name"
                type="text"
                placeholder="Ion Popescu"
                autocomplete="name"
                required
              />
            </div>
            <div class="cfg-field">
              <label for="cfg-email">Email</label>
              <input
                id="cfg-email"
                v-model="form.email"
                type="email"
                placeholder="ion@companie.ro"
                autocomplete="email"
                required
              />
            </div>
            <div class="cfg-field">
              <label for="cfg-phone">Telefon</label>
              <input
                id="cfg-phone"
                v-model="form.phone"
                type="tel"
                placeholder="+40 721 234 567"
                autocomplete="tel"
                required
              />
            </div>
            <div class="cfg-field cfg-field--full">
              <label for="cfg-notes">Obiective (opțional)</label>
              <textarea
                id="cfg-notes"
                v-model="form.notes"
                rows="3"
                placeholder="Vrem să creștem ROAS de la 1.2x la 3x în 6 luni…"
              />
            </div>
          </div>
          <div class="cfg-form-footer">
            <span class="cfg-form-total">€{{ grandTotal }}<em> / lună</em></span>
            <button type="submit" :disabled="!formValid || submitting">
              {{ submitting ? 'Se trimite…' : 'Transmite cererea' }}
            </button>
          </div>
        </form>
      </section>
    </Transition>
  </main>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

useHead({
  title: 'Configurator — Bloom Media',
  meta: [
    { name: 'description', content: 'Instrument de calificare. Definește parametrii colaborării cu Bloom Media.' },
  ],
})

// ── Catalogue ──────────────────────────────────────────────────────────────
const categories = [
  {
    id: 'capturare',
    num: '01',
    label: 'Capturare',
    items: [
      { id: 'cap-content',   name: 'Management Conținut',       desc: 'Sistem consistent de creație care capturează atenție și generează interacțiuni măsurabile.', price: 150, oneTime: false },
      { id: 'cap-video',     name: 'Pachet 4× Video Reels',     desc: '4 clipuri/lună. Scripting, editare dinamică și optimizare pentru Ads. Stop-scroll garantat.', price: 250, oneTime: false },
      { id: 'cap-creatives', name: 'Creatives Static (Ads)',    desc: 'Set de bannere performante. Focus pe CTR ridicat.', price: 50, oneTime: false },
      { id: 'cap-community', name: 'Community Management',      desc: 'Moderare comentarii și mesaje cu focus pe direcționare către conversie.', price: 50, oneTime: false },
    ],
  },
  {
    id: 'conversie',
    num: '02',
    label: 'Conversie',
    items: [
      { id: 'conv-meta',   name: 'Meta Ads',              desc: 'Strategie completă de Retargeting și optimizare cost/lead. Facebook & Instagram.', price: 250, oneTime: false },
      { id: 'conv-google', name: 'Google Ads',            desc: 'Targetare intenție de căutare pentru capturare lead direct din nevoie exprimată.', price: 150, oneTime: false },
      { id: 'conv-tiktok', name: 'TikTok Ads',            desc: 'Scalare achiziție prin platforme video unde audiența ta consumă conținut.', price: 150, oneTime: false },
    ],
  },
  {
    id: 'infrastructura',
    num: '03',
    label: 'Infrastructură',
    items: [
      { id: 'inf-landing', name: 'Landing Page Conversie',    desc: 'Viteză maximă, construită exclusiv pentru conversie. Zero distracții.', price: 300, oneTime: true },
      { id: 'inf-ecom',    name: 'E-commerce Development',   desc: 'Platformă scalabilă cu checkout optimizat pentru finalizare tranzacție.', price: 300, oneTime: true },
      { id: 'inf-seo',     name: 'SEO Tehnic',               desc: 'Viteză site, indexare, tehnică pură pentru reducere fricțiune conversie.', price: 100, oneTime: false },
      { id: 'inf-ai',      name: 'Automatizări AI & Chatboți', desc: 'Chatboți și automatizări workflow pentru calificare lead și reducere timp răspuns.', price: 150, oneTime: true },
    ],
  },
]

const TOTAL_ITEMS = categories.reduce((n, c) => n + c.items.length, 0) // 11

// ── State ──────────────────────────────────────────────────────────────────
const selIds = reactive(new Set<string>())

const openCats = reactive<Record<string, boolean>>({
  capturare: true,
  conversie: false,
  infrastructura: false,
})

const form = reactive({ biz: '', name: '', email: '', phone: '', notes: '' })
const submitting = ref(false)

// ── Logic ──────────────────────────────────────────────────────────────────
function toggle(id: string) {
  selIds.has(id) ? selIds.delete(id) : selIds.add(id)
}

function toggleCat(id: string) {
  openCats[id] = !openCats[id]
}

function catTotal(catId: string): number {
  const cat = categories.find(c => c.id === catId)
  if (!cat) return 0
  return cat.items.reduce((sum, item) => selIds.has(item.id) ? sum + item.price : sum, 0)
}

const grandTotal = computed(() =>
  categories.reduce((sum, cat) => sum + catTotal(cat.id), 0)
)

const presenceRatio = computed(() =>
  Math.min(selIds.size / TOTAL_ITEMS, 1)
)

const formValid = computed(() =>
  form.biz.trim() && form.name.trim() && form.email.trim() && form.phone.trim()
)

async function handleSubmit() {
  if (!formValid.value || submitting.value) return
  submitting.value = true
  await new Promise(r => setTimeout(r, 1200))
  alert(`Cerere transmisă! Total: €${grandTotal.value}`)
  submitting.value = false
}
</script>

<style scoped>
/* ── Page shell ─────────────────────────────────────────────────────── */
.cfg {
  position: relative;
  min-height: 100dvh;
  background: var(--color-bg-dark);
  color: var(--color-bg-light);
  --cfg-text: #EDEBE6;
  --cfg-muted: rgba(237, 235, 230, 0.45);
  --cfg-border: rgba(237, 235, 230, 0.1);
  --cfg-border-md: rgba(237, 235, 230, 0.2);
}

.cfg-grain {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.045;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 160px 160px;
}

/* ── Layout ─────────────────────────────────────────────────────────── */
.cfg-wrap {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr;
  padding: 6rem 1.5rem 4rem;
  gap: 5rem;
  max-width: 1400px;
  margin: 0 auto;
}

@media (min-width: 960px) {
  .cfg-wrap {
    grid-template-columns: 1fr 360px;
    padding: 8rem 4rem 6rem;
    gap: 6rem;
    align-items: start;
  }
}

/* ── Header ─────────────────────────────────────────────────────────── */
.cfg-eyebrow {
  display: block;
  font-family: var(--font-body);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--cfg-muted);
  margin-bottom: 2rem;
}

.cfg-header {
  margin-bottom: 5rem;
}

.cfg-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(3.5rem, 9vw, 10rem);
  line-height: 0.92;
  letter-spacing: -0.01em;
  color: var(--cfg-text);
  margin: 0 0 2rem;
  display: flex;
  flex-direction: column;
}

.cfg-title em {
  font-style: italic;
  padding-left: 6vw;
  color: rgba(237, 235, 230, 0.65);
}

.cfg-intro {
  font-family: var(--font-body);
  font-size: 0.875rem;
  line-height: 1.65;
  color: var(--cfg-muted);
  max-width: 480px;
}

/* ── Categories ─────────────────────────────────────────────────────── */
.cfg-cats {
  display: flex;
  flex-direction: column;
  border-top: 0.5px solid var(--cfg-border);
}

.cfg-cat {
  border-bottom: 0.5px solid var(--cfg-border);
}

/* ── Category header ───────────────────────────────────────────────── */
.cfg-cat-head {
  width: 100%;
  display: flex;
  align-items: baseline;
  gap: 1.25rem;
  padding: 1.75rem 0;
  background: none;
  border: none;
  color: var(--cfg-text);
  cursor: pointer;
  text-align: left;
  transition: opacity 0.15s ease-out;
}

.cfg-cat-head:hover {
  opacity: 0.75;
}

.cfg-cat-num {
  font-family: var(--font-display);
  font-size: 1rem;
  font-style: italic;
  color: var(--cfg-muted);
  flex-shrink: 0;
  width: 2rem;
}

.cfg-cat-label {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3.5vw, 2.5rem);
  font-weight: 400;
  letter-spacing: -0.01em;
  flex: 1;
}

.cfg-cat-sub {
  font-family: var(--font-body);
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  color: var(--cfg-muted);
  opacity: 0;
  transform: translateY(4px);
  transition:
    opacity 0.2s ease-out,
    transform 0.2s ease-out;
}

.cfg-cat-sub.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.cfg-cat-toggle {
  font-family: var(--font-body);
  font-size: 1.1rem;
  font-weight: 300;
  color: var(--cfg-muted);
  flex-shrink: 0;
  width: 1.5rem;
  text-align: right;
  transition: color 0.15s;
}

.cfg-cat.is-open .cfg-cat-toggle {
  color: var(--cfg-text);
}

/* ── Accordion body — CSS grid trick for smooth height ─────────────── */
.cfg-cat-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1);
}

.cfg-cat.is-open .cfg-cat-body {
  grid-template-rows: 1fr;
}

.cfg-cat-inner {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Item — the editorial annotation row ───────────────────────────── */
.cfg-item {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1.5rem;
  align-items: start;
  padding: 1.5rem 0 1.5rem 1.25rem;
  border-top: 0.5px solid var(--cfg-border);
  background: none;
  border-left: none;
  border-right: none;
  border-bottom: none;
  color: var(--cfg-text);
  cursor: pointer;
  text-align: left;
  transition:
    padding-left 0.18s ease-out,
    background 0.18s ease-out;
}

.cfg-item:hover {
  background: rgba(237, 235, 230, 0.03);
}

.cfg-item.is-sel {
  padding-left: 2rem;
}

/* The margin bar — this IS the selection affordance */
.cfg-item-bar {
  position: absolute;
  left: 0;
  top: 0.75rem;
  bottom: 0.75rem;
  width: 1.5px;
  background: var(--cfg-text);
  transform: scaleY(0);
  transform-origin: top center;
  transition: transform 0.18s ease-out;
}

.cfg-item.is-sel .cfg-item-bar {
  transform: scaleY(1);
}

.cfg-item-body {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.cfg-item-name {
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.01em;
  transition: font-style 0.15s ease-out;
}

.cfg-item.is-sel .cfg-item-name {
  font-style: italic;
}

.cfg-item-desc {
  font-family: var(--font-body);
  font-size: 0.78rem;
  line-height: 1.6;
  color: var(--cfg-muted);
  max-width: 480px;
}

.cfg-item-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  padding-top: 0.2rem;
}

.cfg-item-price-val {
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  color: var(--cfg-text);
  opacity: 0.5;
  transition: opacity 0.18s ease-out;
}

.cfg-item.is-sel .cfg-item-price-val {
  opacity: 1;
}

.cfg-item-price-per {
  font-family: var(--font-body);
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--cfg-muted);
}

/* ── Right column ───────────────────────────────────────────────────── */
.cfg-right {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

@media (min-width: 960px) {
  .cfg-right {
    position: sticky;
    top: 6rem;
  }
}

/* ── Presence: typographic materialization ─────────────────────────── */
.cfg-presence {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.cfg-presence-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  opacity: calc(0.05 + 0.95 * var(--p, 0));
  transition: opacity 0.3s ease-out;
}

.cfg-pf-rule {
  display: block;
  height: 0.5px;
  background: var(--cfg-text);
  transform-origin: left;
  transition: transform 0.35s ease-out;
}

.cfg-pf-rule--a { transform: scaleX(calc(0.3 + 0.7 * var(--p, 0))); }
.cfg-pf-rule--b { transform: scaleX(calc(0.15 + 0.85 * var(--p, 0))); }
.cfg-pf-rule--c { transform: scaleX(calc(0.45 + 0.55 * var(--p, 0))); }

.cfg-pf-word {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(3rem, 6vw, 5.5rem);
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--cfg-text);
  padding: 0.25rem 0;
}

.cfg-pf-word--sub {
  font-style: italic;
  font-size: clamp(1.75rem, 3.5vw, 3rem);
  color: rgba(237, 235, 230, 0.55);
  padding-left: 1.5rem;
}

.cfg-presence-msg {
  font-family: var(--font-body);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--cfg-muted);
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 0.35s ease-out,
    transform 0.35s ease-out;
}

.cfg-presence-msg.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ── Totals ─────────────────────────────────────────────────────────── */
.cfg-totals {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-top: 0.5px solid var(--cfg-border);
  border-bottom: 0.5px solid var(--cfg-border);
  padding: 1rem 0;
}

.cfg-totals-row {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0;
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--cfg-muted);
  opacity: 0.4;
  transition: opacity 0.2s ease-out;
}

.cfg-totals-row.is-active {
  opacity: 1;
  color: var(--cfg-text);
}

.cfg-totals-grand {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-top: 1.25rem;
  margin-top: 0.5rem;
  border-top: 0.5px solid var(--cfg-border);
}

.cfg-totals-grand span {
  font-family: var(--font-body);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--cfg-muted);
}

.cfg-totals-grand strong {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(2rem, 4vw, 3rem);
  color: var(--cfg-text);
}

/* ── Form section ───────────────────────────────────────────────────── */
.cfg-form-wrap {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 5rem 1.5rem 6rem;
  border-top: 0.5px solid var(--cfg-border);
}

@media (min-width: 960px) {
  .cfg-form-wrap {
    padding: 6rem 4rem 8rem;
  }
}

.cfg-form-head {
  margin-bottom: 3rem;
}

.cfg-form-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1;
  letter-spacing: -0.01em;
  color: var(--cfg-text);
  margin-top: 1rem;
}

.cfg-form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  max-width: 760px;
}

@media (min-width: 640px) {
  .cfg-form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.cfg-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cfg-field--full {
  grid-column: 1 / -1;
}

.cfg-field label {
  font-family: var(--font-body);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--cfg-muted);
}

.cfg-field input,
.cfg-field textarea {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--cfg-text);
  background: transparent;
  border: 0.5px solid var(--cfg-border-md);
  border-radius: 1px;
  padding: 0.75rem 1rem;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}

.cfg-field input::placeholder,
.cfg-field textarea::placeholder {
  color: rgba(237, 235, 230, 0.2);
}

.cfg-field input:focus,
.cfg-field textarea:focus {
  border-color: rgba(237, 235, 230, 0.5);
}

.cfg-field textarea {
  resize: vertical;
  min-height: 80px;
}

.cfg-form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  margin-top: 2.5rem;
  max-width: 760px;
}

.cfg-form-total {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  color: var(--cfg-text);
}

.cfg-form-total em {
  font-size: 0.65rem;
  font-style: normal;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--cfg-muted);
  margin-left: 0.25rem;
}

.cfg-form button[type="submit"] {
  font-family: var(--font-body);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-bg-dark);
  background: var(--cfg-text);
  border: none;
  border-radius: 1px;
  padding: 0.9rem 2rem;
  cursor: pointer;
  transition:
    opacity 0.2s ease-out,
    transform 0.15s ease-out;
}

.cfg-form button[type="submit"]:hover:not(:disabled) {
  opacity: 0.82;
}

.cfg-form button[type="submit"]:active:not(:disabled) {
  transform: scale(0.98);
}

.cfg-form button[type="submit"]:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ── Form reveal transition ──────────────────────────────────────────── */
.form-reveal-enter-active {
  transition:
    opacity 0.4s ease-out,
    transform 0.4s ease-out;
}
.form-reveal-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

/* ── Reduced motion ──────────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .cfg-item-bar,
  .cfg-cat-body,
  .cfg-pf-rule,
  .cfg-presence-form,
  .cfg-presence-msg,
  .cfg-cat-sub,
  .form-reveal-enter-active {
    transition: none;
  }
}
</style>
