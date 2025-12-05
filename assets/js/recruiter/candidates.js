(function(){
  if (!window.firebase || !firebase.apps?.length) {
    console.warn('Firebase not initialized');
    return;
  }
  const db = firebase.database();
  let dbListener = null;

  if (window.RecruiterAuth?.requireRecruiter) {
    window.RecruiterAuth.requireRecruiter().then(init).catch((err) => {
      console.error('Auth failed:', err);
    });
  } else {
    init();
  }

  function renderStars(avg){
    const full = Math.floor(avg);
    const half = avg - full >= 0.5;
    let s = '';
    for (let i=0;i<5;i++){
      if (i < full) s += '<span class="star">★</span>';
      else if (i === full && half) s += '<span class="star half">★</span>';
      else s += '<span class="star dim">★</span>';
    }
    return s;
  }

  function formatTime(ts){
    if (!ts) return '-';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '-';
    const now = Date.now();
    const diff = Math.floor((now - d.getTime())/1000);
    if (diff < 0) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff/86400)}d ago`;
    return d.toLocaleDateString();
  }

  function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  async function init(){
    const tbody = document.querySelector('#candidates-table tbody');
    const deptSel = document.getElementById('dept-filter');
    const sortSel = document.getElementById('sort');
    const search = document.getElementById('search');

    if (!tbody || !deptSel || !sortSel || !search) {
      console.error('Required elements not found');
      return;
    }

    let data = [];
    let isRendering = false;

    function apply(){
      if (isRendering) return;
      isRendering = true;
      
      try {
        const dept = deptSel.value;
        const q = (search.value || '').toLowerCase().trim();
        let rows = data.filter(r => (dept==='all' || (r.department||'').toLowerCase()===dept.toLowerCase()));
        if (q) {
          rows = rows.filter(r => 
            (r.displayName||'').toLowerCase().includes(q) || 
            (r.email||'').toLowerCase().includes(q) ||
            (r.name||'').toLowerCase().includes(q)
          );
        }
        const sort = sortSel.value;
        rows.sort((a,b)=>{
          const starsA = a.totalInterviews ? (a.totalStars||0)/a.totalInterviews : 0;
          const starsB = b.totalInterviews ? (b.totalStars||0)/b.totalInterviews : 0;
          if (sort === 'stars'){
            if (starsB !== starsA) return starsB - starsA;
            return (b.bestScore||0) - (a.bestScore||0);
          } else if (sort === 'score'){
            if ((b.bestScore||0) !== (a.bestScore||0)) return (b.bestScore||0) - (a.bestScore||0);
            return starsB - starsA;
          } else { // recent
            return (b.lastActive||0) - (a.lastActive||0);
          }
        });
        render(rows);
      } finally {
        isRendering = false;
      }
    }

    function render(rows){
      tbody.innerHTML = '';
      
      if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:#9CA3AF;">No candidates found</td></tr>';
        return;
      }

      const fragment = document.createDocumentFragment();
      rows.forEach(row => {
        const avg = row.totalInterviews ? (row.totalStars||0)/row.totalInterviews : 0;
        const tr = document.createElement('tr');
        const displayName = sanitize(row.displayName || row.name || row.email || 'Anonymous');
        const email = sanitize(row.email || '');
        const dept = sanitize((row.department || '-').toUpperCase());
        
        tr.innerHTML = `
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="avatar" style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">${displayName.charAt(0).toUpperCase()}</div>
              <div>
                <div class="name">${displayName}</div>
                <div class="muted" style="font-size:12px;">${email}</div>
              </div>
            </div>
          </td>
          <td><span class="badge">${dept}</span></td>
          <td><div class="stars">${renderStars(avg)} <span class="muted" style="margin-left:6px;font-size:12px">(${avg.toFixed(1)})</span></div></td>
          <td><b>${row.bestScore ?? '-'}</b></td>
          <td>${row.totalInterviews ?? 0}</td>
          <td>${formatTime(row.lastActive)}</td>
          <td>
            <button class="btn" data-action="schedule" data-uid="${row.uid}" data-name="${displayName}">Schedule</button>
          </td>
        `;
        fragment.appendChild(tr);
      });
      
      tbody.appendChild(fragment);
      
      // Attach event listeners after DOM update
      tbody.querySelectorAll('button[data-action="schedule"]').forEach(btn =>{
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const uid = btn.getAttribute('data-uid');
          const name = btn.getAttribute('data-name');
          if (uid) {
            window.location.href = `./schedule.html?candidate=${encodeURIComponent(uid)}&name=${encodeURIComponent(name)}`;
          }
        });
      });
    }

    // Debounce search input
    let searchTimeout;
    search.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(apply, 300);
    });

    deptSel.addEventListener('change', apply);
    sortSel.addEventListener('change', apply);

    // Load data with error handling
    try {
      dbListener = db.ref('leaderboard').on('value', snap => {
        const val = snap.val() || {};
        data = Object.keys(val).map(uid => ({ uid, ...val[uid] })).filter(r => r.totalInterviews > 0);
        apply();
      }, (error) => {
        console.error('Database error:', error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:#ff6b6b;">Error loading candidates. Please refresh.</td></tr>';
      });
    } catch (error) {
      console.error('Failed to initialize:', error);
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      if (dbListener) {
        db.ref('leaderboard').off('value', dbListener);
      }
    });
  }
})();
