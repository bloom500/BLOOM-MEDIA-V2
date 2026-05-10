<template>
  <component :is="tag" ref="rootRef" class="split-text">
    <span
      v-for="(line, index) in lines"
      :key="`${line}-${index}`"
      class="split-text__line-wrap"
    >
      <span class="split-text__line" data-split-line>{{ line }}</span>
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useScrollAnimation } from '~/composables/useScrollAnimation'

const props = withDefaults(defineProps<{
  text: string
  tag?: string
}>(), {
  tag: 'span'
})

const rootRef = ref<HTMLElement | null>(null)
const lines = computed(() => props.text.split(/\n|(?<=\.)\s+/).filter(Boolean))

useScrollAnimation(rootRef, {
  kind: 'split-lines',
  start: 'top 82%'
})
</script>

<style scoped>
.split-text {
  display: block;
}

.split-text__line-wrap {
  display: block;
  overflow: hidden;
}

.split-text__line {
  display: block;
  will-change: transform, opacity;
}
</style>
