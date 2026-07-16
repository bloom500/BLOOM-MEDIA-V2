<template>
  <div class="morphing-bg" aria-hidden="true">
    <canvas v-show="!showFallback" ref="canvasRef" class="morphing-bg__canvas" />
    <div v-if="showFallback" class="morphing-bg__fallback" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const showFallback = ref(false)

let _cleanup = () => {}

/**
 * Noise + FBM în GLSL (echivalent aproximativ cu mx_noise_float × 3 octave din varianta TSL).
 * Uniform names prefix uMorph* ca să nu intre în conflict cu alte patch-uri.
 */
const MORPH_GLSL = `
uniform float uMorphFreq;
uniform float uMorphSpeed;
uniform float uMorphStrength;
uniform float uMorphTime;

float morphHash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p += dot(p, p + 19.19);
  return fract((p.x + p.y) * p.z);
}

float morphNoise3(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(
      mix(morphHash(i), morphHash(i + vec3(1.0, 0.0, 0.0)), f.x),
      mix(morphHash(i + vec3(0.0, 1.0, 0.0)), morphHash(i + vec3(1.0, 1.0, 0.0)), f.x),
      f.y
    ),
    mix(
      mix(morphHash(i + vec3(0.0, 0.0, 1.0)), morphHash(i + vec3(1.0, 0.0, 1.0)), f.x),
      mix(morphHash(i + vec3(0.0, 1.0, 1.0)), morphHash(i + vec3(1.0, 1.0, 1.0)), f.x),
      f.y
    ),
    f.z
  );
}
`

onMounted(async () => {
  if (!import.meta.client || !canvasRef.value) return

  try {
    const THREE = await import('three')
    const canvas = canvasRef.value
    const isMobile = window.innerWidth < 768
    // DPR 1 peste tot — aliniat cu ReliefSlab/ServiciiBackground și cu
    // immersive-g.com: suprafață difuză, fluiditatea primează.
    const dprCap = 1
    // Antialias off on mobile — MSAA is a major fill-rate cost; the
    // smooth shaded surface masks aliasing well enough at retina DPR.
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobile,
      alpha: false,
      powerPreference: 'high-performance',
    })
    renderer.outputColorSpace = THREE.SRGBColorSpace
    // Match clearColor to the plane material base color so any uncovered
    // pixel (e.g. extreme ultrawide > 2.5 aspect) blends seamlessly.
    renderer.setClearColor(new THREE.Color(0xeae5de), 1)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap))

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10)
    camera.position.z = 5

    let compiledShader = null

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xeae5de),
      roughness: 0.96,
      metalness: 0.0,
      flatShading: false,
    })

    material.onBeforeCompile = (shader) => {
      compiledShader = shader
      shader.uniforms.uMorphFreq = { value: 1.75 }
      shader.uniforms.uMorphSpeed = { value: 0.062 }
      shader.uniforms.uMorphStrength = { value: 0.18 }
      shader.uniforms.uMorphTime = { value: 0.0 }

      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${MORPH_GLSL}\n`)
        .replace(
          '#include <begin_vertex>',
          `
            #include <begin_vertex>
            vec3 _mp = position * uMorphFreq;
            float _mt = uMorphTime * uMorphSpeed;
            float _o1 = morphNoise3(_mp + vec3(_mt));
            float _o2 = morphNoise3(_mp * 2.1 + vec3(_mt * 0.73));
            float _o3 = morphNoise3(_mp * 4.6 + vec3(_mt * 1.45));
            float _fbm = _o1 * 0.5 + _o2 * 0.3 + _o3 * 0.2;
            float _disp = _fbm * uMorphStrength;
            transformed += normalize(normal) * _disp;
          `,
        )
    }

    material.needsUpdate = true

    // 280→220 on desktop (still smooth, ~40% fewer vertex shader calls).
    // 140→96 on mobile (vertex shader runs FBM-3 noise per vertex, expensive on
    // integrated GPUs — the visible relief is dominated by lighting+normals,
    // not geometry density).
    const segments = isMobile ? 96 : 220
    // Width 5.0 covers the OrthographicCamera frustum at any aspect ratio up
    // to 21:9 (≈2.33 → frustum width 4.66). The old 3.0 left ~0.28 units
    // uncovered on each side at 16:9, showing clearColor as a visible strip.
    // PlaneGeometry(5.0, 3.0, 220, 220) has the same vertex count as
    // (3.0, 3.0, 220, 220) — no perf cost, just wider coverage.
    const geometry = new THREE.PlaneGeometry(5.0, 3.0, segments, segments)
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const keyLight = new THREE.DirectionalLight(0xfff8f0, 5.0)
    keyLight.position.set(-2.2, 3.8, 4.5)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xfff3e0, 0.65)
    fillLight.position.set(3.5, -1.5, 2.0)
    scene.add(fillLight)

    scene.add(new THREE.AmbientLight(0xfff8f0, 0.22))

    // iOS bar-collapse fires resize at every scroll-direction change. We
    // freeze width on mount and ignore resizes where the width hasn't
    // changed — orientationchange handles real rotation separately.
    let frozenW = window.innerWidth
    let frozenH = window.innerHeight
    const resize = () => {
      const w = window.innerWidth
      if (isMobile && w === frozenW) return
      const h = window.innerHeight
      frozenW = w
      frozenH = h
      const aspect = w / h
      camera.left = -aspect
      camera.right = aspect
      camera.top = 1
      camera.bottom = -1
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
    }
    const onOrientation = () => {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        frozenW = window.innerWidth
        frozenH = window.innerHeight
        const aspect = frozenW / frozenH
        camera.left = -aspect
        camera.right = aspect
        camera.top = 1
        camera.bottom = -1
        camera.updateProjectionMatrix()
        renderer.setSize(frozenW, frozenH, false)
      }))
    }
    // Initial size from the frozen values captured above.
    {
      const aspect = frozenW / frozenH
      camera.left = -aspect
      camera.right = aspect
      camera.top = 1
      camera.bottom = -1
      camera.updateProjectionMatrix()
      renderer.setSize(frozenW, frozenH, false)
    }
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('orientationchange', onOrientation, { passive: true })

    let raf = 0
    // Mobile: render every other frame (~30fps). Morph is slow (uMorphSpeed=
    // 0.062), so half-rate is imperceptible but halves GPU pressure during
    // touch-scroll where the page is competing for the same render thread.
    let frameSkip = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      // Background-tab idle: skip work
      if (typeof document !== 'undefined' && document.hidden) return
      if (isMobile) {
        frameSkip = (frameSkip + 1) % 2
        if (frameSkip !== 0) return
      }
      if (compiledShader) {
        compiledShader.uniforms.uMorphTime.value = performance.now() * 0.001
      }
      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(tick)

    _cleanup = () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('orientationchange', onOrientation)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  } catch (err) {
    console.error('[MorphingReliefBackground] init failed →', err)
    showFallback.value = true
  }
})

onUnmounted(() => {
  _cleanup()
  _cleanup = () => {}
})
</script>

<style scoped>
.morphing-bg {
  position: fixed;
  inset: 0;
  width: 100vw;
  min-width: 100vw;
  /* lvh = large viewport, behind iOS bar — same rationale as ReliefSlab. */
  height: 100lvh;
  min-height: 100lvh;
  z-index: 0;
  pointer-events: none;
}

.morphing-bg__canvas {
  display: block;
  width: 100%;
  height: 100%;
  vertical-align: top;
}

.morphing-bg__fallback {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, #ebe6df 0%, #e1dbd5 100%);
}
</style>
