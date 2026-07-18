import { defineEventHandler, setHeader } from 'h3'
import { PRICING, categories, faqItems } from '../../app/lib/pricing'

/**
 * /llms.txt — GEO/LLMO: rezumat citabil pentru modelele de limbaj.
 * Generat din lib/pricing.ts (aceeași sursă ca site-ul), deci prețurile
 * citate de un LLM nu pot diverge de pagina reală.
 */
export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')

  const services = categories.map(cat =>
    `### ${cat.label}\n${cat.tagline}\n` +
    cat.items.map(i =>
      `- ${i.name}: €${i.price} ${i.oneTime ? 'one-time' : '/ lună'}: ${i.desc}`
    ).join('\n')
  ).join('\n\n')

  const faq = faqItems.map(f => `**${f.q}**\n${f.a}`).join('\n\n')

  return `# Bloom Media

> Agenție de AI Growth Systems din Cluj-Napoca, România (Bloom Ventures SRL).
> Construim sisteme de creștere: Meta & Google Ads, site-uri de conversie și
> agenți AI care califică și urmăresc fiecare lead. Lucrăm lunar, fără
> contracte pe termen lung, cu prețuri publice.

Contact: contact@bloommedia.ro · +40 763 281 168 · https://www.bloommedia.ro
Audit gratuit: https://www.bloommedia.ro/audit
Servicii și prețuri: https://www.bloommedia.ro/servicii
Proces: https://www.bloommedia.ro/proces
Despre: https://www.bloommedia.ro/despre

Notă prețuri: fee-urile de management pornesc de la €${PRICING.marketingFeeFrom}/lună per canal.
Bugetul de ads (minim recomandat €${PRICING.minAdBudget}/lună) e separat, plătit
direct platformelor, în conturile clientului.

## Servicii

${services}

## Întrebări frecvente

${faq}

## Tehnologie

Agenții AI sunt construiți pe FERAL, platforma open-source a Bloom Media:
https://github.com/bloom500/feral
`
})
