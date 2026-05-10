<template>
  <div
    ref="rootRef"
    class="section-model-bg"
    :class="className"
    :style="rootStyle"
    aria-hidden="true"
  >
    <canvas ref="canvasRef" class="section-model-bg__canvas" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useAttrs } from 'vue'
import * as THREE from 'three'
import { useGhostCursor } from '~/composables/useGhostCursor'
import { usePaperOverlay } from '~/composables/usePaperOverlay'
import { loadSectionGltf } from '~/lib/three/sectionModelLoader'

const props = withDefaults(
  defineProps<{
    modelPath: string
    scale?: number
    floatAmplitude?: number
    floatSpeed?: number
    /** How much of the view height the model fills (1 ≈ fit; above 1 bleeds past edges). */
    frameFill?: number
    opacity?: number
    className?: string
    horizontalBias?: number
    verticalBias?: number
    modelRotateXDeg?: number
    modelRotateYDeg?: number
    modelRotateZDeg?: number
    /**
     * When true: full opacity, no mobile hide, no intersection culling,
     * fixed camera (0,0,6), strong lights, static mesh (no motion).
     */
    visibilityDebug?: boolean
  }>(),
  {
    scale: 1,
    floatAmplitude: 0.015,
    floatSpeed: 0.2,
    frameFill: 1.12,
    opacity: 1,
    className: '',
    horizontalBias: 0,
    verticalBias: 0,
    visibilityDebug: false,
  },
)

const attrs = useAttrs()

const rootRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const isCoarse = ref(false)
const isNarrow = ref(false)
const prefersReduce = ref(false)

const effectiveOpacity = computed(() => {
  if (props.visibilityDebug) {
    return 1
  }
  let o = props.opacity
  if (prefersReduce.value) {
    return Math.min(o, 0.35)
  }
  if (isCoarse.value || isNarrow.value) {
    return o * 0.65
  }
  return o
})

const rootStyle = computed(() => ({
  ...(attrs.style as Record<string, string> | undefined),
}))

if (import.meta.client) {
  try {
    await loadSectionGltf(props.modelPath)
  }
  catch (e) {
    console.error('[SectionModelCanvas] Preload failed (will retry on mount)', props.modelPath, e)
  }
}

function updateWorld(model: THREE.Object3D) {
  model.updateMatrixWorld(true)
}

function centerModelAtOrigin(model: THREE.Object3D) {
  updateWorld(model)
  const box = new THREE.Box3().setFromObject(model)
  if (box.isEmpty()) {
    console.warn('[SectionModelCanvas] Empty bounding box for', props.modelPath)
    return
  }
  const center = box.getCenter(new THREE.Vector3())
  model.position.sub(center)
  updateWorld(model)
}

function uniformScaleToFitCamera(
  model: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  camDistance: number,
  fill = 0.85,
) {
  updateWorld(model)
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z, 1e-6)
  const vFov = (camera.fov * Math.PI) / 180
  const frustumHeight = 2 * camDistance * Math.tan(vFov / 2)
  const s = ((frustumHeight * fill) / maxDim) * props.scale
  model.scale.setScalar(s)
}

function countVertices(root: THREE.Object3D) {
  let n = 0
  root.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.isMesh && m.geometry?.attributes?.position) {
      n += m.geometry.attributes.position.count
    }
  })
  return n
}

let cleanupFn: (() => void) | null = null

onMounted(() => {
  void (async () => {
    await nextTick()
    if (!import.meta.client || !canvasRef.value || !rootRef.value) {
      console.warn('[SectionModelCanvas] Skip init — no canvas or root', {
        modelPath: props.modelPath,
      })
      return
    }

    prefersReduce.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    isCoarse.value = window.matchMedia('(pointer: coarse)').matches
    isNarrow.value = window.matchMedia('(max-width: 768px)').matches

    if (!props.visibilityDebug && isNarrow.value && isCoarse.value) {
      console.info(
        '[SectionModelCanvas] Skipping WebGL on narrow+coarse (set visibilityDebug to force)',
        props.modelPath,
      )
      rootRef.value.style.display = 'none'
      return
    }

    let cancelled = false
    let gltf: Awaited<ReturnType<typeof loadSectionGltf>>
    try {
      gltf = await loadSectionGltf(props.modelPath)
    }
    catch (e) {
      console.error('[SectionModelCanvas] Failed to load GLB', props.modelPath, e)
      return
    }

    if (cancelled || !canvasRef.value || !rootRef.value) {
      return
    }

    const verts = countVertices(gltf.scene)
    console.log('[SectionModelCanvas] Loaded', props.modelPath, { vertexCountApprox: verts })

    const canvas = canvasRef.value
    const rootEl = rootRef.value

    const scene = new THREE.Scene()
    const camDist = 5.1
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 200)
    camera.position.set(0, 0, camDist)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    if (props.visibilityDebug) {
      renderer.toneMapping = THREE.NoToneMapping
    }
    else {
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.06
    }

    const activePos = { x: 0.5, y: 0.5 }
    const smoothPos = { x: 0.5, y: 0.5 }
    let revealStrength = 0

    const paperOverlay = usePaperOverlay()
    const ghostCursor = useGhostCursor((x, y) => {
      activePos.x = x
      activePos.y = y
      revealStrength = 1
    })

    const updateActivePosFromMouse = (event: MouseEvent) => {
      activePos.x = event.clientX / Math.max(window.innerWidth, 1)
      activePos.y = 1 - (event.clientY / Math.max(window.innerHeight, 1))
      revealStrength = 1
      ghostCursor.userMoved(activePos.x, activePos.y)
    }
    window.addEventListener('mousemove', updateActivePosFromMouse, { passive: true })
    ghostCursor.startIdleCountdown()

    const dprCap = Math.min(window.devicePixelRatio, props.visibilityDebug ? 2 : 1.5)
    const resize = () => {
      const w = Math.max(rootEl.clientWidth, 1)
      const h = Math.max(rootEl.clientHeight, 1)
      renderer.setPixelRatio(dprCap)
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      paperOverlay.resize(w, h)
    }
    resize()

    paperOverlay.init(renderer, {
      paperBgColor: [0.94, 0.92, 0.9],
      reliefPaperColor: [0.85, 0.83, 0.8],
      revealRadius: 0.22,
      revealStrength: 0.0,
      edgeSoftness: 0.08,
      noiseScale: 1.0,
    })
    paperOverlay.resize(rootEl.clientWidth, rootEl.clientHeight)

    const paperClear = new THREE.Color().setRGB(0.94, 0.92, 0.9, THREE.SRGBColorSpace)

    const model = gltf.scene.clone(true)
    model.position.set(0, 0, 0)
    centerModelAtOrigin(model)
    const deg = Math.PI / 180
    model.rotation.set(
      props.modelRotateXDeg * deg,
      props.modelRotateYDeg * deg,
      props.modelRotateZDeg * deg,
    )
    const fill = props.visibilityDebug ? 0.95 : props.frameFill
    uniformScaleToFitCamera(model, camera, camDist, fill)

    model.position.x += props.horizontalBias * 0.08
    model.position.y += props.verticalBias * 0.08

    model.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) {
        return
      }
      mesh.frustumCulled = true
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const mat of mats) {
        if (mat && 'side' in mat) {
          ;(mat as THREE.MeshStandardMaterial).side = THREE.DoubleSide
        }
        if (mat && 'opacity' in mat) {
          const material = mat as THREE.Material & { opacity: number, transparent: boolean }
          material.opacity *= effectiveOpacity.value
          material.transparent = material.transparent || effectiveOpacity.value < 1
          material.depthWrite = effectiveOpacity.value >= 1
        }
        if (mat && 'needsUpdate' in mat) {
          mat.needsUpdate = true
        }
      }
    })

    scene.add(model)

    paperOverlay.captureOriginalMaterials(scene)

    const ambient = new THREE.AmbientLight(0xf7f3ee, 0.58)
    scene.add(ambient)
    const directional = new THREE.DirectionalLight(0xfff1dc, 2.15)
    directional.position.set(4.2, 5.8, 4.4)
    scene.add(directional)
    const hemi = new THREE.HemisphereLight(0xd8e6ff, 0x2f3138, 0.55)
    scene.add(hemi)

    let ro: ResizeObserver | null = new ResizeObserver(resize)
    ro.observe(rootEl)

    let visible = true
    let io: IntersectionObserver | null = null
    if (!props.visibilityDebug) {
      io = new IntersectionObserver(
        (entries) => {
          const e = entries[0]
          visible = e ? e.isIntersecting : true
        },
        { threshold: [0, 0.01, 0.05] },
      )
      io.observe(rootEl)
    }

    const baseY = model.position.y
    const clock = new THREE.Clock()
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!props.visibilityDebug && !visible) {
        return
      }
      const t = clock.getElapsedTime()
      const fAmp = prefersReduce.value || props.floatAmplitude <= 0
        ? 0
        : props.floatAmplitude
      model.position.y = baseY + Math.sin(t * props.floatSpeed) * fAmp

      smoothPos.x += (activePos.x - smoothPos.x) * 0.08
      smoothPos.y += (activePos.y - smoothPos.y) * 0.08
      paperOverlay.setMouse(smoothPos.x, smoothPos.y)
      paperOverlay.setRevealStrength(revealStrength)

      // Pass A: full-colour scene → colorRT (clear = paper RGB, alpha 0).
      paperOverlay.renderColorPass(renderer, scene, camera, paperClear)

      // Pass B: bas-relief materials → reliefRT (clear = solid paper).
      paperOverlay.renderReliefPass(renderer, scene, camera, paperClear)

      // Pass 3: composite colour + relief + procedural paper to the existing canvas.
      paperOverlay.render(renderer, performance.now())
    }
    tick()

    cleanupFn = () => {
      cancelled = true
      cancelAnimationFrame(raf)
      ro?.disconnect()
      ro = null
      io?.disconnect()
      io = null
      window.removeEventListener('mousemove', updateActivePosFromMouse)
      ghostCursor.destroy()
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose()
          const mat = obj.material
          if (Array.isArray(mat)) {
            mat.forEach((m) => m.dispose())
          }
          else {
            mat?.dispose()
          }
        }
      })
      paperOverlay.destroy()
      renderer.dispose()
    }
  })()
})

onUnmounted(() => {
  cleanupFn?.()
  cleanupFn = null
})
</script>

<style scoped>
.section-model-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.section-model-bg__canvas {
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
