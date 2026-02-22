import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'

const gltfLoader = new GLTFLoader()

export function loadGltf(
    path: string,
    onLoad: (gltf: GLTF) => void
): void {
    gltfLoader.load(
        path,
        (gltf) => onLoad(gltf),
        undefined,
        (error) => {
            console.error(`GLTF load error (${path}): `, error)
        }
    )
}