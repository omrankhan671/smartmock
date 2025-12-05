/**
 * Certificate Modal System
 * Adds fullscreen certificate preview functionality to course pages
 */

// Certificate Modal HTML
const certificateModalHTML = `
<div id="certificateModal" class="cert-modal">
  <div class="cert-modal-overlay" onclick="closeCertificateModal()"></div>
  <div class="cert-modal-content">
    <button class="cert-modal-close" onclick="closeCertificateModal()">&times;</button>
    <div class="cert-modal-body">
      <div id="certificatePreview" class="certificate-preview">
        <!-- Certificate will be rendered here -->
      </div>
    </div>
  </div>
</div>
`;

// Certificate Modal CSS
const certificateModalCSS = `
<style>
.cert-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}
.cert-modal.show {
  display: block;
}
.cert-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(5px);
}
.cert-modal-content {
  position: relative;
  width: 90%;
  max-width: 1200px;
  height: 90%;
  margin: 5% auto;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}
.cert-modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s;
}
.cert-modal-close:hover {
  background: rgba(255, 59, 48, 0.9);
  transform: rotate(90deg);
}
.cert-modal-body {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background: #f5f5f5;
}
.certificate-preview {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 1000px;
  margin: 0 auto;
}

/* Certificate Sample Style */
.sample-certificate {
  width: 100%;
  min-height: 600px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 12px solid #667eea;
  border-radius: 8px;
  padding: 60px;
  position: relative;
  font-family: 'Georgia', serif;
}
.cert-header {
  text-align: center;
  margin-bottom: 40px;
}
.cert-logo {
  font-size: 48px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
}
.cert-title {
  font-size: 36px;
  color: #333;
  margin: 20px 0;
  font-weight: 600;
}
.cert-subtitle {
  font-size: 18px;
  color: #666;
  margin-bottom: 40px;
}
.cert-body {
  text-align: center;
  margin: 40px 0;
}
.cert-recipient {
  font-size: 42px;
  color: #667eea;
  font-weight: 700;
  margin: 30px 0;
  text-decoration: underline;
  text-decoration-color: #764ba2;
}
.cert-course {
  font-size: 28px;
  color: #333;
  margin: 30px 0;
  font-weight: 600;
}
.cert-description {
  font-size: 16px;
  color: #666;
  line-height: 1.8;
  max-width: 700px;
  margin: 30px auto;
}
.cert-footer {
  display: flex;
  justify-content: space-around;
  margin-top: 60px;
  padding-top: 40px;
  border-top: 2px solid #ddd;
}
.cert-signature {
  text-align: center;
}
.cert-signature-line {
  width: 200px;
  height: 2px;
  background: #333;
  margin: 0 auto 10px;
}
.cert-signature-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}
.cert-signature-title {
  font-size: 14px;
  color: #666;
}
.cert-date {
  position: absolute;
  bottom: 40px;
  right: 60px;
  font-size: 14px;
  color: #666;
}
.cert-id {
  position: absolute;
  bottom: 40px;
  left: 60px;
  font-size: 12px;
  color: #999;
}
.cert-seal {
  position: absolute;
  bottom: 60px;
  right: 50%;
  transform: translateX(50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* Certificate Thumbnail for Courses Page */
.certificate-thumbnail {
  width: 100%;
  max-width: 300px;
  margin: 20px auto;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 4px solid #667eea;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
.certificate-thumbnail:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.3);
}
.certificate-thumbnail .mini-cert-logo {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  margin-bottom: 10px;
}
.certificate-thumbnail .mini-cert-title {
  font-size: 16px;
  color: #333;
  text-align: center;
  font-weight: 600;
  margin-bottom: 10px;
}
.certificate-thumbnail .mini-cert-text {
  font-size: 12px;
  color: #666;
  text-align: center;
  margin: 5px 0;
}
.certificate-thumbnail .mini-cert-name {
  font-size: 18px;
  color: #667eea;
  text-align: center;
  font-weight: 700;
  margin: 10px 0;
}
.certificate-thumbnail .view-fullscreen {
  display: block;
  text-align: center;
  font-size: 11px;
  color: #667eea;
  margin-top: 10px;
  font-weight: 600;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
`;

// Initialize Certificate Modal
function initCertificateModal() {
  // Add CSS
  const styleElement = document.createElement('div');
  styleElement.innerHTML = certificateModalCSS;
  document.head.appendChild(styleElement);
  
  // Add Modal HTML
  const modalElement = document.createElement('div');
  modalElement.innerHTML = certificateModalHTML;
  document.body.appendChild(modalElement);
}

// Show Certificate Modal
function showCertificateModal(courseName, userName, courseId) {
  const modal = document.getElementById('certificateModal');
  const preview = document.getElementById('certificatePreview');
  
  // Generate certificate ID
  const certId = `SM-${courseId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Render certificate
  preview.innerHTML = `
    <div class="sample-certificate">
      <div class="cert-header">
        <div class="cert-logo">SmartMock</div>
        <div class="cert-title">Certificate of Completion</div>
        <div class="cert-subtitle">This certifies that</div>
      </div>
      
      <div class="cert-body">
        <div class="cert-recipient">${userName}</div>
        <div class="cert-subtitle">has successfully completed</div>
        <div class="cert-course">${courseName}</div>
        <div class="cert-description">
          This achievement demonstrates proficiency in the course material,
          completion of all modules, and dedication to continuous learning
          through the SmartMock platform.
        </div>
      </div>
      
      <div class="cert-footer">
        <div class="cert-signature">
          <div class="cert-signature-line"></div>
          <div class="cert-signature-name">Platform Director</div>
          <div class="cert-signature-title">SmartMock Education</div>
        </div>
        <div class="cert-signature">
          <div class="cert-signature-line"></div>
          <div class="cert-signature-name">Chief Instructor</div>
          <div class="cert-signature-title">Technical Lead</div>
        </div>
      </div>
      
      <div class="cert-seal">
        VERIFIED<br>SMARTMOCK
      </div>
      <div class="cert-date">Date: ${date}</div>
      <div class="cert-id">Certificate ID: ${certId}</div>
    </div>
  `;
  
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

// Close Certificate Modal
function closeCertificateModal() {
  const modal = document.getElementById('certificateModal');
  modal.classList.remove('show');
  document.body.style.overflow = 'auto';
}

// Add Certificate Thumbnail to Courses Page
function addCertificateThumbnail(containerSelector, courseName) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  
  const userName = firebase.auth().currentUser?.displayName || 'Your Name';
  const courseId = courseName.toLowerCase().replace(/\s+/g, '-');
  
  const thumbnail = document.createElement('div');
  thumbnail.className = 'certificate-thumbnail';
  thumbnail.onclick = () => showCertificateModal(courseName, userName, courseId);
  
  thumbnail.innerHTML = `
    <div class="mini-cert-logo">SmartMock</div>
    <div class="mini-cert-title">Certificate of Completion</div>
    <div class="mini-cert-text">This certifies that</div>
    <div class="mini-cert-name">${userName}</div>
    <div class="mini-cert-text">has completed</div>
    <div class="mini-cert-text"><strong>${courseName}</strong></div>
    <div class="view-fullscreen">🔍 Click to view fullscreen</div>
  `;
  
  container.appendChild(thumbnail);
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCertificateModal);
} else {
  initCertificateModal();
}

// Export functions
window.showCertificateModal = showCertificateModal;
window.closeCertificateModal = closeCertificateModal;
window.addCertificateThumbnail = addCertificateThumbnail;
