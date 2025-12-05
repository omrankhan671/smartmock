// Firebase Cloud Functions for SmartMock v2.1 Advanced Features
// Deploy with: firebase deploy --only functions

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// ============================================================================
// RESUME BUILDER FUNCTIONS
// ============================================================================

/**
 * Save resume data to Firebase
 * Triggered when user saves a resume
 */
exports.saveResume = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const resumeData = {
    ...data,
    userId: userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  try {
    const resumeRef = await admin.firestore()
      .collection('resumes')
      .add(resumeData);

    // Also save to user's profile
    await admin.database()
      .ref(`users/${userId}/resumes/${resumeRef.id}`)
      .set({
        resumeId: resumeRef.id,
        title: data.profTitle || 'Untitled Resume',
        atsScore: data.atsScore || 0,
        createdAt: admin.database.ServerValue.TIMESTAMP
      });

    return { resumeId: resumeRef.id, success: true };
  } catch (error) {
    console.error('Error saving resume:', error);
    throw new functions.https.HttpsError('internal', 'Failed to save resume');
  }
});

/**
 * Get user's resumes
 */
exports.getUserResumes = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    const resumesSnapshot = await admin.firestore()
      .collection('resumes')
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .get();

    const resumes = [];
    resumesSnapshot.forEach(doc => {
      resumes.push({ id: doc.id, ...doc.data() });
    });

    return { resumes, success: true };
  } catch (error) {
    console.error('Error getting resumes:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get resumes');
  }
});

/**
 * Calculate ATS score based on resume content
 */
exports.calculateATSScore = functions.https.onCall((data, context) => {
  const { fullName, profTitle, summary, skills, workExperience, education } = data;
  
  let score = 60; // Base score
  
  // Name and title (10 points)
  if (fullName && fullName.length > 0) score += 5;
  if (profTitle && profTitle.length > 0) score += 5;
  
  // Summary quality (15 points)
  if (summary && summary.length > 100) score += 10;
  if (summary && summary.length > 200) score += 5;
  
  // Skills (20 points)
  const skillsArray = skills ? skills.split(',').map(s => s.trim()).filter(s => s) : [];
  score += Math.min(skillsArray.length * 2, 20);
  
  // Work experience (10 points)
  if (workExperience && workExperience.length > 0) score += 10;
  
  // Education (5 points)
  if (education && education.length > 0) score += 5;
  
  // Keywords bonus (10 points)
  const keywords = ['led', 'managed', 'developed', 'improved', 'achieved', 'implemented'];
  const fullText = (summary + ' ' + JSON.stringify(workExperience)).toLowerCase();
  const keywordMatches = keywords.filter(kw => fullText.includes(kw)).length;
  score += Math.min(keywordMatches * 2, 10);
  
  return { score: Math.min(score, 100), success: true };
});

/**
 * Generate AI suggestions for resume content
 */
exports.getAISuggestions = functions.https.onCall((data, context) => {
  const { section, content, role } = data;
  
  const suggestions = {
    summary: [
      'Start with years of experience and key expertise',
      'Include 2-3 major achievements with quantifiable results',
      'Mention specific technologies or methodologies you excel in',
      'End with your career objective or value proposition'
    ],
    workExperience: [
      'Begin each bullet point with strong action verbs',
      'Quantify achievements with numbers, percentages, or metrics',
      'Focus on impact and results, not just responsibilities',
      'Use the STAR method (Situation, Task, Action, Result)'
    ],
    skills: [
      'Cloud Platforms: AWS, Azure, Google Cloud Platform',
      'DevOps Tools: Docker, Kubernetes, Jenkins, GitLab CI/CD',
      'Frontend: React, Vue.js, Angular, TypeScript',
      'Backend: Node.js, Python, Java, Go',
      'Databases: PostgreSQL, MongoDB, Redis, Elasticsearch'
    ]
  };
  
  return { 
    suggestions: suggestions[section] || [],
    trendingSkills: suggestions.skills,
    success: true 
  };
});

// ============================================================================
// STUDY GROUPS FUNCTIONS
// ============================================================================

/**
 * Create a new study group
 */
exports.createStudyGroup = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const groupData = {
    name: data.name,
    department: data.department,
    level: data.level,
    description: data.description,
    schedule: data.schedule || '',
    creatorId: userId,
    members: [userId],
    memberCount: 1,
    sessionCount: 0,
    rating: 0,
    createdAt: admin.database.ServerValue.TIMESTAMP,
    status: 'active'
  };

  try {
    const groupRef = await admin.database()
      .ref('studyGroups')
      .push(groupData);

    // Add to user's groups
    await admin.database()
      .ref(`users/${userId}/groups/${groupRef.key}`)
      .set({
        groupId: groupRef.key,
        role: 'creator',
        joinedAt: admin.database.ServerValue.TIMESTAMP
      });

    return { groupId: groupRef.key, success: true };
  } catch (error) {
    console.error('Error creating study group:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create study group');
  }
});

/**
 * Join a study group
 */
exports.joinStudyGroup = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const groupId = data.groupId;

  try {
    // Add user to group members
    const groupRef = admin.database().ref(`studyGroups/${groupId}`);
    const groupSnapshot = await groupRef.once('value');
    
    if (!groupSnapshot.exists()) {
      throw new functions.https.HttpsError('not-found', 'Study group not found');
    }

    const group = groupSnapshot.val();
    const members = group.members || [];
    
    if (members.includes(userId)) {
      return { success: true, message: 'Already a member' };
    }

    members.push(userId);
    
    await groupRef.update({
      members: members,
      memberCount: members.length
    });

    // Add to user's groups
    await admin.database()
      .ref(`users/${userId}/groups/${groupId}`)
      .set({
        groupId: groupId,
        role: 'member',
        joinedAt: admin.database.ServerValue.TIMESTAMP
      });

    return { success: true, message: 'Successfully joined group' };
  } catch (error) {
    console.error('Error joining study group:', error);
    throw new functions.https.HttpsError('internal', 'Failed to join study group');
  }
});

/**
 * Get all study groups with filters
 */
exports.getStudyGroups = functions.https.onCall(async (data, context) => {
  const { department, level, searchTerm } = data;

  try {
    let query = admin.database().ref('studyGroups');
    
    if (department && department !== 'all') {
      query = query.orderByChild('department').equalTo(department);
    }

    const snapshot = await query.once('value');
    let groups = [];
    
    snapshot.forEach(childSnapshot => {
      const group = childSnapshot.val();
      group.id = childSnapshot.key;
      
      // Filter by level if specified
      if (level && level !== 'all' && group.level !== level) {
        return;
      }
      
      // Filter by search term if specified
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!group.name.toLowerCase().includes(searchLower) && 
            !group.description.toLowerCase().includes(searchLower)) {
          return;
        }
      }
      
      groups.push(group);
    });

    return { groups, success: true };
  } catch (error) {
    console.error('Error getting study groups:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get study groups');
  }
});

/**
 * Post message to study group
 */
exports.postGroupMessage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { groupId, message } = data;

  try {
    // Verify user is member of group
    const memberRef = admin.database().ref(`users/${userId}/groups/${groupId}`);
    const memberSnapshot = await memberRef.once('value');
    
    if (!memberSnapshot.exists()) {
      throw new functions.https.HttpsError('permission-denied', 'Not a member of this group');
    }

    const messageData = {
      userId: userId,
      message: message,
      timestamp: admin.database.ServerValue.TIMESTAMP
    };

    const messageRef = await admin.database()
      .ref(`studyGroups/${groupId}/messages`)
      .push(messageData);

    return { messageId: messageRef.key, success: true };
  } catch (error) {
    console.error('Error posting message:', error);
    throw new functions.https.HttpsError('internal', 'Failed to post message');
  }
});

// ============================================================================
// PEER REVIEW FUNCTIONS
// ============================================================================

/**
 * Request peer review for interview
 */
exports.requestPeerReview = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const reviewRequest = {
    userId: userId,
    title: data.title,
    department: data.department,
    topics: data.topics,
    duration: data.duration,
    videoUrl: data.videoUrl || '',
    description: data.description || '',
    status: 'pending',
    reviewersNeeded: 3,
    reviewsCompleted: 0,
    reviewers: [],
    createdAt: admin.database.ServerValue.TIMESTAMP,
    pointsCost: 50
  };

  try {
    // Check if user has enough points
    const userRef = admin.database().ref(`users/${userId}`);
    const userSnapshot = await userRef.once('value');
    const userData = userSnapshot.val();
    
    const currentPoints = userData.reviewPoints || 0;
    if (currentPoints < reviewRequest.pointsCost) {
      throw new functions.https.HttpsError('failed-precondition', 'Insufficient review points');
    }

    // Deduct points
    await userRef.update({
      reviewPoints: currentPoints - reviewRequest.pointsCost
    });

    // Create review request
    const requestRef = await admin.database()
      .ref('reviewRequests')
      .push(reviewRequest);

    // Add to user's review requests
    await admin.database()
      .ref(`users/${userId}/reviewRequests/${requestRef.key}`)
      .set({
        requestId: requestRef.key,
        status: 'pending',
        createdAt: admin.database.ServerValue.TIMESTAMP
      });

    return { requestId: requestRef.key, success: true };
  } catch (error) {
    console.error('Error requesting peer review:', error);
    throw new functions.https.HttpsError('internal', 'Failed to request review');
  }
});

/**
 * Submit review for an interview
 */
exports.submitReview = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const reviewerId = context.auth.uid;
  const { requestId, ratings, feedback } = data;

  try {
    // Get review request
    const requestRef = admin.database().ref(`reviewRequests/${requestId}`);
    const requestSnapshot = await requestRef.once('value');
    
    if (!requestSnapshot.exists()) {
      throw new functions.https.HttpsError('not-found', 'Review request not found');
    }

    const request = requestSnapshot.val();
    
    // Verify reviewer hasn't already reviewed
    if (request.reviewers && request.reviewers.includes(reviewerId)) {
      throw new functions.https.HttpsError('already-exists', 'You have already reviewed this interview');
    }

    // Calculate overall rating
    const overallRating = Object.values(ratings).reduce((a, b) => a + b, 0) / Object.keys(ratings).length;

    // Save review
    const reviewData = {
      requestId: requestId,
      reviewerId: reviewerId,
      ratings: ratings,
      overallRating: overallRating,
      feedback: feedback,
      timestamp: admin.database.ServerValue.TIMESTAMP
    };

    const reviewRef = await admin.database()
      .ref(`reviews/${requestId}`)
      .push(reviewData);

    // Update request
    const reviewers = request.reviewers || [];
    reviewers.push(reviewerId);
    const reviewsCompleted = reviewers.length;
    const status = reviewsCompleted >= request.reviewersNeeded ? 'completed' : 'in-review';

    await requestRef.update({
      reviewers: reviewers,
      reviewsCompleted: reviewsCompleted,
      status: status
    });

    // Award points to reviewer
    const reviewerRef = admin.database().ref(`users/${reviewerId}`);
    const reviewerSnapshot = await reviewerRef.once('value');
    const reviewerData = reviewerSnapshot.val();
    const currentPoints = reviewerData.reviewPoints || 0;
    const pointsEarned = 25;

    await reviewerRef.update({
      reviewPoints: currentPoints + pointsEarned,
      reviewsGiven: (reviewerData.reviewsGiven || 0) + 1
    });

    // Update reviewee stats
    await admin.database()
      .ref(`users/${request.userId}`)
      .update({
        reviewsReceived: admin.database.ServerValue.increment(1)
      });

    return { 
      reviewId: reviewRef.key, 
      pointsEarned: pointsEarned,
      success: true 
    };
  } catch (error) {
    console.error('Error submitting review:', error);
    throw new functions.https.HttpsError('internal', 'Failed to submit review');
  }
});

/**
 * Get available reviews for a user
 */
exports.getAvailableReviews = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    const requestsSnapshot = await admin.database()
      .ref('reviewRequests')
      .orderByChild('status')
      .equalTo('pending')
      .once('value');

    const availableReviews = [];
    
    requestsSnapshot.forEach(childSnapshot => {
      const request = childSnapshot.val();
      request.id = childSnapshot.key;
      
      // Don't show user's own requests
      if (request.userId !== userId) {
        // Don't show if user already reviewed
        if (!request.reviewers || !request.reviewers.includes(userId)) {
          availableReviews.push(request);
        }
      }
    });

    return { reviews: availableReviews, success: true };
  } catch (error) {
    console.error('Error getting available reviews:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get available reviews');
  }
});

/**
 * Get reviews for a specific request
 */
exports.getReviewsForRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { requestId } = data;

  try {
    const reviewsSnapshot = await admin.database()
      .ref(`reviews/${requestId}`)
      .once('value');

    const reviews = [];
    
    reviewsSnapshot.forEach(childSnapshot => {
      const review = childSnapshot.val();
      review.id = childSnapshot.key;
      reviews.push(review);
    });

    return { reviews, success: true };
  } catch (error) {
    console.error('Error getting reviews:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get reviews');
  }
});

// ============================================================================
// USER STATISTICS & ANALYTICS
// ============================================================================

/**
 * Get user statistics for new features
 */
exports.getUserStats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    const userSnapshot = await admin.database()
      .ref(`users/${userId}`)
      .once('value');

    const userData = userSnapshot.val();

    const stats = {
      reviewPoints: userData.reviewPoints || 0,
      reviewsGiven: userData.reviewsGiven || 0,
      reviewsReceived: userData.reviewsReceived || 0,
      resumeCount: 0,
      groupCount: 0,
      averageRating: 0
    };

    // Get resume count
    const resumesSnapshot = await admin.firestore()
      .collection('resumes')
      .where('userId', '==', userId)
      .get();
    stats.resumeCount = resumesSnapshot.size;

    // Get group count
    const groupsSnapshot = await admin.database()
      .ref(`users/${userId}/groups`)
      .once('value');
    stats.groupCount = groupsSnapshot.numChildren();

    // Calculate average rating from received reviews
    const reviewRequestsSnapshot = await admin.database()
      .ref(`users/${userId}/reviewRequests`)
      .once('value');

    let totalRating = 0;
    let ratingCount = 0;

    for (const requestKey of Object.keys(reviewRequestsSnapshot.val() || {})) {
      const reviewsSnapshot = await admin.database()
        .ref(`reviews/${requestKey}`)
        .once('value');

      reviewsSnapshot.forEach(reviewSnapshot => {
        const review = reviewSnapshot.val();
        if (review.overallRating) {
          totalRating += review.overallRating;
          ratingCount++;
        }
      });
    }

    stats.averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;

    return { stats, success: true };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get user stats');
  }
});

// ============================================================================
// INITIALIZATION & UTILITIES
// ============================================================================

/**
 * Initialize new user with default values
 */
exports.initializeNewUser = functions.auth.user().onCreate(async (user) => {
  const userId = user.uid;
  
  const defaultData = {
    email: user.email,
    displayName: user.displayName || 'User',
    photoURL: user.photoURL || '',
    reviewPoints: 100, // Starting points
    reviewsGiven: 0,
    reviewsReceived: 0,
    createdAt: admin.database.ServerValue.TIMESTAMP
  };

  try {
    await admin.database()
      .ref(`users/${userId}`)
      .set(defaultData);
    
    console.log(`Initialized user: ${userId}`);
  } catch (error) {
    console.error('Error initializing user:', error);
  }
});
