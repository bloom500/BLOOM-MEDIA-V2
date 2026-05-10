import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

export function prefersReducedMotion() {
  if (!import.meta.client) {
    return true
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function setupGsap() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger)
    registered = true
  }

  gsap.defaults({
    ease: 'power2.out'
  })

  ScrollTrigger.defaults({
    markers: false
  })

  return {
    gsap,
    ScrollTrigger
  }
}

export function cleanupWillChange(targets: gsap.TweenTarget) {
  gsap.set(targets, {
    clearProps: 'willChange'
  })
}
