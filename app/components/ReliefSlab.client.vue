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
import { WebGPURenderer, MeshBasicNodeMaterial, NodeMaterial, QuadMesh, NoToneMapping, SRGBColorSpace } from 'three/webgpu'
import {
  Fn,
  float,
  vec2,
  vec3,
  vec4,
  texture,
  uniform,
  uv,
  mix,
  smoothstep,
  step,
  max,
  min,
  clamp,
  abs,
  fract,
  length,
  pow,
  normalize,
  cross,
  dot,
  dFdx,
  dFdy,
  cameraProjectionMatrix,
  modelViewMatrix,
  positionLocal,
  positionWorld,
  cameraPosition,
  sRGBTransferOETF,
  screenUV,
} from 'three/tsl'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

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
/*
 * Self-hosted (copiat din three/examples/jsm/libs/draco la public/draco/) —
 * decoderul de pe www.gstatic.com era blocat de browserele cu content
 * blocking (Zen/Firefox strict), deci modelul nu se mai încărca deloc.
 * Același motiv pentru care fonturile sunt self-hosted, fără CDN Google.
 */
const DRACO_DECODER = '/draco/'

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
 * Mobil: recadrare close-up, ca pe immersive-g.com — pe telefon nu vezi
 * toată compoziția, vezi un fragment sculptural mărit, ca detaliile să
 * rămână lizibile pe ecran mic. Scroll-pan-ul recalculat din bbox-ul
 * scalat parcurge automat mai mult din model (user-approved, 2026-07-16).
 */
const RELIEF_MOBILE_CLOSEUP_ZOOM = 3.2
/**
 * Mobil, scroll=0: vârful bbox (păsările) puțin peste marginea de sus a
 * viewport-ului (>1 = rezervă pentru float/parallax, fără muchie vizibilă).
 * Pe mobil NU se aplică MODEL_ORIGINAL_OFFSET_Y / RELIEF_TOP_EXTRA_LIFT_FRAC —
 * ele împingeau păsările afară din cadru și porneai de la cerb (user, 2026-07-16).
 */
const RELIEF_MOBILE_TOP_FRAC = 1.6
/** Mobil: placa păsărilor (coloana din mijloc) cade puțin în stânga centrului la close-up — corecție spre dreapta, fracție din semi-lățimea bbox (bbox-ul e umflat de headroom-ul geometriei, deci valorile utile sunt mici). */
const RELIEF_MOBILE_X_SHIFT_FRAC = 0.02
/**
 * Ținta pe Y pentru vârful bbox (fracție din semi-înălțimea vizibilă, de la centru spre marginea de sus).
 * RELIEF_TOP_BLEND amestecă această țintă cu centrarea verticală: 0 = centrat pe ecran, 1 = aliniere completă sus.
 * Prea mare → muchia de sus a mesh-ului / capătul GLB-ului devine vizibil sub navbar.
 */
/** Scroll=0: marginea de sus a viewport-ului lângă zona păsărilor (bbox.max.y → +halfVisibleH). */
const RELIEF_TOP_FRAC = 0.9
const RELIEF_TOP_BLEND = 0.95
/*
 * Pixel-ratio cap: the relief shader runs a per-pixel TSL pipeline
 * (trail sampling + 5-level mixing), so pixel count is the dominant GPU
 * cost. DPR 2 on Retina Macs (~6 MP/frame) pinned the GPU at ~30fps and
 * starved the main thread (smooth scroll, cursor). DPR 1 everywhere —
 * immersive-g.com (referința vizuală a site-ului) randează la DPR 1 și pe
 * desktop: mesh-ul difuz + textura maschează soft-ul, fluiditatea primează
 * (2026-07-16, user-approved change to locked file).
 */
const MAX_PIXEL_RATIO_DESKTOP = 1
const MAX_PIXEL_RATIO_MOBILE = 1
let isMobileLayout = false
function maxPixelRatio() {
  return isMobileLayout ? MAX_PIXEL_RATIO_MOBILE : MAX_PIXEL_RATIO_DESKTOP
}

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

/*
 * ─── FLOWMAP (portat din immersive-g.com, 2026-07-16, user-approved) ─────────
 * Trail-ul NU mai e canvas 2D + upload CanvasTexture pe frame. E un ping-pong
 * de RenderTarget-uri pe GPU (stil ogl Flowmap), cu ștampilă de velocitate
 * modulată de un noise fractal animat — de-aici marginea „de fum” care se
 * destramă, în loc de blob-ul rotund al gradientului. Canale RT:
 *   rg = velocitatea pointerului, b = magnitudine velocitate, a = prezență.
 * Valorile de tuning sunt extrase din bundle-ul lor (config home.relief).
 */
function flowmapSize() {
  // ponytail: 256 pe mobil / 512 pe desktop; flowmap-ul e difuz, nu se vede
  return isMobileLayout ? 256 : 512
}
/** IG: flowmap.dissipation .953 — fricțiune, trail-ul dispare în ~1.5s. */
const FLOW_DISSIPATION = 0.953
/** IG: flowmap.falloff .38 (rază ștampilă în unități uv). Ghost mai mic, discret. */
const FLOW_FALLOFF_MOUSE = 0.3
const FLOW_FALLOFF_GHOST = 0.22
/** Puls de „velocitate” injectat la tap pe mobil (uv/frame); decade exponențial. */
const FLOW_TAP_PULSE = 0.02
const FLOW_TAP_DECAY = 0.85

/** IG home: extrude.gradientStrength .17 — gradient radial de ecran, luminozitate. */
const GRADIENT_STRENGTH = 0.17
/** IG home: chromaticMask — fresnel din normale derivate + umbra pe level5. */
const CHROMATIC_FRESNEL_SHARPNESS = 35
const CHROMATIC_FRESNEL_OPACITY = 0.98
const CHROMATIC_SHADOW_RANGE = [0.2, 0.42]
const CHROMATIC_SHADOW_OPACITY = 0.25
/**
 * IG home: fluidEffect — stratul irizat („fumul colorat”) de sub cursor.
 * Ei îl alimentează dintr-o simulare de fluid separată; noi refolosim
 * velocitatea din flowmap (fluid.rg≈velocitate, fluid.b≈magnitudine), care
 * dă ~același look fără încă o simulare. fluidMagnitude crescut față de
 * configul lor (.15) fiindcă flowmap-ul nostru are magnitudini mai mici
 * decât simularea lor de fluid.
 */
const FLUID_AMPLITUDE = 0.57
const FLUID_MAGNITUDE = 1.2
const FLUID_HUE_SHIFT = -0.52
const FLUID_COLOR_RANGE = 2

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

// Flowmap GPU state (creat în initScene, după renderer.init)
let flowRtRead = null
let flowRtWrite = null
let flowQuad = null
let flowNoiseTex = null
/** TextureNode partajat de toate materialele relief — .value = RT-ul citit. */
let flowTexNode = null
/** TextureNode al pass-ului de update — .value = RT-ul precedent. */
let flowMapNode = null

// Uniforms TSL pentru pass-ul de flowmap (valorile se setează în tick)
const uFlowMouse = uniform(new THREE.Vector2(0.5, 0.5))
const uFlowVelocity = uniform(new THREE.Vector2(0, 0))
const uFlowMouse2 = uniform(new THREE.Vector2(0.5, 0.5))
const uFlowVelocity2 = uniform(new THREE.Vector2(0, 0))
const uFlowAspect = uniform(1)
const uFlowFalloff = uniform(FLOW_FALLOFF_MOUSE)
const uFlowAlpha = uniform(0)
const uFlowDeltaMult = uniform(1)
const uFlowTime = uniform(0)

/** Poziția netezită din frame-ul precedent (px CSS) — pentru velocitate. */
const prevPaintCss = { x: 0, y: 0 }
/** Puls de tap activ (decade spre 0). */
let tapPulse = 0
/** performance.now() la tick-ul precedent — pentru dt-ul flowmap-ului. */
let lastTickTime = -1

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
/*
 * scrollMax cache: document.documentElement.scrollHeight citit în tick()
 * forța un reflow pe FIECARE rAF în timpul scroll-ului (layout-ul e mereu
 * murdar cât StringTune mută transformuri) — cauza principală a sacadării
 * modelului la swipe pe mobil. Reîmprospătat o dată pe secundă (acoperă
 * acordeoanele FAQ care schimbă înălțimea paginii) + la resize/orientation.
 */
let scrollMaxCached = 1
let scrollMaxFrameCounter = 0

function refreshScrollMax(vh) {
  const doc = typeof document !== 'undefined' ? document.documentElement : null
  const scrollH = doc ? Math.max(doc.scrollHeight, doc.clientHeight) : 1
  scrollMaxCached = Math.max(1, scrollH - vh)
}

/** Timestamp `performance.now()` la prima inițializare; permite GHOST_START_AFTER_MS. */
let mountTime = 0

// ─── FLOWMAP ─────────────────────────────────────────────────────────────────

/**
 * Noise fractal 256×256 (value noise, 4 octave, canale RGB decorelate) —
 * generat o dată la init. IG folosește mask-noise.png; al nostru e
 * procedural ca să nu depindem de un asset nou.
 */
function makeNoiseTexture() {
  const S = 256
  const data = new Uint8Array(S * S * 4)
  const lerp = (a, b, t) => a + (b - a) * t
  const smooth = (t) => t * t * (3 - 2 * t)
  // grile de valori aleatoare per octavă/canal
  const rand = (seed) => {
    let s = seed
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0
      return s / 4294967296
    }
  }
  for (let ch = 0; ch < 3; ch++) {
    const octaves = []
    for (let o = 0; o < 4; o++) {
      const size = 4 << o // 4, 8, 16, 32
      const r = rand(1234 + ch * 999 + o * 77)
      const grid = new Float32Array(size * size)
      for (let i = 0; i < grid.length; i++) grid[i] = r()
      octaves.push({ size, grid, amp: 1 / (1 << o) })
    }
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        let v = 0
        let ampSum = 0
        for (const { size, grid, amp } of octaves) {
          const fx = (x / S) * size
          const fy = (y / S) * size
          const x0 = Math.floor(fx) % size
          const y0 = Math.floor(fy) % size
          const x1 = (x0 + 1) % size
          const y1 = (y0 + 1) % size
          const tx = smooth(fx - Math.floor(fx))
          const ty = smooth(fy - Math.floor(fy))
          const a = lerp(grid[y0 * size + x0], grid[y0 * size + x1], tx)
          const b = lerp(grid[y1 * size + x0], grid[y1 * size + x1], tx)
          v += lerp(a, b, ty) * amp
          ampSum += amp
        }
        data[(y * S + x) * 4 + ch] = Math.round((v / ampSum) * 255)
      }
    }
  }
  for (let i = 3; i < data.length; i += 4) data[i] = 255
  const tex = new THREE.DataTexture(data, S, S, THREE.RGBAFormat)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.colorSpace = THREE.NoColorSpace
  tex.needsUpdate = true
  return tex
}

function makeFlowRenderTarget(size) {
  return new THREE.RenderTarget(size, size, {
    depthBuffer: false,
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    generateMipmaps: false,
  })
}

/**
 * Pass-ul de update (port 1:1 al shader-ului lor de flowmap):
 *  - decay cu fricțiune: data *= 1/(1 + dt·friction)
 *  - ștampila mouse (rg=velocitate·50, b=magnitudine, a=prezență) × falloff
 *    radial × noise fractal animat → marginea „de fum”
 *  - a doua ștampilă (tap mobil): doar magnitudine, ×3, noise mai dur
 */
function createFlowmap() {
  const size = flowmapSize()
  flowRtRead = makeFlowRenderTarget(size)
  flowRtWrite = makeFlowRenderTarget(size)
  flowNoiseTex = makeNoiseTexture()
  pool.textures.add(flowNoiseTex)

  flowMapNode = texture(flowRtRead.texture)
  const noiseNode = texture(flowNoiseTex)

  const FLOW_FRICTION = 1 / FLOW_DISSIPATION - 1

  const getStamp = (velNode, mouseNode) => {
    const cursor = uv().sub(mouseNode).mul(vec2(uFlowAspect, float(1)))
    const v = velNode.mul(50)
    const magnitude = float(1).sub(pow(float(1).sub(min(float(1), length(v))), 2))
    const falloff = smoothstep(uFlowFalloff, float(0), length(cursor)).mul(uFlowAlpha)
    return vec4(v, magnitude, float(1)).mul(falloff)
  }

  const flowFragment = Fn(() => {
    const uvv = uv()
    const dissipation = float(1).div(float(1).add(uFlowDeltaMult.mul(FLOW_FRICTION)))
    const data = flowMapNode.sample(uvv).mul(dissipation)

    const drift = vec2(0.01, 0.01).mul(uFlowTime)
    const noiseUv = uvv.mul(vec2(uFlowAspect, float(1)))
    const noise = smoothstep(float(0.4), float(1), noiseNode.sample(noiseUv.mul(0.35).add(drift)).g)
    const noise2 = float(0.15).add(smoothstep(float(0.4), float(1), noiseNode.sample(noiseUv.mul(0.8).add(drift)).g).mul(0.85))

    const stamp1 = getStamp(uFlowVelocity, uFlowMouse).mul(noise2).mul(uFlowDeltaMult)
    const s2 = getStamp(uFlowVelocity2, uFlowMouse2).mul(3)
    const stamp2 = vec4(float(0), float(0), s2.b, s2.b).mul(noise).mul(uFlowDeltaMult)

    return clamp(data.add(stamp1).add(stamp2), vec4(-1), vec4(1))
  })

  const mat = new NodeMaterial()
  mat.name = 'ReliefFlowmapPass'
  mat.fragmentNode = flowFragment()
  mat.depthTest = false
  mat.depthWrite = false
  pool.materials.push(mat)
  flowQuad = new QuadMesh(mat)

  flowTexNode = texture(flowRtRead.texture)
}

/** Rulează pass-ul de flowmap și face swap-ul ping-pong. */
function renderFlowmap() {
  if (!renderer || !flowQuad) return
  flowMapNode.value = flowRtRead.texture
  renderer.setRenderTarget(flowRtWrite)
  flowQuad.render(renderer)
  renderer.setRenderTarget(null)
  const tmp = flowRtRead
  flowRtRead = flowRtWrite
  flowRtWrite = tmp
  flowTexNode.value = flowRtRead.texture
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

/**
 * Setează uniformele pass-ului de flowmap din starea pointer/ghost.
 * Ștampila e oprită (uFlowAlpha=0) la idle complet → dissipation-ul golește
 * harta și mesh-ul colapsează în hârtie, ca înainte.
 */
function updateFlowmapInputs(deltaMs) {
  const vw = Math.max(window.innerWidth, 1)
  const vh = Math.max(window.innerHeight, 1)

  const shouldPaint = updateTrailPaintTargetCss()

  uFlowAspect.value = vw / vh
  uFlowFalloff.value = isTrailUserActiveNow() ? FLOW_FALLOFF_MOUSE : FLOW_FALLOFF_GHOST
  // dt normalizat la 60fps, cu limite ca tab-switch-ul să nu injecteze un decay uriaș
  uFlowDeltaMult.value = Math.min(Math.max(deltaMs / 16.666, 0.25), 3)
  uFlowTime.value = performance.now() / 1000

  uFlowMouse.value.set(trailPaintCss.x / vw, trailPaintCss.y / vh)
  uFlowVelocity.value.set(
    (trailPaintCss.x - prevPaintCss.x) / vw,
    (trailPaintCss.y - prevPaintCss.y) / vh,
  )
  prevPaintCss.x = trailPaintCss.x
  prevPaintCss.y = trailPaintCss.y

  uFlowAlpha.value = shouldPaint ? 1 : 0

  // Tap pe mobil: puls de magnitudine care decade — ștampila 2 (doar b/a)
  if (tapPulse > 1e-4) {
    uFlowVelocity2.value.set(tapPulse, tapPulse * 0.6)
    tapPulse *= FLOW_TAP_DECAY
  } else {
    uFlowVelocity2.value.set(0, 0)
    tapPulse = 0
  }
}

// ─── MATERIAL (MeshBasicNodeMaterial + TSL — WebGPURenderer) ─

/** rgb↔hsv, port TSL al funcțiilor din shader-ul IG (standard Sam Hocevar). */
const rgb2hsv = Fn(([c]) => {
  const K = vec4(0, -1 / 3, 2 / 3, -1)
  const p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g))
  const q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r))
  const d = q.x.sub(min(q.w, q.y))
  const e = float(1e-10)
  return vec3(
    abs(q.z.add(q.w.sub(q.y).div(d.mul(6).add(e)))),
    d.div(q.x.add(e)),
    q.x,
  )
})

const hsv2rgb = Fn(([c]) => {
  const K = vec4(1, 2 / 3, 1 / 3, 3)
  const p = abs(fract(c.xxx.add(K.xyz)).mul(6).sub(K.www))
  return c.z.mul(mix(K.xxx, clamp(p.sub(K.xxx), float(0), float(1)), c.y))
})

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

  const map1 = texture(texture1 && texture1.isTexture ? texture1 : FALLBACK_MAP)
  const map2 = texture(texture2 && texture2.isTexture ? texture2 : FALLBACK_MAP)

  /*
   * Extrude ca la IG: mix(flow.b, flow.a, .5) — b=magnitudinea velocității
   * (0 la hover static), a=prezența ștampilei. Media lor face ca hover-ul
   * static să reveleze pe jumătate, iar mișcarea să reveleze complet.
   */
  const flowExtrude = (uvScreen) => {
    const flow = flowTexNode.sample(uvScreen)
    return mix(flow.b, flow.a, 0.5)
  }

  const positionNode = Fn(() => {
    const clipPre = cameraProjectionMatrix.mul(modelViewMatrix).mul(vec4(positionLocal, 1))
    const w = max(clipPre.w, epsW)
    const uvx = clipPre.x.div(w).mul(0.5).add(0.5)
    const uvy = oneF.sub(clipPre.y.div(w).mul(0.5).add(0.5))
    const uvScreen = vec2(uvx, uvy)
    const ex = flowExtrude(uvScreen)
    const lat = smoothstep(lat0, latF, uvScreen.x).mul(oneF.sub(smoothstep(lat1m, lat1, uvScreen.x)))
    const extrude = clamp(ex, float(0), float(1)).mul(lat)
    const zScale = mix(zMinF, oneF, extrude)
    return vec3(positionLocal.x, positionLocal.y, positionLocal.z.mul(zScale))
  })()

  const colorNode = Fn(() => {
    /* `screenUV` (TSL / WebGPU) e deja aliniat la viewport ca flowmap-ul (Y de sus); fără `1-y` ca la gl_FragCoord. */
    const sv = screenUV
    const flow = flowTexNode.sample(sv)
    const exf = clamp(mix(flow.b, flow.a, 0.5), float(0), float(1))
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

    /* Gradient radial de ecran (IG: gradient*0.7*gradientStrength). */
    const gradient = mix(float(1), float(0.5), length(sv.sub(vec2(0, 0.8))))
    let color = vec3(shade, shade, shade).add(gradient.mul(0.7 * GRADIENT_STRENGTH))

    /*
     * Stratul cromatic IG: normala din derivate de ecran → fresnel mask,
     * plus umbră pe level5; culoarea efectului = normala hue-shift-ată,
     * mascată de „muchiile” fluidului (magnitudinea velocității din flowmap).
     */
    const vEye = positionWorld.sub(cameraPosition)
    const nrm = normalize(cross(dFdx(vEye), dFdy(vEye)))
    const fresnelFactor = abs(dot(nrm, vec3(0, 0, 1)))
    const inverseFresnel = float(1).sub(pow(float(1).sub(fresnelFactor), CHROMATIC_FRESNEL_SHARPNESS))
    const waveMask = max(
      smoothstep(float(1), float(0.1), mix(inverseFresnel, float(1), 1 - CHROMATIC_FRESNEL_OPACITY)),
      smoothstep(float(CHROMATIC_SHADOW_RANGE[1]), float(CHROMATIC_SHADOW_RANGE[0]), level5).mul(CHROMATIC_SHADOW_OPACITY),
    )
    const fluidEdges = smoothstep(float(0), float(1), flow.b.mul(FLUID_MAGNITUDE))
    const nrmRanged = normalize(vec3(nrm.x, nrm.y, nrm.z.mul(FLUID_COLOR_RANGE)))
    const nrmColor = nrmRanged.add(1).div(2)
    const hsv = rgb2hsv(nrmColor)
    const effectColor = hsv2rgb(vec3(fract(hsv.x.add(FLUID_HUE_SHIFT)), hsv.y, hsv.z))
    color = mix(color, effectColor, waveMask.mul(fluidEdges).mul(FLUID_AMPLITUDE).mul(latf))

    return color
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
  let scale = Math.max(sx, sy) * VIEWPORT_COVER * RELIEF_COMFORT_ZOOM_OUT
  if (isMobileLayout) scale *= RELIEF_MOBILE_CLOSEUP_ZOOM
  modelRoot.scale.setScalar(scale)
  modelRoot.updateMatrixWorld(true)

  const fitBox = new THREE.Box3().setFromObject(modelRoot)
  const halfVisibleH = visibleH / 2
  if (isMobileLayout) {
    const topTargetY = halfVisibleH * RELIEF_MOBILE_TOP_FRAC
    modelRoot.position.y += topTargetY - fitBox.max.y
    modelRoot.position.x += ((fitBox.max.x - fitBox.min.x) / 2) * RELIEF_MOBILE_X_SHIFT_FRAC
  } else {
    const topTargetY = halfVisibleH * RELIEF_TOP_FRAC
    const topDelta = topTargetY - fitBox.max.y
    modelRoot.position.y += topDelta * RELIEF_TOP_BLEND

    modelRoot.position.y += MODEL_ORIGINAL_OFFSET_Y
    modelRoot.position.y += visibleH * RELIEF_TOP_EXTRA_LIFT_FRAC
  }

  modelRoot.updateMatrixWorld(true)
  modelBaseY = modelRoot.position.y

  const panBox = new THREE.Box3().setFromObject(modelRoot)
  const bboxH = panBox.max.y - panBox.min.y
  const travel = Math.max(0, bboxH - visibleH)
  modelScrollPanRange = travel * SCROLL_PAN_CONTENT_FRAC
}

// ─── INIT ────────────────────────────────────────────────────────────────────

async function initScene(canvas) {
  /*
   * Capture viewport state once. Frozen size uses the container's
   * computed lvh (it has CSS `height: 100lvh` so getBoundingClientRect
   * always returns the LARGE viewport dimensions, even at load when iOS
   * still shows its bar). That way the canvas covers the area that will
   * be visible AFTER the bar collapses on first scroll, not just the
   * shrunken initial viewport. Eliminates the "gray gap below relief"
   * artifact when the bar disappears.
   *
   * orientationchange triggers a separate handler that re-measures.
   */
  // ?forcemobile = framing-ul de telefon (390x844) testabil de pe desktop.
  const forceMobile = import.meta.dev
    && new URLSearchParams(window.location.search).has('forcemobile')

  isMobileLayout = forceMobile
    || window.matchMedia('(max-width: 768px)').matches
    || window.matchMedia('(pointer: coarse)').matches

  const wrap = containerRef.value
  if (forceMobile) {
    frozenWidth = 390
    frozenHeight = 844
    canvas.style.width = '390px'
    canvas.style.height = '844px'
  } else if (wrap) {
    const r = wrap.getBoundingClientRect()
    frozenWidth = Math.max(Math.round(r.width), window.innerWidth)
    frozenHeight = Math.max(Math.round(r.height), window.innerHeight)
  } else {
    frozenWidth = window.innerWidth
    frozenHeight = window.innerHeight
  }

  /*
   * Zen/Firefox: navigator.gpu EXISTĂ (WebGPU e activ din Firefox 141),
   * deci WebGPURenderer alege backend-ul WebGPU real — unde adapter-ul /
   * WGSL-ul generat de TSL eșuează și scena rămâne goală. Fallback-ul
   * automat se declanșează doar când navigator.gpu lipsește. Pe Firefox
   * forțăm direct WebGL2 (calea verificată cu ?forcegl: 19 draw calls,
   * 60fps la DPR 1); pentru orice alt motor, dacă init-ul WebGPU aruncă,
   * reîncercăm o dată cu forceWebGL.
   */
  const rendererOpts = {
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    // ?forcegl = calea Zen/Firefox (backend WebGL2) testabilă din orice Chromium.
    forceWebGL: /firefox/i.test(navigator.userAgent)
      || new URLSearchParams(window.location.search).has('forcegl'),
  }
  renderer = new WebGPURenderer(rendererOpts)
  try {
    await renderer.init()
  } catch (err) {
    if (rendererOpts.forceWebGL) throw err
    console.warn('[ReliefSlab] WebGPU init a eșuat, retry cu WebGL2:', err)
    renderer.dispose()
    renderer = new WebGPURenderer({ ...rendererOpts, forceWebGL: true })
    await renderer.init()
  }

  renderer.setClearColor(RELIEF_SCENE_BG, 1)
  renderer.toneMapping = NoToneMapping
  renderer.outputColorSpace = SRGBColorSpace
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio()))
  renderer.setSize(frozenWidth, frozenHeight, false)
  renderer.shadowMap.enabled = false

  scene = new THREE.Scene()
  scene.background = new THREE.Color(RELIEF_SCENE_BG)

  camera = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    frozenWidth / frozenHeight,
    0.1,
    100,
  )
  camera.position.set(0, 0, CAMERA_Z)
  camera.lookAt(0, 0, 0)

  createFlowmap()

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
  if (import.meta.dev) window.__relief = () => ({ renderer, scene, camera, modelRoot })

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

  // Loading screen-ul (LoadingScreen.vue) așteaptă semnalul ăsta pe home:
  // modelul e încărcat + fitted, prima pictură urmează în frame-ul următor.
  window.dispatchEvent(new CustomEvent('bloom:relief-ready'))
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
  prevPaintCss.x = e.clientX
  prevPaintCss.y = e.clientY
  // Ștampila 2 (IG: uMouse2/uVelocity2) — tap-ul „sparge fumul” și fără drag
  const vw = Math.max(window.innerWidth, 1)
  const vh = Math.max(window.innerHeight, 1)
  uFlowMouse2.value.set(e.clientX / vw, e.clientY / vh)
  tapPulse = FLOW_TAP_PULSE
}

/*
 * iOS browser-bar resize fix — same strategy as HeroSection. On mobile
 * we freeze the canvas size on mount so the WebGPU renderer doesn't get
 * a setSize() + camera.aspect rebuild every time the URL bar collapses
 * or expands. That was causing the relief model to visibly squash/stretch
 * with each scroll-direction change.
 *
 * Stored at module scope so onResize can read them.
 */
let frozenWidth = 0
let frozenHeight = 0

function onResize() {
  if (!renderer || !camera) return
  /*
   * On mobile, ignore the bar-collapse resize entirely — return early
   * before touching the renderer. The frozen size from initScene stays.
   * Real orientation changes hit a separate orientationchange listener
   * which re-measures and re-fits.
   */
  if (isMobileLayout && window.innerWidth === frozenWidth) return

  const w = window.innerWidth
  const h = isMobileLayout ? frozenHeight : window.innerHeight

  camera.aspect = w / h
  camera.updateProjectionMatrix()

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio()))
  renderer.setSize(w, h, false)

  scrollSmoothed = window.scrollY
  trailPaintCss.x = w * 0.5
  trailPaintCss.y = h * 0.5
  refreshScrollMax(h)
  fitModelToViewport()
}

/*
 * Real orientation change: capture a fresh frozen size from the
 * container's rect (which reflects the new lvh after rotation).
 * Two RAFs because iOS reports stale dims on the orientationchange
 * event itself.
 */
function onOrientation() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (!renderer || !camera) return
    const wrap = containerRef.value
    if (wrap) {
      const r = wrap.getBoundingClientRect()
      frozenWidth = Math.max(Math.round(r.width), window.innerWidth)
      frozenHeight = Math.max(Math.round(r.height), window.innerHeight)
    } else {
      frozenWidth = window.innerWidth
      frozenHeight = window.innerHeight
    }

    camera.aspect = frozenWidth / frozenHeight
    camera.updateProjectionMatrix()

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio()))
    renderer.setSize(frozenWidth, frozenHeight, false)

    refreshScrollMax(frozenHeight)
    fitModelToViewport()
  }))
}

// ─── LOOP ────────────────────────────────────────────────────────────────────

function tick() {
  if (disposed) return
  raf = requestAnimationFrame(tick)

  /*
   * Skip ALL per-frame work when the tab is hidden. Browser already
   * throttles rAF to ~1Hz when hidden, but stopping paint + WebGPU
   * commit unconditionally avoids any leftover work and lets the GPU
   * fully idle. Resumes automatically when the tab becomes visible
   * (rAF starts firing at 60Hz again).
   */
  if (typeof document !== 'undefined' && document.hidden) return

  /*
   * Flowmap-ul rulează pe GPU la fiecare frame (256²/512² half-float e
   * ieftin) — a dispărut și frame-skip-ul de 30Hz de pe mobil, și upload-ul
   * CanvasTexture pe frame care sătura bandwidth-ul GPU la touch-scroll.
   */
  const now = performance.now()
  const deltaMs = lastTickTime > 0 ? now - lastTickTime : 16.666
  lastTickTime = now
  if (flowQuad) {
    updateFlowmapInputs(deltaMs)
    renderFlowmap()
  }

  if (modelRoot && camera) {
    const scrollTarget = window.scrollY
    scrollSmoothed += (scrollTarget - scrollSmoothed) * SCROLL_LERP
    /*
     * On mobile the iOS bar collapse bumps innerHeight by ~60px every
     * scroll-direction change. If we read window.innerHeight here, the
     * resulting scrollMax oscillates and the model "jumps" with the bar
     * animation. frozenHeight (captured at mount, refreshed only on real
     * orientation change) keeps the math stable.
     */
    const vh = isMobileLayout
      ? Math.max(frozenHeight, 1)
      : Math.max(typeof window !== 'undefined' ? window.innerHeight : 1, 1)
    scrollMaxFrameCounter = (scrollMaxFrameCounter + 1) % 60
    if (scrollMaxFrameCounter === 0 || scrollMaxCached <= 1) refreshScrollMax(vh)
    const t = Math.min(Math.max(scrollSmoothed / scrollMaxCached, 0), 1)
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

  mountTime = performance.now()

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerdown', onPointerDown, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  /*
   * On real orientation change, force a full re-measure: the frozen size
   * captured at mount becomes stale once the device rotates. Two RAFs
   * because iOS reports stale innerHeight/Width on the orientationchange
   * event itself.
   */
  window.addEventListener('orientationchange', onOrientation, { passive: true })

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
  window.removeEventListener('orientationchange', onOrientation)

  for (const g of pool.geometries) g?.dispose?.()
  for (const m of pool.materials) m?.dispose?.()
  for (const t of pool.textures) t?.dispose?.()
  pool.geometries.length = 0
  pool.materials.length = 0
  pool.textures.clear()
  reliefMaterials.length = 0

  flowRtRead?.dispose()
  flowRtWrite?.dispose()
  flowRtRead = null
  flowRtWrite = null
  flowQuad = null
  flowTexNode = null
  flowMapNode = null
  flowNoiseTex = null
  lastTickTime = -1
  tapPulse = 0

  renderer?.dispose()
  renderer = null
  scene = null
  camera = null
  modelRoot = null
})
</script>

<style scoped>
.relief-slab {
  position: fixed;
  inset: 0;
  width: 100vw;
  min-width: 100vw;
  /*
   * lvh = LARGE viewport height (URL bar collapsed). Critical: we WANT
   * the relief canvas to extend behind the iOS browser bar so that when
   * the bar collapses on scroll, the freshly-revealed strip is still
   * covered by the relief instead of exposing the body's solid color
   * underneath. svh would leave that strip uncovered = visible gray gap.
   */
  height: 100lvh;
  min-height: 100lvh;
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
