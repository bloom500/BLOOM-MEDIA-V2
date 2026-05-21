import type { RouterConfig } from '@nuxt/schema'

export default {
  scrollBehavior(to, _from, savedPosition) {
    // Browser back/forward: restore saved scroll position.
    if (savedPosition) return savedPosition

    // Anchor link (e.g. /#contact): scroll to element.
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }

    // Every other navigation: top of page, instant.
    return { top: 0, left: 0, behavior: 'instant' }
  },
} satisfies RouterConfig
