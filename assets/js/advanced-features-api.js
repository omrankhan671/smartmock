/**
 * SmartMock Advanced Features - Client-side Firebase Integration
 * Connects UI to Firebase Cloud Functions and Realtime Database
 */

// Lazy initialization of Firebase functions - only when needed
function getFunctions() {
  if (typeof firebase === 'undefined' || !firebase.functions) {
    console.warn('Firebase functions not available');
    return null;
  }
  return firebase.functions();
}

// ============================================================================
// RESUME BUILDER API
// ============================================================================

const ResumeAPI = {
  /**
   * Save resume to Firebase
   */
  async saveResume(resumeData) {
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        throw new Error('User must be logged in to save resume');
      }

      // Calculate ATS score first
      const atsScoreResult = await this.calculateATSScore(resumeData);
      resumeData.atsScore = atsScoreResult.score;

      const saveResume = getFunctions().httpsCallable('saveResume');
      const result = await saveResume(resumeData);
      
      return result.data;
    } catch (error) {
      console.error('Error saving resume:', error);
      throw error;
    }
  },

  /**
   * Get user's resumes
   */
  async getUserResumes() {
    try {
      const getUserResumes = getFunctions().httpsCallable('getUserResumes');
      const result = await getUserResumes();
      
      return result.data.resumes;
    } catch (error) {
      console.error('Error getting resumes:', error);
      throw error;
    }
  },

  /**
   * Calculate ATS score
   */
  async calculateATSScore(resumeData) {
    try {
      const calculateATSScore = getFunctions().httpsCallable('calculateATSScore');
      const result = await calculateATSScore(resumeData);
      
      return result.data;
    } catch (error) {
      console.error('Error calculating ATS score:', error);
      return { score: 0 };
    }
  },

  /**
   * Get AI suggestions
   */
  async getAISuggestions(section, content, role) {
    try {
      const getAISuggestions = getFunctions().httpsCallable('getAISuggestions');
      const result = await getAISuggestions({ section, content, role });
      
      return result.data;
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      return { suggestions: [], trendingSkills: [] };
    }
  },

  /**
   * Load resume from localStorage (offline backup)
   */
  loadLocalResume() {
    const saved = localStorage.getItem('smartmock_resume');
    return saved ? JSON.parse(saved) : null;
  },

  /**
   * Save resume to localStorage (offline backup)
   */
  saveLocalResume(resumeData) {
    localStorage.setItem('smartmock_resume', JSON.stringify(resumeData));
  }
};

// ============================================================================
// STUDY GROUPS API
// ============================================================================

const StudyGroupsAPI = {
  /**
   * Create new study group
   */
  async createGroup(groupData) {
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        throw new Error('User must be logged in to create a group');
      }

      const createStudyGroup = getFunctions().httpsCallable('createStudyGroup');
      const result = await createStudyGroup(groupData);
      
      return result.data;
    } catch (error) {
      console.error('Error creating study group:', error);
      throw error;
    }
  },

  /**
   * Join study group
   */
  async joinGroup(groupId) {
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        throw new Error('User must be logged in to join a group');
      }

      const joinStudyGroup = getFunctions().httpsCallable('joinStudyGroup');
      const result = await joinStudyGroup({ groupId });
      
      return result.data;
    } catch (error) {
      console.error('Error joining study group:', error);
      throw error;
    }
  },

  /**
   * Get all study groups with filters
   */
  async getGroups(filters = {}) {
    try {
      const getStudyGroups = getFunctions().httpsCallable('getStudyGroups');
      const result = await getStudyGroups(filters);
      
      return result.data.groups;
    } catch (error) {
      console.error('Error getting study groups:', error);
      throw error;
    }
  },

  /**
   * Post message to group
   */
  async postMessage(groupId, message) {
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        throw new Error('User must be logged in to post messages');
      }

      const postGroupMessage = getFunctions().httpsCallable('postGroupMessage');
      const result = await postGroupMessage({ groupId, message });
      
      return result.data;
    } catch (error) {
      console.error('Error posting message:', error);
      throw error;
    }
  },

  /**
   * Listen to group messages in real-time
   */
  listenToMessages(groupId, callback) {
    const messagesRef = firebase.database().ref(`studyGroups/${groupId}/messages`);
    messagesRef.on('child_added', (snapshot) => {
      callback(snapshot.val());
    });
    
    // Return unsubscribe function
    return () => messagesRef.off('child_added');
  }
};

// ============================================================================
// PEER REVIEW API
// ============================================================================

const PeerReviewAPI = {
  /**
   * Request peer review
   */
  async requestReview(reviewData) {
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        throw new Error('User must be logged in to request review');
      }

      const requestPeerReview = getFunctions().httpsCallable('requestPeerReview');
      const result = await requestPeerReview(reviewData);
      
      return result.data;
    } catch (error) {
      console.error('Error requesting peer review:', error);
      throw error;
    }
  },

  /**
   * Submit review
   */
  async submitReview(requestId, ratings, feedback) {
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        throw new Error('User must be logged in to submit review');
      }

      const submitReview = getFunctions().httpsCallable('submitReview');
      const result = await submitReview({ requestId, ratings, feedback });
      
      return result.data;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  },

  /**
   * Get available reviews
   */
  async getAvailableReviews() {
    try {
      const getAvailableReviews = getFunctions().httpsCallable('getAvailableReviews');
      const result = await getAvailableReviews();
      
      return result.data.reviews;
    } catch (error) {
      console.error('Error getting available reviews:', error);
      throw error;
    }
  },

  /**
   * Get reviews for specific request
   */
  async getReviewsForRequest(requestId) {
    try {
      const getReviewsForRequest = getFunctions().httpsCallable('getReviewsForRequest');
      const result = await getReviewsForRequest({ requestId });
      
      return result.data.reviews;
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw error;
    }
  },

  /**
   * Listen to review requests in real-time
   */
  listenToMyRequests(userId, callback) {
    const requestsRef = firebase.database().ref(`users/${userId}/reviewRequests`);
    requestsRef.on('value', (snapshot) => {
      callback(snapshot.val());
    });
    
    // Return unsubscribe function
    return () => requestsRef.off('value');
  }
};

// ============================================================================
// USER STATISTICS API
// ============================================================================

const UserStatsAPI = {
  /**
   * Get user statistics
   */
  async getUserStats() {
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        throw new Error('User must be logged in');
      }

      const getUserStats = getFunctions().httpsCallable('getUserStats');
      const result = await getUserStats();
      
      return result.data.stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        reviewPoints: 0,
        reviewsGiven: 0,
        reviewsReceived: 0,
        resumeCount: 0,
        groupCount: 0,
        averageRating: 0
      };
    }
  },

  /**
   * Listen to user stats in real-time
   */
  listenToUserStats(userId, callback) {
    const userRef = firebase.database().ref(`users/${userId}`);
    userRef.on('value', (snapshot) => {
      callback(snapshot.val());
    });
    
    // Return unsubscribe function
    return () => userRef.off('value');
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Upload file to Firebase Storage
 */
async function uploadFile(file, path) {
  try {
    const storage = firebase.storage();
    const storageRef = storage.ref();
    const fileRef = storageRef.child(path);
    
    await fileRef.put(file);
    const downloadURL = await fileRef.getDownloadURL();
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Check if user is authenticated
 */
function isUserAuthenticated() {
  return firebase.auth().currentUser !== null;
}

/**
 * Get current user
 */
function getCurrentUser() {
  return firebase.auth().currentUser;
}

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Export APIs for global use
window.ResumeAPI = ResumeAPI;
window.StudyGroupsAPI = StudyGroupsAPI;
window.PeerReviewAPI = PeerReviewAPI;
window.UserStatsAPI = UserStatsAPI;
window.uploadFile = uploadFile;
window.isUserAuthenticated = isUserAuthenticated;
window.getCurrentUser = getCurrentUser;
window.showNotification = showNotification;

console.log('✅ SmartMock Advanced Features API loaded');
