// Mobile-friendly controls that directly interact with the Three.js scene
// This script correctly modifies the global parameters in both scripts

// Create a function to access the global variables across modules
function getMobileController() {
    // Function to find objects in the global scope or window
    const findInGlobalScope = (propertyName) => {
        if (typeof window[propertyName] !== 'undefined') {
            return window[propertyName];
        }
        return null;
    };

    // Object to store references to important objects
    const globalRefs = {
        // Background.js variables
        scene: findInGlobalScope('scene'),
        camera: findInGlobalScope('camera'),
        guiParams: findInGlobalScope('guiParams'),
        bloomPass: findInGlobalScope('bloomPass'),
        dotScreenPass: findInGlobalScope('dotScreenPass'),
        glitchPass: findInGlobalScope('glitchPass'),
        shapeMesh: findInGlobalScope('shapeMesh'),
        model: findInGlobalScope('model'),
        updateTransparency: findInGlobalScope('updateTransparency'),
        
        // Clock.js variables
        clockElement: document.getElementById('MyClockDisplay'),
        showTime: findInGlobalScope('showTime')
    };
    
    return {
        // Initialize the mobile controls
        init: function() {
            this.createMobileControls();
            this.syncInitialValues();
            this.setupEventListeners();
        },
        
        // Create mobile UI elements
        createMobileControls: function() {
            // Create menu toggle button
            const menuToggle = document.createElement('button');
            menuToggle.className = 'menu-toggle';
            menuToggle.innerHTML = '⚙️';
            menuToggle.setAttribute('aria-label', 'Toggle Settings');
            document.body.appendChild(menuToggle);
            
            // Create controls container
            const controlsContainer = document.createElement('div');
            controlsContainer.className = 'controls-container';
            document.body.appendChild(controlsContainer);
            
            // Add control groups based on existing GUI parameters
            const controlsHTML = `
                <div class="control-group">
                    <span class="control-label">Clock Color</span>
                    <input type="color" id="mobile-clock-color" value="#17D4FE">
                </div>
                
                <div class="control-group">
                    <span class="control-label">Rotation X</span>
                    <div class="slider-container">
                        <input type="range" id="mobile-rotation-x" min="0" max="0.05" step="0.001" value="0.001">
                        <span class="slider-value" id="rotation-x-value">0.001</span>
                    </div>
                </div>
                
                <div class="control-group">
                    <span class="control-label">Rotation Y</span>
                    <div class="slider-container">
                        <input type="range" id="mobile-rotation-y" min="0" max="0.05" step="0.001" value="0.001">
                        <span class="slider-value" id="rotation-y-value">0.001</span>
                    </div>
                </div>
                
                <div class="control-group">
                    <span class="control-label">Transparency</span>
                    <div class="slider-container">
                        <input type="range" id="mobile-transparency" min="0" max="1" step="0.05" value="0.5">
                        <span class="slider-value" id="transparency-value">0.5</span>
                    </div>
                </div>
                
                <div class="control-group">
                    <span class="control-label">Bloom Strength</span>
                    <div class="slider-container">
                        <input type="range" id="mobile-bloom-strength" min="0" max="3" step="0.1" value="1.5">
                        <span class="slider-value" id="bloom-strength-value">1.5</span>
                    </div>
                </div>
                
                <div class="control-group">
                    <span class="control-label">Bloom Radius</span>
                    <div class="slider-container">
                        <input type="range" id="mobile-bloom-radius" min="0" max="1" step="0.05" value="0.4">
                        <span class="slider-value" id="bloom-radius-value">0.4</span>
                    </div>
                </div>
                
                <div class="control-group">
                    <div class="toggle-container">
                        <span class="control-label">24-Hour Format</span>
                        <label class="toggle-switch">
                            <input type="checkbox" id="mobile-24h-toggle">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="control-group">
                    <div class="toggle-container">
                        <span class="control-label">Glitch Effect</span>
                        <label class="toggle-switch">
                            <input type="checkbox" id="mobile-glitch-toggle">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="control-group">
                    <div class="toggle-container">
                        <span class="control-label">Dot Screen</span>
                        <label class="toggle-switch">
                            <input type="checkbox" id="mobile-dotscreen-toggle" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            `;
            
            controlsContainer.innerHTML = controlsHTML;
            
            // Initially hide controls
            controlsContainer.style.display = 'none';
            
            // Toggle controls visibility
            menuToggle.addEventListener('click', function() {
                if (controlsContainer.style.display === 'none') {
                    controlsContainer.style.display = 'block';
                } else {
                    controlsContainer.style.display = 'none';
                }
            });
            
            // Store references
            this.controlsContainer = controlsContainer;
            this.menuToggle = menuToggle;
        },
        
        // Sync initial values from the global GUI params
        syncInitialValues: function() {
            const refs = globalRefs;
            
            // Only proceed if we have access to the parameters
            if (!refs.guiParams) {
                console.warn('Mobile controller: Could not access guiParams');
                return;
            }
            
            // Set initial values based on the existing parameters
            document.getElementById('mobile-clock-color').value = 
                refs.guiParams.clockColour || '#17D4FE';
            
            // Rotation speeds
            document.getElementById('mobile-rotation-x').value = 
                refs.guiParams.rotationSpeedX || 0;
            document.getElementById('rotation-x-value').textContent = 
                (refs.guiParams.rotationSpeedX || 0).toFixed(3);
                
            document.getElementById('mobile-rotation-y').value = 
                refs.guiParams.rotationSpeedY || 0.001;
            document.getElementById('rotation-y-value').textContent = 
                (refs.guiParams.rotationSpeedY || 0.001).toFixed(3);
            
            // Transparency
            document.getElementById('mobile-transparency').value = 
                refs.guiParams.transparency || 0.5;
            document.getElementById('transparency-value').textContent = 
                (refs.guiParams.transparency || 0.5).toFixed(2);
            
            // Bloom effects
            document.getElementById('mobile-bloom-strength').value = 
                refs.guiParams.bloomStrength || 1.5;
            document.getElementById('bloom-strength-value').textContent = 
                (refs.guiParams.bloomStrength || 1.5).toFixed(1);
                
            document.getElementById('mobile-bloom-radius').value = 
                refs.guiParams.bloomRadius || 0.4;
            document.getElementById('bloom-radius-value').textContent = 
                (refs.guiParams.bloomRadius || 0.4).toFixed(2);
            
            // Toggle switches
            document.getElementById('mobile-24h-toggle').checked = 
                refs.guiParams.twentyFourHour || false;
                
            document.getElementById('mobile-glitch-toggle').checked = 
                refs.guiParams.activateGlitch || false;
                
            document.getElementById('mobile-dotscreen-toggle').checked = 
                refs.guiParams.activateDotScreen !== undefined ? 
                refs.guiParams.activateDotScreen : true;
        },
        
        // Set up event listeners for all controls
        setupEventListeners: function() {
            const refs = globalRefs;
            const self = this;
            
            // Clock color
            document.getElementById('mobile-clock-color').addEventListener('input', function(e) {
                const color = e.target.value;
                // Apply directly to the clock element
                if (refs.clockElement) {
                    refs.clockElement.style.color = color;
                }
                
                // Update the global parameter
                if (refs.guiParams) {
                    refs.guiParams.clockColour = color;
                }
            });
            
            // 24-hour format
            document.getElementById('mobile-24h-toggle').addEventListener('change', function(e) {
                if (refs.guiParams) {
                    refs.guiParams.twentyFourHour = e.target.checked;
                    
                    // Trigger clock update
                    if (typeof refs.showTime === 'function') {
                        refs.showTime();
                    }
                }
            });
            
            // Rotation speed X
            document.getElementById('mobile-rotation-x').addEventListener('input', function(e) {
                const value = parseFloat(e.target.value);
                document.getElementById('rotation-x-value').textContent = value.toFixed(3);
                
                if (refs.guiParams) {
                    refs.guiParams.rotationSpeedX = value;
                }
            });
            
            // Rotation speed Y
            document.getElementById('mobile-rotation-y').addEventListener('input', function(e) {
                const value = parseFloat(e.target.value);
                document.getElementById('rotation-y-value').textContent = value.toFixed(3);
                
                if (refs.guiParams) {
                    refs.guiParams.rotationSpeedY = value;
                }
            });
            
            // Transparency
            document.getElementById('mobile-transparency').addEventListener('input', function(e) {
                const value = parseFloat(e.target.value);
                document.getElementById('transparency-value').textContent = value.toFixed(2);
                
                if (refs.guiParams) {
                    refs.guiParams.transparency = value;
                    
                    // Call the update function if available
                    if (typeof refs.updateTransparency === 'function') {
                        refs.updateTransparency(value);
                    } else {
                        // Direct manipulation if function not available
                        if (refs.shapeMesh) {
                            refs.shapeMesh.material.transparent = true;
                            refs.shapeMesh.material.opacity = value;
                        }
                        
                        if (refs.model) {
                            refs.model.traverse((child) => {
                                if (child.isMesh) {
                                    child.material.transparent = true;
                                    child.material.opacity = value;
                                }
                            });
                        }
                    }
                }
            });
            
            // Bloom strength
            document.getElementById('mobile-bloom-strength').addEventListener('input', function(e) {
                const value = parseFloat(e.target.value);
                document.getElementById('bloom-strength-value').textContent = value.toFixed(1);
                
                if (refs.guiParams && refs.bloomPass) {
                    refs.guiParams.bloomStrength = value;
                    refs.bloomPass.strength = value;
                }
            });
            
            // Bloom radius
            document.getElementById('mobile-bloom-radius').addEventListener('input', function(e) {
                const value = parseFloat(e.target.value);
                document.getElementById('bloom-radius-value').textContent = value.toFixed(2);
                
                if (refs.guiParams && refs.bloomPass) {
                    refs.guiParams.bloomRadius = value;
                    refs.bloomPass.radius = value;
                }
            });
            
            // Glitch effect
            document.getElementById('mobile-glitch-toggle').addEventListener('change', function(e) {
                if (refs.guiParams && refs.glitchPass) {
                    refs.guiParams.activateGlitch = e.target.checked;
                    refs.glitchPass.enabled = e.target.checked;
                }
            });
            
            // Dot screen effect
            document.getElementById('mobile-dotscreen-toggle').addEventListener('change', function(e) {
                if (refs.guiParams && refs.dotScreenPass) {
                    refs.guiParams.activateDotScreen = e.target.checked;
                    refs.dotScreenPass.enabled = e.target.checked;
                }
            });
        }
    };
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a short moment to ensure Three.js scene is initialized
    setTimeout(() => {
        const mobileController = getMobileController();
        mobileController.init();
    }, 500); // Half second delay to ensure other scripts have loaded
});