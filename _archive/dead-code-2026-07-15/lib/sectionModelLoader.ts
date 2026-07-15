import type { GLTF } from 'three/addons/loaders/GLTFLoader.js'

/** CDN decoders — set DRACO_DECODER_PATH in public/ if you prefer self-hosting */
const DEFAULT_DRACO_DECODER = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/'

const gltfCache = new Map<string, Promise<GLTF>>()

export function getDracoDecoderPath(): string {
  const fromEnv = typeof import.meta !== 'undefined'
    && (import.meta as ImportMeta & { env?: Record<string, string> }).env
      ?.NUXT_PUBLIC_DRACO_DECODER_PATH
  if (fromEnv) {
    return fromEnv
  }
  return DEFAULT_DRACO_DECODER
}

export async function loadSectionGltf(modelUrl: string): Promise<GLTF> {
  if (!import.meta.client) {
    throw new Error('loadSectionGltf is client-only')
  }

  const cached = gltfCache.get(modelUrl)
  if (cached) {
    return cached
  }

  const promise = (async () => {
    const [{ GLTFLoader }, { DRACOLoader }] = await Promise.all([
      import('three/addons/loaders/GLTFLoader.js'),
      import('three/addons/loaders/DRACOLoader.js'),
    ])

    const loader = new GLTFLoader()
    const draco = new DRACOLoader()
    const decoderPath = getDracoDecoderPath()
    draco.setDecoderPath(decoderPath)
    draco.preload()
    loader.setDRACOLoader(draco)

    try {
      if (import.meta.dev) {
        console.log('[sectionModelLoader] Loading', modelUrl, 'Draco decoder:', decoderPath)
      }
      const gltf = await loader.loadAsync(modelUrl)
      if (import.meta.dev) {
        console.log('[sectionModelLoader] Parsed', modelUrl, {
          scenes: gltf.scenes?.length,
          animations: gltf.animations?.length,
        })
      }
      return gltf
    }
    catch (e) {
      if (import.meta.dev) {
        console.error('[sectionModelLoader] Load failed', modelUrl, e)
      }
      gltfCache.delete(modelUrl)
      throw e
    }
    finally {
      draco.dispose()
    }
  })()

  gltfCache.set(modelUrl, promise)
  return promise
}
