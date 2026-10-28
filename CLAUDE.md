# Bloom Media V2 — Nuxt 4

## Stack
- Nuxt 4, Vue 3, `<script setup lang="ts">`
- Scroll: Lenis (smooth wheel) + StringTune (progress/split/parallax) + GSAP ScrollTrigger, vezi `app/lib/stringtune/client.ts`
- 3D home: `ReliefSlab.client.vue` (three/webgpu + TSL). „Ceața” (flowmap + stratul cromatic) e efectul principal: nu o strica, cel mult o îmbunătățești
- CSS custom properties în `:root` pentru culori și fonturi
- Componente în `/app/`, pagina principală în `/pages/index.vue`

## Design tokens
- `--font-display`: 'Gloock', Georgia, serif (self-hosted, `public/fonts/self`)
- `--font-body`: 'Geist', system-ui, sans-serif (self-hosted)
- `--color-bg-light`: #EDEBE6
- `--color-bg-dark`: #000000
- `--color-text-primary`: #1A1814
- `--color-text-muted`: #625D56

## Reguli importante
- Nu atinge HeroSection / ReliefSlab.vue — mesh WebGL e gata
- Nu instala pachete noi
- Păstrează copy-ul românesc exact cum e
- Fiecare secțiune e componentă separată în `/app/components/`
- După orice modificare CSS, verifică că nu ai rupt alte secțiuni
