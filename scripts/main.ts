import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('#cfe7c9')

// GLTF
const gltfLoader = new GLTFLoader()

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
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

function animate(): void {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
}

animate()

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

// Lumberjack model
const playerRoot = new THREE.Group()
scene.add(playerRoot)

let playerModel: THREE.Object3D | null = null

gltfLoader.load(
    './public/models/pillager_lumberjack/scene.gltf',
    (gltf) => {
        playerModel = gltf.scene

        playerModel.position.set(0, 0, 0)
        playerModel.scale.set(1, 1, 1)

        scene.add(playerModel)
    },
    undefined,
    (error) => {
        console.error('GLTF load error: ', error)
    }
)

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