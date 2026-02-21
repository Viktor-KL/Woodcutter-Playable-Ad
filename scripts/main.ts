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