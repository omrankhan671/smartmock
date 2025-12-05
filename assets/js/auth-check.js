// Authentication Check - Include this on protected pages
// This ensures users are logged in before accessing the page

// SmartMock v2.0 - Enhanced Auth Check with Graceful Handling
(function() {
  'use strict';
  
  // List of public pages that don't require authentication
  const publicPages = [
    'index.html',
    'about.html',
    'contact.html',
    'verify-certificate.html',
    '', // For root path
    'community.html',
    'leaderboard.html',
    'report.html',
    'certificate.html',
    'ai-report.html',
    'recruiter/login.html',
    'recruiter/register.html',
  ];
  
  // Get current page filename
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  // Check if current page is public
  const isPublicPage = publicPages.includes(currentPage);

  // Function to check authentication with retries
  function checkAuthentication(retryCount = 0) {
    const maxRetries = 15; // Increased retries for slower connections
    
    // Check if Firebase Auth is available
    if (typeof firebase === 'undefined' || typeof firebase.auth !== 'function') {
      if (retryCount < maxRetries) {
        console.log(`⏳ Waiting for Firebase Auth... (attempt ${retryCount + 1}/${maxRetries})`);
        // Retry after a short delay
        setTimeout(() => checkAuthentication(retryCount + 1), 200);
        return;
      } else {
        console.error('❌ Firebase Auth failed to load after retries');
        // If on a protected page, redirect only after all retries fail
        if (!isPublicPage) {
          alert('Authentication service failed to load. Please check your connection and try again.');
          window.location.href = 'index.html';
        }
        return;
      }
    }
    
    // Get auth instance
    const auth = firebase.auth();
    console.log(`🔐 Auth listener setup on: ${currentPage}`);
    
    // Check authentication state
    auth.onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in
        console.log(`✅ User authenticated on ${currentPage}:`, user.email || user.uid);
        
        // Update UI to show user info
        updateUserUI(user);
        
        // If user is on login page, redirect to dashboard
        if (currentPage === 'index.html') {
          console.log('ℹ️ User is on login page, redirecting to dashboard...');
          window.location.href = 'dashboard.html';
        }
        
      } else {
        // No user is signed in
        console.log(`❌ No user authenticated on: ${currentPage}`);
        
        // Hide navigation elements when not authenticated
        hideNavigationElements();
        
        // Redirect to login if on protected page
        if (!isPublicPage) {
          console.warn(`⚠️ Protected page (${currentPage}) - redirecting to login...`);
          // Store the intended destination to redirect back after login
          localStorage.setItem('redirect_url', window.location.href);
          window.location.href = 'index.html';
        }
      }
    });
  }
  
  // Start checking authentication when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => checkAuthentication());
  } else {
    checkAuthentication();
  }
  
  // Update UI elements with user information
  function updateUserUI(user) {
    const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'Guest');
    const email = user.email || 'No email';
    
    // Update any elements with class 'user-name'
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(function(el) {
      el.textContent = displayName;
    });
    
    // Update any elements with class 'user-email'
    const userEmailElements = document.querySelectorAll('.user-email');
    userEmailElements.forEach(function(el) {
      el.textContent = email;
    });
    
    // Update any elements with data-user-id attribute
    const userIdElements = document.querySelectorAll('[data-user-id]');
    userIdElements.forEach(function(el) {
      el.dataset.userId = user.uid;
    });
    
    // Show navigation elements when user is authenticated
    showNavigationElements();
  }
  
  // Hide or show navigation elements based on authentication
  function hideNavigationElements() {
    // Hide menu button
    const menuButton = document.querySelector('.menu-button');
    if (menuButton) menuButton.style.display = 'none';
    
    // Hide profile button
    const profileLinks = document.querySelectorAll('a[href*="profile.html"]');
    profileLinks.forEach(function(link) {
      link.style.display = 'none';
    });
    
    // Hide signout button
    const signoutLinks = document.querySelectorAll('a[onclick*="signOut"]');
    signoutLinks.forEach(function(link) {
      link.style.display = 'none';
    });
  }
  
  function showNavigationElements() {
    // Show menu button
    const menuButton = document.querySelector('.menu-button');
    if (menuButton) menuButton.style.display = '';
    
    // Show profile button
    const profileLinks = document.querySelectorAll('a[href*="profile.html"]');
    profileLinks.forEach(function(link) {
      link.style.display = '';
    });
    
    // Show signout button
    const signoutLinks = document.querySelectorAll('a[onclick*="signOut"]');
    signoutLinks.forEach(function(link) {
      link.style.display = '';
    });
  }
  
  // Hide navigation on login/signup pages
  const loginPages = ['index.html', 'login.html', 'signup.html', 'register.html'];
  if (loginPages.some(page => currentPage === page || window.location.pathname.includes(page))) {
    hideNavigationElements();
  }
  
})();
