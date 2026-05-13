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
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap'
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500&family=Noto+Sans:wght@300;400;500&family=Newsreader:ital,wght@0,300;0,400;0,600;0,800;1,300;1,400;1,600;1,800&display=swap'
        },
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
