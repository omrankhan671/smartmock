# Firebase Integration Guide

## Overview
SmartMock uses Firebase Realtime Database to securely store and verify certificates. This guide walks you through setting up Firebase for your project.

## Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a new project"
3. Enter project name: `smartmock-project`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Set Up Realtime Database & Authentication
1. In Firebase Console, navigate to **Build** → **Authentication**
2. Click "Get started"
3. Enable **Email/Password** authentication:
   - Click "Email/Password"
   - Toggle "Enable"
   - Click "Save"

4. Navigate to **Build** → **Realtime Database**
5. Click "Create Database"
6. Choose region (closest to your location)
7. Select "Start in **locked mode**" (we'll add proper rules next)
8. Click "Enable"
9. Note your **Database URL** (format: `https://your-project.firebaseio.com`)

### 3. Get Web Configuration
1. In Firebase Console, click the gear icon (Project Settings)
2. Scroll to "Your apps" section
3. Click "Web" icon (or register if needed)
4. Copy the configuration object
5. Extract these values:
   - `apiKey`
   - `authDomain`
   - `databaseURL`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

### 4. Configure SmagrtMock
Choose one method:

#### Method A: Direct Configuration (Development Only)
1. Edit `assets/js/firebase-config.js`
2. Replace the placeholder values with your Firebase config
3. **⚠️ WARNING**: Do not commit actual API keys to Git!

#### Method B: Environment Variables (Recommended for Security)
1. Copy `.env.example` to `.env` (local file, not committed)
2. Fill in your Firebase credentials:
   ```
   FIREBASE_API_KEY=AIzaSy...
   FIREBASE_AUTH_DOMAIN=smartmock-project.firebaseapp.com
   FIREBASE_DATABASE_URL=https://smartmock-project.firebaseio.com
   FIREBASE_PROJECT_ID=smartmock-project
   FIREBASE_STORAGE_BUCKET=smartmock-project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=123456789
   FIREBASE_APP_ID=1:123456789:web:abc123xyz
   ```
3. Load these variables in your app startup (see "Environment Loading" below)

### 5. Set Security Rules
In Firebase Console:
1. Go to **Realtime Database** → **Rules**
2. Replace the default rules with the comprehensive rules below:

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid",
        ".validate": "newData.hasChildren(['email', 'displayName'])",
        "email": {
          ".validate": "newData.isString() && newData.val().matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i)"
        },
        "displayName": {
          ".validate": "newData.isString() && newData.val().length > 0"
        },
        "createdAt": {
          ".validate": "newData.isString()"
        },
        "lastLogin": {
          ".validate": "newData.isString()"
        },
        "updatedAt": {
          ".validate": "newData.isString()"
        },
        "certificates": {
          "$certificateId": {
            ".validate": "newData.hasChildren(['certificateId', 'courseName', 'dateIssued'])"
          }
        }
      }
    },
    "certificates": {
      "$certificateId": {
        ".read": true,
        ".write": "auth != null && (!data.exists() || data.child('userId').val() === auth.uid)",
        ".validate": "newData.hasChildren(['certificateId', 'studentName', 'courseName', 'issueDate', 'userId'])",
        "certificateId": {
          ".validate": "newData.isString() && newData.val().matches(/^SM-\\d{4}-[A-Z]{2,4}-[A-Z0-9]{6}$/)"
        },
        "studentName": {
          ".validate": "newData.isString() && newData.val().length > 0"
        },
        "courseName": {
          ".validate": "newData.isString() && newData.val().length > 0"
        },
        "issueDate": {
          ".validate": "newData.isString()"
        },
        "dateIssued": {
          ".validate": "newData.isString()"
        },
        "userId": {
          ".validate": "newData.val() === auth.uid"
        },
        "verified": {
          ".validate": "newData.isBoolean()"
        },
        "createdAt": {
          ".validate": "newData.isString()"
        },
        "updatedAt": {
          ".validate": "newData.isString()"
        }
      }
    },
    "interviews": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid",
        "$sessionId": {
          ".validate": "newData.hasChildren(['sessionId', 'userId', 'createdAt'])",
          "sessionId": {
            ".validate": "newData.isString()"
          },
          "userId": {
            ".validate": "newData.val() === auth.uid"
          },
          "userName": {
            ".validate": "newData.isString()"
          },
          "department": {
            ".validate": "newData.isString() && newData.val().matches(/^(cs|ee|me|ce|ec)$/)"
          },
          "topic": {
            ".validate": "newData.isString()"
          },
          "level": {
            ".validate": "newData.isString() && newData.val().matches(/^(Beginner|Intermediate|Advanced)$/)"
          },
          "summary": {
            ".validate": "newData.isString()"
          },
          "questions": {
            ".validate": "newData.hasChildren()"
          },
          "answers": {
            ".validate": "newData.hasChildren()"
          },
          "feedback": {
            ".validate": "newData.hasChildren()"
          },
          "wpm": {
            ".validate": "newData.isNumber() && newData.val() >= 0"
          },
          "expressions": {
            ".validate": "newData.hasChildren()"
          },
          "expressionCounts": {
            ".validate": "newData.hasChildren()"
          },
          "startedAt": {
            ".validate": "newData.isString()"
          },
          "endedAt": {
            ".validate": "newData.isString()"
          },
          "createdAt": {
            ".validate": "newData.isString()"
          },
          "updatedAt": {
            ".validate": "newData.isString()"
          }
        }
      }
    }
  }
}
```

3. Click "Publish"

**Security Rules Explained:**

**Users Collection** (`/users/{userId}/`):
- **Read/Write**: Only the authenticated user can read/write their own data
- **Validation**: Requires email and displayName fields
- **Email validation**: Must match email format regex
- **Certificates subcollection**: Stores references to user's certificates

**Certificates Collection** (`/certificates/{certificateId}/`):
- **Read**: Public (anyone can verify certificates)
- **Write**: Authenticated users only; users can only modify their own certificates
- **Validation**: 
  - Required fields: certificateId, studentName, courseName, issueDate, userId
  - Certificate ID must match pattern: `SM-YYYY-DEPT-XXXXXX`
  - userId must match authenticated user
- **Use case**: Public verification while preventing unauthorized modifications

**Interviews Collection** (`/interviews/{userId}/{sessionId}/`):
- **Read/Write**: Only the authenticated user can access their own interview reports
- **Validation**:
  - Required fields: sessionId, userId, createdAt
  - Department must be one of: cs, ee, me, ce, ec
  - Level must be: Beginner, Intermediate, or Advanced
  - userId must match authenticated user
  - WPM must be non-negative number
- **Use case**: Private storage of interview performance data

**Key Security Features:**
- ✅ Authentication required for all writes (except public certificate reads)
- ✅ Users can only access their own data
- ✅ Data validation ensures correct structure and format
- ✅ Regex patterns prevent injection attacks
- ✅ Certificate verification remains publicly accessible
- ✅ Interview reports are completely private

### 6. Test Connection
1. Open your SmartMock application
2. Open browser console (F12)
3. Look for log message: "Firebase initialized successfully"
4. Complete a course and generate a certificate
5. Check Firebase Console → Realtime Database → Data tab
6. You should see certificates being stored under `/certificates/`

## Environment Loading

If using environment variables, add this code to `assets/js/firebase-config.js`:

```javascript
// Load environment variables (development only)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  fetch('.env')
    .then(response => response.text())
    .then(data => {
      const lines = data.split('\n');
      lines.forEach(line => {
        if (line && !line.startsWith('#')) {
          const [key, value] = line.split('=');
          if (key && value) {
            window[key.trim()] = value.trim();
          }
        }
      });
    })
    .catch(error => console.warn('Could not load .env file:', error));
}
```

## Firebase Security Rules Explained

- **`.read: true`**: Anyone can read certificates (needed for verification)
- **`.write: false`**: Direct writes disabled (only backend can write via Admin SDK)
- **Validation**: Ensures required fields are present
- **No authentication required**: Makes certificates easily verifiable

### For Production
Consider implementing authentication:

```json
{
  "rules": {
    "certificates": {
      ".read": true,
      ".write": "root.child('users').child(auth.uid).exists()",
      "$certificateId": {
        ".validate": "newData.hasChildren(['certificateId', 'studentName', 'courseName', 'issueDate'])"
      }
    }
  }
}
```

## Fallback to localStorage

If Firebase is not available:
1. The app automatically falls back to localStorage
2. Certificates stored locally won't sync across devices
3. Verification still works on the same browser

This hybrid approach ensures the app works even if Firebase is down.

## Backup & Export

### Export Certificates from Firebase
1. Firebase Console → Realtime Database → Data tab
2. Right-click `/certificates/` → "Export JSON"
3. Save the file as `certificates-backup.json`

### Import to Another Firebase Project
1. Firebase Console → Realtime Database → Data tab
2. Right-click root `/` → "Import JSON"
3. Select `certificates-backup.json`

## Monitoring & Analytics

### Check Usage
- Firebase Console → Realtime Database → Usage tab
- Monitor read/write operations
- View bandwidth usage

### Debug Issues
1. Open browser console (F12)
2. Look for Firebase initialization messages
3. Check Network tab for Firebase requests
4. Verify database URL is correct

## Troubleshooting

### Firebase Not Initializing
**Problem**: "Firebase SDK not loaded" error
- **Solution**: Verify Firebase script tags are loaded before `firebase-config.js`
- Check browser console for CDN errors

### "Permission denied" when writing
**Problem**: Cannot save certificates
- **Solution**: Check Firebase rules allow writes (or use Admin SDK for backend)
- Verify database URL is correct

### Certificates not syncing
**Problem**: Certificate saved locally but not in Firebase
- **Solution**: Check network tab - verify Firebase requests succeed
- Check browser console for Firebase errors
- Ensure `.env` variables are loaded correctly

### QR Code verification fails
**Problem**: Scanning QR code shows "Not Found"
- **Solution**: Make sure certificate is saved to Firebase first
- Wait a moment for data to sync
- Try refreshing the verification page
- Manually enter certificate ID to test

## Best Practices

1. **Never commit `.env` to Git**
   - Add `.env` to `.gitignore` (already done)
   - Use `.env.example` as template

2. **Rotate API Keys Regularly**
   - Monthly or when staff changes
   - Regenerate in Firebase Console settings

3. **Use Environment-Specific Configs**
   - `.env.development` for local testing
   - `.env.production` for live deployment

4. **Monitor Database Size**
   - Firebase free tier: 1 GB
   - Upgrade to Blaze pay-as-you-go if needed

5. **Test Backup/Restore Processes**
   - Export certificates monthly
   - Test import in separate project

## Security Checklist

- [ ] Firebase project created
- [ ] Realtime Database enabled
- [ ] Security rules published
- [ ] API keys configured (not committed)
- [ ] `.gitignore` includes `.env` and `logs/`
- [ ] Test certificate save works
- [ ] Test certificate verification works
- [ ] Test fallback to localStorage (disable Firebase temporarily)

## Support

For Firebase documentation: https://firebase.google.com/docs/database
For SmartMock issues: contact support@smartmock.com (demo)

---

**Last Updated**: October 2025  
**Firebase SDK Version**: 9.23.0
