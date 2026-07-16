import {
  StringLoading,
  StringParallax,
  StringProgress,
  StringSplit,
  StringTune
} from '@fiddle-digital/string-tune'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { setupGsap } from '../animations/gsap'

type StringTuneInstance = InstanceType<typeof StringTune>

let instance: StringTuneInstance | null = null
let lenis: Lenis | null = null
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

/*
 * StringSplit pune aria-label pe container (span generic) — rol care nu
 * permite naming (axe: aria-allowed-attr). Mutăm textul într-un copil
 * vizual ascuns; cuvintele splituite sunt deja aria-hidden. Re-split-urile
 * refac DOM-ul din original și repun aria-label, deci corecția re-rulează
 * din aceleași hook-uri ca fix-ul de spații.
 */
function fixSplitAria(el: Element) {
  const label = el.getAttribute('aria-label')
  if (!label) return
  el.removeAttribute('aria-label')
  if (el.querySelector(':scope > .-sr-only')) return
  const sr = document.createElement('span')
  sr.className = '-sr-only'
  sr.textContent = label
  sr.style.cssText =
    'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;'
  el.prepend(sr)
}

function fixSplitWordSpacing() {
  document.querySelectorAll('.-splitted').forEach((el) => {
    fixSplitAria(el)
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
      /*
       * lerp 1 = StringTune urmează scrollul 1:1, FĂRĂ smoothing propriu.
       * Smoothing-ul e făcut deja de Lenis pe scrollY-ul real; un al doilea
       * lerp aici (fostul 0.42) însemna dublă interpolare — la scroll rapid
       * sus-jos parallax/progress rămâneau în urmă și „explodau" vizual.
       */
      lerp: 1,
      repeat: 'true'
    })

    /*
     * StringTune rămâne pe scroll NATIV peste tot — smoothing-ul e făcut de
     * Lenis (mai jos), care animează scrollY-ul real al ferestrei. StringTune
     * modul lui 'smooth' muta pagina cu transform din JS și pe Mac scroll+cursor
     * trăgeau vizibil după touchpad; Lenis lasă compositorul să picteze și
     * doar interpolează poziția de scroll, deci progress/split/curtain/
     * ScrollTrigger citesc aceeași sursă ca până acum.
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

    /*
     * ScrollTrigger.update() vine EXCLUSIV din Lenis (mai jos) — Lenis emite
     * 'scroll' și pentru scrollul nativ (touch), nu doar pentru wheel-ul
     * smooth. Înainte se apela și din 'scroll'+'update' StringTune = de 3×
     * pe frame; la scroll rapid costul fura exact frame-urile de care avea
     * nevoie interpolarea Lenis (senzația de „a comutat pe nativ").
     */
    instance.on('start', () => {
      requestAnimationFrame(() => Trigger.refresh())
      scheduleSplitSpacingFix()
    })
    instance.on('resize', () => scheduleSplitSpacingFix())

    /*
     * Lenis smooth scroll — doar wheel (touch rămâne nativ, default-ul Lenis).
     * Rulează pe ticker-ul GSAP; lagSmoothing off ca ScrollTrigger să nu
     * „sară" după un frame lung de WebGPU. Creat ÎNAINTE de instance.start()
     * ca rAF-ul ticker-ului să fie înregistrat primul: în fiecare frame Lenis
     * scrie scrollY, apoi loop-ul StringTune citește valoarea proaspătă —
     * altfel efectele rulează mereu pe scrollul frame-ului precedent.
     */
    const { gsap } = setupGsap()
    // lerp mai mare = inerție mai scurtă; 0.1 (default) era prea „alunecos"
    // pe touchpad, 0.25 încă prea moale — 0.5 la cererea userului.
    lenis = new Lenis({ lerp: 0.5 })
    lenis.on('scroll', () => Trigger.update())
    gsap.ticker.add((time) => lenis?.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    /*
     * start(0) = loop necapat (rAF pur), NU 60. Cu 60, throttle-ul intern
     * sare frame-uri pe display-urile 120Hz (ProMotion): Lenis mișcă pagina
     * la 120Hz, StringTune actualiza parallax/progress doar la 60Hz — cu
     * lerp 1 diferența nu mai era mascată de smoothing și totul „sacada".
     */
    instance.start(0)
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

  lenis?.scrollTo(0, { immediate: true })
  instance?.scrollTo({ position: 0, immediate: true })
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  refreshStringTune()
}
