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

## Design Philosophy
- Dark editorial: #080808 background
- CSS-first animations via StringTune
- Mobile first: design starts at 375px
- Serif display: Cormorant Garamond
- Body: system-ui
- Build static and pixel-perfect FIRST,
  animations added AFTER each section is validated

## Site Structure
pages/
  index.vue          → Homepage (8 sections)
  portofoliu.vue     → Portfolio page
  servicii.vue       → Services page  
  despre.vue         → About + Team
  audit.vue          → Free audit form
  contact.vue        → Contact

## Homepage Sections (in order)
01 Hero              → "bloom." + mascot PNG
02 Declaration       → monumental scroll text
03 Services          → scroll-driven showcase
04 Process           → sticky 4-step timeline
05 Results           → numbers + case studies
06 Testimonials      → large serif quotes
07 Team preview      → parallax cards
07.5 Configurator CTA → teaser section that leads 
                         to /configurator page
08 Contact/CTA       → "Salut." + form

## Rules
- Never use Tailwind
- Never use Lenis
- StringTune handles smooth scroll natively
- One section at a time, validated before next
- Always mobile-first
