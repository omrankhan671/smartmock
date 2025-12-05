"""
Fix Menu Position and Z-Index Issues
- Ensures dropdown menus open on the left side
- Fixes z-index layering so robot background doesn't block clicks
- Ensures department navigation is properly layered
"""

import os
import re

def fix_html_file(filepath):
    """Fix menu dropdown position and z-index issues in an HTML file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        changes_made = []
        
        # Fix 1: Ensure robot background is behind everything (z-index: -1)
        # Find #bg-robot-container z-index and change it to -1
        robot_container_pattern = r'(#bg-robot-container\s*\{\s*[^}]*?)z-index:\s*\d+;'
        if re.search(robot_container_pattern, content):
            content = re.sub(
                robot_container_pattern,
                r'\1z-index: -1;',
                content
            )
            changes_made.append("Fixed robot background z-index to -1")
        
        # Fix 2: Ensure dropdown menu has left: 0, not right: 0
        # Look for dropdown styles and ensure proper positioning
        dropdown_pattern = r'(\.dropdown\s*\{[^}]*?)(right:\s*0;|right:\s*auto;)'
        if re.search(dropdown_pattern, content):
            content = re.sub(
                dropdown_pattern,
                r'\1left: 0;',
                content
            )
            changes_made.append("Fixed dropdown menu position to left")
        
        # Fix 3: Add specific dropdown left positioning if not present
        # Find .menu-left .dropdown and ensure it has left: 0
        if '.menu-left .dropdown' in content or '.dropdown' in content:
            # Check if dropdown positioning exists
            if 'left: 0' not in content or 'left:0' not in content:
                # Find the dropdown style block and add left: 0
                dropdown_block_pattern = r'(\.dropdown\s*\{[^}]*?)(position:\s*absolute;)'
                if re.search(dropdown_block_pattern, content):
                    content = re.sub(
                        dropdown_block_pattern,
                        r'\1\2\n        left: 0;',
                        content
                    )
                    changes_made.append("Added left: 0 to dropdown")
        
        # Fix 4: Ensure particles container has proper z-index
        particles_pattern = r'(\.particles-container\s*\{[^}]*?)z-index:\s*\d+;'
        if re.search(particles_pattern, content):
            content = re.sub(
                particles_pattern,
                r'\1z-index: 0;',
                content
            )
            changes_made.append("Fixed particles container z-index to 0")
        
        # Fix 5: Ensure site-header has high z-index
        header_pattern = r'(\.site-header\s*\{[^}]*?)z-index:\s*\d+\s*!important;'
        if re.search(header_pattern, content):
            # Already has z-index, make sure it's 2000
            content = re.sub(
                header_pattern,
                r'\1z-index: 2000 !important;',
                content
            )
            changes_made.append("Ensured site-header z-index is 2000")
        
        # Fix 6: Ensure dept-navigation has proper z-index (1500)
        dept_nav_pattern = r'(\.dept-navigation\s*\{[^}]*?)z-index:\s*\d+;'
        if re.search(dept_nav_pattern, content):
            content = re.sub(
                dept_nav_pattern,
                r'\1z-index: 1500;',
                content
            )
            changes_made.append("Fixed dept-navigation z-index to 1500")
        
        # Fix 7: Ensure main content has proper z-index (10)
        main_content_pattern = r'(header,\s*main,\s*section,.*?\{[^}]*?)z-index:\s*\d+;'
        if re.search(main_content_pattern, content):
            content = re.sub(
                main_content_pattern,
                r'\1z-index: 10;',
                content
            )
            changes_made.append("Fixed main content z-index to 10")
        
        # Only write if changes were made
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, changes_made
        else:
            return False, []
            
    except Exception as e:
        print(f"❌ Error processing {filepath}: {str(e)}")
        return False, []

def main():
    """Fix menu and z-index issues in all HTML files"""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Files to check
    files_to_fix = []
    
    # Root HTML files
    root_files = [
        'home.html', 'index.html', 'dashboard.html', 'interview.html',
        'about.html', 'contact.html', 'community.html', 'profile.html',
        'report.html', 'leaderboard.html', 'certificate.html',
        'verify-certificate.html', 'loading.html'
    ]
    
    for filename in root_files:
        filepath = os.path.join(base_dir, filename)
        if os.path.exists(filepath):
            files_to_fix.append(filepath)
    
    # Interview department files
    departments = ['cs', 'ee', 'me', 'ce', 'ec']
    dept_files = ['courses.html', 'interview.html', 'preparation.html', 'report.html', 'ai-interview.html']
    
    for dept in departments:
        for filename in dept_files:
            filepath = os.path.join(base_dir, 'interview', dept, filename)
            if os.path.exists(filepath):
                files_to_fix.append(filepath)
    
    # Recruiter portal files
    recruiter_files = [
        'dashboard.html', 'candidates.html', 'interview-room.html',
        'leaderboard.html', 'login.html', 'register.html',
        'reports.html', 'schedule.html', 'settings.html'
    ]
    
    for filename in recruiter_files:
        filepath = os.path.join(base_dir, 'recruiter', filename)
        if os.path.exists(filepath):
            files_to_fix.append(filepath)
    
    # Process all files
    updated_count = 0
    skipped_count = 0
    
    print("🔧 Fixing Menu and Z-Index Issues...")
    print("=" * 60)
    
    for filepath in files_to_fix:
        updated, changes = fix_html_file(filepath)
        if updated:
            updated_count += 1
            rel_path = os.path.relpath(filepath, base_dir)
            print(f"✅ {rel_path}")
            for change in changes:
                print(f"   - {change}")
        else:
            skipped_count += 1
    
    print("=" * 60)
    print(f"✅ Updated: {updated_count} files")
    print(f"⏭️  Skipped: {skipped_count} files")
    print("\n🎯 FIXES APPLIED:")
    print("   - Robot background z-index: -1 (behind everything)")
    print("   - Particles container z-index: 0")
    print("   - Main content z-index: 10")
    print("   - Department navigation z-index: 1500")
    print("   - Site header z-index: 2000")
    print("   - Dropdown menu positioned on left side")
    print("\n✨ All elements should now be clickable!")

if __name__ == '__main__':
    main()
