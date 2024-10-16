import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { DotScreenPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/DotScreenPass.js';
import { GlitchPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/GlitchPass.js';
import { GUI } from 'https://cdn.skypack.dev/dat.gui';

let clockElement = document.getElementById("MyClockDisplay");

const guiParams = {
    clockColour: "#00ddff",
    bloomStrength: 1.5,
    bloomRadius: 0.5,
    bloomThreshold: 0,
    activateGlitch: false,
    activateDotScreen: false,
    dotScale: 0.1,
    twentyFourHour: false

};

clockElement.style.color = guiParams.clockColour;

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z=5;

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let composer = new EffectComposer(renderer);
let bloomPass= new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), guiParams.bloomStrength, guiParams.bloomRadius, guiParams.bloomThreshold);
composer.addPass(bloomPass);

let dotScreenPass = new DotScreenPass();
dotScreenPass.enabled = guiParams.activateDotScreen;
composer.addPass(dotScreenPass);

let glitchPass = new GlitchPass();
glitchPass.enabled = guiParams.activateGlitch;
composer.addPass(glitchPass);

const gui = new GUI({width: '100%'});
gui.domElement.id = 'clock-gui';
gui.addColor(guiParams, 'clockColour').name('Clock Colour').onChange((color) =>{
    clockElement.style.color=color;
});

gui.add(guiParams, 'twentyFourHour').name('24-Hour Format').onChange(() => {
    showTime();  // Update the clock when the checkbox is toggled
});



// gui.add(guiParams, 'bloomStrength', 0, 3).onChange((value) => {
//     bloomPass.strength = value;
// });
// gui.add(guiParams, 'bloomRadius', 0, 1).onChange((value) => {
//     bloomPass.radius = value;
// });
// gui.add(guiParams, 'bloomThreshold', 0, 1).onChange((value) => {
//     bloomPass.threshold = value;
// });

// // Glitch effect control
// gui.add(guiParams, 'activateGlitch').onChange((value) => {
//     glitchPass.enabled = value;
// });

// // DotScreen effect control
// gui.add(guiParams, 'activateDotScreen').onChange((value) => {
//     dotScreenPass.enabled = value;
// });

function animate() {
    requestAnimationFrame(animate);
    composer.render();
}

animate();

function showTime() {
    const date = new Date();
    let h = date.getHours();
    let m = date.getMinutes();
    let s = date.getSeconds();
    let session = "";

    // Handle 12-hour or 24-hour format based on the checkbox state
    if (!guiParams.twentyFourHour) {
        session = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12; // Convert to 12-hour format if checkbox is not checked
    }

    h = h < 10 ? "0" + h : h;
    m = m < 10 ? "0" + m : m;
    s = s < 10 ? "0" + s : s;

    let time = guiParams.twentyFourHour ? `${h}:${m}:${s}` : `${h}:${m}:${s} ${session}`;


    document.getElementById("MyClockDisplay").innerText = time;
    document.getElementById("MyClockDisplay").textContent = time;

    setTimeout(showTime, 1000);
}

showTime();
