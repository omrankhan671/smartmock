document.addEventListener('DOMContentLoaded', async () => {
  // Wait for Firebase to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check if user is authenticated
  if (!isAuthenticated()) {
    alert('Please sign in to view your profile');
    window.location.href = 'index.html';
    return;
  }

  const user = auth.currentUser;
  
  // Load all profile data
  loadProfile(user);
  loadStats(user.uid);
  loadCertificates(user.uid);
  loadActivity(user.uid);
  loadLinkedAccounts(user);
  
  // Setup event listeners
  setupEventListeners(user);
});

// Generate Avatar Initials
function generateAvatar(displayName) {
  const avatarInitials = document.getElementById('avatar-initials');
  
  if (!displayName) {
    avatarInitials.textContent = '?';
    return;
  }
  
  const names = displayName.split(' ');
  let initials = '';
  
  if (names.length >= 2) {
    initials = names[0][0] + names[names.length - 1][0];
  } else {
    initials = names[0][0] + (names[0][1] || '');
  }
  
  avatarInitials.textContent = initials.toUpperCase();
}

// Load Profile Data
async function loadProfile(user) {
  try {
    const userRef = database.ref(`users/${user.uid}`);
    const snapshot = await userRef.once('value');
    
    const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'Guest');
    const email = user.email || 'guest@smartmock.com';

    if (snapshot.exists()) {
      const userData = snapshot.val();
      
      // Update profile header
      document.getElementById('profile-name').textContent = userData.name || displayName;
      document.getElementById('profile-email').textContent = email;
      
      // Update form fields
      document.getElementById('name').value = userData.name || displayName;
      document.getElementById('email').value = email;
      document.getElementById('phone').value = userData.phone || '';
      document.getElementById('bio').value = userData.bio || '';
      
      // Set member since badge
      if (userData.createdAt) {
        const memberDate = new Date(userData.createdAt);
        const monthYear = memberDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        document.querySelector('.badge.success').textContent = `Member since ${monthYear}`;
      } else {
        // Fallback to user creation time from Firebase Auth
        if (user.metadata && user.metadata.creationTime) {
          const memberDate = new Date(user.metadata.creationTime);
          const monthYear = memberDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          document.querySelector('.badge.success').textContent = `Member since ${monthYear}`;
        }
      }
      
      // Load settings toggles
      if (userData.settings) {
        document.getElementById('email-notifications').checked = userData.settings.emailNotifications !== false;
        document.getElementById('performance-tracking').checked = userData.settings.performanceTracking !== false;
        document.getElementById('community-posts').checked = userData.settings.communityPosts !== false;
        document.getElementById('dark-mode').checked = userData.settings.darkMode || false;
      }
      
      // Load and display profile photo if exists
      if (userData.photoURL) {
        displayProfilePhoto(userData.photoURL);
      } else {
        // Update avatar with initials
        generateAvatar(userData.name || displayName);
      }
    } else {
      // No profile data in database, use auth data
      document.getElementById('profile-name').textContent = displayName;
      document.getElementById('profile-email').textContent = email;
      document.getElementById('name').value = displayName;
      document.getElementById('email').value = email;
      
      generateAvatar(displayName);
      
      // Create initial profile in database
      await userRef.set({
        name: displayName,
        email: email,
        createdAt: new Date().toISOString(),
        settings: {
          emailNotifications: true,
          performanceTracking: true,
          communityPosts: true,
          darkMode: false
        }
      });
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

// Load Stats
async function loadStats(userId) {
  try {
    const userRef = database.ref(`users/${userId}`);
    const snapshot = await userRef.once('value');
    
    let interviewCount = 0;
    let avgScore = 0;
    let certificateCount = 0;
    let coursesCount = 0;
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      
      // Count AI interviews
      if (userData.aiInterviews) {
        interviewCount = Object.keys(userData.aiInterviews).length;
        
        // Calculate average score
        const scores = Object.values(userData.aiInterviews).map(interview => 
          interview.performance?.score || 0
        );
        if (scores.length > 0) {
          avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        }
      }
      
      // Count certificates
      if (userData.certificates) {
        certificateCount = Object.keys(userData.certificates).length;
      }
      
      // Count completed courses
      if (userData.completedCourses) {
        coursesCount = Object.keys(userData.completedCourses).filter(
          key => userData.completedCourses[key] === true
        ).length;
      }
    }
    
    // Update stats display
    document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = interviewCount;
    document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = avgScore + '%';
    document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = certificateCount;
    document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = coursesCount;
    
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Load Certificates
async function loadCertificates(userId) {
  const certificatesList = document.getElementById('certificates-list');
  certificatesList.innerHTML = '';
  
  try {
    const result = await getUserCertificates();
    
    if (result.success && result.data) {
      const certificates = Object.values(result.data);
      
      if (certificates.length === 0) {
        certificatesList.innerHTML = '<p style="text-align:center; color:var(--muted);">No certificates yet. Complete courses to earn certificates!</p>';
      } else {
        certificates.forEach(cert => {
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `
            <h3>${cert.courseName}</h3>
            <p>Issued: ${cert.dateIssued}</p>
            <p style="font-size:12px; color:var(--muted);">ID: ${cert.certificateId}</p>
          `;
          card.addEventListener('click', () => {
            window.location.href = `certificate.html?certId=${cert.certificateId}`;
          });
          certificatesList.appendChild(card);
        });
      }
    } else {
      certificatesList.innerHTML = '<p style="text-align:center; color:var(--muted);">No certificates yet. Complete courses to earn certificates!</p>';
    }
  } catch (error) {
    console.error('Error loading certificates:', error);
    certificatesList.innerHTML = '<p style="text-align:center; color:var(--danger);">Error loading certificates</p>';
  }
}

// Load Recent Activity
async function loadActivity(userId) {
  const activityList = document.getElementById('activity-list');
  if (!activityList) {
    console.warn('Activity list element not found');
    return;
  }
  activityList.innerHTML = '';
  
  try {
    const userRef = database.ref(`users/${userId}/activity`);
    const snapshot = await userRef.once('value');
    
    if (snapshot.exists()) {
      const activities = Object.values(snapshot.val());
      
      // Sort by timestamp (most recent first)
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Show last 5 activities
      activities.slice(0, 5).forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        
        const timeAgo = getTimeAgo(activity.timestamp);
        
        item.innerHTML = `
          <div class="activity-icon">${getActivityIcon(activity.type)}</div>
          <div class="activity-content">
            <div class="activity-title">${activity.title}</div>
            <div class="activity-desc">${activity.description}</div>
          </div>
          <div class="activity-time">${timeAgo}</div>
        `;
        
        activityList.appendChild(item);
      });
    } else {
      activityList.innerHTML = '<p style="text-align:center; color:var(--muted);">No recent activity</p>';
    }
  } catch (error) {
    console.error('Error loading activity:', error);
    activityList.innerHTML = '<p style="text-align:center; color:var(--muted);">No recent activity</p>';
  }
}

// Get Activity Icon
function getActivityIcon(type) {
  const icons = {
    'interview': '🎤',
    'certificate': '🏆',
    'course': '📚',
    'profile': '👤',
    'settings': '⚙️'
  };
  return icons[type] || '📌';
}

// Get Time Ago
function getTimeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now - then) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
  return Math.floor(seconds / 604800) + 'w ago';
}

// Load Linked Accounts
function loadLinkedAccounts(user) {
  const providers = user.providerData.map(p => p.providerId);
  
  // Check Google
  const googleStatus = document.querySelector('.linked-account-card:nth-child(1) .account-status');
  const googleBtn = document.querySelector('.linked-account-card:nth-child(1) .btn');
  
  if (providers.includes('google.com')) {
    googleStatus.textContent = 'Linked';
    googleStatus.classList.add('linked');
    googleBtn.textContent = 'Unlink';
    googleBtn.classList.add('danger');
  } else {
    googleStatus.textContent = 'Not linked';
    googleStatus.classList.remove('linked');
    googleBtn.textContent = 'Link Account';
    googleBtn.classList.remove('danger');
  }
  
  // Check Phone
  const phoneStatus = document.querySelector('.linked-account-card:nth-child(2) .account-status');
  const phoneBtn = document.querySelector('.linked-account-card:nth-child(2) .btn');
  
  if (providers.includes('phone')) {
    phoneStatus.textContent = 'Linked';
    phoneStatus.classList.add('linked');
    phoneBtn.textContent = 'Unlink';
    phoneBtn.classList.add('danger');
  } else {
    phoneStatus.textContent = 'Not linked';
    phoneStatus.classList.remove('linked');
    phoneBtn.textContent = 'Link Account';
    phoneBtn.classList.remove('danger');
  }
}

// Setup Event Listeners
function setupEventListeners(user) {
  // Edit Profile Button
  const editBtn = document.getElementById('edit-profile-btn');
  if (!editBtn) {
    console.warn('Edit profile button not found');
    return;
  }
  
  editBtn.addEventListener('click', () => {
    const inputs = document.querySelectorAll('#profile-form input:not([type="email"]), #profile-form textarea');
    inputs.forEach(input => input.readOnly = false);
    editBtn.style.display = 'none';
    const formActions = document.querySelector('.form-actions');
    if (formActions) formActions.style.display = 'flex';
  });
  
  // Cancel Edit
  const cancelBtn = document.getElementById('cancel-edit');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      loadProfile(user);
      const inputs = document.querySelectorAll('#profile-form input:not([type="email"]), #profile-form textarea');
      inputs.forEach(input => input.readOnly = true);
      editBtn.style.display = 'inline-block';
      const formActions = document.querySelector('.form-actions');
      if (formActions) formActions.style.display = 'none';
    });
  }
  
  // Save Profile
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const bio = document.getElementById('bio').value.trim();
    
    if (!name) {
      alert('Name cannot be empty');
      return;
    }
    
    try {
      // Update Firebase Auth
      await user.updateProfile({ displayName: name });
      
      // Update Firebase Database
      const userRef = database.ref(`users/${user.uid}`);
      await userRef.update({
        name: name,
        phone: phone,
        bio: bio,
        updatedAt: new Date().toISOString()
      });
      
      // Update localStorage
      localStorage.setItem('userName', name);
      
      // Log activity
      await logActivity(user.uid, 'profile', 'Profile Updated', 'You updated your profile information');
      
      // Reload profile
      await loadProfile(user);
      
      const inputs = document.querySelectorAll('#profile-form input:not([type="email"]), #profile-form textarea');
      inputs.forEach(input => input.readOnly = true);
      document.getElementById('edit-profile-btn').style.display = 'inline-block';
      document.querySelector('.form-actions').style.display = 'none';
      
      alert('✅ Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('❌ Error updating profile: ' + error.message);
    }
    });
  }
  
  // Toggle Switches
  document.querySelectorAll('.toggle-switch input').forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
      const settingName = e.target.id;
      const value = e.target.checked;
      
      try {
        const userRef = database.ref(`users/${user.uid}/settings`);
        await userRef.update({
          [camelToSnake(settingName)]: value
        });
      } catch (error) {
        console.error('Error updating setting:', error);
      }
    });
  });
  
  // Link/Unlink Google Account
  const googleBtn = document.querySelector('.linked-account-card:nth-child(1) .btn');
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      if (googleBtn.textContent === 'Link Account') {
        await linkGoogleAccount(user);
      } else {
        await unlinkGoogleAccount(user);
      }
    });
  }
  
  // Link/Unlink Phone Account
  const phoneBtn = document.querySelector('.linked-account-card:nth-child(2) .btn');
  if (phoneBtn) {
    phoneBtn.addEventListener('click', async () => {
      if (phoneBtn.textContent === 'Link Account') {
        await linkPhoneAccount(user);
      } else {
        await unlinkPhoneAccount(user);
      }
    });
  }
  
  // Change Password Button
  const changePasswordBtn = document.getElementById('change-password-btn');
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', async () => {
      const email = user.email || 'guest@smartmock.com';
      
      if (!user.email) {
        alert('❌ Guest accounts cannot change password. Please sign up with email/password first.');
        return;
      }
      
      if (confirm(`Send password reset email to ${email}?`)) {
        try {
          await auth.sendPasswordResetEmail(email);
          alert('✅ Password reset email sent! Check your inbox.');
        } catch (error) {
          console.error('Error sending reset email:', error);
          alert('❌ Error: ' + error.message);
        }
      }
    });
  }
  
  // Delete Account Button
  const deleteAccountBtn = document.getElementById('delete-account-btn');
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', async () => {
      const confirmation = prompt('Type "DELETE" to confirm account deletion:');
      
      if (confirmation === 'DELETE') {
        try {
          // Delete user data from database
          const userRef = database.ref(`users/${user.uid}`);
          await userRef.remove();
          
          // Delete user account
          await user.delete();
          
          // Clear local storage
          localStorage.clear();
          
          alert('Account deleted successfully');
          window.location.href = 'index.html';
        } catch (error) {
          console.error('Error deleting account:', error);
          alert('❌ Error: ' + error.message + '\n\nYou may need to sign in again to delete your account.');
        }
      }
    });
  }
}

// Link Google Account
async function linkGoogleAccount(user) {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await user.linkWithPopup(provider);
    
    await logActivity(user.uid, 'settings', 'Google Account Linked', 'You linked your Google account');
    
    loadLinkedAccounts(user);
    alert('✅ Google account linked successfully!');
  } catch (error) {
    console.error('Error linking Google:', error);
    alert('❌ Error: ' + error.message);
  }
}

// Unlink Google Account
async function unlinkGoogleAccount(user) {
  if (user.providerData.length <= 1) {
    alert('❌ Cannot unlink: You must have at least one sign-in method');
    return;
  }
  
  try {
    await user.unlink('google.com');
    
    await logActivity(user.uid, 'settings', 'Google Account Unlinked', 'You unlinked your Google account');
    
    loadLinkedAccounts(user);
    alert('✅ Google account unlinked successfully!');
  } catch (error) {
    console.error('Error unlinking Google:', error);
    alert('❌ Error: ' + error.message);
  }
}

// Link Phone Account
async function linkPhoneAccount(user) {
  const phoneNumber = prompt('Enter your phone number (with country code, e.g., +1234567890):');
  
  if (!phoneNumber) return;
  
  try {
    const provider = new firebase.auth.PhoneAuthProvider();
    const appVerifier = window.recaptchaVerifier;
    
    if (!appVerifier) {
      alert('❌ reCAPTCHA not initialized. Please refresh the page.');
      return;
    }
    
    const verificationId = await provider.verifyPhoneNumber(phoneNumber, appVerifier);
    
    const verificationCode = prompt('Enter the verification code sent to your phone:');
    
    if (!verificationCode) return;
    
    const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, verificationCode);
    await user.linkWithCredential(credential);
    
    await logActivity(user.uid, 'settings', 'Phone Number Linked', 'You linked your phone number');
    
    loadLinkedAccounts(user);
    alert('✅ Phone number linked successfully!');
  } catch (error) {
    console.error('Error linking phone:', error);
    alert('❌ Error: ' + error.message);
  }
}

// Unlink Phone Account
async function unlinkPhoneAccount(user) {
  if (user.providerData.length <= 1) {
    alert('❌ Cannot unlink: You must have at least one sign-in method');
    return;
  }
  
  try {
    await user.unlink('phone');
    
    await logActivity(user.uid, 'settings', 'Phone Number Unlinked', 'You unlinked your phone number');
    
    loadLinkedAccounts(user);
    alert('✅ Phone number unlinked successfully!');
  } catch (error) {
    console.error('Error unlinking phone:', error);
    alert('❌ Error: ' + error.message);
  }
}

// Log Activity
async function logActivity(userId, type, title, description) {
  try {
    const activityRef = database.ref(`users/${userId}/activity/${Date.now()}`);
    await activityRef.set({
      type: type,
      title: title,
      description: description,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// Helper: Convert camelCase to snake_case
function camelToSnake(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
}

// ============================================
// PROFILE PHOTO UPLOAD FUNCTIONS
// ============================================

// Open photo modal when avatar button is clicked
document.addEventListener('DOMContentLoaded', () => {
  const uploadBtn = document.getElementById('upload-avatar-btn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openPhotoModal();
    });
  }

  // Setup file input handlers
  const fileInput = document.getElementById('avatar-file-input');
  const cameraInput = document.getElementById('avatar-camera-input');
  
  if (fileInput) {
    fileInput.addEventListener('change', handlePhotoUpload);
  }
  
  if (cameraInput) {
    cameraInput.addEventListener('change', handlePhotoUpload);
  }
});

// Open photo upload modal
function openPhotoModal() {
  const modal = document.getElementById('photo-modal');
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
}

// Close photo upload modal
function closePhotoModal() {
  const modal = document.getElementById('photo-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Open camera to take photo
function openCamera() {
  const cameraInput = document.getElementById('avatar-camera-input');
  if (cameraInput) {
    cameraInput.click();
  }
  closePhotoModal();
}

// Open gallery to choose photo
function openGallery() {
  const fileInput = document.getElementById('avatar-file-input');
  if (fileInput) {
    fileInput.click();
  }
  closePhotoModal();
}

// Handle photo upload (from camera or gallery)
async function handlePhotoUpload(event) {
  const file = event.target.files[0];
  
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('❌ Please select a valid image file');
    return;
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('❌ Image size should be less than 5MB');
    return;
  }
  
  try {
    // Show loading indicator
    const avatarCircle = document.getElementById('avatar-circle');
    avatarCircle.style.opacity = '0.5';
    
    // Read file as base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const photoURL = e.target.result;
      
      // Update UI immediately
      displayProfilePhoto(photoURL);
      
      // Save to Firebase
      const user = auth.currentUser;
      if (user) {
        await saveProfilePhoto(user.uid, photoURL);
        
        // Log activity
        await logActivity(user.uid, 'profile', 'Profile Photo Updated', 'You changed your profile photo');
        
        alert('✅ Profile photo updated successfully!');
      }
      
      avatarCircle.style.opacity = '1';
    };
    
    reader.onerror = () => {
      alert('❌ Error reading image file');
      avatarCircle.style.opacity = '1';
    };
    
    reader.readAsDataURL(file);
  } catch (error) {
    console.error('Error uploading photo:', error);
    alert('❌ Error uploading photo: ' + error.message);
  }
}

// Display profile photo
function displayProfilePhoto(photoURL) {
  const avatarImage = document.getElementById('avatar-image');
  const avatarInitials = document.getElementById('avatar-initials');
  
  if (avatarImage && photoURL) {
    avatarImage.src = photoURL;
    avatarImage.style.display = 'block';
    if (avatarInitials) {
      avatarInitials.style.display = 'none';
    }
  }
}

// Hide profile photo (show initials)
function hideProfilePhoto() {
  const avatarImage = document.getElementById('avatar-image');
  const avatarInitials = document.getElementById('avatar-initials');
  
  if (avatarImage) {
    avatarImage.style.display = 'none';
    avatarImage.src = '';
  }
  if (avatarInitials) {
    avatarInitials.style.display = 'block';
  }
}

// Save profile photo to Firebase
async function saveProfilePhoto(userId, photoURL) {
  try {
    const userRef = database.ref(`users/${userId}`);
    await userRef.update({
      photoURL: photoURL,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Profile photo saved to database');
  } catch (error) {
    console.error('❌ Error saving photo to database:', error);
    throw error;
  }
}

// Remove profile photo
async function removePhoto() {
  if (!confirm('Are you sure you want to remove your profile photo?')) {
    return;
  }
  
  try {
    const user = auth.currentUser;
    if (user) {
      // Remove from Firebase
      const userRef = database.ref(`users/${user.uid}`);
      await userRef.update({
        photoURL: null,
        updatedAt: new Date().toISOString()
      });
      
      // Update UI
      hideProfilePhoto();
      
      // Log activity
      await logActivity(user.uid, 'profile', 'Profile Photo Removed', 'You removed your profile photo');
      
      alert('✅ Profile photo removed successfully!');
    }
    
    closePhotoModal();
  } catch (error) {
    console.error('Error removing photo:', error);
    alert('❌ Error removing photo: ' + error.message);
  }
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('photo-modal');
  if (event.target === modal) {
    closePhotoModal();
  }
}
