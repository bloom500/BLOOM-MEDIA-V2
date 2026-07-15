// Trimite un email de audit din date fixe — pentru verificarea design-ului
// în clienți reali fără o rulare FERAL. Usage (pe VPS, ca root sau feral):
//   set -a; . /home/feral/audit-worker/worker.env; set +a
//   node /home/feral/audit-worker/send-sample.mjs
import { renderAuditEmail } from './email-system.mjs'

const lead = {
  name: 'Ion Popescu (SAMPLE)', email: 'ion@companie.ro', phone: '0722 000 000',
  website: 'https://companie.ro', message: 'Vreau mai multe lead-uri din ads.',
}
const audit = {
  summary: 'Site-ul comunică o poziționare premium clară și transparentă la preț, dar nu oferă încă dovezi sociale concrete. Structura de conversie există, însă lipsesc cifrele care să convingă un lead rece. Cu 2-3 studii de caz și un CTA vizibil deasupra fold-ului, potențialul de conversie crește semnificativ.',
  categories: [
    { name: 'Prima impresie', rating: 4, note: '' },
    { name: 'Propunere de valoare', rating: 4, note: '' },
    { name: 'Conversie', rating: 3, note: '' },
    { name: 'Încredere', rating: 2, note: '' },
  ],
  strengths: [
    { title: 'Transparență la preț', note: 'Prețurile publice elimină fricțiunea principală din discuțiile cu agențiile.' },
    { title: 'Mesaj care filtrează', note: 'Hero-ul respinge activ publicul nepotrivit — un semn de poziționare matură.' },
  ],
  opportunities: [
    { title: 'Dovezi sociale', note: 'Fără logo-uri de clienți sau cifre, promisiunea de performanță rămâne neverificabilă.' },
    { title: 'CTA deasupra fold-ului', note: 'Butonul principal de audit apare târziu — un lead grăbit nu ajunge la el.' },
  ],
  quick_win: {
    title: 'Adaugă 3 rezultate cu cifre în hero',
    note: 'Un rând de tip „+187% ROAS · 43 lead-uri/lună" sub subtitlu se implementează într-o zi.',
  },
}

const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
  body: JSON.stringify({
    from: process.env.FROM_EMAIL || 'Bloom Media <contact@bloommedia.ro>',
    to: process.env.AGENCY_EMAIL || 'bloommediacorporation@gmail.com',
    subject: '[SAMPLE] Audit AI — companie.ro — 65/100',
    html: renderAuditEmail({ lead, audit }),
  }),
})
console.log(res.status, await res.text())
