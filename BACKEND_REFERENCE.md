# SmartMock Backend - Quick Reference

## Architecture Overview

```
Client (HTML/JS) 
    ↓ Firebase Auth
    ↓ Firebase Realtime Database (rules enforced)
    ↓ Cloud Functions (triggered or callable)
    → Email via Nodemailer (SMTP)
```

## Backend Components

### 1. Database (Firebase Realtime DB)
- `users/{uid}` - User profiles, settings, activity
- `leaderboard/{uid}` - Rankings, scores, stars
- `recruiters/{uid}` - Recruiter profiles
- `schedules/{id}` - Interview schedules
- `notes/{scheduleId}/{noteId}` - Interview notes
- `aiInterviews/{uid}/{id}` - AI interview data
- `certificates/{uid}/{id}` - Issued certificates
- `community/posts` - Community forum posts

### 2. Security Rules (`config/FIREBASE_RULES.json`)
- User data: Owner-only read/write
- Leaderboard: Global read, owner write
- Recruiters: Owner-only access
- Schedules: Organizer/candidate read, organizer write
- Notes: Organizer-only access

### 3. Cloud Functions (`functions/index.js`)

#### Database Triggers
- `onScheduleCreated` - Sends email invite when schedule created
- `onNoteCreated` - Logs activity when note added

#### HTTPS Callable
- `createSchedule(candidateId, department, time)` - Secure schedule creation
- `updateScheduleStatus(scheduleId, status)` - Update schedule state

#### Scheduled (Cron)
- `scheduledCleanup` - Runs hourly:
  - Marks past schedules as completed
  - Sends 1-hour reminders to candidates

## Data Flow Examples

### Schedule Creation Flow
1. Recruiter fills form in `recruiter/schedule.html`
2. Client JS writes to `schedules/{id}` (or calls `createSchedule` function)
3. **Trigger:** `onScheduleCreated` fires
4. Function fetches candidate email from `leaderboard/{candidateId}`
5. Nodemailer sends email with room link
6. Activity logged to `activity/{candidateId}/{timestamp}`

### Interview Completion Flow
1. Candidate completes AI interview
2. `leaderboard-integration.js` calculates score and stars
3. Writes to `leaderboard/{uid}` with `totalStars`, `starHistory`
4. Leaderboard page auto-updates via Firebase realtime sync

### Note Creation Flow
1. Recruiter writes note in `recruiter/reports.html`
2. Client JS writes to `notes/{scheduleId}/{noteId}`
3. **Trigger:** `onNoteCreated` fires
4. Activity logged for organizer

## Environment Setup

### Local Development
1. Start Firebase emulators:
   ```bash
   cd functions
   npm run serve
   ```
2. Start frontend:
   ```bash
   python -m http.server 8000
   ```

### Production Deployment
1. Configure SMTP:
   ```bash
   firebase functions:config:set smtp.user="your-email@gmail.com" smtp.pass="your-app-password"
   ```
2. Deploy functions:
   ```bash
   cd functions
   firebase deploy --only functions
   ```
3. Update Firebase rules:
   ```bash
   firebase deploy --only database
   ```

## API Usage (Client-Side)

### Call Cloud Function
```javascript
const createSchedule = firebase.functions().httpsCallable('createSchedule');
const result = await createSchedule({
  candidateId: 'user123',
  department: 'cs',
  time: Date.now() + 86400000 // tomorrow
});
console.log(result.data); // {scheduleId, roomName}
```

### Direct Database Write
```javascript
const scheduleId = firebase.database().ref('schedules').push().key;
await firebase.database().ref(`schedules/${scheduleId}`).set({
  organizerId: auth.currentUser.uid,
  candidateId: 'user123',
  department: 'cs',
  time: Date.now() + 86400000,
  roomName: `smartmock-${scheduleId.slice(0,8)}`,
  status: 'scheduled',
  createdAt: Date.now()
});
// onScheduleCreated trigger will fire automatically
```

## Monitoring

### View Logs
```bash
firebase functions:log
firebase functions:log --only onScheduleCreated
```

### Check Function Status
Firebase Console → Functions → Usage stats, error rates

### Test Email
Set breakpoint or log in `sendEmail()`, create a test schedule

## Cost Optimization

- Use Firebase Spark (free) for development
- Upgrade to Blaze for production (pay-as-you-go)
- Email provider: Gmail free (100/day), SendGrid free tier (100/day)
- Expected cost for 1000 schedules/month: ~$1-2

## Security Best Practices

✅ Always validate input in functions  
✅ Check auth context before DB writes  
✅ Use HTTPS callable for sensitive operations  
✅ Store secrets in Firebase config (not code)  
✅ Rate-limit client calls if needed  
✅ Test security rules with Firebase emulator  

## Troubleshooting

**Email not sending?**
- Check SMTP credentials in Firebase config
- Verify Gmail App Password (not account password)
- Check function logs for errors

**Function not triggering?**
- Verify database path matches exactly
- Check security rules allow the write
- View Firebase Console → Functions → Logs

**Permission denied?**
- Ensure user authenticated
- Check `recruiters/{uid}` exists for recruiter functions
- Review security rules in console

## Next Steps

- Add SMS via Twilio in functions
- Implement Jitsi JWT token generation
- Add Google Calendar integration
- Create admin dashboard with analytics
- Set up monitoring alerts

---

For detailed deployment: See `functions/DEPLOYMENT.md`  
For database structure: See `README.md` § Firebase Database Structure
