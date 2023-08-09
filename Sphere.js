import { Application } from "@splinetool/runtime";

const canvas = document.getElementById('canvas');
const spline = new Application(canvas);

spline
    .load('/spline_scene.spline')
    .then(() => {
       const element = spline.findObjectByName('Mic');
       spline.addEventListener('follow', (e) => console.log(e));
    })