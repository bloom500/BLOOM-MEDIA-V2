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
 * Port în WebGL/GLSL al sketch-ului oficial (Yuri „Akella” Artiukh) — Immersive-Garden style.
 * Sursa: public/models/optimized/Official 3D model/src/{index.ts, trail.js}
 *
 * Tehnica:
 *  - Toate detaliile lumină + relief sunt PRE-RENDERATE (baked) în 6 canale (2 texturi RGB):
 *      tt2 = emissiveMap   → b = level0 (cel mai „plat”), g = level1, r = level2
 *      tt1 = baseColorMap  → b = level3,                  g = level4, r = level5 (cel mai „extrudat”)
 *  - Trail: Official trail.js + canvas 2048² (settings.dimensions); fade 0.025, rază width×0.12.
 *  - VERTEX / FRAGMENT: extrude din trail, Z mix(0.03,1.,extrude); nivele _l0…_l5 ca în index.ts.
 *  - .relief-fog = canvas 2D: același trail ca uTrail (Yuri) taie uniform fog-ul (destination-out), nu spotlight separat.
 *  - Input: WebGLRenderer + ShaderMaterial (același comportament, alt pipeline decât WebGPU).
 */
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { TrailCanvas } from '~/utils/trail.js'

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const GLB_PATH = '/models/optimized/original.glb'
const DRACO_DECODER = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/'

/** Camera ca în sketch-ul original */
const CAMERA_FOV = 30
const CAMERA_Z = 15

/**
 * Overflow mare: bbox mult peste frustum pe toate laturile — marginile mesh rămân în afara ecranului
 * la orice t∈[0,1] de scroll (relief „infinit” vizual).
 */
const VIEWPORT_COVER = 2.5
/**
 * Ținta pe Y pentru vârful bbox (fracție din semi-înălțimea vizibilă, de la centru spre marginea de sus).
 * RELIEF_TOP_BLEND amestecă această țintă cu centrarea verticală: 0 = centrat pe ecran, 1 = aliniere completă sus.
 * Prea mare → muchia de sus a mesh-ului / capătul GLB-ului devine vizibil sub navbar.
 */
/** Scroll=0: marginea de sus a viewport-ului lângă zona păsărilor (bbox.max.y → +halfVisibleH). */
const RELIEF_TOP_FRAC = 0.9
const RELIEF_TOP_BLEND = 0.95
const MAX_PIXEL_RATIO = 2

/** Ca în Official 3D model/src/index.ts după load: `model.position.set(0, 2, 0)`. */
const MODEL_ORIGINAL_OFFSET_Y = 2
/** Ridică mesh-ul cu o fracțiune din înălțimea frustum-ului — acoperă banda sub navbar unde se vedea „golul”. */
const RELIEF_TOP_EXTRA_LIFT_FRAC = 0.11

/** Clear + scene.background + CSS wrapper/canvas — același hex ca _l0 vizual. */
const RELIEF_SCENE_BG = 0xa8a6a2
const RELIEF_SCENE_BG_CSS = `#${RELIEF_SCENE_BG.toString(16).padStart(6, '0')}`
const reliefSlabCssVars = { '--relief-scene-bg': RELIEF_SCENE_BG_CSS }

/** Alpha strat fog înainte de tăierea cu trail (uniform peste viewport). */
const RELIEF_FOG_LAYER_OPACITY = 0.95
/** Lățime scratch pentru maparea trail→mask (getImageData); păstrează aspect viewport. */
const FOG_MASK_SCRATCH_MAX_W = 640

/** Dimensiune trail canvas — SketchSettings.dimensions [2048, 2048] din index.ts. */
const TRAIL_CANVAS_SIZE = 2048

/** Ca positionNode: pos.z *= mix(0.03, 1., extrude) */
const Z_EXTRUDE_MIN = 0.03

/** Durată ciclu ghost — ca duration: 6_000 ms în index.ts (playhead). */
const GHOST_PERIOD_MS = 6000
/** Margine față de marginile viewport-ului (0–1), ca pensula să nu „șteargă” la colțuri. */
const GHOST_VIEW_INSET = 0.08
/** Raport „auriu” pentru axa Y — traiectorie Lissajous, nu cerc. */
const GHOST_FREQ_Y = 1.618033988749895

/** După ultimul pointer, cât timp urmărim mouse-ul înainte de ghost (ms). */
const USER_ACTIVE_MS = 2000
/** Lerp doar pentru pointer real; ghost urmează tutorialul (poziție directă, fără lerp). */
const LERP_TRAIL_TO_MOUSE = 0.26

/**
 * Urmărește window.scrollY: coef. mai mare = mai puțin lag față de text/conținut (aceeași țintă ca StringTune).
 */
const SCROLL_LERP = 0.22
/**
 * Din călătoria verticală (bboxH − visibleH) folosim aproape totul pe [0,1] scroll,
 * cu ~4% rezervă la capete ca să nu atingem niciodată muchia reală a GLB-ului (float + parallax).
 */
const SCROLL_PAN_CONTENT_FRAC = 0.96

// ─── REFS / STATE ─────────────────────────────────────────────────────────────

const containerRef = ref(null)
const canvasRef = ref(null)
const fogCanvasRef = ref(null)

/** Canvas mic: trail scalat + conversie R→alpha pentru destination-out pe fog. */
let fogMaskScratch = null

let renderer = null
let scene = null
let camera = null
let modelRoot = null
let raf = null
let disposed = false

let trailLayer = null
let trailTexture = null

const sharedUniforms = {
  uTrail: { value: null },
  uResolution: { value: new THREE.Vector2(1, 1) },
}

const reliefMaterials = []
const pool = { geometries: [], materials: [], textures: new Set() }

/** Ultima poziție a pointerului (CSS px). */
const mouse = { x: 0, y: 0 }
/** performance.now() la ultimul pointer; < 0 = încă nu s-a mișcat → doar ghost. */
let lastRealMouseTime = -1

/** Poziție netezită (CSS px) pentru trail — lerp mouse sau orbită ghost. */
let trailPaintCss = { x: 0, y: 0 }

/** Poziție Y la scroll 0 (încadrare pasări / partea de sus a reliefului). */
let modelBaseY = 0
/** Amplitudine pan pe Y (world): modelBaseY + t * modelScrollPanRange, t ∈ [0,1]. */
let modelScrollPanRange = 0
/** Scroll Y netezit (px). */
let scrollSmoothed = 0

// ─── TRAIL ───────────────────────────────────────────────────────────────────

/** Coordonate CSS (viewport) → pixeli în canvas trail (2048×2048). */
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

function configureTrailThreeTexture(tex) {
  tex.flipY = false
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  tex.generateMipmaps = false
  tex.colorSpace = THREE.NoColorSpace
  tex.needsUpdate = true
}

/** TrailCanvas 2048×2048 fix (ca Yuri); textura Three se recreează doar dacă lipsește sau dimensiunea s-a schimbat. */
function ensureTrailLayer() {
  if (!renderer) return false
  const bw = TRAIL_CANVAS_SIZE
  const bh = TRAIL_CANVAS_SIZE

  if (trailLayer && trailLayer.canvas.width === bw && trailLayer.canvas.height === bh) {
    trailLayer.setFadeSpeed(0.025)
    trailLayer.setCircleRadius(bw * 0.12)
    return true
  }

  if (trailTexture) {
    pool.textures.delete(trailTexture)
    trailTexture.dispose()
    trailTexture = null
  }

  trailLayer = new TrailCanvas(bw, bh)
  trailLayer.setFadeSpeed(0.025)
  trailLayer.setCircleRadius(bw * 0.12)
  trailTexture = new THREE.CanvasTexture(trailLayer.getTexture())
  configureTrailThreeTexture(trailTexture)
  pool.textures.add(trailTexture)
  sharedUniforms.uTrail.value = trailTexture
  return true
}

/**
 * Poziție ghost în fracții de viewport [0,1] — Lissajous + mică a doua harmonică,
 * viteze ușor diferite pe X/Y (nu e cerc); același ciclu la GHOST_PERIOD_MS.
 */
function ghostPointerFraction(phase) {
  const u = phase * Math.PI * 2
  const sx =
    0.36 * Math.sin(u * 0.97 + 0.12) + 0.1 * Math.sin(u * 2.21 + 0.73)
  const sy =
    0.36 * Math.sin(u * GHOST_FREQ_Y + 0.94) + 0.1 * Math.sin(u * 1.97 + 0.31)
  const nx = Math.min(1, Math.max(0, 0.5 + sx))
  const ny = Math.min(1, Math.max(0, 0.5 + sy))
  const t = GHOST_VIEW_INSET
  const s = 1 - 2 * t
  return { x: t + s * nx, y: t + s * ny }
}

/**
 * Ghost: poziție directă din traiectoria de mai sus (fără lerp).
 * Mouse: lerp ușor spre poziția reală.
 */
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

/**
 * Fog peste WebGL: fill culoare + alpha, apoi taie cu același câmp trail ca shader-ul
 * (canal R scalat ca extrude), ca să nu fie spotlight la pointer — ci „spargere” cinematică pe urma pensulei Yuri.
 */
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
  mctx.imageSmoothingEnabled = true
  mctx.imageSmoothingQuality = 'high'
  mctx.drawImage(
    trailLayer.canvas,
    0,
    0,
    TRAIL_CANVAS_SIZE,
    TRAIL_CANVAS_SIZE,
    0,
    0,
    mw,
    mh,
  )

  const id = mctx.getImageData(0, 0, mw, mh)
  const d = id.data
  for (let i = 0; i < d.length; i += 4) {
    const srcA = d[i + 3] / 255
    const extrude = (d[i] / 255) * srcA
    d[i] = 255
    d[i + 1] = 255
    d[i + 2] = 255
    d[i + 3] = Math.min(255, Math.round(extrude * 255))
  }
  mctx.putImageData(id, 0, 0)

  ctx.globalCompositeOperation = 'destination-out'
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(fogMaskScratch, 0, 0, mw, mh, 0, 0, bw, bh)
  ctx.globalCompositeOperation = 'source-over'
}

function paintTrail() {
  if (ensureTrailLayer()) {
    updateTrailPaintTargetCss()
    const { x, y } = cssToTrailBuffer(trailPaintCss.x, trailPaintCss.y)
    trailLayer.update({ x, y })
    trailTexture.needsUpdate = true
  }
  paintReliefFog()
}

// ─── MATERIAL (GLSL pur — port 1:1 al pozițieiNode + colorNode din TSL) ───────

const Z_EXTRUDE_MIN_GLSL = Z_EXTRUDE_MIN.toFixed(4)

const RELIEF_VERT = /* glsl */ `
  uniform sampler2D uTrail;

  varying vec2 vReliefUv;

  void main() {
    // 1) calc NDC din poziția ORIGINALĂ a vertex-ului → uv pentru trail
    vec4 _ndc4 = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vec2 _uvScreen = _ndc4.xy / _ndc4.w * 0.5 + 0.5;
    _uvScreen.y = 1.0 - _uvScreen.y; // top-left origin (canvas), vezi trail.flipY = false
    float _extrude = texture2D(uTrail, _uvScreen).r;

    // 2) Ca index.ts positionNode: pos.z *= mix(0.03, 1., extrude)
    vec3 _pos = position;
    _pos.z *= mix(${Z_EXTRUDE_MIN_GLSL}, 1.0, _extrude);

    // 3) proiecție finală cu pos modificat
    vReliefUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(_pos, 1.0);
  }
`

const RELIEF_FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uMap;        // baseColorTexture (tt1)
  uniform sampler2D uEmissive;   // emissiveTexture  (tt2)
  uniform sampler2D uTrail;
  uniform vec2 uResolution;      // = drawing buffer (renderer.domElement.width/height), ca screenUV TSL

  varying vec2 vReliefUv;

  // sRGB OETF (linear → sRGB) — port 1:1 din TSL.
  vec3 reliefSrgbOETF(vec3 c) {
    vec3 a = pow(c, vec3(0.41666)) * 1.055 - 0.055;
    vec3 b = c * 12.92;
    vec3 f = vec3(lessThanEqual(c, vec3(0.0031308)));
    return mix(a, b, f);
  }

  vec3 reliefSrgbToLinear(vec3 c) {
    vec3 a = pow((c + 0.055) / 1.055, vec3(2.4));
    vec3 b = c / 12.92;
    vec3 f = vec3(lessThanEqual(c, vec3(0.04045)));
    return mix(a, b, f);
  }

  void main() {
    vec3 _tt1 = reliefSrgbOETF(texture2D(uMap,      vReliefUv).rgb);
    vec3 _tt2 = reliefSrgbOETF(texture2D(uEmissive, vReliefUv).rgb);

    vec2 _screenUV = vec2(
      gl_FragCoord.x / uResolution.x,
      1.0 - gl_FragCoord.y / uResolution.y
    );
    float extrude = texture2D(uTrail, _screenUV).r;

    float _l0 = _tt2.b;
    float _l1 = _tt2.g;
    float _l2 = _tt2.r;
    float _l3 = _tt1.b;
    float _l4 = _tt1.g;
    float _l5 = _tt1.r;

    float _final = _l0;
    _final = mix(_final, _l1, smoothstep(0.0, 0.2, extrude));
    _final = mix(_final, _l2, smoothstep(0.2, 0.4, extrude));
    _final = mix(_final, _l3, smoothstep(0.4, 0.6, extrude));
    _final = mix(_final, _l4, smoothstep(0.6, 0.8, extrude));
    _final = mix(_final, _l5, smoothstep(0.8, 1.0, extrude));

    gl_FragColor = vec4(reliefSrgbToLinear(vec3(_final)), 1.0);
  }
`

function makeReliefMaterial(baseMap, emMap) {
  if (baseMap) {
    baseMap.colorSpace = THREE.NoColorSpace
    baseMap.minFilter = THREE.LinearFilter
    baseMap.magFilter = THREE.LinearFilter
    baseMap.generateMipmaps = false
    baseMap.needsUpdate = true
    pool.textures.add(baseMap)
  }
  if (emMap) {
    emMap.colorSpace = THREE.NoColorSpace
    emMap.minFilter = THREE.LinearFilter
    emMap.magFilter = THREE.LinearFilter
    emMap.generateMipmaps = false
    emMap.needsUpdate = true
    pool.textures.add(emMap)
  }

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: baseMap ?? null },
      uEmissive: { value: emMap ?? null },
      uTrail: sharedUniforms.uTrail,
      uResolution: sharedUniforms.uResolution,
    },
    vertexShader: RELIEF_VERT,
    fragmentShader: RELIEF_FRAG,
    side: THREE.FrontSide,
    transparent: false,
    depthTest: true,
    depthWrite: true,
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  })
  return mat
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

  const distance = camera.position.z
  const fovRad = (camera.fov * Math.PI) / 180
  const visibleH = 2 * distance * Math.tan(fovRad / 2)
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

async function initScene(canvas) {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    logarithmicDepthBuffer: true,
  })
  renderer.setClearColor(RELIEF_SCENE_BG, 1)
  renderer.toneMapping = THREE.NoToneMapping
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO))
  renderer.setSize(window.innerWidth, window.innerHeight, false)
  renderer.shadowMap.enabled = false

  scene = new THREE.Scene()
  scene.background = new THREE.Color(RELIEF_SCENE_BG)

  camera = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
  )
  camera.position.set(0, 0, CAMERA_Z)
  camera.lookAt(0, 0, 0)

  ensureTrailLayer()

  sharedUniforms.uResolution.value.set(
    renderer.domElement.width,
    renderer.domElement.height,
  )

  const draco = new DRACOLoader()
  draco.setDecoderPath(DRACO_DECODER)
  draco.preload()
  const loaderDraco = new GLTFLoader()
  loaderDraco.setDRACOLoader(draco)

  let gltf
  try {
    gltf = await loaderDraco.loadAsync(GLB_PATH)
  } catch (errDraco) {
    if (import.meta.dev) {
      console.warn('[ReliefSlab] încărcare cu Draco eșuată, reîncerc fără Draco:', errDraco)
    }
    try {
      gltf = await new GLTFLoader().loadAsync(GLB_PATH)
    } catch (err2) {
      console.error('[ReliefSlab] GLB lipsă sau invalid la', GLB_PATH, err2)
      draco.dispose()
      throw err2
    }
  }
  draco.dispose()

  if (disposed) return

  modelRoot = gltf.scene
  modelRoot.updateMatrixWorld(true)

  let meshCount = 0
  let materialCount = 0
  const RELIEF_MESH_RENDER_ORDER = 0
  modelRoot.traverse((child) => {
    if (!child.isMesh || !child.geometry) return
    meshCount += 1
    child.renderOrder = RELIEF_MESH_RENDER_ORDER
    pool.geometries.push(child.geometry)

    const oldMats = child.material != null
      ? (Array.isArray(child.material) ? child.material : [child.material])
      : []

    if (Array.isArray(child.material)) {
      const newMats = child.material.map((m) => {
        const baseMap = m?.map ?? null
        const emMap = m?.emissiveMap ?? null
        const newMat = makeReliefMaterial(baseMap, emMap)
        reliefMaterials.push(newMat)
        pool.materials.push(newMat)
        materialCount += 1
        return newMat
      })
      child.material = newMats
    } else {
      const baseMap = child.material?.map ?? null
      const emMap = child.material?.emissiveMap ?? null
      const newMat = makeReliefMaterial(baseMap, emMap)
      reliefMaterials.push(newMat)
      pool.materials.push(newMat)
      materialCount += 1
      child.material = newMat
    }

    for (const om of oldMats) {
      if (om && !pool.materials.includes(om)) om.dispose?.()
    }

    child.castShadow = false
    child.receiveShadow = false
    child.frustumCulled = false
  })

  if (meshCount === 0) {
    console.warn('[ReliefSlab] GLB fără mesh-uri:', GLB_PATH)
  } else {
    console.log('[ReliefSlab] mesh-uri:', meshCount, '| materiale relief:', materialCount, '| texturi:', pool.textures.size)
  }

  scene.add(modelRoot)
  fitModelToViewport()
}

// ─── EVENTS ──────────────────────────────────────────────────────────────────

function onPointerMove(e) {
  mouse.x = e.clientX
  mouse.y = e.clientY
  lastRealMouseTime = performance.now()
}

function onPointerDown(e) {
  mouse.x = e.clientX
  mouse.y = e.clientY
  lastRealMouseTime = performance.now()
  trailPaintCss.x = e.clientX
  trailPaintCss.y = e.clientY
}

function onResize() {
  if (!renderer || !camera) return
  const w = window.innerWidth
  const h = window.innerHeight

  camera.aspect = w / h
  camera.updateProjectionMatrix()

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO))
  renderer.setSize(w, h, false)

  ensureTrailLayer()

  sharedUniforms.uResolution.value.set(
    renderer.domElement.width,
    renderer.domElement.height,
  )

  scrollSmoothed = window.scrollY
  trailPaintCss.x = w * 0.5
  trailPaintCss.y = h * 0.5
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
    const doc = typeof document !== 'undefined' ? document.documentElement : null
    const scrollH = doc ? Math.max(doc.scrollHeight, doc.clientHeight) : 1
    const vh = Math.max(typeof window !== 'undefined' ? window.innerHeight : 1, 1)
    const scrollMax = Math.max(1, scrollH - vh)
    const t = Math.min(Math.max(scrollSmoothed / scrollMax, 0), 1)
    modelRoot.position.y = modelBaseY + t * modelScrollPanRange
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

// ─── LIFECYCLE ───────────────────────────────────────────────────────────────

onMounted(async () => {
  if (!import.meta.client) return
  const canvas = canvasRef.value
  if (!canvas) return

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerdown', onPointerDown, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })

  try {
    await initScene(canvas)
  } catch (err) {
    console.error('[ReliefSlab] init error:', err)
  }

  scrollSmoothed = window.scrollY
  trailPaintCss.x = window.innerWidth * 0.5
  trailPaintCss.y = window.innerHeight * 0.5

  if (!disposed) {
    raf = requestAnimationFrame(tick)
  }
})

onUnmounted(() => {
  disposed = true
  if (raf) cancelAnimationFrame(raf)

  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerdown', onPointerDown)
  window.removeEventListener('resize', onResize)

  for (const g of pool.geometries) g?.dispose?.()
  for (const m of pool.materials) m?.dispose?.()
  for (const t of pool.textures) t?.dispose?.()
  pool.geometries.length = 0
  pool.materials.length = 0
  pool.textures.clear()
  reliefMaterials.length = 0

  renderer?.dispose()
  renderer = null
  scene = null
  camera = null
  modelRoot = null
  trailLayer = null
  trailTexture = null
})
</script>

<style scoped>
.relief-slab {
  position: fixed;
  inset: 0;
  width: 100vw;
  min-width: 100vw;
  height: 100vh;
  height: 100dvh;
  min-height: 100vh;
  min-height: 100dvh;
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
  vertical-align: top;
  background: var(--relief-scene-bg);
}

/* Peste WebGL; conținut desenat din trail (vezi paintReliefFog). */
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
