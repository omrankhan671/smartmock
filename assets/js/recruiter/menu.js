/**
 * Recruiter Left-Side Hamburger Menu
 * Consistent left-slide menu across all recruiter pages (matches home.html behavior)
 */

(function initRecruiterMenu() {
  'use strict';
  
  // Only run once
  if (document.getElementById('recruiter-menu-overlay')) {
    console.log('⚠️ Recruiter menu already initialized');
    return;
  }
  
  const menuBtn = document.querySelector('.menu-button');
  const dropdown = document.querySelector('.dropdown');
  
  if (!menuBtn || !dropdown) {
    console.warn('⚠️ Menu button or dropdown not found');
    return;
  }
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'recruiter-menu-overlay';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    display: none;
    z-index: 1500;
  `;
  document.body.appendChild(overlay);
  
  // Create left-side panel
  const panel = document.createElement('div');
  panel.id = 'recruiter-menu-panel';
  panel.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: min(320px, 80vw);
    height: 100%;
    background: rgba(18, 18, 18, 0.95);
    border-right: 1px solid rgba(168, 85, 247, 0.3);
    box-shadow: 10px 0 40px rgba(0, 0, 0, 0.4);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1600;
    overflow-y: auto;
  `;
  document.body.appendChild(panel);
  
  // Clone dropdown menu into panel
  const clonedMenu = dropdown.cloneNode(true);
  clonedMenu.style.cssText = `
    display: block !important;
    position: static;
    background: transparent;
    box-shadow: none;
    padding: 20px;
    max-height: none;
  `;
  
  // Style menu items
  const menuItems = clonedMenu.querySelectorAll('li');
  menuItems.forEach(item => {
    item.style.cssText = `
      padding: 12px 16px;
      border-bottom: 1px solid rgba(168, 85, 247, 0.1);
    `;
    const link = item.querySelector('a');
    if (link) {
      link.style.cssText = `
        color: #fff;
        text-decoration: none;
        display: block;
        font-size: 16px;
        transition: color 0.2s ease;
      `;
      link.addEventListener('mouseenter', () => {
        link.style.color = '#a855f7';
      });
      link.addEventListener('mouseleave', () => {
        link.style.color = '#fff';
      });
    }
  });
  
  panel.appendChild(clonedMenu);
  
  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  closeBtn.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(168, 85, 247, 0.2);
    border: 1px solid rgba(168, 85, 247, 0.5);
    color: #fff;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 10;
  `;
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = 'rgba(168, 85, 247, 0.4)';
    closeBtn.style.transform = 'scale(1.1)';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = 'rgba(168, 85, 247, 0.2)';
    closeBtn.style.transform = 'scale(1)';
  });
  panel.appendChild(closeBtn);
  
  // Functions to open/close menu
  function openMenu() {
    overlay.style.display = 'block';
    panel.style.transform = 'translateX(0)';
    document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
  }
  
  function closeMenu() {
    overlay.style.display = 'none';
    panel.style.transform = 'translateX(-100%)';
    document.body.style.overflow = ''; // Restore scrolling
  }
  
  // Event listeners
  menuBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openMenu();
  });
  
  overlay.addEventListener('click', closeMenu);
  closeBtn.addEventListener('click', closeMenu);
  
  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.style.display === 'block') {
      closeMenu();
    }
  });
  
  // Close menu when clicking any menu link
  clonedMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });
  
  console.log('✅ Recruiter left-side menu initialized');
})();
