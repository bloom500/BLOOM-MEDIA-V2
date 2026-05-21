import { defineEventHandler, readBody, createError } from 'h3'
import { sendMetaLeadEvent } from '../utils/meta-capi'
import { createHubSpotContact } from '../utils/hubspot'
import { insertLead } from '../utils/supabase'

const AGENCY_EMAIL = 'bloommediacorporation@gmail.com'
const FROM_EMAIL   = 'Bloom Media <contact@bloommedia.ro>'

interface AuditBody {
  name: string
  email: string
  phone: string
  website?: string | null
  social?: string | null
  message?: string | null
}

export default defineEventHandler(async (event) => {
  const body = await readBody<AuditBody>(event)

  const name  = body?.name?.trim()  ?? ''
  const email = body?.email?.trim() ?? ''
  const phone = body?.phone?.trim() ?? ''

  if (!name || !email || !phone) {
    throw createError({ statusCode: 400, message: 'Câmpurile obligatorii lipsesc.' })
  }

  await Promise.allSettled([
    // ── Resend: agency notification ──────────────────────────────────────
    sendEmail({
      to:      AGENCY_EMAIL,
      subject: `[Audit] Cerere nouă de la ${name}`,
      html:    buildAgencyEmail({ name, email, phone, website: body.website, social: body.social, message: body.message }),
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
      website: body.website,
      source:  'audit-page',
    }),

    // ── Meta CAPI: Lead event ────────────────────────────────────────────
    sendMetaLeadEvent({
      name,
      email,
      phone,
      sourceUrl: 'https://bloommedia.ro/audit',
    }),

    // ── Supabase: persist lead ───────────────────────────────────────────
    insertLead({
      source:  'audit',
      name,
      email,
      phone,
      website: body.website || null,
      social:  body.social  || null,
      message: body.message || null,
    }),
  ])

  return { ok: true }
})

// ── Resend ──────────────────────────────────────────────────────────────────
async function sendEmail(mail: { to: string; subject: string; html: string }) {
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

// ── Email templates ──────────────────────────────────────────────────────────
function buildAgencyEmail(d: {
  name: string; email: string; phone: string
  website?: string | null; social?: string | null; message?: string | null
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
    `<tr><td style="padding:6px 12px;color:#9A9590;width:100px">${k}</td><td style="padding:6px 12px;color:#1A1814">${v}</td></tr>`
  ).join('')
  return `<div style="font-family:sans-serif;max-width:520px">
    <h2 style="color:#1A1814;margin-bottom:16px">Cerere audit gratuit</h2>
    <table style="border-collapse:collapse;width:100%;background:#f7f5f2;border-radius:6px">${trs}</table>
    <p style="color:#9A9590;font-size:12px;margin-top:24px">Bloom Media · bloommedia.ro</p>
  </div>`
}

function buildClientEmail(name: string) {
  const firstName = name.split(' ')[0]
  return `<div style="font-family:sans-serif;max-width:520px">
    <h2 style="color:#1A1814">Salut, ${firstName}!</h2>
    <p style="color:#1A1814;line-height:1.7">Am primit cererea ta de audit și o să te contactăm în maxim <strong>24 de ore</strong> cu o analiză inițială.</p>
    <p style="color:#1A1814;line-height:1.7">Până atunci, dacă ai orice întrebare ne poți scrie la <a href="mailto:hello@bloommedia.ro" style="color:#1A1814">hello@bloommedia.ro</a> sau suna la <a href="tel:+40763281168" style="color:#1A1814">0763 281 168</a>.</p>
    <p style="color:#9A9590;font-size:12px;margin-top:32px">Bloom Media · Cluj-Napoca · bloommedia.ro</p>
  </div>`
}
