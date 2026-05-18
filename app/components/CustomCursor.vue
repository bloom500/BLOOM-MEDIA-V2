<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const x = ref(-100)
const y = ref(-100)
const mode = ref('dot') // 'dot' | 'caret' | 'link'
const caretH = ref(20)
const isDesktop = ref(false)

// Written by FooterReveal when the black curtain covers the screen
const cursorDark = useState('cursorDark', () => false)

let raf

const move = (e) => {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    x.value = e.clientX
    y.value = e.clientY
  })
}

const TEXT_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'SPAN', 'LI', 'TD', 'TH', 'LABEL', 'BLOCKQUOTE', 'FIGCAPTION'])

function nearestTextEl(el) {
  let node = el
  while (node && node !== document.body) {
    if (TEXT_TAGS.has(node.tagName)) return node
    node = node.parentElement
  }
  return null
}

const onOver = (e) => {
  const target = e.target
  if (!target) return

  if (target.closest('a, button, [role="button"], input, select, textarea')) {
    mode.value = 'link'
    return
  }

  const textEl = nearestTextEl(target)
  if (textEl) {
    const st = window.getComputedStyle(textEl)
    const fs = parseFloat(st.fontSize)
    const lhRaw = st.lineHeight
    const lh = lhRaw === 'normal' ? fs * 1.2 : parseFloat(lhRaw)
    caretH.value = Math.round(isNaN(lh) ? fs * 1.2 : lh)
    mode.value = 'caret'
    return
  }

  mode.value = 'dot'
}

const cursorStyle = computed(() => {
  const isCaret = mode.value === 'caret'
  const isLink = mode.value === 'link'
  return {
    transform: `translate(${x.value}px, ${y.value}px) translate(-50%, -50%)`,
    width: isCaret ? '2px' : isLink ? '18px' : '12px',
    height: isCaret ? `${caretH.value}px` : isLink ? '18px' : '12px',
    borderRadius: isCaret ? '1px' : '50%',
    background: cursorDark.value ? '#ffffff' : '#1A1814',
  }
})

onMounted(() => {
  if (!import.meta.client) return
  isDesktop.value = window.matchMedia('(pointer: fine)').matches
  if (!isDesktop.value) return

  window.addEventListener('mousemove', move, { passive: true })
  document.addEventListener('mouseover', onOver)
})

onUnmounted(() => {
  if (!import.meta.client) return
  window.removeEventListener('mousemove', move)
  document.removeEventListener('mouseover', onOver)
  cancelAnimationFrame(raf)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isDesktop"
      class="cursor"
      :style="cursorStyle"
    />
  </Teleport>
</template>

<style>
@media (pointer: fine) {
  * { cursor: none !important; }
}

.cursor {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 99999;
  will-change: transform, width, height;
  transition:
    width 0.14s ease,
    height 0.14s ease,
    border-radius 0.14s ease,
    background 0.3s ease;
}
</style>
