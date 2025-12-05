# LinkedIn OAuth Flow - Architecture

## 🔄 Complete OAuth Flow Diagram

```
┌─────────────┐                ┌─────────────┐                ┌─────────────┐
│   Browser   │                │   Backend   │                │  LinkedIn   │
│  (Frontend) │                │   Server    │                │     API     │
│  Port 8080  │                │  Port 3000  │                │             │
└──────┬──────┘                └──────┬──────┘                └──────┬──────┘
       │                              │                              │
       │  1. User clicks              │                              │
       │  "Connect LinkedIn"          │                              │
       │                              │                              │
       │  2. GET /auth/linkedin       │                              │
       │─────────────────────────────>│                              │
       │                              │                              │
       │                              │  3. Generate OAuth URL       │
       │                              │     with state parameter     │
       │                              │                              │
       │  4. Return { authUrl }       │                              │
       │<─────────────────────────────│                              │
       │                              │                              │
       │  5. Redirect user to         │                              │
       │     authUrl                  │                              │
       │──────────────────────────────┼─────────────────────────────>│
       │                              │                              │
       │                              │  6. User sees LinkedIn       │
       │                              │     login/authorize page     │
       │                              │                              │
       │  7. User authorizes app      │                              │
       │<─────────────────────────────┼──────────────────────────────│
       │                              │                              │
       │                              │  8. LinkedIn redirects to    │
       │                              │     callback with code       │
       │                              │<─────────────────────────────│
       │                              │                              │
       │                              │  9. Backend receives code    │
       │                              │     and state parameter      │
       │                              │                              │
       │                              │  10. Validate state (CSRF)   │
       │                              │                              │
       │                              │  11. Exchange code for token │
       │                              │      POST /oauth/v2/accessToken
       │                              │─────────────────────────────>│
       │                              │                              │
       │                              │  12. Return access_token     │
       │                              │<─────────────────────────────│
       │                              │                              │
       │                              │  13. Store token in session  │
       │                              │                              │
       │  14. Redirect to frontend    │                              │
       │      ?linkedin=connected     │                              │
       │<─────────────────────────────│                              │
       │                              │                              │
       │  15. Check auth status       │                              │
       │  GET /api/auth/status        │                              │
       │─────────────────────────────>│                              │
       │                              │                              │
       │  16. Return authenticated    │                              │
       │<─────────────────────────────│                              │
       │                              │                              │
       │  17. User clicks "AI Import" │                              │
       │                              │                              │
       │  18. GET /api/linkedin/profile/enhanced                     │
       │─────────────────────────────>│                              │
       │                              │                              │
       │                              │  19. Get token from session  │
       │                              │                              │
       │                              │  20. Fetch profile data      │
       │                              │      GET /v2/me              │
       │                              │─────────────────────────────>│
       │                              │                              │
       │                              │  21. Return profile          │
       │                              │<─────────────────────────────│
       │                              │                              │
       │                              │  22. Fetch email             │
       │                              │      GET /v2/emailAddress    │
       │                              │─────────────────────────────>│
       │                              │                              │
       │                              │  23. Return email            │
       │                              │<─────────────────────────────│
       │                              │                              │
       │                              │  24. Combine with enhanced   │
       │                              │      data (skills, projects) │
       │                              │                              │
       │  25. Return complete profile │                              │
       │<─────────────────────────────│                              │
       │                              │                              │
       │  26. Auto-fill form fields   │                              │
       │      with LinkedIn data      │                              │
       │                              │                              │
```

## 🔐 Security Flow

```
State Parameter (CSRF Protection):
─────────────────────────────────

1. Backend generates random state: "abc123xyz789"
2. Backend stores in session: req.session.oauthState = "abc123xyz789"
3. Backend includes in OAuth URL: &state=abc123xyz789
4. LinkedIn returns in callback: ?code=XXX&state=abc123xyz789
5. Backend validates: req.session.oauthState === req.query.state
6. If match → continue, if not → abort (CSRF attack!)
```

```
Session Token Storage:
──────────────────────

1. User authenticates with LinkedIn
2. Backend receives access_token from LinkedIn
3. Backend stores in session:
   {
     token: "AQV8...",
     tokenExpiry: Date.now() + 5184000000  // 60 days
   }
4. All subsequent API calls use session token
5. Token is httpOnly, secure, and expires in 24 hours
```

## 📊 Data Flow

```
LinkedIn API Data → Backend Processing → Frontend Display
──────────────────────────────────────────────────────────

LinkedIn API Returns:
{
  firstName: { localized: { en_US: "John" } },
  lastName: { localized: { en_US: "Doe" } },
  id: "abc123"
}

Backend Enhances:
{
  fullName: "John Doe",           // ← Processed from firstName + lastName
  email: "john@example.com",      // ← From email API
  headline: "Senior Engineer",    // ← Mock (limited API access)
  skills: ["JS", "React"],        // ← Mock (limited API access)
  experience: [...],              // ← Mock (requires partnership)
  projects: [...]                 // ← Mock (not available in API)
}

Frontend Receives:
{
  success: true,
  data: { ...enhanced profile... }
}

Frontend Auto-fills:
- fullName → #fullName input
- email → #contact input
- headline → #profTitle input
- skills → #skills textarea
- experience → .jobTitle, .company, etc.
```

## 🏗️ File Structure

```
smartmock/
│
├── server/                          # Backend OAuth server
│   ├── linkedin-auth.js             # Main Express server (312 lines)
│   ├── package.json                 # Dependencies
│   ├── .env.example                 # Environment template
│   ├── .env                         # Your credentials (create this)
│   └── README.md                    # Detailed setup guide
│
├── resume-builder.html              # Resume builder with LinkedIn
│   └── Functions:
│       ├── connectLinkedIn()        # Initiates OAuth
│       └── importFromLinkedIn()     # Fetches & fills data
│
├── portfolio.html                   # Portfolio builder with LinkedIn
│   └── Functions:
│       ├── connectPortfolioLinkedIn()
│       └── importPortfolioFromLinkedIn()
│
└── LINKEDIN_SETUP_QUICKSTART.md     # This file
```

## 🔄 API Endpoints Reference

```
Authentication:
───────────────
GET  /auth/linkedin              → Initiates OAuth, returns authUrl
GET  /auth/linkedin/callback     → OAuth callback, exchanges code for token

Profile Data:
─────────────
GET  /api/linkedin/profile       → Basic profile (name, email)
GET  /api/linkedin/profile/enhanced → Full profile (skills, experience, etc.)

Session Management:
───────────────────
GET  /api/auth/status            → Check if authenticated
POST /api/auth/logout            → Destroy session

Health:
───────
GET  /health                     → Server health check
```

## 🚀 Startup Sequence

```bash
# Terminal 1 - Backend
cd server
npm install                    # Install dependencies
npm run dev                    # Start server with nodemon

# Output:
# ╔══════════════════════════════════════════════╗
# ║   LinkedIn OAuth Server Started! 🚀          ║
# ║   Port: 3000                                 ║
# ╚══════════════════════════════════════════════╝

# Terminal 2 - Frontend
cd ..
python -m http.server 8080     # Serve frontend

# Output:
# Serving HTTP on :: port 8080...
```

## 🎯 User Journey

```
1. User lands on resume-builder.html
   └─> Sees LinkedIn Integration section

2. User clicks "Connect LinkedIn" button
   └─> Frontend: connectLinkedIn() called
       └─> Backend: GET /auth/linkedin
           └─> Returns LinkedIn OAuth URL

3. User redirected to LinkedIn
   └─> Sees "SmartMock Resume Builder wants to:"
       - Access your name
       - Access your email address

4. User clicks "Allow"
   └─> LinkedIn redirects back with code
       └─> Backend: GET /auth/linkedin/callback?code=XXX
           └─> Exchanges code for token
           └─> Stores token in session
           └─> Redirects to: resume-builder.html?linkedin=connected

5. Frontend detects ?linkedin=connected
   └─> Checks auth status
       └─> Shows "✅ Connected!" message
       └─> Enables "AI Import" button

6. User clicks "AI Import from LinkedIn"
   └─> Frontend: importFromLinkedIn() called
       └─> Backend: GET /api/linkedin/profile/enhanced
           └─> Fetches real name & email from LinkedIn API
           └─> Enhances with mock skills, experience
           └─> Returns complete profile

7. Frontend auto-fills form
   └─> Name, email, skills, experience all populated
   └─> User can edit any field
   └─> User generates PDF with real LinkedIn data
```

## 🔧 Configuration Matrix

| Environment | Backend URL | Frontend URL | Redirect URI |
|-------------|-------------|--------------|--------------|
| Development | http://localhost:3000 | http://localhost:8080 | http://localhost:3000/auth/linkedin/callback |
| Production | https://api.smartmock.com | https://smartmock.com | https://api.smartmock.com/auth/linkedin/callback |

## 🎨 Frontend Integration Points

```javascript
// resume-builder.html

// 1. Connect Button
<button onclick="connectLinkedIn()">Connect LinkedIn</button>

// 2. Import Button
<button onclick="importFromLinkedIn()" id="importLinkedInBtn">
  AI Import from LinkedIn
</button>

// 3. Status Display
<div id="linkedinStatus">
  <p id="linkedinStatusText"></p>
</div>

// 4. OAuth Return Handler
window.addEventListener('DOMContentLoaded', async () => {
  if (urlParams.get('linkedin') === 'connected') {
    // Check auth status and enable import button
  }
});
```

## 📈 Success Metrics

✅ **Working Integration:**
- User can click "Connect LinkedIn"
- User is redirected to LinkedIn
- User authorizes and returns to SmartMock
- User sees "Connected!" message
- User can click "AI Import"
- Form auto-fills with real data
- User can edit and generate PDF

✅ **Technical Success:**
- Backend server starts without errors
- OAuth flow completes successfully
- Token stored in session
- LinkedIn API calls succeed
- Enhanced data returned to frontend
- CORS working between frontend/backend

---

**Architecture by SmartMock Team** 🚀
