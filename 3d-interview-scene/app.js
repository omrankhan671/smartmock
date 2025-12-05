/**
 * SMARTMOCK 3D Scene - Three.js Implementation
 * Usage: Put avatar GLB at assets/avatar.glb (optional). Open index.html in a web server.
 * 
 * This replicates a Spline-like 3D scene using Three.js with:
 * - Cybernetic humanoid avatar (GLB or procedural fallback)
 * - Three floating glassmorphic panels with text
 * - Neon lighting (cyan #00E4FF, violet #C500FF)
 * - Bloom postprocessing for glow effects
 * - Parallax camera on mouse move
 * - Hover interactions on panels
 * - Animated particles
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Colors
  neonCyan: 0x00E4FF,
  neonViolet: 0xC500FF,
  bgDark: 0x0A0A0A,
  
  // Camera
  cameraFOV: 50,
  cameraPosition: { x: 0, y: 1.5, z: 5 },
  
  // Avatar
  avatarPath: 'assets/avatar.glb',
  avatarScale: 1.2,
  avatarPosition: { x: 0, y: 0, z: 0 },
  
  // Panels
  panelWidth: 1.5,
  panelHeight: 2,
  panelDepth: 0.05,
  panelRadius: 4,
  panelYPosition: 1.5,
  panelTexts: ['BASIC', 'PRO', 'ENTERPRISE'],
  
  // Particles
  particleCount: 500,
  particleSize: 0.03,
  particleRange: 15,
  
  // Effects
  bloomStrength: 1.2,
  bloomRadius: 0.6,
  bloomThreshold: 0.4,
  
  // Performance
  enableBloom: true,
  enableParticles: true,
  targetFPS: 60
};

// ============================================================================
// GLOBAL STATE
// ============================================================================

let scene, camera, renderer, composer;
let avatar, panels = [], particles, reflectionPlane;
let mouse = { x: 0, y: 0 };
let targetCamera = { x: 0, y: 1.5, z: 5 };
let raycaster, pointer;
let hoveredPanel = null;
let performanceMode = false;

// ============================================================================
// INITIALIZATION
// ============================================================================

async function init() {
  console.log('🚀 Initializing SMARTMOCK 3D Pricing Scene...');
  
  // Check WebGL support
  if (!checkWebGLSupport()) {
    showWebGLError();
    return;
  }
  
  // Setup Three.js
  setupScene();
  setupCamera();
  setupRenderer();
  setupLights();
  setupReflectionPlane();
  
  // Load avatar (with fallback)
  await loadAvatar();
  
  // Create scene elements
  createPanels();
  createParticles();
  
  // Setup postprocessing
  setupPostprocessing();
  
  // Setup interactions
  setupEventListeners();
  
  // Start animation loop
  animate();
  
  // Hide preloader
  hidePreloader();
  
  console.log('✅ Scene initialized successfully');
}

// ============================================================================
// SCENE SETUP
// ============================================================================

function setupScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG.bgDark);
  scene.fog = new THREE.FogExp2(CONFIG.bgDark, 0.05);
}

function setupCamera() {
  camera = new THREE.PerspectiveCamera(
    CONFIG.cameraFOV,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(
    CONFIG.cameraPosition.x,
    CONFIG.cameraPosition.y,
    CONFIG.cameraPosition.z
  );
  camera.lookAt(0, 1, 0);
}

function setupRenderer() {
  const container = document.getElementById('canvas-container');
  renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  
  // Raycaster for hover detection
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
}

function setupLights() {
  // Ambient light
  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambient);
  
  // Key light (front top)
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(2, 5, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  scene.add(keyLight);
  
  // Cyan rim light (back left)
  const cyanRim = new THREE.PointLight(CONFIG.neonCyan, 3, 15);
  cyanRim.position.set(-3, 2, -2);
  scene.add(cyanRim);
  
  // Violet rim light (back right)
  const violetRim = new THREE.PointLight(CONFIG.neonViolet, 3, 15);
  violetRim.position.set(3, 2, -2);
  scene.add(violetRim);
  
  // Bottom fill light
  const fillLight = new THREE.PointLight(0x4466ff, 0.5, 10);
  fillLight.position.set(0, -1, 3);
  scene.add(fillLight);
}

function setupReflectionPlane() {
  // Subtle reflective floor
  const planeGeometry = new THREE.PlaneGeometry(50, 50);
  const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.3
  });
  reflectionPlane = new THREE.Mesh(planeGeometry, planeMaterial);
  reflectionPlane.rotation.x = -Math.PI / 2;
  reflectionPlane.position.y = -0.5;
  reflectionPlane.receiveShadow = true;
  scene.add(reflectionPlane);
}

// ============================================================================
// AVATAR LOADING
// ============================================================================

async function loadAvatar() {
  console.log('📦 Loading avatar...');
  
  const loader = new GLTFLoader();
  
  try {
    // Try to load GLB file
    const gltf = await new Promise((resolve, reject) => {
      loader.load(
        CONFIG.avatarPath,
        resolve,
        undefined,
        reject
      );
    });
    
    avatar = gltf.scene;
    avatar.scale.set(CONFIG.avatarScale, CONFIG.avatarScale, CONFIG.avatarScale);
    avatar.position.set(
      CONFIG.avatarPosition.x,
      CONFIG.avatarPosition.y,
      CONFIG.avatarPosition.z
    );
    
    // Apply glass material to avatar
    avatar.traverse((child) => {
      if (child.isMesh) {
        child.material = createGlassMaterial(0.6);
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    scene.add(avatar);
    console.log('✅ Avatar loaded from GLB');
    
  } catch (error) {
    console.warn('⚠️ Could not load avatar.glb, using procedural fallback:', error.message);
    createProceduralAvatar();
  }
}

function createProceduralAvatar() {
  // Procedural humanoid using primitives
  avatar = new THREE.Group();
  const glassMat = createGlassMaterial(0.5);
  
  // Head
  const headGeo = new THREE.IcosahedronGeometry(0.3, 1);
  const head = new THREE.Mesh(headGeo, glassMat);
  head.position.y = 1.7;
  head.castShadow = true;
  avatar.add(head);
  
  // Eyes (emissive cyan)
  const eyeMat = new THREE.MeshStandardMaterial({
    color: CONFIG.neonCyan,
    emissive: CONFIG.neonCyan,
    emissiveIntensity: 3,
    metalness: 1,
    roughness: 0
  });
  const eyeGeo = new THREE.SphereGeometry(0.05, 16, 16);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.1, 1.75, 0.25);
  avatar.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.1, 1.75, 0.25);
  avatar.add(rightEye);
  
  // Torso
  const torsoGeo = new THREE.BoxGeometry(0.6, 0.8, 0.4);
  const torso = new THREE.Mesh(torsoGeo, glassMat);
  torso.position.y = 1.0;
  torso.castShadow = true;
  avatar.add(torso);
  
  // Arms
  const armGeo = new THREE.CapsuleGeometry(0.08, 0.6, 8, 16);
  const leftArm = new THREE.Mesh(armGeo, glassMat);
  leftArm.position.set(-0.4, 1.0, 0);
  leftArm.rotation.z = 0.3;
  leftArm.castShadow = true;
  avatar.add(leftArm);
  const rightArm = new THREE.Mesh(armGeo, glassMat);
  rightArm.position.set(0.4, 1.0, 0);
  rightArm.rotation.z = -0.3;
  rightArm.castShadow = true;
  avatar.add(rightArm);
  
  // Legs
  const legGeo = new THREE.CapsuleGeometry(0.1, 0.7, 8, 16);
  const leftLeg = new THREE.Mesh(legGeo, glassMat);
  leftLeg.position.set(-0.15, 0.2, 0);
  leftLeg.castShadow = true;
  avatar.add(leftLeg);
  const rightLeg = new THREE.Mesh(legGeo, glassMat);
  rightLeg.position.set(0.15, 0.2, 0);
  rightLeg.castShadow = true;
  avatar.add(rightLeg);
  
  // Neon outlines (edge lines)
  const edgeMat = new THREE.LineBasicMaterial({ 
    color: CONFIG.neonCyan,
    linewidth: 2
  });
  avatar.traverse((child) => {
    if (child.isMesh) {
      const edges = new THREE.EdgesGeometry(child.geometry);
      const line = new THREE.LineSegments(edges, edgeMat);
      child.add(line);
    }
  });
  
  avatar.position.set(
    CONFIG.avatarPosition.x,
    CONFIG.avatarPosition.y,
    CONFIG.avatarPosition.z
  );
  
  scene.add(avatar);
  console.log('✅ Procedural avatar created');
}

// ============================================================================
// PANELS
// ============================================================================

function createPanels() {
  const panelAngles = [-35, 0, 35]; // degrees
  
  CONFIG.panelTexts.forEach((text, index) => {
    const angle = panelAngles[index] * (Math.PI / 180);
    const x = Math.sin(angle) * CONFIG.panelRadius;
    const z = Math.cos(angle) * CONFIG.panelRadius - CONFIG.panelRadius + 1.5;
    
    const panel = createPanel(text);
    panel.position.set(x, CONFIG.panelYPosition, z);
    panel.rotation.y = -angle;
    panel.userData.originalPosition = { x, y: CONFIG.panelYPosition, z };
    panel.userData.originalRotation = { x: 0, y: -angle, z: 0 };
    panel.userData.index = index;
    panel.userData.text = text;
    
    panels.push(panel);
    scene.add(panel);
  });
  
  console.log(`✅ Created ${panels.length} panels`);
}

function createPanel(text) {
  const group = new THREE.Group();
  
  // Glass panel
  const geometry = new THREE.BoxGeometry(
    CONFIG.panelWidth,
    CONFIG.panelHeight,
    CONFIG.panelDepth
  );
  const material = createGlassMaterial(0.3);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  
  // Neon outline frame
  const frameGeo = new THREE.EdgesGeometry(geometry);
  const frameMat = new THREE.LineBasicMaterial({
    color: CONFIG.neonCyan,
    linewidth: 3
  });
  const frame = new THREE.LineSegments(frameGeo, frameMat);
  group.add(frame);
  
  // Glow outline (for bloom)
  const glowGeo = new THREE.PlaneGeometry(
    CONFIG.panelWidth + 0.1,
    CONFIG.panelHeight + 0.1
  );
  const glowMat = new THREE.MeshBasicMaterial({
    color: CONFIG.neonCyan,
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.z = CONFIG.panelDepth / 2 + 0.01;
  group.add(glow);
  group.userData.glow = glow;
  
  // Text using canvas texture
  const textCanvas = createTextCanvas(text);
  const textTexture = new THREE.CanvasTexture(textCanvas);
  textTexture.colorSpace = THREE.SRGBColorSpace;
  const textMat = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
    side: THREE.DoubleSide
  });
  const textGeo = new THREE.PlaneGeometry(1.2, 0.4);
  const textMesh = new THREE.Mesh(textGeo, textMat);
  textMesh.position.z = CONFIG.panelDepth / 2 + 0.02;
  group.add(textMesh);
  
  return group;
}

function createTextCanvas(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Text
  ctx.fillStyle = '#00E4FF';
  ctx.font = 'bold 60px Orbitron, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  
  // Glow effect
  ctx.shadowColor = '#00E4FF';
  ctx.shadowBlur = 20;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  
  return canvas;
}

function createGlassMaterial(opacity) {
  return new THREE.MeshPhysicalMaterial({
    color: 0x88ccff,
    metalness: 0.1,
    roughness: 0.1,
    transparent: true,
    opacity: opacity,
    transmission: 0.9,
    thickness: 0.5,
    envMapIntensity: 1.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });
}

// ============================================================================
// PARTICLES
// ============================================================================

function createParticles() {
  if (!CONFIG.enableParticles || performanceMode) return;
  
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  
  for (let i = 0; i < CONFIG.particleCount; i++) {
    // Random position in sphere
    const radius = Math.random() * CONFIG.particleRange;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    positions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta) - 2,
      radius * Math.cos(phi) - 5
    );
    
    // Random color between cyan and violet
    const color = new THREE.Color();
    color.lerpColors(
      new THREE.Color(CONFIG.neonCyan),
      new THREE.Color(CONFIG.neonViolet),
      Math.random()
    );
    colors.push(color.r, color.g, color.b);
  }
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  
  const material = new THREE.PointsMaterial({
    size: CONFIG.particleSize,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  particles = new THREE.Points(geometry, material);
  scene.add(particles);
  
  console.log(`✅ Created ${CONFIG.particleCount} particles`);
}

// ============================================================================
// POSTPROCESSING
// ============================================================================

function setupPostprocessing() {
  if (!CONFIG.enableBloom || performanceMode) return;
  
  // Composer
  composer = new EffectComposer(renderer);
  
  // Render pass
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  
  // Bloom pass
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    CONFIG.bloomStrength,
    CONFIG.bloomRadius,
    CONFIG.bloomThreshold
  );
  composer.addPass(bloomPass);
  
  console.log('✅ Postprocessing setup complete');
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
  // Mouse move for parallax
  window.addEventListener('mousemove', onMouseMove);
  
  // Click for panel interaction
  window.addEventListener('click', onPanelClick);
  
  // Resize
  window.addEventListener('resize', onWindowResize);
  
  // Performance toggle
  const toggleBtn = document.getElementById('toggleEffects');
  toggleBtn.addEventListener('click', togglePerformanceMode);
  
  console.log('✅ Event listeners setup');
}

function onMouseMove(event) {
  // Normalized mouse coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  // Update raycaster pointer
  pointer.x = mouse.x;
  pointer.y = mouse.y;
  
  // Parallax camera target
  targetCamera.x = mouse.x * 0.5;
  targetCamera.y = CONFIG.cameraPosition.y + mouse.y * 0.3;
}

function onPanelClick() {
  if (hoveredPanel) {
    const text = hoveredPanel.userData.text;
    console.log(`🎯 Panel clicked: ${text}`);
    
    // Navigate based on panel
    if (text === 'BASIC') {
      window.location.href = '#';
    } else if (text === 'PRO') {
      window.location.href = '#';
    } else if (text === 'ENTERPRISE') {
      window.location.href = '#';
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (composer) {
    composer.setSize(window.innerWidth, window.innerHeight);
  }
}

function togglePerformanceMode() {
  performanceMode = !performanceMode;
  const toggleBtn = document.getElementById('toggleEffects');
  toggleBtn.classList.toggle('active');
  
  if (performanceMode) {
    console.log('⚡ Performance mode enabled');
    // Disable particles
    if (particles) particles.visible = false;
    // Disable bloom
    CONFIG.enableBloom = false;
  } else {
    console.log('✨ Full effects mode enabled');
    // Enable particles
    if (particles) particles.visible = true;
    // Enable bloom
    CONFIG.enableBloom = true;
    setupPostprocessing();
  }
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate() {
  requestAnimationFrame(animate);
  
  const time = performance.now() * 0.001;
  
  // Animate avatar (subtle float)
  if (avatar) {
    avatar.position.y = Math.sin(time * 0.5) * 0.1;
    avatar.rotation.y = Math.sin(time * 0.2) * 0.1;
  }
  
  // Animate particles
  if (particles && CONFIG.enableParticles && !performanceMode) {
    particles.rotation.y = time * 0.02;
    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i+1];
      const z = positions[i+2];
      
      positions[i+1] += Math.sin(time + x) * 0.002;
    }
    particles.geometry.attributes.position.needsUpdate = true;
  }
  
  // Parallax camera movement
  camera.position.x += (targetCamera.x - camera.position.x) * 0.05;
  camera.position.y += (targetCamera.y - camera.position.y) * 0.05;
  camera.lookAt(0, 1, 0);
  
  // Raycast for hover detection
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(panels, true);
  
  // Reset previous hover
  if (hoveredPanel && (intersects.length === 0 || intersects[0].object.parent.parent !== hoveredPanel)) {
    resetPanelHover(hoveredPanel);
    hoveredPanel = null;
    document.body.style.cursor = 'default';
  }
  
  // Apply new hover
  if (intersects.length > 0) {
    const panel = intersects[0].object.parent.parent;
    if (panel !== hoveredPanel) {
      hoveredPanel = panel;
      applyPanelHover(hoveredPanel);
      document.body.style.cursor = 'pointer';
    }
  }
  
  // Render
  if (composer && CONFIG.enableBloom && !performanceMode) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
}

function applyPanelHover(panel) {
  // Tilt toward cursor
  const angle = Math.atan2(mouse.x, mouse.y) * 0.1;
  panel.rotation.x = -mouse.y * 0.2;
  panel.rotation.y = panel.userData.originalRotation.y - mouse.x * 0.2;
  
  // Scale up
  panel.scale.set(1.1, 1.1, 1.1);
  
  // Intensify glow
  if (panel.userData.glow) {
    panel.userData.glow.material.opacity = 0.3;
    panel.userData.glow.material.color.setHex(CONFIG.neonViolet);
  }
  
  // Move forward
  panel.position.z = panel.userData.originalPosition.z + 0.3;
}

function resetPanelHover(panel) {
  // Reset rotation
  panel.rotation.x = panel.userData.originalRotation.x;
  panel.rotation.y = panel.userData.originalRotation.y;
  panel.rotation.z = panel.userData.originalRotation.z;
  
  // Reset scale
  panel.scale.set(1, 1, 1);
  
  // Reset glow
  if (panel.userData.glow) {
    panel.userData.glow.material.opacity = 0.1;
    panel.userData.glow.material.color.setHex(CONFIG.neonCyan);
  }
  
  // Reset position
  panel.position.z = panel.userData.originalPosition.z;
}

// ============================================================================
// UTILITIES
// ============================================================================

function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

function showWebGLError() {
  const container = document.getElementById('canvas-container');
  container.innerHTML = `
    <div class="no-webgl">
      <h2>WebGL Not Supported</h2>
      <p>Your browser does not support WebGL, which is required for this 3D experience.</p>
      <p>Please use a modern browser like Chrome, Firefox, or Edge.</p>
    </div>
  `;
}

function hidePreloader() {
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    preloader.classList.add('hidden');
    document.body.classList.add('loaded');
    document.body.classList.remove('loading');
  }, 1000);
}

// ============================================================================
// START APPLICATION
// ============================================================================

document.body.classList.add('loading');
init().catch(error => {
  console.error('❌ Initialization failed:', error);
  hidePreloader();
});

// ============================================================================
// TUNING NOTES
// ============================================================================

/*
 * CUSTOMIZATION GUIDE:
 * 
 * 1. COLORS:
 *    - CONFIG.neonCyan: Main cyan accent color
 *    - CONFIG.neonViolet: Main violet accent color
 *    - Adjust in lights, materials, and text
 * 
 * 2. AVATAR:
 *    - Replace CONFIG.avatarPath with your GLB model
 *    - Adjust CONFIG.avatarScale for size
 *    - Modify createProceduralAvatar() for fallback look
 * 
 * 3. PANELS:
 *    - Change CONFIG.panelTexts for different labels
 *    - Adjust CONFIG.panelRadius to spread panels wider/closer
 *    - Modify panelAngles in createPanels() for positioning
 * 
 * 4. BLOOM:
 *    - CONFIG.bloomStrength: Intensity of glow (0-3)
 *    - CONFIG.bloomRadius: Spread of glow (0-1)
 *    - CONFIG.bloomThreshold: What emits glow (0-1)
 * 
 * 5. PERFORMANCE:
 *    - CONFIG.particleCount: Reduce for better FPS
 *    - CONFIG.enableBloom: Disable for low-end devices
 *    - renderer.setPixelRatio(): Lower for better performance
 * 
 * 6. CAMERA:
 *    - CONFIG.cameraFOV: Field of view (30-90)
 *    - CONFIG.cameraPosition: Starting camera position
 *    - Adjust parallax multipliers in onMouseMove()
 */