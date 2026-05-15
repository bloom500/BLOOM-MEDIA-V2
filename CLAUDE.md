# Bloom Media V2 — Nuxt 3

## Stack
- Nuxt 3, Vue 3, `<script setup lang="ts">`
- CSS custom properties în `:root` pentru culori și fonturi
- Componente în `/app/`, pagina principală în `/pages/index.vue`

## Design tokens
- `--font-display`: 'Cormorant Garamond', Georgia, serif
- `--font-body`: 'Geist', 'Noto Sans', system-ui, sans-serif
- `--color-bg-light`: #EDEBE6
- `--color-bg-dark`: #080806
- `--color-text-primary`: #1A1814
- `--color-text-muted`: #9A9590

## Reguli importante
- Nu atinge HeroSection / ReliefSlab.vue — mesh WebGL e gata
- Nu instala pachete noi
- Păstrează copy-ul românesc exact cum e
- Fiecare secțiune e componentă separată în `/app/components/`
- După orice modificare CSS, verifică că nu ai rupt alte secțiuni
