import * as THREE from 'three'
import { Tween, Easing, Group as TweenGroup } from '@tweenjs/tween.js'
import { loadGltf } from '../loaders/loadGltf'
import { FOREST_MIN_RADIUS, MAX_TREE_SPAWN_ATTEMPTS, INITIAL_TREE_COUNT } from '../config'
import type { TreeEntity } from '../types'

type CreateForestSystemOptions = {
  scene: THREE.Scene
  tweenGroup: TweenGroup
  worldLimit: number
  treeMinDistance: number
  chopHitRadius: number
  initialTreeCount?: number
  onWoodCollected?: () => void
  onChop?: () => void
}

export type ForestSystem = {
  root: THREE.Group
  tryChopAt: (worldPos: THREE.Vector3) => boolean
  getAliveCount: () => number
}

export function createForestSystem(options: CreateForestSystemOptions): ForestSystem {
  const {
    scene,
    tweenGroup,
    worldLimit,
    treeMinDistance,
    chopHitRadius,
    initialTreeCount = INITIAL_TREE_COUNT,
    onWoodCollected,
    onChop,
  } = options

  const root = new THREE.Group()
  scene.add(root)

  const trees: TreeEntity[] = []
  let treePrefab: THREE.Object3D | null = null

  loadGltf('/models/tree/scene.gltf', (gltf) => {
    treePrefab = gltf.scene
    treePrefab.scale.set(3, 3, 3)
    spawnForest(initialTreeCount)
  })

  function canPlaceTree(x: number, z: number): boolean {
    for (const tree of trees) {
      const dx = x - tree.root.position.x
      const dz = z - tree.root.position.z
      const dist = Math.hypot(dx, dz)
      if (dist < treeMinDistance) {
        return false
      }
    }

    return true
  }

  function spawnTree(x: number, z: number): void {
    if (!treePrefab) return

    const treeRoot = new THREE.Group()
    treeRoot.position.set(x, 0, z)
    treeRoot.rotation.y = Math.random() * Math.PI * 2

    const treeClone = treePrefab.clone()

    treeRoot.add(treeClone)
    root.add(treeRoot)

    trees.push({
      root: treeRoot,
      alive: true,
    })
  }

  function spawnForest(count: number): void {
    for (let i = 0; i < count; i += 1) {
      let placed = false

      for (let attempt = 0; attempt < MAX_TREE_SPAWN_ATTEMPTS; attempt += 1) {
        const angle = Math.random() * Math.PI * 2
        const radius = THREE.MathUtils.randFloat(FOREST_MIN_RADIUS, worldLimit - 1)
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius

        if (!canPlaceTree(x, z)) continue

        spawnTree(x, z)
        placed = true
        break
      }

      if (!placed) { }
    }
  }

  function chopTree(tree: TreeEntity): void {
    tree.alive = false
    onWoodCollected?.()
    onChop?.()

    const fallX = (Math.random() * 2 - 1) * 0.45
    const fallZ = (Math.random() * 2 - 1) * 0.45

    const fallTween = new Tween(tree.root.rotation, tweenGroup)
      .to({ x: fallX, z: fallZ }, 140)
      .easing(Easing.Quadratic.Out)

    const shrinkTween = new Tween(tree.root.scale, tweenGroup)
      .to({ x: 0.01, y: 0.01, z: 0.01 }, 180)
      .easing(Easing.Quadratic.Out)
      .onComplete(() => {
        root.remove(tree.root)
      })

    fallTween.chain(shrinkTween).start()
  }

  function tryChopAt(worldPos: THREE.Vector3): boolean {
    for (const tree of trees) {
      if (!tree.alive) continue

      const dx = worldPos.x - tree.root.position.x
      const dz = worldPos.z - tree.root.position.z
      const distanceXZ = Math.hypot(dx, dz)

      if (distanceXZ <= chopHitRadius) {
        chopTree(tree)
        return true
      }
    }

    return false
  }

  return {
    root,
    tryChopAt,
    getAliveCount: () => trees.reduce((sum, tree) => sum + (tree.alive ? 1 : 0), 0),
  }
}
