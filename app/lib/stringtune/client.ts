import {
  StringLoading,
  StringParallax,
  StringProgress,
  StringSplit,
  StringTune
} from '@fiddle-digital/string-tune'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { setupGsap } from '../animations/gsap'

type StringTuneInstance = InstanceType<typeof StringTune>

let instance: StringTuneInstance | null = null
let started = false

export interface InitStringTuneOptions {
  loadingTimeout?: number
}

export function getStringTune() {
  return instance
}

/*
 * StringSplit prezice unde va rupe browserul rândurile și OMITE spațiul
 * ( ) după cuvântul estimat ca ultimul de pe un rând vizual. Când
 * predicția diferă de layoutul real (font încărcat târziu, viewport mobil),
 * cele două cuvinte ajung lipite pe același rând („momentulpotrivit.").
 * După fiecare split re-adăugăm NBSP la orice .-s-word care nu e ultimul
 * din elementul lui. Dacă predicția a fost corectă, NBSP-ul cade la capăt
 * de rând și e invizibil. Re-split-urile refac DOM-ul din original, deci
 * corecția e idempotentă.
 */
const NBSP = '\u00A0'
let fixTimer: ReturnType<typeof setTimeout> | undefined

function fixSplitWordSpacing() {
  document.querySelectorAll('.-splitted').forEach((el) => {
    const words = el.querySelectorAll('.-s-word')
    words.forEach((w, i) => {
      if (i === words.length - 1) return
      // Char-split (titluri cu char-reveal): fără spații între glife, nu atingem.
      if (w.querySelector('.-s-char')) return
      const t = w.textContent ?? ''
      if (!t.endsWith(NBSP) && !t.endsWith(' ')) {
        w.appendChild(document.createTextNode(NBSP))
      }
    })
  })
}

function scheduleSplitSpacingFix() {
  clearTimeout(fixTimer)
  // După debounce-ul intern de re-split al bibliotecii.
  fixTimer = setTimeout(fixSplitWordSpacing, 350)
}

export function initStringTune(options: InitStringTuneOptions = {}) {
  if (!import.meta.client) {
    return null
  }

  const { ScrollTrigger: Trigger } = setupGsap()

  if (!instance) {
    instance = StringTune.getInstance()
  }

  if (!started) {
    instance.setupSettings({
      'offset-top': '-8%',
      'offset-bottom': '-8%',
      parallax: 0.18,
      // Inerție mai mare: scroll mai lent, aliniat cu mișcarea vizuală a conținutului.
      lerp: 0.42,
      repeat: 'true'
    })

    /*
     * Native scroll EVERYWHERE (2026-07-16): the desktop 'smooth' lerp loop
     * moved the whole page from JS every frame, competing with the WebGPU
     * rAF — on Mac touchpads scroll and cursor visibly trailed the input.
     * StringTune parallax isn't used in any template, so smooth mode's only
     * output was the inertia itself. Progress/split/curtain already run on
     * native scroll on mobile; desktop behaves identically.
     * Revert = scrollDesktopMode 'smooth'.
     */
    instance.scrollDesktopMode = 'native'
    instance.scrollMobileMode = 'native'
    instance.speed = 0.035
    instance.speedAccelerate = 0.09

    instance.use(StringLoading, {
      timeout: options.loadingTimeout ?? 450
    })
    instance.use(StringProgress)
    instance.use(StringSplit)
    instance.use(StringParallax)

    instance.on('scroll', () => Trigger.update())
    instance.on('update', () => Trigger.update())
    instance.on('start', () => {
      requestAnimationFrame(() => Trigger.refresh())
      scheduleSplitSpacingFix()
    })
    instance.on('resize', () => scheduleSplitSpacingFix())

    instance.start(60)
    started = true

    ;(window as unknown as { __stringTune?: StringTuneInstance }).__stringTune = instance
  } else {
    requestAnimationFrame(() => {
      instance?.onResize(true)
      ScrollTrigger.refresh()
    })
  }

  return instance
}

export function refreshStringTune() {
  if (!import.meta.client || !instance) {
    return
  }

  requestAnimationFrame(() => {
    instance?.onResize(true)
    ScrollTrigger.refresh()
    scheduleSplitSpacingFix()
  })
}

export function resetStringTuneScroll() {
  if (!import.meta.client) {
    return
  }

  instance?.scrollTo({ position: 0, immediate: true })
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  refreshStringTune()
}
