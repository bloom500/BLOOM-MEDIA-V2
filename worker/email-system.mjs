/*
 * Bloom Media — Email Design System v1
 *
 * Renderer determinist: primește JSON structurat (niciodată HTML/Markdown de
 * la LLM) și produce email HTML brandat. Componentele de mai jos sunt singura
 * sursă de prezentare — orice tip viitor de email (audit, propunere,
 * follow-up, welcome, confirmare, notificare internă) se asamblează din ele.
 *
 * Reguli email-client (de-asta arată codul cum arată):
 * - layout pe <table> — singurul lucru pe care Outlook îl randează corect
 * - toate stilurile inline; <style> doar pentru dark-mode hints și mobile
 * - fonturi: Georgia (ecou Gloock) + system sans (ecou Geist) — fonturile
 *   custom nu se încarcă în majoritatea clienților
 * - logo Bloom = wordmark TEXT (rămâne vizibil cu imaginile blocate);
 *   badge-ul FERAL e singura imagine, hostată public
 */

// ── Design tokens (paleta site-ului bloommedia.ro) ───────────────────────────
export const T = {
  bgOuter:   '#EDEBE6',   // --color-bg-light
  bgCard:    '#FFFFFF',
  text:      '#1A1814',   // --color-text-primary
  muted:     '#625D56',   // --color-text-muted
  divider:   '#D0CBC3',   // --color-divider
  green:     '#1E7B4F',
  greenBg:   '#EDF6F1',
  amber:     '#8A6215',
  amberBg:   '#FAF4E6',
  red:       '#B03A2E',
  redBg:     '#FAEDEB',
  blue:      '#2149B8',
  blueBg:    '#EDF1FB',
  radius:    '12px',
  // Gloock/Geist se încarcă prin @font-face (Apple Mail etc.); fallback-ul
  // e system sans modern, NU Georgia — Gmail cade pe Segoe/Helvetica.
  display:   "'Gloock', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
  sans:      "'Geist', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
}

export const BADGE_URL_DEFAULT = 'https://www.bloommedia.ro/feral-badge.png'

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

// ── Scor determinist din note pe categorii (1–5 sau null) ────────────────────
export function computeScore(categories = []) {
  const rated = categories.filter((c) => Number.isFinite(c?.rating) && c.rating >= 1 && c.rating <= 5)
  if (!rated.length) return null
  const avg = rated.reduce((a, c) => a + c.rating, 0) / rated.length
  return Math.round(avg * 20)
}

export function scoreColor(score) {
  if (score >= 80) return { fg: T.green, bg: T.greenBg }
  if (score >= 60) return { fg: T.amber, bg: T.amberBg }
  return { fg: T.red, bg: T.redBg }
}

// ── Componente ───────────────────────────────────────────────────────────────

function emailLayout({ title, preheader, body }) {
  return `<!DOCTYPE html>
<html lang="ro" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(title)}</title>
<style>
  /* Fonturile brandului — ignorate de Gmail (fallback system sans), încărcate
     de Apple Mail & co. Ambele subseturi, pentru diacriticele românești. */
  @font-face { font-family:'Gloock'; font-style:normal; font-weight:400; src:url('https://www.bloommedia.ro/fonts/self/gloock-400-normal-latin.woff2') format('woff2'); unicode-range:U+0000-00FF,U+2013-2014,U+201C-201E; }
  @font-face { font-family:'Gloock'; font-style:normal; font-weight:400; src:url('https://www.bloommedia.ro/fonts/self/gloock-400-normal-latin-ext.woff2') format('woff2'); unicode-range:U+0100-024F,U+0218-021B; }
  @font-face { font-family:'Geist'; font-style:normal; font-weight:400; src:url('https://www.bloommedia.ro/fonts/self/geist-400-normal-latin.woff2') format('woff2'); unicode-range:U+0000-00FF,U+2013-2014,U+201C-201E; }
  @font-face { font-family:'Geist'; font-style:normal; font-weight:400; src:url('https://www.bloommedia.ro/fonts/self/geist-400-normal-latin-ext.woff2') format('woff2'); unicode-range:U+0100-024F,U+0218-021B; }
  @font-face { font-family:'Geist'; font-style:normal; font-weight:500; src:url('https://www.bloommedia.ro/fonts/self/geist-500-normal-latin.woff2') format('woff2'); unicode-range:U+0000-00FF,U+2013-2014,U+201C-201E; }
  @font-face { font-family:'Geist'; font-style:normal; font-weight:500; src:url('https://www.bloommedia.ro/fonts/self/geist-500-normal-latin-ext.woff2') format('woff2'); unicode-range:U+0100-024F,U+0218-021B; }
  body { margin:0; padding:0; -webkit-text-size-adjust:100%; }
  @media (max-width: 620px) {
    .container { width:100% !important; }
    .px { padding-left:20px !important; padding-right:20px !important; }
    .score-num { font-size:44px !important; }
    .h1 { font-size:26px !important; }
  }
  @media (prefers-color-scheme: dark) {
    /* Ancoră pentru clienții care respectă schema; restul auto-inversează. */
    .keep-light { background:${T.bgOuter} !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${T.bgOuter};" class="keep-light">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${T.bgOuter};">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" class="container" style="width:600px;max-width:600px;">
${body}
</table>
</td></tr>
</table>
</body>
</html>`
}

function header({ label, badgeUrl }) {
  return `<tr><td class="px" style="padding:8px 8px 20px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="font-family:${T.display};font-size:24px;color:${T.text};letter-spacing:-0.02em;">Bloom&nbsp;Media.</td>
    <td align="right" style="font-family:${T.sans};font-size:11px;color:${T.muted};letter-spacing:0.08em;">
      <img src="${esc(badgeUrl)}" width="22" height="15" alt="" style="vertical-align:middle;border:0;">
      &nbsp;POWERED BY FERAL
    </td>
  </tr></table>
  <div style="border-top:1px solid ${T.divider};margin-top:14px;"></div>
  <div style="font-family:${T.sans};font-size:11px;letter-spacing:0.18em;color:${T.muted};padding-top:12px;text-transform:uppercase;">${esc(label)}</div>
</td></tr>`
}

function hero({ title, subtitle, url }) {
  return `<tr><td class="px" style="padding:8px 8px 24px;">
  <div class="h1" style="font-family:${T.display};font-size:32px;line-height:1.15;color:${T.text};letter-spacing:-0.01em;">${esc(title)}</div>
  <div style="font-family:${T.sans};font-size:14px;line-height:1.6;color:${T.muted};padding-top:10px;">${esc(subtitle)}</div>
  ${url ? `<div style="padding-top:14px;"><span style="font-family:${T.sans};font-size:13px;color:${T.text};background:${T.bgCard};border:1px solid ${T.divider};border-radius:100px;padding:6px 14px;display:inline-block;">${esc(url)}</span></div>` : ''}
</td></tr>`
}

function scoreCard({ score, comment }) {
  if (score == null) {
    return card(`<div style="font-family:${T.sans};font-size:14px;line-height:1.6;color:${T.muted};text-align:center;">
      Site-ul nu a putut fi evaluat complet, așa că nu afișăm un scor. Detaliile sunt mai jos.</div>`)
  }
  const c = scoreColor(score)
  return `<tr><td class="px" style="padding:0 8px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.bg};border-radius:${T.radius};">
    <tr><td align="center" style="padding:30px 24px;">
      <div class="score-num" style="font-family:${T.display};font-size:54px;color:${c.fg};line-height:1;">${score}<span style="font-size:22px;color:${T.muted};">&nbsp;/&nbsp;100</span></div>
      <div style="font-family:${T.sans};font-size:13px;line-height:1.6;color:${T.text};padding-top:10px;max-width:420px;">${esc(comment)}</div>
    </td></tr>
  </table>
</td></tr>`
}

function card(inner, { accent } = {}) {
  const border = accent ? `border-left:4px solid ${accent};` : ''
  return `<tr><td class="px" style="padding:0 8px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${T.bgCard};border:1px solid ${T.divider};${border}border-radius:${T.radius};">
    <tr><td style="padding:22px 24px;">${inner}</td></tr>
  </table>
</td></tr>`
}

function sectionTitle(text, color = T.text) {
  return `<div style="font-family:${T.sans};font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${color};padding-bottom:12px;">${esc(text)}</div>`
}

function bulletList(items, { mark, markColor }) {
  return items.map((it) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td width="24" valign="top" style="font-family:${T.sans};font-size:14px;color:${markColor};padding:6px 0;">${mark}</td>
    <td style="padding:6px 0;">
      <div style="font-family:${T.sans};font-size:14px;font-weight:600;color:${T.text};">${esc(it.title)}</div>
      <div style="font-family:${T.sans};font-size:13px;line-height:1.55;color:${T.muted};padding-top:2px;">${esc(it.note)}</div>
    </td>
  </tr></table>`).join('')
}

function summary(text) {
  return card(`${sectionTitle('Pe scurt')}
    <div style="font-family:${T.sans};font-size:14px;line-height:1.7;color:${T.text};">${esc(text)}</div>`)
}

function strengths(items) {
  return card(`${sectionTitle('Ce faci bine', T.green)}${bulletList(items, { mark: '✓', markColor: T.green })}`)
}

function opportunities(items) {
  return card(`${sectionTitle('Cele mai mari oportunități', T.amber)}${bulletList(items, { mark: '!', markColor: T.amber })}`)
}

function quickWin({ title, note }) {
  return card(`${sectionTitle('Quick win — săptămâna asta', T.blue)}
    <div style="font-family:${T.sans};font-size:14px;font-weight:600;color:${T.text};">${esc(title)}</div>
    <div style="font-family:${T.sans};font-size:13px;line-height:1.6;color:${T.muted};padding-top:4px;">${esc(note)}</div>`,
    { accent: T.blue })
}

function cta({ buttonText, buttonUrl, secondary }) {
  return `<tr><td class="px" align="center" style="padding:16px 8px 28px;">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="background:${T.text};border-radius:100px;">
      <a href="${esc(buttonUrl)}" style="display:inline-block;font-family:${T.sans};font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;padding:14px 34px;letter-spacing:0.04em;">${esc(buttonText)}</a>
    </td>
  </tr></table>
  <div style="font-family:${T.sans};font-size:13px;line-height:1.6;color:${T.muted};padding-top:14px;max-width:380px;">${esc(secondary)}</div>
</td></tr>`
}

function footer() {
  return `<tr><td class="px" style="padding:8px 8px 0;">
  <div style="border-top:1px solid ${T.divider};padding-top:20px;"></div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="font-family:${T.display};font-size:16px;color:${T.text};">Bloom&nbsp;Media.</td>
    <td align="right" style="font-family:${T.sans};font-size:12px;">
      <a href="https://bloommedia.ro" style="color:${T.muted};text-decoration:none;">bloommedia.ro</a> &nbsp;·&nbsp;
      <a href="https://www.instagram.com/bloom_media_marketing/" style="color:${T.muted};text-decoration:none;">Instagram</a> &nbsp;·&nbsp;
      <a href="https://www.facebook.com/profile.php?id=61587068890787" style="color:${T.muted};text-decoration:none;">Facebook</a>
    </td>
  </tr></table>
  <div style="font-family:${T.sans};font-size:11px;line-height:1.6;color:${T.muted};padding:16px 0 8px;">
    Acest raport a fost generat automat de FERAL AI pe baza informațiilor disponibile public.
    Reprezintă un audit preliminar și nu trebuie considerat o analiză tehnică sau de business completă.
  </div>
</td></tr>`
}

/** Bloc intern pentru agenție — șters manual la forward. */
function internalBlock(lead) {
  const row = (k, v) => v ? `<tr>
    <td style="font-family:${T.sans};font-size:12px;color:${T.muted};padding:2px 12px 2px 0;white-space:nowrap;">${k}</td>
    <td style="font-family:${T.sans};font-size:12px;color:${T.text};padding:2px 0;">${esc(v)}</td></tr>` : ''
  return `<tr><td class="px" style="padding:0 8px 20px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5EFDC;border:1px dashed ${T.amber};border-radius:${T.radius};">
    <tr><td style="padding:14px 18px;">
      <div style="font-family:${T.sans};font-size:11px;font-weight:700;letter-spacing:0.14em;color:${T.amber};padding-bottom:8px;">INTERN — VERIFICĂ ȘI ȘTERGE BLOCUL ĂSTA ÎNAINTE DE FORWARD</div>
      <table role="presentation" cellpadding="0" cellspacing="0">
        ${row('Lead', lead.name)}${row('Email', lead.email)}${row('Telefon', lead.phone)}${row('Mesaj', lead.message)}
      </table>
    </td></tr>
  </table>
</td></tr>`
}

// ── Template: Audit ──────────────────────────────────────────────────────────
/**
 * data = {
 *   lead: { name, email, phone, message, website|social },
 *   audit: {
 *     summary, categories:[{name,rating,note}], strengths:[{title,note}],
 *     opportunities:[{title,note}], quick_win:{title,note}
 *   }
 * }
 */
export function renderAuditEmail(data, { badgeUrl = BADGE_URL_DEFAULT, internal = true } = {}) {
  const { lead, audit } = data
  const url = lead.website || lead.social || ''
  const score = computeScore(audit.categories)
  const rated = (audit.categories || []).filter((c) => Number.isFinite(c?.rating))
  const scoreComment = score == null ? '' : (
    rated.length < (audit.categories || []).length
      ? `Scor calculat din ${rated.length} categorii evaluabile din ${audit.categories.length}.`
      : 'Scor calculat din notele pe cele patru categorii ale framework-ului de audit Bloom Media.'
  )

  const body = [
    header({ label: 'Audit AI de website', badgeUrl }),
    internal ? internalBlock(lead) : '',
    hero({
      title: 'Auditul AI al site-ului tău e gata',
      subtitle: 'Generat de FERAL AI și verificat prin framework-ul de audit Bloom Media.',
      url,
    }),
    scoreCard({ score, comment: scoreComment }),
    audit.summary ? summary(audit.summary) : '',
    audit.strengths?.length ? strengths(audit.strengths.slice(0, 3)) : '',
    audit.opportunities?.length ? opportunities(audit.opportunities.slice(0, 3)) : '',
    audit.quick_win?.title ? quickWin(audit.quick_win) : '',
    cta({
      buttonText: 'Programează un call de strategie gratuit',
      buttonUrl: process.env.CTA_URL || `mailto:hello@bloommedia.ro?subject=${encodeURIComponent(`Call de strategie — ${url}`)}`,
      secondary: 'Parcurgem auditul împreună și construim un plan de creștere personalizat. 20 de minute, fără pitch.',
    }),
    footer(),
  ].join('\n')

  return emailLayout({
    title: 'Auditul AI al site-ului tău — Bloom Media',
    preheader: audit.summary || 'Auditul AI al site-ului tău e gata.',
    body,
  })
}

/** Notificare internă simplă (eșecuri, sistem) — reutilizează layout-ul. */
export function renderInternalEmail({ title, text, lead }) {
  const body = [
    header({ label: 'Notificare internă', badgeUrl: BADGE_URL_DEFAULT }),
    lead ? internalBlock(lead) : '',
    card(`<div style="font-family:${T.sans};font-size:15px;font-weight:600;color:${T.text};padding-bottom:8px;">${esc(title)}</div>
      <div style="font-family:${T.sans};font-size:13px;line-height:1.7;color:${T.text};white-space:pre-wrap;">${esc(text)}</div>`),
    footer(),
  ].join('\n')
  return emailLayout({ title, preheader: title, body })
}
