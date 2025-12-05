# SMARTMOCK - Local Development Setup

## ⚠️ Important: Always Use a Local Server

Firebase authentication and modern web features require `http://` or `https://` protocol.
**Never open HTML files directly** (file:// protocol won't work).

## 🚀 Quick Start

### Option 1: Python (Recommended)
```bash
# Navigate to project directory
cd C:\Users\omran\smartmock

# Start server on port 8080
python -m http.server 8080

# Open in browser
http://localhost:8080
```

### Option 2: Node.js
```bash
# Install http-server globally (once)
npm install -g http-server

# Start server
http-server -p 8080

# Open in browser
http://localhost:8080
```

### Option 3: VS Code Live Server Extension
1. Install "Live Server" extension in VS Code
2. Right-click any HTML file
3. Select "Open with Live Server"

## 📂 Project Structure

```
smartmock/
├── index.html                    # Landing page (login)
├── home.html                     # Main dashboard
├── futuristic-interview.html    # Futuristic UI demo
├── 3d-interview-scene/          # Three.js 3D scene
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── README.md
├── interview/                    # Department interviews
│   ├── ee/ai-interview.html     # Electrical Engineering
│   ├── me/ai-interview.html     # Mechanical Engineering
│   ├── ce/ai-interview.html     # Civil Engineering
│   └── ec/ai-interview.html     # Electronics & Communication
└── assets/
    ├── css/
    │   ├── styles.css
    │   ├── futuristic-ui.css
    │   └── interview-room-3d.css
    └── js/
        ├── firebase-config.js
        ├── adaptive-interview.js
        └── main.js
```

## 🎨 Available Pages

### Main Application
- **http://localhost:8080/index.html** - Login page
- **http://localhost:8080/home.html** - Dashboard
- **http://localhost:8080/dashboard.html** - User dashboard
- **http://localhost:8080/interview.html** - Department selection

### AI Interview Pages
- **http://localhost:8080/interview/ee/ai-interview.html** - Electrical Engineering
- **http://localhost:8080/interview/me/ai-interview.html** - Mechanical Engineering
- **http://localhost:8080/interview/ce/ai-interview.html** - Civil Engineering
- **http://localhost:8080/interview/ec/ai-interview.html** - Electronics & Communication

### Special Pages
- **http://localhost:8080/futuristic-interview.html** - Futuristic UI Demo
- **http://localhost:8080/3d-interview-scene/** - Three.js 3D Scene

### Other Pages
- **http://localhost:8080/leaderboard.html** - Global rankings
- **http://localhost:8080/community.html** - Community features
- **http://localhost:8080/profile.html** - User profile
- **http://localhost:8080/report.html** - Performance reports

## 🔥 Firebase Setup

The application uses Firebase for:
- **Authentication** - Email/password, Google OAuth
- **Database** - Real-time database for user data
- **Storage** - File uploads (profile photos, etc.)

### Firebase Configuration
Location: `assets/js/firebase-config.js`

Current setup:
- Project ID: `smartmock-848c9`
- Auth Domain: `smartmock-848c9.firebaseapp.com`
- Database: Asia Southeast (Singapore)

### Common Firebase Errors

#### Error: "operation-not-supported-in-this-environment"
**Solution:** Use http://localhost instead of file://

#### Error: "CORS policy blocked"
**Solution:** 
1. Enable CORS in Firebase Console
2. Add localhost to authorized domains:
   - Go to Firebase Console → Authentication → Settings
   - Add `localhost` to authorized domains

#### Error: "Firebase not initialized"
**Solution:** Check that Firebase scripts are loaded:
```html
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
```

## 🛠️ Development Tips

### 1. Always Check Console
Open browser DevTools (F12) to see:
- Firebase connection status
- Error messages
- Network requests

### 2. Clear Browser Cache
If seeing old content:
- Chrome: Ctrl + Shift + Delete
- Or use Incognito mode: Ctrl + Shift + N

### 3. Check Port Availability
If port 8080 is in use:
```bash
# Use different port
python -m http.server 8081
```

### 4. Stop Server
When done:
- Terminal: Ctrl + C
- Or close terminal window

## 🎯 Testing the Application

### Test User Login
1. Open http://localhost:8080
2. Create account or sign in with Google
3. Should redirect to home.html

### Test AI Interview
1. Go to http://localhost:8080/interview.html
2. Select a department (EE, ME, CE, or EC)
3. Click "AI Interview"
4. Should load interview interface

### Test Futuristic UI
1. Go to http://localhost:8080/futuristic-interview.html
2. Should see animated 3D UI with:
   - Cybernetic avatar
   - Glassmorphic panels
   - Neon effects
   - Parallax animations

### Test 3D Scene
1. Go to http://localhost:8080/3d-interview-scene/
2. Should see Three.js scene with:
   - 3D avatar (procedural fallback)
   - Three floating panels
   - Bloom effects
   - Mouse parallax

## 🐛 Troubleshooting

### Issue: UI Not Loading
**Check:**
1. Server is running (terminal shows "Serving HTTP...")
2. Correct URL (http://localhost:8080)
3. Browser console for errors (F12)

### Issue: Firebase Errors
**Check:**
1. Using http:// (not file://)
2. Firebase scripts loaded (check Network tab)
3. Internet connection active

### Issue: 3D Scene Not Working
**Check:**
1. Browser supports WebGL (visit get.webgl.org)
2. Using modern browser (Chrome, Firefox, Edge)
3. Console errors (F12)

### Issue: CSS Not Applied
**Check:**
1. CSS files exist in assets/css/
2. No 404 errors in Network tab
3. Clear browser cache

## 📱 Mobile Testing

Test on mobile devices:
1. Get your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Start server: `python -m http.server 8080`
3. On mobile browser: `http://YOUR_IP:8080`
4. Make sure firewall allows connections

## 🔒 Security Notes

### For Development
- ✅ http://localhost is safe for development
- ✅ Firebase handles authentication securely
- ✅ Database rules control access

### For Production
- 🚀 Deploy to https:// domain
- 🔐 Update Firebase authorized domains
- 🛡️ Configure CORS properly
- 🔑 Use environment variables for keys

## 📚 Additional Resources

- **Firebase Console:** https://console.firebase.google.com/
- **Three.js Docs:** https://threejs.org/docs/
- **MDN Web Docs:** https://developer.mozilla.org/

## ⚡ Quick Commands Reference

```bash
# Start server
python -m http.server 8080

# Different port
python -m http.server 8081

# Check if port is in use (Windows)
netstat -ano | findstr :8080

# Open in default browser (Windows)
start http://localhost:8080

# Open in Chrome specifically
"C:\Program Files\Google\Chrome\Application\chrome.exe" http://localhost:8080
```

## 🎉 Success Checklist

- [ ] Server running on http://localhost:8080
- [ ] Firebase initialized without errors
- [ ] Can create account / sign in
- [ ] Home page loads correctly
- [ ] AI interview pages work
- [ ] Futuristic UI displays properly
- [ ] 3D scene renders correctly
- [ ] No console errors (check F12)

---

**Need Help?** Check browser console (F12) for detailed error messages.

**Pro Tip:** Keep the server terminal open while developing. Watch for request logs to debug loading issues.
