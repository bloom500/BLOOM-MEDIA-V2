<template>
  <div class="cursor" :class="{ 'cursor--active': isActive, 'cursor--view': label === 'VIEW' }" aria-hidden="true">
    <span ref="dotRef" class="cursor__dot" />
    <span ref="followerRef" class="cursor__follower">
      <span class="cursor__label">{{ label }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const dotRef = ref<HTMLElement | null>(null)
const followerRef = ref<HTMLElement | null>(null)
const isActive = ref(false)
const label = ref('')

let raf = 0
let targetX = 0
let targetY = 0
let dotX = 0
let dotY = 0
let followerX = 0
let followerY = 0

function lerp(current: number, target: number, amount: number) {
  return current + (target - current) * amount
}

function render() {
  dotX = lerp(dotX, targetX, 0.32)
  dotY = lerp(dotY, targetY, 0.32)
  followerX = lerp(followerX, targetX, 0.18)
  followerY = lerp(followerY, targetY, 0.18)

  if (dotRef.value) {
    dotRef.value.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`
  }

  if (followerRef.value) {
    followerRef.value.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`
  }

  raf = requestAnimationFrame(render)
}

function onPointerMove(event: PointerEvent) {
  targetX = event.clientX
  targetY = event.clientY
}

function onPointerOver(event: PointerEvent) {
  const target = event.target as HTMLElement | null

  if (!target) {
    return
  }

  const interactive = target.closest('a, button, summary, [role="button"], input, textarea, select')
  const projectMedia = target.closest('[data-cursor="view"], [data-anim="image-reveal"], .service, .why-item')

  isActive.value = Boolean(interactive || projectMedia)
  label.value = projectMedia ? 'VIEW' : ''
}

function onPointerOut(event: PointerEvent) {
  const related = event.relatedTarget as HTMLElement | null

  if (related?.closest?.('a, button, summary, [role="button"], input, textarea, select, [data-cursor="view"], [data-anim="image-reveal"], .service, .why-item')) {
    return
  }

  isActive.value = false
  label.value = ''
}

onMounted(() => {
  if (!import.meta.client || window.matchMedia('(pointer: coarse)').matches) {
    return
  }

  targetX = window.innerWidth * 0.5
  targetY = window.innerHeight * 0.5
  dotX = targetX
  dotY = targetY
  followerX = targetX
  followerY = targetY

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('pointerover', onPointerOver)
  document.addEventListener('pointerout', onPointerOut)
  raf = requestAnimationFrame(render)
})

onUnmounted(() => {
  window.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerover', onPointerOver)
  document.removeEventListener('pointerout', onPointerOut)
  cancelAnimationFrame(raf)
})
</script>

<style scoped>
.cursor {
  position: fixed;
  inset: 0;
  z-index: 9998;
  pointer-events: none;
  display: none;
}

.cursor__dot,
.cursor__follower {
  position: fixed;
  left: 0;
  top: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  pointer-events: none;
  transform: translate3d(-100px, -100px, 0);
  will-change: transform;
}

.cursor__dot {
  width: 8px;
  height: 8px;
  margin-left: -4px;
  margin-top: -4px;
  background: var(--color-text);
}

.cursor__follower {
  width: 40px;
  height: 40px;
  margin-left: -20px;
  margin-top: -20px;
  border: 1px solid var(--color-border-strong);
  color: var(--color-bg);
  transition:
    width 0.35s var(--ease-2),
    height 0.35s var(--ease-2),
    margin 0.35s var(--ease-2),
    background-color 0.35s var(--ease-2),
    border-color 0.35s var(--ease-2);
}

.cursor--active .cursor__follower {
  width: 80px;
  height: 80px;
  margin-left: -40px;
  margin-top: -40px;
  background: var(--color-text);
  border-color: var(--color-text);
  mix-blend-mode: difference;
}

.cursor__label {
  opacity: 0;
  font-family: var(--font-body);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  transition: opacity 0.2s ease;
}

.cursor--view .cursor__label {
  opacity: 1;
}

@media (hover: hover) and (pointer: fine) {
  .cursor {
    display: block;
  }
}
</style>
