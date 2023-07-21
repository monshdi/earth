import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import TextureJPG from './Earth_Diffuse.jpg';

const points = [
  [44.8439, 132.9179],
  [59.6644, 28.2792],
  [46.0962, 39.0745],
];

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGL1Renderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const texture = new THREE.TextureLoader().load(TextureJPG);

const controls = new OrbitControls(camera, renderer.domElement);

const geometry = new THREE.SphereGeometry(5, 32, 32);
const material = new THREE.MeshBasicMaterial({
  map: texture,
  // wireframe: true,
});
const globus = new THREE.Mesh(geometry, material);
scene.add(globus);

camera.position.z = 10;

points.forEach((point, index) => {
  const o = createObject(index + 1, 0x0000ff)
  const {x, y, z} = calcPosFromLatLonRad(point[0], point[1]);
  o.position.set(x, y, z);
  scene.add(o)
})

function draw() {
  window.requestAnimationFrame(draw);
  renderer.render(scene, camera);
};

draw();

function createObject(number, color) {
  const objGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2,);
  const objMaterial = new THREE.MeshBasicMaterial({color});
  const object = new THREE.Mesh(objGeometry, objMaterial);
  object.name = `object${number}`;
  return object;
}

function calcPosFromLatLonRad(lat, lon) {
  var phi = (90 - lat) * (Math.PI / 180);
  var theta = (lon + 180) * (Math.PI / 180);

  let x = 5 * -(Math.sin(phi) * Math.cos(theta));
  let z = 5 * Math.sin(phi) * Math.sin(theta);
  let y = 5 * Math.cos(phi);

  return {x, y, z, phi, theta};
}

const buttons = document.querySelectorAll('button');

function onClickButton(e) {
  const { id } = e.target;
  console.log(id);
}

buttons.forEach((button) => {
  button.addEventListener('click', onClickButton);
});