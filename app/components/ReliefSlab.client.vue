<template>
  <div
    ref="containerRef"
    class="relief-slab"
    :style="reliefSlabCssVars"
    aria-hidden="true"
  >
    <canvas ref="canvasRef" class="relief-slab__canvas" />
    <canvas ref="fogCanvasRef" class="relief-fog" aria-hidden="true" />
  </div>
</template>

<script setup>
/**
 * Port în WebGPU/TSL al sketch-ului oficial (Yuri „Akella” Artiukh) — Immersive-Garden style.
 * Sursa: public/models/optimized/Official 3D model/src/{index.ts, trail.js}
 *
 * Tehnica:
 *  - Migrat de la WebGL/GLSL la WebGPURenderer + TSL (Three Shading Language).
 *  - Folosește NodeMaterial pentru a implementa logica de extrude și color mixing.
 */
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import {
  WebGPURenderer,
  NodeMaterial
} from 'three/webgpu'
import {
  Fn,
  vec3,
  vec4,
  texture,
  uv,
  screenUV,
  positionLocal,
  cameraProjectionMatrix,
  modelViewMatrix,
  smoothstep,
  mix,
  uniform,
  cos
} from 'three/tsl'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { TrailCanvas } from '~/utils/trail.js'

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const GLB_PATH = '/models/optimized/original.glb'
const DRACO_DECODER = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/'

const CAMERA_FOV = 30
const CAMERA_Z = 15
const VIEWPORT_COVER = 2.5
const RELIEF_TOP_FRAC = 0.9
const RELIEF_TOP_BLEND = 0.95
const MAX_PIXEL_RATIO = 2
const MODEL_ORIGINAL_OFFSET_Y = 2
const RELIEF_TOP_EXTRA_LIFT_FRAC = 0.11

const RELIEF_SCENE_BG = 0x080808
const RELIEF_SCENE_BG_CSS = `#${RELIEF_SCENE_BG.toString(16).padStart(6, '0')}`
const reliefSlabCssVars = { '--relief-scene-bg': RELIEF_SCENE_BG_CSS }

const RELIEF_FOG_LAYER_OPACITY = 0.95
const FOG_MASK_SCRATCH_MAX_W = 640
const TRAIL_CANVAS_SIZE = 2048
const TRAIL_CIRCLE_RADIUS_MULT_MOUSE = 0.088
const TRAIL_CIRCLE_RADIUS_MULT_GHOST = 0.056
const Z_EXTRUDE_MIN = 0.03
const GHOST_PERIOD_MS = 12000
const GHOST_VIEW_INSET = 0.08
const GHOST_FREQ_Y = 1.618033988749895
const USER_ACTIVE_MS = 2000
const LERP_TRAIL_TO_MOUSE = 0.26
const SCROLL_LERP = 0.22
const SCROLL_PAN_CONTENT_FRAC = 0.96

// ─── REFS / STATE ─────────────────────────────────────────────────────────────

const containerRef = ref(null)
const canvasRef = ref(null)
const fogCanvasRef = ref(null)

let fogMaskScratch = null
let renderer = null
let scene = null
let camera = null
let modelRoot = null
let raf = null
let disposed = false

let trailLayer = null
let trailTexture = null

/** Ultima poziție a pointerului (CSS px). */
const mouse = { x: 0, y: 0 }
let lastRealMouseTime = -1
let trailPaintCss = { x: 0, y: 0 }
let modelBaseY = 0
let modelScrollPanRange = 0
let scrollSmoothed = 0

// Pool for resource tracking
const pool = {
  geometries: new Set(),
  materials: new Set(),
  textures: new Set()
}

function trackResource(res) {
  if (!res) return res
  if (res.isGeometry) pool.geometries.add(res)
  if (res.isMaterial) pool.materials.add(res)
  if (res.isTexture) pool.textures.add(res)
  return res
}

// ─── TRAIL ───────────────────────────────────────────────────────────────────

function cssToTrailBuffer(cssX, cssY) {
  const vw = Math.max(window.innerWidth, 1)
  const vh = Math.max(window.innerHeight, 1)
  const c = trailLayer?.canvas
  const bw = Math.max(1, c?.width ?? 1)
  const bh = Math.max(1, c?.height ?? 1)
  return {
    x: (cssX / vw) * bw,
    y: (cssY / vh) * bh,
  }
}

function ensureTrailLayer() {
  if (!renderer) return false
  const bw = TRAIL_CANVAS_SIZE
  const bh = TRAIL_CANVAS_SIZE

  if (trailLayer && trailLayer.canvas.width === bw && trailLayer.canvas.height === bh) {
    return true
  }

  if (trailTexture) {
    trailTexture.dispose()
    trailTexture = null
  }

  trailLayer = new TrailCanvas(bw, bh)
  trailLayer.setFadeSpeed(0.025)
  trailLayer.setCircleRadius(bw * TRAIL_CIRCLE_RADIUS_MULT_MOUSE)

  trailTexture = trackResource(new THREE.CanvasTexture(trailLayer.getTexture()))
  trailTexture.flipY = false
  trailTexture.colorSpace = THREE.NoColorSpace
  trailTexture.needsUpdate = true

  return true
}

function ghostPointerFraction(phase) {
  const u = phase * Math.PI * 2
  const sx = 0.36 * Math.sin(u * 0.97 + 0.12) + 0.1 * Math.sin(u * 2.21 + 0.73)
  const sy = 0.36 * Math.sin(u * GHOST_FREQ_Y + 0.94) + 0.1 * Math.sin(u * 1.97 + 0.31)
  const nx = Math.min(1, Math.max(0, 0.5 + sx))
  const ny = Math.min(1, Math.max(0, 0.5 + sy))
  const t = GHOST_VIEW_INSET
  const s = 1 - 2 * t
  return { x: t + s * nx, y: t + s * ny }
}

function updateTrailPaintTargetCss() {
  const now = performance.now()
  const vw = Math.max(window.innerWidth, 1)
  const vh = Math.max(window.innerHeight, 1)
  const phase = (now % GHOST_PERIOD_MS) / GHOST_PERIOD_MS
  const g = ghostPointerFraction(phase)
  const ghostX = g.x * vw
  const ghostY = g.y * vh

  const userActive = lastRealMouseTime >= 0 && (now - lastRealMouseTime) < USER_ACTIVE_MS
  if (userActive) {
    const k = LERP_TRAIL_TO_MOUSE
    trailPaintCss.x += (mouse.x - trailPaintCss.x) * k
    trailPaintCss.y += (mouse.y - trailPaintCss.y) * k
  } else {
    trailPaintCss.x = ghostX
    trailPaintCss.y = ghostY
  }
}

function paintReliefFog() {
  const fc = fogCanvasRef.value
  if (!fc) return

  const w = Math.max(1, Math.floor(window.innerWidth))
  const h = Math.max(1, Math.floor(window.innerHeight))
  const dpr = Math.min(window.devicePixelRatio ?? 1, MAX_PIXEL_RATIO)
  const bw = Math.floor(w * dpr)
  const bh = Math.floor(h * dpr)
  if (fc.width !== bw || fc.height !== bh) {
    fc.width = bw
    fc.height = bh
  }

  const ctx = fc.getContext('2d', { alpha: true })
  if (!ctx) return

  const br = (RELIEF_SCENE_BG >> 16) & 255
  const bg = (RELIEF_SCENE_BG >> 8) & 255
  const bb = RELIEF_SCENE_BG & 255

  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1
  ctx.fillStyle = `rgba(${br},${bg},${bb},${RELIEF_FOG_LAYER_OPACITY})`
  ctx.fillRect(0, 0, bw, bh)

  if (!trailLayer) return

  const aspect = bw / bh
  let mw = Math.min(FOG_MASK_SCRATCH_MAX_W, Math.max(256, Math.floor(bw / 2)))
  let mh = Math.max(2, Math.round(mw / aspect))

  if (!fogMaskScratch) fogMaskScratch = document.createElement('canvas')
  if (fogMaskScratch.width !== mw || fogMaskScratch.height !== mh) {
    fogMaskScratch.width = mw
    fogMaskScratch.height = mh
  }

  const mctx = fogMaskScratch.getContext('2d', { willReadFrequently: true })
  if (!mctx) return
  mctx.drawImage(trailLayer.canvas, 0, 0, TRAIL_CANVAS_SIZE, TRAIL_CANVAS_SIZE, 0, 0, mw, mh)

  const id = mctx.getImageData(0, 0, mw, mh)
  const d = id.data
  for (let i = 0; i < d.length; i += 4) {
    const srcA = d[i + 3] / 255
    const extrude = (d[i] / 255) * srcA
    d[i] = 255; d[i + 1] = 255; d[i + 2] = 255
    d[i + 3] = Math.min(255, Math.round(extrude * 255))
  }
  mctx.putImageData(id, 0, 0)

  ctx.globalCompositeOperation = 'destination-out'
  ctx.drawImage(fogMaskScratch, 0, 0, mw, mh, 0, 0, bw, bh)
}

function paintTrail() {
  if (ensureTrailLayer()) {
    updateTrailPaintTargetCss()
    const bw = TRAIL_CANVAS_SIZE
    const userActive = lastRealMouseTime >= 0 && (performance.now() - lastRealMouseTime) < USER_ACTIVE_MS
    trailLayer.setCircleRadius(bw * (userActive ? TRAIL_CIRCLE_RADIUS_MULT_MOUSE : TRAIL_CIRCLE_RADIUS_MULT_GHOST))
    const { x, y } = cssToTrailBuffer(trailPaintCss.x, trailPaintCss.y)
    trailLayer.update({ x, y })
    trailTexture.needsUpdate = true
  }
  paintReliefFog()
}

// ─── TSL LOGIC ───────────────────────────────────────────────────────────────

function createNodeMaterial(child) {
  const material = trackResource(new NodeMaterial())
  const texture1 = child.material.map
  const texture2 = child.material.emissiveMap

  material.positionNode = Fn(() => {
    const pos = positionLocal.toVar()
    const extrude = texture(trailTexture, screenUV).r
    pos.z.mulAssign(mix(Z_EXTRUDE_MIN, 1, extrude))
    return pos
  })()

  material.colorNode = Fn(() => {
    // We mix in Linear space. Modern Three.js textures are usually set to sRGB colorSpace,
    // and texture() TSL node automatically converts them to Linear.
    const tt1 = texture(texture1, uv())
    const tt2 = texture(texture2, uv())
    const extrude = texture(trailTexture, screenUV).r

    let level0 = tt2.b
    let level1 = tt2.g
    let level2 = tt2.r
    let level3 = tt1.b
    let level4 = tt1.g
    let level5 = tt1.r

    let final = level0
    final = mix(final, level1, smoothstep(0, 0.2, extrude))
    final = mix(final, level2, smoothstep(0.2, 0.4, extrude))
    final = mix(final, level3, smoothstep(0.4, 0.6, extrude))
    final = mix(final, level4, smoothstep(0.6, 0.8, extrude))
    final = mix(final, level5, smoothstep(0.8, 1, extrude))

    return vec4(vec3(final), 1)
  })()

  return material
}

// ─── MODEL FIT ───────────────────────────────────────────────────────────────

function fitModelToViewport() {
  if (!modelRoot || !camera) return
  modelRoot.position.set(0, 0, 0)
  modelRoot.scale.setScalar(1)
  modelRoot.updateMatrixWorld(true)

  const box = new THREE.Box3().setFromObject(modelRoot)
  const center = box.getCenter(new THREE.Vector3())
  modelRoot.position.sub(center)
  modelRoot.updateMatrixWorld(true)

  const sizeBox = new THREE.Box3().setFromObject(modelRoot)
  const size = sizeBox.getSize(new THREE.Vector3())

  const dist = camera.position.z
  const fovRad = (camera.fov * Math.PI) / 180
  const visibleH = 2 * dist * Math.tan(fovRad / 2)
  const visibleW = visibleH * camera.aspect

  const sx = visibleW / Math.max(size.x, 1e-6)
  const sy = visibleH / Math.max(size.y, 1e-6)
  const scale = Math.max(sx, sy) * VIEWPORT_COVER
  modelRoot.scale.setScalar(scale)
  modelRoot.updateMatrixWorld(true)

  const fitBox = new THREE.Box3().setFromObject(modelRoot)
  const halfVisibleH = visibleH / 2
  const topTargetY = halfVisibleH * RELIEF_TOP_FRAC
  const topDelta = topTargetY - fitBox.max.y
  modelRoot.position.y += topDelta * RELIEF_TOP_BLEND
  modelRoot.position.y += MODEL_ORIGINAL_OFFSET_Y
  modelRoot.position.y += visibleH * RELIEF_TOP_EXTRA_LIFT_FRAC

  modelRoot.updateMatrixWorld(true)
  modelBaseY = modelRoot.position.y

  const panBox = new THREE.Box3().setFromObject(modelRoot)
  const bboxH = panBox.max.y - panBox.min.y
  const travel = Math.max(0, bboxH - visibleH)
  modelScrollPanRange = travel * SCROLL_PAN_CONTENT_FRAC
}

// ─── INIT ────────────────────────────────────────────────────────────────────

function onResize() {
  if (!renderer || !camera) return
  const w = window.innerWidth
  const h = window.innerHeight
  renderer.setSize(w, h, false)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  fitModelToViewport()
}

async function initScene(canvas) {
  renderer = new WebGPURenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  })
  renderer.setClearColor(new THREE.Color(RELIEF_SCENE_BG), 1)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO))
  renderer.setSize(window.innerWidth, window.innerHeight, false)
  await renderer.init()

  scene = new THREE.Scene()
  scene.background = new THREE.Color(RELIEF_SCENE_BG)

  camera = new THREE.PerspectiveCamera(CAMERA_FOV, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0, CAMERA_Z)
  camera.lookAt(0, 0, 0)

  ensureTrailLayer()

  const draco = new DRACOLoader()
  draco.setDecoderPath(DRACO_DECODER)
  const loader = new GLTFLoader()
  loader.setDRACOLoader(draco)

  const gltf = await loader.loadAsync(GLB_PATH)
  modelRoot = gltf.scene

  modelRoot.traverse((child) => {
    if (child.isMesh) {
      trackResource(child.geometry)
      // Original materials/textures from GLTF loader are also resources
      if (child.material.map) trackResource(child.material.map)
      if (child.material.emissiveMap) trackResource(child.material.emissiveMap)
      trackResource(child.material)

      child.material = createNodeMaterial(child)
    }
  })

  scene.add(modelRoot)
  fitModelToViewport()
}

// ─── LOOP ────────────────────────────────────────────────────────────────────

function tick() {
  if (disposed) return
  raf = requestAnimationFrame(tick)

  paintTrail()

  if (modelRoot && camera) {
    const scrollTarget = window.scrollY
    scrollSmoothed += (scrollTarget - scrollSmoothed) * SCROLL_LERP
    const scrollH = document.documentElement.scrollHeight
    const vh = window.innerHeight
    const scrollMax = Math.max(1, scrollH - vh)
    const t = Math.min(Math.max(scrollSmoothed / scrollMax, 0), 1)
    modelRoot.position.y = modelBaseY + t * modelScrollPanRange
  }

  renderer.render(scene, camera)
}

// ─── LIFECYCLE ───────────────────────────────────────────────────────────────

function onPointerMove(e) {
  mouse.x = e.clientX
  mouse.y = e.clientY
  lastRealMouseTime = performance.now()
}

onMounted(async () => {
  if (!import.meta.client) return
  const canvas = canvasRef.value

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })

  await initScene(canvas)

  scrollSmoothed = window.scrollY
  trailPaintCss.x = window.innerWidth * 0.5
  trailPaintCss.y = window.innerHeight * 0.5

  raf = requestAnimationFrame(tick)
})

onUnmounted(() => {
  disposed = true
  if (raf) cancelAnimationFrame(raf)

  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('resize', onResize)

  renderer?.dispose()

  // Exhaustive resource cleanup
  pool.geometries.forEach(g => g.dispose())
  pool.materials.forEach(m => m.dispose())
  pool.textures.forEach(t => t.dispose())
  pool.geometries.clear()
  pool.materials.clear()
  pool.textures.clear()

  if (trailLayer) {
    trailLayer = null
  }
})
</script>

<style scoped>
.relief-slab {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background: var(--relief-scene-bg);
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.relief-slab__canvas {
  position: relative;
  z-index: 0;
  display: block;
  width: 100%;
  height: 100%;
}

.relief-fog {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}
</style>
