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
        {
          rel: 'stylesheet',
          href: 'https://fonts.bunny.net/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap'
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
