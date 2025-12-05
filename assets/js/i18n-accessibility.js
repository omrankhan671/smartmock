/**
 * SmartMock Multilingual & Accessibility System
 * Auto-detect language, translations, high-contrast mode, screen reader support
 * Version: 2.0
 */

(function() {
  'use strict';

  // ===========================================
  // MULTILINGUAL SYSTEM
  // ===========================================

  const MultilingualSystem = {
    currentLanguage: 'en',
    supportedLanguages: ['en', 'hi', 'te', 'ta', 'es', 'fr'],
    translations: {},

    /**
     * Initialize multilingual system
     */
    init() {
      this.currentLanguage = this.detectLanguage();
      this.loadTranslations();
      console.log(`✅ Language set to: ${this.currentLanguage}`);
      return this;
    },

    /**
     * Detect browser language
     */
    detectLanguage() {
      const browserLang = navigator.language || navigator.userLanguage;
      const langCode = browserLang.split('-')[0]; // e.g., "en-US" -> "en"

      // Check if supported
      if (this.supportedLanguages.includes(langCode)) {
        return langCode;
      }

      // Check localStorage
      const savedLang = localStorage.getItem('smartmock_language');
      if (savedLang && this.supportedLanguages.includes(savedLang)) {
        return savedLang;
      }

      return 'en'; // Default to English
    },

    /**
     * Load translations
     */
    loadTranslations() {
      this.translations = {
        en: {
          // English (default)
          dashboard: 'Dashboard',
          profile: 'Profile',
          leaderboard: 'Leaderboard',
          certificates: 'Certificates',
          startInterview: 'Start Interview',
          aiInterview: 'AI Interview',
          traditionalInterview: 'Traditional Interview',
          score: 'Score',
          grade: 'Grade',
          interview: 'Interview',
          courses: 'Courses',
          welcome: 'Welcome',
          logout: 'Logout',
          settings: 'Settings',
          about: 'About',
          contact: 'Contact',
          help: 'Help',
          loading: 'Loading...',
          error: 'Error',
          success: 'Success',
          save: 'Save',
          cancel: 'Cancel',
          delete: 'Delete',
          edit: 'Edit',
          view: 'View',
          download: 'Download',
          share: 'Share',
          search: 'Search',
          filter: 'Filter',
          sort: 'Sort',
          name: 'Name',
          email: 'Email',
          password: 'Password',
          confirmPassword: 'Confirm Password',
          signIn: 'Sign In',
          signUp: 'Sign Up',
          forgotPassword: 'Forgot Password?',
          department: 'Department',
          date: 'Date',
          time: 'Time',
          duration: 'Duration',
          status: 'Status',
          completed: 'Completed',
          inProgress: 'In Progress',
          notStarted: 'Not Started',
          rank: 'Rank',
          totalInterviews: 'Total Interviews',
          bestScore: 'Best Score',
          averageScore: 'Average Score',
          improvement: 'Improvement',
          badges: 'Badges',
          level: 'Level',
          xp: 'XP',
          streak: 'Streak',
          days: 'Days',
          questions: 'Questions',
          answers: 'Answers',
          feedback: 'Feedback',
          recommendations: 'Recommendations',
          tryAgain: 'Try Again',
          continue: 'Continue',
          next: 'Next',
          previous: 'Previous',
          finish: 'Finish',
          submit: 'Submit',
          close: 'Close',
          ok: 'OK',
          yes: 'Yes',
          no: 'No'
        },
        hi: {
          // Hindi
          dashboard: 'डैशबोर्ड',
          profile: 'प्रोफ़ाइल',
          leaderboard: 'लीडरबोर्ड',
          certificates: 'प्रमाणपत्र',
          startInterview: 'साक्षात्कार शुरू करें',
          aiInterview: 'AI साक्षात्कार',
          traditionalInterview: 'पारंपरिक साक्षात्कार',
          score: 'स्कोर',
          grade: 'ग्रेड',
          interview: 'साक्षात्कार',
          courses: 'पाठ्यक्रम',
          welcome: 'स्वागत है',
          logout: 'लॉग आउट',
          settings: 'सेटिंग्स',
          about: 'के बारे में',
          contact: 'संपर्क करें',
          help: 'मदद',
          loading: 'लोड हो रहा है...',
          error: 'त्रुटि',
          success: 'सफलता',
          save: 'सहेजें',
          cancel: 'रद्द करें',
          delete: 'हटाएं',
          edit: 'संपादित करें',
          view: 'देखें',
          download: 'डाउनलोड',
          share: 'शेयर करें',
          search: 'खोजें',
          filter: 'फ़िल्टर',
          sort: 'क्रमबद्ध करें',
          name: 'नाम',
          email: 'ईमेल',
          password: 'पासवर्ड',
          signIn: 'साइन इन करें',
          signUp: 'साइन अप करें',
          department: 'विभाग',
          rank: 'रैंक',
          level: 'स्तर'
        },
        te: {
          // Telugu
          dashboard: 'డాష్‌బోర్డ్',
          profile: 'ప్రొఫైల్',
          leaderboard: 'లీడర్‌బోర్డ్',
          certificates: 'సర్టిఫికెట్లు',
          startInterview: 'ఇంటర్వ్యూ ప్రారంభించండి',
          aiInterview: 'AI ఇంటర్వ్యూ',
          score: 'స్కోర్',
          grade: 'గ్రేడ్',
          interview: 'ఇంటర్వ్యూ',
          courses: 'కోర్సులు',
          welcome: 'స్వాగతం',
          logout: 'లాగ్ అవుట్',
          settings: 'సెట్టింగ్‌లు',
          loading: 'లోడ్ అవుతోంది...',
          save: 'సేవ్ చేయండి',
          cancel: 'రద్దు చేయండి',
          department: 'విభాగం'
        },
        ta: {
          // Tamil
          dashboard: 'டாஷ்போர்டு',
          profile: 'சுயவிவரம்',
          leaderboard: 'தலைவர் பலகை',
          certificates: 'சான்றிதழ்கள்',
          startInterview: 'நேர்காணலைத் தொடங்கவும்',
          aiInterview: 'AI நேர்காணல்',
          score: 'மதிப்பெண்',
          grade: 'தரம்',
          interview: 'நேர்காணல்',
          courses: 'படிப்புகள்',
          welcome: 'வரவேற்கிறோம்',
          logout: 'வெளியேறு',
          settings: 'அமைப்புகள்',
          loading: 'ஏற்றுகிறது...',
          save: 'சேமி',
          cancel: 'ரத்து செய்',
          department: 'துறை'
        },
        es: {
          // Spanish
          dashboard: 'Tablero',
          profile: 'Perfil',
          leaderboard: 'Tabla de Clasificación',
          certificates: 'Certificados',
          startInterview: 'Iniciar Entrevista',
          aiInterview: 'Entrevista con IA',
          score: 'Puntuación',
          grade: 'Calificación',
          interview: 'Entrevista',
          courses: 'Cursos',
          welcome: 'Bienvenido',
          logout: 'Cerrar Sesión',
          settings: 'Configuración',
          loading: 'Cargando...',
          save: 'Guardar',
          cancel: 'Cancelar',
          department: 'Departamento'
        },
        fr: {
          // French
          dashboard: 'Tableau de Bord',
          profile: 'Profil',
          leaderboard: 'Classement',
          certificates: 'Certificats',
          startInterview: 'Commencer l\'Entretien',
          aiInterview: 'Entretien IA',
          score: 'Score',
          grade: 'Note',
          interview: 'Entretien',
          courses: 'Cours',
          welcome: 'Bienvenue',
          logout: 'Déconnexion',
          settings: 'Paramètres',
          loading: 'Chargement...',
          save: 'Enregistrer',
          cancel: 'Annuler',
          department: 'Département'
        }
      };
    },

    /**
     * Get translation
     */
    t(key, lang = null) {
      const language = lang || this.currentLanguage;
      const langTranslations = this.translations[language] || this.translations.en;
      return langTranslations[key] || this.translations.en[key] || key;
    },

    /**
     * Get current language
     */
    getCurrentLanguage() {
      return this.currentLanguage;
    },

    /**
     * Change language
     */
    setLanguage(langCode) {
      if (!this.supportedLanguages.includes(langCode)) {
        console.error(`Language ${langCode} not supported`);
        return false;
      }

      this.currentLanguage = langCode;
      localStorage.setItem('smartmock_language', langCode);
      this.updatePageContent();
      console.log(`Language changed to: ${langCode}`);
      return true;
    },

    /**
     * Update page content with translations
     */
    updatePageContent() {
      // Find all elements with data-translate attribute
      const elements = document.querySelectorAll('[data-translate]');
      elements.forEach(el => {
        const key = el.getAttribute('data-translate');
        el.textContent = this.t(key);
      });

      // Update placeholders
      const inputs = document.querySelectorAll('[data-translate-placeholder]');
      inputs.forEach(input => {
        const key = input.getAttribute('data-translate-placeholder');
        input.placeholder = this.t(key);
      });
    },

    /**
     * Get language selector HTML
     */
    getLanguageSelector() {
      const languages = {
        en: { name: 'English', flag: '🇺🇸' },
        hi: { name: 'हिन्दी', flag: '🇮🇳' },
        te: { name: 'తెలుగు', flag: '🇮🇳' },
        ta: { name: 'தமிழ்', flag: '🇮🇳' },
        es: { name: 'Español', flag: '🇪🇸' },
        fr: { name: 'Français', flag: '🇫🇷' }
      };

      let html = '<select id="language-selector" style="background: rgba(255,255,255,0.1); color: #FFF; border: 1px solid rgba(255,255,255,0.2); padding: 8px 12px; border-radius: 8px; cursor: pointer;">';
      
      this.supportedLanguages.forEach(code => {
        const lang = languages[code];
        const selected = code === this.currentLanguage ? 'selected' : '';
        html += `<option value="${code}" ${selected}>${lang.flag} ${lang.name}</option>`;
      });
      
      html += '</select>';
      return html;
    }
  };

  // ===========================================
  // ACCESSIBILITY SYSTEM
  // ===========================================

  const AccessibilitySystem = {
    isHighContrast: false,
    isScreenReaderActive: false,
    isKeyboardNavActive: false,

    /**
     * Initialize accessibility features
     */
    init() {
      this.loadSettings();
      this.setupKeyboardNavigation();
      this.detectScreenReader();
      console.log('✅ Accessibility features initialized');
      return this;
    },

    /**
     * Load accessibility settings
     */
    loadSettings() {
      this.isHighContrast = localStorage.getItem('accessibility_highContrast') === 'true';
      this.isKeyboardNavActive = localStorage.getItem('accessibility_keyboard') === 'true';

      if (this.isHighContrast) {
        this.enableHighContrast();
      }
    },

    /**
     * Enable high-contrast mode
     */
    enableHighContrast() {
      this.isHighContrast = true;
      document.body.classList.add('high-contrast-mode');
      localStorage.setItem('accessibility_highContrast', 'true');

      // Add high contrast styles
      if (!document.getElementById('high-contrast-styles')) {
        const style = document.createElement('style');
        style.id = 'high-contrast-styles';
        style.textContent = `
          .high-contrast-mode {
            filter: contrast(1.5);
          }
          .high-contrast-mode * {
            border-width: 2px !important;
          }
          .high-contrast-mode button,
          .high-contrast-mode a {
            outline: 3px solid #FFFFFF !important;
            outline-offset: 2px;
          }
          .high-contrast-mode button:focus,
          .high-contrast-mode a:focus {
            outline: 4px solid #FFD700 !important;
            background: rgba(255, 215, 0, 0.2) !important;
          }
        `;
        document.head.appendChild(style);
      }

      console.log('High contrast mode enabled');
    },

    /**
     * Disable high-contrast mode
     */
    disableHighContrast() {
      this.isHighContrast = false;
      document.body.classList.remove('high-contrast-mode');
      localStorage.setItem('accessibility_highContrast', 'false');
      console.log('High contrast mode disabled');
    },

    /**
     * Toggle high-contrast mode
     */
    toggleHighContrast() {
      if (this.isHighContrast) {
        this.disableHighContrast();
      } else {
        this.enableHighContrast();
      }
    },

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
      this.isKeyboardNavActive = true;

      // Tab navigation
      document.addEventListener('keydown', (e) => {
        // Escape key - close modals
        if (e.key === 'Escape') {
          this.closeAllModals();
        }

        // Space on buttons
        if (e.key === ' ' && e.target.tagName === 'BUTTON') {
          e.preventDefault();
          e.target.click();
        }

        // Arrow keys for navigation
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          this.handleArrowNavigation(e);
        }
      });

      // Add focus indicators
      const style = document.createElement('style');
      style.textContent = `
        *:focus {
          outline: 3px solid #6C63FF !important;
          outline-offset: 2px;
        }
        button:focus,
        a:focus,
        input:focus,
        select:focus,
        textarea:focus {
          box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.5) !important;
        }
      `;
      document.head.appendChild(style);

      console.log('Keyboard navigation enabled');
    },

    /**
     * Handle arrow key navigation
     */
    handleArrowNavigation(e) {
      const focusableElements = Array.from(
        document.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
      );

      const currentIndex = focusableElements.indexOf(document.activeElement);
      
      if (currentIndex === -1) return;

      let nextIndex;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % focusableElements.length;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
      }

      if (nextIndex !== undefined) {
        e.preventDefault();
        focusableElements[nextIndex].focus();
      }
    },

    /**
     * Close all modals
     */
    closeAllModals() {
      const modals = document.querySelectorAll('.modal, [role="dialog"]');
      modals.forEach(modal => {
        modal.style.display = 'none';
        modal.remove();
      });
    },

    /**
     * Detect screen reader
     */
    detectScreenReader() {
      // Check for common screen reader indicators
      const hasAriaLive = document.querySelector('[aria-live]');
      const hasAriaLabel = document.querySelector('[aria-label]');
      
      if (hasAriaLive || hasAriaLabel) {
        this.isScreenReaderActive = true;
        console.log('Screen reader detected');
      }
    },

    /**
     * Add ARIA labels to element
     */
    addAriaLabels(element, label, description = '') {
      element.setAttribute('aria-label', label);
      if (description) {
        element.setAttribute('aria-description', description);
      }
      element.setAttribute('role', element.tagName === 'BUTTON' ? 'button' : 'region');
    },

    /**
     * Announce to screen reader
     */
    announce(message, priority = 'polite') {
      const announcer = document.getElementById('sr-announcer') || this.createAnnouncer();
      announcer.setAttribute('aria-live', priority);
      announcer.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        announcer.textContent = '';
      }, 1000);
    },

    /**
     * Create screen reader announcer
     */
    createAnnouncer() {
      const announcer = document.createElement('div');
      announcer.id = 'sr-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
      document.body.appendChild(announcer);
      return announcer;
    },

    /**
     * Add captions to speech
     */
    addCaptions(text, container) {
      if (!container) {
        container = document.getElementById('captions-container') || this.createCaptionsContainer();
      }

      const caption = document.createElement('div');
      caption.className = 'caption-text';
      caption.textContent = text;
      caption.style.cssText = `
        background: rgba(0,0,0,0.8);
        color: #FFFFFF;
        padding: 10px 15px;
        border-radius: 8px;
        margin: 5px 0;
        font-size: 16px;
        animation: fadeIn 0.3s;
      `;

      container.appendChild(caption);

      // Remove old captions (keep last 3)
      const captions = container.querySelectorAll('.caption-text');
      if (captions.length > 3) {
        captions[0].remove();
      }

      // Auto-remove after 5 seconds
      setTimeout(() => {
        caption.style.animation = 'fadeOut 0.3s';
        setTimeout(() => caption.remove(), 300);
      }, 5000);
    },

    /**
     * Create captions container
     */
    createCaptionsContainer() {
      const container = document.createElement('div');
      container.id = 'captions-container';
      container.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        max-width: 80%;
        pointer-events: none;
      `;
      document.body.appendChild(container);
      return container;
    },

    /**
     * Get accessibility settings panel HTML
     */
    getSettingsPanel() {
      return `
        <div class="accessibility-panel" style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #FFFFFF; margin-bottom: 15px;">♿ Accessibility Settings</h3>
          
          <label style="display: flex; align-items: center; margin-bottom: 15px; color: #FFFFFF; cursor: pointer;">
            <input type="checkbox" id="toggle-high-contrast" ${this.isHighContrast ? 'checked' : ''} style="margin-right: 10px; width: 20px; height: 20px;">
            <span>High Contrast Mode</span>
          </label>

          <label style="display: flex; align-items: center; margin-bottom: 15px; color: #FFFFFF; cursor: pointer;">
            <input type="checkbox" id="toggle-captions" style="margin-right: 10px; width: 20px; height: 20px;">
            <span>Show Captions</span>
          </label>

          <label style="display: flex; align-items: center; margin-bottom: 15px; color: #FFFFFF; cursor: pointer;">
            <input type="checkbox" id="toggle-screen-reader" ${this.isScreenReaderActive ? 'checked' : ''} style="margin-right: 10px; width: 20px; height: 20px;">
            <span>Screen Reader Announcements</span>
          </label>

          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="color: rgba(255,255,255,0.7); font-size: 14px;">
              ⌨️ Keyboard Shortcuts:<br>
              • Tab / Shift+Tab: Navigate<br>
              • Space / Enter: Activate<br>
              • Escape: Close modals<br>
              • Arrow Keys: Navigate lists
            </p>
          </div>
        </div>
      `;
    }
  };

  // Export to global
  window.SmartMockI18n = MultilingualSystem;
  window.SmartMockA11y = AccessibilitySystem;

  console.log('✅ Multilingual & Accessibility Systems Loaded (v2.0)');
})();
