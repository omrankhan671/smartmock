/**
 * LinkedIn OAuth Backend Server
 * This server handles LinkedIn OAuth authentication and API calls
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:5502', 'http://127.0.0.1:5502', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// LinkedIn OAuth Configuration
const LINKEDIN_CONFIG = {
    clientId: process.env.LINKEDIN_CLIENT_ID || 'YOUR_LINKEDIN_CLIENT_ID',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'YOUR_LINKEDIN_CLIENT_SECRET',
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/auth/linkedin/callback',
    // Use only approved scopes - start with OpenID Connect only
    scope: 'openid profile email'
};

// LinkedIn API endpoints - Complete set for maximum data extraction
const LINKEDIN_API = {
    authorize: 'https://www.linkedin.com/oauth/v2/authorization',
    token: 'https://www.linkedin.com/oauth/v2/accessToken',
    userinfo: 'https://api.linkedin.com/v2/userinfo', // OpenID Connect endpoint
    profile: 'https://api.linkedin.com/v2/me',
    email: 'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
    positions: 'https://api.linkedin.com/v2/positions?q=owner',
    education: 'https://api.linkedin.com/v2/educations?q=owner',
    skills: 'https://api.linkedin.com/v2/skills?q=owner',
    certifications: 'https://api.linkedin.com/v2/certifications?q=owner',
    projects: 'https://api.linkedin.com/v2/projects?q=owner'
};

/**
 * Route: Initiate LinkedIn OAuth
 * Redirects user to LinkedIn authorization page
 */
app.get('/auth/linkedin', (req, res) => {
    const state = Math.random().toString(36).substring(7);
    req.session.state = state;

    // Optional return URL to send user back to the initiating page after OAuth
    // Default remains resume-builder.html to preserve existing behavior
    const rawReturnUrl = req.query.returnUrl;
    if (rawReturnUrl) {
        try {
            // Basic allowlist to prevent open redirects in dev
            const url = new URL(rawReturnUrl);
            if (url.origin === 'http://localhost:8080') {
                req.session.returnUrl = url.href.split('#')[0];
            }
        } catch (_) {
            // ignore invalid URLs
        }
    }

    const authUrl = `${LINKEDIN_API.authorize}?response_type=code&client_id=${LINKEDIN_CONFIG.clientId}&redirect_uri=${encodeURIComponent(LINKEDIN_CONFIG.redirectUri)}&state=${state}&scope=${encodeURIComponent(LINKEDIN_CONFIG.scope)}`;
    
    res.json({ authUrl });
});

/**
 * Route: LinkedIn OAuth Callback
 * Handles the callback from LinkedIn after user authorization
 */
app.get('/auth/linkedin/callback', async (req, res) => {
    const { code, state, error, error_description } = req.query;
        // Determine where to send the user after handling callback
        const defaultReturn = 'http://localhost:8080/resume-builder.html';
        const sessionReturn = req.session.returnUrl;
        const returnBase = (typeof sessionReturn === 'string' && sessionReturn.startsWith('http://localhost:8080'))
            ? sessionReturn
            : defaultReturn;

        const withParam = (url, key, value) => {
            const hasQuery = url.includes('?');
            const sep = hasQuery ? '&' : '?';
            return `${url}${sep}${key}=${encodeURIComponent(value)}`;
        };
    
    // Check if LinkedIn returned an error
    if (error) {
        console.error('❌ LinkedIn OAuth Error:', error, error_description);
        return res.redirect(withParam(withParam(returnBase, 'error', 'linkedin_error'), 'message', error_description || error));
    }
    
    // Verify state to prevent CSRF attacks
    if (!state || state !== req.session.state) {
        console.error('❌ State mismatch:', { received: state, expected: req.session.state });
        return res.redirect(withParam(returnBase, 'error', 'invalid_state'));
    }
    
    // Verify code is present
    if (!code) {
        console.error('❌ No authorization code received');
        return res.redirect(withParam(returnBase, 'error', 'no_code'));
    }
    
    try {
        // Exchange authorization code for access token
        const tokenResponse = await axios.post(LINKEDIN_API.token, null, {
            params: {
                grant_type: 'authorization_code',
                code: code,
                client_id: LINKEDIN_CONFIG.clientId,
                client_secret: LINKEDIN_CONFIG.clientSecret,
                redirect_uri: LINKEDIN_CONFIG.redirectUri
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        const { access_token, expires_in } = tokenResponse.data;
        
        // Store access token in session
        req.session.accessToken = access_token;
        req.session.tokenExpiry = Date.now() + (expires_in * 1000);
        
    // Redirect back to initiating page (or resume builder) with success
    // Clear returnUrl from session for hygiene
    try { delete req.session.returnUrl; } catch (_) {}
    res.redirect(withParam(returnBase, 'linkedin', 'connected'));
        
    } catch (error) {
        console.error('LinkedIn OAuth Error:', error.response?.data || error.message);
        res.redirect(withParam(returnBase, 'error', 'oauth_failed'));
    }
});

/**
 * Route: Get LinkedIn Profile Data
 * Fetches user's profile, email, positions, and skills
 */
app.get('/api/linkedin/profile', async (req, res) => {
    const accessToken = req.session.accessToken;
    
    if (!accessToken) {
        return res.status(401).json({ error: 'Not authenticated', message: 'Please connect to LinkedIn first' });
    }
    
    // Check if token is expired
    if (Date.now() > req.session.tokenExpiry) {
        return res.status(401).json({ error: 'Token expired', message: 'Please reconnect to LinkedIn' });
    }
    
    try {
        // Fetch profile data
        const [profileRes, emailRes] = await Promise.all([
            axios.get(LINKEDIN_API.profile, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0'
                }
            }),
            axios.get(LINKEDIN_API.email, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0'
                }
            })
        ]);
        
        const profile = profileRes.data;
        const email = emailRes.data.elements[0]['handle~'].emailAddress;
        
        // Format the data for resume builder
        const resumeData = {
            fullName: `${profile.localizedFirstName} ${profile.localizedLastName}`,
            firstName: profile.localizedFirstName,
            lastName: profile.localizedLastName,
            headline: profile.headline || '',
            email: email,
            profilePicture: profile.profilePicture?.displayImage || null,
            // Note: LinkedIn API v2 has limited access to positions, skills, etc.
            // You may need to apply for partnership or use scraping (not recommended)
            // For demo purposes, we'll include mock enhanced data
            summary: 'Experienced professional with expertise in multiple domains.',
            skills: [],
            experience: [],
            education: [],
            certifications: []
        };
        
        res.json({ success: true, data: resumeData });
        
    } catch (error) {
        console.error('LinkedIn API Error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'API Error', 
            message: 'Failed to fetch LinkedIn profile',
            details: error.response?.data?.message || error.message
        });
    }
});

/**
 * Route: Enhanced Profile Data - Fetches EVERYTHING available from LinkedIn
 * Attempts to fetch: profile, email, positions, education, skills, certifications
 */
app.get('/api/linkedin/profile/enhanced', async (req, res) => {
    const accessToken = req.session.accessToken;
    
    if (!accessToken) {
        return res.status(401).json({ error: 'Not authenticated', message: 'Please connect to LinkedIn first' });
    }
    
    try {
        console.log('🔍 Fetching comprehensive LinkedIn profile data...');
        
        const headers = { 'Authorization': `Bearer ${accessToken}` };
        
        // Fetch ALL available data in parallel
        const [userinfoRes, profileRes] = await Promise.allSettled([
            axios.get(LINKEDIN_API.userinfo, { headers }),
            axios.get('https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams),headline,vanityName,location)', { headers })
        ]);
        
        // Extract userinfo data (OpenID Connect)
        const userinfo = userinfoRes.status === 'fulfilled' ? userinfoRes.value.data : {};
        console.log('✅ Userinfo data:', userinfo);
        
        // Extract profile data (LinkedIn v2 API)
        const profile = profileRes.status === 'fulfilled' ? profileRes.value.data : {};
        console.log('✅ Profile data:', profile);
        
        // Parse full name
        const firstName = profile.firstName?.localized?.en_US || userinfo.given_name || '';
        const lastName = profile.lastName?.localized?.en_US || userinfo.family_name || '';
        const fullName = userinfo.name || `${firstName} ${lastName}`.trim() || 'User';
        
        // Parse headline
        const headline = profile.headline?.localized?.en_US || '';
        
        // Parse location
        const location = profile.location?.country?.localized?.en_US || '';
        
        // Parse profile picture
        let profilePicture = userinfo.picture || '';
        if (!profilePicture && profile.profilePicture) {
            const displayImage = profile.profilePicture['displayImage~'];
            if (displayImage?.elements?.[0]?.identifiers?.[0]?.identifier) {
                profilePicture = displayImage.elements[0].identifiers[0].identifier;
            }
        }
        
        // Parse vanity name for LinkedIn URL
        const vanityName = profile.vanityName || profile.id || userinfo.sub;
        const linkedinUrl = `https://linkedin.com/in/${vanityName}`;
        
        console.log('📊 Parsed data:', { fullName, headline, location, profilePicture, linkedinUrl });
        
        // Try to fetch additional data (may fail if scopes not granted)
        let emailAddress = userinfo.email || '';
        let positions = [];
        let education = [];
        let skills = [];
        
        // Try email endpoint
        try {
            const emailRes = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', { headers });
            if (emailRes.data?.elements?.[0]?.['handle~']?.emailAddress) {
                emailAddress = emailRes.data.elements[0]['handle~'].emailAddress;
            }
            console.log('✅ Email fetched:', emailAddress);
        } catch (e) {
            console.log('⚠️ Email fetch failed (using OpenID email):', e.message);
        }
        
        // Try positions/experience
        try {
            const positionsRes = await axios.get('https://api.linkedin.com/v2/positions?q=owner&projection=(elements*(company,title,timePeriod,description))', { headers });
            if (positionsRes.data?.elements) {
                positions = positionsRes.data.elements.map(pos => ({
                    title: pos.title?.localized?.en_US || pos.title || '',
                    company: pos.company?.localized?.en_US || pos.companyName || '',
                    duration: formatTimePeriod(pos.timePeriod),
                    responsibilities: pos.description?.localized?.en_US || pos.description || ''
                }));
                console.log(`✅ Positions fetched: ${positions.length} entries`);
            }
        } catch (e) {
            console.log('⚠️ Positions fetch failed:', e.message);
        }
        
        // Try education
        try {
            const educationRes = await axios.get('https://api.linkedin.com/v2/educations?q=owner&projection=(elements*(schoolName,degreeName,fieldOfStudy,timePeriod))', { headers });
            if (educationRes.data?.elements) {
                education = educationRes.data.elements.map(edu => ({
                    degree: `${edu.degreeName?.localized?.en_US || edu.degreeName || ''} in ${edu.fieldOfStudy?.localized?.en_US || edu.fieldOfStudy || ''}`.trim(),
                    institution: edu.schoolName?.localized?.en_US || edu.schoolName || '',
                    year: edu.timePeriod?.endDate?.year || ''
                }));
                console.log(`✅ Education fetched: ${education.length} entries`);
            }
        } catch (e) {
            console.log('⚠️ Education fetch failed:', e.message);
        }
        
        // Try skills
        try {
            const skillsRes = await axios.get('https://api.linkedin.com/v2/skills?q=owner&projection=(elements*(name))', { headers });
            if (skillsRes.data?.elements) {
                skills = skillsRes.data.elements.map(skill => 
                    skill.name?.localized?.en_US || skill.name || ''
                ).filter(Boolean);
                console.log(`✅ Skills fetched: ${skills.length} entries`);
            }
        } catch (e) {
            console.log('⚠️ Skills fetch failed:', e.message);
        }
        
        // Construct comprehensive response with ALL available data
        const enhancedData = {
            // Basic info
            fullName: fullName,
            headline: headline,
            email: emailAddress,
            phone: '', // Not available via API
            location: location,
            website: '', // Not available via API
            summary: '', // Not available via API (needs separate endpoint)
            picture: profilePicture,
            
            // Social links
            github: '',
            linkedin: linkedinUrl,
            twitter: '',
            portfolioLink: '',
            
            // Professional data
            skills: skills,
            experience: positions,
            education: education,
            certifications: [], // Not available via standard API
            projects: [] // Not available via standard API
        };
        
        console.log('✅ Enhanced data prepared with', {
            experience: positions.length,
            education: education.length,
            skills: skills.length
        });
        
        res.json({ success: true, data: enhancedData });
        
    } catch (error) {
        console.error('❌ LinkedIn API Error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'API Error', 
            message: 'Failed to fetch LinkedIn profile',
            details: error.response?.data || error.message
        });
    }
});

// Helper function to format time periods
function formatTimePeriod(timePeriod) {
    if (!timePeriod) return '';
    
    const startMonth = timePeriod.startDate?.month || 1;
    const startYear = timePeriod.startDate?.year || '';
    const endMonth = timePeriod.endDate?.month || '';
    const endYear = timePeriod.endDate?.year || '';
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const startStr = `${months[startMonth - 1]} ${startYear}`;
    const endStr = endYear ? `${months[endMonth - 1]} ${endYear}` : 'Present';
    
    return `${startStr} - ${endStr}`;
}

/**
 * Route: Check Authentication Status
 */
app.get('/api/auth/status', (req, res) => {
    const isAuthenticated = !!req.session.accessToken && Date.now() < req.session.tokenExpiry;
    res.json({ 
        authenticated: isAuthenticated,
        expiresIn: isAuthenticated ? req.session.tokenExpiry - Date.now() : 0
    });
});

/**
 * Route: Logout
 */
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'LinkedIn OAuth Server is running' });
});

/**
 * Route: Real job openings from Internshala (best-effort HTML parse)
 * NOTE: This endpoint scrapes publicly visible job listing metadata for demonstration purposes only.
 * Respect target site's robots.txt and terms for production use or seek an official API.
 *
 * Query params:
 *  - category: optional string like "software-engineer", "backend-developer"; maps to /jobs/<category>-jobs/
 *  - page: optional page number
 */
app.get('/api/jobs/internshala', async (req, res) => {
    try {
        const { category = '', page = '1' } = req.query;
        const base = 'https://internshala.com';
        const path = category
            ? `/jobs/${encodeURIComponent(category)}-jobs/`
            : '/jobs/';
        const url = `${base}${path}?page=${encodeURIComponent(page)}`;

        const resp = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            timeout: 10000
        });

        const html = resp.data;
        const $ = cheerio.load(html);

        // Heuristic: job detail links usually start with /job/detail/
        // We'll walk up to the card container and try to extract nearby fields.
        const seen = new Set();
        const jobs = [];
        $('a[href^="/job/detail/"]').each((_, el) => {
            const href = $(el).attr('href');
            if (!href || seen.has(href)) return;
            seen.add(href);

            const card = $(el).closest('div');
            let title = $(el).text().trim();
            if (!title) {
                // try common title selectors around the card
                title = card.find('h3, h4, .job-internship-name, .heading_4_5').first().text().trim();
            }
            let company = card.find('.company, .company-name, .company_name, .link_display_like_text').first().text().trim();
            if (!company) {
                // try siblings
                company = $(el).parent().find('.company, .company-name').first().text().trim();
            }
            // location and stipend/salary heuristics
            const location = card.find('.location, .job-location, .individual_internship_header .location_link').first().text().trim();
            const salary = card.find('.salary, .stipend, .ctc').first().text().trim();

            jobs.push({
                title: title || 'Job Opening',
                company: company || '—',
                location: location || '',
                salary: salary || '',
                source: 'Internshala',
                applyLink: href.startsWith('http') ? href : `${base}${href}`
            });
        });

        // Fallback: if no jobs parsed, try a broader selector for anchors inside job cards
        if (jobs.length === 0) {
            $('div').find('a').each((_, el) => {
                const href = $(el).attr('href') || '';
                if (!href.startsWith('/job/detail/')) return;
                if (seen.has(href)) return;
                seen.add(href);
                const title = $(el).text().trim() || 'Job Opening';
                jobs.push({ title, company: '—', location: '', salary: '', source: 'Internshala', applyLink: `${base}${href}` });
            });
        }

        return res.json({ success: true, count: jobs.length, url, jobs });
    } catch (err) {
        console.error('Internshala scrape failed:', err.message);
        return res.status(500).json({ success: false, error: 'fetch_failed', message: 'Unable to fetch job listings right now.' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  LinkedIn OAuth Server Running                             ║
║  Port: ${PORT}                                              ║
║  --------------------------------------------------------  ║
║  Endpoints:                                                ║
║  GET  /auth/linkedin          - Initiate OAuth             ║
║  GET  /auth/linkedin/callback - OAuth callback             ║
║  GET  /api/linkedin/profile   - Get profile data           ║
║  GET  /api/auth/status        - Check auth status          ║
║  POST /api/auth/logout        - Logout                     ║
║  --------------------------------------------------------  ║
║  Setup Instructions:                                       ║
║  1. Create .env file with LinkedIn credentials             ║
║  2. Run: npm install                                       ║
║  3. Start: node server/linkedin-auth.js                    ║
╚════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
