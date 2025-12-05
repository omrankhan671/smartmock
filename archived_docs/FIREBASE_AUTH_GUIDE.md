# Firebase Authentication & Database Integration Guide

## Overview
SmartMock now uses Firebase for:
- ✅ **User Authentication** (Email/Password)
- ✅ **User Profiles** Storage
- ✅ **Interview Reports** Storage (private per user)
- ✅ **Certificates** Storage (public verification)

## What Changed?

### Before (MongoDB):
- Backend server required
- Database connection issues blocked functionality
- No built-in authentication
- Complex setup with Atlas/local MongoDB

### After (Firebase):
- ✅ No backend required (serverless)
- ✅ Built-in authentication
- ✅ Real-time database sync
- ✅ Automatic offline support
- ✅ Simple cloud setup

## Quick Start

### 1. Create Firebase Project
```bash
1. Go to https://console.firebase.google.com/
2. Click "Create a new project"
3. Name: "smartmock-project"
4. Enable Google Analytics: Optional
5. Click "Create project"
```

### 2. Enable Authentication
```bash
Firebase Console → Build → Authentication → Get started
→ Email/Password → Enable → Save
```

### 3. Create Realtime Database
```bash
Firebase Console → Build → Realtime Database → Create Database
→ Choose region (closest to you)
→ Start in "locked mode"
→ Enable
```

### 4. Copy Your Configuration
```bash
Firebase Console → Project Settings (⚙️) → Your apps
→ Web (</>) → Register app
→ Copy the config object
```

### 5. Update `.env` File
Copy `.env.example` to `.env` and fill in your Firebase config:

```env
FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FIREBASE_AUTH_DOMAIN=smartmock-12345.firebaseapp.com
FIREBASE_DATABASE_URL=https://smartmock-12345-default-rtdb.firebaseio.com
FIREBASE_PROJECT_ID=smartmock-12345
FIREBASE_STORAGE_BUCKET=smartmock-12345.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdef0123456789abcdef
```

### 6. Set Security Rules
Copy the rules from `FIREBASE_SETUP.md` section 5 and paste in:
```bash
Firebase Console → Realtime Database → Rules → [Paste rules] → Publish
```

## Database Structure

```
firebase-root/
├── users/
│   └── {userId}/
│       ├── email: string
│       ├── displayName: string
│       ├── createdAt: timestamp
│       ├── lastLogin: timestamp
│       └── certificates/
│           └── {certificateId}/
│               ├── certificateId: string
│               ├── courseName: string
│               └── dateIssued: string
│
├── certificates/
│   └── {certificateId}/
│       ├── certificateId: string (SM-YYYY-DEPT-XXXXXX)
│       ├── studentName: string
│       ├── courseName: string
│       ├── issueDate: ISO timestamp
│       ├── dateIssued: formatted date
│       ├── userId: string (owner)
│       ├── verified: boolean
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
└── interviews/
    └── {userId}/
        └── {sessionId}/
            ├── sessionId: string
            ├── userId: string
            ├── userName: string
            ├── department: string (cs|ee|me|ce|ec)
            ├── topic: string
            ├── level: string (Beginner|Intermediate|Advanced)
            ├── summary: string
            ├── questions: array
            ├── answers: array
            ├── feedback: array
            ├── wpm: number
            ├── expressions: array
            ├── expressionCounts: object
            ├── startedAt: timestamp
            ├── endedAt: timestamp
            ├── createdAt: timestamp
            └── updatedAt: timestamp
```

## API Functions Available

### Authentication

```javascript
// Sign up new user
const result = await signUpWithEmail(email, password, displayName);
if (result.success) {
  console.log('User created:', result.user);
} else {
  console.error('Error:', result.error);
}

// Sign in existing user
const result = await signInWithEmail(email, password);
if (result.success) {
  console.log('Signed in:', result.user);
}

// Sign out
await signOut(); // Redirects to login page

// Reset password
const result = await resetPassword(email);
if (result.success) {
  alert('Password reset email sent!');
}

// Check authentication status
if (isAuthenticated()) {
  const userId = getCurrentUserId();
  const email = getCurrentUserEmail();
  const name = getCurrentUserDisplayName();
}
```

### User Profile

```javascript
// Save user profile
await saveUserProfile(userId, {
  email: 'user@example.com',
  displayName: 'John Doe',
  createdAt: new Date().toISOString()
});

// Update profile
await updateUserProfile(userId, {
  displayName: 'Jane Doe',
  bio: 'Software Engineer'
});

// Get profile
const result = await getUserProfile(userId);
if (result.success) {
  console.log(result.data);
}
```

### Certificates

```javascript
// Save certificate
const certificateData = {
  certificateId: 'SM-2025-CS-ABC123',
  studentName: 'John Doe',
  courseName: 'JavaScript Fundamentals',
  issueDate: new Date().toISOString(),
  dateIssued: '2025-10-31',
  verified: true
};

const result = await saveCertificate(certificateData);
if (result.success) {
  console.log('Certificate saved!');
}

// Get certificate (public - for verification)
const result = await getCertificate('SM-2025-CS-ABC123');
if (result.success) {
  console.log('Certificate found:', result.data);
} else {
  console.log('Certificate not found');
}

// Get all user's certificates
const result = await getUserCertificates();
if (result.success) {
  Object.keys(result.data).forEach(certId => {
    console.log(result.data[certId]);
  });
}
```

### Interview Reports

```javascript
// Save interview report
const reportData = {
  sessionId: 'SESSION-' + Date.now(),
  userName: 'John Doe',
  department: 'cs',
  topic: 'JavaScript',
  level: 'Intermediate',
  summary: 'Good performance overall',
  questions: ['Q1', 'Q2', 'Q3'],
  answers: ['A1', 'A2', 'A3'],
  feedback: ['Good', 'Excellent', 'Needs improvement'],
  wpm: 145,
  expressions: ['happy', 'confident', 'neutral'],
  expressionCounts: { happy: 10, confident: 8, neutral: 5 },
  startedAt: new Date().toISOString(),
  endedAt: new Date().toISOString()
};

const result = await saveInterviewReport(reportData);
if (result.success) {
  console.log('Report saved, session ID:', result.sessionId);
}

// Update interview report
await updateInterviewReport(sessionId, {
  endedAt: new Date().toISOString(),
  summary: 'Updated summary'
});

// Get specific interview report
const result = await getInterviewReport(sessionId);
if (result.success) {
  console.log(result.data);
}

// Get all user's interview reports
const result = await getUserInterviewReports();
if (result.success) {
  Object.keys(result.data).forEach(sessionId => {
    console.log(result.data[sessionId]);
  });
}

// Delete interview report
await deleteInterviewReport(sessionId);
```

## Security Features

### Authentication Required
- All writes require authenticated users
- Users can only access their own data
- Interview reports are completely private

### Public Certificate Verification
- Certificates are publicly readable (for QR verification)
- Only owners can modify their certificates
- Certificate ID format validated: `SM-YYYY-DEPT-XXXXXX`

### Data Validation
- Email format validation
- Department must be: cs, ee, me, ce, ec
- Level must be: Beginner, Intermediate, Advanced
- WPM must be non-negative number
- All required fields enforced

### Automatic Protection
- XSS prevention through Firebase SDK
- CSRF protection built-in
- Rate limiting by Firebase
- Secure HTTPS connections only

## Migration from MongoDB

If you have existing MongoDB data:

### Export from MongoDB
```javascript
// In MongoDB Compass or Shell
db.certificates.find().forEach(cert => {
  printjson(cert);
});
```

### Import to Firebase
```javascript
// Use Firebase Console or script:
const certs = [ /* your MongoDB data */ ];
certs.forEach(async cert => {
  await saveCertificate({
    certificateId: cert.certificateId,
    studentName: cert.studentName,
    courseName: cert.courseName,
    issueDate: cert.issueDate,
    dateIssued: cert.dateIssued,
    verified: true
  });
});
```

## Testing

### Test Authentication
1. Open `index.html`
2. Create account with email/password
3. Check Firebase Console → Authentication → Users
4. Should see new user listed

### Test Certificate Save
1. Complete a course
2. Generate certificate
3. Check Firebase Console → Realtime Database → certificates
4. Should see certificate data

### Test Interview Report
1. Complete AI interview
2. Finish all questions
3. Check Firebase Console → Realtime Database → interviews/{userId}
4. Should see report data

## Troubleshooting

### "Permission denied" Error
- **Cause**: Security rules not published or user not authenticated
- **Fix**: Publish rules from `FIREBASE_SETUP.md` section 5
- **Verify**: Check Firebase Console → Database → Rules tab

### "User not authenticated" Error
- **Cause**: Trying to save data while logged out
- **Fix**: Ensure user is signed in before saving
- **Check**: Run `isAuthenticated()` in console

### "Invalid certificate ID" Error
- **Cause**: Certificate ID doesn't match required format
- **Fix**: Use format `SM-YYYY-DEPT-XXXXXX` (e.g., `SM-2025-CS-ABC123`)

### Data Not Showing in Console
- **Cause**: User doesn't have permission or data doesn't exist
- **Fix**: Check you're logged in as the correct user
- **Debug**: Check browser console for error messages

### Firebase Not Initializing
- **Cause**: `.env` file not loaded or invalid config
- **Fix**: Verify `.env` exists with correct values
- **Check**: Console should show "✅ Firebase initialized successfully"

## Best Practices

### 1. Always Check Authentication
```javascript
if (!isAuthenticated()) {
  alert('Please sign in first');
  window.location.href = '/index.html';
  return;
}
```

### 2. Handle Errors Gracefully
```javascript
const result = await saveInterviewReport(data);
if (!result.success) {
  console.error('Save failed:', result.error);
  // Fallback to localStorage
  localStorage.setItem('backup', JSON.stringify(data));
}
```

### 3. Use Fallbacks
```javascript
// Try Firebase first, fallback to localStorage
try {
  await saveCertificate(cert);
} catch (error) {
  localStorage.setItem(`cert_${certId}`, JSON.stringify(cert));
}
```

### 4. Validate Before Saving
```javascript
if (!data.sessionId || !data.userId) {
  console.error('Missing required fields');
  return;
}
```

### 5. Monitor Quota Usage
- Firebase Spark (Free): 1 GB storage, 10 GB/month downloads
- Check usage: Firebase Console → Project Settings → Usage and billing

## Free Tier Limits

**Realtime Database (Spark Plan):**
- 1 GB stored data
- 10 GB/month downloads
- 100 simultaneous connections

**Authentication:**
- Unlimited users
- Unlimited sign-ins

**Upgrading:**
- Switch to Blaze (pay-as-you-go) if limits exceeded
- Costs: $5/GB storage, $1/GB download

## Support

- Firebase Documentation: https://firebase.google.com/docs
- SmartMock Issues: Create issue in GitHub
- Security Rules: https://firebase.google.com/docs/database/security

---

**Last Updated**: October 31, 2025  
**Firebase SDK Version**: 9.23.0  
**Compatible with**: SmartMock v2.0+
