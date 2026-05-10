import * as THREE from 'three'
import { HOMEPAGE_SECTION_GLBS } from '~/lib/sectionModels'
import { loadSectionGltf } from '~/lib/three/sectionModelLoader'

const SECTION_KEYS_IN_ORDER = [
  'hero',
  'declaration',
  'services',
  'process',
  'why',
  'faq',
  'contact',
]

// Ported from existing per-section props (HeroSection/Declaration/...).
const MODEL_TUNING = {
  hero: {
    scale: 1.38,
    frameFill: 1.18,
    horizontalBias: 0.18,
    verticalBias: 0,
    rotateXDeg: 0,
    rotateYDeg: 0,
    rotateZDeg: 0,
  },
  declaration: {
    scale: 1.62,
    frameFill: 1.35,
    horizontalBias: 0,
    verticalBias: 0,
    rotateXDeg: -6,
    rotateYDeg: 0,
    rotateZDeg: 0,
  },
  services: {
    scale: 1.34,
    frameFill: 1.14,
    horizontalBias: 0.2,
    verticalBias: 0,
    rotateXDeg: 0,
    rotateYDeg: 0,
    rotateZDeg: 0,
  },
  process: {
    scale: 1.34,
    frameFill: 1.14,
    horizontalBias: 0.22,
    verticalBias: 0,
    rotateXDeg: 0,
    rotateYDeg: 0,
    rotateZDeg: 0,
  },
  why: {
    scale: 1.36,
    frameFill: 1.15,
    horizontalBias: 0.2,
    verticalBias: 0,
    rotateXDeg: 0,
    rotateYDeg: 0,
    rotateZDeg: 0,
  },
  faq: {
    scale: 1.32,
    frameFill: 1.14,
    horizontalBias: 0.18,
    verticalBias: 0,
    rotateXDeg: 0,
    rotateYDeg: 0,
    rotateZDeg: 0,
  },
  contact: {
    scale: 1.42,
    frameFill: 1.2,
    horizontalBias: 0.1,
    verticalBias: 0,
    rotateXDeg: 0,
    rotateYDeg: 0,
    rotateZDeg: 0,
  },
}

function updateWorld(model) {
  model.updateMatrixWorld(true)
}

function centerModelAtOrigin(model) {
  updateWorld(model)
  const box = new THREE.Box3().setFromObject(model)
  if (box.isEmpty()) return
  const center = box.getCenter(new THREE.Vector3())
  model.position.sub(center)
  updateWorld(model)
}

function uniformScaleToFitCamera(model, camera, camDistance, fill, scaleMultiplier) {
  updateWorld(model)
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z, 1e-6)
  const vFov = (camera.fov * Math.PI) / 180
  const frustumHeight = 2 * camDistance * Math.tan(vFov / 2)
  const s = ((frustumHeight * fill) / maxDim) * scaleMultiplier
  model.scale.setScalar(s)
}

export function useUnifiedScene() {
  const state = {
    scene: null,
    camera: null,
    roots: new Map(), // key -> Object3D root
    meshes: [],
    sectionHeight3d: 10,
    camDist: 5.1,
  }

  async function initScene(renderer, options = {}) {
    const { sectionHeight3d = 10 } = options
    state.sectionHeight3d = sectionHeight3d

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 800)
    camera.position.set(0, 0, state.camDist)
    camera.lookAt(0, 0, 0)

    // Lights — same ballpark as previous per-section canvases.
    scene.add(new THREE.AmbientLight(0xffffff, 0.92))
    const directional = new THREE.DirectionalLight(0xffffff, 1.65)
    directional.position.set(4.5, 6, 5)
    scene.add(directional)
    scene.add(new THREE.HemisphereLight(0xf5f5f0, 0x3a3a38, 0.85))

    state.scene = scene
    state.camera = camera

    // Load all GLBs async; render loop can start immediately.
    const loads = SECTION_KEYS_IN_ORDER.map(async (key, index) => {
      const path = HOMEPAGE_SECTION_GLBS[key]
      const gltf = await loadSectionGltf(path)
      const root = gltf.scene.clone(true)
      root.name = `glb:${key}`

      // Center FIRST (this modifies position), then place per section.
      root.position.set(0, 0, 0)
      centerModelAtOrigin(root)
      root.position.y = -index * state.sectionHeight3d

      const t = MODEL_TUNING[key] ?? MODEL_TUNING.hero
      const deg = Math.PI / 180
      root.rotation.set(t.rotateXDeg * deg, t.rotateYDeg * deg, t.rotateZDeg * deg)

      uniformScaleToFitCamera(root, camera, state.camDist, t.frameFill, t.scale)

      root.position.x += (t.horizontalBias ?? 0) * 0.08
      root.position.y += (t.verticalBias ?? 0) * 0.08

      root.traverse((obj) => {
        if (!obj.isMesh) return
        obj.frustumCulled = true
        state.meshes.push(obj)
      })

      state.roots.set(key, root)
      scene.add(root)
      console.log('[useUnifiedScene] loaded', key, 'pos=', root.position, 'path=', path)
    })

    void Promise.all(loads).catch((e) => {
      console.error('[useUnifiedScene] Failed to load one or more GLBs', e)
    })

    // Initial resize for aspect (renderer already created by caller).
    const w = renderer.domElement.clientWidth || window.innerWidth
    const h = renderer.domElement.clientHeight || window.innerHeight
    camera.aspect = Math.max(w, 1) / Math.max(h, 1)
    camera.updateProjectionMatrix()
  }

  function updateCamera(scrollY, viewportH = window.innerHeight) {
    if (!state.camera) return
    const vh = Math.max(viewportH, 1)
    const cameraY = -(scrollY / vh) * state.sectionHeight3d
    state.camera.position.y = cameraY
    state.camera.lookAt(0, cameraY, 0)
  }

  function resize(w, h) {
    if (!state.camera) return
    state.camera.aspect = Math.max(w, 1) / Math.max(h, 1)
    state.camera.updateProjectionMatrix()
  }

  function getScene() {
    return state.scene
  }

  function getCamera() {
    return state.camera
  }

  function getAllMeshes() {
    return state.meshes
  }

  function destroy() {
    state.meshes.length = 0
    state.roots.clear()
    state.scene = null
    state.camera = null
  }

  return {
    initScene,
    updateCamera,
    resize,
    getScene,
    getCamera,
    getAllMeshes,
    destroy,
  }
}

