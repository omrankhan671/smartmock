/**
 * 3D ROBOT INTERVIEWER
 * Three.js implementation for AI Interview avatar
 * Replaces emoji avatar with same functionality
 */

(function() {
  'use strict';

  class RobotInterviewer {
    constructor(containerId, THREE, options = {}) {
      this.container = document.getElementById(containerId);
      this.options = options || {};
      const canvasId = this.options.canvasId || 'robot-interviewer-canvas';
      this.canvas = document.getElementById(canvasId);
      this.THREE = THREE;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.robot = null;
      this.robotHead = null;
      this.leftEye = null;
      this.rightEye = null;
      this.mouth = null;
      this.core = null;
      this.currentState = 'neutral';
      this.blinkInterval = null;
      this.animationId = null;
      this.targetHeadRot = { x: 0, y: 0 };
      this.currentHeadRot = { x: 0, y: 0 };
      
      this.init();
    }

    init() {
      if (!this.canvas) {
        console.error('Robot canvas not found');
        return;
      }

      if (!this.THREE) {
        console.error('THREE.js not loaded');
        return;
      }

      this.setupScene();
      this.createRobot();
      this.setupLights();

      // Optional cursor tracking for "robot can see" effect
      if (this.options.trackCursor) {
        window.addEventListener('mousemove', (e) => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          const nx = (e.clientX / w) * 2 - 1; // -1..1 (right = +)
          const ny = -((e.clientY / h) * 2 - 1); // -1..1 (up = +)
          // Intuitive mapping: move cursor right -> head yaws right; move up -> head pitches up
          this.targetHeadRot.y = nx * 0.4;   // yaw follows cursor horizontally
          this.targetHeadRot.x = -ny * 0.25; // invert to pitch up when cursor goes up
        });
      }
      this.startAnimation();
      this.startBlinking();
    }

  setupScene() {
    const THREE = this.THREE;
    
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = null;

    // Camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this.camera.position.z = 4;
    this.camera.position.y = 0;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas,
      antialias: true, 
      alpha: true 
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Handle resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupLights() {
    const THREE = this.THREE;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    // Purple spotlight
    const purpleLight = new THREE.PointLight(0xa855f7, 2, 100);
    purpleLight.position.set(0, 2, 3);
    this.scene.add(purpleLight);

    // Cyan accent light
    const cyanLight = new THREE.PointLight(0x00f0ff, 1.5, 100);
    cyanLight.position.set(-2, 0, 2);
    this.scene.add(cyanLight);

    // Pink accent light
    const pinkLight = new THREE.PointLight(0xd946ef, 1.5, 100);
    pinkLight.position.set(2, 0, 2);
    this.scene.add(pinkLight);
  }

  createRobot() {
    const THREE = this.THREE;
    
    this.robot = new THREE.Group();
    this.robot.position.y = -0.3;

    // HEAD
    const headGeometry = new THREE.BoxGeometry(1, 1, 1, 8, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0xa855f7,
      emissiveIntensity: 0.1
    });
    this.robotHead = new THREE.Mesh(headGeometry, headMaterial);
    this.robotHead.name = 'head';
    this.robot.add(this.robotHead);

    // ANTENNA
    const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 16);
    const antennaMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xa855f7,
      emissive: 0xa855f7,
      emissiveIntensity: 0.8
    });
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.set(0, 0.7, 0);
    this.robotHead.add(antenna);

    // Antenna ball
    const ballGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const ballMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xd946ef,
      emissive: 0xd946ef,
      emissiveIntensity: 1.5
    });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(0, 0.9, 0);
    ball.userData.glow = true;
    this.robotHead.add(ball);

    // EYE SOCKETS (glowing purple)
    const socketGeometry = new THREE.SphereGeometry(0.15, 32, 32);
    const socketMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xa855f7,
      emissive: 0xa855f7,
      emissiveIntensity: 1
    });
    
    const leftSocket = new THREE.Mesh(socketGeometry, socketMaterial);
    leftSocket.position.set(-0.25, 0.15, 0.48);
    this.robotHead.add(leftSocket);
    
    const rightSocket = new THREE.Mesh(socketGeometry, socketMaterial);
    rightSocket.position.set(0.25, 0.15, 0.48);
    this.robotHead.add(rightSocket);

    // EYES (black spheres)
    const eyeGeometry = new THREE.SphereGeometry(0.12, 32, 32);
    const eyeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x000000,
      roughness: 0.1,
      metalness: 0.9
    });
    
    this.leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    this.leftEye.position.set(-0.25, 0.15, 0.5);
    this.leftEye.name = 'leftEye';
    this.robotHead.add(this.leftEye);

    this.rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    this.rightEye.position.set(0.25, 0.15, 0.5);
    this.rightEye.name = 'rightEye';
    this.robotHead.add(this.rightEye);

    // PUPILS (glowing cyan)
    const pupilGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const pupilMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 2
    });
    
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(0, 0, 0.08);
    this.leftEye.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0, 0, 0.08);
    this.rightEye.add(rightPupil);

    // MOUTH (torus for smile)
    const mouthGeometry = new THREE.TorusGeometry(0.18, 0.02, 16, 32, Math.PI);
    const mouthMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xa855f7,
      emissive: 0xa855f7,
      emissiveIntensity: 0.8
    });
    this.mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    this.mouth.position.set(0, -0.2, 0.5);
    this.mouth.rotation.x = Math.PI; // Smile
    this.mouth.userData.defaultRotation = Math.PI;
    this.robotHead.add(this.mouth);

    // BODY
    const bodyGeometry = new THREE.BoxGeometry(1.2, 1.5, 0.8, 8, 8, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x222222,
      roughness: 0.4,
      metalness: 0.9,
      emissive: 0xa855f7,
      emissiveIntensity: 0.05
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = -1.4;
    this.robot.add(body);

    // ENERGY CORE (glowing sphere in chest)
    const coreGeometry = new THREE.SphereGeometry(0.25, 32, 32);
    const coreMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xd946ef,
      emissive: 0xd946ef,
      emissiveIntensity: 2
    });
    this.core = new THREE.Mesh(coreGeometry, coreMaterial);
    this.core.position.y = -1.2;
    this.core.userData.pulse = true;
    this.robot.add(this.core);

    this.scene.add(this.robot);
  }

  startAnimation() {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  update() {
    const time = Date.now() * 0.001;

    // Keep robot facing forward - NO auto-rotation
    if (this.robot) {
      this.robot.rotation.set(0, 0, 0);
    }

    // Smooth head tracking toward cursor (only if trackCursor is enabled)
    if (this.robotHead && this.options.trackCursor) {
      this.currentHeadRot.x += (this.targetHeadRot.x - this.currentHeadRot.x) * 0.08;
      this.currentHeadRot.y += (this.targetHeadRot.y - this.currentHeadRot.y) * 0.08;
      this.robotHead.rotation.x = this.currentHeadRot.x;
      this.robotHead.rotation.y = this.currentHeadRot.y;
    } else if (this.robotHead) {
      // Reset head to forward position if not tracking
      this.robotHead.rotation.set(0, 0, 0);
    }

    // Core pulsing (only scale, no rotation)
    if (this.core && this.core.userData.pulse) {
      const scale = 1 + Math.sin(time * 3) * 0.08;
      this.core.scale.set(scale, scale, scale);
      // REMOVED: this.core.rotation.y += 0.02; (causing spinning)
    }

    // Antenna ball glow
    this.scene.traverse((child) => {
      if (child.userData.glow) {
        const intensity = 1.5 + Math.sin(time * 4) * 0.5;
        child.material.emissiveIntensity = intensity;
      }
    });
  }

  startBlinking() {
    this.blinkInterval = setInterval(() => {
      this.blink();
    }, 3000 + Math.random() * 4000); // 3-7 seconds
  }

  blink() {
    if (!this.leftEye || !this.rightEye) return;

    // Scale eyes vertically
    this.leftEye.scale.y = 0.1;
    this.rightEye.scale.y = 0.1;
    
    setTimeout(() => {
      this.leftEye.scale.y = 1;
      this.rightEye.scale.y = 1;
    }, 150);
  }

  // STATE METHODS (matching emoji avatar functionality)
  
  setState(state) {
    this.currentState = state;
    
    // Remove all state classes from container
    this.container.classList.remove('robot-speaking', 'robot-happy', 'robot-sad');
    
    switch(state) {
      case 'speaking':
        this.setSpeakingState();
        break;
      case 'happy':
        this.setHappyState();
        break;
      case 'sad':
        this.setSadState();
        break;
      default:
        this.setNeutralState();
    }
  }

  setSpeakingState() {
    this.container.classList.add('robot-speaking');
    
    // Animate mouth (open/close)
    if (this.mouth) {
      const speakAnimation = () => {
        if (this.currentState !== 'speaking') return;
        
        const time = Date.now() * 0.01;
        this.mouth.scale.y = 1 + Math.sin(time) * 0.3;
        this.mouth.rotation.z = Math.sin(time * 0.5) * 0.1;
        
        requestAnimationFrame(speakAnimation);
      };
      speakAnimation();
    }

    // Head bobbing
    if (this.robotHead) {
      const bobAnimation = () => {
        if (this.currentState !== 'speaking') {
          this.robotHead.position.y = 0;
          this.robotHead.rotation.x = 0;
          return;
        }
        
        const time = Date.now() * 0.005;
        this.robotHead.position.y = Math.sin(time) * 0.05;
        this.robotHead.rotation.x = Math.sin(time * 0.7) * 0.05;
        
        requestAnimationFrame(bobAnimation);
      };
      bobAnimation();
    }
  }

  setHappyState() {
    this.container.classList.add('robot-happy');
    
    // Happy eyes (winking)
    if (this.leftEye) {
      this.leftEye.scale.y = 0.3;
      setTimeout(() => { this.leftEye.scale.y = 1; }, 500);
    }
    
    // Big smile
    if (this.mouth) {
      this.mouth.scale.set(1.2, 1.2, 1.2);
      this.mouth.rotation.x = Math.PI * 1.1; // Bigger smile
      setTimeout(() => {
        this.mouth.scale.set(1, 1, 1);
        this.mouth.rotation.x = Math.PI;
      }, 600);
    }

    // Bounce robot
    let bounceCount = 0;
    const bounceInterval = setInterval(() => {
      if (bounceCount >= 2) {
        clearInterval(bounceInterval);
        this.robot.position.y = -0.3;
        return;
      }
      
      this.robot.position.y = -0.3 + Math.sin(bounceCount * Math.PI) * 0.2;
      bounceCount += 0.1;
    }, 30);
  }

  setSadState() {
    this.container.classList.add('robot-sad');
    
    // Sad eyes (droopy)
    if (this.leftEye && this.rightEye) {
      this.leftEye.position.y = 0.1;
      this.rightEye.position.y = 0.1;
      
      setTimeout(() => {
        this.leftEye.position.y = 0.15;
        this.rightEye.position.y = 0.15;
      }, 500);
    }
    
    // Sad mouth (frown)
    if (this.mouth) {
      this.mouth.rotation.x = 0; // Frown
      setTimeout(() => {
        this.mouth.rotation.x = Math.PI; // Back to smile
      }, 500);
    }

    // Head droop
    if (this.robotHead) {
      this.robotHead.rotation.x = 0.2;
      setTimeout(() => {
        this.robotHead.rotation.x = 0;
      }, 500);
    }
  }

  setNeutralState() {
    // Reset to default
    if (this.mouth) {
      this.mouth.scale.set(1, 1, 1);
      this.mouth.rotation.x = Math.PI;
      this.mouth.rotation.z = 0;
    }
    
    if (this.robotHead) {
      this.robotHead.position.y = 0;
      this.robotHead.rotation.x = 0;
      // keep yaw from cursor tracking for liveliness
    }
  }

  onWindowResize() {
    if (!this.camera || !this.renderer || !this.container) return;
    
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

  // Make RobotInterviewer available globally
  window.RobotInterviewer = RobotInterviewer;

})();
