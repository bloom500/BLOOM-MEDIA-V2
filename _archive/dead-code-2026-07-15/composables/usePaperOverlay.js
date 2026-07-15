/**
 * usePaperOverlay — 3-pass bas-relief composite (single renderer, no EffectComposer).
 *
 * A) colorRT — full materials, clear = paperBg RGB + alpha 0
 * B) reliefRT — per-mesh relief ShaderMaterial, clear = paperBg RGB + alpha 1
 * C) screen — fullscreen composite quad
 */

import { shallowRef } from 'vue'
import * as THREE from 'three'

/** Paper background (clear + composite procedural base) — sRGB */
const PAPER_BG_VEC3 = Object.freeze([0.94, 0.92, 0.9])
/** Slightly darker for relief albedo so shape reads */
const RELIEF_ALBEDO_VEC3 = Object.freeze([0.85, 0.83, 0.8])

const FULLSCREEN_VERT = /* glsl */`
  varying vec2 vUv;

  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const RELIEF_VERT = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vScreenUV;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPosition.xyz);
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = clip;
    vScreenUV = (clip.xy / clip.w) * 0.5 + 0.5;
  }
`

const SHARED_NOISE = /* glsl */`
  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm2(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; i++) {
      v += a * noise2(p);
      p = rot * p * 2.1 + vec2(100.0);
      a *= 0.5;
    }
    return v;
  }

  vec3 proceduralPaperBg(vec2 uv, vec2 resolution, vec3 base, float time) {
    float aspect = resolution.x / max(resolution.y, 0.0001);
    float grain = (hash21(gl_FragCoord.xy + time * 0.07) - 0.5) * 0.018;
    float fibers = fbm2(vec2(uv.x * aspect * 6.0, uv.y * 14.0) + 2.0) * 0.012;
    float tone = (fbm2(uv * 3.2 + 5.0) - 0.5) * 0.02;
    vec3 c = base + grain - fibers + vec3(tone);
    return clamp(c, 0.88, 0.98);
  }
`

const RELIEF_FRAG = /* glsl */`
  precision highp float;

  uniform vec3 uPaperColor;
  uniform vec2 uResolution;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vScreenUV;

  ${SHARED_NOISE}

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewDir);
    vec3 keyLightDir = normalize(vec3(0.34, 0.96, 0.58));
    vec3 fillLightDir = normalize(vec3(-0.72, -0.18, 0.38));

    float keyDiffuse = max(dot(n, keyLightDir), 0.0);
    keyDiffuse = pow(keyDiffuse, 1.85);

    float fillDiffuse = max(dot(n, fillLightDir), 0.0);
    fillDiffuse = pow(fillDiffuse, 1.25) * 0.36;

    float diffuse = keyDiffuse + fillDiffuse;

    float ndv = max(dot(n, v), 0.0);
    float ao = mix(0.48, 1.0, pow(ndv, 1.55));

    vec3 h = normalize(keyLightDir + v);
    float specular = pow(max(dot(n, h), 0.0), 38.0) * 0.2;

    vec3 reliefColor = uPaperColor * (0.32 + diffuse) * ao;
    reliefColor += vec3(specular);

    vec2 screenPx = vScreenUV * uResolution;
    float rnd = hash21(screenPx);
    reliefColor += (rnd - 0.5) * 0.018;

    reliefColor = clamp(reliefColor, vec3(0.45), vec3(1.02));
    gl_FragColor = vec4(reliefColor, 1.0);
  }
`

const COMPOSITE_FRAG = /* glsl */`
  precision highp float;

  uniform sampler2D tColor;
  uniform sampler2D tRelief;
  uniform vec2 uMouse;
  uniform float uRevealRadius;
  uniform float uRevealStrength;
  uniform float uEdgeSoftness;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uPaperBgColor;
  uniform float uNoiseScale;

  varying vec2 vUv;

  ${SHARED_NOISE}

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 0.0001);

    vec4 color = texture2D(tColor, uv);
    vec4 relief = texture2D(tRelief, uv);

    float hasGeometry = smoothstep(0.04, 0.92, color.a);

    vec3 paperBg = proceduralPaperBg(uv, uResolution, uPaperBgColor, uTime);

    vec2 delta = vec2((uv.x - uMouse.x) * aspect, uv.y - uMouse.y);
    float radial = length(delta) / max(uRevealRadius, 0.0001);
    float edgeNoise = fbm2(uv * uNoiseScale * 5.5 + vec2(uTime * 0.12, -uTime * 0.08));
    float revealField = mix(radial, edgeNoise, 0.4);

    float revealMask = 1.0 - smoothstep(
      1.0 - uEdgeSoftness,
      1.0 + uEdgeSoftness,
      revealField
    );
    revealMask *= clamp(uRevealStrength, 0.0, 1.0);

    vec3 modelResult = mix(relief.rgb, color.rgb, revealMask);
    vec3 final = mix(paperBg, modelResult, hasGeometry);

    final = max(final, vec3(0.667));
    gl_FragColor = vec4(clamp(final, vec3(0.0), vec3(1.0)), 1.0);
  }
`

export function usePaperOverlay() {
  const scene = shallowRef(null)
  const camera = shallowRef(null)
  const mesh = shallowRef(null)
  const material = shallowRef(null)
  const reliefMaterial = shallowRef(null)
  const colorRT = shallowRef(null)
  const reliefRT = shallowRef(null)

  const originalMaterials = new Map()

  function createTarget(w, h, withDepth = false) {
    const target = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      depthBuffer: true,
      stencilBuffer: false,
    })

    target.texture.colorSpace = THREE.SRGBColorSpace

    if (withDepth) {
      target.depthTexture = new THREE.DepthTexture(w, h)
      target.depthTexture.type = THREE.UnsignedShortType
      target.depthTexture.format = THREE.DepthFormat
    }

    return target
  }

  function init(renderer, options = {}) {
    const {
      paperBgColor = [...PAPER_BG_VEC3],
      reliefPaperColor = [...RELIEF_ALBEDO_VEC3],
      revealRadius = 0.22,
      revealStrength = 0.0,
      edgeSoftness = 0.08,
      noiseScale = 1.0,
    } = options

    const w = Math.max(renderer.domElement.width / renderer.getPixelRatio(), 1)
    const h = Math.max(renderer.domElement.height / renderer.getPixelRatio(), 1)

    colorRT.value = createTarget(w, h, true)
    reliefRT.value = createTarget(w, h, false)

    scene.value = new THREE.Scene()
    camera.value = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    material.value = new THREE.ShaderMaterial({
      vertexShader: FULLSCREEN_VERT,
      fragmentShader: COMPOSITE_FRAG,
      uniforms: {
        tColor: { value: colorRT.value.texture },
        tRelief: { value: reliefRT.value.texture },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uRevealRadius: { value: revealRadius },
        uRevealStrength: { value: revealStrength },
        uEdgeSoftness: { value: edgeSoftness },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(w, h) },
        uPaperBgColor: { value: new THREE.Vector3(...paperBgColor) },
        uNoiseScale: { value: noiseScale },
      },
      depthTest: false,
      depthWrite: false,
      transparent: false,
    })

    reliefMaterial.value = new THREE.ShaderMaterial({
      vertexShader: RELIEF_VERT,
      fragmentShader: RELIEF_FRAG,
      uniforms: {
        uResolution: { value: new THREE.Vector2(w, h) },
        uPaperColor: { value: new THREE.Vector3(...reliefPaperColor) },
      },
      depthTest: true,
      depthWrite: true,
      transparent: false,
    })

    mesh.value = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material.value)
    mesh.value.frustumCulled = false
    scene.value.add(mesh.value)
  }

  function captureOriginalMaterials(modelScene) {
    originalMaterials.clear()
    modelScene.traverse((child) => {
      if (child.isMesh) {
        originalMaterials.set(child.uuid, child.material)
      }
    })
  }

  function overrideToRelief(modelScene) {
    modelScene.traverse((child) => {
      if (child.isMesh) {
        child.material = reliefMaterial.value
      }
    })
  }

  function restoreMaterials(modelScene) {
    modelScene.traverse((child) => {
      if (child.isMesh && originalMaterials.has(child.uuid)) {
        child.material = originalMaterials.get(child.uuid)
      }
    })
  }

  function resize(w, h) {
    const width = Math.max(w, 1)
    const height = Math.max(h, 1)

    colorRT.value?.setSize(width, height)
    reliefRT.value?.setSize(width, height)
    material.value?.uniforms?.uResolution?.value.set(width, height)
    reliefMaterial.value?.uniforms?.uResolution?.value.set(width, height)
  }

  /**
   * @param {THREE.Color} paperClear — RGB for clear; alpha set separately
   */
  function renderColorPass(renderer, modelScene, modelCamera, paperClear) {
    if (!colorRT.value) return

    const prevTM = renderer.toneMapping
    const prevExp = renderer.toneMappingExposure
    renderer.toneMapping = THREE.NoToneMapping
    renderer.toneMappingExposure = 1

    renderer.setRenderTarget(colorRT.value)
    renderer.setClearColor(paperClear, 0)
    renderer.setClearAlpha(0)
    renderer.clear(true, true, true)
    renderer.render(modelScene, modelCamera)

    renderer.toneMapping = prevTM
    renderer.toneMappingExposure = prevExp
  }

  function renderReliefPass(renderer, modelScene, modelCamera, paperClear) {
    if (!reliefRT.value || !reliefMaterial.value) return

    renderer.setRenderTarget(reliefRT.value)
    renderer.setClearColor(paperClear, 1)
    renderer.setClearAlpha(1)
    renderer.clear(true, true, true)

    overrideToRelief(modelScene)
    try {
      renderer.render(modelScene, modelCamera)
    }
    finally {
      restoreMaterials(modelScene)
    }
  }

  function render(renderer, time) {
    if (!scene.value || !camera.value || !material.value) return

    const t = time * 0.001
    material.value.uniforms.uTime.value = t

    renderer.setRenderTarget(null)
    renderer.setClearColor(0x000000, 0)
    renderer.clear(true, true, true)
    renderer.render(scene.value, camera.value)
  }

  function getUniform(name) {
    return material.value?.uniforms?.[name]
  }

  function setMouse(x, y) {
    material.value?.uniforms?.uMouse?.value.set(x, y)
  }

  function setRevealStrength(v) {
    if (material.value?.uniforms?.uRevealStrength) {
      material.value.uniforms.uRevealStrength.value = v
    }
  }

  function destroy() {
    originalMaterials.clear()
    mesh.value?.geometry?.dispose()
    material.value?.dispose()
    reliefMaterial.value?.dispose()
    colorRT.value?.depthTexture?.dispose?.()
    colorRT.value?.dispose()
    reliefRT.value?.dispose()

    scene.value = null
    camera.value = null
    mesh.value = null
    material.value = null
    reliefMaterial.value = null
    colorRT.value = null
    reliefRT.value = null
  }

  return {
    init,
    resize,
    captureOriginalMaterials,
    renderColorPass,
    renderReliefPass,
    render,
    destroy,
    getUniform,
    setMouse,
    setRevealStrength,
    scene,
    camera,
    material,
    reliefMaterial,
    colorRT,
    reliefRT,
  }
}
