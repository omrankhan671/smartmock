/**
 * SmartMock Interview Integrity Monitor
 * Detects suspicious behavior, tab switching, mic muting
 * Version: 2.0
 */

(function() {
  'use strict';

  const IntegrityMonitor = {
    isActive: false,
    isStrictMode: false, // For certification interviews
    violations: [],
    listeners: [],

    /**
     * Initialize monitoring
     */
    init(options = {}) {
      this.isStrictMode = options.strict || false;
      this.violations = [];
      this.isActive = true;

      // Track tab visibility changes
      this.addListener('visibilitychange', () => {
        if (document.hidden) {
          this.logViolation('TAB_SWITCH', 'User switched to another tab');
        }
      });

      // Track page blur (window lost focus)
      this.addListener('blur', () => {
        this.logViolation('WINDOW_BLUR', 'Interview window lost focus', window);
      }, window);

      // Track fullscreen exit (if strict mode)
      if (this.isStrictMode) {
        this.addListener('fullscreenchange', () => {
          if (!document.fullscreenElement) {
            this.logViolation('FULLSCREEN_EXIT', 'Exited fullscreen mode');
          }
        });
      }

      // Track context menu (right-click)
      this.addListener('contextmenu', (e) => {
        if (this.isStrictMode) {
          e.preventDefault();
          this.logViolation('RIGHT_CLICK', 'Attempted to open context menu');
        }
      });

      // Track copy/paste attempts
      this.addListener('copy', () => {
        this.logViolation('COPY', 'Attempted to copy content');
      });

      this.addListener('paste', () => {
        this.logViolation('PASTE', 'Attempted to paste content');
      });

      // Track keyboard shortcuts (Ctrl+C, Ctrl+V, etc.)
      this.addListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && !this.isStrictMode) {
          if (e.key === 'c' || e.key === 'v' || e.key === 'x') {
            this.logViolation('KEYBOARD_SHORTCUT', `Used ${e.key} shortcut`);
          }
        }
      });

      console.log(`✅ Integrity Monitor Active (Strict: ${this.isStrictMode})`);
      return this;
    },

    /**
     * Add event listener and track it
     */
    addListener(event, handler, target = document) {
      target.addEventListener(event, handler);
      this.listeners.push({ event, handler, target });
    },

    /**
     * Log violation
     */
    logViolation(type, message, data = null) {
      if (!this.isActive) return;

      const violation = {
        type,
        message,
        timestamp: Date.now(),
        data,
        severity: this.getSeverity(type)
      };

      this.violations.push(violation);

      // Console warning
      console.warn(`⚠️ Integrity Violation: ${type} - ${message}`);

      // Trigger callback if provided
      if (this.onViolation) {
        this.onViolation(violation);
      }

      // Show warning to user (optional)
      if (this.isStrictMode && this.violations.length >= 3) {
        this.showWarningModal();
      }
    },

    /**
     * Get violation severity
     */
    getSeverity(type) {
      const highSeverity = ['TAB_SWITCH', 'WINDOW_BLUR', 'FULLSCREEN_EXIT', 'MICROPHONE_MUTE'];
      const mediumSeverity = ['RIGHT_CLICK', 'COPY', 'PASTE'];
      
      if (highSeverity.includes(type)) return 'HIGH';
      if (mediumSeverity.includes(type)) return 'MEDIUM';
      return 'LOW';
    },

    /**
     * Monitor microphone
     */
    monitorMicrophone(stream) {
      if (!stream) return;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      
      source.connect(analyzer);
      analyzer.fftSize = 256;
      
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let silentFrames = 0;
      const maxSilentFrames = 50; // ~5 seconds at 10fps

      const checkAudio = () => {
        if (!this.isActive) return;

        analyzer.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;

        if (average < 5) {
          silentFrames++;
          if (silentFrames >= maxSilentFrames) {
            this.logViolation('MICROPHONE_MUTE', 'Microphone appears to be muted');
            silentFrames = 0; // Reset to avoid spam
          }
        } else {
          silentFrames = 0;
        }

        setTimeout(checkAudio, 100);
      };

      checkAudio();
    },

    /**
     * Monitor camera
     */
    monitorCamera(videoElement) {
      if (!videoElement) return;

      let blackFrames = 0;
      const maxBlackFrames = 30; // ~3 seconds at 10fps

      const checkVideo = () => {
        if (!this.isActive) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(videoElement, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Calculate average brightness
        let total = 0;
        for (let i = 0; i < data.length; i += 4) {
          total += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        const average = total / (data.length / 4);

        if (average < 10) {
          blackFrames++;
          if (blackFrames >= maxBlackFrames) {
            this.logViolation('CAMERA_BLOCKED', 'Camera appears to be blocked or off');
            blackFrames = 0;
          }
        } else {
          blackFrames = 0;
        }

        setTimeout(checkVideo, 100);
      };

      // Wait for video to be ready
      if (videoElement.readyState >= 2) {
        checkVideo();
      } else {
        videoElement.addEventListener('loadeddata', checkVideo);
      }
    },

    /**
     * Show warning modal
     */
    showWarningModal() {
      const existingModal = document.getElementById('integrity-warning-modal');
      if (existingModal) return; // Already showing

      const modal = document.createElement('div');
      modal.id = 'integrity-warning-modal';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s;
      `;

      modal.innerHTML = `
        <div style="background: #1a1f36; border-radius: 16px; padding: 30px; max-width: 500px; text-align: center; border: 2px solid #FF3366;">
          <div style="font-size: 60px; margin-bottom: 15px;">⚠️</div>
          <div style="color: #FF3366; font-size: 24px; font-weight: 700; margin-bottom: 10px;">
            Multiple Integrity Violations Detected
          </div>
          <div style="color: rgba(255,255,255,0.8); font-size: 16px; margin-bottom: 20px;">
            This is a monitored interview. Suspicious activities have been logged.<br>
            <strong>Total violations: ${this.violations.length}</strong>
          </div>
          <div style="background: rgba(255,51,102,0.1); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <div style="color: rgba(255,255,255,0.7); font-size: 14px; text-align: left;">
              ${this.violations.slice(-3).map(v => `• ${v.message} (${new Date(v.timestamp).toLocaleTimeString()})`).join('<br>')}
            </div>
          </div>
          <button id="integrity-acknowledge" style="
            background: linear-gradient(135deg, #6C63FF, #00E5FF);
            border: none;
            border-radius: 8px;
            color: #FFFFFF;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
          ">I Understand</button>
        </div>
      `;

      document.body.appendChild(modal);

      document.getElementById('integrity-acknowledge').addEventListener('click', () => {
        modal.remove();
      });
    },

    /**
     * Get violations report
     */
    getReport() {
      const byType = {};
      this.violations.forEach(v => {
        byType[v.type] = (byType[v.type] || 0) + 1;
      });

      const bySeverity = {
        HIGH: this.violations.filter(v => v.severity === 'HIGH').length,
        MEDIUM: this.violations.filter(v => v.severity === 'MEDIUM').length,
        LOW: this.violations.filter(v => v.severity === 'LOW').length
      };

      return {
        total: this.violations.length,
        byType,
        bySeverity,
        violations: this.violations,
        riskLevel: this.calculateRiskLevel(),
        passed: this.violations.filter(v => v.severity === 'HIGH').length < 3
      };
    },

    /**
     * Calculate risk level
     */
    calculateRiskLevel() {
      const highCount = this.violations.filter(v => v.severity === 'HIGH').length;
      const totalCount = this.violations.length;

      if (highCount >= 5) return 'CRITICAL';
      if (highCount >= 3) return 'HIGH';
      if (totalCount >= 10) return 'MEDIUM';
      if (totalCount >= 5) return 'LOW';
      return 'CLEAN';
    },

    /**
     * Stop monitoring
     */
    stop() {
      this.isActive = false;
      
      // Remove all listeners
      this.listeners.forEach(({ event, handler, target }) => {
        target.removeEventListener(event, handler);
      });
      this.listeners = [];

      console.log('✅ Integrity Monitor Stopped');
    },

    /**
     * Request fullscreen (for strict mode)
     */
    requestFullscreen() {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    }
  };

  // Export to global
  window.IntegrityMonitor = IntegrityMonitor;
  console.log('✅ Integrity Monitor Module Loaded (v2.0)');
})();
