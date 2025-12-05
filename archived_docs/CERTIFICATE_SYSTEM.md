# SmartMock Certificate Verification System

## Overview
SmartMock now features a comprehensive certificate verification system with unique certificate IDs and QR codes. This allows recruiters and employers to verify the authenticity of certificates issued to students.

## Features

### 1. **Unique Certificate IDs**
- Format: `SM-YEAR-INITIALS-CODE`
- Example: `SM-2025-DSA-A1B2C3`
- Components:
  - `SM` - SmartMock prefix
  - `YEAR` - Year of issuance (e.g., 2025)
  - `INITIALS` - First letters of course name (2-4 characters)
  - `CODE` - Random 6-character alphanumeric code

### 2. **QR Code Generation**
- Each certificate includes a QR code
- Scanning the QR code redirects to verification page with certificate ID pre-filled
- QR codes contain the full verification URL

### 3. **Certificate Verification Page**
- URL: `verify-certificate.html`
- Features:
  - Manual search by certificate ID
  - QR code scanning (placeholder for future implementation)
  - Real-time validation
  - Displays full certificate details if valid
  - Shows error message if certificate not found

### 4. **Professional Certificate Design**
- Modern gradient border
- Watermark background
- Animated verification seal
- Certificate ID prominently displayed
- QR code for easy verification
- Print and download PDF functionality
- Responsive design for all devices

## How It Works

### For Students

1. **Complete a Course**
   - Watch all course videos
   - Check the "Mark as complete" checkbox
   - Click "View Certificate" button

2. **Certificate Generation**
   - System automatically generates unique certificate ID
   - Certificate is stored in browser's localStorage
   - QR code is generated linking to verification page
   - Student can download, print, or share certificate

### For Recruiters/Employers

1. **Verify Certificate by ID**
   - Visit `verify-certificate.html`
   - Enter certificate ID (e.g., SM-2025-DSA-A1B2C3)
   - Click "Verify" button
   - View certificate details if valid

2. **Verify Certificate by QR Code**
   - Scan QR code on certificate using smartphone camera
   - Automatically redirects to verification page
   - Certificate details displayed immediately

## Technical Implementation

### Files Modified/Created

1. **certificate.html**
   - Enhanced with professional design
   - Added certificate ID display section
   - Added QR code container
   - Included QRCode.js library

2. **certificate.css**
   - Professional gradient design
   - Watermark styling
   - Animated verification seal
   - QR code styling
   - Responsive layout

3. **certificate.js**
   - `generateCertificateId()` - Creates unique IDs
   - `storeCertificate()` - Saves to localStorage
   - `generateQRCode()` - Creates QR code using QRCode.js

4. **verify-certificate.html** (NEW)
   - Full verification page
   - Search functionality
   - Certificate validation logic
   - Display certificate details
   - Error handling

5. **main.js**
   - Updated certificate button click handler
   - Added certificate ID generation on course completion
   - Integrated localStorage storage
   - Pass certificate ID to certificate page

6. **home.html**
   - Added "Verify Certificate" link to navigation menu

## Data Storage

### localStorage Structure

```javascript
// Key: 'smartmock_certificates'
// Value: Array of certificate objects
[
  {
    certificateId: "SM-2025-DSA-A1B2C3",
    studentName: "John Doe",
    courseName: "Data Structures and Algorithms",
    issueDate: "2025-01-15T10:30:00.000Z",
    dateIssued: "January 15, 2025",
    verified: true
  },
  // ... more certificates
]
```

## Security Features

1. **Format Validation**
   - Strict regex pattern: `^SM-\d{4}-[A-Z]{2,4}-[A-Z0-9]{6}$`
   - Prevents invalid certificate IDs

2. **Watermark**
   - "SMARTMOCK" watermark on certificate background
   - Prevents unauthorized duplication

3. **Verification Seal**
   - Animated seal with "VERIFIED" text
   - Visual indicator of authenticity

4. **QR Code Error Correction**
   - High error correction level (Level H)
   - QR code remains readable even if partially damaged

## Usage Examples

### Example 1: Student Completes Course
```
1. Student watches all videos in "Data Structures and Algorithms"
2. Checks "Mark as complete" checkbox
3. Clicks "View Certificate"
4. Certificate ID generated: SM-2025-DSA-K8X9P2
5. Certificate displayed with QR code
6. Student downloads/prints certificate
```

### Example 2: Recruiter Verifies Certificate
```
1. Recruiter receives certificate from candidate
2. Sees certificate ID: SM-2025-DSA-K8X9P2
3. Visits smartmock.com/verify-certificate.html
4. Enters certificate ID
5. System confirms:
   - Student: John Doe
   - Course: Data Structures and Algorithms
   - Issue Date: January 15, 2025
   - Status: Valid & Authentic
```

### Example 3: QR Code Verification
```
1. Recruiter scans QR code using smartphone
2. Redirected to: verify-certificate.html?certId=SM-2025-DSA-K8X9P2
3. Certificate details automatically displayed
4. No manual entry required
```

## Future Enhancements

1. **QR Scanner Integration**
   - Implement live QR code scanning in browser
   - Use device camera for scanning

2. **Backend Storage**
   - Move from localStorage to database
   - Enable verification across devices

3. **Certificate Revocation**
   - Add ability to revoke certificates
   - Check revocation status during verification

4. **Email Notifications**
   - Send certificate via email
   - Include verification link

5. **Blockchain Integration**
   - Store certificate hashes on blockchain
   - Immutable verification records

6. **Analytics Dashboard**
   - Track certificate issuances
   - Monitor verification requests
   - View certificate statistics

## Troubleshooting

### Certificate Not Found
- **Problem**: Verification shows "Certificate Not Found"
- **Possible Causes**:
  - Certificate ID typed incorrectly
  - Certificate generated in different browser/device
  - localStorage was cleared
- **Solution**: Verify certificate ID spelling, check original browser

### QR Code Not Displaying
- **Problem**: QR code shows "Loading..." instead of code
- **Possible Cause**: QRCode.js library not loaded
- **Solution**: Check internet connection, reload page

### PDF Download Issues
- **Problem**: PDF download not working
- **Possible Cause**: html2pdf.js library not loaded
- **Solution**: Check internet connection, use Print option instead

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Dependencies

1. **QRCode.js** (v1.0.0)
   - Source: cdnjs.cloudflare.com
   - Purpose: Generate QR codes

2. **html2pdf.js** (v0.10.1)
   - Source: cdnjs.cloudflare.com
   - Purpose: Export certificate as PDF

## Contact

For questions or issues related to certificate verification:
- Email: support@smartmock.com (demo)
- Website: www.smartmock.com (demo)

---

**Last Updated**: January 2025  
**Version**: 1.0.0
