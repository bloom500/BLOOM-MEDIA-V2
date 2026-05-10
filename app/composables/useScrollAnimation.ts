import type { Ref } from 'vue'
import {
  type ScrollAnimationOptions,
  useElementScrollAnimation
} from '~/lib/animations/scroll'

type MaybeElement = HTMLElement | SVGElement | null | undefined

export function useScrollAnimation(
  target: Ref<MaybeElement> | MaybeElement,
  options: ScrollAnimationOptions = {}
) {
  useElementScrollAnimation(target, options)
}
