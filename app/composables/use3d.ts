import { useState } from '#app'

/*
 * Preferința „experiență 3D on/off" — pattern-ul immersive-g.com (toggle-ul
 * „Off" din colțul dreapta-jos). Persistă în localStorage; SSR pornește cu
 * true și clientul rehidratează preferința la primul acces.
 */
const STORAGE_KEY = 'bloom-3d'

export function use3d() {
  const enabled = useState('bloom-3d-enabled', () => true)

  if (import.meta.client && !(use3d as { _init?: boolean })._init) {
    ;(use3d as { _init?: boolean })._init = true
    if (localStorage.getItem(STORAGE_KEY) === 'off') enabled.value = false
  }

  function toggle() {
    enabled.value = !enabled.value
    localStorage.setItem(STORAGE_KEY, enabled.value ? 'on' : 'off')
  }

  return { enabled, toggle }
}
