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

const raycaster = new THREE.Raycaster();
const cursor = new THREE.Vector2(0, 0);

window.addEventListener('mousemove', (event) => {
  cursor.x = event.clientX / window.innerWidth * 2 - 1
  cursor.y = -(event.clientY / window.innerHeight) * 2 + 1
});



function draw() {
  const time = clock.getElapsedTime();
  // mesh.rotation.y = time
  // mesh.position.y = Math.abs(Math.sin(time * Math.PI));
  // mesh.position.x = Math.cos(time * Math.PI);

  raycaster.setFromCamera(cursor, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  console.log(intersects);

  scene.children.forEach((item) => item.material.color.set(0xff0000));

  intersects.forEach((entry, i) => {
    entry.object.material.color.set(0xf3f3f3);
  })




  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(draw);
}

draw();