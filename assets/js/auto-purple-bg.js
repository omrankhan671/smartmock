/**
 * Auto-Include Purple Particles Background
 * Add this single line to any page: <script src="assets/js/auto-purple-bg.js"></script>
 * It will automatically inject the CSS and initialize the background
 */

(function() {
  'use strict';
  
  // Prevent double initialization
  if (window.__purpleBgInitialized) {
    console.log('⚠️ Auto Purple Background already initialized');
    return;
  }
  window.__purpleBgInitialized = true;
  
  console.log('🎨 Auto Purple Background loader started');
  
  // Resolve asset URLs relative to this script's location
  const currentScript = document.currentScript || (function(){
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();
  const scriptUrl = new URL(currentScript.src, window.location.href);
  // e.g. http://localhost:8080/assets/js/auto-purple-bg.js -> http://localhost:8080/assets/
  const assetsBase = scriptUrl.href.replace(/\/assets\/js\/auto-purple-bg\.js(?:\?.*)?$/, '/assets/');
  const assetUrl = (subpath) => assetsBase + subpath.replace(/^\/?/, '');
  
  // Inject CSS if not already present
  function injectCSS() {
    // Check if already loaded
    const existingLink = document.querySelector('link[href*="purple-particles-bg.css"]');
    if (existingLink) {
      console.log('✅ Purple particles CSS already loaded');
      return;
    }
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = assetUrl('css/purple-particles-bg.css');
    link.onerror = () => console.warn('⚠️ Failed to load purple-particles-bg.css from', link.href);
    document.head.appendChild(link);
    console.log('✅ Purple particles CSS injected');
  }
  
  // Inject Three.js if not already present
  function injectThreeJS(callback) {
    if (typeof THREE !== 'undefined') {
      console.log('✅ THREE.js already loaded');
      callback();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
      console.log('✅ THREE.js loaded');
      callback();
    };
    document.head.appendChild(script);
  }
  
  // Inject Robot Interviewer script
  function injectRobotScript(callback) {
    if (typeof window.RobotInterviewer !== 'undefined') {
      console.log('✅ RobotInterviewer already loaded');
      callback();
      return;
    }
    
    // Avoid duplicate injection
    if (document.querySelector('script[src*="robot-interviewer.js"]')) {
      console.log('✅ RobotInterviewer script already present');
      callback();
      return;
    }
    const script = document.createElement('script');
    script.src = assetUrl('js/robot-interviewer.js');
    script.onload = () => {
      console.log('✅ RobotInterviewer loaded');
      callback();
    };
    script.onerror = () => console.warn('⚠️ Failed to load robot-interviewer.js from', script.src);
    document.body.appendChild(script);
  }
  
  // Inject purple particles background script
  function injectPurpleParticlesScript() {
    if (document.querySelector('script[src*="purple-particles-bg.js"]')) {
      console.log('✅ Purple particles script already present');
      return;
    }
    const script = document.createElement('script');
    script.src = assetUrl('js/purple-particles-bg.js');
    script.onerror = () => console.warn('⚠️ Failed to load purple-particles-bg.js from', script.src);
    document.body.appendChild(script);
    console.log('✅ Purple particles script injected');
  }
  
  // Main initialization
  function init() {
    // Inject CSS immediately
    injectCSS();
    
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM loaded, starting script injection');
        injectThreeJS(() => {
          injectRobotScript(() => {
            injectPurpleParticlesScript();
          });
        });
      });
    } else {
      console.log('📄 DOM already loaded, starting script injection');
      injectThreeJS(() => {
        injectRobotScript(() => {
          injectPurpleParticlesScript();
        });
      });
    }
  }
  
  // Start
  init();
  
})();
