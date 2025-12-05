#!/usr/bin/env python3
"""
Fix AI Interview Navigation Links
Adds missing AI Interview links to CS and EE department navigation menus across all files.
"""

import os
import re
from pathlib import Path

def fix_navigation_in_file(file_path):
    """Fix navigation menu in a single file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        changes_made = False
        
        # Pattern for CS submenu WITHOUT AI Interview link
        cs_pattern = r'(<li class="has-submenu"><a href="\.\./cs/courses\.html">Computer Science</a>\s*<ul class="submenu">\s*<li><a href="\.\./cs/courses\.html">Courses</a></li>\s*<li><a href="\.\./cs/interview\.html">Interview</a></li>\s*<li><a href="\.\./cs/preparation\.html">Interview Preparation</a></li>\s*<li><a href="\.\./cs/report\.html">Report</a></li>\s*</ul>)'
        
        # Replacement with AI Interview link
        cs_replacement = r'''<li class="has-submenu"><a href="../cs/courses.html">Computer Science</a>
                  <ul class="submenu">
                    <li><a href="../cs/courses.html">Courses</a></li>
                    <li><a href="../cs/interview.html">Interview</a></li>
                    <li><a href="../cs/preparation.html">Interview Preparation</a></li>
                    <li><a href="../cs/report.html">Report</a></li>
                    <li><a href="../cs/ai-interview.html">AI Interview</a></li>
                  </ul>'''
        
        if re.search(cs_pattern, content, re.MULTILINE):
            content = re.sub(cs_pattern, cs_replacement, content, flags=re.MULTILINE)
            changes_made = True
            print(f"  ✅ Fixed CS navigation in {file_path.name}")
        
        # Pattern for EE submenu WITHOUT AI Interview link
        ee_pattern = r'(<li class="has-submenu"><a href="\.\./ee/courses\.html">Electrical</a>\s*<ul class="submenu">\s*<li><a href="\.\./ee/courses\.html">Courses</a></li>\s*<li><a href="\.\./ee/interview\.html">Interview</a></li>\s*<li><a href="\.\./ee/preparation\.html">Interview Preparation</a></li>\s*<li><a href="\.\./ee/report\.html">Report</a></li>\s*</ul>)'
        
        # Replacement with AI Interview link
        ee_replacement = r'''<li class="has-submenu"><a href="../ee/courses.html">Electrical</a>
                  <ul class="submenu">
                    <li><a href="../ee/courses.html">Courses</a></li>
                    <li><a href="../ee/interview.html">Interview</a></li>
                    <li><a href="../ee/preparation.html">Interview Preparation</a></li>
                    <li><a href="../ee/report.html">Report</a></li>
                    <li><a href="../ee/ai-interview.html">AI Interview</a></li>
                  </ul>'''
        
        if re.search(ee_pattern, content, re.MULTILINE):
            content = re.sub(ee_pattern, ee_replacement, content, flags=re.MULTILINE)
            changes_made = True
            print(f"  ✅ Fixed EE navigation in {file_path.name}")
        
        # Write back if changes were made
        if changes_made:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
        
    except Exception as e:
        print(f"  ❌ Error processing {file_path}: {e}")
        return False

def main():
    """Main function to fix all HTML files in interview directories."""
    print("🔧 Fixing AI Interview Navigation Links...\n")
    
    # Get project root
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    interview_dir = project_root / 'interview'
    
    if not interview_dir.exists():
        print(f"❌ Interview directory not found: {interview_dir}")
        return
    
    # Departments to process
    departments = ['cs', 'ee', 'me', 'ce', 'ec']
    total_files = 0
    fixed_files = 0
    
    for dept in departments:
        dept_path = interview_dir / dept
        if not dept_path.exists():
            print(f"⚠️ Department not found: {dept}")
            continue
        
        print(f"📁 Processing {dept.upper()}...")
        
        # Process all HTML files in department
        html_files = list(dept_path.glob('*.html'))
        for html_file in html_files:
            total_files += 1
            if fix_navigation_in_file(html_file):
                fixed_files += 1
        
        print()
    
    print("=" * 50)
    print(f"✅ Complete!")
    print(f"   Total files processed: {total_files}")
    print(f"   Files updated: {fixed_files}")
    print("=" * 50)

if __name__ == '__main__':
    main()
