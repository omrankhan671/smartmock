(function() {
  if (!window.firebase || !firebase.apps?.length) {
    console.error('Firebase not initialized');
    alert('Firebase configuration error. Please check your setup.');
    return;
  }

  const auth = firebase.auth();

  auth.onAuthStateChanged(function(user) {
    if (!user) {
      // User is not logged in, redirect to login page
      window.location.href = './login.html';
    } else {
      // User is logged in, check if they are a recruiter
      const db = firebase.database();
      db.ref('recruiters/' + user.uid).once('value')
        .then(function(snapshot) {
          if (!snapshot.exists()) {
            // User is logged in but not registered as a recruiter
            auth.signOut().then(() => {
              alert('Access Denied: Your account is not registered as a recruiter.');
              window.location.href = './login.html';
            });
          }
        })
        .catch(function(error) {
          console.error("Error checking recruiter status:", error);
          auth.signOut().then(() => {
            alert('An error occurred. Please try logging in again.');
            window.location.href = './login.html';
          });
        });
    }
  });
})();
