const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();
const db = admin.database();

// Email transporter - configure with your SMTP provider
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Helper: Send email
async function sendEmail(to, subject, html) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP not configured, skipping email:', {to, subject});
    return;
  }
  try {
    await transporter.sendMail({
      from: `"SmartMock" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent:', to, subject);
  } catch (e) {
    console.error('Email failed:', e.message);
  }
}

// Trigger: Send email when schedule is created
exports.onScheduleCreated = functions.database
    .ref('/schedules/{scheduleId}')
    .onCreate(async (snapshot, context) => {
      const schedule = snapshot.val();
      const {candidateId, organizerId, department, time, roomName} = schedule;

      // Fetch candidate email
      const candidateSnap = await db.ref(`leaderboard/${candidateId}`).get();
      const candidate = candidateSnap.val() || {};
      const candidateEmail = candidate.email;

      if (!candidateEmail) {
        console.warn('No candidate email for:', candidateId);
        return;
      }

      // Fetch organizer
      const organizerSnap = await db.ref(`recruiters/${organizerId}`).get();
      const organizer = organizerSnap.val() || {};
      const organizerEmail = organizer.email || 'recruiter@smartmock.com';

      const dateTime = new Date(time).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      const roomUrl = `https://yourapp.com/recruiter/interview-room.html?room=${encodeURIComponent(roomName)}&sid=${context.params.scheduleId}`;

      const html = `
        <h2>Interview Scheduled</h2>
        <p>Hi ${candidate.displayName || candidate.name || 'Candidate'},</p>
        <p>You have been invited for an interview:</p>
        <ul>
          <li><b>Department:</b> ${department.toUpperCase()}</li>
          <li><b>Time:</b> ${dateTime}</li>
          <li><b>Organizer:</b> ${organizerEmail}</li>
        </ul>
        <p><a href="${roomUrl}" style="padding:10px 20px;background:#6C63FF;color:#fff;text-decoration:none;border-radius:8px;">Join Interview Room</a></p>
        <p>Good luck!</p>
      `;

      await sendEmail(candidateEmail, 'Interview Invitation - SmartMock', html);

      // Log activity
      await db.ref(`activity/${candidateId}/${Date.now()}`).set({
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        description: `${department.toUpperCase()} interview on ${dateTime}`,
      });
    });

// Trigger: Notify when note is added
exports.onNoteCreated = functions.database
    .ref('/notes/{scheduleId}/{noteId}')
    .onCreate(async (snapshot, context) => {
      const note = snapshot.val();
      const {scheduleId, authorId, rating, text} = note;

      // Fetch schedule
      const scheduleSnap = await db.ref(`schedules/${scheduleId}`).get();
      const schedule = scheduleSnap.val();
      if (!schedule) return;

      // Log activity for organizer
      await db.ref(`activity/${authorId}/${Date.now()}`).set({
        type: 'note_created',
        title: 'Note Added',
        description: `Added note for schedule ${scheduleId} (Rating: ${rating}/5)`,
      });

      console.log('Note created:', scheduleId, rating, text.slice(0, 50));
    });

// HTTPS: Secure schedule creation endpoint
exports.createSchedule = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const {candidateId, department, time} = data;
  if (!candidateId || !department || !time) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing fields');
  }

  // Verify organizer is a recruiter
  const recruiterSnap = await db.ref(`recruiters/${context.auth.uid}`).get();
  if (!recruiterSnap.exists()) {
    throw new functions.https.HttpsError('permission-denied', 'Not a recruiter');
  }

  const scheduleId = db.ref('schedules').push().key;
  const roomName = `smartmock-${scheduleId.slice(0, 8)}`;
  const schedule = {
    organizerId: context.auth.uid,
    candidateId,
    department,
    time,
    roomName,
    status: 'scheduled',
    createdAt: Date.now(),
  };

  await db.ref(`schedules/${scheduleId}`).set(schedule);
  return {scheduleId, roomName};
});

// HTTPS: Update schedule status
exports.updateScheduleStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const {scheduleId, status} = data;
  if (!scheduleId || !status) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing fields');
  }

  const scheduleSnap = await db.ref(`schedules/${scheduleId}`).get();
  const schedule = scheduleSnap.val();
  if (!schedule) {
    throw new functions.https.HttpsError('not-found', 'Schedule not found');
  }

  if (schedule.organizerId !== context.auth.uid && schedule.candidateId !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'Not authorized');
  }

  await db.ref(`schedules/${scheduleId}/status`).set(status);
  return {success: true, scheduleId, status};
});

// Scheduled: Mark past schedules as completed, send reminders
exports.scheduledCleanup = functions.pubsub.schedule('every 1 hours').onRun(async () => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  const schedulesSnap = await db.ref('schedules').orderByChild('time').endAt(now).get();
  const schedules = schedulesSnap.val() || {};

  let completed = 0;
  const updates = {};
  for (const [id, schedule] of Object.entries(schedules)) {
    if (schedule.status === 'scheduled' && schedule.time < now) {
      updates[`/schedules/${id}/status`] = 'completed';
      completed++;
    }
  }
  if (Object.keys(updates).length > 0) {
    await db.ref().update(updates);
  }

  // Send reminders for upcoming (1-2 hours from now)
  const upcomingSnap = await db.ref('schedules').orderByChild('time').startAt(now).endAt(now + 2 * oneHour).get();
  const upcoming = upcomingSnap.val() || {};

  for (const [id, schedule] of Object.entries(upcoming)) {
    if (schedule.status !== 'scheduled') continue;
    const candidateSnap = await db.ref(`leaderboard/${schedule.candidateId}`).get();
    const candidate = candidateSnap.val() || {};
    if (candidate.email && schedule.time - now <= oneHour && schedule.time - now > 0) {
      const dateTime = new Date(schedule.time).toLocaleString();
      await sendEmail(
          candidate.email,
          'Reminder: Interview in 1 hour',
          `<p>Your interview for ${schedule.department.toUpperCase()} is scheduled at ${dateTime}.</p><p>Room: ${schedule.roomName}</p>`,
      );
    }
  }

  console.log(`Cleanup: ${completed} schedules marked completed, ${Object.keys(upcoming).length} upcoming`);
});

  // ============================================================================
  // ADVANCED FEATURES (Resume Builder, Study Groups, Peer Review)
  // ============================================================================
  const advancedFeatures = require('./advanced-features');

  // Resume Builder Functions
  exports.saveResume = advancedFeatures.saveResume;
  exports.getUserResumes = advancedFeatures.getUserResumes;
  exports.calculateATSScore = advancedFeatures.calculateATSScore;
  exports.getAISuggestions = advancedFeatures.getAISuggestions;

  // Study Groups Functions
  exports.createStudyGroup = advancedFeatures.createStudyGroup;
  exports.joinStudyGroup = advancedFeatures.joinStudyGroup;
  exports.getStudyGroups = advancedFeatures.getStudyGroups;
  exports.postGroupMessage = advancedFeatures.postGroupMessage;

  // Peer Review Functions
  exports.requestPeerReview = advancedFeatures.requestPeerReview;
  exports.submitReview = advancedFeatures.submitReview;
  exports.getAvailableReviews = advancedFeatures.getAvailableReviews;
  exports.getReviewsForRequest = advancedFeatures.getReviewsForRequest;

  // User Statistics
  exports.getUserStats = advancedFeatures.getUserStats;
  exports.initializeNewUser = advancedFeatures.initializeNewUser;
