import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Clock, Color, ImageLoader, MathUtils, Points, ShaderMaterial
} from 'three';
import dotsVertexShader from '/public/dots-vertex.glsl';
import dotsFragmentShader from '/public/dots-fragment.glsl';

let DOTS_BUFFER = null;
let POINTS = null;

// camera
const camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(0, 0, 3000);

const cursor = new THREE.Vector2();


// scene
const scene = new THREE.Scene();

// Texture
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('/Backed_Beauty.png')
const matcap = textureLoader.load('/matcap_test_light.png')
const spark = textureLoader.load('/spark.png')

let animateObject;

// Loader
const loader = new FBXLoader();
// loader.load(
//     '/Mic_scene_01.fbx',
//     (object) => {
//         // object.position.x = 100
//         object.scale.setScalar(0.0015)
//         object.traverse((child) => {
//             if (child.isMesh) {
//                 child.material = new THREE.MeshMatcapMaterial({
//                     map: texture,
//                     matcap,
//                 })
//             }
//         });
//
//         // object.position.x = 0.2;
//         animateObject = object;
//
//         scene.add(object);
//     },
//     (progress) => console.log(progress),
//     (error) => console.log(error),
// )

fetch(`/dots.ta`).then((response) => {
  return response.arrayBuffer();
}).then((buffer) => {
  console.log('buffer', buffer, typeof buffer)
  DOTS_BUFFER = buffer;
  createPoints();
  // super.emit('loaded', 'dots');
}).catch((err) => {
  console.error(err);
  // super.emit('loaded', 'dots');
});

// renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// scene settings
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
// renderer.setClearColor(0x2980B9);

// renderer.setClearAlpha(0);

// orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
// controls.dampingFactor = 0.125;

const pixelRatio = renderer.getPixelRatio();
const dotMinSize = 0.5 / pixelRatio;
const dotMaxSize = 2.5 / pixelRatio;

const pointsMaterial = new ShaderMaterial({
  vertexShader: dotsVertexShader,
  fragmentShader: dotsFragmentShader,
  uniforms: {
    color: {value: new Color(0xffffff)},
    pointTexture: {value: spark},
  },
  blending: AdditiveBlending,
  depthWrite: false,
  transparent: true,
});

const pointsGeometry = new BufferGeometry();

function createPoints() {
  // TODO: refactor
  const vertices = new Float32Array(DOTS_BUFFER);
  console.log(vertices);
  pointsGeometry.setAttribute('position', new BufferAttribute(vertices, 3));
  const amount = pointsGeometry.attributes.position.count;
  const colors = new Float32Array(amount * 3);
  const sizes = new Float32Array(amount);
  const sizesChange = new Int8Array(amount);
  const palette = [
    new Color(0x04040f),
    new Color(0x00a8e2),
    new Color(0x004c97),
  ]

  for (let i = 0; i < amount; i++) {
    const color = new Color(0xffffff);

    if (i % 50 === 0) {
      color.copy(new Color(0xffbf00));
      color.toArray(colors, i * 3);
    } else {
      color.copy(palette[MathUtils.randInt(0, palette.length - 1)]);
      color.toArray(colors, i * 3);
    }

    sizes[i] = MathUtils.randFloat(dotMinSize, dotMaxSize);
    sizesChange[i] = Math.random() > 0.5 ? 1 : -1;
  }

  pointsGeometry.setAttribute('customColor', new BufferAttribute(colors, 3));
  pointsGeometry.setAttribute('size', new BufferAttribute(sizes, 1));
  pointsGeometry.setAttribute('sizeChange', new BufferAttribute(sizesChange, 1));
  pointsGeometry.dynamic = true;

  POINTS = new Points(pointsGeometry, pointsMaterial);
  POINTS.rotation.y = -Math.PI * 3 / 2;
  POINTS.rotation.z = -Math.PI * 10 / 180;
  POINTS.rotation.x = Math.PI * 5 / 180;
  scene.add(POINTS);
  canAnimate = true;
}


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

const clock = new Clock();

let canAnimate = false

function animate() {
  const delta = clock.getDelta();
  if (canAnimate) {
    POINTS.rotation.y += delta / 100;

    const sizes = pointsGeometry.attributes.size.array;
    const sizesChanges = pointsGeometry.attributes.sizeChange.array;
    const amount = pointsGeometry.attributes.position.count;
    for (let i = 0; i < amount; i++) {
      sizes[i] += sizesChanges[i] * MathUtils.randFloat(0, 0.075);
      if (sizes[i] >= dotMaxSize) {
        sizesChanges[i] *= -1;
        sizes[i] = dotMaxSize;
      }
      if (sizes[i] <= dotMinSize) {
        sizesChanges[i] *= -1;
        sizes[i] = dotMinSize;
      }
    }

    pointsGeometry.attributes.size.needsUpdate = true;
  }


  // camera.position.x = Math.sin(cursor.x * Math.PI) * 3;
  // camera.position.z = Math.cos(cursor.x  * Math.PI) * 3;
  // camera.position.y = cursor.y * 5;

  //
  // controls.update();
  renderer.render(scene, camera);
}
