// Leaderboard Module - Firebase Integration
// Real-time leaderboard with filtering, sorting, and user tracking

let currentUser = null;
let allLeaderboardData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 25;

// Department names mapping
const departmentNames = {
    'cs': 'Computer Science',
    'ee': 'Electrical Engineering',
    'me': 'Mechanical Engineering',
    'ce': 'Civil Engineering',
    'ec': 'Electronics & Communication'
};

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on pages that contain the leaderboard elements
    if (!document.getElementById('leaderboard-tbody') && !document.getElementById('podium-section')) {
        // Not a leaderboard page - skip initialization to avoid null DOM errors
        return;
    }
    initializeLeaderboard();
    setupEventListeners();
});

// Initialize leaderboard
async function initializeLeaderboard() {
    try {
        // Get current user
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                currentUser = user;
                await loadLeaderboardData();
                await loadUserPerformance();
            } else {
                window.location.href = 'index.html';
            }
        });
    } catch (error) {
        console.error('Error initializing leaderboard:', error);
        showError('Failed to load leaderboard data');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Filters
    const deptFilter = document.getElementById('department-filter');
    const timeFilter = document.getElementById('timeframe-filter');
    if (deptFilter) deptFilter.addEventListener('change', applyFilters);
    if (timeFilter) timeFilter.addEventListener('change', applyFilters);
    
    // Search
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Refresh
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadLeaderboardData();
        });
    }
    
    // Pagination
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderLeaderboard();
            }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredData.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderLeaderboard();
            }
        });
    }
    
    // Close performance card
    const closePerf = document.getElementById('close-performance');
    if (closePerf) {
        closePerf.addEventListener('click', () => {
            const perfCard = document.getElementById('user-performance-card');
            if (perfCard) perfCard.style.display = 'none';
        });
    }
    
    // Hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            firebase.auth().signOut().then(() => {
                window.location.href = 'index.html';
            });
        });
    }
}

// Load leaderboard data from Firebase
async function loadLeaderboardData() {
    try {
        showLoading();
        
        const leaderboardRef = firebase.database().ref('leaderboard');
    const snapshot = await leaderboardRef.once('value');
        
        allLeaderboardData = [];
        
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                allLeaderboardData.push({
                    userId: childSnapshot.key,
                    ...data
                });
            });
            
            // Sort by totalStars (desc) then bestScore (desc)
            allLeaderboardData.sort((a, b) => {
                const starsA = a.totalStars || 0;
                const starsB = b.totalStars || 0;
                if (starsB !== starsA) return starsB - starsA;
                return (b.bestScore || 0) - (a.bestScore || 0);
            });
            
            // Assign ranks
            allLeaderboardData.forEach((item, index) => {
                item.rank = index + 1;
            });
        }
        
        filteredData = [...allLeaderboardData];
        
        updateStats();
        renderPodium();
        renderLeaderboard();
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        showError('Failed to load leaderboard data');
    }
}

// Update statistics
function updateStats() {
    const totalUsers = allLeaderboardData.length;
    const totalInterviews = allLeaderboardData.reduce((sum, item) => sum + (item.totalInterviews || 0), 0);
    const avgScore = totalUsers > 0 
        ? Math.round(allLeaderboardData.reduce((sum, item) => sum + (item.bestScore || 0), 0) / totalUsers) 
        : 0;
    
    const totalUsersEl = document.getElementById('total-users');
    const totalInterviewsEl = document.getElementById('total-interviews');
    const avgScoreEl = document.getElementById('avg-score');
    const userRankEl = document.getElementById('user-rank');
    
    if (totalUsersEl) totalUsersEl.textContent = totalUsers.toLocaleString();
    if (totalInterviewsEl) totalInterviewsEl.textContent = totalInterviews.toLocaleString();
    if (avgScoreEl) avgScoreEl.textContent = avgScore;
    
    // Find current user rank
    if (currentUser && userRankEl) {
        const userEntry = allLeaderboardData.find(item => item.userId === currentUser.uid);
        if (userEntry) {
            userRankEl.textContent = `#${userEntry.rank}`;
        } else {
            userRankEl.textContent = '--';
        }
    }
}

// Render top 3 podium
function renderPodium() {
    const podiumSection = document.getElementById('podium-section');
    
    if (filteredData.length < 3) {
        podiumSection.innerHTML = `
            <div class="podium-placeholder">
                <p>Not enough users to display podium yet</p>
            </div>
        `;
        return;
    }
    
    const top3 = filteredData.slice(0, 3);
    const positions = ['second', 'first', 'third'];
    const medals = ['🥈', '🥇', '🥉'];
    
    let podiumHTML = '<div class="podium-container">';
    
    [1, 0, 2].forEach((index, i) => {
        if (top3[index]) {
            const user = top3[index];
            const initials = getInitials(user.name || 'Unknown');
            const deptName = departmentNames[user.department] || user.department || 'Unknown';
            
            podiumHTML += `
                <div class="podium-place ${positions[index]}">
                    <div class="podium-avatar">
                        <span class="podium-medal">${medals[index]}</span>
                        ${initials}
                    </div>
                    <div class="podium-info">
                        <h3>${user.name || 'User ' + (index + 1)}</h3>
                        <div class="score">${user.bestScore || 0}</div>
                        <div class="department">${deptName}</div>
                    </div>
                    <div class="podium-base"></div>
                </div>
            `;
        }
    });
    
    podiumHTML += '</div>';
    podiumSection.innerHTML = podiumHTML;
}

// Render leaderboard table
function renderLeaderboard() {
    const tbody = document.getElementById('leaderboard-tbody');
    
    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #9CA3AF;">
                    No users found matching your filters
                </td>
            </tr>
        `;
        updatePagination();
        return;
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
    const pageData = filteredData.slice(startIndex, endIndex);
    
    let html = '';
    
    pageData.forEach((user) => {
        const isCurrentUser = currentUser && user.userId === currentUser.uid;
        const initials = getInitials(user.name || 'Unknown');
        const deptClass = `dept-${user.department || 'cs'}`;
        const deptName = departmentNames[user.department] || user.department || 'Unknown';
        const gradeClass = getGradeClass(user.grade || 'F');
        const lastActive = formatDate(user.lastActive);
        
        let rankBadge = '';
        if (user.rank <= 3) {
            rankBadge = `<span class="rank-badge top3">${user.rank}</span>`;
        } else if (user.rank <= 10) {
            rankBadge = `<span class="rank-badge top10">${user.rank}</span>`;
        } else {
            rankBadge = `<span class="rank-badge other">${user.rank}</span>`;
        }
        
        html += `
            <tr class="${isCurrentUser ? 'current-user' : ''}">
                <td class="rank-cell">${rankBadge}</td>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar">${initials}</div>
                        <div class="user-info">
                            <div class="name">${user.name || 'Anonymous'} ${isCurrentUser ? '(You)' : ''}</div>
                            <div class="email">${user.email || ''}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="department-badge ${deptClass}">${deptName}</span>
                </td>
                <td class="score-cell">${user.bestScore || 0}</td>
                <td>
                    ${renderStarsAvg(user.totalStars || 0, user.totalInterviews || 0)}
                </td>
                <td>${user.totalInterviews || 0}</td>
                <td>
                    <span class="grade-badge ${gradeClass}">${user.grade || 'N/A'}</span>
                </td>
                <td>${lastActive}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    updatePagination();
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (pageInfo) pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages || totalPages === 0;
}

// Apply filters
function applyFilters() {
    const deptFilter = document.getElementById('department-filter');
    const timeFilter = document.getElementById('timeframe-filter');
    if (!deptFilter || !timeFilter) return;
    
    const department = deptFilter.value;
    const timeframe = timeFilter.value;
    
    filteredData = [...allLeaderboardData];
    // Ensure sorting preserved after filtering
    filteredData.sort((a, b) => {
        const starsA = a.totalStars || 0;
        const starsB = b.totalStars || 0;
        if (starsB !== starsA) return starsB - starsA;
        return (b.bestScore || 0) - (a.bestScore || 0);
    });
    
    // Department filter
    if (department !== 'all') {
        filteredData = filteredData.filter(user => user.department === department);
    }
    
    // Timeframe filter
    if (timeframe !== 'all-time') {
        const now = Date.now();
        const cutoffTime = {
            'today': now - 24 * 60 * 60 * 1000,
            'week': now - 7 * 24 * 60 * 60 * 1000,
            'month': now - 30 * 24 * 60 * 60 * 1000
        }[timeframe];
        
        filteredData = filteredData.filter(user => {
            return user.lastActive && user.lastActive >= cutoffTime;
        });
    }
    
    // Re-sort and re-rank filtered data
    filteredData.sort((a, b) => {
        const starsA = a.totalStars || 0;
        const starsB = b.totalStars || 0;
        if (starsB !== starsA) return starsB - starsA;
        return (b.bestScore || 0) - (a.bestScore || 0);
    });
    filteredData.forEach((item, index) => { item.rank = index + 1; });
    
    currentPage = 1;
    renderPodium();
    renderLeaderboard();
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (!searchTerm) {
        applyFilters();
        return;
    }
    
    filteredData = allLeaderboardData.filter(user => {
        return (user.name || '').toLowerCase().includes(searchTerm) ||
               (user.email || '').toLowerCase().includes(searchTerm);
    });
    
    // Re-sort and re-rank
    filteredData.sort((a, b) => {
        const starsA = a.totalStars || 0;
        const starsB = b.totalStars || 0;
        if (starsB !== starsA) return starsB - starsA;
        return (b.bestScore || 0) - (a.bestScore || 0);
    });
    filteredData.forEach((item, index) => { item.rank = index + 1; });
    
    currentPage = 1;
    renderLeaderboard();
}

// Load user performance
async function loadUserPerformance() {
    if (!currentUser) return;
    
    try {
        const userRef = firebase.database().ref(`leaderboard/${currentUser.uid}`);
        const snapshot = await userRef.once('value');
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            
            // Find global rank
            const globalRank = allLeaderboardData.findIndex(u => u.userId === currentUser.uid) + 1;
            
            // Find department rank
            const deptData = allLeaderboardData.filter(u => u.department === data.department);
            const deptRank = deptData.findIndex(u => u.userId === currentUser.uid) + 1;
            
            // Calculate average score
            const avgScore = data.totalInterviews > 0 
                ? Math.round(data.totalScore / data.totalInterviews) 
                : 0;
            
            // Calculate improvement (comparing last 5 vs previous 5)
            const improvement = data.improvement || 0;
            
            // Update UI
            const globalRankEl = document.getElementById('user-global-rank');
            const deptRankEl = document.getElementById('user-dept-rank');
            const bestScoreEl = document.getElementById('user-best-score');
            const totalInterviewsEl = document.getElementById('user-total-interviews');
            const avgScoreEl = document.getElementById('user-avg-score');
            const improvementEl = document.getElementById('user-improvement');
            const perfCard = document.getElementById('user-performance-card');
            
            if (globalRankEl) globalRankEl.textContent = `#${globalRank || '--'}`;
            if (deptRankEl) deptRankEl.textContent = `#${deptRank || '--'}`;
            if (bestScoreEl) bestScoreEl.textContent = data.bestScore || 0;
            if (totalInterviewsEl) totalInterviewsEl.textContent = data.totalInterviews || 0;
            if (avgScoreEl) avgScoreEl.textContent = avgScore;
            
            if (improvementEl) {
                if (improvement > 0) {
                    improvementEl.textContent = `+${improvement}%`;
                    improvementEl.style.color = '#22C55E';
                } else if (improvement < 0) {
                    improvementEl.textContent = `${improvement}%`;
                    improvementEl.style.color = '#EF4444';
                } else {
                    improvementEl.textContent = '0%';
                    improvementEl.style.color = '#9CA3AF';
                }
            }
            
            // Show performance card
            if (perfCard) perfCard.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading user performance:', error);
    }
}

// Update leaderboard after interview (called from AI interview page)
async function updateLeaderboardAfterInterview(userId, interviewData) {
    try {
        const userRef = firebase.database().ref(`leaderboard/${userId}`);
        const snapshot = await userRef.once('value');
        
        let leaderboardData = snapshot.val() || {
            name: interviewData.name || 'Anonymous',
            email: interviewData.email || '',
            department: interviewData.department || 'cs',
            bestScore: 0,
            totalInterviews: 0,
            totalScore: 0,
            recentScores: [],
            totalStars: 0,
            starHistory: [],
            grade: 'N/A',
            lastActive: Date.now()
        };
        
        // Update stats
        leaderboardData.totalInterviews++;
        leaderboardData.totalScore += interviewData.score;
        leaderboardData.lastActive = Date.now();
        
        // Update best score
        if (interviewData.score > leaderboardData.bestScore) {
            leaderboardData.bestScore = interviewData.score;
            leaderboardData.grade = interviewData.grade;
        }
        
        // Track recent scores for improvement calculation
        leaderboardData.recentScores = leaderboardData.recentScores || [];
        leaderboardData.recentScores.push(interviewData.score);
        if (leaderboardData.recentScores.length > 10) {
            leaderboardData.recentScores.shift();
        }

        // Stars gamification
        const starsAwarded = typeof interviewData.stars === 'number' ? interviewData.stars : calculateStarsFromScore(interviewData.score);
        leaderboardData.totalStars = (leaderboardData.totalStars || 0) + starsAwarded;
        leaderboardData.starHistory = leaderboardData.starHistory || [];
        leaderboardData.starHistory.push({ t: Date.now(), s: starsAwarded, score: interviewData.score });
        if (leaderboardData.starHistory.length > 30) {
            leaderboardData.starHistory.shift();
        }
        
        // Calculate improvement
        if (leaderboardData.recentScores.length >= 6) {
            const recent5 = leaderboardData.recentScores.slice(-5);
            const previous5 = leaderboardData.recentScores.slice(-10, -5);
            const recentAvg = recent5.reduce((a, b) => a + b, 0) / recent5.length;
            const previousAvg = previous5.reduce((a, b) => a + b, 0) / previous5.length;
            leaderboardData.improvement = Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
        }
        
        // Save to Firebase
        await userRef.set(leaderboardData);
        
        return leaderboardData;
        
    } catch (error) {
        console.error('Error updating leaderboard:', error);
        throw error;
    }
}

// Utility functions
function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function getGradeClass(grade) {
    const gradeMap = {
        'A+': 'grade-a-plus',
        'A': 'grade-a',
        'B': 'grade-b',
        'C': 'grade-c',
        'D': 'grade-d',
        'F': 'grade-f'
    };
    return gradeMap[grade] || 'grade-f';
}

function formatDate(timestamp) {
    if (!timestamp) return 'Never';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showLoading() {
    const tbody = document.getElementById('leaderboard-tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-row">
                    <div class="loading-spinner"></div>
                    <p>Loading rankings...</p>
                </td>
            </tr>
        `;
    }
    
    const podium = document.getElementById('podium-section');
    if (podium) {
        podium.innerHTML = `
            <div class="podium-placeholder">
                <div class="loading-spinner"></div>
                <p>Loading top performers...</p>
            </div>
        `;
    }
}

function showError(message) {
    const tbody = document.getElementById('leaderboard-tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #EF4444;">
                    ❌ ${message}
                </td>
            </tr>
        `;
    }
}

// Export function for use in AI interview pages
window.updateLeaderboardAfterInterview = updateLeaderboardAfterInterview;

// Render stars utility (5-star max per interview visualization based on totalStars normalized)
function renderStarsAvg(totalStars, totalInterviews) {
    const avg = totalInterviews > 0 ? totalStars / totalInterviews : 0;
    const filled = Math.max(0, Math.min(5, Math.round(avg)));
    let html = '<div class="stars-cell">';
    for (let i = 0; i < 5; i++) {
        html += `<span class="star ${i < filled ? '' : 'dim'}"></span>`;
    }
    html += '</div>';
    return html;
}

function calculateStarsFromScore(score) {
    if (score >= 90) return 5;
    if (score >= 80) return 4;
    if (score >= 70) return 3;
    if (score >= 60) return 2;
    if (score >= 50) return 1;
    return 1; // Minimum 1 star to encourage
}
