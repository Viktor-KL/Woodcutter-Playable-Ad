import * as THREE from 'three'
import { loadGltf } from './loaders/loadGltf'
import { Tween, Easing, Group } from '@tweenjs/tween.js'

const MOVE_SPEED = 4.5
const WORLD_LIMIT = 18
const TREE_MIN_DISTANCE = 3.5
const CHOP_HIT_RADIUS = 1.2

const tweenGroup = new Group()

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('#cfe7c9')

// Camera
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    .1,
    200
)
camera.position.set(0, 8, 10)
camera.lookAt(0, 0, 0)

// Render
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

document.body.appendChild(renderer.domElement)

// Resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
})

// Lights
const hemisphereLight = new THREE.HemisphereLight(
    '#fff',
    '#6f8a63',
    1
)
scene.add(hemisphereLight)

const dirLight = new THREE.DirectionalLight(
    '#fff2d6',
    1
)
dirLight.position.set(8, 14, 10)
scene.add(dirLight)

// Ground
const groundGeometry = new THREE.CircleGeometry(40, 48)
const groundMaterial = new THREE.MeshStandardMaterial({
    color: '#88b36e',
    roughness: .95
})

const ground = new THREE.Mesh(groundGeometry, groundMaterial)
ground.rotation.x = -Math.PI / 2
scene.add(ground)

// --- Models loading ---
const playerRoot = new THREE.Group()
const playerVisual = new THREE.Group()
const forestRoot = new THREE.Group()
playerRoot.add(playerVisual)
scene.add(playerRoot, forestRoot)

let playerModel: THREE.Object3D | null = null

loadGltf('/models/lumberjack/scene.gltf', (gltf) => {
    playerModel = gltf.scene

    playerModel.position.set(0, 0, 0)
    playerModel.scale.set(1, 1, 1)

    playerVisual.add(playerModel)
})

// Models [Forest]
type TreeEntity = {
    root: THREE.Group
    alive: boolean
}

const trees: TreeEntity[] = []
let treePrefab: THREE.Object3D | null = null

const chopSound = new Audio('/public/sounds/tree-cutting-sound.wav')
chopSound.volume = .4

loadGltf('/models/tree/scene.gltf', (gltf) => {
    treePrefab = gltf.scene
    treePrefab.scale.set(3, 3, 3)

    spawnForest(80)
})

function spawnTree(x: number, z: number): void {
    if (!treePrefab) return

    const treeRoot = new THREE.Group()
    treeRoot.position.set(x, 0, z)
    treeRoot.rotation.y = Math.random() + Math.PI * 2

    const treeClone = treePrefab.clone()
    treeRoot.add(treeClone)

    forestRoot.add(treeRoot)
    trees.push({
        root: treeRoot,
        alive: true
    })
}

function spawnForest(count: number): void {
    const maxAttemptsPerTree = 5

    for (let i = 0; i < count; i += 1) {
        let placed = false

        for (let attempt = 0; attempt < maxAttemptsPerTree; attempt += 1) {
            const angle = Math.random() * Math.PI * 2
            const radius = THREE.MathUtils.randFloat(5, WORLD_LIMIT - 1)

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

function canPlaceTree(x: number, z: number): boolean {
    for (const tree of trees) {
        const dx = x - tree.root.position.x
        const dz = z - tree.root.position.z
        const dist = Math.hypot(dx, dz)

        if (dist < TREE_MIN_DISTANCE) {
            return false
        }
    }

    return true
}

function tryChopTrees(): void {
    if (!axeModel) return

    for (const tree of trees) {
        if (!tree.alive) continue

        const dx = axeWorldPos.x - tree.root.position.x
        const dz = axeWorldPos.z - tree.root.position.z
        const distanceXZ = Math.hypot(dx, dz)

        if (distanceXZ <= CHOP_HIT_RADIUS) {
            chopTree(tree)
            break
        }
    }
}

function chopTree(tree: TreeEntity): void {
    tree.alive = false

    chopSound.currentTime = 0
    void chopSound.play().catch(() => {})

    const fallX = (Math.random() * 2 - 1) * .45
    const fallZ = (Math.random() * 2 - 1) * .45

    const fallTween = new Tween(tree.root.rotation, tweenGroup)
        .to({ x: fallX, z: fallZ }, 140)
        .easing(Easing.Quadratic.Out)

    const shrinkTween = new Tween(tree.root.scale, tweenGroup)
        .to({ x: .01, y: .01, z: .01 }, 180)
        .easing(Easing.Quadratic.Out)
        .onComplete(() => {
            forestRoot.remove(tree.root)
        })

    fallTween.chain(shrinkTween).start()
}

// Models [ Axe ]
let axeModel: THREE.Object3D | null = null
const axeAnim = {
    angle: 0,
}

new Tween(axeAnim, tweenGroup)
    .to({ angle: -Math.PI * 2 }, 1100)
    .easing(Easing.Linear.None)
    .repeat(Infinity)
    .onRepeat(() => {
        axeAnim.angle = 0
    })
    .start()

const axePivot = new THREE.Group()
axePivot.position.set(0, 1, 0)
playerRoot.add(axePivot)

loadGltf('/models/axe/scene.gltf', (gltf) => {
    axeModel = gltf.scene

    axeModel.scale.set(1, 1, 1)
    axeModel.position.set(0, .5, .5)
    axeModel.rotation.set(Math.PI / 2,
        0,
        Math.PI / 4)

    axePivot.add(axeModel)
})

// Joystick
const joyBase = document.getElementById('joy-base') as HTMLDivElement
const joyThumb = document.getElementById('joy-thumb') as HTMLDivElement

const BASE_SIZE = 120
const THUMB_SIZE = 54
const MAX_OFFSET = BASE_SIZE / 2 - THUMB_SIZE / 2


type JoyState = {
    x: number
    y: number
    active: boolean
    pointerId: number | null
}

const joy: JoyState = {
    x: 0,
    y: 0,
    active: false,
    pointerId: null
}

function resetJoystick(): void {
    joyThumb.style.left = '50%'
    joyThumb.style.top = '50%'

    joy.x = 0
    joy.y = 0
}

function setThumbOffset(dx: number, dy: number): void {
    joyThumb.style.left = `${BASE_SIZE / 2 + dx}px`
    joyThumb.style.top = `${BASE_SIZE / 2 + dy}px`
}

function updateJoystick(clientX: number, clientY: number): void {
    const rect = joyBase.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centery = rect.top + rect.height / 2

    let dx = clientX - centerX
    let dy = clientY - centery

    const distance = Math.hypot(dx, dy)

    if (distance > MAX_OFFSET) {
        const k = MAX_OFFSET / distance
        dx *= k
        dy *= k
    }

    setThumbOffset(dx, dy)

    joy.x = dx / MAX_OFFSET
    joy.y = dy / MAX_OFFSET
}

joyBase.addEventListener('pointerdown', (e: PointerEvent) => {
    joy.active = true
    joy.pointerId = e.pointerId

    joyBase.setPointerCapture(e.pointerId)
    updateJoystick(e.clientX, e.clientY)
})

joyBase.addEventListener('pointermove', (e: PointerEvent) => {
    if (!joy.active) return
    if (e.pointerId !== joy.pointerId) return

    updateJoystick(e.clientX, e.clientY)
})

function endJoystick(e: PointerEvent): void {
    if (e.pointerId !== joy.pointerId) return

    joy.active = false
    joy.pointerId = null
    resetJoystick()
}

joyBase.addEventListener('pointerup', endJoystick)
joyBase.addEventListener('pointercancel', endJoystick)

// Moving
const clock = new THREE.Clock()
const cameraTargetPos = new THREE.Vector3()
const axeWorldPos = new THREE.Vector3()

function normalizeAngle(a: number): number {
    while (a > Math.PI) a -= Math.PI * 2
    while (a < -Math.PI) a += Math.PI * 2

    return a
}

// Animate
function animate(): void {
    requestAnimationFrame(animate)

    const delta = Math.min(clock.getDelta(), 0.033)

    playerRoot.position.x += joy.x * MOVE_SPEED * delta
    playerRoot.position.z += joy.y * MOVE_SPEED * delta

    cameraTargetPos.set(
        playerRoot.position.x,
        playerRoot.position.y + 10,
        playerRoot.position.z + 9
    )

    camera.position.lerp(cameraTargetPos, 0.08)

    camera.lookAt(
        playerRoot.position.x,
        playerRoot.position.y + 1.8,
        playerRoot.position.z
    )

    if (Math.abs(joy.x) > .01 || Math.abs(joy.y) > .01) {
        const targetYaw = Math.atan2(joy.x, joy.y) + Math.PI
        const currentYaw = playerVisual.rotation.y

        const deltaYaw = normalizeAngle(targetYaw - currentYaw)
        playerVisual.rotation.y = currentYaw + deltaYaw * .2
    }

    playerRoot.position.x = THREE.MathUtils.clamp(
        playerRoot.position.x,
        -WORLD_LIMIT,
        WORLD_LIMIT
    )

    playerRoot.position.z = THREE.MathUtils.clamp(
        playerRoot.position.z,
        -WORLD_LIMIT,
        WORLD_LIMIT
    )

    tweenGroup.update()
    axePivot.rotation.y = axeAnim.angle

    if (axeModel) {
        axeModel.getWorldPosition(axeWorldPos)
        tryChopTrees()
    }

    renderer.render(scene, camera)
}

animate()
