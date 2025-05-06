import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/RenderPass.js';
import { DotScreenPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/DotScreenPass.js';
import { GlitchPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/GlitchPass.js';
import { GUI } from 'https://cdn.skypack.dev/dat.gui';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';

// Set up variables but keep the original structure to avoid breaking existing code
let scene, camera, renderer, composer, bloomPass, controls, shapeMesh, model, glitchPass, dotScreenPass;
let loader = new GLTFLoader();  // For loading GLTF models

// Make original variables available to window for mobile controller
window.scene = scene;
window.camera = camera;
window.renderer = renderer;
window.composer = composer;
window.bloomPass = bloomPass;
window.controls = controls;
window.shapeMesh = shapeMesh;
window.model = model;
window.glitchPass = glitchPass;
window.dotScreenPass = dotScreenPass;
window.loader = loader;

// Keep guiParams as it was originally, but also expose to window
let guiParams = {
    deformAmount: 0.1,
    transparency: 0.5,  // Transparency parameter
    bloomStrength: 3,
    bloomRadius: 0.4,
    bloomThreshold: 0,
    activateGlitch: false,
    dotScale: 0.1,
    activateDotScreen: true,
    shape: 'Sphere',
    rotationSpeedX: 0,
    rotationSpeedY: 0.001,
    rotationSpeedZ: 0,
    // Add parameters for clock
    clockColour: '#17D4FE',
    twentyFourHour: false
};

// Also expose to window
window.guiParams = guiParams;

// Shapes and Models
const shapes = {
    Sphere: () => new THREE.SphereGeometry(1, 32, 32),
    Cube: () => new THREE.BoxGeometry(1, 1, 1),
    Torus: () => new THREE.TorusGeometry(0.7, 0.2, 16, 200)
};

const models = {
    'Monkey': './models/suzanne.glb',
    'Car': './models/car.glb'
};

init();
animate();

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 3);
    
    // Update window references
    window.scene = scene;
    window.camera = camera;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);
    window.renderer = renderer;

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    // Orbit Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    window.controls = controls;

    // Post-processing setup
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    window.composer = composer;

    bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight), 
        guiParams.bloomStrength, 
        guiParams.bloomRadius, 
        guiParams.bloomThreshold
    );
    composer.addPass(bloomPass);
    window.bloomPass = bloomPass;

    dotScreenPass = new DotScreenPass(new THREE.Vector2(0, 0), guiParams.dotScale);
    dotScreenPass.enabled = guiParams.activateDotScreen;
    composer.addPass(dotScreenPass);
    window.dotScreenPass = dotScreenPass;

    glitchPass = new GlitchPass();
    glitchPass.enabled = guiParams.activateGlitch;
    composer.addPass(glitchPass);
    window.glitchPass = glitchPass;

    // GUI Setup
    const gui = new GUI({ width: '100%' });
    gui.domElement.id = 'background-gui';
    gui.domElement.classList.add('dat-gui-custom');

    // Rotation Speed Controls
    gui.add(guiParams, 'rotationSpeedX', 0.0001, 0.05, 0.001).name('Rotation Speed X').onChange(value => {
        // This callback ensures GUI changes also affect the mobile controller display
        const mobileControl = document.getElementById('mobile-rotation-x');
        const valueDisplay = document.getElementById('rotation-x-value');
        if (mobileControl) mobileControl.value = value;
        if (valueDisplay) valueDisplay.textContent = value.toFixed(3);
    });
    
    gui.add(guiParams, 'rotationSpeedY', 0.0001, 0.05, 0.001).name('Rotation Speed Y').onChange(value => {
        const mobileControl = document.getElementById('mobile-rotation-y');
        const valueDisplay = document.getElementById('rotation-y-value');
        if (mobileControl) mobileControl.value = value;
        if (valueDisplay) valueDisplay.textContent = value.toFixed(3);
    });
    
    gui.add(guiParams, 'rotationSpeedZ', 0.0001, 0.05, 0.001).name('Rotation Speed Z');

    // Transparency Control
    gui.add(guiParams, 'transparency', 0, 1).name('Transparency').onChange(value => {
        updateTransparency(value);
        // Update mobile control
        const mobileControl = document.getElementById('mobile-transparency');
        const valueDisplay = document.getElementById('transparency-value');
        if (mobileControl) mobileControl.value = value;
        if (valueDisplay) valueDisplay.textContent = value.toFixed(2);
    });

    // Bloom Controls
    gui.add(guiParams, 'bloomStrength', 0, 3).onChange(value => {
        bloomPass.strength = value;
        // Update mobile control
        const mobileControl = document.getElementById('mobile-bloom-strength');
        const valueDisplay = document.getElementById('bloom-strength-value');
        if (mobileControl) mobileControl.value = value;
        if (valueDisplay) valueDisplay.textContent = value.toFixed(1);
    });
    
    gui.add(guiParams, 'bloomRadius', 0, 1).onChange(value => {
        bloomPass.radius = value;
        // Update mobile control
        const mobileControl = document.getElementById('mobile-bloom-radius');
        const valueDisplay = document.getElementById('bloom-radius-value');
        if (mobileControl) mobileControl.value = value;
        if (valueDisplay) valueDisplay.textContent = value.toFixed(2);
    });
    
    gui.add(guiParams, 'bloomThreshold', 0, 1).onChange(value => {
        bloomPass.threshold = value;
    });

    // GlitchPass Toggle
    gui.add(guiParams, 'activateGlitch').onChange(value => {
        glitchPass.enabled = value;
        // Update mobile control
        const mobileControl = document.getElementById('mobile-glitch-toggle');
        if (mobileControl) mobileControl.checked = value;
    });

    // DotScreenPass Toggle
    gui.add(guiParams, 'activateDotScreen').onChange(value => {
        dotScreenPass.enabled = value;
        // Update mobile control
        const mobileControl = document.getElementById('mobile-dotscreen-toggle');
        if (mobileControl) mobileControl.checked = value;
    });
    
    gui.add(guiParams, 'dotScale', 0.1, 4, 0.1).onChange(value => {
        dotScreenPass.uniforms['scale'].value = value;
    });

    // Event listener for radio buttons to change the shape or model
    const radioGroup = document.querySelector('.radio-group');
    if (radioGroup) {
        radioGroup.addEventListener('change', (event) => {
            guiParams.shape = event.target.value;
            updateObject();  // Update the scene with the selected shape/model
        });
    }

    // Load the initial shape (Sphere by default)
    updateObject();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Expose functions to window
    window.updateTransparency = updateTransparency;
    window.updateObject = updateObject;
}

// Function to update the transparency of both shapes and models
function updateTransparency(value) {
    if (shapeMesh) {
        shapeMesh.material.transparent = true;
        shapeMesh.material.opacity = value;
    }
    
    if (model) {
        model.traverse((child) => {
            if (child.isMesh) {
                child.material.transparent = true; // Ensure the material allows transparency
                child.material.opacity = value;
            }
        });
    }
}

function updateObject() {
    // Remove current object from the scene
    if (shapeMesh) scene.remove(shapeMesh);
    if (model) scene.remove(model);

    // Check if it's a shape or a model
    if (shapes[guiParams.shape]) {
        // Create new shape geometry based on selected option
        const geometry = shapes[guiParams.shape]();
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            wireframe: true,  // Ensure wireframe is set for shapes too
            transparent: true,
            opacity: guiParams.transparency
        });
        shapeMesh = new THREE.Mesh(geometry, material);
        scene.add(shapeMesh);
        window.shapeMesh = shapeMesh; // Update window reference
    } else if (models[guiParams.shape]) {
        // Load the 3D model
        loadModel(models[guiParams.shape]);
    }
}

const refreshButton = document.getElementById('refreshButton');
if (refreshButton) {
    refreshButton.addEventListener('click', () => {
        updateObject();  // Re-run updateObject to reset the current shape/model
    });
}

function loadModel(modelPath) {
    loader.load(modelPath, function (gltf) {
        model = gltf.scene;
        model.scale.set(1, 1, 1);  // Adjust scale if necessary

        // Create the same material used for the shapes with wireframe enabled
        const newMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            wireframe: true,  // Ensure wireframe mode is enabled
            transparent: true,
            opacity: guiParams.transparency
        });

        // Traverse the model and apply the new material to each mesh
        model.traverse((child) => {
            if (child.isMesh) {
                child.material = newMaterial;  // Apply the wireframe material
            }
        });

        scene.add(model);
        window.model = model; // Update window reference
    }, undefined, function (error) {
        console.error('Error loading model:', error);
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (shapeMesh) {
        shapeMesh.rotation.x += guiParams.rotationSpeedX;
        shapeMesh.rotation.y += guiParams.rotationSpeedY;
        shapeMesh.rotation.z += guiParams.rotationSpeedZ;
    }

    if (model) {
        model.rotation.x += guiParams.rotationSpeedX;
        model.rotation.y += guiParams.rotationSpeedY;
        model.rotation.z += guiParams.rotationSpeedZ;
    }

    controls.update();
    composer.render(scene, camera);
}