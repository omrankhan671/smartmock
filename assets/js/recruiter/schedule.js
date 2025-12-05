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

  function uuid(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random()*16|0, v = c=='x'?r:(r&0x3|0x8);return v.toString(16);
    });
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

    const params = new URLSearchParams(location.search);
    const preCandidate = params.get('candidate') || '';
    const preName = params.get('name') || '';

    const candidateEl = document.getElementById('candidate-id');
    const deptEl = document.getElementById('department');
    const timeEl = document.getElementById('time');
    const createBtn = document.getElementById('create-btn');
    const tbody = document.querySelector('#schedules-table tbody');

    if (!candidateEl || !deptEl || !timeEl || !createBtn || !tbody) {
      console.error('Required elements not found');
      return;
    }

    if (preCandidate) {
      candidateEl.value = preCandidate;
      candidateEl.setAttribute('placeholder', preName || preCandidate);
    }

    // Set minimum time to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    timeEl.min = now.toISOString().slice(0, 16);

    let isCreating = false;

    createBtn.addEventListener('click', async () => {
      if (isCreating) return;
      
      const candidateId = candidateEl.value.trim();
      const department = deptEl.value;
      const timeVal = timeEl.value;
      
      if (!candidateId) { 
        alert('Candidate UID is required'); 
        candidateEl.focus();
        return; 
      }
      if (!timeVal) { 
        alert('Date and time are required'); 
        timeEl.focus();
        return; 
      }
      
      const epoch = Date.parse(timeVal);
      if (isNaN(epoch)) { 
        alert('Invalid date/time'); 
        return; 
      }
      if (epoch < Date.now()) {
        alert('Cannot schedule interviews in the past');
        return;
      }

      isCreating = true;
      createBtn.disabled = true;
      createBtn.textContent = 'Creating...';

      try {
        // Verify candidate exists
        const candidateSnap = await db.ref('leaderboard/' + candidateId).get();
        if (!candidateSnap.exists()) {
          alert('Candidate not found. Please check the UID.');
          return;
        }

        const id = uuid();
        const roomName = 'smartmock-' + id.slice(0,8);
        const schedule = {
          organizerId: u.uid,
          candidateId,
          department,
          time: epoch,
          roomName,
          status: 'scheduled',
          createdAt: Date.now()
        };
        
        await db.ref('schedules/'+id).set(schedule);
        
        // Success feedback
        alert(`Interview scheduled successfully!\nRoom: ${roomName}\nTime: ${fmt(epoch)}`);
        candidateEl.value=''; 
        timeEl.value='';
      } catch (error) {
        console.error('Failed to create schedule:', error);
        alert('Failed to create schedule. Please try again.');
      } finally {
        isCreating = false;
        createBtn.disabled = false;
        createBtn.textContent = 'Create Schedule';
      }
    });

    // Load schedules with error handling
    try {
      let leaderboardCache = null;

      dbListener = db.ref('schedules').orderByChild('organizerId').equalTo(u.uid).on('value', async (snap)=>{
        const val = snap.val() || {};
        
        // Cache leaderboard data
        if (!leaderboardCache) {
          try {
            const boardSnap = await db.ref('leaderboard').get();
            leaderboardCache = boardSnap.val() || {};
          } catch (error) {
            console.error('Failed to load leaderboard:', error);
            leaderboardCache = {};
          }
        }

        const rows = Object.keys(val).map(id => ({ id, ...val[id] }));
        rows.sort((a,b)=> (a.time||0) - (b.time||0));
        
        tbody.innerHTML = '';
        
        if (rows.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:#9CA3AF;">No schedules yet. Create one above!</td></tr>';
          return;
        }

        const fragment = document.createDocumentFragment();
        const now = Date.now();
        
        rows.forEach(r => {
          const candidate = leaderboardCache[r.candidateId] || {};
          const tr = document.createElement('tr');
          const candidateName = sanitize(candidate.displayName || candidate.name || candidate.email || r.candidateId);
          const isPast = r.time < now;
          const statusClass = r.status === 'completed' ? 'success' : isPast ? 'warning' : 'info';
          
          tr.innerHTML = `
            <td>${fmt(r.time)}</td>
            <td><b>${candidateName}</b></td>
            <td><span class="badge">${(r.department||'').toUpperCase()}</span></td>
            <td><span class="pill ${statusClass}">${r.status}</span></td>
            <td><code style="font-size:12px;">${sanitize(r.roomName)}</code></td>
            <td>
              <a class="btn" href="./interview-room.html?room=${encodeURIComponent(r.roomName)}&sid=${encodeURIComponent(r.id)}" ${r.status === 'completed' ? 'style="opacity:0.5;pointer-events:none;"' : ''}>
                ${r.status === 'completed' ? 'Completed' : 'Join Room'}
              </a>
            </td>
          `;
          fragment.appendChild(tr);
        });
        
        tbody.appendChild(fragment);
      }, (error) => {
        console.error('Database error:', error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:#ff6b6b;">Error loading schedules. Please refresh.</td></tr>';
      });
    } catch (error) {
      console.error('Failed to initialize schedules:', error);
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      if (dbListener) {
        db.ref('schedules').off('value', dbListener);
      }
    });
  }
})();
