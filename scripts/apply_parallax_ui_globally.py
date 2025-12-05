"""
Apply Parallax UI and 3D Robot Background to All HTML Files
Reorganize Interview Modules with Department Navigation
"""

import os
import re
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent.parent

# Parallax CSS to inject
PARALLAX_CSS = """
    <style>
      /* Dark Black Theme with Purple Particles & Parallax */
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
        background: radial-gradient(
          circle at var(--gradient-x, 50%) var(--gradient-y, 50%), 
          rgba(168, 85, 247, 0.05) 0%, 
          transparent 70%
        );
        pointer-events: none;
        z-index: 0;
        will-change: transform;
        transition: background 0.3s ease;
      }
      
      .particles-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
        will-change: transform;
        transform-style: preserve-3d;
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
      
      header, main, section, .card, .hero-card, .auth-card, .report-card, .interview-container {
        position: relative;
        z-index: 10;
        will-change: transform;
        transform-style: preserve-3d;
      }
      
      .site-header {
        background: rgba(10, 10, 10, 0.8) !important;
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(168, 85, 247, 0.2);
        z-index: 2000 !important;
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
    </style>"""

# Robot background HTML
ROBOT_BACKGROUND_HTML = """
    <!-- Floating Particles -->
    <div class="particles-container" id="particlesContainer"></div>
    <!-- Fullscreen Background Robot with Parallax Depth -->
    <style>
      #bg-robot-container { 
        position: fixed; 
        inset: 0; 
        z-index: 1; 
        pointer-events: none;
        will-change: transform;
        transform-style: preserve-3d;
        perspective: 2000px;
      }
      #bg-robot-container canvas { 
        width: 100%; 
        height: 100%; 
        display: block; 
      }
      
      /* Full-screen 3D rotation animation */
      @keyframes rotate3D {
        0% { transform: perspective(2000px) rotateX(0deg) rotateY(0deg); }
        25% { transform: perspective(2000px) rotateX(3deg) rotateY(90deg); }
        50% { transform: perspective(2000px) rotateX(0deg) rotateY(180deg); }
        75% { transform: perspective(2000px) rotateX(-3deg) rotateY(270deg); }
        100% { transform: perspective(2000px) rotateX(0deg) rotateY(360deg); }
      }
      
      #bg-robot-container {
        animation: rotate3D 60s linear infinite;
      }
    </style>
    <div id="bg-robot-container">
      <canvas id="bg-robot-canvas"></canvas>
    </div>"""

# Parallax JavaScript
PARALLAX_JS = """
    <!-- Particle Generation Script -->
    <script>
      // Create 120 floating purple particles
      if (document.getElementById('particlesContainer')) {
        const particlesContainer = document.getElementById('particlesContainer');
        const particleCount = 120;

        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          particle.classList.add('particle');
          
          const size = 2 + Math.random() * 4;
          particle.style.width = `${size}px`;
          particle.style.height = `${size}px`;
          
          const leftPos = Math.random() * 100;
          particle.style.left = `${leftPos}%`;
          
          const duration = 12 + Math.random() * 13;
          particle.style.animationDuration = `${duration}s`;
          
          const delay = Math.random() * 10;
          particle.style.animationDelay = `${delay}s`;
          
          const drift = (Math.random() - 0.5) * 150;
          particle.style.setProperty('--drift', `${drift}px`);
          
          particlesContainer.appendChild(particle);
        }
      }
    </script>
    
    <!-- Three.js + Robot Interviewer -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="assets/js/robot-interviewer.js"></script>
    <script>
      // Initialize Background Robot
      (function initBgRobot(){
        if (typeof THREE === 'undefined' || typeof window.RobotInterviewer === 'undefined') {
          return setTimeout(initBgRobot, 100);
        }
        try {
          window.bgRobot = new window.RobotInterviewer('bg-robot-container', THREE, {
            canvasId: 'bg-robot-canvas',
            trackCursor: true
          });
          window.bgRobot.setState('neutral');
          console.log('✅ Background robot initialized');
        } catch (e) {
          console.error('❌ Failed to init background robot:', e);
        }
      })();
      
      // Advanced Parallax and Depth Effect
      let targetX = 0, targetY = 0;
      let currentX = 0, currentY = 0;
      
      document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        targetX = (x - 0.5);
        targetY = (y - 0.5);
      });
      
      function animateParallax() {
        currentX += (targetX - currentX) * 0.1;
        currentY += (targetY - currentY) * 0.1;
        
        const container = document.getElementById('bg-robot-container');
        if (container) {
          const moveX1 = currentX * 80;
          const moveY1 = currentY * 80;
          const rotateY1 = currentX * 20;
          const rotateX1 = -currentY * 20;
          const scale1 = 1 + (Math.abs(currentX) + Math.abs(currentY)) * 0.05;
          
          container.style.transform = `
            perspective(2000px) 
            translateX(${moveX1}px) 
            translateY(${moveY1}px) 
            translateZ(-100px)
            rotateX(${rotateX1}deg) 
            rotateY(${rotateY1}deg)
            scale(${scale1})
          `;
        }
        
        const particles = document.getElementById('particlesContainer');
        if (particles) {
          const moveX2 = currentX * 40;
          const moveY2 = currentY * 40;
          particles.style.transform = `
            translateX(${moveX2}px) 
            translateY(${moveY2}px)
            translateZ(50px)
          `;
        }
        
        const bodyBefore = document.body;
        if (bodyBefore) {
          const gradientX = 50 + currentX * 10;
          const gradientY = 50 + currentY * 10;
          bodyBefore.style.setProperty('--gradient-x', `${gradientX}%`);
          bodyBefore.style.setProperty('--gradient-y', `${gradientY}%`);
        }
        
        const main = document.querySelector('main');
        if (main) {
          const moveX4 = -currentX * 15;
          const moveY4 = -currentY * 15;
          main.style.transform = `
            translateX(${moveX4}px) 
            translateY(${moveY4}px)
            translateZ(100px)
          `;
        }
        
        requestAnimationFrame(animateParallax);
      }
      
      animateParallax();
    </script>"""

def process_html_file(file_path):
    """Add parallax UI to HTML file if not already present"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if already has parallax
        if 'animateParallax' in content:
            print(f"  ⏭️  Skipped (already has parallax): {file_path.name}")
            return False
        
        # Add CSS in head if not present
        if PARALLAX_CSS.strip() not in content:
            content = content.replace('</head>', f'{PARALLAX_CSS}\n  </head>')
        
        # Add robot background after <body> tag
        if 'bg-robot-container' not in content:
            content = content.replace('<body>', f'<body>\n{ROBOT_BACKGROUND_HTML}')
        
        # Add parallax JS before </body>
        if 'animateParallax' not in content:
            content = content.replace('</body>', f'{PARALLAX_JS}\n  </body>')
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"  ✅ Updated: {file_path.name}")
        return True
    except Exception as e:
        print(f"  ❌ Error processing {file_path.name}: {e}")
        return False

def main():
    print("\n" + "="*70)
    print("  🎨 APPLYING PARALLAX UI GLOBALLY")
    print("="*70 + "\n")
    
    updated_count = 0
    skipped_count = 0
    
    # Process root HTML files
    print("📁 Processing Root HTML Files:")
    for html_file in BASE_DIR.glob('*.html'):
        if html_file.name not in ['home-champion.html']:  # Skip special files
            if process_html_file(html_file):
                updated_count += 1
            else:
                skipped_count += 1
    
    # Process interview department folders
    print("\n📁 Processing Interview Departments:")
    for dept in ['cs', 'ee', 'me', 'ce', 'ec']:
        dept_path = BASE_DIR / 'interview' / dept
        if dept_path.exists():
            print(f"\n  📂 {dept.upper()} Department:")
            for html_file in dept_path.glob('*.html'):
                if process_html_file(html_file):
                    updated_count += 1
                else:
                    skipped_count += 1
    
    # Process recruiter pages
    print("\n📁 Processing Recruiter Portal:")
    recruiter_path = BASE_DIR / 'recruiter'
    if recruiter_path.exists():
        for html_file in recruiter_path.glob('*.html'):
            if process_html_file(html_file):
                updated_count += 1
            else:
                skipped_count += 1
    
    print("\n" + "="*70)
    print(f"  ✅ Updated: {updated_count} files")
    print(f"  ⏭️  Skipped: {skipped_count} files")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
