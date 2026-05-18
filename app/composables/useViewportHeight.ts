import { onMounted, onBeforeUnmount } from 'vue'

/**
 * Sets a CSS custom property `--vh` on <html> equal to `window.innerHeight * 0.01`,
 * mirroring the classic 100vh-iOS-Safari workaround. Modern browsers should use
 * `100dvh` directly, but on iOS < 16 the dynamic-viewport units fall back to the
 * static one (large viewport) which causes layout shifts when the URL bar
 * collapses on scroll. Pairing `min-height: calc(var(--vh, 1dvh) * 100)` gives:
 *
 *   - iOS 16+ / modern browsers → `1dvh` units (native, no JS)
 *   - iOS 15 and older          → JS-set --vh, recomputed on resize/orientation
 *
 * Idempotent: calling it from multiple components only attaches one listener
 * per window thanks to `__bloomVHAttached` guard. Cleanup is bound to the
 * caller's component lifecycle so SPA navigation doesn't leak listeners.
 */

interface VHWindow extends Window {
  __bloomVHAttached?: boolean
  __bloomVHRefcount?: number
}

function setVar() {
  if (typeof window === 'undefined') return
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

function attach() {
  const w = window as VHWindow
  if (w.__bloomVHAttached) {
    w.__bloomVHRefcount = (w.__bloomVHRefcount ?? 0) + 1
    return
  }
  w.__bloomVHAttached = true
  w.__bloomVHRefcount = 1

  setVar()
  window.addEventListener('resize', setVar, { passive: true })
  // orientationchange fires before viewport metrics settle on iOS — re-run
  // after a tick to capture the post-rotation height accurately.
  window.addEventListener('orientationchange', () => {
    requestAnimationFrame(() => requestAnimationFrame(setVar))
  }, { passive: true })
}

function detach() {
  const w = window as VHWindow
  if (!w.__bloomVHAttached) return
  w.__bloomVHRefcount = Math.max(0, (w.__bloomVHRefcount ?? 1) - 1)
  if (w.__bloomVHRefcount > 0) return

  window.removeEventListener('resize', setVar)
  // orientationchange handler is anonymous; replaced by a no-op page leave —
  // we just leave it (browser GC's it on unload). Acceptable: composable
  // typically lives for the page lifetime in this app.
  w.__bloomVHAttached = false
}

export function useViewportHeight() {
  if (!import.meta.client) return
  onMounted(attach)
  onBeforeUnmount(detach)
}
