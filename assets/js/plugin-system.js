/**
 * SmartMock Plugin System & Offline Export
 * Department plugins, custom templates, offline dashboard export
 * Version: 2.0
 */

(function() {
  'use strict';

  // ===========================================
  // DEPARTMENT PLUGIN SYSTEM
  // ===========================================

  const PluginSystem = {
    plugins: new Map(),
    pluginRegistry: [],

    /**
     * Register a new department plugin
     */
    registerPlugin(plugin) {
      // Validate plugin structure
      if (!this.validatePlugin(plugin)) {
        console.error('Invalid plugin structure', plugin);
        return false;
      }

      this.plugins.set(plugin.id, plugin);
      this.pluginRegistry.push(plugin);
      console.log(`✅ Plugin registered: ${plugin.name} (${plugin.id})`);
      return true;
    },

    /**
     * Validate plugin structure
     */
    validatePlugin(plugin) {
      const required = ['id', 'name', 'icon', 'courses', 'questionPool'];
      return required.every(field => plugin.hasOwnProperty(field));
    },

    /**
     * Load plugin from JSON
     */
    async loadPluginFromJSON(url) {
      try {
        const response = await fetch(url);
        const plugin = await response.json();
        return this.registerPlugin(plugin);
      } catch (error) {
        console.error('Failed to load plugin:', error);
        return false;
      }
    },

    /**
     * Get plugin by ID
     */
    getPlugin(id) {
      return this.plugins.get(id);
    },

    /**
     * List all plugins
     */
    listPlugins() {
      return this.pluginRegistry;
    },

    /**
     * Get all registered plugins
     */
    getAllPlugins() {
      return this.pluginRegistry;
    },

    /**
     * Generate department page from plugin
     */
    generateDepartmentPage(pluginId) {
      const plugin = this.getPlugin(pluginId);
      if (!plugin) {
        console.error(`Plugin ${pluginId} not found`);
        return null;
      }

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${plugin.name} - SmartMock</title>
  <link rel="stylesheet" href="../../assets/css/styles.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>${plugin.icon} ${plugin.name}</h1>
      <p>${plugin.description || ''}</p>
    </header>

    <section class="courses-grid">
      ${plugin.courses.map((course, index) => `
        <div class="course-card" data-course-id="${course.id}">
          <div class="course-number">${index + 1}</div>
          <h3>${course.name}</h3>
          <p>${course.description || ''}</p>
          <div class="course-meta">
            <span>📚 ${course.duration || '2 hours'}</span>
            <span>📊 ${course.difficulty || 'Medium'}</span>
          </div>
          <button class="btn-primary" onclick="startCourse('${course.id}')">
            Start Course
          </button>
        </div>
      `).join('')}
    </section>
  </div>

  <script src="../../assets/js/firebase-config.js"></script>
  <script>
    function startCourse(courseId) {
      window.location.href = './ai-interview.html?course=' + courseId;
    }
  </script>
</body>
</html>
      `;

      return html;
    },

    /**
     * Auto-generate files for plugin
     */
    generatePluginFiles(pluginId) {
      const plugin = this.getPlugin(pluginId);
      if (!plugin) return;

      const files = {
        'courses.html': this.generateDepartmentPage(pluginId),
        'ai-interview.html': this.generateAIInterviewPage(plugin),
        'preparation.html': this.generatePreparationPage(plugin),
        'plugin-config.json': JSON.stringify(plugin, null, 2)
      };

      return files;
    },

    /**
     * Generate AI interview page
     */
    generateAIInterviewPage(plugin) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AI Interview - ${plugin.name}</title>
  <link rel="stylesheet" href="../../assets/css/styles.css">
</head>
<body>
  <div class="interview-container">
    <h1>${plugin.icon} ${plugin.name} AI Interview</h1>
    <div id="interview-area"></div>
  </div>
  <script src="../../assets/js/firebase-config.js"></script>
  <script src="../../assets/js/adaptive-interview.js"></script>
  <script>
    // Initialize AI interview for ${plugin.id}
    const interview = AdaptiveInterview.init('${plugin.id}', 1);
  </script>
</body>
</html>`;
    },

    /**
     * Generate preparation page
     */
    generatePreparationPage(plugin) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Preparation - ${plugin.name}</title>
  <link rel="stylesheet" href="../../assets/css/styles.css">
</head>
<body>
  <div class="preparation-container">
    <h1>${plugin.icon} ${plugin.name} Interview Preparation</h1>
    <div class="tips-section">
      <h2>Key Topics</h2>
      <ul>
        ${(plugin.keyTopics || []).map(topic => `<li>${topic}</li>`).join('')}
      </ul>
    </div>
  </div>
</body>
</html>`;
    },

    /**
     * Example plugin template
     */
    getPluginTemplate() {
      return {
        id: 'your_dept_code',
        name: 'Your Department Name',
        icon: '🎯',
        description: 'Department description',
        courses: [
          {
            id: 'course1',
            name: 'Course Name',
            description: 'Course description',
            duration: '2 hours',
            difficulty: 'Medium'
          }
        ],
        questionPool: {
          easy: [],
          medium: [],
          hard: [],
          expert: []
        },
        keyTopics: ['Topic 1', 'Topic 2', 'Topic 3'],
        resources: []
      };
    }
  };

  // ===========================================
  // OFFLINE DASHBOARD EXPORT
  // ===========================================

  const OfflineExport = {
    /**
     * Export dashboard as standalone HTML
     */
    async exportDashboard(userData, options = {}) {
      const {
        includeCharts = true,
        includeInterviews = true,
        includeCertificates = true,
        includeLeaderboard = true
      } = options;

      let html = this.generateDashboardHTML(userData, {
        includeCharts,
        includeInterviews,
        includeCertificates,
        includeLeaderboard
      });

      return html;
    },

    /**
     * Generate standalone HTML dashboard
     */
    generateDashboardHTML(userData, options) {
      const css = this.getEmbeddedCSS();
      const js = this.getEmbeddedJS();

      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SmartMock Dashboard - ${userData.name}</title>
  <style>${css}</style>
</head>
<body>
  <div class="dashboard-export">
    <header class="export-header">
      <h1>🎓 SmartMock Dashboard</h1>
      <div class="user-info">
        <div class="avatar">${this.getInitials(userData.name)}</div>
        <div>
          <h2>${userData.name}</h2>
          <p>${userData.email}</p>
        </div>
      </div>
      <div class="export-date">Exported: ${new Date().toLocaleDateString()}</div>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🎤</div>
        <div class="stat-value">${userData.totalInterviews || 0}</div>
        <div class="stat-label">Interviews</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-value">${userData.bestScore || 0}</div>
        <div class="stat-label">Best Score</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-value">${userData.certificates?.length || 0}</div>
        <div class="stat-label">Certificates</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-value">${userData.completedCourses || 0}</div>
        <div class="stat-label">Courses</div>
      </div>
    </div>

    ${options.includeCharts ? this.generateChartsSection(userData) : ''}
    ${options.includeInterviews ? this.generateInterviewsSection(userData) : ''}
    ${options.includeCertificates ? this.generateCertificatesSection(userData) : ''}
    ${options.includeLeaderboard ? this.generateLeaderboardSection(userData) : ''}

    <footer class="export-footer">
      <p>Generated by SmartMock AI-Powered Interview Platform</p>
      <p>© ${new Date().getFullYear()} SmartMock. All rights reserved.</p>
    </footer>
  </div>

  <script>${js}</script>
</body>
</html>`;
    },

    /**
     * Get embedded CSS
     */
    getEmbeddedCSS() {
      return `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #333;
          padding: 20px;
        }
        .dashboard-export {
          max-width: 1200px;
          margin: 0 auto;
          background: #FFFFFF;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .export-header {
          background: linear-gradient(135deg, #6C63FF 0%, #00E5FF 100%);
          color: #FFFFFF;
          padding: 40px;
          position: relative;
        }
        .export-header h1 {
          font-size: 32px;
          margin-bottom: 20px;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
        }
        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 700;
          border: 3px solid #FFFFFF;
        }
        .export-date {
          position: absolute;
          top: 20px;
          right: 40px;
          background: rgba(255,255,255,0.2);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          padding: 40px;
          background: #F5F5F5;
        }
        .stat-card {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .stat-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }
        .stat-value {
          font-size: 36px;
          font-weight: 700;
          color: #6C63FF;
          margin-bottom: 8px;
        }
        .stat-label {
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .section {
          padding: 40px;
        }
        .section-title {
          font-size: 24px;
          margin-bottom: 24px;
          color: #333;
          border-bottom: 2px solid #6C63FF;
          padding-bottom: 12px;
        }
        .export-footer {
          background: #333;
          color: #FFFFFF;
          text-align: center;
          padding: 24px;
          font-size: 14px;
        }
        @media print {
          body { background: #FFFFFF; }
          .dashboard-export { box-shadow: none; }
        }
      `;
    },

    /**
     * Get embedded JavaScript
     */
    getEmbeddedJS() {
      return `
        console.log('SmartMock Dashboard Export Loaded');
        // Add any interactive functionality here
      `;
    },

    /**
     * Get initials from name
     */
    getInitials(name) {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },

    /**
     * Generate charts section
     */
    generateChartsSection(userData) {
      return `
        <div class="section">
          <h2 class="section-title">📊 Performance Charts</h2>
          <div class="charts-grid">
            <div class="chart-placeholder">
              <p>Score progression chart would be displayed here</p>
            </div>
          </div>
        </div>
      `;
    },

    /**
     * Generate interviews section
     */
    generateInterviewsSection(userData) {
      const interviews = userData.recentInterviews || [];
      return `
        <div class="section">
          <h2 class="section-title">🎤 Recent Interviews</h2>
          <div class="interviews-list">
            ${interviews.length > 0 ? interviews.map(interview => `
              <div class="interview-item">
                <div class="interview-date">${new Date(interview.date).toLocaleDateString()}</div>
                <div class="interview-dept">${interview.department}</div>
                <div class="interview-score">${interview.score}/100</div>
              </div>
            `).join('') : '<p>No recent interviews</p>'}
          </div>
        </div>
      `;
    },

    /**
     * Generate certificates section
     */
    generateCertificatesSection(userData) {
      const certificates = userData.certificates || [];
      return `
        <div class="section">
          <h2 class="section-title">🏆 Certificates</h2>
          <div class="certificates-grid">
            ${certificates.length > 0 ? certificates.map(cert => `
              <div class="certificate-item">
                <div class="cert-icon">📜</div>
                <h3>${cert.courseName}</h3>
                <p>ID: ${cert.certificateId}</p>
                <p>Date: ${new Date(cert.dateIssued).toLocaleDateString()}</p>
              </div>
            `).join('') : '<p>No certificates earned yet</p>'}
          </div>
        </div>
      `;
    },

    /**
     * Generate leaderboard section
     */
    generateLeaderboardSection(userData) {
      return `
        <div class="section">
          <h2 class="section-title">🏅 Leaderboard Position</h2>
          <div class="leaderboard-stats">
            <p><strong>Global Rank:</strong> ${userData.globalRank || 'N/A'}</p>
            <p><strong>Department Rank:</strong> ${userData.departmentRank || 'N/A'}</p>
            <p><strong>Percentile:</strong> Top ${userData.percentile || 'N/A'}%</p>
          </div>
        </div>
      `;
    },

    /**
     * Download dashboard as HTML file
     */
    downloadDashboard(html, filename = 'smartmock-dashboard.html') {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      console.log('Dashboard exported successfully');
    },

    /**
     * Export as PDF (using browser print)
     */
    exportAsPDF() {
      window.print();
    }
  };

  // ===========================================
  // CUSTOM INTERVIEW TEMPLATES
  // ===========================================

  const TemplateSystem = {
    templates: new Map(),

    /**
     * Create custom interview template
     */
    createTemplate(config) {
      const template = {
        id: config.id || 'template_' + Date.now(),
        name: config.name,
        description: config.description,
        department: config.department,
        questions: config.questions || [],
        scoringRules: config.scoringRules || this.getDefaultScoringRules(),
        feedbackStyle: config.feedbackStyle || 'detailed',
        difficulty: config.difficulty || 'adaptive',
        duration: config.duration || 30,
        createdBy: config.createdBy,
        createdAt: Date.now(),
        isPublic: config.isPublic || false
      };

      this.templates.set(template.id, template);
      return template;
    },

    /**
     * Get default scoring rules
     */
    getDefaultScoringRules() {
      return {
        technical: 0.4,
        communication: 0.3,
        confidence: 0.2,
        clarity: 0.1
      };
    },

    /**
     * Load template
     */
    getTemplate(id) {
      return this.templates.get(id);
    },

    /**
     * Save template to Firebase
     */
    async saveTemplate(template, userId) {
      if (!window.firebase) {
        console.error('Firebase not initialized');
        return false;
      }

      try {
        const db = firebase.database();
        await db.ref(`templates/${userId}/${template.id}`).set(template);
        console.log('Template saved successfully');
        return true;
      } catch (error) {
        console.error('Failed to save template:', error);
        return false;
      }
    },

    /**
     * Load template from Firebase
     */
    async loadTemplate(templateId, userId) {
      if (!window.firebase) {
        console.error('Firebase not initialized');
        return null;
      }

      try {
        const db = firebase.database();
        const snapshot = await db.ref(`templates/${userId}/${templateId}`).once('value');
        const template = snapshot.val();
        
        if (template) {
          this.templates.set(template.id, template);
        }
        
        return template;
      } catch (error) {
        console.error('Failed to load template:', error);
        return null;
      }
    },

    /**
     * Share template via ID
     */
    getShareableLink(templateId) {
      const baseUrl = window.location.origin;
      return `${baseUrl}/interview/custom.html?template=${templateId}`;
    }
  };

  // Export to global
  window.PluginSystem = PluginSystem;
  window.OfflineExport = OfflineExport;
  window.TemplateSystem = TemplateSystem;

  console.log('✅ Plugin System, Offline Export & Templates Loaded (v2.0)');
})();
