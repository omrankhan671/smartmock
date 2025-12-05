/**
 * Purple Particles Background with Robot Animation
 * Shared across all SmartMock pages for consistent visual experience
 */

(function() {
  'use strict';
  
  // Create particles container if it doesn't exist
  function createParticlesContainer() {
    if (document.getElementById('particlesContainer')) return;
    
    const container = document.createElement('div');
    container.className = 'particles-container';
    container.id = 'particlesContainer';
    document.body.insertBefore(container, document.body.firstChild);
    
    console.log('✅ Particles container created');
  }
  
  // Create robot container if it doesn't exist
  function createRobotContainer() {
    if (document.getElementById('bg-robot-container')) return;
    
    const robotDiv = document.createElement('div');
    robotDiv.id = 'bg-robot-container';
    
    const canvas = document.createElement('canvas');
    canvas.id = 'bg-robot-canvas';
    
    robotDiv.appendChild(canvas);
    document.body.insertBefore(robotDiv, document.body.firstChild);
    
    console.log('✅ Robot container created');
  }
  
  // Initialize particles
  function initParticles() {
    const particlesContainer = document.getElementById('particlesContainer');
    if (!particlesContainer) {
      console.warn('Particles container not found');
      return;
    }
    
    // Clear existing particles
    particlesContainer.innerHTML = '';
    
    // Generate 150 particles (increased from 50 for denser effect)
    for (let i = 0; i < 150; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random size with more variety
      const size = Math.random() * 5 + 1.5;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random horizontal position
      particle.style.left = `${Math.random() * 100}%`;
      
      // Random animation duration (wider range for variety)
      const duration = Math.random() * 12 + 8;
      particle.style.animationDuration = `${duration}s`;
      
      // Random delay
      const delay = Math.random() * 6;
      particle.style.animationDelay = `${delay}s`;
      
      // Random horizontal drift (increased range)
      const drift = (Math.random() - 0.5) * 250;
      particle.style.setProperty('--drift', `${drift}px`);
      
      // Add opacity variation for depth effect
      const opacity = Math.random() * 0.4 + 0.6;
      particle.style.opacity = opacity;
      
      particlesContainer.appendChild(particle);
    }
    
    console.log('✅ Particles initialized (150 particles)');
  }
  
  // Initialize background robot
  function initBackgroundRobot() {
    if (typeof THREE === 'undefined' || typeof window.RobotInterviewer === 'undefined') {
      console.log('⏳ Waiting for THREE.js and RobotInterviewer...');
      return setTimeout(initBackgroundRobot, 100);
    }
    
    try {
      window.bgRobot = new window.RobotInterviewer('bg-robot-container', THREE, {
        canvasId: 'bg-robot-canvas',
        trackCursor: true  // ENABLED - robot head follows cursor
      });
      
      // Set neutral state
      window.bgRobot.setState('neutral');
      
      // FORCE remove any BODY/CONTAINER animations (but allow head tracking)
      const robotContainer = document.getElementById('bg-robot-container');
      if (robotContainer) {
        robotContainer.style.animation = 'none';
        robotContainer.style.transform = 'none';
        robotContainer.style.willChange = 'auto';
        robotContainer.style.perspective = 'none';
        robotContainer.style.transformStyle = 'flat';
        
        // Continuously enforce no container rotation (prevents spinning)
        setInterval(() => {
          if (robotContainer.style.animation !== 'none') {
            robotContainer.style.animation = 'none';
            robotContainer.style.transform = 'none';
          }
        }, 100);
      }
      
      console.log('✅ Background robot initialized (head tracking enabled, body locked)');
    } catch (e) {
      console.error('❌ Failed to init background robot:', e);
    }
  }
  
  // Advanced Parallax and Depth Effect (DISABLED rotation to prevent spinning)
  function initParallax() {
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    
    document.addEventListener('mousemove', (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      targetX = (x - 0.5) * 30; // Reduced from 50
      targetY = (y - 0.5) * 30; // Reduced from 50
      
      // Update gradient position
      document.body.style.setProperty('--gradient-x', `${x * 100}%`);
      document.body.style.setProperty('--gradient-y', `${y * 100}%`);
    });
    
    // Smooth animation loop
    function animate() {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      
      const robotContainer = document.getElementById('bg-robot-container');
      if (robotContainer) {
        // REMOVED rotation transforms - keep robot stable and facing forward
        robotContainer.style.transform = 'none';
      }
      
      const particlesContainer = document.getElementById('particlesContainer');
      if (particlesContainer) {
        // Only apply subtle translation to particles, no rotation
        particlesContainer.style.transform = `
          translate(${currentX * 0.2}px, ${currentY * 0.2}px)
        `;
      }
      
      requestAnimationFrame(animate);
    }
    
    animate();
    console.log('✅ Parallax effect initialized (rotation disabled)');
  }
  
  // Main initialization
  function init() {
    console.log('🎨 Initializing purple particles background...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    // Create containers
    createParticlesContainer();
    createRobotContainer();
    
    // Initialize effects
    initParticles();
    initBackgroundRobot();
    initParallax();
    
    console.log('✅ Purple particles background fully initialized!');
  }
  
  // Start initialization
  init();
  
})();
