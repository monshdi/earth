import * as THREE from 'three';
import { OrbitControls} from "three/addons/controls/OrbitControls.js";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const canvas = document.getElementById('canvas');

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const geometry = new THREE.BoxGeometry(1, 1,  1);
const material = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  // wireframe: true,
});
const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);

const clock = new THREE.Clock();

const mouseCoords = {
  x: 0,
  y: 0,
}

window.addEventListener('mousemove', (event) => {
  mouseCoords.x = event.clientX / window.innerWidth - 0.5
  mouseCoords.y = event.clientY / window.innerHeight - 0.5
});


function draw() {
  const time = clock.getElapsedTime();

  // mesh.rotation.y = time
  // mesh.position.y = Math.abs(Math.sin(time * Math.PI));
  // mesh.position.x = Math.cos(time * Math.PI);

  camera.position.x = -mouseCoords.x;
  camera.position.y = mouseCoords.y;

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(draw);
}

draw();