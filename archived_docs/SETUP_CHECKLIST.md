# ✅ SmartMock Setup Checklist

Complete step-by-step guide to get SmartMock running with MongoDB backend.

## 📋 Pre-Requisites

- [ ] Node.js 14+ installed
  - Verify: Run `node --version` in PowerShell
  - Download: https://nodejs.org/

- [ ] MongoDB installed or MongoDB Atlas account
  - Local: https://www.mongodb.com/try/download/community
  - Cloud: https://www.mongodb.com/cloud/atlas

- [ ] Git installed (optional)
  - Download: https://git-scm.com/

## 🛠️ Installation (Backend)

- [ ] **Step 1: Install Node.js Dependencies**
  ```powershell
  cd server
  npm install
  ```
  ✅ Verify: Should complete without errors

- [ ] **Step 2: Setup MongoDB**
  - [ ] **Option A - Local MongoDB**
    - [ ] Download MongoDB Community Server
    - [ ] Run installer
    - [ ] Choose "Install MongoDB as a Service"
    - [ ] Verify: Run `mongod --version`
    
  - [ ] **Option B - MongoDB Atlas**
    - [ ] Create free account at mongodb.com/cloud/atlas
    - [ ] Create cluster (M0 free tier)
    - [ ] Set database username/password
    - [ ] Whitelist your IP: Security → Network Access
    - [ ] Get connection string

- [ ] **Step 3: Configure Environment**
  ```powershell
  cd server
  copy .env.example .env
  ```
  - [ ] Edit `server/.env`
  - [ ] Add MongoDB URI
    ```
    MONGODB_URI=mongodb://localhost:27017/smartmock
    PORT=5000
    NODE_ENV=development
    ```
  - [ ] Save file

- [ ] **Step 4: Test Backend**
  ```powershell
  cd server
  npm run dev
  ```
  ✅ Should see:
  ```
  ✅ Connected to MongoDB
  🚀 Running on port 5000
  ```

## 🌐 Frontend Setup

- [ ] **Step 5: Start Web Server**
  
  Option A - Python:
  ```powershell
  python -m http.server 8000
  ```
  
  Option B - Node.js http-server:
  ```powershell
  npm install -g http-server
  http-server -p 8000
  ```
  
  ✅ Should see: `Listening on http://localhost:8000`

- [ ] **Step 6: Open SmartMock**
  - [ ] Open browser: http://localhost:8000
  - [ ] Should see SmartMock login page
  - [ ] Sign in with any credentials
  - [ ] Should see home page

## 🧪 Testing

- [ ] **Test 1: Health Check**
  ```powershell
  Invoke-WebRequest http://localhost:5000/health
  ```
  ✅ Should return: `{"status":"Server is running",...}`

- [ ] **Test 2: Create Certificate**
  - [ ] Go to any course (e.g., Computer Science)
  - [ ] Click "Courses" tab
  - [ ] Mark a video as complete (checkbox)
  - [ ] Click "View Certificate"
  - [ ] ✅ Should display certificate with unique ID
  - [ ] Verify certificate ID format: `SM-2025-XXXX-XXXXXX`

- [ ] **Test 3: Verify Database Storage**
  - [ ] Open MongoDB Atlas/local console
  - [ ] Navigate to: `smartmock` → `certificates`
  - [ ] ✅ Should see certificate document with student name

- [ ] **Test 4: Verify Certificate by ID**
  - [ ] Click menu: "🔍 Verify Certificate"
  - [ ] Enter certificate ID from Test 2
  - [ ] Click "Verify"
  - [ ] ✅ Should display: 
    - Student name
    - Course name
    - Issue date
    - Status: "Valid & Authentic"

- [ ] **Test 5: QR Code**
  - [ ] Go back to certificate page
  - [ ] Right-click QR code → "Scan with device"
  - [ ] Should link to verification page
  - [ ] ✅ Certificate ID should be pre-filled

## 📱 Mobile Testing (Optional)

- [ ] **Test QR Code on Phone**
  - [ ] Open certificate page on desktop
  - [ ] Scan QR code with phone camera
  - [ ] ✅ Should open verification page on phone

- [ ] **Test Verification on Mobile**
  - [ ] Enter certificate ID on phone
  - [ ] ✅ Should display certificate details

## 🔍 Verification Checklist

### Frontend
- [ ] Sign in works
- [ ] Can navigate between pages
- [ ] Courses display correctly
- [ ] Progress bars update
- [ ] YouTube videos play

### Backend
- [ ] Server starts without errors
- [ ] MongoDB connection successful
- [ ] Health check responds
- [ ] POST request saves certificate
- [ ] GET request retrieves certificate
- [ ] Certificate ID format valid

### Database
- [ ] MongoDB is running
- [ ] Can see certificates collection
- [ ] Documents have all required fields
- [ ] Unique index on certificateId

### Integration
- [ ] Frontend calls backend API
- [ ] Certificates persist after page refresh
- [ ] Verification works
- [ ] QR code links are correct
- [ ] No console errors in browser (F12)

## 🚀 Deployment Checklist

- [ ] **Before Production**
  - [ ] All tests pass ✅
  - [ ] `.env` not in Git
  - [ ] `.gitignore` includes `.env`
  - [ ] HTTPS enabled
  - [ ] API_BASE_URL updated to production server
  - [ ] MongoDB backup enabled
  - [ ] Error logging configured

- [ ] **Deploy Backend**
  - [ ] Choose hosting: Heroku, AWS, Azure, DigitalOcean
  - [ ] Set environment variables on host
  - [ ] Deploy code
  - [ ] Test endpoints
  - [ ] Monitor logs

- [ ] **Deploy Frontend**
  - [ ] Choose hosting: GitHub Pages, Netlify, Vercel
  - [ ] Update API endpoint to production
  - [ ] Deploy code
  - [ ] Test functionality

## 📚 Documentation Files

Read these if you have issues:

| File | Purpose |
|------|---------|
| `MONGODB_SETUP.md` | Complete MongoDB & backend setup |
| `server/README.md` | Backend API documentation |
| `CERTIFICATE_SYSTEM.md` | Certificate feature guide |
| `SYSTEM_OVERVIEW.md` | Full system architecture |
| `MIGRATION_SUMMARY.md` | Firebase → MongoDB migration |

## 🆘 Troubleshooting

### Issue: "Cannot find module 'express'"
```
Solution: Run npm install in server folder
cd server
npm install
```

### Issue: "MongoDB connection refused"
```
Solution: Start MongoDB service
Windows: Should be running by default
Manual: mongod.exe
```

### Issue: "Certificate not saving"
```
Solution:
1. Check server is running (console shows port 5000)
2. Check backend logs for errors
3. Verify MongoDB connection
4. Try manual API test
```

### Issue: "CORS error in browser"
```
Solution: 
CORS is already enabled in server.
Check that frontend calls http://localhost:5000 (not https)
```

### Issue: "Certificate not found"
```
Solution:
1. Verify certificate was created (check MongoDB)
2. Try certificate ID manually
3. Check server is running
4. Look for backend errors
```

## 📞 Need Help?

1. **Check Documentation**
   - `MONGODB_SETUP.md` → Troubleshooting section
   - `server/README.md` → Troubleshooting section

2. **Check Logs**
   - Browser console: F12
   - Backend console: Where you ran `npm run dev`
   - MongoDB: Check connection

3. **Test Manually**
   - Use PowerShell to test API directly
   - See `server/README.md` for curl/PowerShell examples

4. **Verify Services**
   - Is MongoDB running? (`mongod --version`)
   - Is Node.js installed? (`node --version`)
   - Is backend running? (See console output)
   - Is frontend accessible? (Open http://localhost:8000)

## ✨ Quick Command Reference

```powershell
# Install backend dependencies
cd server && npm install

# Start backend server (development)
npm run dev

# Start backend server (production)
npm start

# Start frontend web server
python -m http.server 8000

# Test health check
Invoke-WebRequest http://localhost:5000/health

# Open frontend
start http://localhost:8000

# Check Node version
node --version

# Check MongoDB status
mongod --version
```

## 🎉 Success!

You should now have:
- ✅ MongoDB database storing certificates
- ✅ Express backend running on port 5000
- ✅ Frontend running on port 8000
- ✅ Complete certificate system working
- ✅ Verification system functional
- ✅ QR codes generating properly

**Total Setup Time**: ~15-20 minutes

---

## 📝 Notes

- Keep both terminals open: one for backend, one for frontend
- Don't commit `.env` files to Git
- Remember to configure MongoDB before starting
- Test everything before deploying

**Version**: 1.0.0  
**Date**: October 24, 2025  
**Status**: ✅ Ready
