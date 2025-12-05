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
  const companyEl = document.getElementById('company');
  const registerBtn = document.getElementById('register');

  if (!emailEl || !passwordEl || !companyEl || !registerBtn) {
    console.error('Required elements not found');
    return;
  }

  // Enter key support
  [emailEl, passwordEl, companyEl].forEach(el => {
    el.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        registerBtn.click();
      }
    });
  });

  let isRegistering = false;

  registerBtn.addEventListener('click', async ()=>{
    if (isRegistering) return;

    const email = emailEl.value.trim();
    const password = passwordEl.value;
    const company = companyEl.value.trim();

    // Validation
    if (!email) {
      alert('Please enter your work email');
      emailEl.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      emailEl.focus();
      return;
    }

    if (!password) {
      alert('Please enter a password');
      passwordEl.focus();
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      passwordEl.focus();
      return;
    }

    isRegistering = true;
    registerBtn.disabled = true;
    registerBtn.textContent = 'Creating account...';

    try{
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;
      
      // Create recruiter profile
      await db.ref('recruiters/'+uid).set({ 
        email, 
        role: 'recruiter', 
        company: company || null, 
        createdAt: Date.now(),
        lastLogin: Date.now()
      });

      // Success
      alert('Account created successfully!\n\nWelcome to SmartMock Recruiter Portal.');
      window.location.href = './dashboard.html';
    } catch(e) {
      console.error('Registration error:', e);
      
      // User-friendly error messages
      let errorMsg = 'Registration failed. Please try again.';
      if (e.code === 'auth/email-already-in-use') {
        errorMsg = 'This email is already registered.\n\nPlease login or use a different email.';
      } else if (e.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email format.';
      } else if (e.code === 'auth/weak-password') {
        errorMsg = 'Password is too weak.\n\nPlease use at least 6 characters with a mix of letters and numbers.';
      } else if (e.code === 'auth/network-request-failed') {
        errorMsg = 'Network error.\n\nPlease check your internet connection.';
      }
      
      alert(errorMsg);
    } finally {
      isRegistering = false;
      registerBtn.disabled = false;
      registerBtn.textContent = 'Register';
    }
  });
})();
