<template>
  <div class="svc3d" aria-hidden="true">
    <canvas ref="canvasRef" class="svc3d__canvas" />
    <div class="svc3d__overlay" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

const GLB_URL = '/models/woman-services.glb'
const DRACO = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let modelRoot: THREE.Group | null = null
let raf = 0
let resizeHandler = () => {}

function fitCamera() {
  if (!modelRoot || !camera) return
  const box = new THREE.Box3().setFromObject(modelRoot)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  modelRoot.position.sub(center)

  const distance = 4
  const fovRad = (45 * Math.PI) / 180
  const visibleH = 2 * distance * Math.tan(fovRad / 2)
  const visibleW = visibleH * (window.innerWidth / window.innerHeight)
  const sx = visibleW / Math.max(size.x, 1e-6)
  const sy = visibleH / Math.max(size.y, 1e-6)
  /* Scale mic → modelul e ~28% din viewport, nu full-screen */
  const scale = Math.max(sx, sy) * 0.28
  modelRoot.scale.setScalar(scale)

  /* Centrează orizontal pe dreapta (camera e la z=4, modelul în dreapta-sus) */
  const screenHalfW = visibleW * 0.5   // jumătatea dreaptă a ecranului în world
  const modelHalfW = size.x * scale * 0.5
  modelRoot.position.set(
    screenHalfW - modelHalfW + 0.3,  // dreapta ecranului + mic offset
    -size.y * scale * 0.15,           // vertical: centrat pe axa Y
    0
  )
  modelRoot.updateMatrixWorld(true)
}

async function init() {
  const canvas = canvasRef.value
  if (!canvas) return

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight, false)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0, 4)
  camera.lookAt(0, 0, 0)

  // Cinematic: low ambient + soft directional
  scene.add(new THREE.AmbientLight(0xffffff, 0.6))
  const dir = new THREE.DirectionalLight(0xffeedd, 1.2)
  dir.position.set(2, 3, 2)
  scene.add(dir)

  const draco = new DRACOLoader()
  draco.setDecoderPath(DRACO)
  const loaderDraco = new GLTFLoader()
  loaderDraco.setDRACOLoader(draco)
  const plain = new GLTFLoader()

  let gltf: any = null
  for (const url of [GLB_URL]) {
    try {
      gltf = await new Promise((res, rej) => {
        loaderDraco.load(
          url,
          (g: any) => res(g),
          undefined,
          (e: any) => rej(e)
        )
      })
      break
    } catch {
      try {
        gltf = await new Promise((res, rej) => {
          plain.load(
            url,
            (g: any) => res(g),
            undefined,
            (e: any) => rej(e)
          )
        })
        break
      } catch {
        /* continue */
      }
    }
  }
  draco.dispose()
  if (!gltf) return

  modelRoot = gltf.scene
  scene.add(modelRoot)
  fitCamera()

  resizeHandler = () => {
    camera!.aspect = window.innerWidth / window.innerHeight
    camera!.updateProjectionMatrix()
    renderer!.setSize(window.innerWidth, window.innerHeight, false)
    fitCamera()
  }
  window.addEventListener('resize', resizeHandler)

  tick()
}

function tick() {
  if (!renderer || !scene || !camera) return
  raf = requestAnimationFrame(tick)
  renderer.render(scene, camera)
}

onMounted(() => { init() })

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resizeHandler)
  modelRoot?.traverse((c) => { if (c.isMesh) { c.geometry?.dispose(); if (Array.isArray(c.material)) c.material.forEach(m => m.dispose()); else c.material?.dispose() } })
  renderer?.dispose()
  renderer = null
  scene = null
  camera = null
  modelRoot = null
})
</script>

<style scoped>
.svc3d {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.svc3d__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /* Cinematic: slow parallax-like drift via CSS */
  animation: svc3d-drift 18s ease-in-out infinite alternate;
  will-change: transform;
}

@keyframes svc3d-drift {
  from { transform: scale(1.04) translateX(-4px) translateY(-2px); }
  to   { transform: scale(1.0) translateX(4px) translateY(2px); }
}

.svc3d__overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 80% at 70% 50%, transparent 30%, rgba(0,0,0,0.18) 100%),
    linear-gradient(to right, rgba(0,0,0,0.08) 0%, transparent 45%);
  mix-blend-mode: multiply;
  pointer-events: none;
}
</style>
