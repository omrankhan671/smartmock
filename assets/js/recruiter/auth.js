// Recruiter auth utilities: session guard, minimal UI helpers
(function(){
  if (!window.firebase || !firebase.apps?.length) {
    console.warn('Firebase not initialized');
    return;
  }
  const auth = firebase.auth();
  const db = firebase.database();

  // Session guard for recruiter pages
  async function requireRecruiter() {
    return new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        try {
          unsubscribe(); // Prevent multiple calls
          
          if (!user) {
            const currentPath = window.location.pathname;
            if (!currentPath.includes('login.html') && !currentPath.includes('register.html')) {
              window.location.href = './login.html';
            }
            reject(new Error('Not authenticated'));
            return;
          }

          const snap = await db.ref('recruiters/' + user.uid).get();
          if (!snap.exists()) {
            console.warn('Not a recruiter, redirecting...');
            if (!window.location.pathname.includes('login.html')) {
              window.location.href = './login.html';
            }
            reject(new Error('Not a recruiter'));
            return;
          }
          
          resolve(user);
        } catch (e) {
          console.error('Auth check failed', e);
          unsubscribe();
          reject(e);
        }
      });
    });
  }

  // Get current recruiter profile
  async function getRecruiterProfile(uid) {
    try {
      const snap = await db.ref('recruiters/' + uid).get();
      return snap.val();
    } catch (e) {
      console.error('Failed to get recruiter profile', e);
      return null;
    }
  }

  // Check if user is authenticated
  function isAuthenticated() {
    return auth.currentUser !== null;
  }

  // Get current user
  function getCurrentUser() {
    return auth.currentUser;
  }

  // Expose globally
  window.RecruiterAuth = { 
    requireRecruiter, 
    getRecruiterProfile,
    isAuthenticated,
    getCurrentUser
  };
})();
