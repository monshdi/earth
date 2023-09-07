import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';

// camera
const camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(0, 0, 1);

const cursor = new THREE.Vector2();


// scene
const scene = new THREE.Scene();

// Texture
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('/Backed_Beauty.png')
const matcap = textureLoader.load('/matcap_test_light.png')

let animateObject;

// Loader
const loader = new FBXLoader();
loader.load(
    '/Mic_scene_01.fbx',
    (object) => {
        // object.position.x = 100
        object.scale.setScalar(0.0015);
        object.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshMatcapMaterial({
                    map: texture,
                    matcap,
                })
            }
        });

        // object.position.x = 0.2;
        animateObject = object;

        scene.add(object);
    },
    (progress) => console.log(progress),
    (error) => console.log(error),
)

// renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// scene settings
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

renderer.setClearAlpha(0);

// orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.125;

window.addEventListener('resize', onWindowResize);


function onWindowResize() {
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('mousemove', (e) => {
    const {clientX, clientY} = e;
    cursor.y = clientY / window.innerHeight - 0.5;
    cursor.x = -(clientX / window.innerWidth - 0.5);
})


function animate() {

    camera.position.x = Math.sin(cursor.x * Math.PI) * 3;
    camera.position.z = Math.cos(cursor.x  * Math.PI) * 3;
    camera.position.y = cursor.y * 5;

    //
    controls.update();
    renderer.render(scene, camera);
}
