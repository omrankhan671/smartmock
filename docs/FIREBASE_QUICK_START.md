# 🚀 QUICK START - Firebase Setup Checklist

Follow these steps to get your SmartMock application running with Firebase Authentication and Database.

---

## ✅ Step 1: Create Firebase Project (2 minutes)

1. Go to https://console.firebase.google.com/
2. Click **"Create a new project"**
3. Project name: `smartmock-project` (or your preferred name)
4. Google Analytics: Optional (you can disable)
5. Click **"Create project"**
6. Wait for project to be created
7. Click **"Continue"**

**✓ You should now see your Firebase project dashboard**

---

## ✅ Step 2: Enable Email/Password Authentication (1 minute)

1. In Firebase Console, click **"Build"** in left sidebar
2. Click **"Authentication"**
3. Click **"Get started"**
4. Click **"Email/Password"** (first option)
5. Toggle **"Enable"** switch ON
6. Click **"Save"**

**✓ Email/Password authentication is now enabled**

---

## ✅ Step 3: Create Realtime Database (1 minute)

1. In Firebase Console, click **"Build"** → **"Realtime Database"**
2. Click **"Create Database"**
3. Choose your database location (select closest region):
   - United States: `us-central1`
   - Europe: `europe-west1`
   - Asia: `asia-southeast1`
4. Security rules: Select **"Start in locked mode"**
5. Click **"Enable"**

**✓ You should see your database URL like: `https://smartmock-xxxxx-default-rtdb.firebaseio.com`**

---

## ✅ Step 4: Set Security Rules (2 minutes)

1. In **Realtime Database** page, click **"Rules"** tab at top
2. Delete all existing text
3. Open `FIREBASE_MIGRATION_COMPLETE.md` in your project
4. Copy the entire JSON security rules (from `{` to `}`)
5. Paste into Firebase Rules editor
6. Click **"Publish"** button
7. Confirm by clicking **"Publish"** again in dialog

**✓ Security rules status should show "Active" with today's date**

---

## ✅ Step 5: Get Your Firebase Configuration (2 minutes)

1. Click the **⚙️ gear icon** (Project settings) in left sidebar
2. Scroll down to **"Your apps"** section
3. If you see "Add an app to get started" → click **Web icon** `</>`
4. App nickname: `SmartMock Web` (or anything you want)
5. **Don't check** "Also set up Firebase Hosting"
6. Click **"Register app"**
7. You'll see a code snippet with `firebaseConfig` object
8. **COPY** these values (you'll need them next):

```javascript
apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
authDomain: "smartmock-xxxxx.firebaseapp.com"
databaseURL: "https://smartmock-xxxxx-default-rtdb.firebaseio.com"
projectId: "smartmock-xxxxx"
storageBucket: "smartmock-xxxxx.appspot.com"
messagingSenderId: "123456789012"
appId: "1:123456789012:web:abcdef0123456789abcdef"
```

9. Click **"Continue to console"**

**✓ Keep this page open - you'll need these values**

---

## ✅ Step 6: Configure Your Project (3 minutes)

### Option A: Direct Configuration (Quick & Easy)

1. Open `assets/js/firebase-config.js` in your code editor
2. Find this section near the top:

```javascript
const firebaseConfig = {
  apiKey: window.FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: window.FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  // ... etc
};
```

3. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyYOUR_ACTUAL_API_KEY",
  authDomain: "smartmock-12345.firebaseapp.com",
  databaseURL: "https://smartmock-12345-default-rtdb.firebaseio.com",
  projectId: "smartmock-12345",
  storageBucket: "smartmock-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:your_actual_app_id"
};
```

4. Save the file

**⚠️ Note: This method embeds your API key in code. It's fine for testing, but for production, use Option B below.**

### Option B: Environment Variables (Recommended for Production)

1. Find `.env.example` file in your project root
2. Copy it and rename to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```

3. Open `.env` in your code editor
4. Replace the placeholder values with your actual Firebase config:

```env
FIREBASE_API_KEY=AIzaSyYOUR_ACTUAL_API_KEY
FIREBASE_AUTH_DOMAIN=smartmock-12345.firebaseapp.com
FIREBASE_DATABASE_URL=https://smartmock-12345-default-rtdb.firebaseio.com
FIREBASE_PROJECT_ID=smartmock-12345
FIREBASE_STORAGE_BUCKET=smartmock-12345.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:your_actual_app_id
```

5. Save the file
6. Make sure `.env` is in your `.gitignore` (it already is)

**✓ Your Firebase credentials are now configured securely**

---

## ✅ Step 7: Start Your Server (1 minute)

1. Open terminal in your project directory
2. If server is already running, stop it (Ctrl+C)
3. Start the server:

```powershell
cd server
npm start
```

4. You should see:

```
╔════════════════════════════════════════╗
║   SmartMock Certificate Server        ║
║   🚀 Running on port 5000              ║
╚════════════════════════════════════════╝
✅ Server is ready to accept requests
```

**✓ Server is running at http://localhost:5000**

---

## ✅ Step 8: Test Authentication (2 minutes)


1. Open browser: http://localhost:5000/index.html
2. Click **"Create Account"** tab
3. Fill in:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `test123456` (min 6 characters)
4. Click **"Create Account"**
5. Should redirect to home page automatically
6. Check browser console (F12):
   - Should see: `✅ Firebase initialized successfully`
   - Should see: `✅ User signed in: test@example.com`

7. **Verify in Firebase Console:**
   - Go to Firebase Console → Authentication → Users
   - Should see `test@example.com` listed

**✓ If you see the new user in Firebase Console, authentication works!**

### Sign In Test

1. Open new incognito/private window (to test fresh login)
2. Go to http://localhost:5000/index.html
3. Sign in with:
   - Email: `test@example.com`
   - Password: `test123456`
4. Click **"Continue"**
5. Should redirect to home page

**✓ Authentication is working!**

---

## ✅ Step 9: Test Certificate Save (3 minutes)

1. While logged in, navigate through the app to complete a course
2. Or directly go to: http://localhost:5000/certificate.html?student=Test%20User&course=JavaScript
3. A certificate should generate
4. Check browser console - should see:
   ```
   ✅ Certificate saved to Firebase: SM-2025-JS-XXXXXX
   ```

5. **Verify in Firebase Console:**
   - Firebase Console → Realtime Database → Data tab
   - Expand `/certificates/`
   - Should see your certificate: `/certificates/SM-2025-JS-XXXXXX/`
   - Expand `/users/{userId}/certificates/`
   - Should see certificate reference

**✓ Certificate saving works!**

---

## ✅ Step 10: Test Interview Report (5 minutes)

1. Navigate to: http://localhost:5000/interview/cs/ai-interview.html
2. Allow camera access (or use mock mode)
3. Select topic and level
4. Click "Start Interview"
5. Answer questions (speak or type)
6. Complete the interview
7. Check browser console - should see:
   ```
   ✅ Interview report saved to Firebase: SESSION-xxxxx
   ```

8. **Verify in Firebase Console:**
   - Firebase Console → Realtime Database → Data
   - Expand `/interviews/{userId}/`
   - Should see session: `/interviews/{userId}/SESSION-xxxxx/`
   - Click to see all questions, answers, feedback, emotions

**✓ Interview reports saving works!**

---

## ✅ Step 11: Test Profile & Certificates List (2 minutes)

1. Click **"Profile"** in navigation
2. Should show your name and email
3. Should show list of certificates (if you've earned any)
4. Click "Edit" button
5. Change your name
6. Click "Save"
7. Should see: `✅ Profile updated successfully!`

8. **Verify in Firebase Console:**
   - Firebase Console → Realtime Database → Data
   - Expand `/users/{userId}/`
   - Should see updated `displayName`

**✓ Profile management works!**

---

## ✅ Step 12: Test Sign Out (1 minute)

1. Click **"Sign out"** button in navigation
2. Should redirect to login page (index.html)
3. Try accessing http://localhost:5000/home.html directly
4. Should auto-redirect back to index.html

**✓ Authentication protection works!**

---

## 🎉 Setup Complete!

### What You've Achieved:

✅ Firebase project created  
✅ Authentication enabled  
✅ Realtime Database created  
✅ Security rules published  
✅ Application configured  
✅ All features tested and working  

### Your Application Now Has:

- 🔐 **Secure User Authentication** (Email/Password)
- 👤 **User Profiles** (stored in Firebase)
- 📜 **Certificates** (public verification, private ownership)
- 📊 **Interview Reports** (completely private per user)
- 💾 **Real-time Sync** (data syncs across devices)
- 🔒 **Security Rules** (validated access control)
- 📱 **Offline Support** (localStorage fallback)

---

## 📚 Next Steps

### For Development:
- Read `FIREBASE_AUTH_GUIDE.md` for API documentation
- Read `FIREBASE_MIGRATION_COMPLETE.md` for detailed implementation info
- Check browser console for any errors or warnings

### For Production:
- Use environment variables (`.env`) for Firebase config
- Enable Firebase Hosting for deployment
- Set up custom domain
- Monitor usage in Firebase Console
- Consider upgrading to Blaze plan if free tier exceeded

### Common Tasks:

**View all users:**
Firebase Console → Authentication → Users

**View all data:**
Firebase Console → Realtime Database → Data

**Check security rules:**
Firebase Console → Realtime Database → Rules

**Monitor usage:**
Firebase Console → Project Settings → Usage and billing

**Export data:**
Firebase Console → Realtime Database → Data → Right-click → Export JSON

---

## 🆘 Troubleshooting

### Error: "Permission denied"
- **Fix**: Verify security rules are published (Step 4)
- **Check**: Firebase Console → Database → Rules tab

### Error: "User not authenticated"
- **Fix**: Sign in first at index.html
- **Check**: Run `isAuthenticated()` in browser console

### Error: "Firebase SDK not loaded"
- **Fix**: Check your `.env` file has correct values
- **Fix**: Restart server after changing `.env`

### Error: "Invalid certificate ID"
- **Fix**: Certificate IDs must match format `SM-YYYY-DEPT-XXXXXX`
- **Example**: `SM-2025-CS-ABC123`

### Can't see data in Firebase Console
- **Fix**: Make sure you're logged in as the correct user
- **Check**: Data is stored under `/users/{userId}/` - find your userId
- **Check**: Browser console for errors

### Still having issues?
1. Check browser console (F12) for error messages
2. Check server terminal for error logs
3. Verify all setup steps completed
4. Review `FIREBASE_AUTH_GUIDE.md` for detailed docs

---

## 📞 Support Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Realtime Database Guide**: https://firebase.google.com/docs/database
- **Security Rules Reference**: https://firebase.google.com/docs/database/security
- **Project Documentation**: See all `.md` files in project root

---

**Setup Guide Version**: 1.0  
**Last Updated**: October 31, 2025  
**Estimated Total Time**: 20-25 minutes  
**Difficulty**: Easy (copy-paste friendly)
