/*
 * Single source of truth for every price and commercial number on the site.
 * FAQ (FaqSection + JSON-LD in index.vue), /servicii (catalogue + calculator)
 * and any future page render from here — never hardcode a price in a template.
 *
 * Architecture (hybrid model):
 *  - Bloom fees = what's listed here (management/setup).
 *  - Ad budget  = the client's own spend, paid directly to Meta/Google/TikTok.
 *    MIN_AD_BUDGET is the recommended minimum for the system to have signal.
 */

export const PRICING = {
  /** €/lună — bugetul de ads al clientului, plătit direct platformelor */
  minAdBudget: 800,
  /** €/lună — cel mai mic fee de management pe un canal de ads */
  marketingFeeFrom: 350,
  /** € one-time — landing page de conversie */
  landingFrom: 900,
  /** € one-time — site de prezentare complet */
  siteFrom: 1500,
  /** € one-time — platformă e-commerce */
  ecommerceFrom: 2500,
  /** € one-time — setup agent AI / automatizare */
  aiSetupFrom: 600,
} as const

export interface ServiceItem {
  id: string
  name: string
  desc: string
  price: number
  oneTime: boolean
}

export interface ServiceCategory {
  id: string
  num: string
  label: string
  /** Fraza de sistem: ce se strică fără el / ce instalăm */
  tagline: string
  items: ServiceItem[]
}

/*
 * Triada de sistem — aceleași trei nume peste tot pe site:
 * Atrage / Convertește / Automatizează.
 */
export const categories: ServiceCategory[] = [
  {
    id: 'atrage',
    num: '01',
    label: 'Atrage',
    tagline: 'Campanii plătite care aduc oameni cu intenție reală, nu trafic de vanitate.',
    items: [
      { id: 'atrage-meta',      name: 'Meta Ads',                      desc: 'Campanii de achiziție pe Facebook & Instagram, cu strategie completă de retargeting și optimizare cost/lead. Fee de management, bugetul de ads e separat, în contul tău.', price: 400, oneTime: false },
      { id: 'atrage-google',    name: 'Google Ads (Search & YouTube)', desc: 'Targetare pe intenție de căutare: capturăm cererea existentă, direct din nevoia exprimată.', price: 350, oneTime: false },
      { id: 'atrage-tiktok',    name: 'TikTok Ads',                    desc: 'Scalare pe achiziție prin video scurt, acolo unde audiența ta consumă conținut.', price: 350, oneTime: false },
      { id: 'atrage-content',   name: 'Management Conținut',           desc: 'Sistem consistent de creație: calendar, producție și publicare pe canalele sociale, aliniate cu campaniile.', price: 350, oneTime: false },
      { id: 'atrage-video',     name: 'Pachet 4× Video Reels',         desc: '4 clipuri/lună, scripting, editare dinamică și optimizare pentru Ads.', price: 400, oneTime: false },
      { id: 'atrage-creatives', name: 'Creatives Static (Ads)',        desc: 'Set lunar de bannere performante pentru campanii, cu focus pe CTR.', price: 200, oneTime: false },
    ],
  },
  {
    id: 'converteste',
    num: '02',
    label: 'Convertește',
    tagline: 'Infrastructura care transformă clickul în client: pagini rapide, fără fricțiune.',
    items: [
      { id: 'conv-landing',   name: 'Landing Page Conversie', desc: 'Pagină de viteză maximă, construită exclusiv pentru conversie. Zero distracții.', price: PRICING.landingFrom, oneTime: true },
      { id: 'conv-site',      name: 'Site de Prezentare',     desc: 'Site complet, custom, optimizat pentru încredere și lead-uri. Livrat în 10-14 zile.', price: PRICING.siteFrom, oneTime: true },
      { id: 'conv-ecommerce', name: 'E-commerce Development', desc: 'Platformă scalabilă cu checkout optimizat pentru finalizarea tranzacției.', price: PRICING.ecommerceFrom, oneTime: true },
      { id: 'conv-seo',       name: 'SEO Tehnic',             desc: 'Viteză, indexare, structură, fricțiune tehnică redusă la zero, lunar.', price: 250, oneTime: false },
    ],
  },
  {
    id: 'automatizeaza',
    num: '03',
    label: 'Automatizează',
    tagline: 'Agenți AI care răspund, califică și urmăresc fiecare lead, non-stop, fără pauze.',
    items: [
      { id: 'auto-agent',    name: 'Agent AI de Calificare',      desc: 'Răspunde instant lead-urilor, pune întrebările de calificare și programează call-ul. Construit pe infrastructura noastră, inclusiv FERAL.', price: PRICING.aiSetupFrom, oneTime: true },
      { id: 'auto-followup', name: 'Automatizări Follow-up',      desc: 'Secvențe care nu uită pe nimeni: email, WhatsApp, SMS, fiecare lead primește următorul pas la timp.', price: 400, oneTime: true },
      { id: 'auto-raport',   name: 'Raportare Automată',          desc: 'Raport săptămânal generat din datele reale ale conturilor tale. Fără dashboard-uri inventate.', price: 150, oneTime: false },
    ],
  },
]

export interface PresetPackage {
  id: string
  name: string
  /** Pentru cine e pachetul — o frază, nu marketing vag */
  desc: string
  /** ID-uri din categories[].items — prețul pachetului se CALCULEAZĂ din ele */
  itemIds: string[]
  featured?: boolean
}

/*
 * Pachete preset pentru /servicii: ancore de decizie deasupra
 * configuratorului. Un preset doar pre-selectează itemi în configurator —
 * rămâne totul editabil, nu e un SKU separat. Prețurile nu apar aici:
 * se calculează din items, ca orice selecție manuală.
 */
export const presets: PresetPackage[] = [
  {
    id: 'start',
    name: 'Start',
    desc: 'Primul canal de achiziție plus pagina care convertește. Pentru validarea sistemului cu buget controlat.',
    itemIds: ['atrage-meta', 'conv-landing', 'auto-raport'],
  },
  {
    id: 'growth',
    name: 'Growth',
    desc: 'Sistemul complet: două canale de ads, site nou și agent AI care preia fiecare lead.',
    itemIds: ['atrage-meta', 'atrage-google', 'atrage-creatives', 'conv-site', 'auto-agent', 'auto-raport'],
    featured: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    desc: 'Acoperire totală: trei canale, producție video lunară, SEO și automatizare completă a follow-up-ului.',
    itemIds: ['atrage-meta', 'atrage-google', 'atrage-tiktok', 'atrage-video', 'conv-seo', 'auto-agent', 'auto-followup', 'auto-raport'],
  },
]

/** Q&A folosit și de FaqSection și de JSON-LD-ul FAQPage din index.vue. */
export const faqItems = [
  {
    q: 'Cât costă serviciile Bloom Media?',
    a: `Fee-urile de management pornesc de la ${PRICING.marketingFeeFrom}€/lună per canal, separat de bugetul tău de ads (minim recomandat ${PRICING.minAdBudget}€/lună, plătit direct către Meta sau Google, în contul tău). Site-uri: landing de la ${PRICING.landingFrom}€, site complet de la ${PRICING.siteFrom.toLocaleString('ro-RO')}€, e-commerce de la ${PRICING.ecommerceFrom.toLocaleString('ro-RO')}€. Primești ofertă fixă în 24h. Fără taxe ascunse.`,
  },
  {
    q: 'Există contract pe termen lung?',
    a: 'Nu. Lucrăm lunar, cu o lună preaviz. Dacă nu livrăm, pleci. Ne ține atenți.',
  },
  {
    q: 'Cât durează până văd rezultate?',
    a: 'Site: 10-14 zile. Ads: primele semnale în 2-3 săptămâni, rezultate consistente după 60-90 de zile. Agenții AI: activi din prima săptămână.',
  },
  {
    q: 'De ce Bloom și nu o agenție de 40 de oameni?',
    a: 'O agenție mare îți dă un account manager și un raport lunar. La noi vorbești direct cu cei care execută, iar partea repetitivă o fac agenții AI pe care îi construim intern, inclusiv FERAL, platforma noastră open-source. Overhead mic, viteză mare, niciun telefon fără răspuns.',
  },
  {
    q: 'Cu ce tipuri de business lucrați?',
    a: 'Cu afaceri care au deja tracțiune: clinici, e-commerce, servicii locale, B2B. Nu luăm proiecte la nivel de idee.',
  },
  {
    q: 'Oferiți rapoarte și transparență?',
    a: 'Da. Ai acces direct în conturile tale de Google și Meta, sunt ale tale, nu ale noastre. Primești un raport scurt săptămânal, generat automat din date reale.',
  },
  {
    q: 'Pot lua un singur serviciu?',
    a: 'Da. Doar site, doar ads, doar automatizări sau doar consultanță. Nu forțăm pachete.',
  },
  {
    q: 'Cum încep colaborarea?',
    a: 'Completezi auditul gratuit. Facem un call de 20 de minute. În 24h ai propunerea pe masă, cu preț fix.',
  },
]
