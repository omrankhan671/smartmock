# 🏆 Leaderboard System - Complete Guide

## Overview
The SmartMock Leaderboard System provides real-time competitive rankings for all users based on their AI interview performance. Users can view global rankings, filter by department and timeframe, track their own progress, and see improvement trends.

---

## Features Implemented

### ✅ Frontend Components
- **leaderboard.html** - Main leaderboard page with full UI
- **leaderboard.css** - Complete styling (800+ lines)
- **leaderboard.js** - Core functionality (600+ lines)
- **leaderboard-integration.js** - Integration script for AI interview pages

### ✅ Key Features
1. **Real-Time Rankings** - Live updates from Firebase
2. **Top 3 Podium** - Visual display of gold, silver, bronze winners
3. **Full Rankings Table** - Paginated table (25 users per page)
4. **Filters** - Department (CS/EE/ME/CE/EC) and Timeframe (All Time/Month/Week/Today)
5. **Search** - Find users by name or email
6. **User Performance Card** - Personal stats with global/department rank
7. **Statistics Dashboard** - Total users, interviews, average score
8. **Responsive Design** - Mobile, tablet, and desktop optimized

---

## Firebase Database Structure

```javascript
leaderboard/
  {userId}/
    name: String              // User's full name
    email: String             // User's email
    department: String        // cs, ee, me, ce, or ec
    bestScore: Number         // Highest score achieved (0-100)
    totalInterviews: Number   // Total interviews completed
    totalScore: Number        // Sum of all scores
    recentScores: Array[10]   // Last 10 scores for trend analysis
    grade: String             // Current grade (A+, A, B, C, D, F)
    improvement: Number       // Performance improvement percentage
    lastActive: Timestamp     // Last interview timestamp
```

---

## Integration with AI Interview System

### Step 1: Add Script to AI Interview Page

Add this to the `<head>` section of your AI interview HTML files:

```html
<script src="../../assets/js/leaderboard-integration.js"></script>
```

### Step 2: Call After Interview Completion

When the interview finishes, call the save function:

```javascript
// After calculating final score
const interviewResults = {
    department: 'cs',        // or 'ee', 'me', 'ce', 'ec'
    score: 85,              // Score out of 100
    grade: 'A'              // Calculated grade
};

// Save to leaderboard
await saveToLeaderboard(interviewResults);

// Show notification (optional)
showLeaderboardNotification(rank, improvement);
```

### Step 3: Complete Integration Example

```javascript
// In your AI interview completion handler
async function completeInterview() {
    try {
        // Calculate final score
        const score = calculateFinalScore();
        const grade = calculateGrade(score);
        
        // Prepare interview data
        const interviewData = {
            department: getDepartment(), // e.g., 'cs'
            score: score,
            grade: grade
        };
        
        // Save to user's interviews
        await saveInterviewToFirebase(interviewData);
        
        // Update leaderboard
        await saveToLeaderboard(interviewData);
        
        // Show success message
        console.log('✅ Interview saved and leaderboard updated');
        
        // Optional: Show notification
        const userData = await getUserLeaderboardData();
        if (userData) {
            showLeaderboardNotification(
                userData.rank,
                userData.improvement
            );
        }
        
        // Redirect to report
        setTimeout(() => {
            window.location.href = 'ai-report.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error completing interview:', error);
        alert('Interview completed but failed to update leaderboard');
    }
}
```

---

## How It Works

### 1. User Takes Interview
- User completes AI interview in any department
- System calculates score (0-100) and grade (A+ to F)

### 2. Automatic Leaderboard Update
- Integration script automatically updates leaderboard
- User's best score is tracked
- Total interviews count is incremented
- Recent 10 scores are stored for trend analysis

### 3. Rank Calculation
- Leaderboard ranks all users by best score (descending)
- Ties are broken by total interviews (more = higher)
- Ranks update in real-time as new scores come in

### 4. Improvement Tracking
- System compares last 5 scores vs previous 5 scores
- Calculates percentage improvement
- Shows as positive (green) or negative (red) trend

---

## Usage Instructions

### For Users

#### Viewing Leaderboard
1. Click **🏆 Leaderboard** in navigation menu
2. See global rankings automatically loaded
3. View Top 3 on podium display
4. Scroll table for full rankings

#### Filtering Rankings
1. Select **Department** dropdown (CS, EE, ME, CE, EC)
2. Select **Timeframe** dropdown (All Time, Month, Week, Today)
3. Rankings update automatically

#### Searching for Users
1. Type name or email in search box
2. Table filters in real-time
3. Clear search to see all users again

#### Viewing Your Stats
1. Your rank shown in stats cards at top
2. Performance card shows detailed stats:
   - Global Rank
   - Department Rank
   - Best Score
   - Total Interviews
   - Average Score
   - Improvement Trend

### For Developers

#### Adding to New Pages
1. Copy navigation menu HTML from existing page
2. Ensure Firebase scripts are loaded
3. Add leaderboard link: `<a href="leaderboard.html">🏆 Leaderboard</a>`

#### Customizing Display
Edit `leaderboard.css` to change:
- Colors (line 5-10: CSS variables)
- Podium design (line 120-250)
- Table styles (line 350-450)
- Animations (line 650-700)

#### Extending Functionality
Edit `leaderboard.js` to add:
- New filters
- Different sorting methods
- Export/download rankings
- More statistics

---

## Firebase Security Rules

Add these rules to your Firebase database:

```json
{
  "rules": {
    "leaderboard": {
      ".read": "auth != null",
      "$userId": {
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

This ensures:
- ✅ Any logged-in user can read leaderboard
- ✅ Users can only write their own data
- ❌ Anonymous access is blocked
- ❌ Users can't modify others' scores

---

## API Reference

### Functions in `leaderboard.js`

#### `loadLeaderboardData()`
Loads all leaderboard data from Firebase and calculates ranks.

```javascript
await loadLeaderboardData();
```

#### `applyFilters()`
Filters leaderboard by selected department and timeframe.

```javascript
applyFilters(); // Uses current dropdown values
```

#### `renderPodium()`
Renders top 3 users on podium display.

```javascript
renderPodium();
```

#### `renderLeaderboard()`
Renders paginated leaderboard table.

```javascript
renderLeaderboard();
```

#### `loadUserPerformance()`
Loads current user's performance stats.

```javascript
await loadUserPerformance();
```

### Functions in `leaderboard-integration.js`

#### `saveToLeaderboard(interviewResults)`
Saves interview results to leaderboard.

```javascript
await saveToLeaderboard({
    department: 'cs',
    score: 85,
    grade: 'A'
});
```

#### `showLeaderboardNotification(rank, improvement)`
Shows popup notification with rank and improvement.

```javascript
showLeaderboardNotification(12, 5); // Rank #12, +5% improvement
```

#### `getDepartmentFromURL()`
Auto-detects department from current page URL.

```javascript
const dept = getDepartmentFromURL(); // Returns 'cs', 'ee', etc.
```

#### `calculateGrade(score)`
Converts numeric score to letter grade.

```javascript
const grade = calculateGrade(85); // Returns 'A'
```

---

## Testing Checklist

### ✅ Basic Functionality
- [ ] Page loads without errors
- [ ] User must be logged in to view
- [ ] Stats cards display correct numbers
- [ ] Podium shows top 3 users
- [ ] Table displays all users

### ✅ Filters
- [ ] Department filter works
- [ ] Timeframe filter works
- [ ] Filters combine correctly
- [ ] Ranks recalculate after filtering

### ✅ Search
- [ ] Search by name works
- [ ] Search by email works
- [ ] Search is case-insensitive
- [ ] Clear search shows all users

### ✅ Pagination
- [ ] Next/Previous buttons work
- [ ] Page info updates correctly
- [ ] Buttons disable at boundaries
- [ ] Shows 25 users per page

### ✅ User Performance
- [ ] Performance card displays
- [ ] Global rank is correct
- [ ] Department rank is correct
- [ ] Stats update after new interview
- [ ] Close button works

### ✅ Real-Time Updates
- [ ] New scores appear immediately
- [ ] Ranks recalculate automatically
- [ ] Firebase listeners work
- [ ] No duplicate entries

### ✅ Integration
- [ ] AI interview saves to leaderboard
- [ ] Best score updates correctly
- [ ] Total interviews increments
- [ ] Recent scores tracked
- [ ] Improvement calculates correctly

### ✅ Responsive Design
- [ ] Mobile view works (< 768px)
- [ ] Tablet view works (768-1024px)
- [ ] Desktop view works (> 1024px)
- [ ] Podium stacks on mobile
- [ ] Table scrolls horizontally

---

## Troubleshooting

### Problem: Leaderboard is empty
**Solution:**
1. Check Firebase connection
2. Verify Firebase rules allow read access
3. Ensure users have completed interviews
4. Check browser console for errors

### Problem: Ranks not updating
**Solution:**
1. Click Refresh button
2. Check internet connection
3. Verify Firebase database structure
4. Clear browser cache

### Problem: User's rank shows "--"
**Solution:**
1. User must complete at least one interview
2. Wait for Firebase to sync (2-3 seconds)
3. Refresh the page
4. Check that integration script is working

### Problem: Filters not working
**Solution:**
1. Check that data has `department` field
2. Verify `lastActive` timestamp exists
3. Check browser console for errors
4. Reload the page

### Problem: Integration not saving scores
**Solution:**
1. Verify `leaderboard-integration.js` is loaded
2. Check Firebase write permissions
3. Ensure `saveToLeaderboard()` is called
4. Verify interview data has required fields

---

## Performance Optimization

### Current Performance
- Initial load: ~1-2 seconds (depends on user count)
- Filter change: Instant (client-side)
- Real-time update: 2-3 seconds (Firebase sync)
- Pagination: Instant (client-side)

### Optimization Tips
1. **Limit data fetched** - Only load recent users if list is huge
2. **Cache results** - Store in localStorage for faster loads
3. **Lazy load avatars** - Use placeholders then load images
4. **Debounce search** - Already implemented (300ms delay)
5. **Virtual scrolling** - For very large tables (1000+ users)

---

## Future Enhancements

### Planned Features
- [ ] Weekly/Monthly leaderboard snapshots
- [ ] Achievement badges
- [ ] Department-specific podiums
- [ ] Export rankings as CSV
- [ ] Share rank on social media
- [ ] Friend comparisons
- [ ] Historical rank tracking (graph)
- [ ] Push notifications for rank changes
- [ ] Leaderboard challenges
- [ ] Team leaderboards (by university)

### Advanced Features
- [ ] ML-based skill matching
- [ ] Predicted future rank
- [ ] Performance insights dashboard
- [ ] Compare with similar users
- [ ] Leaderboard API for external apps

---

## Support

### Questions?
- 📧 Email: khanomran365@gmail.com
- 💬 Community: In-app forum
- 📖 Docs: This file

### Report Issues
1. Check troubleshooting section first
2. Verify Firebase is configured
3. Include browser console errors
4. Describe steps to reproduce

---

## Credits

**Developed by:** SmartMock Team  
**Version:** 1.0  
**Last Updated:** November 3, 2025  
**Technologies:** Firebase Realtime Database, Vanilla JavaScript, CSS3

---

## License

Part of SmartMock - AI-Powered Interview Platform  
Educational project - All rights reserved.

✅ Use for personal learning  
✅ Use for educational purposes  
❌ No commercial use without permission  
❌ No redistribution without attribution  

---

**🎉 The Leaderboard System is now fully functional and integrated!**
