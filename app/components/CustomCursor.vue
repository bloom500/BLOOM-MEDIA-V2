<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const x = ref(-100)
const y = ref(-100)
const mode = ref('dot') // 'dot' | 'caret' | 'link'
const caretH = ref(20)
const isDesktop = ref(false)

const cursorDark = useState('cursorDark', () => false)

const move = (e) => {
  x.value = e.clientX
  y.value = e.clientY
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

const caretHeightCache = new WeakMap()
let lastTarget = null

const onOver = (e) => {
  const target = e.target
  if (!target || target === lastTarget) return
  lastTarget = target

  if (target.closest('a, button, [role="button"], input, select, textarea')) {
    mode.value = 'link'
    return
  }

  const textEl = nearestTextEl(target)
  if (textEl) {
    let h = caretHeightCache.get(textEl)
    if (h === undefined) {
      const st = window.getComputedStyle(textEl)
      const fs = parseFloat(st.fontSize)
      const lhRaw = st.lineHeight
      const lh = lhRaw === 'normal' ? fs * 1.2 : parseFloat(lhRaw)
      h = Math.round(isNaN(lh) ? fs * 1.2 : lh)
      caretHeightCache.set(textEl, h)
    }
    caretH.value = h
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
  // Cursorul nativ se ascunde DOAR după ce componenta a montat și doar
  // pentru pointer fin fără reduced-motion — dacă JS pică, cursorul rămâne.
  isDesktop.value = window.matchMedia('(pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!isDesktop.value) return

  document.documentElement.classList.add('has-custom-cursor')
  window.addEventListener('mousemove', move, { passive: true })
  document.addEventListener('mouseover', onOver)
})

onUnmounted(() => {
  if (!import.meta.client) return
  document.documentElement.classList.remove('has-custom-cursor')
  window.removeEventListener('mousemove', move)
  document.removeEventListener('mouseover', onOver)
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
/* Clasa e pusă de componentă la mount — fără JS, cursorul nativ rămâne. */
html.has-custom-cursor * { cursor: none !important; }

.cursor {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 99999;
  will-change: transform;
  transition:
    width 0.14s ease,
    height 0.14s ease,
    border-radius 0.14s ease,
    background 0.3s ease;
}
</style>
