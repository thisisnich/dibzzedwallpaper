import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GUI } from 'https://cdn.skypack.dev/dat.gui';

let scene, camera, renderer, composer, bloomPass, clockPlane, canvasTexture, ctx;
const canvas = document.createElement('canvas');

const guiParams = {
    clockColour: "#ffffff",
    bloomStrength: 1.5,
    bloomRadius: 0.5,
    bloomThreshold: 0
};

init();
animate();
showTime();

function init() {
    // Initialize Three.js
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create canvas and context for the clock
    canvas.width = 512;
    canvas.height = 256;
    ctx = canvas.getContext('2d');
    
    // Draw initial clock state
    updateClock();

    // Create a texture from the HTML5 canvas
    canvasTexture = new THREE.CanvasTexture(canvas);

    // Create a plane with the canvas texture
    const planeGeometry = new THREE.PlaneGeometry(5, 2.5);
    const planeMaterial = new THREE.MeshBasicMaterial({ map: canvasTexture });
    clockPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(clockPlane);

    // Setup post-processing with bloom
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), guiParams.bloomStrength, guiParams.bloomRadius, guiParams.bloomThreshold);
    composer.addPass(bloomPass);

    // Add GUI for controlling bloom parameters and clock color
    const gui = new GUI();
    gui.addColor(guiParams, 'clockColour').name('Clock Colour').onChange(() => {
        updateClock();
    });
    gui.add(guiParams, 'bloomStrength', 0, 3).onChange(value => {
        bloomPass.strength = value;
    });
    gui.add(guiParams, 'bloomRadius', 0, 1).onChange(value => {
        bloomPass.radius = value;
    });
    gui.add(guiParams, 'bloomThreshold', 0, 1).onChange(value => {
        bloomPass.threshold = value;
    });

    window.addEventListener('resize', onWindowResize);
}

// Function to update the clock and render it to the canvas
function updateClock() {
    const date = new Date();
    let h = date.getHours();
    let m = date.getMinutes();
    let s = date.getSeconds();
    let session = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;

    // Format time
    h = h < 10 ? "0" + h : h;
    m = m < 10 ? "0" + m : m;
    s = s < 10 ? "0" + s : s;

    const time = `${h}:${m}:${s} ${session}`;

    // Draw the clock on the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous content
    ctx.fillStyle = guiParams.clockColour;
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.fillText(time, canvas.width / 2, canvas.height / 2 + 20);

    // Update the canvas texture
    canvasTexture.needsUpdate = true;
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

}


// Function to display and update time every second
function showTime() {
    updateClock();  // This updates the clock display on the canvas
    setTimeout(showTime, 1000);  // Recursive call every second
}

