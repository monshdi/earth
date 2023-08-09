import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';
import SplineLoader from '@splinetool/loader';

// camera
const camera = new THREE.PerspectiveCamera(14, window.innerWidth / window.innerWidth, 1, 10000);
camera.position.set(0, 0, 1);

const cursor = new THREE.Vector2();


// scene
const scene = new THREE.Scene();

// Texture
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('/texture.png')

let animateObject;

// Loader
const loader = new FBXLoader();
loader.load(
    '/Mic_scene.fbx',
    (object) => {
        // object.position.x = 100
        object.scale.setScalar(0.001);
        object.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshBasicMaterial({
                    map: texture,
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

// const splineLoader = new SplineLoader();
// splineLoader.load(
//   '/spline_scene.spline',
//   (object) => {
//     object.traverse((child) => {
//       if (child.isMesh) {
//         console.log(child);
//         child.material = new THREE.MeshBasicMaterial({
//           map: texture,
//         })
//       }
//     });
//
//     scene.add(object);
//   },
//   (progres) => console.log(progres),
//   (error) => console.log(error)
// )

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


function animate(time) {

    camera.position.x = Math.sin(cursor.x * Math.PI) * 3;
    camera.position.z = Math.cos(cursor.x * Math.PI) * 3;
    camera.position.y = cursor.y * 5;

    //
    controls.update();
    renderer.render(scene, camera);
}
