import { fileURLToPath } from 'node:url'

// Workaround: Vite 7 import-analysis vs `#app-manifest` (nuxt/nuxt#33606); matches Nuxt client stub.
const appManifestShim = fileURLToPath(
  new URL('./node_modules/mocked-exports/lib/empty.mjs', import.meta.url)
)

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  app: {
    head: {
      link: [
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
