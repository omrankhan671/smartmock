/**
 * GLOBAL BUTTON FIX - Make ALL buttons clickable on ALL pages
 * This fixes the pointer-events:none blocking issue across the entire platform
 */

(function() {
  'use strict';
  
  console.log('🔧 GLOBAL BUTTON FIX: Starting...');
  
  // Wait for DOM to be ready
  function init() {
    console.log('🔧 Removing pointer-events:none from all blocking elements...');
    
    // Get all elements with pointer-events: none
    const allElements = document.querySelectorAll('*');
    let fixedCount = 0;
    
    allElements.forEach(el => {
      const computed = window.getComputedStyle(el);
      
      // Skip particles, backgrounds, and canvases (they SHOULD block)
      const skipClasses = ['particles-container', 'particle', 'background'];
      const skipIds = ['particlesContainer', 'bg-robot-container'];
      const skipTags = ['CANVAS'];
      
      const shouldSkip = 
        skipClasses.some(cls => el.classList.contains(cls)) ||
        skipIds.includes(el.id) ||
        skipTags.includes(el.tagName) ||
        el.closest('.particles-container') ||
        el.closest('#bg-robot-container');
      
      if (computed.pointerEvents === 'none' && !shouldSkip) {
        el.style.pointerEvents = 'auto';
        fixedCount++;
        console.log(`✅ Fixed: ${el.tagName}.${el.className} #${el.id}`);
      }
    });
    
    console.log(`✅ Fixed ${fixedCount} elements`);
    
    // Force ALL buttons and interactive elements to be clickable
    const interactiveSelectors = [
      'button',
      '.btn',
      'a',
      'input',
      'select',
      'textarea',
      '[onclick]',
      '[role="button"]',
      '.controls-container'
    ];
    
    interactiveSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.setProperty('pointer-events', 'auto', 'important');
        el.style.setProperty('cursor', 'pointer', 'important');
      });
    });
    
    console.log('✅ All buttons and interactive elements forced to clickable');
    
    // Force z-index on all buttons
    document.querySelectorAll('button, .btn, [onclick]').forEach(el => {
      if (!el.closest('.particles-container') && !el.closest('#bg-robot-container')) {
        el.style.zIndex = Math.max(1000, parseInt(el.style.zIndex) || 0);
      }
    });
    
    console.log('✅ All button z-indexes boosted to 1000+');
    
    // Add diagnostic on ANY button click
    document.addEventListener('click', function(e) {
      const target = e.target;
      console.log('🖱️ CLICK DETECTED on:', target.tagName, target.id, target.className, 'at', e.clientX, e.clientY);
      if (target.tagName === 'BUTTON' || target.classList.contains('btn') || target.hasAttribute('onclick')) {
        console.log('✅ BUTTON CLICK CONFIRMED:', target.textContent?.trim(), target.id, target.className);
      }
    }, true);
    
    // Add mousedown/mouseup detection
    document.addEventListener('mousedown', function(e) {
      console.log('🖱️ MOUSEDOWN at:', e.clientX, e.clientY, 'target:', e.target.tagName, e.target.id);
    }, true);
    
    document.addEventListener('mouseup', function(e) {
      console.log('🖱️ MOUSEUP at:', e.clientX, e.clientY, 'target:', e.target.tagName, e.target.id);
    }, true);
    
    // Test if elementFromPoint works
    setTimeout(() => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const elementAtCenter = document.elementFromPoint(centerX, centerY);
      console.log('🎯 Element at center of screen:', elementAtCenter?.tagName, elementAtCenter?.className, elementAtCenter?.id);
      
      // Check for invisible overlays
      const body = document.body;
      const allFixed = document.querySelectorAll('[style*="fixed"]');
      const allAbsolute = document.querySelectorAll('[style*="absolute"]');
      console.log('🔍 Found', allFixed.length, 'fixed elements and', allAbsolute.length, 'absolute elements');
      
      // Force remove any full-screen overlays that might be blocking
      document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed' || style.position === 'absolute') {
          const width = parseFloat(style.width);
          const height = parseFloat(style.height);
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;
          
          // If element covers most/all of screen
          if (width >= windowWidth * 0.8 && height >= windowHeight * 0.8) {
            const zIndex = parseInt(style.zIndex) || 0;
            // Only flag it if it has high z-index and pointer events
            if (zIndex > 100 && style.pointerEvents !== 'none') {
              console.warn('⚠️ FOUND POTENTIAL OVERLAY BLOCKER:', el.tagName, el.className, el.id, 'z-index:', zIndex);
              // Force it to not block
              el.style.pointerEvents = 'none';
              console.log('✅ Disabled pointer events on overlay');
            }
          }
        }
      });
    }, 1000);
    
    console.log('🎉 GLOBAL BUTTON FIX COMPLETE - All buttons should now work!');
  }
  
  // Run fix when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Run again after a delay to catch dynamically added elements
  setTimeout(init, 2000);
  setTimeout(init, 5000);
  
})();
