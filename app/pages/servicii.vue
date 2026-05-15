<template>
  <main class="site-main">
    <section class="configurator">
      <ClientOnly>
        <ServiciiBackground />
      </ClientOnly>
      <div class="cfg-grain"  aria-hidden="true" />

      <!-- ── Header ─────────────────────────────────────────────── -->
      <header class="cfg-header">
        <span class="cfg-eyebrow">Calificare / 2026</span>
        <h1 class="cfg-title">Decide.</h1>
        <p class="cfg-subtitle">
          Construim sisteme de marketing care produc rezultate măsurabile.
          Selectează ce servește obiectivul tău și configurăm împreună.
        </p>
      </header>

      <!-- ── Body: accordion LEFT · form RIGHT ─────────────────── -->
      <div class="cfg-body">

        <!-- Left: accordion catalogue -->
        <div class="cfg-left">
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
                type="button"
              >
                <span class="cfg-cat-num">{{ cat.num }}</span>
                <span class="cfg-cat-name">{{ cat.label }}</span>
                <span class="cfg-cat-sub" :class="{ 'is-on': catTotal(cat.id) > 0 }" aria-live="polite">
                  €{{ catTotal(cat.id) }}
                </span>
                <span class="cfg-cat-arrow" aria-hidden="true">{{ openCats[cat.id] ? '−' : '+' }}</span>
              </button>

              <!-- CSS grid-rows accordion: no height JS, no scroll jump -->
              <div class="cfg-cat-body-wrap">
                <div class="cfg-cat-body" :data-cat-id="cat.id">
                  <button
                    v-for="item in cat.items"
                    :key="item.id"
                    class="cfg-item"
                    :class="{ 'is-sel': selIds.has(item.id) }"
                    @click="toggle(item.id)"
                    :aria-pressed="String(selIds.has(item.id))"
                    type="button"
                  >
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

        <!-- Right: form (sticky) -->
        <aside class="cfg-right">
          <form class="cfg-form" @submit.prevent="handleSubmit" novalidate>
            <p class="cfg-form-title">Trimite brieful</p>

            <div class="cfg-form-grid">
              <div class="cfg-field">
                <label for="f-biz">Companie</label>
                <input id="f-biz" v-model="form.businessName" type="text"
                  placeholder="Bloom Media SRL" autocomplete="organization" required />
              </div>
              <div class="cfg-field">
                <label for="f-name">Nume</label>
                <input id="f-name" v-model="form.yourName" type="text"
                  placeholder="Ion Popescu" autocomplete="name" required />
              </div>
              <div class="cfg-field">
                <label for="f-email">Email</label>
                <input id="f-email" v-model="form.email" type="email"
                  placeholder="ion@companie.ro" autocomplete="email" required />
              </div>
              <div class="cfg-field">
                <label for="f-phone">Telefon</label>
                <input id="f-phone" v-model="form.phone" type="tel"
                  placeholder="+40 721 234 567" autocomplete="tel" required />
              </div>
              <div class="cfg-field cfg-field--full">
                <label for="f-notes">Obiective (opțional)</label>
                <textarea id="f-notes" v-model="form.objectives" rows="3"
                  placeholder="Vrem să creștem ROAS de la 1.2x la 3x în 6 luni…" />
              </div>
            </div>

            <div class="cfg-form-footer">
              <div class="cfg-form-total">
                <span class="cfg-form-total-label">Total estimat</span>
                <strong class="cfg-form-total-val">€{{ monthlyTotal }}</strong>
              </div>
              <button type="submit" class="cfg-form-submit" :disabled="!formValid || isSubmitting">
                {{ isSubmitting ? 'Se trimite…' : 'Transmite cererea' }}
              </button>
            </div>
          </form>
        </aside>

      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'

// Force white cursor on dark background
const cursorDark = useState('cursorDark', () => false)
onMounted(() => { cursorDark.value = true })
onUnmounted(() => { cursorDark.value = false })

useHead({
  title: 'Servicii — Bloom Media',
  meta: [
    { name: 'description', content: 'Configurează-ți pachetul de marketing digital. Meta Ads, Google Ads, Web Design, AI Automatizări — prețuri transparente, zero surprize.' },
    { property: 'og:title', content: 'Servicii — Bloom Media' },
    { property: 'og:description', content: 'Configurează-ți pachetul de marketing digital.' },
  ],
  htmlAttrs: { 'data-page': 'servicii' },
  bodyAttrs: { style: 'background: #060604 !important;' },
})

const categories = [
  {
    id: 'capturare', num: '01', label: 'Capturare',
    items: [
      { id: 'capturare-content',   name: 'Management Conținut',    desc: 'Sistem consistent de creație conținut care capturează atenție și generează interacțiuni măsurabile pe canale sociale.', price: 150, oneTime: false },
      { id: 'capturare-video',     name: 'Pachet 4× Video Reels',  desc: '4 clipuri/lună (1 pe săptămână). Scripting, editare dinamică și optimizare pentru Ads. Stop-scroll garantat.', price: 250, oneTime: false },
      { id: 'capturare-creatives', name: 'Creatives Static (Ads)', desc: 'Set de bannere performante pentru campanii. Focus pe CTR (Click-Through-Rate).', price: 50, oneTime: false },
      { id: 'capturare-community', name: 'Community Management',   desc: 'Moderare comentarii și mesaje cu focus pe direcționare către conversie. Engagement = mijloc, nu scop.', price: 50, oneTime: false },
    ],
  },
  {
    id: 'conversie', num: '02', label: 'Conversie',
    items: [
      { id: 'conversie-meta',   name: 'Meta Ads',                     desc: 'Include strategie completă de Retargeting și optimizare cost/lead. Campanii de achiziție pe Facebook & Instagram.', price: 250, oneTime: false },
      { id: 'conversie-google', name: 'Google Ads (Search & YouTube)', desc: 'Targetare intenție de căutare pentru capturare lead direct din nevoie exprimată.', price: 150, oneTime: false },
      { id: 'conversie-tiktok', name: 'TikTok Ads',                   desc: 'Scalare achiziție prin platforme video unde audiența ta consumă conținut.', price: 150, oneTime: false },
    ],
  },
  {
    id: 'infrastructura', num: '03', label: 'Infrastructură',
    items: [
      { id: 'infra-landing',   name: 'Landing Page Conversie',     desc: 'Landing page de viteză maximă, construită exclusiv pentru conversie. Zero distracții.', price: 300, oneTime: true },
      { id: 'infra-ecommerce', name: 'E-commerce Development',     desc: 'Platformă e-commerce scalabilă cu checkout optimizat pentru finalizare tranzacție.', price: 300, oneTime: true },
      { id: 'infra-seo',       name: 'SEO Tehnic',                 desc: 'Viteză site, indexare, tehnică pură pentru reducere fricțiune conversie.', price: 100, oneTime: false },
      { id: 'infra-ai',        name: 'Automatizări AI & Chatboți', desc: 'Chatboți și automatizări workflow pentru calificare lead și reducere timp răspuns.', price: 150, oneTime: true },
    ],
  },
]

const selIds   = reactive(new Set<string>())
const openCats = reactive<Record<string, boolean>>({ capturare: false, conversie: false, infrastructura: false })
const form     = reactive({ businessName: '', yourName: '', email: '', phone: '', objectives: '' })
const isSubmitting = ref(false)

function toggle(id: string)    { selIds.has(id) ? selIds.delete(id) : selIds.add(id) }
function toggleCat(id: string) { openCats[id] = !openCats[id] }

function catTotal(catId: string): number {
  const cat = categories.find(c => c.id === catId)
  return cat ? cat.items.reduce((s, i) => selIds.has(i.id) ? s + i.price : s, 0) : 0
}

const monthlyTotal = computed(() => categories.reduce((s, c) => s + catTotal(c.id), 0))
const formValid    = computed(() => form.businessName.trim() && form.yourName.trim() && form.email.trim() && form.phone.trim())

// Stagger items with GSAP when a category opens (no height animation = no scroll jump)
watch(openCats, (val) => {
  nextTick(() => {
    for (const catId of Object.keys(val)) {
      if (val[catId]) {
        const body = document.querySelector<HTMLElement>(`[data-cat-id="${catId}"]`)
        if (body) {
          gsap.fromTo(
            body.querySelectorAll('.cfg-item'),
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.2, stagger: 0.05, ease: 'power2.out', delay: 0.05 }
          )
        }
      }
    }
  })
}, { deep: true })

async function handleSubmit() {
  if (!formValid.value || isSubmitting.value) return
  isSubmitting.value = true
  try {
    await new Promise(r => setTimeout(r, 1200))
    alert(`Cerere transmisă! Total: €${monthlyTotal.value}`)
  } catch {
    alert('Eroare la trimitere. Încearcă din nou.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* ─── Reset ───────────────────────────────────────────────────── */
.site-main { background: #060604; }

/* ─── Section ─────────────────────────────────────────────────── */
.configurator {
  position: relative;
  z-index: 0;
  width: 100%;
  min-height: 100dvh;
  padding: 7rem 3rem 6rem;
  overflow: visible;
  overflow-anchor: none;
  background: #060604;
}

.cfg-grain {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.07;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 160px 160px;
}

/* Everything above the 3D canvas */
.cfg-header,
.cfg-body { position: relative; z-index: 2; }

/* ─── Header ──────────────────────────────────────────────────── */
.cfg-header {
  margin-bottom: 4rem;
  max-width: 760px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.cfg-eyebrow {
  font-family: var(--font-body);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: rgba(255, 255, 255, 0.4);
}

.cfg-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(3.5rem, 9vw, 9.5rem);
  line-height: 0.92;
  letter-spacing: -0.01em;
  color: #fff;
  margin: 0;
}

.cfg-subtitle {
  font-family: var(--font-body);
  font-size: 0.88rem;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.65);
  max-width: 480px;
  margin: 0;
}

/* ─── Body: two-column grid ───────────────────────────────────── */
.cfg-body {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 5rem;
  align-items: start;
}

.cfg-cats {
  display: flex;
  flex-direction: column;
  border-top: 0.5px solid rgba(255, 255, 255, 0.14);
}

.cfg-cat {
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.14);
}

.cfg-cat-head {
  width: 100%;
  display: flex;
  align-items: baseline;
  gap: 1.25rem;
  padding: 1.6rem 0;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  text-align: left;
  transition: opacity 0.15s ease-out;
}
.cfg-cat-head:hover { opacity: 0.6; }

.cfg-cat-num {
  font-family: var(--font-display);
  font-size: 1rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  width: 1.6rem;
}

.cfg-cat-name {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.6rem, 3vw, 2.6rem);
  letter-spacing: -0.01em;
  color: #fff;
  flex: 1;
}

.cfg-cat-sub {
  font-family: var(--font-body);
  font-size: 0.68rem;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.45);
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}
.cfg-cat-sub.is-on { opacity: 1; transform: translateY(0); }

.cfg-cat-arrow {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.35);
  flex-shrink: 0;
  width: 1.2rem;
  text-align: right;
  transition: color 0.15s;
}
.cfg-cat.is-open .cfg-cat-arrow { color: #fff; }

/* CSS grid-template-rows accordion — zero layout reflow, zero scroll jump */
.cfg-cat-body-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.38s cubic-bezier(0.4, 0, 0.2, 1);
}
.cfg-cat.is-open .cfg-cat-body-wrap {
  grid-template-rows: 1fr;
}

.cfg-cat-body {
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ─── Item ────────────────────────────────────────────────────── */
.cfg-item {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1.5rem;
  align-items: start;
  padding: 1.5rem 0 1.5rem 1.25rem;
  border-top: 0.5px solid rgba(255, 255, 255, 0.08);
  background: none;
  border-left: none;
  border-right: none;
  border-bottom: none;
  color: #fff;
  cursor: pointer;
  text-align: left;
  transition: padding-left 0.18s ease-out, background-color 0.18s ease-out;
}
.cfg-item:hover { background-color: rgba(255, 255, 255, 0.04); }
.cfg-item.is-sel { padding-left: 2.25rem; }

.cfg-item-bar {
  position: absolute;
  left: 0;
  top: 0.875rem;
  bottom: 0.875rem;
  width: 1.5px;
  background: #fff;
  transform: scaleY(0);
  transform-origin: top center;
  transition: transform 0.18s ease-out;
}
.cfg-item.is-sel .cfg-item-bar { transform: scaleY(1); }

.cfg-item-body {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.cfg-item-name {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.2rem, 2vw, 1.75rem);
  line-height: 1.05;
  letter-spacing: -0.01em;
  color: #fff;
  transition: font-style 0.15s;
}
.cfg-item.is-sel .cfg-item-name { font-style: italic; }

.cfg-item-desc {
  font-family: var(--font-body);
  font-size: 0.78rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.45);
  max-width: 500px;
}

.cfg-item-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  padding-top: 0.15rem;
}

.cfg-item-price-val {
  font-family: var(--font-display);
  font-size: clamp(1rem, 1.8vw, 1.4rem);
  color: rgba(255, 255, 255, 0.35);
  white-space: nowrap;
  transition: color 0.18s;
}
.cfg-item.is-sel .cfg-item-price-val { color: #fff; }

.cfg-item-price-per {
  font-family: var(--font-body);
  font-size: 0.56rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.22);
}

/* ─── Right: form (sticky) ────────────────────────────────────── */
.cfg-right {
  position: sticky;
  top: 6rem;
  border: 0.5px solid rgba(255, 255, 255, 0.14);
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.cfg-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.cfg-form-title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 400;
  color: #fff;
  margin: 0;
  padding-bottom: 1.5rem;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.14);
}

.cfg-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.cfg-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.cfg-field--full { grid-column: 1 / -1; }

.cfg-field label {
  font-family: var(--font-body);
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: rgba(255, 255, 255, 0.4);
}

.cfg-field input,
.cfg-field textarea {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
  border: 0.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 1px;
  padding: 0.65rem 0.85rem;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
  width: 100%;
}
.cfg-field input::placeholder,
.cfg-field textarea::placeholder { color: rgba(255, 255, 255, 0.2); }
.cfg-field input:focus,
.cfg-field textarea:focus {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.08);
}
.cfg-field textarea {
  resize: vertical;
  min-height: 72px;
  font-family: var(--font-body);
}

.cfg-form-footer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 0.5px solid rgba(255, 255, 255, 0.14);
}

.cfg-form-total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.cfg-form-total-label {
  font-family: var(--font-body);
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: rgba(255, 255, 255, 0.4);
}

.cfg-form-total-val {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.8rem, 3vw, 2.75rem);
  line-height: 1;
  color: #fff;
}

.cfg-form-submit {
  font-family: var(--font-body);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #060604;
  background: #fff;
  border: none;
  border-radius: 1px;
  padding: 1rem 1.5rem;
  cursor: pointer;
  width: 100%;
  transition: opacity 0.2s, transform 0.15s;
}
.cfg-form-submit:hover:not(:disabled) { opacity: 0.85; }
.cfg-form-submit:active:not(:disabled) { transform: scale(0.98); }
.cfg-form-submit:disabled { opacity: 0.28; cursor: not-allowed; }

/* ─── Responsive ──────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .cfg-body {
    grid-template-columns: 1fr 320px;
    gap: 3rem;
  }
}

@media (max-width: 800px) {
  .configurator { padding: 5rem 1.5rem 4rem; }
  .cfg-body {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  .cfg-right {
    position: static;
  }
  .cfg-form-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cfg-cat-body-wrap,
  .cfg-item-bar,
  .cfg-cat-sub { transition: none; }
}
</style>
