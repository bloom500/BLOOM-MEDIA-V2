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

    instance.scrollDesktopMode = 'smooth'
    instance.scrollMobileMode = 'default'
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
    })

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
