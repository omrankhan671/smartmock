# LinkedIn OAuth Backend Server

This Node.js Express server handles **REAL** LinkedIn OAuth authentication and API calls for the SmartMock Resume Builder and Portfolio Builder.

## 🚀 Features

- ✅ **Real LinkedIn OAuth 2.0** - Actual authentication flow, not simulation
- ✅ **LinkedIn API Integration** - Fetches real profile data from LinkedIn API
- ✅ **Session Management** - Secure token storage with express-session
- ✅ **CSRF Protection** - State parameter validation to prevent attacks
- ✅ **CORS Enabled** - Works with frontend on different port
- ✅ **Enhanced Profile Data** - Combines real API data with supplemental information

## 📋 Prerequisites

- **Node.js** version 14.0.0 or higher
- **npm** (comes with Node.js)
- **LinkedIn Developer Account** to create an app and get credentials

## 🔧 Setup Instructions

### Step 1: Register LinkedIn Application

1. Go to [LinkedIn Developers Portal](https://www.linkedin.com/developers/apps)
2. Click **"Create app"**
3. Fill in the application details:
   - **App name:** SmartMock Resume Builder (or your preferred name)
   - **LinkedIn Page:** Create or select your company page
   - **App logo:** Upload your logo (optional but recommended)
   - **Legal agreement:** Check the box to agree
4. Click **"Create app"**

### Step 2: Configure OAuth Settings

1. In your app dashboard, go to the **"Auth"** tab
2. Under **"OAuth 2.0 settings"**, find:
   - **Client ID** - Copy this value
   - **Client Secret** - Click "Show" and copy this value
3. Under **"Redirect URLs"**, add:
   ```
   http://localhost:3000/auth/linkedin/callback
   ```
4. Click **"Update"**

### Step 3: Request API Products

1. Go to the **"Products"** tab
2. Request access to:
   - ✅ **Sign In with LinkedIn** (required)
   - ✅ **Share on LinkedIn** (optional)
3. Wait for approval (usually instant for "Sign In with LinkedIn")

### Step 4: Install Dependencies

```bash
cd server
npm install
```

This installs:
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `axios` - HTTP client for API calls
- `express-session` - Session management
- `dotenv` - Environment variable loader
- `nodemon` - Development auto-reload (dev only)

### Step 5: Create Environment File

```bash
# Copy the example file
copy .env.example .env

# Edit .env with your credentials
```

Open `.env` and fill in your LinkedIn credentials:

```env
LINKEDIN_CLIENT_ID=your_actual_client_id_here
LINKEDIN_CLIENT_SECRET=your_actual_client_secret_here
LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/linkedin/callback
PORT=3000
SESSION_SECRET=change_this_to_a_random_long_string
FRONTEND_URL=http://localhost:8080
```

**Important:** 
- Replace `your_actual_client_id_here` with your Client ID from Step 2
- Replace `your_actual_client_secret_here` with your Client Secret from Step 2
- Change `SESSION_SECRET` to a random string for security

### Step 6: Start the Backend Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

You should see:
```
╔══════════════════════════════════════════════╗
║   LinkedIn OAuth Server Started! 🚀          ║
║   Port: 3000                                 ║
║   Status: ✅ Ready to authenticate           ║
╚══════════════════════════════════════════════╝

📌 Available Endpoints:
   GET  /auth/linkedin              - Start OAuth flow
   GET  /auth/linkedin/callback     - OAuth callback
   GET  /api/linkedin/profile       - Get basic profile
   GET  /api/linkedin/profile/enhanced - Get full profile
   GET  /api/auth/status            - Check auth status
   POST /api/auth/logout            - Logout user
   GET  /health                     - Health check

🌐 Server running at: http://localhost:3000
```

### Step 7: Start the Frontend

In a **separate terminal**, navigate to the project root and serve the frontend:

**Using Python 3:**
```bash
python -m http.server 8080
```

**Using Python 2:**
```bash
python -m SimpleHTTPServer 8080
```

**Using Node.js http-server:**
```bash
npx http-server -p 8080
```

**Using VS Code Live Server extension:**
- Right-click `resume-builder.html` or `portfolio.html`
- Select "Open with Live Server"
- Ensure it's running on port 8080

### Step 8: Test the Integration

1. Open your browser and go to:
   - Resume Builder: http://localhost:8080/resume-builder.html
   - Portfolio Builder: http://localhost:8080/portfolio.html

2. Scroll to the **LinkedIn Integration** section

3. Click **"Connect LinkedIn"**

4. You'll be redirected to LinkedIn's login page

5. **Authorize the app** to access your profile

6. You'll be redirected back to SmartMock

7. Click **"AI Import from LinkedIn"** or **"AI Import Portfolio"**

8. Your **REAL LinkedIn data** will auto-fill the form!

## 🔌 API Endpoints

### Authentication Endpoints

#### `GET /auth/linkedin`
Initiates the LinkedIn OAuth flow.

**Response:**
```json
{
  "authUrl": "https://www.linkedin.com/oauth/v2/authorization?..."
}
```

#### `GET /auth/linkedin/callback?code=XXX&state=YYY`
Handles OAuth callback from LinkedIn.

**Redirects to:** Frontend with `?linkedin=connected` parameter

### Profile Endpoints

#### `GET /api/linkedin/profile`
Fetches basic profile data from LinkedIn API.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
  }
}
```

#### `GET /api/linkedin/profile/enhanced`
Fetches enhanced profile with supplemental data.

**Response:**
```json
{
  "success": true,
  "data": {
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "headline": "Senior Software Engineer",
    "summary": "...",
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": [...],
    "education": [...],
    "certifications": [...],
    "projects": [...]
  }
}
```

### Status Endpoints

#### `GET /api/auth/status`
Checks if user is authenticated.

**Response:**
```json
{
  "authenticated": true,
  "expiresIn": 3600
}
```

#### `POST /api/auth/logout`
Logs out the user and destroys the session.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1234567890
}
```

## 🔒 Security Features

- **CSRF Protection:** Random state parameter validates OAuth callback
- **Session Management:** Secure session storage with httpOnly cookies
- **Token Expiry:** Automatic token expiration checking (24 hours)
- **CORS:** Configured to only allow requests from frontend origin
- **Environment Variables:** Sensitive credentials stored in .env file

## 🐛 Troubleshooting

### Error: "Missing required environment variables"

**Solution:** Make sure you created `.env` file with all required variables.

### Error: "Failed to connect to LinkedIn"

**Solutions:**
- Check that backend server is running on port 3000
- Verify frontend is making requests to `http://localhost:3000`
- Check browser console for CORS errors
- Ensure `FRONTEND_URL` in .env matches your frontend URL

### Error: "Invalid redirect URI"

**Solutions:**
- In LinkedIn Developer Console, verify redirect URI is exactly:
  ```
  http://localhost:3000/auth/linkedin/callback
  ```
- No trailing slash!
- Must match `LINKEDIN_REDIRECT_URI` in .env

### Error: "Access denied - invalid credentials"

**Solutions:**
- Double-check Client ID and Client Secret in .env
- Make sure you copied them correctly from LinkedIn Developer Console
- No extra spaces or quotes around the values

### LinkedIn says "This app hasn't been approved"

**Solutions:**
- Make sure you requested "Sign In with LinkedIn" product
- Check that it's approved (usually instant)
- If still pending, wait for LinkedIn approval

### Frontend shows old mock data

**Solutions:**
- Hard refresh the page: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Check that you updated `resume-builder.html` and `portfolio.html`

## 📊 LinkedIn API Limitations

**Note:** LinkedIn API v2 has limited access to user data. The enhanced profile endpoint combines:
- **Real data from LinkedIn API:**
  - Full name
  - Email address
- **Supplemental mock data:**
  - Work experience details
  - Skills list
  - Education
  - Certifications
  - Projects

To access full LinkedIn data, you would need:
1. LinkedIn Partnership program
2. Apply for additional API scopes
3. Business verification

For development and testing purposes, the current implementation provides a realistic experience.

## 🎯 Next Steps

After successful setup:

1. **Test the full flow:**
   - Connect → Authorize → Import → Edit

2. **Customize the data:**
   - Modify `enhancedData` in `linkedin-auth.js` to match your needs

3. **Deploy to production:**
   - Update redirect URI in LinkedIn app settings
   - Use HTTPS for secure connections
   - Set `cookie.secure: true` in session config
   - Use a strong SESSION_SECRET
   - Deploy backend to Heroku, Railway, or DigitalOcean
   - Deploy frontend to Vercel, Netlify, or GitHub Pages

4. **Enhance the integration:**
   - Add more LinkedIn API endpoints
   - Store user profiles in database
   - Implement refresh token flow
   - Add profile caching

## 📝 License

Part of the SmartMock project. See main LICENSE file.

## 🤝 Support

If you encounter issues:
1. Check this README
2. Review server logs in terminal
3. Check browser console for errors
4. Verify all environment variables
5. Ensure both frontend and backend are running

---

**Built with ❤️ for SmartMock Resume & Portfolio Builders**
