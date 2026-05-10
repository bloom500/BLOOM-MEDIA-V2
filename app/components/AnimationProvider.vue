<template>
  <slot />
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { initPremiumScrollAnimations } from '~/lib/animations/scroll'
import { initStringTune, refreshStringTune, resetStringTuneScroll } from '~/lib/stringtune/client'

const route = useRoute()
let cleanupAnimations: (() => void) | undefined

async function bootAnimations() {
  await nextTick()

  if (!import.meta.client) {
    return
  }

  initStringTune({
    loadingTimeout: 450
  })

  cleanupAnimations?.()
  cleanupAnimations = initPremiumScrollAnimations(document)
  refreshStringTune()
}

onMounted(() => {
  void bootAnimations()
})

watch(
  () => route.fullPath,
  async () => {
    resetStringTuneScroll()
    await bootAnimations()
  }
)

onUnmounted(() => {
  cleanupAnimations?.()
})
</script>
