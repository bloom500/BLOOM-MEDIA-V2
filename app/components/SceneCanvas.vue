<template>
  <canvas ref="canvasRef" class="scene-canvas" aria-hidden="true" />
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'
import { useUnifiedScene } from '~/composables/useUnifiedScene'

const canvasRef = ref(null)

let cleanup = () => {}

onMounted(() => {
  void (async () => {
    await nextTick()
    if (!import.meta.client || !canvasRef.value) return

    const canvas = canvasRef.value
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance',
    })

    renderer.outputColorSpace = THREE.SRGBColorSpace
    const paperBg = new THREE.Color().setRGB(0.94, 0.92, 0.9, THREE.SRGBColorSpace)
    renderer.setClearColor(paperBg, 1)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

    const unified = useUnifiedScene()
    // Calibrate section height in world units so 1 section ≈ 1 viewport height.
    // viewportHeight3D = 2 * tan(fov/2) * cameraZ
    const tmpFov = 46 * Math.PI / 180
    const camZ = 5.1
    const viewportHeight3D = 2 * Math.tan(tmpFov / 2) * camZ
    console.log('[SceneCanvas] viewportHeight3D', viewportHeight3D)

    await unified.initScene(renderer, { sectionHeight3d: viewportHeight3D })

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      renderer.setSize(w, h, false)
      unified.resize(w, h)
    }
    resize()

    let currentScroll = window.scrollY
    let loggedScroll = false

    const onScroll = () => {
      currentScroll = window.scrollY
      if (!loggedScroll) {
        console.log('[SceneCanvas] scroll event firing, scrollY=', currentScroll)
        loggedScroll = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', resize, { passive: true })
    onScroll()

    let raf = 0
    let loggedChildren = false
    let frame = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      frame += 1
      const scene = unified.getScene()
      const camera = unified.getCamera()
      if (!scene || !camera) return
      unified.updateCamera(currentScroll, window.innerHeight)
      if (frame % 60 === 0) {
        console.log('[SceneCanvas] camera Y:', camera.position.y, 'scroll:', currentScroll)
      }
      if (!loggedChildren && scene.children?.length) {
        console.log('[SceneCanvas] scene children Y positions:')
        scene.children.forEach((c) => console.log(c.name || c.type, c.position?.y))
        loggedChildren = true
      }
      renderer.setClearColor(paperBg, 1)
      renderer.clear(true, true, true)
      renderer.render(scene, camera)
    }
    tick()

    cleanup = () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', resize)
      unified.destroy()
      renderer.dispose()
    }
  })()
})

onUnmounted(() => {
  cleanup()
  cleanup = () => {}
})
</script>

<style scoped>
.scene-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  display: block;
  opacity: 1;
  mix-blend-mode: normal;
  background: rgb(240, 235, 230);
}
</style>

