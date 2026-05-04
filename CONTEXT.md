# Bloom Media V2 — Project Context

## What we're building
A complete website for Bloom Media, a Romanian 
digital marketing agency based in Cluj-Napoca.

## Visual References (study these carefully)
- https://obsidianassembly.com — PRIMARY reference
  Editorial luxury, object-centered hero, 
  parallax storytelling, serif display typography
  
- https://string-tune.fiddle.digital — ANIMATION reference  
  StringTune engine demos, attribute-driven animations
  CSS-first, JS-light philosophy

- https://fiddle.digital — AGENCY reference
  Hierarchy, social proof, editorial structure

- https://landonorris.com — RHYTHM reference
  Magazine-style sections, visual variety between chapters

- https://persepolis.getty.edu — STORYTELLING reference
  Scroll-driven narrative, prolog entry, guided tour feel

## Brand Identity
- Name: Bloom Media (Bloom Ventures SRL)
- Location: Cluj-Napoca, Romania
- Services: Meta Ads, Web Design, AI Automation, 
  Marketing Consultancy
- Mascot: fluffy black monster toy with orange accents,
  Labubu/Pop Mart aesthetic
- Accent color: #F97316 (orange)
- Tone: premium, editorial, dark luxury

## Tech Stack
- Nuxt 4 minimal
- @fiddle-digital/string-tune (installed)
- gsap (installed)
- @vueuse/core (installed)
- @nuxt/image (installed)

## Typography
**Live (fără watermark):** **Outfit** + **Instrument Serif** prin [Fonts Bunny](https://fonts.bunny.net) în `nuxt.config.ts`; variabilele în `main.css` (`--font-ui`, `--font-display`, `--font-editorial`). Fișierele trial/demo (Mont DEMO, Gwen din surse trial) nu pot fi „reparate” cu CSS — watermark-ul e în font; `@font-face` pentru ele e **comentat** în `fonts.css`.

**După licență:** Mont / Gwen full în `public/fonts/`, decomentează blocurile din `fonts.css` și pune din nou `Mont` / `Gwen Display` / `Gwen Text` în stack în `main.css`. Verifică comercial: [Mont](https://www.dafont.com/mont.font), [Gwen](https://www.allfreefonts.co/gwen-font/).
- **Instrument Serif** — poți self-hosta WOFF2 din [Google Fonts](https://fonts.google.com/specimen/Instrument+Serif) dacă vrei zero CDN.
- **Mileast** ([1001fonts](https://www.1001fonts.com/mileast-font.html)): pe site e marcat „Free for personal use” / **nu e gratuit comercial** fără licență din zip (`NOTE !!!!.txt`). Pentru Bloom (comercial) nu e potrivit ca font implicit; dacă cumperi licența de la autor, poți adăuga `@font-face` în `fonts.css` și îl pui în stack în locul sau înaintea lui Instrument Serif.

## Design Philosophy
- Dark editorial: #080808 background
- CSS-first animations via StringTune
- Mobile first: design starts at 375px
- Display / hero / editorial: Instrument Serif (până la Gwen licențiat)
- UI + body + titluri de rând (servicii/pași): Outfit (până la Mont licențiat)
- Build static and pixel-perfect FIRST,
  animations added AFTER each section is validated

## Animations
- **StringTune** init global în `app/app.vue` (`StringProgress`, `StringSplit`, `StringParallax`, opțional `StringMagnetic`, `StringLazy`, `StringLerp`, `StringGlide`); skip total dacă `prefers-reduced-motion: reduce`. Refs: `reference/tutorial-01-footer-shifting.html` + tutorialele `tutorial-{01..15}` din `d:\WEBSITES\EQ Dent Website\`.
- Clase / hooks (toate setate dinamic de StringTune, deci CSS-ul lor stă **global** în `app/assets/css/animations.css` — Vue scoped nu le prinde):
  - `[data-anim="char-reveal"]` + `string="split" string-split="char"` → titluri pe cuvinte/litere care intră de jos (hero, services, process, faq).
  - `[data-anim="word-progress"]` + `string="split" string-split="word"` în interiorul unui părinte cu `string="progress"` → reveal scroll-locked (declaration).
  - `[data-anim="reveal-up"]` sau elemente cu `string string-repeat` care primesc `.-inview` → fade + translate up (services rows, why-items, step content). Stagger via `nth-child` în CSS scoped.
  - `[data-anim="reveal-line"]` + wrap intern `<span>` → line-clip reveal (process step name).
- **GSAP** doar pentru on-load entry pe hero (`mascot`, labels, bottom). Restul = StringTune.
- Variabile CSS expuse: `--progress` (0..1) pe orice nod cu `string="progress"`; `--char-start`, `--word-index`, `--word-global-total` pe nodes split.

## Site Structure
app/pages/
  index.vue          → Homepage (8 sections)
  portofoliu.vue     → Portfolio page
  servicii.vue       → Services page
  despre.vue         → About + Team
  audit.vue          → Free audit form
  contact.vue        → Contact

## Homepage Sections (in order)
01 Hero              → `HeroSection.vue`: titlu staggered + mascota.webp
02 Declaration       → `DeclarationSection.vue` (manifest / tipografie monumentală)
03 Services          → `ServicesSection.vue` (listă editorială servicii)
04 Process           → `ProcessSection.vue` (pași cu număr sticky)
05 Why Bloom         → `WhyBloomSection.vue`: diferențiatori reali, grid editorial, CTA audit
06 FAQ               → `FaqSection.vue`: accordion `<details>`, editorial
07 Contact           → `ContactSection.vue`: canale + CTA audit / configurator
08 Footer            → `TheFooter.vue`: navigare + legal; **StringTune** `StringProgress` pe `<footer string="progress" string-exit-vp="bottom">` — aceeași logică ca `reference/tutorial-01-footer-shifting.html` (copiat din EQ Dent): `transform` pe **interior** (`.footer__inner`), overlay **`footer::after`** cu `opacity: calc(1 - var(--progress))`, fundal pagină pe overlay; `.site-main` are `z-index: 20` ca `.content` din tutorial
09 Results           → numbers + case studies
10 Testimonials      → large serif quotes
11 Team preview      → parallax cards
11.5 Configurator CTA → teaser section that leads 
                         to /configurator page
12 Salut / form      → secțiune finală homepage (în plus față de blocul 07 Contact)

## Rules
- Never use Tailwind
- Never use Lenis
- StringTune handles smooth scroll natively
- One section at a time, validated before next
- Always mobile-first
