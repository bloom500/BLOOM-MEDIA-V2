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
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        // Gloock: high-contrast display serif (OFL, comercial free) — font display principal
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Gloock:ital@0;1&display=swap'
        },
        // Geist + Noto Sans: UI / body / labels
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500&family=Noto+Sans:wght@300;400;500&display=swap'
        },
        // Outfit: UI buttons, navbar, CTA
        {
          rel: 'stylesheet',
          href: 'https://fonts.bunny.net/css2?family=Outfit:wght@300;400;500;600;700&display=swap'
        }
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
