// Leaderboard Integration Script
// Add this script to AI interview pages to automatically update leaderboard after completion

/**
 * Call this function after an AI interview is completed
 * @param {Object} interviewResults - The interview results object
 * @returns {Promise<void>}
 */
async function saveToLeaderboard(interviewResults) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.warn('No user logged in, skipping leaderboard update');
            return;
        }

        // Get user info
        const userRef = firebase.database().ref(`users/${user.uid}`);
        const userSnapshot = await userRef.once('value');
        const userData = userSnapshot.val() || {};

        // Prepare leaderboard data
        const leaderboardData = {
            name: userData.name || user.displayName || 'Anonymous',
            email: user.email || '',
            department: interviewResults.department || getDepartmentFromURL(),
            score: interviewResults.score || 0,
            grade: interviewResults.grade || calculateGrade(interviewResults.score),
            stars: interviewResults.stars || calculateStars(interviewResults)
        };

        // Update leaderboard via the global function
        if (typeof window.updateLeaderboardAfterInterview === 'function') {
            await window.updateLeaderboardAfterInterview(user.uid, leaderboardData);
            console.log('✅ Leaderboard updated successfully');
        } else {
            // Manual update if function not loaded
            await manualLeaderboardUpdate(user.uid, leaderboardData);
        }

    } catch (error) {
        console.error('❌ Error saving to leaderboard:', error);
        // Don't throw - leaderboard is non-critical
    }
}

/**
 * Manual leaderboard update (fallback)
 */
async function manualLeaderboardUpdate(userId, interviewData) {
    try {
        const leaderboardRef = firebase.database().ref(`leaderboard/${userId}`);
        const snapshot = await leaderboardRef.once('value');
        
        let data = snapshot.val() || {
            name: interviewData.name,
            email: interviewData.email,
            department: interviewData.department,
            bestScore: 0,
            totalInterviews: 0,
            totalScore: 0,
            recentScores: [],
            grade: 'F',
            totalStars: 0,
            starHistory: [],
            lastActive: Date.now()
        };
        
        // Update stats
        data.totalInterviews++;
        data.totalScore += interviewData.score;
        data.lastActive = Date.now();
        
        // Update best score
        if (interviewData.score > data.bestScore) {
            data.bestScore = interviewData.score;
            data.grade = interviewData.grade;
        }
        
        // Track recent scores
        data.recentScores = data.recentScores || [];
        data.recentScores.push(interviewData.score);
        if (data.recentScores.length > 10) {
            data.recentScores.shift();
        }
        
    // Stars
    const starsAwarded = typeof interviewData.stars === 'number' ? interviewData.stars : calculateStars({ score: interviewData.score });
    data.totalStars = (data.totalStars || 0) + starsAwarded;
    data.starHistory = data.starHistory || [];
    data.starHistory.push({ t: Date.now(), s: starsAwarded, score: interviewData.score });
    if (data.starHistory.length > 30) data.starHistory.shift();

    // Calculate improvement
        if (data.recentScores.length >= 6) {
            const recent5 = data.recentScores.slice(-5);
            const previous5 = data.recentScores.slice(-10, -5);
            const recentAvg = recent5.reduce((a, b) => a + b, 0) / recent5.length;
            const previousAvg = previous5.reduce((a, b) => a + b, 0) / previous5.length;
            data.improvement = Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
        }
        
        await leaderboardRef.set(data);
        console.log('✅ Manual leaderboard update successful');
        
    } catch (error) {
        console.error('❌ Manual leaderboard update failed:', error);
    }
}

/**
 * Get department from current URL
 */
function getDepartmentFromURL() {
    const path = window.location.pathname;
    if (path.includes('/cs/')) return 'cs';
    if (path.includes('/ee/')) return 'ee';
    if (path.includes('/me/')) return 'me';
    if (path.includes('/ce/')) return 'ce';
    if (path.includes('/ec/')) return 'ec';
    return 'cs'; // default
}

/**
 * Calculate grade from score
 */
function calculateGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
}

/**
 * Calculate stars (1–5) from interview metrics
 * @param {{score:number, wpm?:number, clarity?:number, fillerWords?:number}} metrics
 */
function calculateStars(metrics) {
    const score = metrics?.score ?? 0;
    // Base on score with optional fine-tuning
    let stars = 1;
    if (score >= 90) stars = 5;
    else if (score >= 80) stars = 4;
    else if (score >= 70) stars = 3;
    else if (score >= 60) stars = 2;
    else stars = 1;

    // Light adjustments if extra metrics present
    if (typeof metrics?.clarity === 'number') {
        if (metrics.clarity > 0.8 && stars < 5) stars += 0.5;
        if (metrics.clarity < 0.4 && stars > 1) stars -= 0.5;
    }
    if (typeof metrics?.fillerWords === 'number') {
        if (metrics.fillerWords <= 2 && stars < 5) stars += 0.5;
        if (metrics.fillerWords > 10 && stars > 1) stars -= 0.5;
    }
    // Clamp to 1–5 and round to nearest integer for storage
    stars = Math.round(Math.max(1, Math.min(5, stars)));
    return stars;
}

/**
 * Show leaderboard notification after interview
 */
function showLeaderboardNotification(rank, improvement) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, rgba(108, 99, 255, 0.95), rgba(0, 229, 255, 0.95));
        backdrop-filter: blur(10px);
        padding: 20px 25px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        color: white;
        font-family: 'Poppins', sans-serif;
        z-index: 10000;
        animation: slideInRight 0.5s ease;
        max-width: 350px;
    `;
    
    let message = '🏆 <strong>Leaderboard Updated!</strong><br>';
    if (rank) {
        message += `Your current rank: <strong>#${rank}</strong><br>`;
    }
    if (improvement > 0) {
        message += `<span style="color: #22C55E;">↗ +${improvement}% improvement</span>`;
    } else if (improvement < 0) {
        message += `<span style="color: #FCA5A5;">↘ ${improvement}% change</span>`;
    }
    message += '<br><a href="../leaderboard.html" style="color: white; text-decoration: underline; margin-top: 10px; display: inline-block;">View Leaderboard →</a>';
    
    notification.innerHTML = message;
    document.body.appendChild(notification);
    
    // Auto-remove after 7 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 7000);
}

// Add CSS for animations
if (!document.getElementById('leaderboard-integration-styles')) {
    const style = document.createElement('style');
    style.id = 'leaderboard-integration-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100px);
            }
        }
    `;
    document.head.appendChild(style);
}

// Export functions
window.saveToLeaderboard = saveToLeaderboard;
window.showLeaderboardNotification = showLeaderboardNotification;

console.log('✅ Leaderboard integration loaded');
