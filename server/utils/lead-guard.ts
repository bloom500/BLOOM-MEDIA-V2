import { createError, getRequestIP, getRequestHeader, type H3Event } from 'h3'

const FROM_EMAIL = 'Bloom Media <contact@bloommedia.ro>'

// Origin-uri din care acceptăm POST-uri de formular. Absența headerului e
// permisă (curl/monitoare); un Origin străin prezent = spam cross-site → 403.
const ALLOWED_ORIGINS = [
  /^https:\/\/(www\.)?bloommedia\.ro$/,
  /^https?:\/\/localhost(:\d+)?$/,
  /^https:\/\/[\w-]+\.vercel\.app$/,
]

/** Aruncă 403 dacă cererea vine dintr-un Origin care nu e al nostru. */
export function checkOrigin(event: H3Event) {
  const origin = getRequestHeader(event, 'origin')
  if (origin && !ALLOWED_ORIGINS.some(re => re.test(origin))) {
    throw createError({ statusCode: 403, message: 'Origin refuzat.' })
  }
}

/**
 * Honeypot: câmpul `company_website` e invizibil pentru oameni (CSS), deci
 * orice valoare în el = bot. Rutele răspund cu succes fals ca să nu dea
 * indicii botului.
 */
export function isSpam(body: unknown): boolean {
  const hp = (body as Record<string, unknown> | null)?.company_website
  return typeof hp === 'string' && hp.trim().length > 0
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^[+()\d][\d\s.\-()]{6,}$/

const WINDOW_MS   = 10 * 60 * 1000
const MAX_PER_IP  = 5

// ponytail: in-process Map — pe Vercel e per-instanță, deci un atacator
// distribuit poate trece de el. Oprește spamul trivial, care e cazul real.
// Dacă devine insuficient: Upstash/Redis sau rate limiting la marginea Vercel.
const hits = new Map<string, number[]>()

/** Aruncă 429 dacă IP-ul a trimis deja prea multe cereri în fereastră. */
export function rateLimit(event: H3Event) {
  const ip  = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const now = Date.now()

  const recent = (hits.get(ip) ?? []).filter(t => now - t < WINDOW_MS)
  if (recent.length >= MAX_PER_IP) {
    throw createError({ statusCode: 429, message: 'Prea multe cereri. Încearcă din nou peste câteva minute.' })
  }

  recent.push(now)
  hits.set(ip, recent)

  // Curăță IP-urile expirate ca Map-ul să nu crească la nesfârșit.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every(t => now - t >= WINDOW_MS)) hits.delete(key)
    }
  }
}

/**
 * Normalizează un câmp de formular: string, fără spații la capete, lungime plafonată.
 * NU scapă HTML — valorile pleacă crude spre Supabase/HubSpot; escaparea se face
 * la construirea emailului, cu escapeHtml().
 */
export function clean(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLen)
}

/** Obligatoriu pe orice valoare din formular interpolată în HTML-ul unui email. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Contactul obligatoriu, validat. Aruncă 400 dacă emailul sau telefonul e aiurea. */
export function requireContact(email: string, phone: string) {
  if (!EMAIL_RE.test(email)) {
    throw createError({ statusCode: 400, message: 'Adresa de email nu este validă.' })
  }
  if (!PHONE_RE.test(phone)) {
    throw createError({ statusCode: 400, message: 'Numărul de telefon nu este valid.' })
  }
}

export async function sendEmail(mail: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[resend] RESEND_API_KEY not set — skipping')
    return
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from: FROM_EMAIL, ...mail }),
  })
  if (!res.ok) console.error('[resend] Error:', res.status, await res.text())
}
