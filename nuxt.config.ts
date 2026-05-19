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
        // Preconnect to both font hosts so the TLS handshake is done by the
        // time the stylesheets resolve their @font-face URLs. bunny.net
        // was missing before — added because Outfit ships from there.
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preconnect', href: 'https://fonts.bunny.net', crossorigin: '' },
        // Critical fonts (above-the-fold hero + body). Single combined
        // request to Google Fonts — fewer round trips than 2 separate ones.
        // Dropped Noto Sans: Geist already covers Romanian diacritics, so
        // the second family was dead weight (~80KB across weights).
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Gloock:ital@0;1&family=Geist:wght@300;400;500&display=swap'
        },
        // Outfit (UI/nav/CTA buttons): non-critical for LCP. Loaded
        // async via the print-media swap trick — browser fetches it
        // without blocking render. Body text uses Geist; Outfit only
        // styles small UI surfaces that can swap in a frame later.
        {
          rel: 'stylesheet',
          href: 'https://fonts.bunny.net/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
          media: 'print',
          onload: "this.media='all'"
        },
        // No-JS fallback for the deferred Outfit stylesheet.
      ],
      noscript: [
        {
          children: '<link rel="stylesheet" href="https://fonts.bunny.net/css2?family=Outfit:wght@300;400;500;600;700&display=swap">'
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
