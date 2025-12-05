# 3D ROBOT INTERVIEWER - INTEGRATION GUIDE

## ✅ COMPLETED
- CS AI Interview (`interview/cs/ai-interview.html`) - ROBOT INTEGRATED

## 📋 INTEGRATION CHECKLIST FOR OTHER DEPARTMENTS

### Step 1: Add CSS Link (in `<head>`)
Add this line after the existing styles.css:
```html
<link rel="stylesheet" href="../../assets/css/robot-interviewer.css" />
```

### Step 2: Replace Avatar HTML
Find this old emoji avatar code:
```html
<div class="ai-avatar-container">
  <div class="ai-avatar" id="ai-avatar">
    <div class="ai-mouth"></div>
  </div>
  <div class="avatar-status" id="avatar-status"></div>
</div>
```

Replace with this 3D robot code:
```html
<div class="ai-avatar-container" id="robot-container">
  <canvas id="robot-interviewer-canvas"></canvas>
  <div class="avatar-status" id="avatar-status"></div>
</div>
```

### Step 3: Remove Old Emoji CSS
Delete all the emoji avatar CSS styles (lines 75-190 approximately):
- `.ai-avatar` styles
- `.ai-avatar.speaking`, `.ai-avatar.happy`, `.ai-avatar.sad`
- `.ai-avatar::before`, `.ai-avatar::after` (eyes)
- `.ai-mouth` styles
- `@keyframes speaking`, `@keyframes bounce`, `@keyframes shake`
- `@keyframes mouthMove`

Replace with just:
```css
/* 3D Robot Interviewer styles are loaded from robot-interviewer.css */
```

### Step 4: Add Three.js Import (before `<script>` section)
Add this before the main `<script>` tag:
```html
<!-- Three.js for 3D Robot -->
<script type="importmap">
  {
    "imports": {
      "three": "https://unpkg.com/three@0.138.0/build/three.module.js"
    }
  }
</script>
<script type="module" src="../../assets/js/robot-interviewer.js"></script>

<script type="module">
```

### Step 5: Update JavaScript Initialization
Find this code (around line 370-390):
```javascript
const aiAvatar = document.getElementById('ai-avatar');
const avatarStatus = document.getElementById('avatar-status');

// Avatar control functions
function setAvatarState(state, message = '') {
  aiAvatar.classList.remove('speaking', 'happy', 'sad');
  if (state) {
    aiAvatar.classList.add(state);
  }
  // ...
}
```

Replace with:
```javascript
// Initialize 3D Robot Interviewer
let robotInterviewer = null;

async function initRobot() {
  try {
    const module = await import('../../assets/js/robot-interviewer.js');
    const RobotInterviewer = module.default || window.RobotInterviewer;
    
    if (RobotInterviewer) {
      robotInterviewer = new RobotInterviewer('robot-container');
      console.log('✅ 3D Robot Interviewer initialized');
    }
  } catch (error) {
    console.error('Failed to initialize robot:', error);
  }
}

initRobot();

const avatarStatus = document.getElementById('avatar-status');

// Avatar control functions (now using 3D Robot)
function setAvatarState(state, message = '') {
  if (robotInterviewer) {
    robotInterviewer.setState(state);
  }
  
  if (message) {
    avatarStatus.textContent = message;
    avatarStatus.classList.add('show');
    setTimeout(() => {
      avatarStatus.classList.remove('show');
    }, 3000);
  }
}
```

### Step 6: Update avatarNeutral() function
Change:
```javascript
function avatarNeutral() {
  setAvatarState('', '');
}
```

To:
```javascript
function avatarNeutral() {
  setAvatarState('neutral', '');
}
```

## 🎯 DEPARTMENTS TO UPDATE

- [ ] EE - `interview/ee/ai-interview.html`
- [ ] ME - `interview/me/ai-interview.html`
- [ ] CE - `interview/ce/ai-interview.html`
- [ ] EC - `interview/ec/ai-interview.html`

## 🤖 ROBOT FEATURES

The 3D robot has the same functionality as the emoji avatar:

| Function | Robot Behavior |
|----------|---------------|
| `avatarSpeak()` | Mouth moves, head bobs, "speaking" animation |
| `avatarHappy()` | Winks, big smile, bounces up/down |
| `avatarSad()` | Droopy eyes, frown, head droops |
| `avatarNeutral()` | Returns to idle state with subtle rotation |

Additional features:
- **Auto-blinking** every 3-7 seconds
- **Glowing purple/cyan materials**
- **Animated antenna** with pulsing ball
- **Rotating energy core** in chest
- **Idle animations** when not in use

## 🎨 CUSTOMIZATION

To customize robot colors, edit `assets/js/robot-interviewer.js`:
- Line 135: `emissive: 0xa855f7` (purple glow)
- Line 195: `emissive: 0x00f0ff` (cyan pupils)
- Line 235: `emissive: 0xd946ef` (pink core)

## ⚠️ TROUBLESHOOTING

**Robot not appearing?**
- Check browser console for errors
- Ensure Three.js is loading (check Network tab)
- Verify `robot-container` ID exists

**Robot not animating?**
- Check that `robotInterviewer` is initialized
- Verify `setState()` is being called
- Check that functions (avatarSpeak, etc.) are using new code

**Performance issues?**
- Reduce particle count (not applicable to robot)
- Check if multiple robots are initialized
- Ensure only one animation loop is running

## 📞 SUPPORT

If issues arise, check:
1. Browser console for JavaScript errors
2. Network tab to ensure Three.js loads
3. That all 6 steps above were completed
4. That the robot-interviewer.js file exists and is accessible
