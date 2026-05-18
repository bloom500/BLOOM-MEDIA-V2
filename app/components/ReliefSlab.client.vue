<template>
  <div
    ref="containerRef"
    class="relief-slab"
    :style="reliefSlabCssVars"
    aria-hidden="true"
  >
    <canvas ref="canvasRef" class="relief-slab__canvas" />
  </div>
</template>

<script setup>
/**
 * Relief fishpond: același efect ca sketch-ul oficial (trail → extrudare Z + blend niveluri din map / emissiveMap),
 * cu `WebGPURenderer` + `MeshBasicNodeMaterial` + TSL — aliniat la tutorialul Yuri (Three.js WebGPU / TSL).
 * Pe browsere fără WebGPU, renderer-ul folosește fallback WebGL2 în același API.
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { WebGPURenderer, MeshBasicNodeMaterial, NoToneMapping, SRGBColorSpace } from 'three/webgpu'
import {
  Fn,
  float,
  vec2,
  vec3,
  vec4,
  texture,
  uv,
  mix,
  smoothstep,
  max,
  cameraProjectionMatrix,
  modelViewMatrix,
  positionLocal,
  sRGBTransferOETF,
  screenUV,
} from 'three/tsl'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { TrailCanvas } from '~/utils/trail.js'

// ─── CONFIG ───────────────────────────────────────────────────────────────────

/**
 * Ordinea: sketch oficial (`original.glb`), apoi asset-uri folosite în site dacă `original` lipsește din `public/`.
 * Fără niciun fișier → încărcare eșuată, scenă goală (doar fundal); trail.js rulează oricum, dar nu are mesh pe care să „lucreze”.
 */
const RELIEF_GLB_CANDIDATES = [
  '/models/optimized/original.glb',
  '/models/optimized/bloom-optimized.glb',
  '/models/optimized/fishpond_baked.glb',
]
const DRACO_DECODER = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/'

/** Ultimul URL GLB încărcat cu succes (log / mesaje). */
let reliefGltfSourceUrl = ''

async function loadReliefGltf(loaderDraco, plainLoader) {
  const failures = []
  for (const url of RELIEF_GLB_CANDIDATES) {
    try {
      const g = await loaderDraco.loadAsync(url)
      reliefGltfSourceUrl = url
      return g
    } catch (errDraco) {
      try {
        const g = await plainLoader.loadAsync(url)
        reliefGltfSourceUrl = url
        return g
      } catch (errPlain) {
        failures.push({ url, errDraco, errPlain })
      }
    }
  }
  const hint = `Pune un GLB în public la una din căile: ${RELIEF_GLB_CANDIDATES.join(', ')}`
  console.error('[ReliefSlab]', hint, failures)
  throw new Error(`[ReliefSlab] ${hint}`)
}

/** Camera ca în sketch-ul original (tutorial Yuri: 15). */
const CAMERA_FOV = 30
const CAMERA_Z = 15

/**
 * Overflow mare: bbox mult peste frustum pe toate laturile — marginile mesh rămân în afara ecranului
 * la orice t∈[0,1] de scroll (relief „infinit” vizual).
 */
const VIEWPORT_COVER = 2.5
/**
 * <1: zoom out subiectiv (mai mult aer în cadru). Compensează parțial faptul că Z mai mare mărește
 * sx/sy în fit — vrem vizitatorului să i se pară sculptul mai „departe”, nu mai mare.
 * Creștere ușoară = zoom in pe mesh (marginile laterale ale GLB-ului ies mai mult în afara ecranului),
 * fără a schimba celelalte constante de poziționare verticală (RELIEF_TOP_*, offset-uri).
 */
const RELIEF_COMFORT_ZOOM_OUT = 0.77
/**
 * Ținta pe Y pentru vârful bbox (fracție din semi-înălțimea vizibilă, de la centru spre marginea de sus).
 * RELIEF_TOP_BLEND amestecă această țintă cu centrarea verticală: 0 = centrat pe ecran, 1 = aliniere completă sus.
 * Prea mare → muchia de sus a mesh-ului / capătul GLB-ului devine vizibil sub navbar.
 */
/** Scroll=0: marginea de sus a viewport-ului lângă zona păsărilor (bbox.max.y → +halfVisibleH). */
const RELIEF_TOP_FRAC = 0.9
const RELIEF_TOP_BLEND = 0.95
const MAX_PIXEL_RATIO = 2

/**
 * Bandă stânga/dreaptă: extrude trail forțat la 0 (Z plat + level0) — fără hover pe margini.
 * Nu mută/scală GLB-ul.
 */
const RELIEF_LATERAL_HOVER_DEAD_FRAC = 0.12

/** Ca în Official 3D model/src/index.ts după load: `model.position.set(0, 2, 0)`. */
const MODEL_ORIGINAL_OFFSET_Y = 2
/** Ridică mesh-ul cu o fracțiune din înălțimea frustum-ului — acoperă banda sub navbar unde se vedea „golul”. */
const RELIEF_TOP_EXTRA_LIFT_FRAC = 0.11

/** Clear + scene.background + CSS wrapper/canvas — același hex ca _l0 vizual. */
const RELIEF_SCENE_BG = 0xa8a6a2
const RELIEF_SCENE_BG_CSS = `#${RELIEF_SCENE_BG.toString(16).padStart(6, '0')}`
const reliefSlabCssVars = { '--relief-scene-bg': RELIEF_SCENE_BG_CSS }

/** Dimensiune trail canvas — SketchSettings.dimensions [2048, 2048] din index.ts. */
const TRAIL_CANVAS_SIZE = 2048

/**
 * Trail fade: fracțiune din canvas-ul precedent care rămâne la fiecare frame.
 * 0.025 (sketch original) = trail aproape permanent → mesh complet vizibil în repaus.
 * 0.07 ≈ trail-ul dispare în ~1.5s la 60fps; mesh-ul se „retrage” în hârtie când nu miști mouse-ul,
 * ca pe immersive-g.com. Aplicat și pentru pointer real, și pentru ghost.
 */
const TRAIL_FADE_ALPHA = 0.07

/** Ca `trail.js` implicit: `circleRadius = width * 0.12` — Official sketch. Mouse: redus la jumătate ca reveal-ul să nu acopere ~30% din viewport (gradient × 2.5 → ~15% lățime). Ghost ușor mai mic decât mouse, ca să rămână discret. */
const TRAIL_CIRCLE_RADIUS_MULT_MOUSE = 0.06
const TRAIL_CIRCLE_RADIUS_MULT_GHOST = 0.05

/** Ca positionNode: pos.z *= mix(0.03, 1., extrude) */
const Z_EXTRUDE_MIN = 0.03

/** Durată ciclu ghost — mai mare = mișcare mai lentă pe orbită. */
const GHOST_PERIOD_MS = 12000
/** Margine față de marginile viewport-ului (0–1) — mai mare = ghost-ul stă mai centrat, nu mătură marginile. */
const GHOST_VIEW_INSET = 0.22
/** Amplitudine traiectorie ghost (fracție din semi-viewport). 0.36 → 0.18: insulă centrală, nu câmp. */
const GHOST_AMP_PRIMARY = 0.18
const GHOST_AMP_HARMONIC = 0.05
/** Raport „auriu” pentru axa Y — traiectorie Lissajous, nu cerc. */
const GHOST_FREQ_Y = 1.618033988749895
/**
 * Întârziere după mount înainte ca ghost-ul să înceapă să picteze.
 * < 0 = niciodată (ghost activ doar dacă utilizatorul a mișcat mouse-ul măcar o dată
 * și apoi s-a oprit). Setat negativ ca în repaus complet (de la load, fără pointer)
 * mesh-ul să stea în hârtie, exact ca pe referință.
 */
const GHOST_START_AFTER_MS = -1

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

let renderer = null
let scene = null
let camera = null
let modelRoot = null
let raf = null
let disposed = false

let trailLayer = null
let trailTexture = null

/** Coordonate canvas trail (pixeli) — același obiect pasat la `trailLayer.update(mouse2D)` ca în sketch. */
const mouse2D = { x: 0, y: 0 }

/** 1×1 gri — dacă un mesh nu are map / emissiveMap. */
const FALLBACK_MAP = new THREE.DataTexture(
  new Uint8Array([0xa8, 0xa6, 0xa2, 255]),
  1,
  1,
  THREE.RGBAFormat,
)
FALLBACK_MAP.colorSpace = THREE.NoColorSpace
FALLBACK_MAP.needsUpdate = true

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

/** Timestamp `performance.now()` la prima inițializare; permite GHOST_START_AFTER_MS. */
let mountTime = 0

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

/**
 * O singură instanță `CanvasTexture` pentru trail — `texture()` din TSL cere THREE.Texture, nu `uniform()`.
 * La recreate TrailCanvas păstrăm aceeași textură și schimbăm doar `.image`, ca nodurile din materiale să rămână valide.
 */
function ensureTrailLayer() {
  if (!renderer) return false
  const bw = TRAIL_CANVAS_SIZE
  const bh = TRAIL_CANVAS_SIZE

  if (trailLayer && trailLayer.canvas.width === bw && trailLayer.canvas.height === bh) {
    trailLayer.setFadeSpeed(TRAIL_FADE_ALPHA)
    trailLayer.setCircleRadius(bw * TRAIL_CIRCLE_RADIUS_MULT_MOUSE)
    return true
  }

  if (trailLayer) {
    trailLayer = null
  }

  trailLayer = new TrailCanvas(bw, bh)
  trailLayer.setFadeSpeed(TRAIL_FADE_ALPHA)
  trailLayer.setCircleRadius(bw * TRAIL_CIRCLE_RADIUS_MULT_MOUSE)
  const canvas = trailLayer.getTexture()

  if (!trailTexture) {
    trailTexture = new THREE.CanvasTexture(canvas)
    configureTrailThreeTexture(trailTexture)
    pool.textures.add(trailTexture)
  } else {
    pool.textures.delete(trailTexture)
    trailTexture.image = canvas
    configureTrailThreeTexture(trailTexture)
    pool.textures.add(trailTexture)
  }
  trailTexture.needsUpdate = true
  return true
}

/**
 * Poziție ghost în fracții de viewport [0,1] — Lissajous + mică a doua harmonică,
 * viteze ușor diferite pe X/Y (nu e cerc); același ciclu la GHOST_PERIOD_MS.
 */
function ghostPointerFraction(phase) {
  const u = phase * Math.PI * 2
  const sx =
    GHOST_AMP_PRIMARY * Math.sin(u * 0.97 + 0.12) + GHOST_AMP_HARMONIC * Math.sin(u * 2.21 + 0.73)
  const sy =
    GHOST_AMP_PRIMARY * Math.sin(u * GHOST_FREQ_Y + 0.94) + GHOST_AMP_HARMONIC * Math.sin(u * 1.97 + 0.31)
  const nx = Math.min(1, Math.max(0, 0.5 + sx))
  const ny = Math.min(1, Math.max(0, 0.5 + sy))
  const t = GHOST_VIEW_INSET
  const s = 1 - 2 * t
  return { x: t + s * nx, y: t + s * ny }
}

/** Același prag ca la paint trail: pointer real recent → rază pensulă mai mare. */
function isTrailUserActiveNow() {
  const now = performance.now()
  return lastRealMouseTime >= 0 && (now - lastRealMouseTime) < USER_ACTIVE_MS
}

/**
 * Ghost are voie să picteze doar:
 *  - dacă utilizatorul a mișcat mouse-ul măcar o dată (lastRealMouseTime ≥ 0), ȘI
 *  - dacă a trecut de „fereastra activă” (USER_ACTIVE_MS), ȘI
 *  - dacă întârzierea suplimentară GHOST_START_AFTER_MS de la mount a expirat (≥ 0).
 *
 * GHOST_START_AFTER_MS < 0 → ghost dezactivat complet la idle inițial: pe load, fără
 * pointer, mesh-ul stă în hârtie (ca pe immersive-g.com).
 */
function isGhostAllowedNow() {
  if (lastRealMouseTime < 0) return false
  if (GHOST_START_AFTER_MS < 0) return true
  const now = performance.now()
  return (now - mountTime) >= GHOST_START_AFTER_MS
}

/**
 * Ghost: poziție directă din traiectoria de mai sus (fără lerp).
 * Mouse: lerp ușor spre poziția reală.
 *
 * Returnează `false` dacă nu trebuie pictat nimic (idle inițial fără pointer + ghost dezactivat).
 */
function updateTrailPaintTargetCss() {
  const now = performance.now()
  const userActive = lastRealMouseTime >= 0 && (now - lastRealMouseTime) < USER_ACTIVE_MS
  const ghostOk = isGhostAllowedNow()

  if (userActive) {
    const k = LERP_TRAIL_TO_MOUSE
    trailPaintCss.x += (mouse.x - trailPaintCss.x) * k
    trailPaintCss.y += (mouse.y - trailPaintCss.y) * k
    return true
  }

  if (!ghostOk) {
    return false
  }

  const vw = Math.max(window.innerWidth, 1)
  const vh = Math.max(window.innerHeight, 1)
  const phase = (now % GHOST_PERIOD_MS) / GHOST_PERIOD_MS
  const g = ghostPointerFraction(phase)
  trailPaintCss.x = g.x * vw
  trailPaintCss.y = g.y * vh
  return true
}

function paintTrail() {
  if (!ensureTrailLayer()) return

  const shouldPaint = updateTrailPaintTargetCss()
  const bw = TRAIL_CANVAS_SIZE
  trailLayer.setCircleRadius(
    bw * (isTrailUserActiveNow() ? TRAIL_CIRCLE_RADIUS_MULT_MOUSE : TRAIL_CIRCLE_RADIUS_MULT_GHOST),
  )

  if (shouldPaint) {
    const p = cssToTrailBuffer(trailPaintCss.x, trailPaintCss.y)
    mouse2D.x = p.x
    mouse2D.y = p.y
    trailLayer.update(mouse2D)
  } else {
    /*
     * Idle complet: lăsăm fade-ul să șteargă canvas-ul fără să adăugăm o pată nouă.
     * Așa mesh-ul colapsează în hârtie (extrude → 0, level0 = paper) ca pe immersive-g.com.
     */
    trailLayer.update(null)
  }
  trailTexture.needsUpdate = true
}

// ─── MATERIAL (MeshBasicNodeMaterial + TSL — WebGPURenderer) ─

function makeReliefMaterial(baseMap, emMap, _skinned, _morphTargets) {
  const texture1 = baseMap ?? FALLBACK_MAP
  const texture2 = emMap ?? FALLBACK_MAP

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

  const lat0 = float(0)
  const latF = float(RELIEF_LATERAL_HOVER_DEAD_FRAC)
  const lat1m = float(1).sub(float(RELIEF_LATERAL_HOVER_DEAD_FRAC))
  const lat1 = float(1)
  const zMinF = float(Z_EXTRUDE_MIN)
  const oneF = float(1)
  const epsW = float(1e-6)

  const trailTex = trailTexture && trailTexture.isTexture ? trailTexture : FALLBACK_MAP
  const trailMap = texture(trailTex)
  const map1 = texture(texture1 && texture1.isTexture ? texture1 : FALLBACK_MAP)
  const map2 = texture(texture2 && texture2.isTexture ? texture2 : FALLBACK_MAP)

  const positionNode = Fn(() => {
    const clipPre = cameraProjectionMatrix.mul(modelViewMatrix).mul(vec4(positionLocal, 1))
    const w = max(clipPre.w, epsW)
    const uvx = clipPre.x.div(w).mul(0.5).add(0.5)
    const uvy = oneF.sub(clipPre.y.div(w).mul(0.5).add(0.5))
    const uvScreen = vec2(uvx, uvy)
    const ex = trailMap.sample(uvScreen).r
    const lat = smoothstep(lat0, latF, uvScreen.x).mul(oneF.sub(smoothstep(lat1m, lat1, uvScreen.x)))
    const extrude = ex.mul(lat)
    const zScale = mix(zMinF, oneF, extrude)
    return vec3(positionLocal.x, positionLocal.y, positionLocal.z.mul(zScale))
  })()

  const colorNode = Fn(() => {
    /* `screenUV` (TSL / WebGPU) e deja aliniat la viewport ca trail-ul (Y de sus); fără `1-y` ca la gl_FragCoord. */
    const sv = screenUV
    const exf = trailMap.sample(sv).r
    const latf = smoothstep(lat0, latF, sv.x).mul(oneF.sub(smoothstep(lat1m, lat1, sv.x)))
    const extrude = exf.mul(latf)
    const tt1 = sRGBTransferOETF(map1.sample(uv()).rgb)
    const tt2 = sRGBTransferOETF(map2.sample(uv()).rgb)
    const level0 = tt2.z
    const level1 = tt2.y
    const level2 = tt2.x
    const level3 = tt1.z
    const level4 = tt1.y
    const level5 = tt1.x
    const sh1 = mix(level0, level1, smoothstep(float(0), float(0.2), extrude))
    const sh2 = mix(sh1, level2, smoothstep(float(0.2), float(0.4), extrude))
    const sh3 = mix(sh2, level3, smoothstep(float(0.4), float(0.6), extrude))
    const sh4 = mix(sh3, level4, smoothstep(float(0.6), float(0.8), extrude))
    const shade = mix(sh4, level5, smoothstep(float(0.8), float(1), extrude))
    return vec3(shade, shade, shade)
  })()

  const mat = new MeshBasicNodeMaterial({
    transparent: true,
    depthTest: true,
    depthWrite: true,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  })
  mat.name = 'ReliefSlabRelief'
  mat.fog = false
  mat.lights = false
  mat.toneMapped = false
  mat.positionNode = positionNode
  mat.colorNode = colorNode

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
  const scale = Math.max(sx, sy) * VIEWPORT_COVER * RELIEF_COMFORT_ZOOM_OUT
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
  renderer = new WebGPURenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  })
  await renderer.init()

  renderer.setClearColor(RELIEF_SCENE_BG, 1)
  renderer.toneMapping = NoToneMapping
  renderer.outputColorSpace = SRGBColorSpace
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

  const draco = new DRACOLoader()
  draco.setDecoderPath(DRACO_DECODER)
  draco.preload()
  const loaderDraco = new GLTFLoader()
  loaderDraco.setDRACOLoader(draco)

  const plainGltf = new GLTFLoader()
  let gltf
  try {
    gltf = await loadReliefGltf(loaderDraco, plainGltf)
  } catch (err) {
    draco.dispose()
    throw err
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

    const skinned = child.isSkinnedMesh === true
    const useMorph = !!(child.geometry?.morphAttributes?.position?.length)

    if (Array.isArray(child.material)) {
      const newMats = child.material.map((m) => {
        const baseMap = m?.map ?? null
        const emMap = m?.emissiveMap ?? null
        const newMat = makeReliefMaterial(baseMap, emMap, skinned, useMorph)
        reliefMaterials.push(newMat)
        pool.materials.push(newMat)
        materialCount += 1
        return newMat
      })
      child.material = newMats
    } else {
      const baseMap = child.material?.map ?? null
      const emMap = child.material?.emissiveMap ?? null
      const newMat = makeReliefMaterial(baseMap, emMap, skinned, useMorph)
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
    console.warn('[ReliefSlab] GLB fără mesh-uri:', reliefGltfSourceUrl || RELIEF_GLB_CANDIDATES[0])
  } else {
    console.log('[ReliefSlab] GLB:', reliefGltfSourceUrl, '| mesh-uri:', meshCount, '| materiale relief:', materialCount, '| texturi:', pool.textures.size)
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
    if (trailTexture) trailTexture.needsUpdate = true
    renderer.render(scene, camera)
  }
}

// ─── LIFECYCLE ───────────────────────────────────────────────────────────────

onMounted(async () => {
  if (!import.meta.client) return
  const canvas = canvasRef.value
  if (!canvas) return

  mountTime = performance.now()

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

onBeforeUnmount(() => {
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
  /* svh = stable; WebGPU canvas no longer fires resize() at every iOS
     bar-collapse, which prevents the relief shader from re-uploading
     uniforms on each scroll-direction change. */
  height: 100svh;
  min-height: 100svh;
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
</style>
