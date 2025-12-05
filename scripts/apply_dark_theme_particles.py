"""
Apply Dark Black Theme + Purple Particles + Background 3D Robot + Glass UI + Hamburger Overlay

Extends previous script: now injects (idempotently) the following into every HTML page:
  1. Dark theme & glass morphism CSS (with a marker id="dark-theme-injected")
  2. Particles container (120 purple particles) if missing
  3. Background robot container + canvas if missing
  4. Three.js CDN + robot-interviewer.js (only if not already present)
  5. Background robot initialization (guarded by meta id="bg-robot-initialized")
  6. Hamburger overlay menu (guarded by meta id="hamburger-overlay-initialized")

Idempotent logic prevents duplicate insertion if pages were manually patched earlier.
Pages previously processed will be skipped only if BOTH meta markers are detected.
"""

import os
import re
from pathlib import Path

# Dark theme + glass & layering CSS to inject
DARK_THEME_CSS = """    <style id="dark-theme-injected">
      /* Dark Black Theme with Purple Particles */
      body {
        background: #000000 !important;
        position: relative;
        overflow-x: hidden;
      }
      
      body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 70%);
        pointer-events: none;
        z-index: 0;
      }
      
      .particles-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 2; /* robot at 1, particles at 2, content at 10 */
        overflow: hidden;
      }
      
      .particle {
        position: absolute;
        background: #a855f7;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(168, 85, 247, 0.5), 0 0 20px rgba(168, 85, 247, 0.5);
        opacity: 0;
        animation: floatUpward linear infinite;
      }
      
      @keyframes floatUpward {
        0% {
          transform: translateY(100vh) translateX(0) scale(0);
          opacity: 0;
        }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% {
          transform: translateY(-20vh) translateX(var(--drift)) scale(1);
          opacity: 0;
        }
      }
      
      header, main, section, .card, .hero-card, .auth-card, .report-card, .interview-container, .content-wrapper, .dashboard-grid {
        position: relative;
        z-index: 10;
      }
      
      .site-header {
        background: rgba(10, 10, 10, 0.8) !important;
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(168, 85, 247, 0.2);
        z-index: 1000 !important;
      }
      
      .card, .hero-card, .report-card {
        background: rgba(18, 18, 18, 0.8) !important;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(168, 85, 247, 0.2);
        transition: all 0.3s ease;
      }
      
      .card:hover, .hero-card:hover, .report-card:hover, .hover-card:hover {
        border-color: rgba(168, 85, 247, 0.5);
        box-shadow: 0 10px 40px rgba(168, 85, 247, 0.3);
        transform: translateY(-5px);
      }
      
      .logo-accent {
        color: #a855f7 !important;
        text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
      }
      
      .btn.primary {
        background: linear-gradient(135deg, #a855f7, #d946ef) !important;
        box-shadow: 0 10px 30px rgba(168, 85, 247, 0.4);
      }
      
      .btn.primary:hover {
        box-shadow: 0 15px 40px rgba(168, 85, 247, 0.6);
        transform: translateY(-2px);
      }
      
      .auth-card {
        background: rgba(18, 18, 18, 0.9) !important;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(168, 85, 247, 0.3);
        box-shadow: 0 20px 60px rgba(168, 85, 247, 0.3);
      }

      /* Glass override for inline gradient styles */
      .card[style*="linear-gradient"], .hover-card[style*="linear-gradient"] {
        background: rgba(18,18,18,0.75) !important;
      }

      /* Background robot container */
      #bg-robot-container { position: fixed; inset: 0; z-index: 1; pointer-events: none; }
      #bg-robot-container canvas { width:100%; height:100%; display:block; }

      /* Hamburger Overlay */
      #menu-overlay { position: fixed; inset:0; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); display:none; z-index:1500; }
      #menu-panel { position: fixed; top:0; right:0; width:min(320px,80vw); height:100%; background: rgba(18,18,18,0.9); border-left:1px solid rgba(168,85,247,0.3); box-shadow:-10px 0 40px rgba(0,0,0,0.4); transform:translateX(100%); transition:transform .3s ease; z-index:1600; }
      #menu-panel.open { transform:translateX(0); }
      body.menu-open #menu-overlay { display:block; }
    </style>"""

# Containers HTML fragments
PARTICLES_ONLY_HTML = '\n    <!-- Floating Particles (auto injected) -->\n    <div class="particles-container" id="particlesContainer"></div>\n'
ROBOT_CONTAINER_HTML = '\n    <!-- Background Robot Container -->\n    <div id="bg-robot-container"><canvas id="bg-robot-canvas"></canvas></div>\n'

# Particles JavaScript (idempotent generation guarded by container existence)
PARTICLES_JS = """
    <!-- Particle Generation Script -->
    <script>
      // Create 120 floating purple particles
      if (document.getElementById('particlesContainer')) {
        const particlesContainer = document.getElementById('particlesContainer');
        const particleCount = 120;

        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          particle.classList.add('particle');
          
          // Random size (2-6px)
          const size = 2 + Math.random() * 4;
          particle.style.width = `${size}px`;
          particle.style.height = `${size}px`;
          
          // Random horizontal position
          const leftPos = Math.random() * 100;
          particle.style.left = `${leftPos}%`;
          
          // Random animation duration (12-25 seconds)
          const duration = 12 + Math.random() * 13;
          particle.style.animationDuration = `${duration}s`;
          
          // Random delay
          const delay = Math.random() * 10;
          particle.style.animationDelay = `${delay}s`;
          
          // Random horizontal drift
          const drift = (Math.random() - 0.5) * 150;
          particle.style.setProperty('--drift', `${drift}px`);
          
          particlesContainer.appendChild(particle);
        }
      }
    </script>"""

# Background robot + hamburger overlay initialization
ROBOT_INIT_JS = """
    <!-- Background Robot + Hamburger Init -->
    <script>
      (function initBgRobot(){
        if (document.getElementById('bg-robot-initialized')) return; // idempotent
        const flag = document.createElement('meta'); flag.id='bg-robot-initialized'; document.head.appendChild(flag);
        function start(){
          if (typeof THREE === 'undefined' || typeof window.RobotInterviewer === 'undefined') return setTimeout(start, 120);
          try {
            window.bgRobotGlobal = new window.RobotInterviewer('bg-robot-container', THREE, { canvasId:'bg-robot-canvas', trackCursor:true });
            window.bgRobotGlobal.setState('neutral');
            console.log('✅ Global background robot initialized');
          } catch(e){ console.error('❌ Global robot failed:', e); }
        }
        start();
      })();
      (function initHamburger(){
        if (document.getElementById('hamburger-overlay-initialized')) return;
        const flag = document.createElement('meta'); flag.id='hamburger-overlay-initialized'; document.head.appendChild(flag);
        const menuBtn = document.querySelector('.menu-button');
        const dropdown = document.querySelector('.dropdown');
        if (!menuBtn || !dropdown) return;
        let overlay = document.getElementById('menu-overlay');
        let panel = document.getElementById('menu-panel');
        if (!overlay) { overlay = document.createElement('div'); overlay.id='menu-overlay'; document.body.appendChild(overlay); }
        if (!panel) {
          panel = document.createElement('div'); panel.id='menu-panel'; document.body.appendChild(panel);
          const clone = dropdown.cloneNode(true);
          clone.style.display='block'; clone.style.padding='20px'; clone.style.listStyle='none';
          panel.appendChild(clone);
        }
        function openMenu(){ document.body.classList.add('menu-open'); panel.classList.add('open'); }
        function closeMenu(){ document.body.classList.remove('menu-open'); panel.classList.remove('open'); }
        menuBtn.addEventListener('click', e=>{ e.preventDefault(); openMenu(); });
        overlay.addEventListener('click', closeMenu);
        document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeMenu(); });
        console.log('✅ Hamburger overlay initialized');
      })();
    </script>"""

def process_html_file(filepath):
  """Process a single HTML file (idempotent injections)."""
  try:
    with open(filepath, 'r', encoding='utf-8') as f:
      content = f.read()

    filepath_str = str(filepath).lower()
    # Skip test/robot specific sandbox files
    if any(x in filepath_str for x in ['robot-animation', 'robot-test']) or re.search(r'test[^/\\]*\.html', filepath_str):
      print(f"⏭️  Skipped (test/robot file): {filepath}")
      return False

    # If already has both meta markers, assume fully processed
    if 'bg-robot-initialized' in content and 'hamburger-overlay-initialized' in content:
      print(f"⏭️  Skipped (already fully processed): {filepath}")
      return False

    modified = False

    # 1. Inject CSS if not present
    if 'dark-theme-injected' not in content and '</head>' in content:
      content = content.replace('</head>', f'{DARK_THEME_CSS}\n  </head>', 1)
      modified = True

    # 2. Inject containers (particles + robot) right after <body...>
    body_match = re.search(r'<body[^>]*>', content)
    if body_match:
      body_tag = body_match.group(0)
      insertion = body_tag
      added_any = False
      if 'particles-container' not in content:
        insertion += PARTICLES_ONLY_HTML
        added_any = True
      if 'bg-robot-container' not in content:
        insertion += ROBOT_CONTAINER_HTML
        added_any = True
      if added_any:
        content = content.replace(body_tag, insertion, 1)
        modified = True

    # 3. Ensure external libs (Three.js + robot) are present before </body>
    if '</body>' in content:
      libs_needed = False
      if 'three.min.js' not in content:
        content = content.replace('</body>', '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n</body>', 1)
        libs_needed = True
      if 'robot-interviewer.js' not in content:
        content = content.replace('</body>', '<script src="assets/js/robot-interviewer.js"></script>\n</body>', 1)
        libs_needed = True
      if libs_needed:
        modified = True

    # 4. Inject particle generation script if not already (search for key marker)
    if 'Particle Generation Script' not in content and '</body>' in content:
      content = content.replace('</body>', f'{PARTICLES_JS}\n  </body>', 1)
      modified = True

    # 5. Inject robot + hamburger init if not present
    if 'Global background robot initialized' not in content and 'bg-robot-initialized' not in content and '</body>' in content:
      content = content.replace('</body>', f'{ROBOT_INIT_JS}\n  </body>', 1)
      modified = True

    if modified:
      with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
      print(f"✅ Updated: {filepath}")
      return True
    else:
      print(f"⚠️  No changes made: {filepath}")
      return False

  except Exception as e:
    print(f"❌ Error processing {filepath}: {e}")
    return False

def main():
  """Discover and process all relevant HTML files in the workspace."""
  root_dir = Path(r"C:\Users\omran\smartmock")

  html_files = []

  # Collect root-level HTML files
  html_files.extend(root_dir.glob("*.html"))

  # Interview departments
  for dept in ['cs', 'ee', 'me', 'ce', 'ec']:
    dept_dir = root_dir / 'interview' / dept
    if dept_dir.exists():
      html_files.extend(dept_dir.glob("*.html"))

  # Recruiter section
  recruiter_dir = root_dir / 'recruiter'
  if recruiter_dir.exists():
    html_files.extend(recruiter_dir.glob("*.html"))

  # docs or archived could contain html - optional (skip huge docs unless needed)
  # Extend logic here if future directories require them.

  print(f"\n🚀 Found {len(html_files)} HTML files to process\n")
  print("=" * 60)

  updated_count = 0
  skipped_count = 0

  for filepath in html_files:
    result = process_html_file(filepath)
    if result:
      updated_count += 1
    else:
      skipped_count += 1

  print("=" * 60)
  print("\n✨ COMPLETE!")
  print(f"✅ Updated: {updated_count} files")
  print(f"⏭️  Skipped: {skipped_count} files")
  print("\n🎨 Dark theme, particles, background robot & overlay menu applied!")
  print("🤖 Global robot & menu layers added idempotently.")

if __name__ == "__main__":
  main()
