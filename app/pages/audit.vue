<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { trackLead } from '~/composables/useAnalytics'

useHead({
  title: 'Audit Gratuit | Bloom Media',
  meta: [
    {
      name: 'description',
      content: 'Primești o analiză gratuită a prezenței tale digitale. Îți spunem ce funcționează, ce nu, și ce am face diferit. Fără obligații.'
    },
    { property: 'og:title',       content: 'Audit Gratuit | Bloom Media' },
    { property: 'og:description', content: 'Analiză gratuită a prezenței tale digitale. Fără obligații.' },
    { property: 'og:url',         content: 'https://bloommedia.ro/audit' },
    { property: 'og:image',       content: 'https://bloommedia.ro/og-image.jpg' },
  ],
  link: [{ rel: 'canonical', href: 'https://bloommedia.ro/audit' }],
})

// ── Endpoint ────────────────────────────────────────────────────────────────
const WEBHOOK_URL = '/api/audit'

// ── Form state ──────────────────────────────────────────────────────────────
const form = reactive({
  name:    '',
  email:   '',
  phone:   '',
  website: '',
  social:  '',
  message: '',
  consent: false,
  // Honeypot — invizibil pentru oameni (CSS .hp-field); completat = bot.
  company_website: '',
})

const isSubmitting = ref(false)
const submitted    = ref(false)
const error        = ref('')

// Per-field format errors, shown after blur sau la submit.
const fieldErrors = reactive<{ email: string; phone: string }>({ email: '', phone: '' })

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// Minim 8 cifre după eliminarea separatoarelor — acoperă formate RO cu/fără prefix.
const PHONE_RE = /^[+\d][\d\s().-]{7,}$/

function validateEmail() {
  fieldErrors.email = form.email.trim() && !EMAIL_RE.test(form.email.trim())
    ? 'Emailul nu pare valid, verifică-l.'
    : ''
}
function validatePhone() {
  fieldErrors.phone = form.phone.trim() && !PHONE_RE.test(form.phone.trim())
    ? 'Numărul de telefon nu pare valid.'
    : ''
}

const formValid = computed(() =>
  form.name.trim()
  && EMAIL_RE.test(form.email.trim())
  && PHONE_RE.test(form.phone.trim())
  && form.consent
)

// ── Submit ──────────────────────────────────────────────────────────────────
async function handleSubmit() {
  validateEmail()
  validatePhone()
  if (!formValid.value || isSubmitting.value) return
  isSubmitting.value = true
  error.value = ''

  // Același eventId merge la Meta Pixel (browser) și la CAPI (server) — dedup.
  const eventId = crypto.randomUUID()

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:    form.name.trim(),
        email:   form.email.trim(),
        phone:   form.phone.trim(),
        website: form.website.trim() || null,
        social:  form.social.trim()  || null,
        message: form.message.trim() || null,
        consent: form.consent,
        company_website: form.company_website,
        eventId,
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    submitted.value = true
    trackLead(eventId)
  } catch {
    error.value = 'Nu am putut trimite cererea. Încearcă din nou sau scrie la hello@bloommedia.ro.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="audit">

    <!-- ── Left: context ──────────────────────────────────────────── -->
    <div class="audit__left">
      <span class="audit__eyebrow">Audit gratuit</span>

      <h1 class="audit__title">
        Îți spunem<br>
        ce nu merge.
      </h1>

      <p class="audit__sub">
        O analiză de 20 de minute pe site, ads și social.
        Îți spunem concret ce e de corectat, ai sau n-ai cu noi.
      </p>

      <ul class="audit__promises">
        <li>Răspuns în 24h</li>
        <li>Fără prezentare de vânzare</li>
        <li>Fără obligații</li>
      </ul>
    </div>

    <!-- ── Right: form / success ─────────────────────────────────── -->
    <div class="audit__right">

      <!-- Success state -->
      <Transition name="fade">
        <div v-if="submitted" class="audit__success">
          <span class="audit__success-mark" aria-hidden="true">✓</span>
          <h2 class="audit__success-title">Am primit cererea.</h2>
          <p class="audit__success-body">
            Sistemul a înregistrat-o deja și ai primit o confirmare pe email.
          </p>
          <ul class="audit__success-steps">
            <li>În maxim 24h primești analiza inițială, în scris.</li>
            <li>Apoi stabilim un call de 20 de minute, fără pitch de vânzare.</li>
            <li>Dacă are sens, în 24h după call ai propunerea cu preț fix.</li>
          </ul>
          <p class="audit__success-body">
            Grabă? Sună direct: <a href="tel:+40763281168">0763 281 168</a> sau
            scrie la <a href="mailto:hello@bloommedia.ro">hello@bloommedia.ro</a>
          </p>
        </div>
      </Transition>

      <!-- Form -->
      <Transition name="fade">
        <form
          v-if="!submitted"
          class="audit__form"
          novalidate
          @submit.prevent="handleSubmit"
        >
          <!-- Row 1: Nume + Telefon -->
          <div class="audit__row">
            <div class="audit__field">
              <label for="audit-name">Nume</label>
              <input
                id="audit-name"
                v-model="form.name"
                type="text"
                placeholder="Ion Popescu"
                autocomplete="name"
                required
              />
            </div>
            <div class="audit__field">
              <label for="audit-phone">Telefon</label>
              <input
                id="audit-phone"
                v-model="form.phone"
                type="tel"
                placeholder="07xx xxx xxx"
                autocomplete="tel"
                required
                :aria-invalid="!!fieldErrors.phone"
                @blur="validatePhone"
              />
              <p v-if="fieldErrors.phone" class="audit__field-error" role="alert">
                {{ fieldErrors.phone }}
              </p>
            </div>
          </div>

          <!-- Row 2: Email -->
          <div class="audit__field audit__field--full">
            <label for="audit-email">Email</label>
            <input
              id="audit-email"
              v-model="form.email"
              type="email"
              placeholder="ion@companie.ro"
              autocomplete="email"
              required
              :aria-invalid="!!fieldErrors.email"
              @blur="validateEmail"
            />
            <p v-if="fieldErrors.email" class="audit__field-error" role="alert">
              {{ fieldErrors.email }}
            </p>
          </div>

          <!-- Row 3: Website + Social (opțional) -->
          <div class="audit__row">
            <div class="audit__field">
              <label for="audit-website">
                Website
                <span class="audit__optional">opțional</span>
              </label>
              <input
                id="audit-website"
                v-model="form.website"
                type="url"
                placeholder="https://companie.ro"
                autocomplete="url"
              />
            </div>
            <div class="audit__field">
              <label for="audit-social">
                Platformă socială
                <span class="audit__optional">opțional</span>
              </label>
              <input
                id="audit-social"
                v-model="form.social"
                type="url"
                placeholder="facebook.com/pagina-ta"
              />
            </div>
          </div>

          <!-- Row 4: Mesaj -->
          <div class="audit__field audit__field--full">
            <label for="audit-message">
              Ce vrei să afli din audit
              <span class="audit__optional">opțional</span>
            </label>
            <textarea
              id="audit-message"
              v-model="form.message"
              rows="4"
              placeholder="Ex: Cheltuim pe Meta Ads dar conversiile nu vin. Vrem să înțelegem de ce."
            />
          </div>

          <!-- Honeypot anti-spam: invizibil pentru oameni -->
          <input
            v-model="form.company_website"
            class="hp-field"
            type="text"
            name="company_website"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
          />

          <!-- GDPR consent -->
          <label class="audit__consent">
            <input v-model="form.consent" type="checkbox" required />
            <span>
              Sunt de acord cu prelucrarea datelor pentru pregătirea auditului
              și contactare, prin instrumentele noastre (email, CRM, măsurare
              publicitară), conform
              <NuxtLink to="/privacy-policy">politicii de confidențialitate</NuxtLink>.
            </span>
          </label>

          <!-- Error -->
          <p v-if="error" class="audit__error" role="alert">{{ error }}</p>

          <!-- Submit -->
          <button
            class="audit__submit"
            type="submit"
            :disabled="!formValid || isSubmitting"
          >
            <span v-if="isSubmitting" class="audit__spinner" aria-hidden="true" />
            {{ isSubmitting ? 'Se trimite…' : 'Trimite cererea' }}
          </button>

          <p class="audit__legal">
            Datele tale sunt folosite pentru audit și pentru a te contacta.
            Nu le vindem și nu trimitem spam.
          </p>
        </form>
      </Transition>

    </div>
  </main>
</template>

<style scoped>
/* ── Layout ──────────────────────────────────────────────────────────────── */
.audit {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
  align-items: start;
  min-height: 100svh;
  padding: clamp(7rem, 10vw, 10rem) clamp(2rem, 6vw, 6rem) clamp(4rem, 6vw, 6rem);
  box-sizing: border-box;
}

/* ── Left ──────────────────────────────────────────────────────────────── */
.audit__left {
  position: sticky;
  top: 6rem;
}

.audit__eyebrow {
  display: block;
  font-family: var(--font-body);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-text-muted);
  margin-bottom: 1.6rem;
}

.audit__title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(2.6rem, 4.5vw, 5rem);
  line-height: 1.0;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  margin: 0 0 1.6rem;
  font-variant-ligatures: no-common-ligatures;
  font-feature-settings: 'liga' 0, 'clig' 0;
}

.audit__sub {
  font-family: var(--font-body);
  font-size: clamp(0.9rem, 1.1vw, 1rem);
  line-height: 1.65;
  color: var(--color-text-muted);
  max-width: 36ch;
  margin: 0 0 2.4rem;
}

.audit__promises {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.audit__promises li {
  font-family: var(--font-body);
  font-size: 0.82rem;
  color: var(--color-text-muted);
  padding-left: 1.1rem;
  position: relative;
}

.audit__promises li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--color-divider);
}

/* ── Form ──────────────────────────────────────────────────────────────── */
.audit__form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.audit__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.audit__field {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.audit__field label {
  font-family: var(--font-body);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.audit__optional {
  font-size: 0.6rem;
  letter-spacing: 0.06em;
  color: var(--color-divider);
  text-transform: none;
}

.audit__field input,
.audit__field textarea {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text-primary);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-divider);
  padding: 0.55rem 0;
  outline: none;
  transition: border-color 0.2s ease;
  width: 100%;
  resize: none;
  line-height: 1.5;
}

.audit__field input::placeholder,
.audit__field textarea::placeholder {
  color: var(--color-text-ghost);
}

.audit__field input:focus,
.audit__field textarea:focus {
  border-color: var(--color-text-primary);
}

/* ── Submit ────────────────────────────────────────────────────────────── */
.audit__submit {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-ui);
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-bg-light, #EDEBE6);
  background: var(--color-text-primary);
  border: none;
  border-radius: 2px;
  padding: 0.85rem 2rem;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.audit__submit:hover:not(:disabled) {
  opacity: 0.84;
}

.audit__submit:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.audit__spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.audit__legal {
  font-family: var(--font-body);
  font-size: 0.65rem;
  color: var(--color-divider);
  line-height: 1.5;
}

/* ── Consent ───────────────────────────────────────────────────────────── */
.audit__consent {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  font-family: var(--font-body);
  font-size: 0.72rem;
  line-height: 1.6;
  color: var(--color-text-muted);
  cursor: pointer;
}

.audit__consent input {
  margin-top: 0.15rem;
  accent-color: var(--color-text-primary);
  cursor: pointer;
}

.audit__consent a {
  color: var(--color-text-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* ── Field errors ──────────────────────────────────────────────────────── */
.audit__field-error {
  font-family: var(--font-body);
  font-size: 0.7rem;
  color: #b03a2e;
  margin: 0.3rem 0 0;
}

.audit__success-steps {
  list-style: none;
  margin: 0.5rem 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.audit__success-steps li {
  font-family: var(--font-body);
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--color-text-muted);
  padding-left: 1.1rem;
  position: relative;
}

.audit__success-steps li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--color-divider);
}

/* ── Error ─────────────────────────────────────────────────────────────── */
.audit__error {
  font-family: var(--font-body);
  font-size: 0.78rem;
  color: #b03a2e;
  line-height: 1.5;
}

/* ── Success ───────────────────────────────────────────────────────────── */
.audit__success {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
}

.audit__success-mark {
  font-size: 1.5rem;
  color: var(--color-text-muted);
}

.audit__success-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.6rem, 2.8vw, 2.6rem);
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  margin: 0;
  font-variant-ligatures: no-common-ligatures;
  font-feature-settings: 'liga' 0, 'clig' 0;
}

.audit__success-body {
  font-family: var(--font-body);
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--color-text-muted);
}

.audit__success-body a {
  color: var(--color-text-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* ── Transition ─────────────────────────────────────────────────────────── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 860px) {
  .audit {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .audit__left {
    position: static;
  }

  .audit__title {
    font-size: clamp(2.2rem, 8vw, 3.2rem);
  }
}

@media (max-width: 480px) {
  .audit__row {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .audit__submit {
    width: 100%;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .audit__spinner {
    animation: none;
    border-top-color: rgba(255,255,255,0.6);
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
