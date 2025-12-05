(function(){
  if (!window.firebase || !firebase.apps?.length) {
    console.error('Firebase not initialized');
    alert('Firebase configuration error. Please check your setup.');
    return;
  }
  const auth = firebase.auth();
  const db = firebase.database();

  const emailEl = document.getElementById('email');
  const passwordEl = document.getElementById('password');
  const loginBtn = document.getElementById('login');

  if (!emailEl || !passwordEl || !loginBtn) {
    console.error('Required elements not found');
    return;
  }

  // Enter key support
  [emailEl, passwordEl].forEach(el => {
    el.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        loginBtn.click();
      }
    });
  });

  let isLoggingIn = false;

  loginBtn.addEventListener('click', async ()=>{
    if (isLoggingIn) return;

    const email = emailEl.value.trim();
    const password = passwordEl.value;

    // Validation
    if (!email) {
      alert('Please enter your email');
      emailEl.focus();
      return;
    }
    if (!password) {
      alert('Please enter your password');
      passwordEl.focus();
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      emailEl.focus();
      return;
    }

    isLoggingIn = true;
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';

    try{
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;
      
      // Verify recruiter profile
      const snap = await db.ref('recruiters/'+uid).get();
      if (!snap.exists()){
        await auth.signOut();
        alert('This account is not registered as a recruiter.\n\nPlease register a recruiter account or use the candidate portal.');
        return;
      }

      // Success
      window.location.href = './dashboard.html';
    } catch(e) {
      console.error('Login error:', e);
      
      // User-friendly error messages
      let errorMsg = 'Login failed. Please try again.';
      if (e.code === 'auth/user-not-found') {
        errorMsg = 'No account found with this email.\n\nPlease register first.';
      } else if (e.code === 'auth/wrong-password') {
        errorMsg = 'Incorrect password.\n\nPlease try again or reset your password.';
      } else if (e.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email format.';
      } else if (e.code === 'auth/too-many-requests') {
        errorMsg = 'Too many failed attempts.\n\nPlease try again later or reset your password.';
      } else if (e.code === 'auth/network-request-failed') {
        errorMsg = 'Network error.\n\nPlease check your internet connection.';
      }
      
      alert(errorMsg);
    } finally {
      isLoggingIn = false;
      loginBtn.disabled = false;
      loginBtn.textContent = 'Login';
    }
  });
})();
