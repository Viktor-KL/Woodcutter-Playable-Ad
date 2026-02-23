import * as THREE from 'three'

type CreateBaseZoneOptions = {
  scene: THREE.Scene
  radius: number
}

export type BaseZoneSystem = {
  root: THREE.Group
  containsXZ: (x: number, z: number) => boolean
}

const BASE_PAD_RADIUS = 1.2

export function createBaseZone(options: CreateBaseZoneOptions): BaseZoneSystem {
  const { scene, radius } = options

  const baseRoot = new THREE.Group()
  baseRoot.position.set(0, 0, 0)
  scene.add(baseRoot)

  const textureLoader = new THREE.TextureLoader()
  const baseTexture = textureLoader.load('/textures/money-texture.png')
  baseTexture.wrapS = THREE.RepeatWrapping
  baseTexture.wrapT = THREE.RepeatWrapping
  baseTexture.repeat.set(1, 1)

  const basePad = new THREE.Mesh(
    new THREE.CylinderGeometry(BASE_PAD_RADIUS, BASE_PAD_RADIUS, 0.01, 24),
    new THREE.MeshStandardMaterial({
      map: baseTexture,
      emissive: 'yellow',
      emissiveIntensity: 0.5,
    }),
  )
  basePad.position.y = 0
  baseRoot.add(basePad)

  return {
    root: baseRoot,
    containsXZ: (x: number, z: number) => {
      const dx = x - baseRoot.position.x
      const dz = z - baseRoot.position.z
      return Math.hypot(dx, dz) <= radius
    },
  }
}
