import { fileURLToPath } from 'node:url'

// Workaround: Vite 7 import-analysis vs `#app-manifest` (nuxt/nuxt#33606); matches Nuxt client stub.
const appManifestShim = fileURLToPath(
  new URL('./node_modules/mocked-exports/lib/empty.mjs', import.meta.url)
)

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      // GA4 measurement ID (G-XXXX). Gol = GA4 dezactivat; Pixel-ul Meta
      // are ID-ul hardcodat în useAnalytics.ts. Setează NUXT_PUBLIC_GA_ID.
      gaId: '',
    },
  },
  // Headere de securitate pe tot site-ul. CSP lipsește deliberat: JSON-LD
  // inline + hydration Nuxt cer nonce-uri — proiect separat, nu un header.
  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options':           'DENY',
        'X-Content-Type-Options':    'nosniff',
        'Referrer-Policy':           'strict-origin-when-cross-origin',
        'Permissions-Policy':        'camera=(), microphone=(), geolocation=()',
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
      },
    },
  },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        // Fonturile sunt self-hosted (@font-face în assets/css/fonts.css,
        // fișiere în /public/fonts/self) — fără CDN-uri Google/Bunny (GDPR).
        // Preload doar fonturile critice above-the-fold (hero + body, latin +
        // latin-ext pentru diacritice RO); restul se încarcă via unicode-range.
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/self/gloock-400-normal-latin.woff2', crossorigin: '' },
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/self/gloock-400-normal-latin-ext.woff2', crossorigin: '' },
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/self/geist-400-normal-latin.woff2', crossorigin: '' },
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/self/geist-400-normal-latin-ext.woff2', crossorigin: '' },
      ]
    }
  },
  css: [
    '~/assets/css/fonts.css',
    '~/assets/css/main.css',
    '~/assets/css/animations.css'
  ],
  modules: ['@nuxt/image'],
  vite: {
    optimizeDeps: {
      exclude: ['#app-manifest']
    },
    resolve: {
      alias: {
        '#app-manifest': appManifestShim
      }
    }
  }
})
