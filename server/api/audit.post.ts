import { randomUUID } from 'node:crypto'
import { defineEventHandler, readBody, createError, getRequestIP, getRequestHeader, getCookie } from 'h3'
import { sendMetaLeadEvent } from '../utils/meta-capi'
import { createHubSpotContact } from '../utils/hubspot'
import { insertLead } from '../utils/supabase'
import { rateLimit, checkOrigin, isSpam, clean, escapeHtml, requireContact, sendEmail } from '../utils/lead-guard'

const AGENCY_EMAIL = 'bloommediacorporation@gmail.com'

/**
 * Anunță audit-worker-ul de pe VPS (bridge spre FERAL). Worker-ul răspunde
 * 202 imediat și rulează auditul în fundal, deci apelul e ieftin. Fără
 * env-uri setate e un no-op — hook-ul poate sta în cod înainte ca worker-ul
 * să existe în producție.
 */
async function notifyAuditWorker(lead: {
  leadId: string; name: string; email: string; phone: string
  website: string; social: string; message: string
}) {
  const url = process.env.AUDIT_WORKER_URL
  const secret = process.env.AUDIT_WORKER_SECRET
  if (!url || !secret) return
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-audit-secret': secret },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok && res.status !== 204) {
      console.error('[audit-worker] notify failed:', res.status)
    }
  } catch (err) {
    console.error('[audit-worker] notify error:', err)
  }
}

export default defineEventHandler(async (event) => {
  checkOrigin(event)
  rateLimit(event)

  const body = await readBody(event)

  // Honeypot: bot → succes fals, zero procesare.
  if (isSpam(body)) return { ok: true }

  const name    = clean(body?.name,    120)
  const email   = clean(body?.email,   254)
  const phone   = clean(body?.phone,    40)
  const website = clean(body?.website, 300)
  const social  = clean(body?.social,  300)
  const message = clean(body?.message, 4000)
  const eventId = clean(body?.eventId,  64)

  if (!name || !email || !phone) {
    throw createError({ statusCode: 400, message: 'Câmpurile obligatorii lipsesc.' })
  }
  if (body?.consent !== true) {
    throw createError({ statusCode: 400, message: 'Lipsește acordul pentru prelucrarea datelor.' })
  }
  requireContact(email, phone)

  const leadId = randomUUID()

  // Supabase e sursa de adevăr: dacă persist-ul eșuează, utilizatorul NU
  // primește ecran de succes — restul integrărilor sunt best-effort.
  const persisted = await insertLead({
    source:  'audit',
    lead_id: leadId,
    name,
    email,
    phone,
    website: website || null,
    social:  social  || null,
    message: message || null,
  })
  if (persisted === 'failed') {
    throw createError({ statusCode: 500, message: 'Nu am putut înregistra cererea. Încearcă din nou sau scrie la hello@bloommedia.ro.' })
  }

  await Promise.allSettled([
    // ── VPS audit worker: FERAL preliminary report (202 = handshake) ─────
    notifyAuditWorker({ leadId, name, email, phone, website, social, message }),

    // ── Resend: agency notification ──────────────────────────────────────
    sendEmail({
      to:      AGENCY_EMAIL,
      subject: `[Audit] Cerere nouă de la ${name}`,
      html:    buildAgencyEmail({ name, email, phone, website, social, message }),
    }),

    // ── Resend: client confirmation ──────────────────────────────────────
    sendEmail({
      to:      email,
      subject: 'Am primit cererea ta de audit — Bloom Media',
      html:    buildClientEmail(name),
    }),

    // ── HubSpot: create contact ──────────────────────────────────────────
    createHubSpotContact({
      name,
      email,
      phone,
      website: website || null,
      source:  'audit-page',
    }),

    // ── Meta CAPI: Lead event (dedup cu Pixel prin eventId comun) ───────
    sendMetaLeadEvent({
      name,
      email,
      phone,
      sourceUrl: 'https://www.bloommedia.ro/audit',
      eventId:   eventId || undefined,
      clientIp:  getRequestIP(event, { xForwardedFor: true }),
      userAgent: getRequestHeader(event, 'user-agent'),
      fbp:       getCookie(event, '_fbp'),
      fbc:       getCookie(event, '_fbc'),
    }),
  ])

  return { ok: true }
})

// ── Email templates ──────────────────────────────────────────────────────────
function buildAgencyEmail(d: {
  name: string; email: string; phone: string
  website: string; social: string; message: string
}) {
  const rows = [
    ['Nume',    d.name],
    ['Email',   d.email],
    ['Telefon', d.phone],
    ['Website', d.website || '—'],
    ['Social',  d.social  || '—'],
    ['Mesaj',   d.message || '—'],
  ]
  const trs = rows.map(([k, v]) =>
    `<tr><td style="padding:6px 12px;color:#9A9590;width:100px">${k}</td><td style="padding:6px 12px;color:#1A1814">${escapeHtml(v)}</td></tr>`
  ).join('')
  return `<div style="font-family:sans-serif;max-width:520px">
    <h2 style="color:#1A1814;margin-bottom:16px">Cerere audit gratuit</h2>
    <table style="border-collapse:collapse;width:100%;background:#f7f5f2;border-radius:6px">${trs}</table>
    <p style="color:#9A9590;font-size:12px;margin-top:24px">Bloom Media · bloommedia.ro</p>
  </div>`
}

function buildClientEmail(name: string) {
  const firstName = escapeHtml(name.split(' ')[0])
  return `<div style="font-family:sans-serif;max-width:520px">
    <h2 style="color:#1A1814">Salut, ${firstName}!</h2>
    <p style="color:#1A1814;line-height:1.7">Am primit cererea ta de audit și o să te contactăm în maxim <strong>24 de ore</strong> cu o analiză inițială.</p>
    <p style="color:#1A1814;line-height:1.7">Până atunci, dacă ai orice întrebare ne poți scrie la <a href="mailto:hello@bloommedia.ro" style="color:#1A1814">hello@bloommedia.ro</a> sau suna la <a href="tel:+40763281168" style="color:#1A1814">0763 281 168</a>.</p>
    <p style="color:#9A9590;font-size:12px;margin-top:32px">Bloom Media · Cluj-Napoca · bloommedia.ro</p>
  </div>`
}
