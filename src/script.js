import './style.css'
import * as dat from 'dat.gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { DoubleSide, Vector3 } from 'three'

// /**
//  * Spector JS
//  */
// const SPECTOR = require('spectorjs')
// const spector = new SPECTOR.Spector()
// spector.displayUI()

/**
 * Base
 */
//utils
const utils = {}
utils.allObjects = []
// Debug
const gui = new dat.GUI({
    width: 400
})


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const axesHelper = new THREE.AxesHelper(5);
axesHelper.position.y = 5
scene.add(axesHelper);
/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Textures
 */
const bakedCarTexture = textureLoader.load('baked-2.jpg')
bakedCarTexture.flipY = false
bakedCarTexture.encoding = THREE.sRGBEncoding

const bakedTexture = textureLoader.load('baked.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding

const bakedScreenTexture = textureLoader.load('baked-screen.jpg')
bakedScreenTexture.flipY = false
bakedScreenTexture.encoding = THREE.sRGBEncoding

const rickRollTexture = textureLoader.load('Rick-astley.webp')
const youtubeTexture = textureLoader.load('minion.webp')
/**
 * Materials
 */
// car material
const bakedCarMaterial = new THREE.MeshBasicMaterial({
    map: bakedCarTexture,
    side: DoubleSide
})
const carShellMaterial = new THREE.MeshBasicMaterial({
    color: 0xff5555,
    wireframe: false
})

//Screen material
const screenMaterial = new THREE.MeshBasicMaterial({
    map: bakedScreenTexture
})

const screenSelectedMaterial = new THREE.MeshBasicMaterial({
    color: 0x0000ff
})

const rickRollMaterial = new THREE.MeshBasicMaterial({
    map: rickRollTexture
})

const youtubeMaterial = new THREE.MeshBasicMaterial({
    map: youtubeTexture
})


/**
 * Model
 */
// FLoor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshBasicMaterial({ color: 0x55aa77, side: THREE.DoubleSide })
)
floor.geometry.rotateX(Math.PI / 2)
scene.add(floor)

// one car
utils.carObjects = []
const cargroup = new THREE.Group()
cargroup.name = 'AllMycars'
scene.add(cargroup)
const createCar = (position, rotation) => {

    gltfLoader.load(
        'car-1.glb',
        (gltf) => {
            gltf.scene.traverse((child) => {
                child.material = bakedCarMaterial
                child.position.add(position)
                cargroup.add(gltf.scene)
                cargroup.rotation.y = rotation
                utils.carObjects.push(child)
            })
            const shellMesh = gltf.scene.children.find(child => child.name === 'shell')
            shellMesh.material = carShellMaterial
        }, () => {
            utils.carObjects.push(cargroup)
            utils.allObjects.push(cargroup)
        })
}
function deleteAllCars() {
    cargroup.clear()
}
utils.screenObjects = []
utils.screenShelObjects = []
function createScreen(position, rotation) {
    gltfLoader.load(
        'screen.glb',
        (gltf) => {
            gltf.scene.traverse((child) => {
                child.material = screenMaterial
                child.position.add(position)
                utils.screenShelObjects.push(child)
                utils.allObjects.push(child)

            })
            const screen = gltf.scene.children.find(child => child.name === 'screen')
            const shell = gltf.scene.children.find(child => child.name === 'shell')
            screen.rotation.y = rotation
            shell.rotation.y = rotation
            utils.screenObjects.push(screen)
            scene.add(gltf.scene)
        }
    )
}
utils.carPosition = { x: 0, y: 0.29, z: 0 }
utils.carRotation = 0
createCar(utils.carPosition, 0)
createScreen({ x: 0, y: 0, z: 3 }, 0)
createScreen({ x: -7, y: 0, z: -2 }, -Math.PI / 2)
/**
 * Raycaster
 */
//screen
let screenRaycasterPositionX = 0;
let screenRaycasterPositionY = 0;
const screenRaycaster = new THREE.Raycaster()
const screenRaycasterObject = new THREE.Mesh(
    new THREE.ConeGeometry(1, 100),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
screenRaycasterObject.geometry.scale(0.1, 0.2, 0.2)
screenRaycasterObject.rotation.x = (Math.PI / 2)
screenRaycasterObject.position.y = -5
scene.add(screenRaycasterObject)

//car
let carRaycasterPositionX = 0;
let carRaycasterPositionY = 3;
let carRaycasterPositionZ = 7;
const carRaycaster = new THREE.Raycaster()
const carRaycasterObject = new THREE.Mesh(
    new THREE.ConeGeometry(1, 100),
    new THREE.MeshBasicMaterial({ color: '#ff00ff' })
)
carRaycasterObject.geometry.scale(0.1, 0.2, 0.2)
carRaycasterObject.rotation.x = (Math.PI / 2)
carRaycasterObject.rotation.z = Math.PI
carRaycasterObject.position.y = carRaycasterPositionY
scene.add(carRaycasterObject)


window.addEventListener('click', () => {
    if (screenCurrentIntersect && screenCurrentIntersect.length) {
        console.log('yes')
        window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
    }
})

/**
 * Mouse
 */
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (_event) => {
    mouse.x = (_event.clientX / sizes.width * 2) - 1
    mouse.y = - (_event.clientY / sizes.height * 2) + 1
})
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 15
camera.position.y = 17
camera.position.z = -28
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding

/**
 * Animate
 */
const clock = new THREE.Clock()

let screenCurrentIntersect = null
let carCurrentIntersect = null


const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Raycaster
    //cast a ray
    
    const rayOrigin = new THREE.Vector3(screenRaycasterPositionX, screenRaycasterPositionY, 0)
    const rayDirection = new THREE.Vector3(0, 0, 20)
    rayDirection.normalize()
    screenRaycaster.set(rayOrigin, rayDirection)
    screenRaycasterObject.position.x = screenRaycasterPositionX
    screenRaycasterObject.position.y = screenRaycasterPositionY
    
    screenRaycasterPositionY = mouse.y * Math.abs(camera.position.z)
    screenRaycasterPositionX = - mouse.x * Math.abs(camera.position.z)
    
    if (utils.screenObjects[0]) {
        const intersects = screenRaycaster.intersectObjects(utils.screenObjects)
        screenCurrentIntersect = intersects
    }
    if (screenCurrentIntersect && utils.screenObjects[0]) {
        if (screenCurrentIntersect.length && utils.screenObjects[0].material != rickRollMaterial) {
            utils.screenObjects.map(screenObject => screenObject.material = rickRollMaterial)
        }
        if (!screenCurrentIntersect.length && utils.screenObjects[0].material != youtubeMaterial) {
            utils.screenObjects.map(screenObject => screenObject.material = youtubeMaterial)
            console.log('no')
        }
    }
    // Render
    renderer.render(scene, camera)
    
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}
tick()
let driveable = true
document.addEventListener('keydown', logKey);
function logKey(e) {
    detectRaycast()
    let turnaccuracy = 32
    switch (e.key) {
        case 'w':
            if(driveable){
                checkDirectionOfCar(true)
            }
            break
        case 'a':
            utils.carRotation += Math.PI / turnaccuracy
            carRaycasterObject.rotation.z = Math.PI - utils.carRotation
            break
        case 's':
            checkDirectionOfCar(false)
            break
        case 'd':
            utils.carRotation -= Math.PI / turnaccuracy
            carRaycasterObject.rotation.z = Math.PI - utils.carRotation
            break
        case 'ArrowUp':
            if(driveable){
             checkDirectionOfCar(true)
            }
            break
        case 'ArrowDown':
            checkDirectionOfCar(false)
            break
        case 'ArrowLeft':
            utils.carRotation += Math.PI / turnaccuracy
            carRaycasterObject.rotation.z = Math.PI - utils.carRotation
            break
        case 'ArrowRight':
            utils.carRotation += Math.PI * (turnaccuracy * 2 - 1) / turnaccuracy
            carRaycasterObject.rotation.z = Math.PI - utils.carRotation
            break
        case ' ':
            break
        default:
            console.log(e.key)
    }
    utils.carObjects[0].rotation.y = utils.carRotation
    //carRaycasterObject.rotation.reorder('yxz')

}

let directionSplit = 0
function checkDirectionOfCar(forwards) {
    const direction = (utils.carObjects[0].rotation.y / Math.PI / 2).toFixed(2).toString()
    directionSplit = parseFloat(direction.split('.')[1])
    directionSplit = directionSplit / 100
    if (directionSplit <= 0.25) {
        directionSplit = directionSplit * 4
        utils.carObjects[0].position.add({ x: shortWay(forwards), y: 0, z: longWay(forwards) })
        updateCarRaycast({ x: shortWay(forwards) * 100, y: 0, z: longWay(forwards) * 100 })
    } else if (directionSplit <= 0.50) {
        directionSplit = (directionSplit - 0.25) * 4
        utils.carObjects[0].position.add({ x: longWay(forwards), y: 0, z: shortWay(!forwards) })
        updateCarRaycast({ x: longWay(forwards) * 100, y: 0, z: shortWay(!forwards) * 100 })
    } else if (directionSplit <= 0.75) {
        directionSplit = (directionSplit - 0.50) * 4
        utils.carObjects[0].position.add({ x: shortWay(!forwards), y: 0, z: longWay(!forwards) })
        updateCarRaycast({ x: shortWay(!forwards) * 100, y: 0, z: longWay(!forwards) * 100 })
    } else {
        directionSplit = (directionSplit - 0.75) * 4
        utils.carObjects[0].position.add({ x: longWay(!forwards), y: 0, z: shortWay(forwards) })
        updateCarRaycast({ x: longWay(!forwards) * 100, y: 0, z: shortWay(forwards) * 100 })
    }
}

const shortWay = (forward) => {
    return (forward ? -1 : 1) * directionSplit
}

const longWay = (forward) => {
    return (forward ? -1 : 1) * (1 - directionSplit)
}

function updateCarRaycast(direction){
    const rayOrigin = new THREE.Vector3(carRaycasterPositionX, carRaycasterPositionY, carRaycasterPositionZ)
    const rayDirection = new THREE.Vector3(direction.x, direction.y, direction.z)
    rayDirection.normalize()
    carRaycaster.set(rayOrigin, rayDirection)
    carRaycasterObject.position.x = carRaycasterPositionX
    carRaycasterObject.position.z = carRaycasterPositionZ

    carRaycasterPositionX = utils.carObjects[0].position.x
    carRaycasterPositionZ = utils.carObjects[0].position.z
}

function detectRaycast(){
    if (utils.allObjects[0]) {
        const intersects = carRaycaster.intersectObjects(utils.allObjects)
        carCurrentIntersect = intersects
        if(carCurrentIntersect.length)
        {
            console.log('ja')
            carRaycasterObject.material.color = new THREE.Color(0x00ff00)
            if (carCurrentIntersect[0].distance < 6){
                driveable = false
            }else{
                driveable = true
            }
        }else{
            carRaycasterObject.material.color = new THREE.Color(0xff00ff)
            driveable = true
        }
    }
}