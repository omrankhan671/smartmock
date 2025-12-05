/**
 * SmartMock Interview Post-Processing Module
 * Handles star rating calculation and automatic leaderboard updates
 * 
 * Usage: Call processInterviewResult() after interview completion
 * before redirecting to report page
 */

/**
 * Calculate star rating (0-5) based on interview performance
 * @param {Object} interviewData - Complete interview data
 * @returns {number} Stars awarded (0-5)
 */
function calculateStars(interviewData) {
  try {
    // Base score component (0-1)
    const baseScore = interviewData.overallScore || 0;
    
    // WPM component (normalized)
    // Typical speaking: 100-150 WPM
    // Excellent: 120-160 WPM
    // Penalize too slow (<80) or too fast (>180)
    const avgWPM = interviewData.avgWPM || 0;
    let wpmScore = 0;
    if (avgWPM >= 120 && avgWPM <= 160) {
      wpmScore = 1.0; // Optimal range
    } else if (avgWPM >= 100 && avgWPM < 120) {
      wpmScore = 0.7; // Slightly slow
    } else if (avgWPM > 160 && avgWPM <= 180) {
      wpmScore = 0.7; // Slightly fast
    } else if (avgWPM >= 80 && avgWPM < 100) {
      wpmScore = 0.4; // Too slow
    } else if (avgWPM > 180 && avgWPM <= 200) {
      wpmScore = 0.4; // Too fast
    } else if (avgWPM < 80 || avgWPM > 200) {
      wpmScore = 0.2; // Very poor pacing
    }
    
    // Emotion component (0-1)
    const emotion = (interviewData.dominantEmotion || 'neutral').toLowerCase();
    let emotionScore = 0.5; // Neutral default
    
    const emotionMap = {
      'confident': 1.0,   // Best
      'happy': 0.9,       // Very positive
      'neutral': 0.6,     // Acceptable
      'surprised': 0.5,   // Slightly uncertain
      'nervous': 0.3,     // Negative impact
      'sad': 0.2          // Poor emotion
    };
    
    emotionScore = emotionMap[emotion] || 0.5;
    
    // Completion bonus
    const completionBonus = interviewData.completed ? 0.2 : 0;
    
    // Composite score (weighted)
    // Score: 50%, WPM: 20%, Emotion: 20%, Completion: 10%
    const composite = (baseScore * 0.5) + (wpmScore * 0.2) + (emotionScore * 0.2) + completionBonus;
    
    // Map composite to 0-5 stars
    let stars = 0;
    if (composite >= 0.90) stars = 5;
    else if (composite >= 0.80) stars = 4;
    else if (composite >= 0.65) stars = 3;
    else if (composite >= 0.50) stars = 2;
    else if (composite >= 0.30) stars = 1;
    else stars = 1; // Minimum 1 star for participation
    
    console.log('⭐ Star calculation:', {
      baseScore: (baseScore * 100).toFixed(1) + '%',
      avgWPM,
      wpmScore: (wpmScore * 100).toFixed(1) + '%',
      emotion,
      emotionScore: (emotionScore * 100).toFixed(1) + '%',
      completionBonus,
      composite: (composite * 100).toFixed(1) + '%',
      stars
    });
    
    return stars;
  } catch (error) {
    console.error('❌ Error calculating stars:', error);
    return 1; // Default 1 star on error
  }
}

/**
 * Calculate grade based on overall score
 * @param {number} score - Overall score (0-1)
 * @returns {string} Grade letter
 */
function calculateGrade(score) {
  const percentage = score * 100;
  if (percentage >= 95) return 'A+';
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

/**
 * Process interview result: calculate stars and update leaderboard
 * @param {Object} interviewData - Interview data to process
 * @param {string} department - Department code (ee, me, ce, ec, cs)
 * @returns {Promise<Object>} Augmented interview data with stars
 */
async function processInterviewResult(interviewData, department) {
  try {
    console.log('🔄 Processing interview result for department:', department);
    
    // Calculate stars
    const stars = calculateStars(interviewData);
    
    // Calculate grade
    const grade = calculateGrade(interviewData.overallScore || 0);
    
    // Augment interview data with stars and grade
    const augmentedData = {
      ...interviewData,
      stars: stars,
      grade: grade,
      processedAt: new Date().toISOString()
    };
    
    console.log('✨ Interview data augmented:', {
      stars,
      grade,
      score: ((interviewData.overallScore || 0) * 100).toFixed(1) + '%'
    });
    
    // Update leaderboard if user is authenticated
    try {
      if (typeof firebase !== 'undefined' && firebase.auth) {
        const user = firebase.auth().currentUser;
        if (user) {
          console.log('📊 Updating leaderboard for user:', user.uid);
          
          // Prepare data for leaderboard update
          const leaderboardData = {
            name: user.displayName || 'Anonymous',
            email: user.email || '',
            department: department.toUpperCase(),
            score: Math.round((interviewData.overallScore || 0) * 100),
            stars: stars,
            grade: grade
          };
          
          // Call leaderboard update function if available
          if (typeof updateLeaderboardAfterInterview === 'function') {
            await updateLeaderboardAfterInterview(user.uid, leaderboardData);
            console.log('✅ Leaderboard updated successfully');
          } else {
            console.warn('⚠️ updateLeaderboardAfterInterview function not found');
          }
        } else {
          console.warn('⚠️ No user authenticated, skipping leaderboard update');
        }
      } else {
        console.warn('⚠️ Firebase not available, skipping leaderboard update');
      }
    } catch (leaderboardError) {
      console.error('❌ Error updating leaderboard:', leaderboardError);
      // Don't fail the whole process if leaderboard update fails
    }
    
    return augmentedData;
  } catch (error) {
    console.error('❌ Error processing interview result:', error);
    // Return original data with minimal augmentation
    return {
      ...interviewData,
      stars: 1,
      grade: 'N/A',
      processedAt: new Date().toISOString()
    };
  }
}

/**
 * Render stars as HTML (for UI display)
 * @param {number} stars - Number of stars (0-5)
 * @returns {string} HTML string for star display
 */
function renderStars(stars) {
  const filled = Math.max(0, Math.min(5, Math.round(stars)));
  let html = '<div class="stars-display" style="display: inline-flex; gap: 2px;">';
  for (let i = 0; i < 5; i++) {
    const color = i < filled ? '#FFD700' : '#E0E0E0';
    html += `<span style="color: ${color}; font-size: 1.2em;">★</span>`;
  }
  html += '</div>';
  return html;
}

// Export functions to global scope
if (typeof window !== 'undefined') {
  window.calculateStars = calculateStars;
  window.calculateGrade = calculateGrade;
  window.processInterviewResult = processInterviewResult;
  window.renderStars = renderStars;
}

console.log('✅ Interview post-processing module loaded');
