(function(){
  if (!window.firebase || !firebase.apps?.length) {
    console.warn('Firebase not initialized');
    return;
  }
  const db = firebase.database();
  const auth = firebase.auth();
  let dbListener = null;

  if (window.RecruiterAuth?.requireRecruiter) {
    window.RecruiterAuth.requireRecruiter().then(init).catch((err) => {
      console.error('Auth failed:', err);
    });
  } else {
    init();
  }

  function fmt(ts){ 
    try{ 
      const d = new Date(ts);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleString('en-US', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      }); 
    }catch{ 
      return '-'; 
    } 
  }

  function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  async function init(){
    const u = auth.currentUser;
    if (!u) {
      console.error('No authenticated user');
      return;
    }

    const scheduleIdEl = document.getElementById('schedule-id');
    const ratingEl = document.getElementById('rating');
    const tagsEl = document.getElementById('tags');
    const noteEl = document.getElementById('note');
    const saveBtn = document.getElementById('save-note');
    const tbody = document.querySelector('#notes-table tbody');

    if (!scheduleIdEl || !ratingEl || !tagsEl || !noteEl || !saveBtn || !tbody) {
      console.error('Required elements not found');
      return;
    }

    // Pre-fill schedule ID from URL if present
    const params = new URLSearchParams(location.search);
    const preSchedule = params.get('sid') || params.get('schedule');
    if (preSchedule) {
      scheduleIdEl.value = preSchedule;
    }

    let isSaving = false;

    saveBtn.addEventListener('click', async ()=>{
      if (isSaving) return;

      const scheduleId = scheduleIdEl.value.trim();
      if (!scheduleId) { 
        alert('Schedule ID is required'); 
        scheduleIdEl.focus();
        return; 
      }

      const rating = parseInt(ratingEl.value||'3',10);
      const tags = (tagsEl.value||'').split(',').map(s=>s.trim()).filter(Boolean);
      const text = noteEl.value.trim();

      if (!text) {
        alert('Please write some notes');
        noteEl.focus();
        return;
      }

      isSaving = true;
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';

      try {
        // Verify schedule exists and belongs to this recruiter
        const scheduleSnap = await db.ref('schedules/' + scheduleId).get();
        if (!scheduleSnap.exists()) {
          alert('Schedule not found. Please check the ID.');
          return;
        }

        const schedule = scheduleSnap.val();
        if (schedule.organizerId !== u.uid) {
          alert('You can only add notes to your own schedules.');
          return;
        }

        const noteId = db.ref('notes').push().key;
        const note = {
          scheduleId,
          authorId: u.uid,
          rating: Math.max(1, Math.min(5, rating)),
          tags,
          text,
          createdAt: Date.now()
        };

        await db.ref('notes/'+scheduleId+'/'+noteId).set(note);
        
        // Success feedback
        alert('Note saved successfully!');
        scheduleIdEl.value=''; 
        ratingEl.value='3'; 
        tagsEl.value=''; 
        noteEl.value='';
      } catch (error) {
        console.error('Failed to save note:', error);
        alert('Failed to save note. Please try again.');
      } finally {
        isSaving = false;
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Note';
      }
    });

    // Load my notes with error handling
    try {
      dbListener = db.ref('notes').on('value', snap => {
        const all = snap.val()||{};
        const myId = u.uid;
        const notes = [];
        
        Object.keys(all).forEach(sid => {
          const obj = all[sid];
          if (obj && typeof obj === 'object') {
            Object.keys(obj).forEach(nid => {
              const n = obj[nid];
              if (n && n.authorId === myId) {
                notes.push({ noteId: nid, ...n });
              }
            });
          }
        });

        notes.sort((a,b)=> (b.createdAt||0) - (a.createdAt||0));
        tbody.innerHTML = '';

        if (notes.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:#9CA3AF;">No notes yet. Add one above!</td></tr>';
          return;
        }

        const fragment = document.createDocumentFragment();
        notes.forEach(n => {
          const tr = document.createElement('tr');
          const tagsStr = sanitize((n.tags||[]).join(', ') || '-');
          const textPreview = sanitize((n.text||'').slice(0,240) + ((n.text||'').length > 240 ? '...' : ''));
          const stars = '★'.repeat(n.rating || 0) + '☆'.repeat(5 - (n.rating || 0));
          
          tr.innerHTML = `
            <td>${fmt(n.createdAt)}</td>
            <td><code style="font-size:12px;">${sanitize(n.scheduleId)}</code></td>
            <td><span style="color:#ffd54f;">${stars}</span> (${n.rating}/5)</td>
            <td><span class="muted">${tagsStr}</span></td>
            <td>${textPreview}</td>
          `;
          fragment.appendChild(tr);
        });

        tbody.appendChild(fragment);
      }, (error) => {
        console.error('Database error:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:#ff6b6b;">Error loading notes. Please refresh.</td></tr>';
      });
    } catch (error) {
      console.error('Failed to initialize:', error);
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      if (dbListener) {
        db.ref('notes').off('value', dbListener);
      }
    });
  }
})();
