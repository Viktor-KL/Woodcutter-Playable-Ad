import * as THREE from 'three'
import { Tween, Easing, Group as TweenGroup } from '@tweenjs/tween.js'
import { loadGltf } from '../loaders/loadGltf'
import { AXE_ROTATION_DURATION_MS } from '../config'

export type AxeSystem = {
  pivot: THREE.Group
  update: () => void
  getWorldPosition: (out: THREE.Vector3) => boolean
}

export function createAxeSystem(playerRoot: THREE.Group, tweenGroup: TweenGroup): AxeSystem {
  let axeModel: THREE.Object3D | null = null

  const axeAnim = { angle: 0 }
  new Tween(axeAnim, tweenGroup)
    .to({ angle: -Math.PI * 2 }, AXE_ROTATION_DURATION_MS)
    .easing(Easing.Linear.None)
    .repeat(Infinity)
    .onRepeat(() => {
      axeAnim.angle = 0
    })
    .start()

  const pivot = new THREE.Group()
  pivot.position.set(0, 1, 0)
  playerRoot.add(pivot)

  loadGltf('/models/axe/scene.gltf', (gltf) => {
    axeModel = gltf.scene
    axeModel.scale.set(1, 1, 1)
    axeModel.position.set(0, 0.5, 0.5)
    axeModel.rotation.set(Math.PI / 2, 0, Math.PI / 4)
    pivot.add(axeModel)
  })

  return {
    pivot,
    update: () => {
      pivot.rotation.y = axeAnim.angle
    },
    getWorldPosition: (out) => {
      if (!axeModel) return false
      axeModel.getWorldPosition(out)
      return true
    },
  }
}
