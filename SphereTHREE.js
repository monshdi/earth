import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Clock, Color, ImageLoader, MathUtils, MeshBasicMaterial,
  MeshToonMaterial, Points, PointsMaterial,
  ShaderMaterial, Vector3
} from 'three';
import dotsVertexShader from '/public/dots-vertex.glsl';
import dotsFragmentShader from '/public/dots-fragment.glsl';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let DOTS_BUFFER = null;
let POINTS = [];

// camera
const camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(0, 0, 50);

const cursor = new THREE.Vector2();


// scene
const scene = new THREE.Scene();

// Texture
const textureLoader = new THREE.TextureLoader();
// const texture = textureLoader.load('/Backed_Beauty.png')
// const matcap = textureLoader.load('/matcap_test_light.png')
const spark = textureLoader.load('/spark.png')

let animateObject;

// Loader
// const loader = new FBXLoader();
const loader = new GLTFLoader();

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

loader.load(
    '/Vector_Scene.gltf',
    (object) => {
      let array = [...object.scene.children[0].children];
      array = array.filter((item) => item.name !== 'CAMERA');

      array.forEach((model, i) => {
        let vertexPositions;
        const modelVerticies = [];
        const step = i === 0 ? 1 : 4;
        model.traverse((child) => {
          if (child.isMesh) {
            const geometry = child.geometry;
            geometry.computeVertexNormals();

            child.visible = false;
            vertexPositions = geometry.attributes.position;
            for (let i = 0; i < vertexPositions.count; i+=step) {
              const vertex = new Vector3();
              vertex.fromBufferAttribute(vertexPositions, i);
              modelVerticies.push(vertex);
            }

            child.material = new MeshBasicMaterial({
              color: new Color(0xff0000),
              wireframe: true,
            });
          }
        })

        if (i === 0) {
          model.rotation.z = Math.PI / 2;
        }

        createPoints(modelVerticies, model, vertexPositions.count)
        scene.add(model);
      })
    },
    (progress) => console.log(progress),
    (error) => console.log(error),
)

// function getAllFloat32Arrays(object) {
//   const arrays = [];
//
//   object.traverse((child) => {
//     if (child.isMesh && child.geometry.index) {
//       const positions = child.geometry.index.array;
//       arrays.push(positions);
//     }
//   });
//
//   const totalLength = arrays.reduce((total, arr) => total + arr.length, 0);
//   const combinedArray = new Float32Array(totalLength);
//   let offset = 0;
//
//   arrays.forEach((arr) => {
//     combinedArray.set(arr, offset);
//     offset += arr.length;
//   });
//
//   return combinedArray;
// }

// Использование функции


// fetch(`/dots.ta`).then((response) => {
//   return response.arrayBuffer();
// }).then((buffer) => {
//   console.log('buffer', buffer, typeof buffer)
//   DOTS_BUFFER = buffer;
//   createPoints();
//   // super.emit('loaded', 'dots');
// }).catch((err) => {
//   console.error(err);
//   // super.emit('loaded', 'dots');
// });

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


function createPoints(points, model, pointsAmount) {
  // TODO: refactor
  const pointsGeometry = new BufferGeometry().setFromPoints(points);
  const colors = new Float32Array(pointsAmount * 3);
  const sizes = new Float32Array(pointsAmount);
  const sizesChange = new Int8Array(pointsAmount);

  const palette = [
    new Color(0x04040f),
    new Color(0x00a8e2),
    new Color(0x004c97),
  ]

  for (let i = 0; i < pointsAmount; i++) {
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
  pointsGeometry.setAttribute('sizeChange', new BufferAttribute(sizesChange, 3));
  pointsGeometry.dynamic = true;

  const point = new Points(pointsGeometry, pointsMaterial);
  point.rotation.y = -Math.PI * 3 / 2;
  point.rotation.z = -Math.PI * 10 / 180;
  point.rotation.x = Math.PI * 5 / 180;
  model.add(point);
  POINTS.push(point);
  canAnimate = true;
  // console.log(POINTS);
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
    POINTS.forEach((point, i) => {
      const geometry = point.geometry;
      point.rotation[i === 0 ? 'z' : 'y'] += delta / 10 ;
      const sizes = geometry.attributes.size.array;
      const sizesChanges = geometry.attributes.sizeChange.array;
      const amount = geometry.attributes.position.count;

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

      geometry.attributes.size.needsUpdate = true;
    })


  }

  controls.update();
  renderer.render(scene, camera);
}
