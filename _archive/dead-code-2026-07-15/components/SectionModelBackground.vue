<template>
  <ClientOnly>
    <Suspense>
      <SectionModelCanvasAsync v-bind="props" />
      <template #fallback>
        <div
          class="section-model-bg section-model-bg--fallback"
          :class="className"
          aria-hidden="true"
        />
      </template>
    </Suspense>
  </ClientOnly>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const SectionModelCanvasAsync = defineAsyncComponent({
  loader: () => import('~/components/SectionModelCanvas.vue'),
  suspensible: true,
})

const props = withDefaults(
  defineProps<{
    modelPath: string
    scale?: number
    floatAmplitude?: number
    floatSpeed?: number
    frameFill?: number
    opacity?: number
    className?: string
    horizontalBias?: number
    verticalBias?: number
    modelRotateXDeg?: number
    modelRotateYDeg?: number
    modelRotateZDeg?: number
    visibilityDebug?: boolean
  }>(),
  {
    scale: 1,
    floatAmplitude: 0.015,
    floatSpeed: 0.2,
    frameFill: 1.12,
    opacity: 1,
    className: '',
    horizontalBias: 0,
    verticalBias: 0,
    modelRotateXDeg: 0,
    modelRotateYDeg: 0,
    modelRotateZDeg: 0,
    visibilityDebug: false,
  },
)
</script>

<style scoped>
.section-model-bg--fallback {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}
</style>
