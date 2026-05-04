<template>
  <div class="app-root">
    <TheNavbar />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick } from 'vue'

onMounted(async () => {
  await nextTick()

  if (!import.meta.client) {
    return
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  const {
    StringTune,
    StringProgress,
    StringSplit,
    StringParallax
  } = await import('@fiddle-digital/string-tune')

  const st = StringTune.getInstance()
  st.use(StringProgress)
  st.use(StringSplit)
  st.use(StringParallax)
  st.start(60)

  ;(window as unknown as { __stringTune?: unknown }).__stringTune = st
})
</script>

<style>
.app-root {
  min-height: 100%;
}
</style>
