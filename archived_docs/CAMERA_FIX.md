# Camera Black Screen Fix

## Issue
The camera was showing a black screen instead of the user's video reflection during the AI interview.

## Root Causes
1. **Video element not properly initialized** - The video stream wasn't being attached correctly to the video element
2. **No error handling for play() promise** - Video playback could fail silently
3. **Missing visual feedback** - No minimum dimensions or background color made it hard to debug
4. **Race conditions** - Metadata loading timing issues

## Fixes Applied

### 1. Enhanced Video Element Styling
```css
#user-video {
  width: 100%;
  height: auto;
  background-color: #1a1a1a;  /* Dark background to show video area */
  min-height: 450px;           /* Minimum height ensures visibility */
  object-fit: cover;           /* Proper video scaling */
}

.video-container {
  background-color: #1a1a1a;   /* Container background */
  border: 2px solid #333;      /* Visual boundary */
}
```

### 2. Improved Stream Initialization
- **Proper srcObject assignment**: Ensures stream is correctly attached
- **Explicit muted and playsInline attributes**: Required for autoplay in modern browsers
- **Better metadata loading**: Added timeout fallback (3 seconds) for slow cameras
- **Retry mechanism for play()**: Attempts to play twice with a delay if first attempt fails
- **Comprehensive logging**: Detailed console logs for debugging

### 3. Enhanced Error Handling
```javascript
async function openStreamForDevice(deviceId) {
  // ... constraints setup ...
  const s = await navigator.mediaDevices.getUserMedia(constraints);
  
  // Ensure video element is ready
  userVideo.srcObject = stream;
  userVideo.muted = true;
  userVideo.playsInline = true;
  
  // Wait for metadata with timeout
  await new Promise((resolve, reject) => {
    userVideo.onloadedmetadata = resolve;
    userVideo.onerror = reject;
    setTimeout(() => resolve(), 3000);
  });
  
  // Force play with retry
  try { 
    await userVideo.play();
    console.log('✅ Video stream started successfully');
  } catch(playErr) {
    await new Promise(r => setTimeout(r, 100));
    await userVideo.play();
  }
}
```

### 4. Better Diagnostics
Added comprehensive logging throughout the camera setup process:
- `🎥 Setting up camera...` - Initial setup
- `🎥 Attempting to open camera: [id]` - Camera selection attempt
- `✅ Video dimensions: WxH` - Successful stream with dimensions
- `⚠️ Video element has no dimensions` - Warning if stream isn't working
- `❌ Camera error: [details]` - Error details

## Testing Steps

### 1. Check Browser Permissions
- Click the lock icon in your browser's address bar
- Ensure Camera permission is set to "Allow"
- Reload the page if you change permissions

### 2. Verify Camera Access
1. Open the AI Interview page (`interview/cs/ai-interview.html`)
2. Open browser DevTools (F12)
3. Check the Console tab for:
   - `🎥 Setting up camera...`
   - `✅ Video stream started successfully`
   - `✅ Video dimensions: 640x480` (or your camera's resolution)

### 3. Troubleshooting

**Black screen with no errors:**
- Check if camera is in use by another application (Zoom, Teams, etc.)
- Try selecting a different camera from the dropdown
- Click "Retry Camera" button

**Permission denied:**
- Clear browser site data for localhost
- Refresh and allow camera access when prompted

**No camera found:**
- Verify camera is connected and working in other apps
- Check Windows Privacy settings: Settings > Privacy > Camera
- Ensure "Allow apps to access your camera" is ON

**Video dimensions show 0x0:**
- The stream may not be active - check if getUserMedia succeeded
- Try unplugging and reconnecting your camera
- Restart the browser

## Browser Compatibility
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Requires HTTPS (localhost works)
- ⚠️ Mobile browsers: Works but may need user interaction to start

## Additional Features
- **Auto camera detection**: Tries all available cameras if first one fails
- **Mock emotion mode**: Falls back to simulated emotions if camera unavailable
- **Persistent camera selection**: Remembers your preferred camera
- **Retry button**: Manual retry without page reload

## Technical Details

### getUserMedia Constraints
```javascript
{
  video: {
    deviceId: { exact: deviceId },  // Specific camera
    width: { ideal: 640 },
    height: { ideal: 480 }
  },
  audio: false
}
```

### Video Element Attributes
- `autoplay`: Starts playing as soon as stream is ready
- `muted`: Required for autoplay in most browsers
- `playsinline`: Prevents fullscreen on iOS

### CSP Considerations
The video stream is local and doesn't require additional CSP directives.

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Black screen | Check console logs, verify camera permissions |
| Camera in use | Close other apps using the camera |
| Permission denied | Reset site permissions in browser settings |
| No video dimensions | Camera stream failed - check hardware |
| Grainy/low quality | Normal for webcam quality - resolution is 640x480 |

## Files Modified
- `interview/cs/ai-interview.html`:
  - Enhanced CSS for video element
  - Improved `openStreamForDevice()` function
  - Better logging in `setupCamera()` function
  - Added video dimension verification

## Next Steps (Optional Improvements)
1. Add a loading spinner while camera initializes
2. Show camera preview before starting interview
3. Add camera settings (brightness, contrast)
4. Support for recording video
5. Picture-in-picture mode support
