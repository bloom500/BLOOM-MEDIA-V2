import { defineEventHandler, readBody, createError } from 'h3'
import { sendMetaLeadEvent } from '../utils/meta-capi'
import { createHubSpotContact } from '../utils/hubspot'
import { insertLead } from '../utils/supabase'

const AGENCY_EMAIL = 'bloommediacorporation@gmail.com'
const FROM_EMAIL   = 'Bloom Media <contact@bloommedia.ro>'

interface LeadsBody {
  businessName: string
  yourName: string
  email: string
  phone: string
  objectives?: string | null
  selectedServices?: string[]
  monthlyTotal?: number
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LeadsBody>(event)

  const businessName = body?.businessName?.trim() ?? ''
  const yourName     = body?.yourName?.trim()     ?? ''
  const email        = body?.email?.trim()        ?? ''
  const phone        = body?.phone?.trim()        ?? ''

  if (!businessName || !yourName || !email || !phone) {
    throw createError({ statusCode: 400, message: 'Câmpurile obligatorii lipsesc.' })
  }

  await Promise.allSettled([
    // ── Resend: agency notification ──────────────────────────────────────
    sendEmail({
      to:      AGENCY_EMAIL,
      subject: `[Configurator] Cerere nouă de la ${yourName} — ${businessName}`,
      html:    buildAgencyEmail({ businessName, yourName, email, phone, objectives: body.objectives, selectedServices: body.selectedServices, monthlyTotal: body.monthlyTotal }),
    }),

    // ── Resend: client confirmation ──────────────────────────────────────
    sendEmail({
      to:      email,
      subject: 'Am primit brieful tău — Bloom Media',
      html:    buildClientEmail(yourName),
    }),

    // ── HubSpot: create contact ──────────────────────────────────────────
    createHubSpotContact({
      name:   yourName,
      email,
      phone,
      source: 'configurator',
    }),

    // ── Meta CAPI: Lead event ────────────────────────────────────────────
    sendMetaLeadEvent({
      name:      yourName,
      email,
      phone,
      sourceUrl: 'https://bloommedia.ro/servicii',
    }),

    // ── Supabase: persist lead ───────────────────────────────────────────
    insertLead({
      source:           'configurator',
      name:             yourName,
      email,
      phone,
      message:          body.objectives || null,
      selected_services: body.selectedServices ?? [],
      monthly_total:    body.monthlyTotal ?? 0,
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
  businessName: string; yourName: string; email: string; phone: string
  objectives?: string | null; selectedServices?: string[]; monthlyTotal?: number
}) {
  const services = d.selectedServices?.length ? d.selectedServices.join(', ') : '—'
  const rows = [
    ['Firmă',      d.businessName],
    ['Nume',       d.yourName],
    ['Email',      d.email],
    ['Telefon',    d.phone],
    ['Servicii',   services],
    ['Total/lună', d.monthlyTotal ? `€${d.monthlyTotal}` : '—'],
    ['Obiective',  d.objectives || '—'],
  ]
  const trs = rows.map(([k, v]) =>
    `<tr><td style="padding:6px 12px;color:#9A9590;width:110px">${k}</td><td style="padding:6px 12px;color:#1A1814">${v}</td></tr>`
  ).join('')
  return `<div style="font-family:sans-serif;max-width:520px">
    <h2 style="color:#1A1814;margin-bottom:16px">Cerere configurator servicii</h2>
    <table style="border-collapse:collapse;width:100%;background:#f7f5f2;border-radius:6px">${trs}</table>
    <p style="color:#9A9590;font-size:12px;margin-top:24px">Bloom Media · bloommedia.ro</p>
  </div>`
}

function buildClientEmail(name: string) {
  const firstName = name.split(' ')[0]
  return `<div style="font-family:sans-serif;max-width:520px">
    <h2 style="color:#1A1814">Salut, ${firstName}!</h2>
    <p style="color:#1A1814;line-height:1.7">Am primit brieful tău și o să te contactăm în maxim <strong>24 de ore</strong> cu o propunere personalizată.</p>
    <p style="color:#1A1814;line-height:1.7">Până atunci, dacă ai orice întrebare ne poți scrie la <a href="mailto:hello@bloommedia.ro" style="color:#1A1814">hello@bloommedia.ro</a> sau suna la <a href="tel:+40763281168" style="color:#1A1814">0763 281 168</a>.</p>
    <p style="color:#9A9590;font-size:12px;margin-top:32px">Bloom Media · Cluj-Napoca · bloommedia.ro</p>
  </div>`
}
