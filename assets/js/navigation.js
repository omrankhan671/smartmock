
document.addEventListener('DOMContentLoaded', function() {
    const nav = document.createElement('nav');
    nav.innerHTML = `
        <ul>
            <li><a href="/index.html">Home</a></li>
            <li><a href="/about.html">About</a></li>
            <li><a href="/contact.html">Contact</a></li>
            <li><a href="/dashboard.html">Dashboard</a></li>
            <li><a href="/profile.html">Profile</a></li>
            <li><a href="/leaderboard.html">Leaderboard</a></li>
            <li><a href="/recruiter/dashboard.html">Recruiter Dashboard</a></li>
        </ul>
    `;
    document.body.prepend(nav);
});
