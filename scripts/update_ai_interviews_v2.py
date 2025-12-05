"""
Update all AI interview pages with v2.0 modules
"""

import os
import re

# Departments
departments = ['cs', 'ee', 'me', 'ce', 'ec']

# Script to insert
v2_scripts = """
    <!-- SmartMock v2.0 Advanced Features -->
    <script src="../../assets/js/advanced-features.js"></script>
    <script src="../../assets/js/adaptive-interview.js"></script>
    <script src="../../assets/js/visualizations.js"></script>
    <script src="../../assets/js/integrity-monitor.js"></script>
    <script src="../../assets/js/ai-tutor.js"></script>
    <script src="../../assets/js/i18n-accessibility.js"></script>
    
"""

# Initialization script template
init_script_template = """
      // Initialize v2.0 features
      if (typeof SmartMockI18n !== 'undefined') SmartMockI18n.init();
      if (typeof SmartMockA11y !== 'undefined') SmartMockA11y.init();
      if (typeof IntegrityMonitor !== 'undefined') IntegrityMonitor.init({{ strict: true }});
      if (typeof AITutor !== 'undefined') AITutor.init('{dept}');
      
"""

def update_ai_interview_page(dept):
    file_path = f'interview/{dept}/ai-interview.html'
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if already updated
        if 'SmartMock v2.0 Advanced Features' in content:
            print(f"✅ {dept} already updated")
            return True
        
        # Insert v2.0 scripts after main.js
        pattern = r'(<script src="../../assets/js/main\.js"></script>)'
        replacement = r'\1\n' + v2_scripts
        content = re.sub(pattern, replacement, content, count=1)
        
        # Insert initialization code at the start of the main script
        # Find the opening <script> tag after MediaPipe
        pattern = r'(<script src="https://cdn\.jsdelivr\.net/npm/@mediapipe/face_mesh[^>]+></script>\s*<script>)'
        init_script = init_script_template.format(dept=dept)
        replacement = r'\1\n' + init_script
        content = re.sub(pattern, replacement, content, count=1)
        
        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Updated {dept}/ai-interview.html")
        return True
        
    except Exception as e:
        print(f"❌ Error updating {dept}: {str(e)}")
        return False

def main():
    print("🚀 Updating AI interview pages with v2.0 modules...\n")
    
    updated = 0
    for dept in departments:
        if update_ai_interview_page(dept):
            updated += 1
    
    print(f"\n✅ Updated {updated}/{len(departments)} AI interview pages")

if __name__ == '__main__':
    main()
