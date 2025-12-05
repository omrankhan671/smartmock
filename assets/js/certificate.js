document.addEventListener('DOMContentLoaded', () => {
  const studentNameEl = document.getElementById('student-name');
  const courseNameEl = document.getElementById('course-name');
  const dateIssuedEl = document.getElementById('date-issued');
  const certificateIdEl = document.getElementById('certificate-id');
  const qrCodeEl = document.getElementById('qr-code');

  const urlParams = new URLSearchParams(window.location.search);
  const studentName = urlParams.get('student') || 'Jane Doe';
  const courseName = urlParams.get('course') || 'Not Specified';
  const certId = urlParams.get('certId');

  // Generate or retrieve certificate ID
  let certificateId = certId;
  if (!certificateId) {
    certificateId = generateCertificateId(courseName);
  }

  studentNameEl.textContent = studentName;
  courseNameEl.textContent = courseName;
  certificateIdEl.textContent = certificateId;
  
  const today = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const dateIssued = today.toLocaleDateString('en-US', options);
  dateIssuedEl.textContent = dateIssued;

  // Store certificate in localStorage for verification
  storeCertificate(certificateId, studentName, courseName, dateIssued);

  // Generate QR Code - use robust absolute URL via backend redirect endpoint
  const verificationUrl = `${window.location.origin}/api/verify/${encodeURIComponent(certificateId)}`;
  generateQRCode(qrCodeEl, verificationUrl);
});

function generateCertificateId(courseName) {
  // Extract course initials
  const words = courseName.split(' ').filter(w => w.length > 2);
  const initials = words.map(w => w[0].toUpperCase()).join('').substring(0, 3);
  
  // Current year
  const year = new Date().getFullYear();
  
  // Generate unique alphanumeric code
  const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // Format: SM-YEAR-INITIALS-RANDOMCODE
  return `SM-${year}-${initials}-${randomCode}`;
}

function storeCertificate(certId, studentName, courseName, dateIssued) {
  const certificateData = {
    certificateId: certId,
    studentName: studentName,
    courseName: courseName,
    issueDate: new Date().toISOString(),
    dateIssued: dateIssued,
    verified: true
  };

  // Try to save to Firebase first
  if (typeof saveCertificate === 'function') {
    saveCertificate(certificateData)
      .then(result => {
        if (result.success) {
          console.log('✅ Certificate saved to Firebase');
        } else {
          console.warn('⚠️ Firebase save failed, using localStorage fallback');
          saveToLocalStorage(certId, certificateData);
        }
      })
      .catch(error => {
        console.warn('⚠️ Firebase error, using localStorage fallback:', error);
        saveToLocalStorage(certId, certificateData);
      });
  } else {
    // Firebase not loaded, use localStorage
    console.warn('⚠️ Firebase not available, using localStorage');
    saveToLocalStorage(certId, certificateData);
  }
}

function saveToLocalStorage(certId, certificateData) {
  try {
    // Save to localStorage as fallback
    localStorage.setItem(`cert_${certId}`, JSON.stringify(certificateData));
    console.log('✅ Certificate saved to localStorage (fallback)');
  } catch (error) {
    console.error('❌ Error saving to localStorage:', error);
  }
}

function generateQRCode(element, url) {
  // Using QRCode.js library
  if (typeof QRCode !== 'undefined') {
    new QRCode(element, {
      text: url,
      width: 120,
      height: 120,
      colorDark: "#0b0f1a",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  } else {
    console.warn('QRCode library not loaded');
    element.innerHTML = '<p style="font-size: 10px; text-align: center;">QR Code<br>Loading...</p>';
  }
}
