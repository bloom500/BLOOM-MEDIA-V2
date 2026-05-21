<template>
  <canvas ref="canvasRef" class="svc-bg-canvas" aria-hidden="true" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

const canvasRef = ref<HTMLCanvasElement | null>(null)

let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let model: THREE.Object3D | null = null
let meshChildren: THREE.Mesh[] = []
let animFrame: number
let clock: THREE.Clock

// Hover state
let isHovering = false
let hoverStrength = 0       // lerps 0→1 on hover enter, 1→0 on leave
let hoverX = 0              // normalized cursor for subtle parallax
let hoverDecayTimer: ReturnType<typeof setTimeout> | null = null
const HOVER_IDLE_MS = 600    // after this many ms without movement, treat as not hovering

// Each mesh gets a stable noise seed based on its index
const meshSeeds: number[] = []

/*
 * iOS browser-bar fix — same pattern as ReliefSlab/HeroSection. On mobile
 * we freeze the canvas size at mount so iOS bar collapse/expand doesn't
 * trigger setSize() + camera.aspect rebuild on every scroll-direction
 * change (which was making the flowers visibly grow/shrink).
 */
let frozenWidth = 0
let frozenHeight = 0
let isMobileLayout = false

function onMouseMove(e: MouseEvent) {
  hoverX = (e.clientX / window.innerWidth) * 2 - 1
  isHovering = true
  // Cancel any pending decay; arm a new one. After HOVER_IDLE_MS without
  // a fresh mousemove, isHovering flips back to false so the per-mesh
  // sway animation drains to zero (otherwise petals jitter forever even
  // with the cursor parked still inside the page).
  if (hoverDecayTimer) clearTimeout(hoverDecayTimer)
  hoverDecayTimer = setTimeout(() => { isHovering = false }, HOVER_IDLE_MS)
}
function onMouseLeave() {
  isHovering = false
  if (hoverDecayTimer) { clearTimeout(hoverDecayTimer); hoverDecayTimer = null }
}

function onResize() {
  if (!renderer || !camera) return
  // Mobile: ignore bar-collapse resize. Real orientation change has its
  // own handler that re-measures from scratch.
  if (isMobileLayout && window.innerWidth === frozenWidth) return

  const w = window.innerWidth
  const h = isMobileLayout ? frozenHeight : window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

function onOrientation() {
  // Two RAFs: iOS reports stale dims on the orientationchange event itself.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (!renderer || !camera) return
    frozenWidth = window.innerWidth
    frozenHeight = window.innerHeight
    camera.aspect = frozenWidth / frozenHeight
    camera.updateProjectionMatrix()
    renderer.setSize(frozenWidth, frozenHeight)
  }))
}

onMounted(() => {
  const canvas = canvasRef.value!
  clock = new THREE.Clock()

  isMobileLayout = window.matchMedia('(max-width: 768px)').matches
    || window.matchMedia('(pointer: coarse)').matches
  frozenWidth = window.innerWidth
  frozenHeight = window.innerHeight

  // ── Renderer — alpha:false + scene.background = dark, no bleed-through ──
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
  /*
   * On Retina mobile (DPR=3) capping at 2 doubles the work for no
   * perceptible quality gain. Cap to 1.5 there to free GPU budget.
   */
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileLayout ? 1.5 : 2))
  renderer.setSize(frozenWidth, frozenHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.35

  scene = new THREE.Scene()
  // Match the CSS #000000 used by .configurator and html[data-page="servicii"]
  // so the WebGL canvas and the page background are the same black.
  scene.background = new THREE.Color(0x000000)
  renderer.setClearColor(0x000000, 1)

  camera = new THREE.PerspectiveCamera(45, frozenWidth / frozenHeight, 0.1, 100)
  camera.position.set(0, 0, 5)
  camera.lookAt(0, 0, 0)

  // ── Lighting ──────────────────────────────────────────────────
  // Warm key — top-left, strong to reveal texture
  const key = new THREE.DirectionalLight(0xfff5e0, 4.5)
  key.position.set(-3, 6, 5)
  scene.add(key)

  // Cool fill — softens shadows
  const fill = new THREE.DirectionalLight(0xd0e8ff, 1.5)
  fill.position.set(5, 1, 2)
  scene.add(fill)

  // Rim — separates model from dark bg
  const rim = new THREE.DirectionalLight(0xffddbb, 2.0)
  rim.position.set(0, -4, -6)
  scene.add(rim)

  // Bottom fill — eliminates pure black shadows
  const bot = new THREE.DirectionalLight(0xfff0e8, 0.8)
  bot.position.set(0, -5, 3)
  scene.add(bot)

  scene.add(new THREE.AmbientLight(0xfff8f0, 1.2))

  // ── Load GLB ──────────────────────────────────────────────────
  const draco = new DRACOLoader()
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')

  const loader = new GLTFLoader()
  loader.setDRACOLoader(draco)

  loader.load(
    '/flowers_opt.glb',
    (gltf) => {
      model = gltf.scene

      /*
       * Slightly larger than viewport height, biased right and up so the
       * catalogue column on the left stays clean. Bleeds off the right edge
       * as negative space framing.
       */
      const box = new THREE.Box3().setFromObject(model)
      const center = new THREE.Vector3()
      const size   = new THREE.Vector3()
      box.getCenter(center)
      box.getSize(size)

      const targetSize = 2.7
      const scale = targetSize / Math.max(size.x, size.y, size.z)
      model.scale.setScalar(scale)

      // Decorative accent positioned in the only true dead-zone of this
      // layout: between the headline/subtitle (top-left) and the accordion
      // list, slightly right of center to avoid the catalogue column on
      // the left and the form column on the right.
      // Camera z=5, FOV 45° → vertical frustum ±2.07, horizontal ±3.68 (16:9).
      const offsetX =  0.4
      const offsetY =  0.3
      model.position.set(
        -center.x * scale + offsetX,
        -center.y * scale + offsetY,
        -center.z * scale
      )

      // Atmospheric opacity — petals become depth/lighting, not foreground.
      // depthWrite stays TRUE to avoid Z-fighting between overlapping petals.
      model.traverse((child) => {
        const mesh = child as THREE.Mesh
        if (!mesh.isMesh) return
        meshChildren.push(mesh)
        meshSeeds.push(Math.random() * Math.PI * 2)
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        for (const m of mats) {
          if (!m) continue
          const mat = m as THREE.Material & { opacity?: number, transparent?: boolean, depthWrite?: boolean, needsUpdate?: boolean }
          mat.transparent = true
          if (typeof mat.opacity === 'number') mat.opacity = 0.55
          mat.depthWrite = true
          mat.needsUpdate = true
        }
      })

      scene.add(model)
    },
    undefined,
    (err) => console.error('[ServiciiBackground] load error:', err)
  )

  // ── Events ────────────────────────────────────────────────────
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('mouseleave', onMouseLeave, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('orientationchange', onOrientation, { passive: true })

  // ── Render loop ───────────────────────────────────────────────
  function tick() {
    animFrame = requestAnimationFrame(tick)
    // Skip work when tab is hidden — browser throttles rAF anyway, this
    // ensures no GPU commit / WebGL state changes during background.
    if (typeof document !== 'undefined' && document.hidden) return
    const t = clock.getElapsedTime()

    // Lerp hover strength
    hoverStrength += ((isHovering ? 1 : 0) - hoverStrength) * 0.06

    if (model && meshChildren.length > 0) {
      // Very subtle whole-model parallax with cursor — only when hovering
      model.rotation.y += (hoverX * 0.08 - model.rotation.y) * 0.04
      model.rotation.x += (0 - model.rotation.x) * 0.04  // always returns to 0

      // Per-mesh sway — activates with hoverStrength
      meshChildren.forEach((mesh, i) => {
        const seed = meshSeeds[i] ?? 0
        // Each petal gets a unique phase, frequency and axis mix
        const wave = Math.sin(t * 1.8 + seed) * 0.018
        const wave2 = Math.cos(t * 2.3 + seed * 1.4) * 0.012

        mesh.rotation.z += (wave * hoverStrength - mesh.rotation.z) * 0.08
        mesh.rotation.x += (wave2 * hoverStrength - mesh.rotation.x) * 0.08
      })
    }

    renderer.render(scene, camera)
  }
  tick()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animFrame)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseleave', onMouseLeave)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('orientationchange', onOrientation)
  if (hoverDecayTimer) { clearTimeout(hoverDecayTimer); hoverDecayTimer = null }
  meshChildren = []
  renderer?.dispose()
})
</script>

<style scoped>
.svc-bg-canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100%;
  /* svh = stable; canvas size doesn't track iOS bar collapse */
  height: 100svh;
  display: block;
  pointer-events: none;
}
</style>
