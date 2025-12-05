# SMARTMOCK 3D Interview Scene

**Usage:** Put avatar GLB at `assets/avatar.glb` (optional). Open `index.html` in a web server.

## Quick Start

1. **Local Server (Required for ES6 modules):**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```

2. **Open in browser:**
   ```
   http://localhost:8000
   ```

3. **Optional: Add Avatar GLB**
   - Place your 3D avatar model at `assets/avatar.glb`
   - If not provided, a procedural fallback avatar will be generated

## Features

✨ **3D Cybernetic Avatar** - GLB loader with procedural fallback
🎨 **Glassmorphic Panels** - Three floating interactive panels with text
💡 **Neon Lighting** - Cyan & violet rim lights with bloom effects
🌟 **Bloom Postprocessing** - UnrealBloomPass for glow effects
🎭 **Parallax Camera** - Mouse-driven camera movement
🖱️ **Hover Interactions** - Panels tilt and glow on hover
✨ **Animated Particles** - 200+ floating particles in scene
📱 **Responsive Design** - Mobile-friendly layout
⚡ **Performance Mode** - Toggle button for low-power devices

## Technologies

- **Three.js r160** - 3D rendering engine
- **ES6 Modules** - Modern JavaScript
- **WebGL** - Hardware-accelerated graphics
- **Postprocessing** - Bloom, vignette effects

## Customization

Edit `app.js` CONFIG object:

```javascript
const CONFIG = {
  neonCyan: 0x00E4FF,        // Main cyan color
  neonViolet: 0xC500FF,      // Main violet color
  avatarPath: 'assets/avatar.glb',
  bloomStrength: 1.5,        // Glow intensity
  particleCount: 200,        // Number of particles
  // ... more settings
};
```

## File Structure

```
3d-interview-scene/
├── index.html          # Main HTML file
├── styles.css          # UI styles
├── app.js             # Three.js scene logic
├── assets/            # (optional)
│   ├── avatar.glb     # 3D avatar model
│   └── env.hdr        # HDR environment map
└── README.md          # This file
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- WebGL 2.0 required

## Performance Tips

1. Click **performance toggle** (top-right) on low-end devices
2. Reduce `particleCount` in CONFIG for better FPS
3. Disable bloom with `CONFIG.enableBloom = false`
4. Lower `renderer.setPixelRatio()` to 1

## Panel Navigation

- **START INTERVIEW** → `interview.html`
- **EMOTION ANALYSIS** → `dashboard.html`
- **PERFORMANCE SCORE** → `report.html`

Update URLs in `onPanelClick()` function.

## Credits

Built with Three.js - https://threejs.org
No watermarks, fully customizable, production-ready.
