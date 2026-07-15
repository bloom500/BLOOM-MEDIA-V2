<template>
  <div class="immersive-bg" aria-hidden="true">
    <canvas v-show="!showFallback" ref="canvasRef" class="immersive-bg__canvas" />
    <div v-if="showFallback" class="immersive-bg__fallback" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  preset: {
    type: String,
    default: 'beauty',
  },
})

const RELIEF_PRESETS = {
  beauty: {
    tex1: '/models/optimized/optimized-shaders/beauty-tex1.png',
    tex2: '/models/optimized/optimized-shaders/beauty-tex2.png',
  },
  bloom: {
    tex1: '/models/optimized/optimized-shaders/bloom-tex1.png',
    tex2: '/models/optimized/optimized-shaders/bloom-tex2.png',
  },
  mandala: {
    tex1: '/models/optimized/optimized-shaders/mandala-tex1.png',
    tex2: '/models/optimized/optimized-shaders/mandala-tex2.png',
  },
}

const canvasRef = ref(null)
const showFallback = ref(false)

let cleanup = () => {}

function configurePackedDataTexture(texture) {
  texture.colorSpace = THREE.NoColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.generateMipmaps = false
}

onMounted(() => {
  if (!import.meta.client || !canvasRef.value) return

  const preset = RELIEF_PRESETS[props.preset] ?? RELIEF_PRESETS.beauty

  const renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.setClearColor(new THREE.Color(0.94, 0.92, 0.9), 1)

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -2, 2)
  camera.position.z = 1

  const trailCanvas = document.createElement('canvas')
  trailCanvas.width = 512
  trailCanvas.height = 512
  const trailCtx = trailCanvas.getContext('2d', { alpha: true })
  const trailTexture = new THREE.CanvasTexture(trailCanvas)
  trailTexture.colorSpace = THREE.NoColorSpace
  trailTexture.minFilter = THREE.LinearFilter
  trailTexture.magFilter = THREE.LinearFilter
  trailTexture.wrapS = THREE.ClampToEdgeWrapping
  trailTexture.wrapT = THREE.ClampToEdgeWrapping

  const pointer = { x: 0.5, y: 0.5 }
  const last = { x: 0.5, y: 0.5 }
  const smooth = { x: 0.5, y: 0.5 }

  let disposed = false
  let raf = 0
  let hidden = false

  const loader = new THREE.TextureLoader()

  Promise.all([
    loader.loadAsync(preset.tex1),
    loader.loadAsync(preset.tex2),
  ])
    .then(([tex1, tex2]) => {
      if (disposed || !trailCtx) return

      configurePackedDataTexture(tex1)
      configurePackedDataTexture(tex2)

      const uniforms = {
        uTex1: { value: tex1 },
        uTex2: { value: tex2 },
        uTrail: { value: trailTexture },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uAspect: { value: new THREE.Vector2(16, 9) },
        uStrength: { value: 0.22 },
        uTextureScale: { value: 1.14 },
        uContrast: { value: 1.15 },
        uBrightness: { value: 1.06 },
      }

      const geometry = new THREE.PlaneGeometry(2, 2, 256, 144)
      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: `
          varying vec2 vUv;
          uniform sampler2D uTrail;
          uniform float uStrength;
          uniform float uTextureScale;
          uniform vec2 uResolution;
          uniform vec2 uAspect;

          vec2 coverUv(vec2 uv, vec2 screen, vec2 texAspect, float scale) {
            float rs = screen.x / max(screen.y, 0.0001);
            float rt = texAspect.x / max(texAspect.y, 0.0001);
            vec2 u = uv - 0.5;
            if (rs > rt) {
              u.y *= rs / rt;
            } else {
              u.x *= rt / rs;
            }
            return u * scale + 0.5;
          }

          void main() {
            vec2 cuv = coverUv(uv, uResolution, uAspect, uTextureScale);
            float t = texture2D(uTrail, cuv).r;
            float disp = smoothstep(0.05, 1.0, t) * uStrength;
            vec3 pos = position;
            pos.z += disp;
            pos.z += sin((uv.x + uv.y) * 6.2831 + t * 4.0) * 0.003;
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          precision highp float;
          varying vec2 vUv;
          uniform sampler2D uTex1;
          uniform sampler2D uTex2;
          uniform sampler2D uTrail;
          uniform float uTime;
          uniform vec2 uResolution;
          uniform vec2 uAspect;
          uniform float uTextureScale;
          uniform float uContrast;
          uniform float uBrightness;

          vec2 coverUv(vec2 uv, vec2 screen, vec2 texAspect, float scale) {
            float rs = screen.x / max(screen.y, 0.0001);
            float rt = texAspect.x / max(texAspect.y, 0.0001);
            vec2 u = uv - 0.5;
            if (rs > rt) {
              u.y *= rs / rt;
            } else {
              u.x *= rt / rs;
            }
            return u * scale + 0.5;
          }

          float hash21(vec2 p) {
            p = fract(p * vec2(234.34, 435.345));
            p += dot(p, p + 34.23);
            return fract(p.x * p.y);
          }

          void main() {
            vec2 uv = coverUv(vUv, uResolution, uAspect, uTextureScale);

            vec3 t1 = texture2D(uTex1, uv).rgb;
            vec3 t2 = texture2D(uTex2, uv).rgb;

            float s0 = t1.r;
            float s1 = t1.g;
            float s2 = t1.b;
            float s3 = t2.r;
            float s4 = t2.g;
            float s5 = t2.b;

            float trail = texture2D(uTrail, uv).r;
            float idx = clamp(trail * 5.0, 0.0, 5.0);

            float w0 = max(1.0 - abs(idx - 0.0), 0.0);
            float w1 = max(1.0 - abs(idx - 1.0), 0.0);
            float w2 = max(1.0 - abs(idx - 2.0), 0.0);
            float w3 = max(1.0 - abs(idx - 3.0), 0.0);
            float w4 = max(1.0 - abs(idx - 4.0), 0.0);
            float w5 = max(1.0 - abs(idx - 5.0), 0.0);

            float sumW = max(w0 + w1 + w2 + w3 + w4 + w5, 0.0001);
            float value = (
              s0 * w0 + s1 * w1 + s2 * w2 +
              s3 * w3 + s4 * w4 + s5 * w5
            ) / sumW;

            value = pow(max(value, 0.0001), uContrast);
            value *= uBrightness;
            value = clamp(value, 0.0, 1.0);

            vec3 base = vec3(value);
            base = mix(base, base * vec3(0.985, 0.975, 0.96), 0.25);

            float vig = smoothstep(1.15, 0.25, length(vUv - 0.5));
            base *= mix(0.82, 1.0, vig);

            float grain = (hash21(gl_FragCoord.xy + uTime * 60.0) - 0.5) * 0.022;
            base += grain;

            float grad = smoothstep(1.0, 0.2, vUv.y);
            base *= mix(0.88, 1.0, grad);

            gl_FragColor = vec4(clamp(base, 0.0, 1.0), 1.0);
          }
        `,
      })

      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      const resize = () => {
        const w = window.innerWidth
        const h = window.innerHeight
        renderer.setSize(w, h, false)
        uniforms.uResolution.value.set(w, h)
      }
      resize()

      const onPointerMove = (event) => {
        pointer.x = event.clientX / Math.max(window.innerWidth, 1)
        pointer.y = 1 - event.clientY / Math.max(window.innerHeight, 1)
      }

      const onVisibility = () => {
        hidden = document.hidden
      }

      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('resize', resize, { passive: true })
      document.addEventListener('visibilitychange', onVisibility)

      trailCtx.fillStyle = 'black'
      trailCtx.fillRect(0, 0, trailCanvas.width, trailCanvas.height)

      const drawStamp = (x, y, radius = 44, alpha = 0.22) => {
        const gx = x * trailCanvas.width
        const gy = (1 - y) * trailCanvas.height
        const g = trailCtx.createRadialGradient(gx, gy, 0, gx, gy, radius)
        g.addColorStop(0, `rgba(255,255,255,${alpha})`)
        g.addColorStop(1, 'rgba(255,255,255,0)')
        trailCtx.fillStyle = g
        trailCtx.beginPath()
        trailCtx.arc(gx, gy, radius, 0, Math.PI * 2)
        trailCtx.fill()
      }

      const tick = (t) => {
        raf = requestAnimationFrame(tick)
        if (hidden) return

        uniforms.uTime.value = t * 0.001

        smooth.x += (pointer.x - smooth.x) * 0.18
        smooth.y += (pointer.y - smooth.y) * 0.18

        trailCtx.globalCompositeOperation = 'source-over'
        trailCtx.fillStyle = 'rgba(0, 0, 0, 0.07)'
        trailCtx.fillRect(0, 0, trailCanvas.width, trailCanvas.height)

        const steps = 6
        for (let i = 0; i <= steps; i++) {
          const a = i / steps
          const ix = last.x + (smooth.x - last.x) * a
          const iy = last.y + (smooth.y - last.y) * a
          drawStamp(ix, iy)
        }

        last.x = smooth.x
        last.y = smooth.y
        trailTexture.needsUpdate = true

        renderer.render(scene, camera)
      }
      tick(0)

      cleanup = () => {
        disposed = true
        cancelAnimationFrame(raf)
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('resize', resize)
        document.removeEventListener('visibilitychange', onVisibility)
        geometry.dispose()
        material.dispose()
        tex1.dispose()
        tex2.dispose()
        trailTexture.dispose()
        renderer.dispose()
      }
    })
    .catch((error) => {
      console.error('[ImmersiveReliefBackground] Texture load failed, using fallback', error)
      showFallback.value = true
      renderer.dispose()
      cleanup = () => {
        disposed = true
      }
    })
})

onUnmounted(() => {
  cleanup()
  cleanup = () => {}
})
</script>

<style scoped>
.immersive-bg {
  position: fixed;
  inset: 0;
  width: 100vw;
  /* svh = stable; canvas size locked, no resize on iOS bar collapse */
  height: 100svh;
  z-index: 0;
  pointer-events: none;
}

.immersive-bg__canvas,
.immersive-bg__fallback {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.immersive-bg__canvas {
  opacity: 1;
  mix-blend-mode: normal;
  background: rgb(240, 235, 230);
}

.immersive-bg__fallback {
  background:
    radial-gradient(120% 95% at 50% 50%, rgba(255, 255, 255, 0.1), transparent 60%),
    linear-gradient(180deg, rgb(240, 235, 230), rgb(227, 220, 210));
}
</style>

