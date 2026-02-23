import * as THREE from 'three'
import { loadGltf } from '../loaders/loadGltf'
import { MOVE_SPEED, PLAYER_TURN_LERP_ALPHA, WORLD_LIMIT } from '../config'
import type { JoyInput } from '../types'

function normalizeAngle(angle: number): number {
  let next = angle
  while (next > Math.PI) next -= Math.PI * 2
  while (next < -Math.PI) next += Math.PI * 2
  return next
}

export type PlayerSystem = {
  root: THREE.Group
  visual: THREE.Group
  update: (delta: number, input: JoyInput) => void
}

export function createPlayerSystem(scene: THREE.Scene): PlayerSystem {
  const root = new THREE.Group()
  const visual = new THREE.Group()
  root.add(visual)
  scene.add(root)

  loadGltf('/models/lumberjack/scene.gltf', (gltf) => {
    const model = gltf.scene
    model.position.set(0, 0, 0)
    model.scale.set(1, 1, 1)
    visual.add(model)
  })

  function update(delta: number, input: JoyInput): void {
    root.position.x += input.x * MOVE_SPEED * delta
    root.position.z += input.y * MOVE_SPEED * delta

    if (Math.abs(input.x) > 0.01 || Math.abs(input.y) > 0.01) {
      const targetYaw = Math.atan2(input.x, input.y) + Math.PI
      const currentYaw = visual.rotation.y
      const deltaYaw = normalizeAngle(targetYaw - currentYaw)
      visual.rotation.y = currentYaw + deltaYaw * PLAYER_TURN_LERP_ALPHA
    }

    root.position.x = THREE.MathUtils.clamp(root.position.x, -WORLD_LIMIT, WORLD_LIMIT)
    root.position.z = THREE.MathUtils.clamp(root.position.z, -WORLD_LIMIT, WORLD_LIMIT)
  }

  return { root, visual, update }
}
