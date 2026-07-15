/**
 * Optimized GLBs in `public/models/optimized/`:
 * bloom, hands, seafoam, sculpture, moon, mandala
 *
 * Seven homepage sections; mandala reused for services + faq.
 */
export const HOMEPAGE_SECTION_GLBS = {
  hero: '/models/optimized/bloom-optimized.glb',
  declaration: '/models/optimized/sculpture-optimized.glb',
  services: '/models/optimized/mandala-optimized.glb',
  process: '/models/optimized/hands-optimized.glb',
  why: '/models/optimized/moon-optimized.glb',
  faq: '/models/optimized/mandala-optimized.glb',
  contact: '/models/optimized/seafoam-optimized.glb',
} as const

export type HomepageSectionModelKey = keyof typeof HOMEPAGE_SECTION_GLBS
