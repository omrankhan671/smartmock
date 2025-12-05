// EE Report Page - Advanced Comprehensive Report Generation with Performance Optimization
// Configuration
const CONFIG = {
  CACHE_ENABLED: true,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  ENABLE_REAL_TIME: false, // Enable real-time updates
  PARALLEL_LOADING: true,
  API_BASE_URL: window.location.origin,
  FETCH_TIMEOUT: 3000  // Reduced to 3 seconds for faster response
};

// Cache management
const dataCache = {
  data: {},
  timestamps: {},
  
  set(key, value) {
    this.data[key] = value;
    this.timestamps[key] = Date.now();
  },
  
  get(key) {
    if (!this.data[key]) return null;
    const age = Date.now() - this.timestamps[key];
    if (age > CONFIG.CACHE_DURATION) {
      delete this.data[key];
      delete this.timestamps[key];
      return null;
    }
    return this.data[key];
  },
  
  clear(pattern) {
    if (pattern) {
      Object.keys(this.data).forEach(key => {
        if (key.includes(pattern)) {
          delete this.data[key];
          delete this.timestamps[key];
        }
      });
    } else {
      this.data = {};
      this.timestamps = {};
    }
  }
};

// Performance monitoring
const performance = {
  marks: {},
  
  start(name) {
    this.marks[name] = Date.now();
  },
  
  end(name) {
    if (this.marks[name]) {
      const duration = Date.now() - this.marks[name];
      console.log(`💀 ${name}: ${duration}ms`);
      delete this.marks[name];
      return duration;
    }
    return 0;
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  console.log('EE Report page initialized');
  performance.start('total-load');
  
  // Check authentication
  const auth = window.auth || firebase.auth();
  const database = window.database || firebase.database();
  
  console.log('Firebase database instance:', database ? 'initialized' : 'NOT initialized');
  console.log('Firebase database URL:', database ? database.ref().toString() : 'N/A');

  const loadingState = document.getElementById('loading-state');
  const reportContent = document.getElementById('report-content');
  const errorState = document.getElementById('error-state');

  try {
    // Wait for auth state with timeout
    const user = await Promise.race([
      new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe();
          resolve(user);
        });
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Auth timeout')), 10000))
    ]);

    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Loading report for user:', user.uid);

    // Fetch all data in parallel for better performance
    console.log('Starting data fetch...');
    
    // Fetch with individual error handling - don't let one failure break everything
    const [aiInterviews, traditionalInterviews, coursesData, certificates] = await Promise.all([
      fetchAIInterviews(database, user.uid).catch(err => {
        console.error('AI interviews fetch failed:', err);
        return [];
      }),
      fetchTraditionalInterviews(database, user.uid).catch(err => {
        console.error('Traditional interviews fetch failed:', err);
        return [];
      }),
      fetchCoursesData(database, user.uid).catch(err => {
        console.error('Courses data fetch failed:', err);
        return { enrolled: [], completed: [], progress: {} };
      }),
      fetchCertificates(database, user.uid).catch(err => {
        console.error('Certificates fetch failed:', err);
        return [];
      })
    ]);
    
    // Ensure we have valid data structures
    const safeAIInterviews = Array.isArray(aiInterviews) ? aiInterviews : [];
    const safeTraditionalInterviews = Array.isArray(traditionalInterviews) ? traditionalInterviews : [];
    const safeCoursesData = coursesData && typeof coursesData === 'object' ? {
      enrolled: Array.isArray(coursesData.enrolled) ? coursesData.enrolled : [],
      completed: Array.isArray(coursesData.completed) ? coursesData.completed : [],
      progress: coursesData.progress || {}
    } : { enrolled: [], completed: [], progress: {} };
    const safeCertificates = Array.isArray(certificates) ? certificates : [];
    
    console.log('Data fetched successfully:', {
      aiInterviews: safeAIInterviews.length,
      traditionalInterviews: safeTraditionalInterviews.length,
      completed: safeCoursesData.completed.length,
      inProgress: safeCoursesData.enrolled.length,
      certificates: safeCertificates.length
    });

    // Hide loading, show content
    loadingState.style.display = 'none';
    reportContent.style.display = 'block';

    // Render all sections with safe data
    renderSummaryStats(safeAIInterviews, safeTraditionalInterviews, safeCoursesData, safeCertificates);
    renderAIInterviews(safeAIInterviews);
    renderTraditionalInterviews(safeTraditionalInterviews);
    renderCourseProgress(safeCoursesData);
    renderCertificates(safeCertificates);
    renderOverallFeedback(safeAIInterviews, safeTraditionalInterviews, safeCoursesData);

    // Initialize AI Tutor and render its section
    if (typeof AITutor !== 'undefined') {
      const tutor = AITutor.init('ee');
      renderAITutor(tutor, safeAIInterviews, safeCoursesData);
    }
    
    // Log performance summary
    logPerformanceSummary();
    
    // Display advanced insights if available
    const insights = generateInsights(safeAIInterviews, safeTraditionalInterviews, safeCoursesData);
    if (insights.length > 0) {
      console.log('💡 Generated Insights:', insights);
    }

  } catch (error) {
    console.error('Error loading report:', error);
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
    errorState.innerHTML = '
      <p style="color: #dc3545; font-size: 18px;">⚠️ Failed to load report data</p>
      <p style="color: #666; font-size: 14px; margin: 10px 0;">${error.message}</p>
      <button class="btn" onclick="location.reload()">Retry</button>
    ';
  }
});

// ============================================ 
// DATA FETCHING FUNCTIONS WITH ADVANCED FEATURES
// ============================================ 

// Helper function to add timeout to any promise
function withTimeout(promise, ms, errorMsg) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(errorMsg || 'Operation timed out')), ms)
    )
  ]);
}

// Retry logic for failed requests
async function withRetry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Retry ${i + 1}/${retries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}

// Fetch from backend API with fallback to Firebase
async function fetchWithFallback(apiPath, firebaseFn) {
  try {
    // Try backend API first
    const response = await fetch(`${CONFIG.API_BASE_URL}${apiPath}`);
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        console.log(`✅ Loaded from API: ${apiPath}`);
        return result.data;
      }
    }
  } catch (error) {
    console.log(`⚠️ API failed, falling back to Firebase: ${apiPath}`);
  }
  
  // Fallback to Firebase
  return await firebaseFn();
}

async function fetchAIInterviews(database, userId) {
  performance.start('fetch-ai-interviews');
  
  try {
    // Check cache first
    const cacheKey = `ai_interviews_${userId}`;
    if (CONFIG.CACHE_ENABLED) {
      const cached = dataCache.get(cacheKey);
      if (cached) {
        console.log('✅ Loaded AI interviews from cache');
        performance.end('fetch-ai-interviews');
        return cached;
      }
    }
    
    console.log('Fetching AI interviews...');
    console.log('Database ref path:', `interviews/${userId}`);
    
    const fetchFn = async () => {
      // Quick check if path exists (much faster than waiting for timeout)
      const pathRef = database.ref(`interviews/${userId}`);
      
      // Use a shorter timeout for the actual query
      const snapshot = await Promise.race([
        pathRef.once('value'),
        new Promise((resolve) => setTimeout(() => resolve({ val: () => null }), 3000))
      ]);
      
      const data = snapshot.val() || {};
      
      console.log('AI interviews raw data keys:', Object.keys(data).length);
      
      // Convert to array and sort by date (newest first)
      const interviews = Object.keys(data).map(key => ({
        sessionId: key,
        ...data[key],
        createdAt: data[key].createdAt || data[key].timestamp || new Date().toISOString()
      })).sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      return interviews;
    };
    
    const interviews = await fetchFn();
    
    console.log('AI Interviews fetched:', interviews.length);
    
    // Cache the result
    if (CONFIG.CACHE_ENABLED) {
      dataCache.set(cacheKey, interviews);
    }
    
    performance.end('fetch-ai-interviews');
    return interviews;
  } catch (error) {
    console.error('Error fetching AI interviews:', error);
    performance.end('fetch-ai-interviews');
    return [];
  }
}

async function fetchTraditionalInterviews(database, userId) {
  performance.start('fetch-traditional-interviews');
  
  try {
    const cacheKey = `traditional_interviews_${userId}`;
    if (CONFIG.CACHE_ENABLED) {
      const cached = dataCache.get(cacheKey);
      if (cached) {
        console.log('✅ Loaded traditional interviews from cache');
        performance.end('fetch-traditional-interviews');
        return cached;
      }
    }
    
    console.log('Fetching traditional interviews...');
    
    const fetchFn = async () => {
      const pathRef = database.ref(`traditional_interviews/${userId}`);
      
      const snapshot = await Promise.race([
        pathRef.once('value'),
        new Promise((resolve) => setTimeout(() => resolve({ val: () => null }), 3000))
      ]);
      
      const data = snapshot.val() || {};
      
      console.log('Traditional interviews raw data keys:', Object.keys(data).length);
      
      const interviews = Object.keys(data).map(key => ({
        testId: key,
        ...data[key],
        createdAt: data[key].createdAt || data[key].timestamp || new Date().toISOString()
      })).sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      return interviews;
    };
    
    const interviews = await fetchFn();
    
    console.log('Traditional Interviews fetched:', interviews.length);
    
    if (CONFIG.CACHE_ENABLED) {
      dataCache.set(cacheKey, interviews);
    }
    
    performance.end('fetch-traditional-interviews');
    return interviews;
  } catch (error) {
    console.error('Error fetching traditional interviews:', error);
    performance.end('fetch-traditional-interviews');
    return [];
  }
}

async function fetchCoursesData(database, userId) {
  performance.start('fetch-courses');
  
  try {
    const cacheKey = `courses_${userId}`;
    if (CONFIG.CACHE_ENABLED) {
      const cached = dataCache.get(cacheKey);
      if (cached) {
        console.log('✅ Loaded courses from cache');
        performance.end('fetch-courses');
        return cached;
      }
    }
    
    // For now, read from localStorage (legacy system)
    // TODO: Migrate to Firebase database
    const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses')) || {};
    const completedCourses = JSON.parse(localStorage.getItem('completedCourses')) || {};
    const courseProgress = JSON.parse(localStorage.getItem('courseProgress')) || {};

    // Convert to array format
    const enrolled = Object.keys(enrolledCourses).map(courseId => ({
      courseId,
      courseName: enrolledCourses[courseId].courseName || courseId,
      courseUrl: enrolledCourses[courseId].courseUrl || '#',
      enrolledDate: enrolledCourses[courseId].enrolledDate || new Date().toISOString()
    }));

    const completed = Object.keys(completedCourses).map(courseId => ({
      courseId,
      courseName: completedCourses[courseId].courseName || courseId,
      completedDate: completedCourses[courseId].completedDate || new Date().toISOString(),
      certificateId: completedCourses[courseId].certificateId || null
    }));

    const coursesData = {
      enrolled,
      completed,
      progress: courseProgress
    };

    console.log('Courses data fetched - Enrolled:', enrolled.length, 'Completed:', completed.length);
    
    if (CONFIG.CACHE_ENABLED) {
      dataCache.set(cacheKey, coursesData);
    }
    
    performance.end('fetch-courses');
    return coursesData;
  } catch (error) {
    console.error('Error fetching courses data:', error);
    performance.end('fetch-courses');
    return { enrolled: [], completed: [], progress: {} };
  }
}

async function fetchCertificates(database, userId) {
  performance.start('fetch-certificates');
  
  try {
    const cacheKey = `certificates_${userId}`;
    if (CONFIG.CACHE_ENABLED) {
      const cached = dataCache.get(cacheKey);
      if (cached) {
        console.log('✅ Loaded certificates from cache');
        performance.end('fetch-certificates');
        return cached;
      }
    }
    
    console.log('Fetching certificates...');
    
    const fetchFn = async () => {
      const pathRef = database.ref(`users/${userId}/certificates`);
      
      const snapshot = await Promise.race([
        pathRef.once('value'),
        new Promise((resolve) => setTimeout(() => resolve({ val: () => null }), 3000))
      ]);
      
      const data = snapshot.val() || {};
      
      console.log('Certificates raw data keys:', Object.keys(data).length);
      
      const certificates = Object.keys(data).map(key => ({
        certificateId: key,
        ...data[key],
        createdAt: data[key].createdAt || data[key].issueDate || data[key].timestamp || new Date().toISOString()
      })).sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      return certificates;
    };
    
    const certificates = await fetchFn();
    
    console.log('Certificates fetched:', certificates.length);
    
    if (CONFIG.CACHE_ENABLED) {
      dataCache.set(cacheKey, certificates);
    }
    
    performance.end('fetch-certificates');
    return certificates;
  } catch (error) {
    console.error('Error fetching certificates:', error);
    performance.end('fetch-certificates');
    return [];
  }
}

// ============================================ 
// RENDERING FUNCTIONS
// ============================================ 

function renderSummaryStats(aiInterviews, traditionalInterviews, coursesData, certificates) {
  // Total interviews
  const totalInterviews = aiInterviews.length + traditionalInterviews.length;
  document.getElementById('total-interviews').textContent = totalInterviews;

  // Completed courses
  document.getElementById('completed-courses').textContent = coursesData.completed.length;

  // Total certificates
  document.getElementById('total-certificates').textContent = certificates.length;

  // Average score (from AI interviews)
  let avgScore = 0;
  if (aiInterviews.length > 0) {
    const totalScore = aiInterviews.reduce((sum, interview) => {
      const score = interview.overallScore || interview.score || 0;
      return sum + score;
    }, 0);
    avgScore = Math.round(totalScore / aiInterviews.length);
  }
  document.getElementById('avg-score').textContent = avgScore + '%';
}

function renderAIInterviews(interviews) {
  const container = document.getElementById('ai-interviews-container');
  
  if (interviews.length === 0) {
    container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No AI interview records found. Take an AI interview to see detailed analytics here.</p>';
    return;
  }

  container.innerHTML = interviews.map((interview, index) => {
    const sessionDate = new Date(interview.timestamp || interview.createdAt || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Extract metrics from new data structure
    const wpm = interview.avgWPM || interview.averageWPM || interview.wpm || 0;
    const overallScore = interview.overallScore ? (interview.overallScore * 100) : 
                         interview.technicalScore || 0;
    const avgTimePerAnswer = interview.avgAnswerTime || interview.averageTimePerAnswer || 0;
    const dominantEmotion = interview.dominantEmotion || 'neutral';
    const questionsAsked = interview.questionsAsked || interview.questions?.length || 0;
    const totalQuestions = interview.totalQuestions || 5;
    const completed = interview.completed !== undefined ? interview.completed : true;
    const topic = interview.topic || 'General';
    const level = interview.level || 'Intermediate';

    // Process emotions for display
    const emotions = {};
    if (interview.expression_list && Array.isArray(interview.expression_list)) {
      interview.expression_list.forEach(emotion => {
        emotions[emotion] = (emotions[emotion] || 0) + 1;
      });
    } else if (interview.emotionSummary) {
      Object.assign(emotions, interview.emotionSummary);
    }

    // Generate feedback
    let feedback = interview.overallFeedback || interview.feedback || '';
    if (!feedback && overallScore) {
      if (overallScore >= 80) {
        feedback = 'Excellent performance! You demonstrated strong technical knowledge and communication skills.';
      } else if (overallScore >= 60) {
        feedback = 'Good job! You showed solid understanding. Focus on providing more detailed examples and improving response clarity.';
      } else {
        feedback = 'Keep practicing! Review the fundamentals and work on structuring your answers using the STAR method.';
      }
    }

    return `
      <div class="interview-card" style="background: white; border: 2px solid ${completed ? '#e0e0e0' : '#ffc107'}; border-radius: 10px; padding: 20px; margin: 15px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h4 style="margin: 0; color: var(--primary);">Interview Session ${interviews.length - index}</h4>
            <span style="font-size: 12px; color: #666; margin-top: 5px; display: inline-block;">
              ${topic} • ${capitalize(level)} ${!completed ? '• ⚠️ Incomplete' : ''}
            </span>
          </div>
          <span style="background: ${overallScore >= 70 ? '#28a745' : overallScore >= 50 ? '#ffc107' : '#dc3545'}; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: 600;">
            Score: ${overallScore.toFixed(1)}%
          </span>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
          👨 ${sessionDate} • 
          <span style="color: ${completed ? '#28a745' : '#ffc107'};">
            ${questionsAsked}/${totalQuestions} Questions ${completed ? 'Completed' : 'Answered'}
          </span>
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">
          <!-- Emotion Detection -->
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
            <h5 style="margin: 0 0 10px; color: #333;">😊 Emotion Analysis</h5>
            ${Object.keys(emotions).length > 0 ? `
              <div style="font-size: 14px;">
                ${Object.entries(emotions)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([emotion, count]) => {
                    const emoji = emotion === 'confident' ? '🦊' : emotion === 'happy' ? '😊' : 
                                  emotion === 'nervous' ? '😥' : emotion === 'sad' ? '😔' : '😐';
                    return 
                      `<div style="margin: 5px 0;">${emoji} <strong>${capitalize(emotion)}:</strong> ${count}x</div>`;
                  }).join('')}
              </div>
              <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd; font-weight: 600; color: var(--primary);">
                Dominant: ${getEmotionEmoji(dominantEmotion)} ${capitalize(dominantEmotion)}
              </div>
            ` : '<div style="color: #888;">No emotion data</div>'}
          </div>

          <!-- WPM -->
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
            <h5 style="margin: 0 0 10px; color: #333;">⚡ Speaking Speed</h5>
            <div style="font-size: 32px; font-weight: 700; color: var(--primary);">${Math.round(wpm)}</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">Words Per Minute</div>
            <div style="font-size: 11px; color: #888; margin-top: 5px;">
              ${wpm < 100 ? '🐀 Slow' : wpm < 140 ? '✅ Good' : '🚀 Fast'}
            </div>
          </div>

          <!-- Technical Knowledge -->
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
            <h5 style="margin: 0 0 10px; color: #333;">🎯 Performance</h5>
            <div style="font-size: 32px; font-weight: 700; color: ${overallScore >= 70 ? '#28a745' : overallScore >= 50 ? '#ffc107' : '#dc3545'};">
              ${overallScore.toFixed(0)}%
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">Overall Score</div>
          </div>

          <!-- Avg Time Per Answer -->
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
            <h5 style="margin: 0 0 10px; color: #333;">⏱️ Response Time</h5>
            <div style="font-size: 32px; font-weight: 700; color: var(--primary);">${avgTimePerAnswer.toFixed(1)}s</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">Avg Per Answer</div>
          </div>
        </div>

        <!-- Feedback -->
        <div style="background: ${overallScore >= 70 ? '#d4edda' : overallScore >= 50 ? '#fff3cd' : '#f8d7da'}; border-left: 4px solid ${overallScore >= 70 ? '#28a745' : overallScore >= 50 ? '#ffc107' : '#dc3545'}; padding: 15px; border-radius: 5px; margin-top: 15px;">
          <h5 style="margin: 0 0 10px; color: ${overallScore >= 70 ? '#155724' : overallScore >= 50 ? '#856404' : '#721c24'};">💬 Overall Feedback</h5>
          <p style="margin: 0; color: ${overallScore >= 70 ? '#155724' : overallScore >= 50 ? '#856404' : '#721c24'}; line-height: 1.6;">${feedback}</p>
        </div>

        ${interview.feedback_list && interview.feedback_list.length > 0 ? `
        <div style="margin-top: 15px;">
          <details>
            <summary style="cursor: pointer; font-weight: 600; padding: 10px; background: #f8f9fa; border-radius: 5px;">
              �췑 Question-by-Question Feedback (${interview.feedback_list.length} answers)
            </summary>
            <div style="max-height: 300px; overflow-y: auto; margin-top: 10px;">
              ${interview.feedback_list.map((fb, i) => {
                const question = interview.questions && interview.questions[i] ? interview.questions[i] : `Question ${i + 1}`;
                const answer = interview.answers && interview.answers[i] ? interview.answers[i] : '';
                const score = interview.score_list && interview.score_list[i] !== undefined ? 
                             (interview.score_list[i] * 100).toFixed(0) : 'N/A';
                const wpmForQ = interview.wpm_list && interview.wpm_list[i] ? 
                               Math.round(interview.wpm_list[i]) : 'N/A';
                
                return (
                  `
                  <div style="background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 3px solid var(--primary);">
                    <div style="font-weight: 600; color: var(--primary); margin-bottom: 8px;">Q${i + 1}: ${question}</div>
                    ${answer ? `<div style="background: white; padding: 10px; border-radius: 3px; margin: 8px 0; font-size: 13px; color: #555;">
                      <strong>Your Answer:</strong> ${answer.substring(0, 150)}${answer.length > 150 ? '...' : ''}
                    </div>` : ''}
                    <div style="display: flex; gap: 15px; margin: 8px 0; font-size: 12px;">
                      <span><strong>Score:</strong> ${score}%</span>
                      <span><strong>WPM:</strong> ${wpmForQ}</span>
                    </div>
                    <div style="font-size: 14px; color: #555; margin-top: 8px;"><strong>Feedback:</strong> ${fb}</div>
                  </div>
                `
                );
              }).join('')}
            </div>
          </details>
        </div>
        ` : ''}

        <div style="margin-top: 15px; text-align: right;">
          <button class="btn" style="font-size: 14px; padding: 8px 20px;" onclick="viewDetailedReport('${interview.sessionId || interview.timestamp}')">
            �첨 View Detailed Report
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Helper functions


function getEmotionEmoji(emotion) {
  const emojis = {
    confident: '🦊',
    happy: '😊',
    sad: '😔',
    neutral: '😐',
    surprised: '😱'
  };
  return emojis[emotion] || '😐';
}

function renderTraditionalInterviews(interviews) {
  const container = document.getElementById('traditional-interviews-container');
  
  if (interviews.length === 0) {
    container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No traditional interview test records found.</p>';
    return;
  }

  container.innerHTML = interviews.map((test, index) => {
    const testDate = new Date(test.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const score = test.score || 0;
    const totalQuestions = test.totalQuestions || 0;
    const correctAnswers = test.correctAnswers || 0;
    const timeSpent = test.timeSpent || 0;

    return (
      `<div class="interview-card" style="background: white; border: 2px solid #e0e0e0; border-radius: 10px; padding: 20px; margin: 15px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h4 style="margin: 0;">Test ${interviews.length - index} - ${test.testName || 'Interview Test'}</h4>
          <span style="background: ${score >= 70 ? '#28a745' : score >= 50 ? '#ffc107' : '#dc3545'}; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: 600;">
            ${score}%
          </span>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 15px;">📅 ${testDate}</p>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
          <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: 700; color: var(--primary);">${correctAnswers}/${totalQuestions}</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">Correct Answers</div>
          </div>
          <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: 700; color: var(--primary);">${score}%</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">Score</div>
          </div>
          <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: 700; color: var(--primary);">${timeSpent}m</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">Time Spent</div>
          </div>
        </div>

        ${test.feedback ? `
        <div style="background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; border-radius: 5px; margin-top: 15px;">
          <h5 style="margin: 0 0 10px; color: #0c5460;">💬 Feedback</h5>
          <p style="margin: 0; color: #0c5460;">${test.feedback}</p>
        </div>
        ` : ''}
      </div>
    `
    );
  }).join('');
}

function renderCourseProgress(coursesData) {
  const completedContainer = document.getElementById('completed-courses-list');
  const inProgressContainer = document.getElementById('inprogress-courses-list');

  // Completed Courses
  if (coursesData.completed.length === 0) {
    completedContainer.innerHTML = '<p style="color: #888; padding: 10px;">No completed courses yet.</p>';
  } else {
    completedContainer.innerHTML = (
      `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">
        ${coursesData.completed.map(course => (
          `
          <div style="background: #d4edda; border: 2px solid #28a745; border-radius: 8px; padding: 15px;">
            <h5 style="margin: 0 0 10px; color: #155724;">🌱 ${course.courseName || course.courseId}</h5>
            <div style="font-size: 14px; color: #155724;">
              <div style="margin: 5px 0;">✅ Status: Completed</div>
              ${course.completedDate ? `<div style="margin: 5px 0;">📅 ${new Date(course.completedDate).toLocaleDateString()}</div>` : ''}
              ${course.certificateId ? `<div style="margin: 5px 0;">🏆 Certificate: ${course.certificateId}</div>` : ''}
            </div>
          </div>
        `
        )).join('')}
      </div>
    `
    );
  }

  // In Progress Courses
  const inProgress = coursesData.enrolled.filter(course => 
    !coursesData.completed.some(c => c.courseId === course.courseId)
  );

  if (inProgress.length === 0) {
    inProgressContainer.innerHTML = '<p style="color: #888; padding: 10px;">No courses in progress.</p>';
  } else {
    inProgressContainer.innerHTML = (
      `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">
        ${inProgress.map(course => {
          const progress = coursesData.progress[course.courseId] || 0;
          return (
            `
            <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 15px;">
              <h5 style="margin: 0 0 10px; color: #856404;">📚 ${course.courseName || course.courseId}</h5>
              <div style="font-size: 14px; color: #856404;">
                <div style="margin: 5px 0;">⏳ Status: In Progress</div>
                ${course.enrolledDate ? `<div style="margin: 5px 0;">📅 Enrolled: ${new Date(course.enrolledDate).toLocaleDateString()}</div>` : ''}
                <div style="margin: 10px 0;">
                  <div style="background: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); height: 100%; width: ${progress}%; transition: width 0.3s ease;"></div>
                  </div>
                  <div style="text-align: right; margin-top: 5px; font-weight: 600;">${progress}% Complete</div>
                </div>
              </div>
            </div>
          `
          );
        }).join('')}
      </div>
    `
    );
  }
}

function renderCertificates(certificates) {
  const container = document.getElementById('certificates-container');
  
  if (certificates.length === 0) {
    container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No certificates earned yet. Complete courses to earn certificates!</p>';
    return;
  }

  container.innerHTML = (
    `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px;">
      ${certificates.map(cert => {
        const issueDate = new Date(cert.createdAt || cert.issueDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        return (
          `
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; padding: 20px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -20px; right: -20px; font-size: 100px; opacity: 0.1;">🎖️</div>
            <h4 style="margin: 0 0 10px; position: relative; z-index: 1;">${cert.courseName}</h4>
            <div style="position: relative; z-index: 1; font-size: 14px; opacity: 0.9;">
              <div style="margin: 8px 0;">💾 ID: ${cert.certificateId}</div>
              <div style="margin: 8px 0;">📅 Issued: ${issueDate}</div>
              <div style="margin: 8px 0;">✅ Status: Verified</div>
            </div>
            <div style="margin-top: 15px; position: relative; z-index: 1;">
              <a href="../../certificate.html?certId=${cert.certificateId}" target="_blank" 
                 style="display: inline-block; background: white; color: var(--primary); padding: 8px 20px; border-radius: 20px; text-decoration: none; font-weight: 600; font-size: 14px;">
                View Certificate
              </a>
            </div>
          </div>
        `
        );
      }).join('')}
    </div>
  `
  );
}

function renderOverallFeedback(aiInterviews, traditionalInterviews, coursesData) {
  const container = document.getElementById('overall-feedback');

  // Calculate overall metrics
  const totalInterviews = aiInterviews.length + traditionalInterviews.length;
  const avgAIScore = aiInterviews.length > 0 
    ? Math.round(aiInterviews.reduce((sum, i) => sum + (i.overallScore || i.score || 0), 0) / aiInterviews.length)
    : 0;
  const avgTraditionalScore = traditionalInterviews.length > 0
    ? Math.round(traditionalInterviews.reduce((sum, i) => sum + (i.score || 0), 0) / traditionalInterviews.length)
    : 0;
  const completionRate = coursesData.enrolled.length > 0
    ? Math.round((coursesData.completed.length / coursesData.enrolled.length) * 100)
    : 0;

  // Generate recommendations
  let recommendations = [];
  
  if (avgAIScore < 60) {
    recommendations.push('📚 Focus on improving technical knowledge by completing more courses and practicing coding problems.');
  }
  if (aiInterviews.some(i => (i.averageWPM || 0) < 100)) {
    recommendations.push('⚡ Work on improving communication speed. Practice speaking clearly and concisely.');
  }
  if (completionRate < 80) {
    recommendations.push('🎯 Complete enrolled courses to strengthen your foundation.');
  }
  if (avgAIScore >= 80 && avgTraditionalScore >= 80) {
    recommendations.push('🌟 Excellent performance! Keep up the great work and consider mentoring others.');
  }
  if (coursesData.completed.length >= 5) {
    recommendations.push('🏆 Great progress on courses! Consider applying your knowledge in real projects.');
  }

  container.innerHTML = (
    `
    <div style="margin-bottom: 20px;">
      <h4 style="margin: 0 0 15px;">�첨 Performance Summary</h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
        <div>
          <div style="font-size: 14px; color: #666;">Total Interviews</div>
          <div style="font-size: 24px; font-weight: 700; color: var(--primary);">${totalInterviews}</div>
        </div>
        <div>
          <div style="font-size: 14px; color: #666;">AI Interview Avg</div>
          <div style="font-size: 24px; font-weight: 700; color: ${avgAIScore >= 70 ? '#28a745' : avgAIScore >= 50 ? '#ffc107' : '#dc3545'};">${avgAIScore}%</div>
        </div>
        ${traditionalInterviews.length > 0 ? (
        `
        <div>
          <div style="font-size: 14px; color: #666;">Test Avg</div>
          <div style="font-size: 24px; font-weight: 700; color: ${avgTraditionalScore >= 70 ? '#28a745' : avgTraditionalScore >= 50 ? '#ffc107' : '#dc3545'};">${avgTraditionalScore}%</div>
        </div>
        `
        ) : ''}
        <div>
          <div style="font-size: 14px; color: #666;">Course Completion</div>
          <div style="font-size: 24px; font-weight: 700; color: ${completionRate >= 80 ? '#28a745' : completionRate >= 50 ? '#ffc107' : '#dc3545'};">${completionRate}%</div>
        </div>
      </div>
    </div>

    <div>
      <h4 style="margin: 0 0 15px;">💡 Recommendations</h4>
      ${recommendations.length > 0 
        ? recommendations.map(rec => `<div style="padding: 10px; background: white; border-left: 4px solid var(--primary); margin: 10px 0; border-radius: 4px;">${rec}</div>`).join('')
        : '<p style="padding: 10px; background: white; border-radius: 4px;">Keep practicing and learning! Take more interviews to get personalized recommendations.</p>'}
    </div>
  `
  );
}

function renderAITutor(tutor, aiInterviews, coursesData) {
  const container = document.getElementById('ai-tutor-container');
  if (!container) return;

  const tutorInfo = tutor.getTutorInfo('cs');
  let recommendations = [];

  // Analyze AI interviews for weak spots
  if (aiInterviews.length > 0) {
    const lowScoreInterviews = aiInterviews.filter(i => (i.overallScore || 0) < 0.7);
    if (lowScoreInterviews.length > 0) {
      const weakTopics = [...new Set(lowScoreInterviews.map(i => i.topic || 'General'))];
      weakTopics.forEach(topic => {
        recommendations.push({
          type: 'interview',
          title: `Practice Topic: ${topic}`,
          description: `Your scores in '${topic}' interviews are lower. Let's work on that!`,
          action: () => tutor.suggestResources(topic, 'cs')
        });
      });
    }

    const lowWpmInterviews = aiInterviews.filter(i => (i.avgWPM || 150) < 120);
    if (lowWpmInterviews.length > 0) {
      recommendations.push({
        type: 'communication',
        title: 'Improve Speaking Pace',
        description: 'Your speaking pace is a bit slow. Let\'s practice speaking more fluently.',
        action: () => tutor.provideHint('General communication speed')
      });
    }
  }

  // Analyze course progress
  const inProgressCourses = coursesData.enrolled.filter(enrolled => !coursesData.completed.some(c => c.courseId === enrolled.courseId));
  if (inProgressCourses.length > 0) {
    const oldestInProgress = inProgressCourses[0];
    recommendations.push({
      type: 'course',
      title: `Complete Course: ${oldestInProgress.courseName}`,
      description: 'Finishing this course will strengthen your fundamentals.',
      action: () => window.open(oldestInProgress.courseUrl || '#', '_blank')
    });
  }

  container.innerHTML = (
    `
    <div class="tutor-card" style="background: linear-gradient(135deg, #1a2980, #26d0ce); color: white; border-radius: 10px; padding: 25px; display: flex; gap: 20px; align-items: center;">
      <div style="font-size: 60px;">${tutorInfo.icon}</div>
      <div>
        <h4 style="margin: 0 0 10px;">Your AI Tutor: ${tutorInfo.name}</h4>
        <p style="margin: 0; font-style: italic; opacity: 0.9;">"${tutorInfo.greeting}"</p>
      </div>
    </div>
    <div style="margin-top: 20px;">
      <h5 style="margin-bottom: 15px;">Personalized Suggestions</h5>
      ${recommendations.length > 0 ? recommendations.slice(0, 3).map(rec => (
        `
        <div class="tutor-recommendation" style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #26d0ce; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 600;">${rec.title}</div>
            <div style="font-size: 14px; color: #666;">${rec.description}</div>
          </div>
          <button class="btn" style="padding: 6px 12px; font-size: 12px;" onclick="handleTutorAction('${rec.title}')">View Hint</button>
        </div>
      `).join('') : '<p style="color: #888; text-align: center; padding: 20px;">No specific recommendations right now. Keep up the great work!</p>'}
    </div>
  `
  );

  window.handleTutorAction = (title) => {
    const recommendation = recommendations.find(r => r.title === title);
    if (recommendation && recommendation.action) {
      const result = recommendation.action();
      alert(`AI Tutor says:\n\n${result.message || result.encouragement}`);
    }
  };
}

// ============================================ 
// UTILITY FUNCTIONS
// ============================================ 

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}



async function exportReportPDF() {
  try {
    const exportBtn = event?.target;
    if (exportBtn) {
      exportBtn.disabled = true;
      exportBtn.textContent = '⏳ Generating PDF...';
    }
    
    const element = document.getElementById('report-content');
    const opt = {
      margin: 10,
      filename: `CS_Report_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    await html2pdf().set(opt).from(element).save();
    
    if (exportBtn) {
      exportBtn.disabled = false;
      exportBtn.textContent = '📥 Export as PDF';
    }
  } catch (error) {
    console.error('PDF export failed:', error);
    alert('Failed to export PDF. Please try again.');
  }
}

function printReport() {
  window.print();
}

// Advanced: Refresh data and clear cache
async function refreshReportData() {
  if (confirm('This will reload all report data. Continue?')) {
    dataCache.clear();
    localStorage.removeItem('report_cache_timestamp');
    location.reload();
  }
}

// Advanced: Calculate performance trends
function calculateTrends(interviews) {
  if (interviews.length < 2) return null;
  
  const scores = interviews.map(i => i.overallScore || i.score || 0);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  // Calculate trend (improving/declining/stable)
  const recentScores = scores.slice(0, Math.min(3, scores.length));
  const olderScores = scores.slice(0, Math.min(3, scores.length));
  
  if (olderScores.length === 0) return 'insufficient-data';
  
  const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  const olderAvg = olderScores.length > 0 ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length : 0;
  
  const diff = recentAvg - olderAvg;
  
  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
}

// Advanced: Generate personalized insights
function generateInsights(aiInterviews, traditionalInterviews, coursesData) {
  const insights = [];
  
  // Analyze interview frequency
  if (aiInterviews.length + traditionalInterviews.length === 0) {
    insights.push({
      type: 'warning',
      title: 'Start Your Journey',
      message: 'You haven\'t taken any interviews yet. Start with an AI interview to get personalized feedback!'
    });
  }
  
  // Analyze performance trend
  const trend = calculateTrends(aiInterviews);
  if (trend === 'improving') {
    insights.push({
      type: 'success',
      title: 'Great Progress!',
      message: 'Your interview scores are improving. Keep up the excellent work!'
    });
  }
  
  // Analyze course completion
  const completionRate = coursesData.completed.length / 
    (coursesData.enrolled.length + coursesData.completed.length) * 100;
  
  if (completionRate < 30 && coursesData.enrolled.length > 0) {
    insights.push({
      type: 'info',
      title: 'Course Completion',
      message: 'You have several courses in progress. Focus on completing them to earn certificates!'
    });
  }
  
  // Analyze WPM if available
  const wpmScores = aiInterviews
    .filter(i => i.wpm)
    .map(i => i.wpm);
  
  if (wpmScores.length > 0) {
    const avgWPM = wpmScores.reduce((a, b) => a + b, 0) / wpmScores.length;
    if (avgWPM < 30) {
      insights.push({
        type: 'tip',
        title: 'Communication Speed',
        message: 'Practice speaking more fluently. Aim for 40-50 words per minute for better communication.'
      });
    }
  }
  
  return insights;
}

// Performance monitoring summary
function logPerformanceSummary() {
  const totalTime = performance.end('total-load');
  console.log('📊 Performance Summary:');
  console.log(`   Total Load Time: ${totalTime}ms`);
  console.log(`   Cache Hit Rate: ${dataCache.data ? Object.keys(dataCache.data).length : 0} items`);
  console.log(`   Config: Cache ${CONFIG.CACHE_ENABLED ? 'ON' : 'OFF'}, Timeout ${CONFIG.FETCH_TIMEOUT}ms`);
}

// View detailed report for a specific session
function viewDetailedReport(sessionId) {
  // Store sessionId in localStorage for the detail page
  localStorage.setItem('selected_interview_session', sessionId);
  
  // For now, show an alert with the session details
  // In production, this would navigate to a detailed report page
  alert(`View detailed report for session: ${sessionId}\n\nThis feature will show:\n- Complete Q&A transcript\n- Detailed emotion timeline\n- WPM per question\n- Score breakdown\n- Improvement suggestions`);
  
  // Future: window.location.href = `ai-report-detail.html?session=${sessionId}`;
}
