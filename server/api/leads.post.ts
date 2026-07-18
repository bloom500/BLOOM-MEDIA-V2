import { randomUUID } from 'node:crypto'
import { defineEventHandler, readBody, createError, getRequestIP, getRequestHeader, getCookie } from 'h3'
import { sendMetaLeadEvent } from '../utils/meta-capi'
import { createHubSpotContact } from '../utils/hubspot'
import { insertLead } from '../utils/supabase'
import { rateLimit, checkOrigin, isSpam, clean, escapeHtml, requireContact, sendEmail } from '../utils/lead-guard'

const AGENCY_EMAIL = 'bloommediacorporation@gmail.com'

export default defineEventHandler(async (event) => {
  checkOrigin(event)
  rateLimit(event)

  const body = await readBody(event)

  // Honeypot: bot → succes fals, zero procesare.
  if (isSpam(body)) return { ok: true }

  const businessName = clean(body?.businessName, 160)
  const yourName     = clean(body?.yourName,     120)
  const email        = clean(body?.email,        254)
  const phone        = clean(body?.phone,         40)
  const objectives   = clean(body?.objectives,  4000)
  const eventId      = clean(body?.eventId,       64)

  const selectedServices = Array.isArray(body?.selectedServices)
    ? body.selectedServices.slice(0, 30).map((s: unknown) => clean(s, 80)).filter(Boolean)
    : []

  const monthlyTotal = Number.isFinite(Number(body?.monthlyTotal)) ? Number(body.monthlyTotal) : 0
  const oneTimeTotal = Number.isFinite(Number(body?.oneTimeTotal)) ? Number(body.oneTimeTotal) : 0

  if (!businessName || !yourName || !email || !phone) {
    throw createError({ statusCode: 400, message: 'Câmpurile obligatorii lipsesc.' })
  }
  if (body?.consent !== true) {
    throw createError({ statusCode: 400, message: 'Lipsește acordul pentru prelucrarea datelor.' })
  }
  requireContact(email, phone)

  // Supabase primul — sursa de adevăr; vezi audit.post.ts pentru raționament.
  const persisted = await insertLead({
    source:            'configurator',
    lead_id:           randomUUID(),
    name:              yourName,
    email,
    phone,
    message:           objectives || null,
    selected_services: selectedServices,
    monthly_total:     monthlyTotal,
    one_time_total:    oneTimeTotal,
  })
  if (persisted === 'failed') {
    throw createError({ statusCode: 500, message: 'Nu am putut înregistra cererea. Încearcă din nou sau scrie la contact@bloommedia.ro.' })
  }

  await Promise.allSettled([
    // ── Resend: agency notification ──────────────────────────────────────
    sendEmail({
      to:      AGENCY_EMAIL,
      subject: `[Configurator] Cerere nouă de la ${yourName} · ${businessName}`,
      html:    buildAgencyEmail({ businessName, yourName, email, phone, objectives, selectedServices, monthlyTotal, oneTimeTotal }),
    }),

    // ── Resend: client confirmation ──────────────────────────────────────
    sendEmail({
      to:      email,
      subject: 'Am primit brieful tău · Bloom Media',
      html:    buildClientEmail(yourName),
    }),

    // ── HubSpot: create contact ──────────────────────────────────────────
    createHubSpotContact({
      name:   yourName,
      email,
      phone,
      source: 'configurator',
    }),

    // ── Meta CAPI: Lead event (dedup cu Pixel prin eventId comun) ───────
    sendMetaLeadEvent({
      name:      yourName,
      email,
      phone,
      sourceUrl: 'https://www.bloommedia.ro/servicii',
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
  businessName: string; yourName: string; email: string; phone: string
  objectives: string; selectedServices: string[]; monthlyTotal: number; oneTimeTotal: number
}) {
  const services = d.selectedServices.length ? d.selectedServices.join(', ') : '-'
  const rows = [
    ['Firmă',          d.businessName],
    ['Nume',           d.yourName],
    ['Email',          d.email],
    ['Telefon',        d.phone],
    ['Servicii',       services],
    ['Total/lună',     d.monthlyTotal ? `€${d.monthlyTotal}` : '-'],
    ['Setup one-time', d.oneTimeTotal ? `€${d.oneTimeTotal}` : '-'],
    ['Obiective',      d.objectives || '-'],
  ]
  const trs = rows.map(([k, v]) =>
    `<tr><td style="padding:6px 12px;color:#9A9590;width:110px">${k}</td><td style="padding:6px 12px;color:#1A1814">${escapeHtml(String(v))}</td></tr>`
  ).join('')
  return `<div style="font-family:sans-serif;max-width:520px">
    <h2 style="color:#1A1814;margin-bottom:16px">Cerere configurator servicii</h2>
    <table style="border-collapse:collapse;width:100%;background:#f7f5f2;border-radius:6px">${trs}</table>
    <p style="color:#9A9590;font-size:12px;margin-top:24px">Bloom Media · bloommedia.ro</p>
  </div>`
}

function buildClientEmail(name: string) {
  const firstName = escapeHtml(name.split(' ')[0])
  return `<div style="font-family:sans-serif;max-width:520px">
    <h2 style="color:#1A1814">Salut, ${firstName}!</h2>
    <p style="color:#1A1814;line-height:1.7">Am primit brieful tău și o să te contactăm în maxim <strong>24 de ore</strong> cu o propunere personalizată.</p>
    <p style="color:#1A1814;line-height:1.7">Până atunci, dacă ai orice întrebare ne poți scrie la <a href="mailto:contact@bloommedia.ro" style="color:#1A1814">contact@bloommedia.ro</a> sau suna la <a href="tel:+40763281168" style="color:#1A1814">0763 281 168</a>.</p>
    <p style="color:#9A9590;font-size:12px;margin-top:32px">Bloom Media · Cluj-Napoca · bloommedia.ro</p>
  </div>`
}
