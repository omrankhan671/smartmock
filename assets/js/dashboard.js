document.addEventListener('DOMContentLoaded', async () => {
  const inProgressList = document.getElementById('in-progress-list');
  const learningProgressContainer = document.getElementById('learning-progress-container');
  const upcomingSessions = document.getElementById('upcoming-sessions');
  const recentReports = document.getElementById('recent-reports');
  
  // Initialize v2.0 Gamification Features
  initializeGamification();
  
  // Get user and enrolled/completed courses from localStorage
  const user = getCurrentUser();
  const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses')) || {};
  const completedCourses = JSON.parse(localStorage.getItem('completedCourses')) || {};

  // Real data containers
  let realInterviews = [];
  let realReports = [];
  let userStats = {
    totalInterviews: 0,
    totalReports: 0,
    totalCertificates: 0
  };

  // Fetch real data from Firebase
  if (firebase.auth().currentUser) {
    try {
      const userId = firebase.auth().currentUser.uid;
      
      // Fetch interviews from Firebase
      const interviewsSnapshot = await firebase.database().ref(`interviews/${userId}`).once('value');
      const interviewsData = interviewsSnapshot.val();
      
      if (interviewsData) {
        realInterviews = Object.keys(interviewsData).map(key => ({
          id: key,
          ...interviewsData[key]
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        userStats.totalInterviews = realInterviews.length;
        userStats.totalReports = realInterviews.filter(i => i.completed).length;
        
        console.log('✅ Loaded real interviews:', realInterviews.length);
      }
    } catch (error) {
      console.error('❌ Error fetching Firebase data:', error);
    }
  }

  // Update stats with real data
  document.getElementById('enrolled-count').textContent = Object.keys(enrolledCourses).length;
  userStats.totalCertificates = Object.keys(completedCourses).length;

  // Department icon mapping
  const deptIcons = {
    'CS': '💻',
    'EE': '⚡',
    'ME': '⚙️',
    'CE': '🏗️',
    'EC': '📡'
  };

  // Department name mapping
  const deptNames = {
    'CS': 'Computer Science',
    'EE': 'Electrical Engineering',
    'ME': 'Mechanical Engineering',
    'CE': 'Civil Engineering',
    'EC': 'Electronic Communication'
  };

  // Course name mapping
  const courseNames = {
    'cs-dsa': 'Data Structures & Algorithms',
    'cs-system-design': 'System Design',
    'cs-db': 'Database Management',
    'cs-web-dev': 'Web Development',
    'cs-python': 'Python Programming',
    'cs-js': 'JavaScript Mastery',
    'cs-java': 'Java Programming',
    'cs-cpp': 'C++ Programming',
    'cs-ml': 'Machine Learning',
    'cs-os': 'Operating Systems',
    'cs-cn': 'Computer Networks',
    'cs-se': 'Software Engineering',
    'cs-cloud': 'Cloud Computing',
    'cs-devops': 'DevOps & CI/CD',
    'cs-cyber': 'Cybersecurity',
    'cs-mobile': 'Mobile Development',
    'cs-react': 'React & React Native',
    'cs-node': 'Node.js & Express',
    'cs-docker': 'Docker & Kubernetes',
    'cs-graphql': 'GraphQL & REST APIs',
    'ee-circuits': 'Circuit Analysis',
    'ee-power': 'Power Systems',
    'ee-electronics': 'Electronics Engineering',
    'me-mechanics': 'Engineering Mechanics',
    'me-thermo': 'Thermodynamics',
    'me-fluid': 'Fluid Mechanics',
    'ce-structural-analysis': 'Structural Analysis',
    'ce-construction': 'Construction Management',
    'ec-analog-comm': 'Analog Communication',
    'ec-digital-comm': 'Digital Communication'
  };

  // Display real upcoming sessions or show empty state
  if (realInterviews.length > 0) {
    // Show recent incomplete interviews as "upcoming"
    const upcomingInterviews = realInterviews
      .filter(interview => !interview.completed || interview.questionsAsked < interview.totalQuestions)
      .slice(0, 3);
    
    if (upcomingInterviews.length > 0) {
      upcomingInterviews.forEach(interview => {
        const dept = interview.department || 'CS';
        const deptLower = dept.toLowerCase();
        const icon = deptIcons[dept.toUpperCase()] || '🎯';
        const dateObj = new Date(interview.timestamp);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
        
        const card = document.createElement('div');
        card.className = 'card hover-card';
        card.style.cursor = 'pointer';
        card.innerHTML = `
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 2em; margin-right: 10px;">${icon}</span>
            <div>
              <h3 style="margin: 0;">${deptNames[dept.toUpperCase()] || dept} Interview</h3>
              <p class="muted" style="margin: 5px 0 0 0; font-size: 0.9em;">${dateStr}</p>
            </div>
          </div>
          <p style="margin: 10px 0;"><strong>Topic:</strong> ${interview.topic || 'General'}</p>
          <p style="margin: 10px 0;"><strong>Level:</strong> ${interview.level || 'Intermediate'}</p>
          <p style="margin: 10px 0; color: #f5576c;"><strong>Status:</strong> ${interview.questionsAsked || 0}/${interview.totalQuestions || 5} questions completed</p>
          <div style="display: flex; gap: 10px;">
            <button class="btn" style="flex: 1; padding: 8px;" onclick="window.location.href='interview/${deptLower}/ai-interview.html'">Resume Interview</button>
            <button class="btn" style="flex: 1; padding: 8px; background: transparent; border: 1px solid var(--primary); color: var(--primary);" onclick="window.location.href='interview/${deptLower}/ai-report.html?sessionId=${interview.id}'">View Report</button>
          </div>
        `;
        upcomingSessions.appendChild(card);
      });
    } else {
      // All interviews completed, show new interview options
      const departments = ['CS', 'EE', 'ME', 'CE', 'EC'];
      departments.slice(0, 3).forEach(dept => {
        const deptLower = dept.toLowerCase();
        const icon = deptIcons[dept] || '🎯';
        
        const card = document.createElement('div');
        card.className = 'card hover-card';
        card.style.cursor = 'pointer';
        card.innerHTML = `
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 2em; margin-right: 10px;">${icon}</span>
            <div>
              <h3 style="margin: 0;">${deptNames[dept]} Interview</h3>
              <p class="muted" style="margin: 5px 0 0 0; font-size: 0.9em;">Available Now</p>
            </div>
          </div>
          <p style="margin: 10px 0;">Start a new AI-powered mock interview</p>
          <button class="btn" style="width: 100%; padding: 8px;" onclick="window.location.href='interview/${deptLower}/ai-interview.html'">Start New Interview</button>
        `;
        upcomingSessions.appendChild(card);
      });
    }
  } else {
    // No interviews yet, show starter cards
    const starterDepts = ['CS', 'EE', 'ME'];
    starterDepts.forEach(dept => {
      const deptLower = dept.toLowerCase();
      const icon = deptIcons[dept] || '🎯';
      
      const card = document.createElement('div');
      card.className = 'card hover-card';
      card.style.cursor = 'pointer';
      card.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <span style="font-size: 2em; margin-right: 10px;">${icon}</span>
          <div>
            <h3 style="margin: 0;">${deptNames[dept]} Interview</h3>
            <p class="muted" style="margin: 5px 0 0 0; font-size: 0.9em;">Get Started</p>
          </div>
        </div>
        <p style="margin: 10px 0;">Take your first AI interview and get detailed feedback</p>
        <button class="btn" style="width: 100%; padding: 8px;" onclick="window.location.href='interview/${deptLower}/ai-interview.html'">Start First Interview</button>
      `;
      upcomingSessions.appendChild(card);
    });
  }

  // Display real recent reports
  if (realInterviews.length > 0) {
    const completedInterviews = realInterviews
      .filter(interview => interview.completed && interview.overallScore !== undefined)
      .slice(0, 4);
    
    if (completedInterviews.length > 0) {
      completedInterviews.forEach(interview => {
        const dept = interview.department || 'CS';
        const deptLower = dept.toLowerCase();
        const score = Math.round((interview.overallScore || 0) * 100);
        const dateObj = new Date(interview.timestamp);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        const scoreColor = score >= 90 ? '#43e97b' : score >= 80 ? '#4facfe' : score >= 70 ? '#f093fb' : '#f5576c';
        const status = score >= 90 ? 'Outstanding' : score >= 80 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Improvement';
        
        const card = document.createElement('div');
        card.className = 'card hover-card';
        card.style.cursor = 'pointer';
        
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
            <div>
              <h3 style="margin: 0 0 5px 0;">${deptNames[dept.toUpperCase()] || dept} Interview</h3>
              <p class="muted" style="margin: 0; font-size: 0.85em;">${dateStr}</p>
            </div>
            <div style="text-align: center; background: ${scoreColor}; color: white; border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">
              ${score}
            </div>
          </div>
          <p style="margin: 5px 0;"><strong>Topic:</strong> ${interview.topic || 'General'}</p>
          <p style="margin: 5px 0;"><strong>Level:</strong> ${interview.level || 'Intermediate'}</p>
          <p style="margin: 5px 0;"><strong>Questions:</strong> ${interview.questionsAsked || 0}/${interview.totalQuestions || 5}</p>
          <p style="margin: 5px 0;"><strong>Avg WPM:</strong> ${Math.round(interview.avgWPM || 0)}</p>
          <p style="margin: 5px 0;"><strong>Dominant Emotion:</strong> ${interview.dominantEmotion || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${scoreColor}; font-weight: 600;">${status}</span></p>
          <button class="btn" style="width: 100%; margin-top: 10px; padding: 8px;">View Detailed Report</button>
        `;
        card.addEventListener('click', () => {
          window.location.href = `interview/${deptLower}/ai-report.html?sessionId=${interview.id}`;
        });
        recentReports.appendChild(card);
      });
    } else {
      const emptyCard = document.createElement('div');
      emptyCard.className = 'card';
      emptyCard.innerHTML = `
        <p class="muted" style="text-align: center;">No completed interviews yet. Complete an interview to see your reports here!</p>
        <button class="btn" style="width: 100%; margin-top: 10px; padding: 8px;" onclick="window.location.href='interview/cs/ai-interview.html'">Take Your First Interview</button>
      `;
      recentReports.appendChild(emptyCard);
    }
  } else {
    const emptyCard = document.createElement('div');
    emptyCard.className = 'card';
    emptyCard.innerHTML = `
      <p class="muted" style="text-align: center;">No interview reports yet. Start your first AI interview!</p>
      <button class="btn" style="width: 100%; margin-top: 10px; padding: 8px;" onclick="window.location.href='interview/cs/ai-interview.html'">Start First Interview</button>
    `;
    recentReports.appendChild(emptyCard);
  }

  // Display in-progress courses (real data from localStorage or show starter courses)
  let hasUserProgress = Object.keys(enrolledCourses).some(id => !completedCourses[id]);

  const coursesToDisplay = hasUserProgress ? 
    Object.keys(enrolledCourses).filter(id => !completedCourses[id]).map(id => ({
      id,
      name: courseNames[id] || enrolledCourses[id].courseName || id,
      progress: enrolledCourses[id].progress || 50,
      link: enrolledCourses[id].courseUrl || '#',
      icon: '📚'
    })) : [];

  if (coursesToDisplay.length > 0) {
    coursesToDisplay.forEach(course => {
      const card = document.createElement('div');
      card.className = 'card hover-card';
      card.style.cursor = 'pointer';
      card.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <span style="font-size: 2em; margin-right: 10px;">${course.icon}</span>
          <h3 style="margin: 0; flex: 1;">${course.name}</h3>
        </div>
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Progress</span>
            <span style="font-weight: bold;">${course.progress}%</span>
          </div>
          <div style="width: 100%; height: 8px; background: #eee; border-radius: 4px; overflow: hidden;">
            <div style="width: ${course.progress}%; height: 100%; background: linear-gradient(90deg, var(--primary), #764ba2); transition: width 0.3s;"></div>
          </div>
        </div>
        <button class="btn" style="width: 100%; padding: 8px;">Continue Learning</button>
      `;
      card.addEventListener('click', () => {
        window.location.href = course.link;
      });
      inProgressList.appendChild(card);
    });
  } else {
    // Show starter courses when no courses enrolled
    const starterCourses = [
      { name: 'Data Structures & Algorithms', link: 'interview/cs/courses.html', icon: '💻', dept: 'CS' },
      { name: 'Circuit Analysis', link: 'interview/ee/courses.html', icon: '⚡', dept: 'EE' },
      { name: 'Engineering Mechanics', link: 'interview/me/courses.html', icon: '⚙️', dept: 'ME' }
    ];
    
    starterCourses.forEach(course => {
      const card = document.createElement('div');
      card.className = 'card hover-card';
      card.style.cursor = 'pointer';
      card.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <span style="font-size: 2em; margin-right: 10px;">${course.icon}</span>
          <h3 style="margin: 0; flex: 1;">${course.name}</h3>
        </div>
        <p class="muted" style="margin-bottom: 15px;">${deptNames[course.dept]} Department</p>
        <button class="btn" style="width: 100%; padding: 8px;">Explore Courses</button>
      `;
      card.addEventListener('click', () => {
        window.location.href = course.link;
      });
      inProgressList.appendChild(card);
    });
  }

  // Update stats counters with real data
  const totalInterviewsEl = document.querySelector('.container section:nth-child(2) .grid .card:nth-child(1) p:first-of-type');
  const totalReportsEl = document.querySelector('.container section:nth-child(2) .grid .card:nth-child(2) p:first-of-type');
  const totalCoursesEl = document.getElementById('enrolled-count');
  const totalCertsEl = document.getElementById('cert-count');
  
  if (totalInterviewsEl) totalInterviewsEl.textContent = userStats.totalInterviews || 0;
  if (totalReportsEl) totalReportsEl.textContent = userStats.totalReports || 0;
  if (totalCoursesEl) totalCoursesEl.textContent = Object.keys(enrolledCourses).length || 0;
  if (totalCertsEl) totalCertsEl.textContent = userStats.totalCertificates || 0;

  // Display learning progress (overview with real data)
  const allCourses = [...coursesToDisplay];
  Object.keys(completedCourses).forEach(id => {
    if (!allCourses.find(c => c.id === id)) {
      allCourses.push({
        id,
        name: courseNames[id] || id,
        progress: 100,
        link: '#',
        icon: '✅'
      });
    }
  });

  if (allCourses.length > 0) {
    const totalProgress = allCourses.reduce((sum, course) => sum + (course.progress || 0), 0) / allCourses.length;
    learningProgressContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 3em; font-weight: bold; color: var(--primary);">${Math.round(totalProgress)}%</div>
        <p class="muted">Overall Learning Progress</p>
      </div>
      <div style="display: grid; gap: 15px;">
        ${allCourses.slice(0, 5).map(course => `
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.5em;">${course.icon}</span>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="font-size: 0.9em;">${course.name}</span>
                <span style="font-size: 0.9em; font-weight: bold;">${course.progress}%</span>
              </div>
              <div style="width: 100%; height: 6px; background: #eee; border-radius: 3px; overflow: hidden;">
                <div style="width: ${course.progress}%; height: 100%; background: var(--primary); transition: width 0.3s;"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    learningProgressContainer.innerHTML = '<p class="muted" style="text-align: center; padding: 20px;">No learning progress yet. Enroll in courses to track your progress!</p>';
  }

  // Update certificate count based on completed courses
  const certCount = Object.keys(completedCourses).length || 3;
  document.getElementById('cert-count').textContent = certCount;

  // Add hover effect styles dynamically
  const style = document.createElement('style');
  style.textContent = `
    .hover-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .hover-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
  `;
  document.head.appendChild(style);
});

/**
 * Initialize Gamification Features
 */
function initializeGamification() {
  if (typeof SmartMockAdvanced === 'undefined' || typeof SmartMockVisualizations === 'undefined') {
    console.log('⏳ Gamification modules not loaded yet');
    return;
  }

  try {
    // Get user data from localStorage or Firebase
    const userData = JSON.parse(localStorage.getItem('gamificationData')) || {
      totalXP: 1250,
      level: 5,
      currentXP: 1250,
      nextLevelXP: 1600,
      interviewCount: 12,
      perfectScores: 3,
      averageScore: 85,
      currentStreak: 5,
      longestStreak: 8
    };

    // Calculate level data
    const levelData = SmartMockAdvanced.GamificationSystem.calculateLevel(userData.totalXP);
    levelData.currentXP = userData.totalXP;
    levelData.nextLevelXP = (levelData.level * levelData.level) * 100;

    // Check badges
    const badges = SmartMockAdvanced.GamificationSystem.checkBadges({
      interviewCount: userData.interviewCount,
      perfectScores: userData.perfectScores,
      averageScore: userData.averageScore,
      currentStreak: userData.currentStreak
    });

    // Streak data
    const streakData = {
      currentStreak: userData.currentStreak,
      longestStreak: userData.longestStreak
    };

    // Display XP
    const xpContainer = document.getElementById('xp-display-container');
    if (xpContainer) {
      const xpDisplay = SmartMockVisualizations.createXPDisplay(levelData);
      xpContainer.appendChild(xpDisplay);
    }

    // Display Badges
    const badgeContainer = document.getElementById('badge-display-container');
    if (badgeContainer && badges.length > 0) {
      const badgeDisplay = SmartMockVisualizations.createBadgeDisplay(badges.slice(0, 3));
      badgeContainer.appendChild(badgeDisplay);
    }

    // Display Streak
    const streakContainer = document.getElementById('streak-display-container');
    if (streakContainer) {
      const streakDisplay = SmartMockVisualizations.createStreakDisplay(streakData);
      streakContainer.appendChild(streakDisplay);
    }

    console.log('✅ Gamification features initialized');
  } catch (error) {
    console.error('❌ Error initializing gamification:', error);
  }
}
