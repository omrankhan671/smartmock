// Initialize Firebase immediately (synchronous)
function initializeFirebase() {
  // Check if Firebase SDK is loaded
  if (typeof firebase === 'undefined') {
    console.error('❌ Firebase SDK not loaded. Make sure firebase-app-compat.js is included before this script.');
    return;
  }

  const firebaseConfig = {
    apiKey: "AIzaSyCJPGmNh1HsLm_9tMIk4mllarMmzV2QFho",
    authDomain: "smartmock-848c9.firebaseapp.com",
    databaseURL: "https://smartmock-848c9-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smartmock-848c9",
    storageBucket: "smartmock-848c9.firebasestorage.app",
    messagingSenderId: "250910673755",
    appId: "1:250910673755:web:d932623d49d94002abe87e"
  };

  try {
    // Check if already initialized
    if (firebase.apps.length === 0) {
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);
      console.log("✅ Firebase initialized successfully");
    } else {
      console.log("ℹ️ Firebase already initialized");
    }
    
    // Initialize Firebase services
    window.auth = firebase.auth();
    window.database = firebase.database();
    
    // Set persistence to LOCAL (persists even when browser is closed)
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        console.log("✅ Firebase Auth persistence set to LOCAL");
      })
      .catch((error) => {
        console.error("❌ Error setting persistence:", error);
      });
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.error('Make sure your Firebase project exists and the credentials are correct.');
    console.error('Visit https://console.firebase.google.com/ to set up your project.');
    return;
  }
  

  
  // Handle redirect result from Google/OAuth sign-in
  handleRedirectResult();
}

// ============================================
// AUTHENTICATION HELPERS
// ============================================

// Sign up with email and password
async function signUpWithEmail(email, password, displayName) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    if (displayName) {
      await user.updateProfile({ displayName });
    }
    
    // Save user profile to database
    await saveUserProfile(user.uid, {
      email: user.email,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });
    
    console.log('✅ User registered successfully:', user.email);
    return { success: true, user };
  } catch (error) {
    console.error('❌ Registration error:', error);
    return { success: false, error: error.message };
  }
}

// Sign in with email and password
async function signInWithEmail(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Update last login time
    await updateUserProfile(user.uid, {
      lastLogin: new Date().toISOString()
    });
    
    console.log('✅ User signed in successfully:', user.email);
    return { success: true, user };
  } catch (error) {
    console.error('❌ Login error:', error);
    return { success: false, error: error.message };
  }
}

// Sign out
async function signOut() {
  try {
    await auth.signOut();
    localStorage.clear();
    console.log('✅ User signed out');
    window.location.href = '/index.html';
    return { success: true };
  } catch (error) {
    console.error('❌ Sign out error:', error);
    return { success: false, error: error.message };
  }
}

// Reset password
async function resetPassword(email) {
  try {
    await auth.sendPasswordResetEmail(email);
    console.log('✅ Password reset email sent');
    return { success: true };
  } catch (error) {
    console.error('❌ Password reset error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// MULTIPLE AUTHENTICATION METHODS
// ============================================

// Sign in with Google (with popup fallback to redirect)
async function signInWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Try popup first
    try {
      const userCredential = await auth.signInWithPopup(provider);
      const user = userCredential.user;
      
      // Check if this is a new user
      const isNewUser = userCredential.additionalUserInfo?.isNewUser;
      
      if (isNewUser) {
        // Save user profile for new users
        await saveUserProfile(user.uid, {
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL || null,
          provider: 'google',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
      } else {
        // Update last login for existing users
        await updateUserProfile(user.uid, {
          lastLogin: new Date().toISOString()
        });
      }
      
      console.log('✅ Google sign-in successful:', user.email);
      return { success: true, user, isNewUser };
    } catch (popupError) {
      // If popup fails due to COOP or popup blocker, try redirect
      if (popupError.code === 'auth/popup-blocked' || 
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.message.includes('popup')) {
        console.log('ℹ️ Popup blocked or closed, using redirect method...');
        // Use redirect method instead
        await auth.signInWithRedirect(provider);
        // Note: redirect will reload the page, so we won't reach here
        return { success: true, redirect: true };
      }
      throw popupError; // Re-throw other errors
    }
  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    
    // User-friendly error messages
    let errorMessage = error.message;
    if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup was blocked by your browser. Please allow popups for this site.';
    } else if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in cancelled. Please try again.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = 'Only one sign-in popup allowed at a time.';
    }
    
    return { success: false, error: errorMessage };
  }
}

// Handle redirect result (call this on page load)
async function handleRedirectResult() {
  try {
    // Check if running in supported environment
    const protocol = window.location.protocol;
    if (protocol !== 'http:' && protocol !== 'https:' && protocol !== 'chrome-extension:') {
      console.warn('⚠️ Firebase redirect not supported in file:// protocol. Use a local server (http://localhost)');
      return;
    }
    
    const result = await auth.getRedirectResult();
    if (result.user) {
      const user = result.user;
      const isNewUser = result.additionalUserInfo?.isNewUser;
      
      if (isNewUser) {
        await saveUserProfile(user.uid, {
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL || null,
          provider: 'google',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
      } else {
        await updateUserProfile(user.uid, {
          lastLogin: new Date().toISOString()
        });
      }
      
      console.log('✅ Google sign-in successful (redirect):', user.email);
      // Redirect to home page
      if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        window.location.href = 'home.html';
      }
    }
  } catch (error) {
    if (error.code === 'auth/operation-not-supported-in-this-environment') {
      console.warn('⚠️ Auth operation not supported. Please access via http://localhost or https://');
    } else if (error.code !== 'auth/invalid-api-key') {
      console.error('❌ Redirect result error:', error);
    }
  }
}

// Sign in as guest (anonymous)
async function signInAsGuest() {
  try {
    const userCredential = await auth.signInAnonymously();
    const user = userCredential.user;
    
    // Save minimal profile for guest users
    await saveUserProfile(user.uid, {
      displayName: 'Guest User',
      provider: 'anonymous',
      isGuest: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });
    
    console.log('✅ Guest sign-in successful:', user.uid);
    return { success: true, user };
  } catch (error) {
    console.error('❌ Guest sign-in error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================

// Send phone verification code
async function sendPhoneVerificationCode(phoneNumber) {
  try {
    if (!window.recaptchaVerifier) {
      throw new Error('reCAPTCHA not initialized');
    }
    
    const confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier);
    window.confirmationResult = confirmationResult;
    
    console.log('✅ SMS verification code sent');
    return { success: true };
  } catch (error) {
    console.error('❌ Phone sign-in error:', error);
    
    // Reset reCAPTCHA on error
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    
    return { success: false, error: error.message };
  }
}

// Verify phone code
async function verifyPhoneCode(code) {
  try {
    if (!window.confirmationResult) {
      throw new Error('No verification code sent. Please request a new code.');
    }
    
    const userCredential = await window.confirmationResult.confirm(code);
    const user = userCredential.user;
    
    // Check if this is a new user
    const isNewUser = userCredential.additionalUserInfo?.isNewUser;
    
    if (isNewUser) {
      // Save user profile for new users
      await saveUserProfile(user.uid, {
        phoneNumber: user.phoneNumber,
        displayName: 'Phone User',
        provider: 'phone',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
    } else {
      // Update last login for existing users
      await updateUserProfile(user.uid, {
        lastLogin: new Date().toISOString()
      });
    }
    
    console.log('✅ Phone verification successful:', user.phoneNumber);
    return { success: true, user, isNewUser };
  } catch (error) {
    console.error('❌ Phone verification error:', error);
    return { success: false, error: error.message };
  }
}



// Save user profile
async function saveUserProfile(userId, data) {
  try {
    await database.ref(`users/${userId}`).set({
      ...data,
      updatedAt: new Date().toISOString()
    });
    console.log('✅ User profile saved');
    return { success: true };
  } catch (error) {
    console.error('❌ Error saving user profile:', error);
    return { success: false, error: error.message };
  }
}

// Update user profile
async function updateUserProfile(userId, data) {
  try {
    await database.ref(`users/${userId}`).update({
      ...data,
      updatedAt: new Date().toISOString()
    });
    console.log('✅ User profile updated');
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    return { success: false, error: error.message };
  }
}

// Get user profile
async function getUserProfile(userId) {
  try {
    const snapshot = await database.ref(`users/${userId}`).once('value');
    const data = snapshot.val();
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// DATABASE HELPERS - CERTIFICATES
// ============================================

// Save certificate
async function saveCertificate(certificateData) {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const certRef = database.ref(`certificates/${certificateData.certificateId}`);
    await certRef.set({
      ...certificateData,
      userId,
      createdAt: certificateData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Also save reference in user's certificates list
    await database.ref(`users/${userId}/certificates/${certificateData.certificateId}`).set({
      certificateId: certificateData.certificateId,
      courseName: certificateData.courseName,
      dateIssued: certificateData.dateIssued || new Date().toLocaleDateString(),
      createdAt: new Date().toISOString()
    });
    
    console.log('✅ Certificate saved:', certificateData.certificateId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error saving certificate:', error);
    return { success: false, error: error.message };
  }
}

// Get certificate by ID
async function getCertificate(certificateId) {
  try {
    const snapshot = await database.ref(`certificates/${certificateId}`).once('value');
    const data = snapshot.val();
    
    if (!data) {
      return { success: false, error: 'Certificate not found' };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error fetching certificate:', error);
    return { success: false, error: error.message };
  }
}

// Get all certificates for current user
async function getUserCertificates() {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const snapshot = await database.ref(`users/${userId}/certificates`).once('value');
    const data = snapshot.val();
    
    return { success: true, data: data || {} };
  } catch (error) {
    console.error('❌ Error fetching user certificates:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// DATABASE HELPERS - INTERVIEW REPORTS
// ============================================

// Save interview report
async function saveInterviewReport(reportData) {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const sessionId = reportData.sessionId || `SESSION-${Date.now()}`;
    const reportRef = database.ref(`interviews/${userId}/${sessionId}`);
    
    await reportRef.set({
      ...reportData,
      userId,
      sessionId,
      createdAt: reportData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Interview report saved:', sessionId);
    return { success: true, sessionId };
  } catch (error) {
    console.error('❌ Error saving interview report:', error);
    return { success: false, error: error.message };
  }
}

// Update interview report
async function updateInterviewReport(sessionId, updates) {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    await database.ref(`interviews/${userId}/${sessionId}`).update({
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Interview report updated:', sessionId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating interview report:', error);
    return { success: false, error: error.message };
  }
}

// Get interview report by session ID
async function getInterviewReport(sessionId) {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const snapshot = await database.ref(`interviews/${userId}/${sessionId}`).once('value');
    const data = snapshot.val();
    
    if (!data) {
      return { success: false, error: 'Interview report not found' };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error fetching interview report:', error);
    return { success: false, error: error.message };
  }
}

// Get all interview reports for current user
async function getUserInterviewReports() {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const snapshot = await database.ref(`interviews/${userId}`).once('value');
    const data = snapshot.val();
    
    return { success: true, data: data || {} };
  } catch (error) {
    console.error('❌ Error fetching user interview reports:', error);
    return { success: false, error: error.message };
  }
}

// Delete interview report
async function deleteInterviewReport(sessionId) {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    await database.ref(`interviews/${userId}/${sessionId}`).remove();
    console.log('✅ Interview report deleted:', sessionId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting interview report:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Check if user is authenticated
function isAuthenticated() {
  return auth.currentUser !== null;
}

// Get current user ID
function getCurrentUserId() {
  return auth.currentUser?.uid || null;
}

// Get current user email
function getCurrentUserEmail() {
  return auth.currentUser?.email || null;
}

// Get current user display name
function getCurrentUserDisplayName() {
  return auth.currentUser?.displayName || localStorage.getItem('userName') || 'User';
}

// Initialize Firebase immediately when this script loads
document.addEventListener('DOMContentLoaded', initializeFirebase);
