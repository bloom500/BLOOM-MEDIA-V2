import type { Ref } from 'vue'
import { onMounted, onUnmounted } from 'vue'
import { cleanupWillChange, prefersReducedMotion, setupGsap } from './gsap'

type MaybeElement = HTMLElement | SVGElement | null | undefined

export type ScrollAnimationKind =
  | 'fade-up'
  | 'image-reveal'
  | 'parallax'
  | 'split-lines'

export interface ScrollAnimationOptions {
  kind?: ScrollAnimationKind
  selector?: string
  start?: string
  end?: string
  scrub?: boolean | number
  stagger?: number
  once?: boolean
}

function resolveTarget(target: Ref<MaybeElement> | MaybeElement) {
  if (target && typeof target === 'object' && 'value' in target) {
    return target.value
  }

  return target
}

export function createScrollAnimation(
  target: MaybeElement,
  options: ScrollAnimationOptions = {}
) {
  if (!import.meta.client || prefersReducedMotion() || !target) {
    return () => undefined
  }

  const { gsap, ScrollTrigger } = setupGsap()
  const kind = options.kind ?? 'fade-up'
  const start = options.start ?? 'top 80%'
  const ctx = gsap.context(() => {
    if (kind === 'image-reveal') {
      const image = target.querySelector('img') ?? target

      gsap.set(target, {
        clipPath: 'inset(100% 0 0 0)',
        willChange: 'clip-path'
      })
      gsap.set(image, {
        scale: 1.1,
        willChange: 'transform'
      })

      gsap.to(target, {
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: target,
          start,
          once: options.once ?? true
        },
        onComplete: () => cleanupWillChange([target, image])
      })

      gsap.to(image, {
        scale: 1,
        duration: 1.25,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: target,
          start,
          once: options.once ?? true
        }
      })

      return
    }

    if (kind === 'parallax') {
      const image = target.querySelector('img') ?? target

      gsap.to(image, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: target,
          start: options.start ?? 'top bottom',
          end: options.end ?? 'bottom top',
          scrub: options.scrub ?? 1.5
        }
      })

      return
    }

    if (kind === 'split-lines') {
      const lines = target.querySelectorAll<HTMLElement>('[data-split-line]')

      gsap.fromTo(
        lines,
        { yPercent: 100, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          stagger: options.stagger ?? 0.08,
          scrollTrigger: {
            trigger: target,
            start,
            once: options.once ?? true
          }
        }
      )

      return
    }

    gsap.fromTo(
      target,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: target,
          start,
          once: options.once ?? true
        },
        onStart: () => gsap.set(target, { willChange: 'transform, opacity' }),
        onComplete: () => cleanupWillChange(target)
      }
    )
  }, target)

  ScrollTrigger.refresh()

  return () => ctx.revert()
}

export function useElementScrollAnimation(
  target: Ref<MaybeElement> | MaybeElement,
  options: ScrollAnimationOptions = {}
) {
  let cleanup: (() => void) | undefined

  onMounted(() => {
    cleanup = createScrollAnimation(resolveTarget(target), options)
  })

  onUnmounted(() => {
    cleanup?.()
  })
}

export function initPremiumScrollAnimations(root: ParentNode = document) {
  if (!import.meta.client || prefersReducedMotion()) {
    return () => undefined
  }

  const { gsap, ScrollTrigger } = setupGsap()
  const ctx = gsap.context(() => {
    const revealItems = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll('[data-anim="stagger-item"]')
    )

    ScrollTrigger.batch(revealItems, {
      start: 'top 86%',
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out'
        })
      }
    })

    root
      .querySelectorAll<HTMLElement>('[data-anim="image-reveal"]')
      .forEach((element) => createScrollAnimation(element, { kind: 'image-reveal' }))

    root
      .querySelectorAll<HTMLElement>('[data-anim="parallax-media"]')
      .forEach((element) => createScrollAnimation(element, { kind: 'parallax' }))
  })

  ScrollTrigger.refresh()

  return () => ctx.revert()
}
