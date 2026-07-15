/*
 * Audit worker — rulează pe VPS, lângă gateway-ul FERAL.
 *
 * Flux: site-ul (Vercel) POST-ează lead-ul aici cu un shared secret →
 * răspundem 202 imediat → chemăm FERAL /runtime/chat (non-stream) care
 * citește site-ul lead-ului cu read_webpage → trimitem raportul pe mail
 * AGENȚIEI prin Resend (human-in-the-loop: nimic nu pleacă direct la lead).
 *
 * Zero dependențe npm — doar node:http + fetch. Node >= 18.
 *
 * Env obligatoriu:
 *   AUDIT_WORKER_SECRET  — același ca în Vercel
 *   RESEND_API_KEY       — pentru emailul cu raportul
 * Env opțional:
 *   PORT                 — default 8787 (doar loopback; Caddy face TLS)
 *   FERAL_GATEWAY_URL    — default http://127.0.0.1:11435
 *   FERAL_TOKEN_FILE     — default ~/.feral/api-token
 *   AGENCY_EMAIL         — default bloommediacorporation@gmail.com
 *   FROM_EMAIL           — default Bloom Media <contact@bloommedia.ro>
 */
import http from 'node:http'
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { timingSafeEqual, randomUUID } from 'node:crypto'

const PORT          = Number(process.env.PORT || 8787)
const SECRET        = process.env.AUDIT_WORKER_SECRET || ''
const FERAL_URL     = (process.env.FERAL_GATEWAY_URL || 'http://127.0.0.1:11435').replace(/\/$/, '')
const TOKEN_FILE    = process.env.FERAL_TOKEN_FILE || join(homedir(), '.feral', 'api-token')
const RESEND_KEY    = process.env.RESEND_API_KEY || ''
const AGENCY_EMAIL  = process.env.AGENCY_EMAIL || 'bloommediacorporation@gmail.com'
const FROM_EMAIL    = process.env.FROM_EMAIL || 'Bloom Media <contact@bloommedia.ro>'

if (!SECRET) { console.error('[audit-worker] AUDIT_WORKER_SECRET missing'); process.exit(1) }
if (!RESEND_KEY) console.warn('[audit-worker] RESEND_API_KEY missing — reports will only be logged')

function feralToken() {
  return readFileSync(TOKEN_FILE, 'utf8').trim()
}

function secretOk(header) {
  const a = Buffer.from(String(header || ''))
  const b = Buffer.from(SECRET)
  return a.length === b.length && timingSafeEqual(a, b)
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function buildPrompt(lead) {
  const target = lead.website || lead.social
  return [
    'Ești analistul unei agenții de marketing. Fă un audit preliminar pentru lead-ul de mai jos.',
    '',
    `Site/pagină de analizat: ${target}`,
    lead.social && lead.website ? `Profil social secundar: ${lead.social}` : '',
    lead.message ? `Ce vrea lead-ul să afle: ${lead.message}` : '',
    '',
    'REGULI STRICTE:',
    '- Folosește DOAR read_webpage pe URL-urile date mai sus. NU folosi web_search.',
    '- Dacă un URL nu poate fi citit, spune explicit asta. NU inventa constatări.',
    '- Răspunde în română, maxim 600 de cuvinte.',
    '',
    'STRUCTURA RAPORTULUI (exact aceste secțiuni):',
    '1. PRIMA IMPRESIE — ce comunică pagina în primele 5 secunde',
    '2. PROPUNERE DE VALOARE — clară sau nu, ce lipsește',
    '3. CONVERSIE — CTA-uri, formulare, fricțiuni evidente',
    '4. ÎNCREDERE — dovezi sociale, date de contact, elemente legale',
    '5. TOP 3 ACȚIUNI — cele mai importante corecturi, concrete',
  ].filter(Boolean).join('\n')
}

async function callFeral(content, sessionId) {
  const body = JSON.stringify({ content, session_id: sessionId, stream: false })
  const doFetch = () => fetch(`${FERAL_URL}/runtime/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${feralToken()}`,
    },
    body,
  })
  let res = await doFetch()
  // CHAT_IDLE_TIMEOUT poate da 504 pe site-uri lente — un singur retry.
  if (res.status === 504) res = await doFetch()
  if (!res.ok) throw new Error(`FERAL ${res.status}: ${await res.text()}`)
  const json = await res.json()
  return json.content
}

async function emailReport(lead, report, failed) {
  const rows = [
    ['Nume', lead.name], ['Email', lead.email], ['Telefon', lead.phone],
    ['Website', lead.website || '—'], ['Social', lead.social || '—'],
    ['Mesaj', lead.message || '—'],
  ].map(([k, v]) =>
    `<tr><td style="padding:4px 10px;color:#9A9590">${k}</td><td style="padding:4px 10px">${esc(v)}</td></tr>`
  ).join('')

  const html = `<div style="font-family:sans-serif;max-width:640px">
    <h2>${failed ? '⚠️ Audit FERAL eșuat' : 'Raport preliminar FERAL'} — ${esc(lead.name)}</h2>
    <table style="border-collapse:collapse;background:#f7f5f2;border-radius:6px">${rows}</table>
    <pre style="white-space:pre-wrap;font-family:inherit;line-height:1.6;margin-top:20px">${esc(report)}</pre>
    <p style="color:#9A9590;font-size:12px">Generat automat. Verifică înainte să trimiți ceva lead-ului.</p>
  </div>`

  if (!RESEND_KEY) { console.log('[audit-worker] report (no Resend key):\n', report); return }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: AGENCY_EMAIL,
      subject: `${failed ? '[Audit FERAL — EȘUAT]' : '[Audit FERAL]'} ${lead.name}`,
      html,
    }),
  })
  if (!res.ok) console.error('[audit-worker] resend error:', res.status, await res.text())
}

async function runAudit(lead) {
  const sessionId = `audit-${lead.leadId || randomUUID()}`
  console.log(`[audit-worker] start ${sessionId} → ${lead.website || lead.social}`)
  try {
    const report = await callFeral(buildPrompt(lead), sessionId)
    await emailReport(lead, report, false)
    console.log(`[audit-worker] done ${sessionId}`)
  } catch (err) {
    console.error(`[audit-worker] failed ${sessionId}:`, err)
    await emailReport(lead, `Auditul automat a eșuat: ${err?.message || err}`, true).catch(() => {})
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end('{"ok":true}')
  }
  if (req.method !== 'POST' || req.url !== '/audit') {
    res.writeHead(404); return res.end()
  }
  if (!secretOk(req.headers['x-audit-secret'])) {
    res.writeHead(401); return res.end()
  }

  let body = ''
  req.on('data', (c) => {
    body += c
    if (body.length > 32_768) req.destroy()
  })
  req.on('end', () => {
    let lead
    try { lead = JSON.parse(body) } catch { res.writeHead(400); return res.end() }
    if (!lead?.name || !lead?.email || !(lead.website || lead.social)) {
      // Fără site și fără social nu avem ce audita — confirmăm dar nu rulăm.
      res.writeHead(204); return res.end()
    }
    res.writeHead(202, { 'Content-Type': 'application/json' })
    res.end('{"accepted":true}')
    // Fire-and-forget: 202 a plecat, auditul rulează în fundal.
    runAudit(lead)
  })
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[audit-worker] listening on 127.0.0.1:${PORT}, gateway ${FERAL_URL}`)
})
