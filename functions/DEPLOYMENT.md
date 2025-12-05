# Firebase Cloud Functions Deployment Guide

## Overview

SmartMock now includes Firebase Cloud Functions for server-side backend features:
- **Email notifications** when interviews are scheduled
- **Activity logging** for notes and schedules
- **Secure HTTPS endpoints** for schedule creation and status updates
- **Scheduled cleanup job** to mark past schedules completed and send reminders

---

## Prerequisites

- Node.js 18+ installed
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project initialized (same project as your Realtime Database)
- SMTP credentials (Gmail App Password, SendGrid, Mailgun, etc.)

---

## Setup

### 1. Initialize Firebase Functions (if not already)

If this is your first time deploying functions for your Firebase project:

```powershell
cd functions
firebase login
firebase init functions
```

Select your existing Firebase project, choose JavaScript, install dependencies.

### 2. Install Dependencies

```powershell
cd functions
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your SMTP credentials:

```powershell
cp .env.example .env
```

Edit `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Gmail users:** Generate an App Password at https://myaccount.google.com/apppasswords

**Other providers:**
- SendGrid: `smtp.sendgrid.net`, port 587, API key as password
- Mailgun: `smtp.mailgun.org`, port 587
- AWS SES: Regional endpoint, IAM credentials

### 4. Set Firebase Environment Config

Firebase Functions use `firebase functions:config:set` for production secrets:

```powershell
firebase functions:config:set smtp.host="smtp.gmail.com" smtp.port="587" smtp.user="your-email@gmail.com" smtp.pass="your-app-password"
```

Alternatively, update `functions/index.js` to use `functions.config().smtp.*` instead of `process.env.*`.

---

## Deploy

### Deploy all functions:

```powershell
cd functions
firebase deploy --only functions
```

### Deploy specific function:

```powershell
firebase deploy --only functions:onScheduleCreated
```

---

## Functions Overview

### 1. `onScheduleCreated`
**Trigger:** Database onCreate at `/schedules/{scheduleId}`  
**Action:**
- Fetches candidate email from `leaderboard/{candidateId}`
- Sends email with interview details and room link
- Logs activity to `activity/{candidateId}/{timestamp}`

**Email includes:**
- Department, date/time, organizer email
- "Join Interview Room" button with direct link
- Room name for reference

### 2. `onNoteCreated`
**Trigger:** Database onCreate at `/notes/{scheduleId}/{noteId}`  
**Action:**
- Logs activity for organizer
- Can be extended to notify candidate or analytics

### 3. `createSchedule` (HTTPS Callable)
**Endpoint:** `https://us-central1-YOUR_PROJECT.cloudfunctions.net/createSchedule`  
**Auth:** Requires Firebase Auth token  
**Input:**
```json
{
  "candidateId": "uid",
  "department": "cs",
  "time": 1699123456789
}
```
**Output:**
```json
{
  "scheduleId": "abc123",
  "roomName": "smartmock-abc12345"
}
```
**Security:** Verifies caller is a recruiter in `recruiters/{uid}`

### 4. `updateScheduleStatus` (HTTPS Callable)
**Endpoint:** `https://us-central1-YOUR_PROJECT.cloudfunctions.net/updateScheduleStatus`  
**Auth:** Requires Firebase Auth token  
**Input:**
```json
{
  "scheduleId": "abc123",
  "status": "completed"
}
```
**Security:** Only organizer or candidate can update

### 5. `scheduledCleanup` (Scheduled)
**Schedule:** Every 1 hour (configurable in `index.js`)  
**Actions:**
- Marks schedules with `time < now` and `status: 'scheduled'` as `'completed'`
- Sends 1-hour reminder emails to candidates for upcoming interviews

---

## Testing Locally

### Run Firebase Emulator

```powershell
cd functions
npm run serve
```

This starts local emulators for Functions, Database, etc.

### Trigger onCreate manually

1. Start emulator
2. Use Firebase Console or client app to create a schedule in `/schedules/{id}`
3. Watch function logs in terminal

### Test HTTPS endpoints

Use Firebase SDK client:

```javascript
const createSchedule = firebase.functions().httpsCallable('createSchedule');
const result = await createSchedule({ candidateId: 'uid123', department: 'cs', time: Date.now() + 86400000 });
console.log(result.data); // {scheduleId, roomName}
```

---

## Monitoring & Logs

### View logs in Firebase Console
https://console.firebase.google.com/project/YOUR_PROJECT/functions

### View logs in terminal

```powershell
firebase functions:log
```

### Filter specific function

```powershell
firebase functions:log --only onScheduleCreated
```

---

## Security Notes

- Functions verify auth with `context.auth.uid`
- Recruiter role checked via `recruiters/{uid}` node
- Schedule write access limited to organizer
- SMTP credentials stored in Firebase config (not in code)
- Database rules already enforce read/write permissions client-side

---

## Cost Estimation (Firebase Spark/Blaze Plans)

**Spark Plan (Free):**
- 125K invocations/month
- 40K GB-sec, 40K GHz-sec compute

**Blaze Plan (Pay-as-you-go):**
- $0.40 per million invocations after free tier
- Minimal cost for typical usage (<1000 schedules/month)

**Email costs:**
- Gmail: Free (with App Password)
- SendGrid: Free tier 100 emails/day
- Mailgun: 10,000 emails/month free

---

## Troubleshooting

### "SMTP not configured" warning in logs
→ Set Firebase config: `firebase functions:config:set smtp.user="..." smtp.pass="..."`

### Email not sending
→ Check SMTP credentials, firewall, Gmail "Less secure apps" settings (use App Password instead)

### Function not triggering
→ Verify database path matches exactly (`/schedules/{scheduleId}`)  
→ Check Firebase Console > Functions for error logs

### Permission denied in callable functions
→ Ensure user is authenticated and has `recruiters/{uid}` entry

---

## Next Steps

- [ ] Update `recruiter/schedule.js` to optionally call `createSchedule` function instead of direct DB write
- [ ] Add email templates (HTML/CSS) in `functions/templates/`
- [ ] Integrate calendar APIs (Google Calendar, Outlook) for scheduling
- [ ] Add SMS notifications via Twilio
- [ ] Implement Jitsi JWT token generation for secure rooms
- [ ] Add analytics tracking (Google Analytics, Mixpanel)

---

## Support

For issues or questions:
- Check Firebase Functions logs first
- Review security rules in `config/FIREBASE_RULES.json`
- Ensure Node 18+ and latest Firebase CLI

**Last Updated:** November 4, 2025
