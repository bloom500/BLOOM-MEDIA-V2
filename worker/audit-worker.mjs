/*
 * Audit worker v0.2 — rulează pe VPS, lângă gateway-ul FERAL.
 *
 * Flux: site-ul (Vercel) POST-ează lead-ul aici cu un shared secret →
 * răspundem 202 imediat → chemăm FERAL /runtime/chat (non-stream) care
 * citește site-ul lead-ului cu read_webpage → trimitem raportul pe mail
 * AGENȚIEI prin Resend (human-in-the-loop: nimic nu pleacă direct la lead).
 *
 * În plus față de v0.1: limite anti-abuz (per email, per domeniu,
 * concurență, timeout de job, cap pe output), statistici pe /health și
 * artefacte per job în ./jobs/<sessionId>.json (lead + raport + status
 * email) pentru debugging ulterior.
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
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { timingSafeEqual, randomUUID } from 'node:crypto'

const PORT          = Number(process.env.PORT || 8787)
const SECRET        = process.env.AUDIT_WORKER_SECRET || ''
const FERAL_URL     = (process.env.FERAL_GATEWAY_URL || 'http://127.0.0.1:11435').replace(/\/$/, '')
const TOKEN_FILE    = process.env.FERAL_TOKEN_FILE || join(homedir(), '.feral', 'api-token')
const RESEND_KEY    = process.env.RESEND_API_KEY || ''
const AGENCY_EMAIL  = process.env.AGENCY_EMAIL || 'bloommediacorporation@gmail.com'
const FROM_EMAIL    = process.env.FROM_EMAIL || 'Bloom Media <contact@bloommedia.ro>'
const JOBS_DIR      = join(dirname(fileURLToPath(import.meta.url)), 'jobs')

// ── Limite anti-abuz ─────────────────────────────────────────────────────────
const MAX_CONCURRENT   = 2            // audituri FERAL simultane
const MAX_QUEUE        = 10           // joburi în așteptare peste cele active
const PER_KEY_WINDOW   = 24 * 3600e3  // fereastra limitelor per email/domeniu
const MAX_PER_EMAIL    = 3            // audituri / email / 24h
const MAX_PER_DOMAIN   = 3            // audituri / domeniu / 24h
const JOB_TIMEOUT_MS   = 5 * 60e3     // cap dur pe un audit (FERAL inclus)
const MAX_REPORT_CHARS = 20_000       // cap pe output înainte de email/artefact

if (!SECRET) { console.error('[audit-worker] AUDIT_WORKER_SECRET missing'); process.exit(1) }
if (!RESEND_KEY) console.warn('[audit-worker] RESEND_API_KEY missing — reports will only be logged')
mkdirSync(JOBS_DIR, { recursive: true })

// ── Statistici (în memorie; se resetează la restart — suficient pt v1) ──────
const stats = {
  startedAt: new Date().toISOString(),
  accepted: 0, rejected: 0, running: 0, queued: 0,
  done: 0, failed: 0,
  durationsMs: [],           // ultimele 50
  lastError: null,           // { at, sessionId, message }
  lastJob: null,             // { sessionId, target, status, ms }
}

// ponytail: Map în memorie pentru limite, ca în lead-guard — un restart le
// golește; Redis abia dacă spam-ul devine real.
const hits = new Map() // key → timestamps[]
function overLimit(key, max) {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < PER_KEY_WINDOW)
  if (recent.length >= max) { hits.set(key, recent); return true }
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 5000) {
    for (const [k, ts] of hits) if (ts.every((t) => now - t >= PER_KEY_WINDOW)) hits.delete(k)
  }
  return false
}

function domainOf(url) {
  try { return new URL(String(url).startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '') }
  catch { return String(url).toLowerCase().slice(0, 100) }
}

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
    '- Dacă un URL nu poate fi citit, redirecționează, are certificat invalid sau e prea lent, spune explicit asta. NU inventa constatări.',
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

async function callFeral(content, sessionId, signal) {
  const body = JSON.stringify({ content, session_id: sessionId, stream: false })
  const doFetch = () => fetch(`${FERAL_URL}/runtime/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${feralToken()}`,
    },
    body,
    signal,
  })
  let res = await doFetch()
  // CHAT_IDLE_TIMEOUT poate da 504 pe site-uri lente — un singur retry.
  if (res.status === 504) res = await doFetch()
  if (!res.ok) throw new Error(`FERAL ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const json = await res.json()
  return String(json.content ?? '').slice(0, MAX_REPORT_CHARS)
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

  if (!RESEND_KEY) { console.log('[audit-worker] report (no Resend key):\n', report); return 'logged' }
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
  if (!res.ok) {
    console.error('[audit-worker] resend error:', res.status, await res.text())
    return `resend-error-${res.status}`
  }
  return 'sent'
}

function saveArtifact(sessionId, artifact) {
  try {
    writeFileSync(join(JOBS_DIR, `${sessionId}.json`), JSON.stringify(artifact, null, 2))
  } catch (err) {
    console.error('[audit-worker] artifact write failed:', err)
  }
}

// ── Coadă cu concurență limitată ─────────────────────────────────────────────
const queue = []
let active = 0

function enqueue(lead) {
  queue.push(lead)
  stats.queued = queue.length
  drain()
}

function drain() {
  while (active < MAX_CONCURRENT && queue.length) {
    const lead = queue.shift()
    stats.queued = queue.length
    active++
    stats.running = active
    runAudit(lead).finally(() => {
      active--
      stats.running = active
      drain()
    })
  }
}

async function runAudit(lead) {
  const sessionId = `audit-${lead.leadId || randomUUID()}`
  const target = lead.website || lead.social
  const t0 = Date.now()
  const artifact = {
    sessionId, lead, target,
    startedAt: new Date().toISOString(),
    status: 'running', report: null, emailStatus: null, error: null, durationMs: null,
  }
  console.log(`[audit-worker] start ${sessionId} → ${target}`)
  try {
    const report = await callFeral(buildPrompt(lead), sessionId, AbortSignal.timeout(JOB_TIMEOUT_MS))
    artifact.report = report
    artifact.emailStatus = await emailReport(lead, report, false)
    artifact.status = 'done'
    stats.done++
    console.log(`[audit-worker] done ${sessionId} in ${Date.now() - t0}ms`)
  } catch (err) {
    const message = String(err?.message || err)
    artifact.status = 'failed'
    artifact.error = message
    stats.failed++
    stats.lastError = { at: new Date().toISOString(), sessionId, message }
    console.error(`[audit-worker] failed ${sessionId}:`, message)
    artifact.emailStatus = await emailReport(lead, `Auditul automat a eșuat: ${message}`, true).catch(() => 'email-failed')
  } finally {
    artifact.durationMs = Date.now() - t0
    stats.durationsMs.push(artifact.durationMs)
    if (stats.durationsMs.length > 50) stats.durationsMs.shift()
    stats.lastJob = { sessionId, target, status: artifact.status, ms: artifact.durationMs }
    saveArtifact(sessionId, artifact)
  }
}

// ── HTTP ─────────────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    const d = stats.durationsMs
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({
      ok: true,
      ...stats,
      durationsMs: undefined,
      avgDurationMs: d.length ? Math.round(d.reduce((a, b) => a + b, 0) / d.length) : null,
    }))
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

    // Limite anti-abuz. 429 doar informativ — site-ul oricum nu-l arată
    // lead-ului; pur și simplu nu mai consumăm tokens pe duplicate.
    const email = String(lead.email).toLowerCase().trim()
    const domain = domainOf(lead.website || lead.social)
    if (overLimit(`e:${email}`, MAX_PER_EMAIL) || overLimit(`d:${domain}`, MAX_PER_DOMAIN)) {
      stats.rejected++
      console.warn(`[audit-worker] rate-limited ${email} / ${domain}`)
      res.writeHead(429); return res.end()
    }
    if (queue.length >= MAX_QUEUE) {
      stats.rejected++
      console.warn('[audit-worker] queue full, dropping job')
      res.writeHead(503); return res.end()
    }

    stats.accepted++
    res.writeHead(202, { 'Content-Type': 'application/json' })
    res.end('{"accepted":true}')
    enqueue(lead)
  })
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[audit-worker] v0.2 listening on 127.0.0.1:${PORT}, gateway ${FERAL_URL}`)
})
