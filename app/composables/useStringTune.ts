import { onMounted, onUnmounted } from 'vue'
import { getStringTune, initStringTune, refreshStringTune } from '~/lib/stringtune/client'

type StringTuneEventHandler<T = unknown> = (payload: T) => void

export function useStringTune() {
  onMounted(() => {
    initStringTune()
  })

  return {
    getStringTune,
    refreshStringTune
  }
}

export function useStringTuneEvent<T = unknown>(
  eventName: string,
  handler: StringTuneEventHandler<T>
) {
  onMounted(() => {
    const tune = initStringTune()
    tune?.on(eventName, handler as StringTuneEventHandler)
  })

  onUnmounted(() => {
    getStringTune()?.off(eventName, handler as StringTuneEventHandler)
  })
}
