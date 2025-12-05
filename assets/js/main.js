/* SmartMock main JS */

let youtubeApiReady = new Promise(resolve => {
  window.onYouTubeIframeAPIReady = () => resolve();
});

function getCurrentPath() {
  try { return window.location.pathname.split('/').pop().toLowerCase(); } catch { return ''; }
}

function getPathPrefix() {
  try {
    const path = window.location.pathname;
    return path.includes('/interview/') ? '../../' : '';
  } catch { return ''; }
}

function navigateTo(path) {
  const prefix = getPathPrefix();
  window.location.href = prefix + path;
}

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('smartmock_current_user') || 'null'); } catch { return null; }
}

function setCurrentUser(user) {
  localStorage.setItem('smartmock_current_user', JSON.stringify(user));
}

function generateCertificateId(courseName) {
  // Extract initials from course name
  const words = courseName.split(' ').filter(w => w.length > 0);
  const initials = words.map(w => w[0].toUpperCase()).join('').slice(0, 4);
  
  // Get current year
  const year = new Date().getFullYear();
  
  // Generate random code (6 characters: letters and numbers)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Format: SM-YEAR-INITIALS-CODE
  return `SM-${year}-${initials}-${code}`;
}

// Safe accessors for Firebase services
function getAuthSvc() {
  if (window.auth) return window.auth;
  if (typeof firebase !== 'undefined' && firebase.auth) return firebase.auth();
  console.warn('Auth service not ready yet');
  return null;
}

function getDbSvc() {
  if (window.database) return window.database;
  if (typeof firebase !== 'undefined' && firebase.database) return firebase.database();
  console.warn('Database service not ready yet');
  return null;
}

function signOut() {
  const a = getAuthSvc();
  if (!a) return console.error('Cannot sign out: Auth not initialized');
  a.signOut().then(() => {
    navigateTo('index.html');
  }).catch((error) => {
    console.error('Sign out error', error);
  });
}

// Ensure consistent header/navigation across pages (home-style)
function buildGlobalHeader() {
  // Skip header injection on login/signup pages
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const authPages = ['index.html', 'login.html', 'signup.html', 'register.html', 'loading.html'];
  if (authPages.includes(currentPage)) {
    console.log('⏭️ Skipping header on auth page:', currentPage);
    return;
  }

  // If already has site-header, do nothing
  if (document.querySelector('.site-header')) return;

  // Remove legacy simple nav if present to avoid duplicates (EXCEPT dropdown)
  const legacyNavs = document.querySelectorAll('nav.menu.menu-left');
  legacyNavs.forEach(nav => {
    // Keep dropdown for reuse
    const dropdown = nav.querySelector('.dropdown');
    if (dropdown) {
      dropdown.remove(); // Temporarily remove to preserve it
      nav.remove();
      // We'll use existing dropdown in handleMenu instead of creating new one
    } else {
      nav.remove();
    }
  });

  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <div class="site-header-inner container">
      <nav class="menu menu-left">
        <div class="menu-button" style="cursor: pointer; user-select: none;">☰ Menu</div>
        <ul class="dropdown">
          <li><a href="home.html">🏠 Home</a></li>
          <li><a href="dashboard.html">📊 Dashboard</a></li>
          <li class="has-submenu"><a href="interview.html">🎯 Interviews</a>
            <ul class="submenu">
              <li><a href="interview/cs/ai-interview.html">AI Interview (CS)</a></li>
              <li><a href="interview/ee/ai-interview.html">AI Interview (EE)</a></li>
              <li><a href="interview/me/ai-interview.html">AI Interview (ME)</a></li>
              <li><a href="interview/ce/ai-interview.html">AI Interview (CE)</a></li>
              <li><a href="interview/ec/ai-interview.html">AI Interview (EC)</a></li>
            </ul>
          </li>
          <li><a href="resume-builder.html">📄 Resume Builder</a></li>
          <li><a href="study-groups.html">👥 Study Groups</a></li>
          <li><a href="peer-review.html">⭐ Peer Review</a></li>
          <li><a href="portfolio.html">🎓 Portfolio</a></li>
          <li><a href="analytics.html">📈 Analytics</a></li>
          <li><a href="career-services.html">💼 Career Services</a></li>
          <li><a href="leaderboard.html">🏆 Leaderboard</a></li>
          <li><a href="community.html">💬 Community</a></li>
          <li><a href="about.html">ℹ️ About</a></li>
          <li><a href="report.html">📋 Report</a></li>
          <li><a href="verify-certificate.html">🔍 Verify Certificate</a></li>
          <li><a href="certificate.html">🎖️ Certificate</a></li>
          <li><a href="contact.html">📞 Contact Us</a></li>
          <li><a href="recruiter/dashboard.html">👔 Recruiter Dashboard</a></li>
        </ul>
      </nav>
      <div class="brand"><a href="home.html"><span class="logo">Smart</span><span class="logo-accent">Mock</span></a></div>
      <div class="menu" style="margin-left:auto;">
        <a class="btn" href="profile.html">Profile</a>
        <a class="btn" href="#" onclick="signOut(); return false;">Sign out</a>
      </div>
    </div>`;

  // Insert at top of body
  document.body.insertBefore(header, document.body.firstChild);
}


function handleAuthForms() {
  const loginForm = document.querySelector('#login-form');
  const signupForm = document.querySelector('#signup-form');
  const loginTab = document.querySelector('[data-tab="login"]');
  const signupTab = document.querySelector('[data-tab="signup"]');

  function activate(tab) {
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.form').forEach(el => el.classList.remove('active'));
    if (tab === 'login') {
      loginTab?.classList.add('active');
      loginForm?.classList.add('active');
    } else {
      signupTab?.classList.add('active');
      signupForm?.classList.add('active');
    }
  }

  loginTab?.addEventListener('click', () => activate('login'));
  signupTab?.addEventListener('click', () => activate('signup'));
  // default
  if (signupForm) activate('login');

  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('input[name="email"]').value.trim();
    const password = loginForm.querySelector('input[name="password"]').value.trim();
    if (!email || !password) return alert('Please enter email and password');
    
  const a = getAuthSvc();
  if (!a) return console.error('Login failed: Auth not initialized');
  a.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Redirect to intended page or dashboard
        const redirectUrl = localStorage.getItem('redirect_url');
        localStorage.removeItem('redirect_url');
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          navigateTo('dashboard.html');
        }
      })
      .catch((error) => {
        alert(error.message);
      });
  });

  signupForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = signupForm.querySelector('input[name="name"]').value.trim();
    const email = signupForm.querySelector('input[name="email"]').value.trim();
    const password = signupForm.querySelector('input[name="password"]').value.trim();
    if (!name || !email || !password) return alert('Please fill all fields');
    
  const a = getAuthSvc();
  if (!a) return console.error('Signup failed: Auth not initialized');
  a.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
  const db = getDbSvc();
  if (!db) throw new Error('Database not initialized');
  db.ref('users/' + user.uid).set({
          name: name,
          email: email
        });
        navigateTo('dashboard.html');
      })
      .catch((error) => {
        alert(error.message);
      });
  });
}

function initLoadingPage() {
  const current = getCurrentPath();
  if (current !== 'loading.html') return;
  setTimeout(() => { navigateTo('dashboard.html'); }, 2200);
}

function enhanceInterviewPage() {
  const current = getCurrentPath();
  if (current !== 'interview.html') return;
  // If hash present, smooth scroll into view
  if (location.hash) {
    const el = document.querySelector(location.hash);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Make discipline cards clickable to navigate to their respective pages
  const addCardNav = (id, path) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => navigateTo(path));
    // Prevent nested links (if any) from triggering the card click
    el.querySelectorAll('a').forEach(a => a.addEventListener('click', e => e.stopPropagation()));
  };

  // Computer Science
  addCardNav('cs-courses', 'interview/cs/courses.html');
  addCardNav('cs-interview', 'interview/cs/interview.html');
  addCardNav('cs-ai-interview', 'interview/cs/ai-interview.html');
  addCardNav('cs-prep', 'interview/cs/preparation.html');
  addCardNav('cs-report', 'interview/cs/report.html');

  // Electrical
  addCardNav('ee-courses', 'interview/ee/courses.html');
  addCardNav('ee-interview', 'interview/ee/interview.html');
  addCardNav('ee-prep', 'interview/ee/preparation.html');
  addCardNav('ee-report', 'interview/ee/report.html');

  // Mechanical
  addCardNav('me-courses', 'interview/me/courses.html');
  addCardNav('me-interview', 'interview/me/interview.html');
  addCardNav('me-prep', 'interview/me/preparation.html');
  addCardNav('me-report', 'interview/me/report.html');

  // Civil
  addCardNav('ce-courses', 'interview/ce/courses.html');
  addCardNav('ce-interview', 'interview/ce/interview.html');
  addCardNav('ce-prep', 'interview/ce/preparation.html');
  addCardNav('ce-report', 'interview/ce/report.html');

  // Electronic Communication
  addCardNav('ec-courses', 'interview/ec/courses.html');
  addCardNav('ec-interview', 'interview/ec/interview.html');
  addCardNav('ec-prep', 'interview/ec/preparation.html');
  addCardNav('ec-report', 'interview/ec/report.html');
}

async function handleCoursesPage() {
  await youtubeApiReady;
  const current = getCurrentPath();
  if (!current.endsWith('courses.html')) return;

  // Certificate Generation Logic
  try {
    const courseCards = document.querySelectorAll('.video-card');
    const user = getCurrentUser();
    const studentName = user ? user.name : 'Jane Doe';

    // Load completion status from localStorage
    const completedCourses = JSON.parse(localStorage.getItem('completedCourses')) || {};
    const courseProgress = JSON.parse(localStorage.getItem('courseProgress')) || {};
    const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses')) || {};

    // Build a list of courseIds present on this page to compute page progress accurately
    const pageCourseIds = Array.from(courseCards).map(c => c.dataset.courseId).filter(Boolean);

    const computePageProgress = () => {
      const completedOnPage = pageCourseIds.filter(id => completedCourses[id]).length;
      if (pageCourseIds.length === 0) return 0;
      return Math.round((completedOnPage / pageCourseIds.length) * 100);
    };

    // Initialize a page-level progress bar (if present per card we'll still update it as before)
    courseCards.forEach(card => {
      const courseId = card.dataset.courseId;
      const courseName = card.dataset.courseName;
      const checkbox = card.querySelector('.completion-checkbox');
      const certBtn = card.querySelector('.cert-btn');
      const enrollBtn = card.querySelector('.enroll-btn');
      const progressBar = card.querySelector('.progress-bar');
      const videoIframe = card.querySelector('iframe');

      // Initialize YouTube Player
      let player;
      if (videoIframe) {
        const videoUrl = videoIframe.src;
        const videoId = videoUrl.split('/').pop().split('?')[0];
        const playerDiv = document.createElement('div');
        playerDiv.id = `player-${courseId}`;
        videoIframe.parentNode.replaceChild(playerDiv, videoIframe);

        player = new YT.Player(playerDiv.id, {
          videoId: videoId,
          events: {
            'onStateChange': (event) => {
              if (event.data === YT.PlayerState.ENDED) {
                // Video ended, mark as complete
                if (checkbox && !checkbox.checked) {
                  checkbox.checked = true;
                  checkbox.dispatchEvent(new Event('change'));
                }
              }
            }
          }
        });
      }

      // Set initial state for enrollment
      if (enrolledCourses[courseId]) {
        if (enrollBtn) {
          enrollBtn.textContent = 'Enrolled';
          enrollBtn.disabled = true;
        }
      } else {
        if (enrollBtn) {
          enrollBtn.addEventListener('click', () => {
            enrolledCourses[courseId] = { courseName: courseName, courseUrl: current };
            localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
            enrollBtn.textContent = 'Enrolled';
            enrollBtn.disabled = true;
            alert(`${courseName} enrolled!`);
          });
        }
      }

      if (!checkbox || !certBtn) return;

      // Set initial state for completion
      if (completedCourses[courseId]) {
        checkbox.checked = true;
        // Don't automatically show; gating will be handled on click based on progress and enrollment
        certBtn.style.display = 'inline-block';
      }

      // Update progress bar (per card progress bar represents overall page progress)
      if (progressBar) {
        const progress = computePageProgress();
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', String(progress));
      }

      // Handle checkbox change
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          completedCourses[courseId] = true;
          certBtn.style.display = 'inline-block';
        }
        else {
          delete completedCourses[courseId];
          certBtn.style.display = 'none';
        }
        localStorage.setItem('completedCourses', JSON.stringify(completedCourses));

        // Update progress bar after change
        if (progressBar) {
          const progress = computePageProgress();
          progressBar.style.width = `${progress}%`;
          progressBar.setAttribute('aria-valuenow', String(progress));
        }
      });

      // Setup certificate button link with gating (Enrollment + >=80% progress)
      certBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Must be enrolled first
        if (!enrolledCourses[courseId]) {
          alert('Please enroll in this course before generating the certificate.');
          return;
        }

        // Must reach at least 80% overall progress on this course page
        const pageProgress = computePageProgress();
        if (pageProgress < 80) {
          alert(`Complete at least 80% of the course to unlock the certificate. Current progress: ${pageProgress}%.`);
          return;
        }

        if (checkbox.checked) {
          // Generate certificate ID
          const certId = generateCertificateId(courseName);
          
          // Store certificate data
          const certificateData = {
            certificateId: certId,
            studentName: studentName,
            courseName: courseName,
            issueDate: new Date().toISOString()
          };
          
          // Send to Firebase
          const user = getAuthSvc()?.currentUser;
          if (user) {
            const uid = user.uid;
            const updates = {};
            updates['/certificates/' + certId] = certificateData;
            updates['/users/' + uid + '/certificates/' + certId] = certificateData;

            const db = getDbSvc();
            if (!db) throw new Error('Database not initialized');
            db.ref().update(updates)
              .then(() => {
                console.log('Certificate saved to Firebase');
              })
              .catch(error => {
                console.error('Error saving certificate to Firebase:', error);
              });
          } else {
            // Save publicly if user is not logged in
            const db2 = getDbSvc();
            if (!db2) throw new Error('Database not initialized');
            db2.ref('certificates/' + certId).set(certificateData)
              .then(() => {
                console.log('Certificate saved publicly to Firebase');
              })
              .catch(error => {
                console.error('Error saving certificate publicly to Firebase:', error);
              });
          }
          
          // Navigate to certificate page with ID
          const url = `${getPathPrefix()}certificate.html?student=${encodeURIComponent(studentName)}&course=${encodeURIComponent(courseName)}&certId=${certId}`;
          window.location.href = url;
        }
      });
    });
  } catch (error) {
    console.error('Error with certificate logic:', error);
  }

  // Initialize CodeMirror
  try {
    const codeEditor = document.getElementById('codeEditor');
    if (!codeEditor) return;

    let editor = CodeMirror.fromTextArea(codeEditor, {
      mode: 'text/x-python',
      theme: 'monokai',
      lineNumbers: true,
      autoCloseBrackets: true,
      matchBrackets: true,
      indentUnit: 4,
      tabSize: 4,
      lineWrapping: true,
      extraKeys: {
        'Tab': function(cm) {
          cm.replaceSelection('    ', 'end');
        }
      }
    });

    // Language examples
    const examples = {
      python: `# Python Example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Test the function
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")

print("\nHello, World!")`,
      
      javascript: `// JavaScript Example
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

// Test the function
for (let i = 0; i < 10; i++) {
    console.log("F(" + i + ") = " + fibonacci(i));
}

console.log("Hello, World!");`,
      
      c: `// C Example
#include <stdio.h>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

int main() {
    for (int i = 0; i < 10; i++) {
        printf("F(%d) = %d\\n", i, fibonacci(i));
    }
    printf("\\nHello, World!\\n");
    return 0;
}`,
      
      cpp: `// C++ Example
#include <iostream>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

int main() {
    for (int i = 0; i < 10; i++) {
        std::cout << "F(" << i << ") = " << fibonacci(i) << std::endl;
    }
    std::cout << "\\nHello, World!" << std::endl;
    return 0;
}`,
      
      java: `// Java Example
public class Main {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n-1) + fibonacci(n-2);
    }

    public static void main(String[] args) {
        for (int i = 0; i < 10; i++) {
            System.out.println("F(" + i + ") = " + fibonacci(i));
        }
        System.out.println("\\nHello, World!");
    }
}`
    };

    const langSelector = document.getElementById('languageSelect');
    const runBtn = document.getElementById('runBtn');
    const clearBtn = document.getElementById('clearBtn');
    const exampleBtn = document.getElementById('exampleBtn');
    const outputContent = document.getElementById('outputContent');

    if (!langSelector || !runBtn || !clearBtn || !exampleBtn || !outputContent) {
      console.error('One or more code compiler elements not found');
      return;
    }

    // Map language names to CodeMirror mode identifiers
    const modeMap = {
      'python': 'text/x-python',
      'javascript': 'text/javascript',
      'java': 'text/x-java',
      'cpp': 'text/x-c++src',
      'c': 'text/x-csrc',
      'csharp': 'text/x-csharp',
      'php': 'application/x-httpd-php',
      'ruby': 'text/x-ruby',
      'go': 'text/x-go',
      'rust': 'text/x-rustsrc',
      'swift': 'text/x-swift',
      'typescript': 'application/typescript',
      'kotlin': 'text/x-kotlin',
      'scala': 'text/x-scala',
      'r': 'text/x-rsrc',
      'perl': 'text/x-perl',
      'lua': 'text/x-lua',
      'dart': 'application/dart'
    };

    const updateEditor = (lang) => {
      editor.setValue(examples[lang] || '');
      editor.setOption('mode', modeMap[lang] || 'text/x-python');
    };

    langSelector.addEventListener('change', () => updateEditor(langSelector.value));

    runBtn.addEventListener('click', async () => {
      const code = editor.getValue();
      const lang = langSelector.value;
      const startTime = performance.now();
      
      // Show loading state
      runBtn.disabled = true;
      runBtn.textContent = '⏳ Running...';
      outputContent.textContent = '⏳ Executing code...';
      
      try {
        const output = await executeCode(code, lang);
        const endTime = performance.now();
        const executionTime = ((endTime - startTime) / 1000).toFixed(2);
        
        outputContent.textContent = output;
        outputContent.style.whiteSpace = 'pre-wrap';
        outputContent.style.fontFamily = "'Fira Code', 'Courier New', monospace";
        
        // Update execution time display
        const timeDisplay = document.getElementById('executionTime');
        if (timeDisplay) {
          timeDisplay.textContent = `Execution time: ${executionTime}s`;
        }
      } catch (error) {
        outputContent.textContent = `Error: ${error.message}`;
      } finally {
        runBtn.disabled = false;
        runBtn.textContent = '▶ Run Code';
      }
    });

    clearBtn.addEventListener('click', () => {
        editor.setValue('');
    });

    exampleBtn.addEventListener('click', () => {
        updateEditor(langSelector.value);
    });

    // Initial setup
    updateEditor('python');

    async function executeCode(code, lang) {
      if (!code.trim()) {
        return '// No code to execute. Write some code and click "Run Code".';
      }
      
      // Map language names to Piston API language identifiers
      const langMap = {
        'python': 'python',
        'javascript': 'javascript',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'csharp': 'csharp',
        'php': 'php',
        'ruby': 'ruby',
        'go': 'go',
        'rust': 'rust',
        'swift': 'swift',
        'typescript': 'typescript',
        'kotlin': 'kotlin',
        'scala': 'scala',
        'r': 'r',
        'perl': 'perl',
        'lua': 'lua',
        'dart': 'dart'
      };
      
      const pistonLang = langMap[lang] || 'python';
      
      try {
        // Show loading indicator
        outputContent.textContent = '⏳ Executing code...';
        
        // Use Piston API for code execution (free, open-source)
        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            language: pistonLang,
            version: '*', // Use latest version
            files: [{
              name: `main.${getFileExtension(lang)}`,
              content: code
            }]
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Handle the response
        let output = '';
        
        if (result.run) {
          // Combine stdout and stderr
          if (result.run.stdout) {
            output += result.run.stdout;
          }
          if (result.run.stderr) {
            output += (output ? '\n\n' : '') + '=== Errors/Warnings ===\n' + result.run.stderr;
          }
          
          // Show exit code if non-zero
          if (result.run.code !== 0) {
            output += `\n\n=== Exit Code: ${result.run.code} ===`;
          }
          
          if (!output.trim()) {
            output = '// Code executed successfully. No output produced.';
          }
        } else if (result.compile && result.compile.output) {
          // Compilation error
          output = '=== Compilation Error ===\n' + result.compile.output;
        } else {
          output = '// Code executed but produced no output.';
        }
        
        return output;
        
      } catch (error) {
        // Fallback: Execute JavaScript locally if API fails
        if (lang === 'javascript') {
          try {
            const originalLog = console.log;
            const logs = [];
            console.log = (...args) => { 
              logs.push(args.map(arg => {
                if (typeof arg === 'object') {
                  try {
                    return JSON.stringify(arg, null, 2);
                  } catch (e) {
                    return String(arg);
                  }
                }
                return String(arg);
              }).join(' '));
            };
            
            eval(code);
            console.log = originalLog;
            return logs.length > 0 ? logs.join('\n') : '// Code executed successfully. No output produced.';
            
          } catch (execError) {
            return `Error: ${execError.message}\n\nStack Trace:\n${execError.stack}`;
          }
        }
        
        // Show error with helpful message
        return `❌ Execution Error: ${error.message}

Note: The online code execution service may be temporarily unavailable.

Alternative options:
1. Try again in a moment
2. Use local IDE or online compiler:
   • Replit: https://replit.com
   • JDoodle: https://www.jdoodle.com
   • OnlineGDB: https://www.onlinegdb.com

For JavaScript, the browser can execute it directly even if the API fails.`;
      }
    }
    
    // Helper function to get file extension for each language
    function getFileExtension(lang) {
      const extensions = {
        'python': 'py',
        'javascript': 'js',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'csharp': 'cs',
        'php': 'php',
        'ruby': 'rb',
        'go': 'go',
        'rust': 'rs',
        'swift': 'swift',
        'typescript': 'ts',
        'kotlin': 'kt',
        'scala': 'scala',
        'r': 'r',
        'perl': 'pl',
        'lua': 'lua',
        'dart': 'dart'
      };
      return extensions[lang] || 'txt';
    }

  } catch (error) {
    console.error('CodeMirror initialization failed:', error);
  }
}

function handleMenu() {
  // Wait a tick for buildGlobalHeader to finish
  setTimeout(() => {
    const menuButton = document.querySelector('.menu-button');
    const dropdown = document.querySelector('.dropdown');
    
    if (!menuButton) {
      console.warn('Menu button not found');
      return;
    }
    if (!dropdown) {
      console.warn('Dropdown not found');
      return;
    }

    // Remove any legacy class names to avoid style conflicts
    dropdown.classList.remove('menu-open');

    let overlay = document.getElementById('global-nav-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'global-nav-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:none;z-index:1800;';
      document.body.appendChild(overlay);
    }

    // Convert dropdown UL/Div into panel if not already wrapped
    if (!dropdown.classList.contains('global-nav')) {
      dropdown.classList.add('global-nav');
      dropdown.style.zIndex = '1900';
      dropdown.style.position = 'fixed';
      dropdown.style.top = '0';
      dropdown.style.left = '0';
      dropdown.style.height = '100vh';
      dropdown.style.minHeight = '100vh';
      dropdown.style.width = '450px';
      dropdown.style.maxWidth = '90vw';
      dropdown.style.overflowY = 'auto';
      dropdown.style.transform = 'translateX(-100%)';
      dropdown.style.transition = 'transform .3s ease';
      dropdown.style.background = 'rgba(18,18,18,0.98)';
      dropdown.style.backdropFilter = 'blur(15px)';
      dropdown.style.padding = '90px 30px 50px';
      dropdown.style.boxShadow = '0 0 50px rgba(0,0,0,0.5)';
      dropdown.style.borderRight = '3px solid rgba(168,85,247,0.6)';
      dropdown.style.listStyle = 'none';
      dropdown.style.margin = '0';
      dropdown.style.display = 'block';
      dropdown.style.zIndex = '1900';
      
      // Style all list items
      const listItems = dropdown.querySelectorAll('li');
      listItems.forEach(li => {
        li.style.marginBottom = '10px';
      });
      
      // Style all links
      const links = dropdown.querySelectorAll('a');
      links.forEach(link => {
        link.style.display = 'block';
        link.style.padding = '18px 22px';
        link.style.color = 'white';
        link.style.textDecoration = 'none';
        link.style.borderRadius = '12px';
        link.style.transition = 'all 0.3s';
        link.style.fontSize = '1.15rem';
        link.style.fontWeight = '500';
        link.style.lineHeight = '1.5';
        
        link.addEventListener('mouseenter', () => {
          link.style.background = 'rgba(168, 85, 247, 0.4)';
          link.style.paddingLeft = '25px';
          link.style.transform = 'translateX(5px)';
        });
        
        link.addEventListener('mouseleave', () => {
          link.style.background = 'transparent';
          link.style.paddingLeft = '20px';
          link.style.transform = 'translateX(0)';
        });
      });
      
      // Style submenus
      const submenus = dropdown.querySelectorAll('.submenu');
      submenus.forEach(submenu => {
        submenu.style.listStyle = 'none';
        submenu.style.paddingLeft = '25px';
        submenu.style.marginTop = '8px';
        submenu.style.display = 'none';
      });
      
      // Handle submenu toggles
      const hasSubmenuItems = dropdown.querySelectorAll('.has-submenu');
      hasSubmenuItems.forEach(item => {
        const link = item.querySelector('a');
        const submenu = item.querySelector('.submenu');
        
        if (link && submenu) {
          // Style submenu to appear above main menu items
          submenu.style.position = 'relative';
          submenu.style.zIndex = '2000';
          submenu.style.background = 'rgba(28,28,28,0.99)';
          submenu.style.borderLeft = '3px solid rgba(168,85,247,0.8)';
          submenu.style.borderRadius = '8px';
          submenu.style.padding = '10px 0';
          submenu.style.maxHeight = '0';
          submenu.style.overflow = 'hidden';
          submenu.style.transition = 'max-height 0.3s ease';
          
          // Add toggle indicator
          const toggleIcon = document.createElement('span');
          toggleIcon.innerHTML = ' ▶';
          toggleIcon.style.cssText = 'float:right;cursor:pointer;transition:transform 0.3s;display:inline-block;';
          toggleIcon.className = 'submenu-toggle';
          link.appendChild(toggleIcon);
          
          // Click on the entire link area to toggle submenu
          link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle submenu visibility
            const isOpen = submenu.style.maxHeight && submenu.style.maxHeight !== '0px';
            
            if (isOpen) {
              submenu.style.maxHeight = '0';
              submenu.style.display = 'none';
              toggleIcon.style.transform = 'rotate(0deg)';
            } else {
              submenu.style.display = 'block';
              submenu.style.maxHeight = '500px';
              toggleIcon.style.transform = 'rotate(90deg)';
            }
          });
          
          // Double-click to navigate to interview.html
          let clickTimer = null;
          link.addEventListener('dblclick', (e) => {
            if (clickTimer) clearTimeout(clickTimer);
            window.location.href = link.getAttribute('href');
          });
        }
      });
    }

    function openNav(){
      document.body.classList.add('nav-open');
      overlay.style.display='block';
      requestAnimationFrame(()=> dropdown.style.transform='translateX(0)');
    }
    function closeNav(){
      document.body.classList.remove('nav-open');
      dropdown.style.transform='translateX(-100%)';
      setTimeout(()=>{ if(!document.body.classList.contains('nav-open')) overlay.style.display='none'; },300);
    }

    menuButton.addEventListener('click', (e)=>{
      e.preventDefault();
      e.stopPropagation();
      if (document.body.classList.contains('nav-open')) closeNav(); else openNav();
    });
    overlay.addEventListener('click', closeNav);
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeNav(); });
    
    console.log('✅ Menu initialized');
  }, 100);
}

  document.addEventListener('DOMContentLoaded', () => {
    // Initializations
    buildGlobalHeader();
    
    // Extra safety: Hide header on auth pages even if somehow created
    const pageName = window.location.pathname.split('/').pop() || 'index.html';
    const authPages = ['index.html', 'login.html', 'signup.html', 'register.html', 'loading.html'];
    if (authPages.includes(pageName)) {
      const header = document.querySelector('.site-header');
      if (header) {
        header.style.display = 'none';
        console.log('🚫 Forcibly hiding header on auth page:', pageName);
      }
    }
    
    handleAuthForms();
    initLoadingPage();
    enhanceInterviewPage();
    handleMenu();
  // Conditionally call handleCoursesPage only on courses.html pages
  const currentPage = getCurrentPath();
  if (currentPage.endsWith('courses.html')) {
    handleCoursesPage();
  }
  // Fallback: ensure interview module buttons respond even if page check failed
  // (covers potential naming inconsistencies or dynamic content loads)
  const attachIfAbsent = (selector, event, handler) => {
    document.querySelectorAll(selector).forEach(el => {
      // Avoid double binding by tagging elements
      if (!el.__sm_bound) {
        el.addEventListener(event, handler);
        el.__sm_bound = true;
      }
    });
  };
  // Simple enroll fallback
  attachIfAbsent('.enroll-btn', 'click', (e) => {
    const btn = e.currentTarget;
    if (btn.disabled) return;
    btn.textContent = 'Enrolled';
    btn.disabled = true;
  });
  // Completion checkbox fallback to reveal adjacent certificate button
  attachIfAbsent('.completion-checkbox', 'change', (e) => {
    const cb = e.currentTarget;
    const certBtn = cb.closest('.video-card')?.querySelector('.cert-btn');
    if (certBtn) {
      certBtn.style.display = cb.checked ? 'inline-block' : 'none';
    }
  });
  // Certificate button lightweight fallback
  attachIfAbsent('.cert-btn', 'click', (e) => {
    // If handleCoursesPage already bound logic, skip fallback
    if (e.currentTarget.__sm_cert_bound) return;
    e.preventDefault();
    alert('Full certificate logic inactive – complete more content to enable.');
  });
});