import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/RenderPass.js';
import { DotScreenPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/DotScreenPass.js';
import { GlitchPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/GlitchPass.js';
import { GUI } from 'https://cdn.skypack.dev/dat.gui';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, composer, bloomPass, controls, shapeMesh, model, glitchPass, dotScreenPass;
let loader = new GLTFLoader();  // For loading GLTF models
let guiParams = {
    deformAmount: 0.1,
    transparency: 0.5,
    bloomStrength: 3,
    bloomRadius: 0.4,
    bloomThreshold: 0,
    activateGlitch: false,
    dotScale: 0.1,
    activateDotScreen: true,
    shape: 'Sphere',
    rotationSpeedX: 0,
    rotationSpeedY: 0.001,
    rotationSpeedZ: 0
};

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

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    // Orbit Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Post-processing setup
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), guiParams.bloomStrength, guiParams.bloomRadius, guiParams.bloomThreshold);
    composer.addPass(bloomPass);

    dotScreenPass = new DotScreenPass(new THREE.Vector2(0, 0), guiParams.dotScale);
    dotScreenPass.enabled = true;
    composer.addPass(dotScreenPass);

    glitchPass = new GlitchPass();
    glitchPass.enabled = false;
    composer.addPass(glitchPass);

    // GUI Setup
    const gui = new GUI({ width: '100%', closeOnTop: true, closed: true });

    // Rotation Speed Controls
    gui.add(guiParams, 'rotationSpeedX', 0.0001, 0.05, 0.001).name('Rotation Speed X');
    gui.add(guiParams, 'rotationSpeedY', 0.0001, 0.05, 0.001).name('Rotation Speed Y');
    gui.add(guiParams, 'rotationSpeedZ', 0.0001, 0.05, 0.001).name('Rotation Speed Z');

    // Transparency Control
    gui.add(guiParams, 'transparency', 0, 1).onChange(value => {
        if (shapeMesh) shapeMesh.material.opacity = value;
    });

    // Bloom Controls
    gui.add(guiParams, 'bloomStrength', 0, 3).onChange(value => {
        bloomPass.strength = value;
    });
    gui.add(guiParams, 'bloomRadius', 0, 1).onChange(value => {
        bloomPass.radius = value;
    });
    gui.add(guiParams, 'bloomThreshold', 0, 1).onChange(value => {
        bloomPass.threshold = value;
    });

    // GlitchPass Toggle
    gui.add(guiParams, 'activateGlitch').onChange(value => {
        glitchPass.enabled = value;
    });

    // DotScreenPass Toggle
    gui.add(guiParams, 'activateDotScreen').onChange(value => {
        dotScreenPass.enabled = value;
    });
    gui.add(guiParams, 'dotScale', 0.1, 4, 0.1).onChange(value => {
        dotScreenPass.uniforms['scale'].value = value;
    });
    const radioGroup = document.querySelector('.radio-group');
    radioGroup.addEventListener('change', (event) => {
        guiParams.shape = event.target.value;
        updateObject();  // Update the scene with the selected shape/model
    });
    // Load the initial shape (Sphere by default)
    updateObject();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
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
            wireframe: true,
            transparent: true,
            opacity: guiParams.transparency
        });
        shapeMesh = new THREE.Mesh(geometry, material);
        scene.add(shapeMesh);
    } else if (models[guiParams.shape]) {
        // Load the 3D model
        loadModel(models[guiParams.shape]);
    }
}

function loadModel(modelPath) {
    loader.load(modelPath, function (gltf) {
        model = gltf.scene;
        model.scale.set(1, 1, 1);  // Adjust scale if necessary

        // Create the same material used for the shapes
        const newMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: guiParams.transparency
        });

        // Traverse the model and apply the new material to each mesh
        model.traverse((child) => {
            if (child.isMesh) {
                child.material = newMaterial;
            }
        });

        scene.add(model);
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
