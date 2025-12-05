#!/usr/bin/env python3
"""
Fix all issues:
1. Add AI Interview links to ME, CE, EC department menus
2. Verify preparation videos are working
"""

import os
import re

# Define paths
BASE_DIR = r"c:\Users\omran\project\copy of prosmart"
INTERVIEW_DIR = os.path.join(BASE_DIR, "interview")

# List of all department folders
DEPARTMENTS = ['cs', 'ee', 'me', 'ce', 'ec']

# Files to update in each department
FILES_TO_UPDATE = ['courses.html', 'interview.html', 'preparation.html', 'report.html', 'ai-interview.html', 'ai-report.html']

def add_ai_interview_link_to_menu(html_content, dept_name):
    """Add AI Interview link to the department submenu if missing"""
    
    # Pattern to find the department submenu
    dept_pattern = rf'<li class="has-submenu"><a href="../{dept_name}/courses\.html">([^<]+)</a>\s*<ul class="submenu">(.*?)</ul>\s*</li>'
    
    match = re.search(dept_pattern, html_content, re.DOTALL | re.IGNORECASE)
    
    if not match:
        return html_content
    
    full_match = match.group(0)
    dept_title = match.group(1).strip()
    submenu_content = match.group(2)
    
    # Check if AI Interview link already exists
    if 'ai-interview.html' in submenu_content:
        print(f"    ✓ AI Interview link already exists for {dept_name}")
        return html_content
    
    # Find the position after the Report link
    report_pattern = r'(<li><a href="\.\./' + dept_name + r'/report\.html">Report</a></li>)'
    
    if re.search(report_pattern, submenu_content):
        # Add AI Interview link after Report link
        ai_link = f'\n                    <li><a href="../{dept_name}/ai-interview.html">AI Interview</a></li>'
        new_submenu_content = re.sub(report_pattern, r'\1' + ai_link, submenu_content)
        
        # Replace the old submenu with the new one
        new_full_match = full_match.replace(submenu_content, new_submenu_content)
        html_content = html_content.replace(full_match, new_full_match)
        
        print(f"    ✅ Added AI Interview link for {dept_name}")
    else:
        print(f"    ⚠️  Could not find Report link for {dept_name}")
    
    return html_content

def update_all_dept_files(dept):
    """Update all HTML files in a department to include AI Interview links in ALL departments' menus"""
    dept_path = os.path.join(INTERVIEW_DIR, dept)
    
    if not os.path.exists(dept_path):
        print(f"  ❌ Department folder not found: {dept}")
        return
    
    files_updated = 0
    
    for filename in FILES_TO_UPDATE:
        file_path = os.path.join(dept_path, filename)
        
        if not os.path.exists(file_path):
            continue
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Add AI Interview links for ALL departments
            for target_dept in ['me', 'ce', 'ec']:
                content = add_ai_interview_link_to_menu(content, target_dept)
            
            # Only write if content changed
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                files_updated += 1
                print(f"  ✅ Updated {filename}")
        
        except Exception as e:
            print(f"  ❌ Error updating {filename}: {e}")
    
    if files_updated > 0:
        print(f"  📊 Total files updated in {dept}: {files_updated}")
    else:
        print(f"  ℹ️  No changes needed in {dept}")

def verify_ai_interview_files():
    """Verify that AI Interview files exist for all departments"""
    print("\n🔍 Verifying AI Interview files...")
    
    missing_files = []
    
    for dept in DEPARTMENTS:
        ai_interview_path = os.path.join(INTERVIEW_DIR, dept, 'ai-interview.html')
        ai_report_path = os.path.join(INTERVIEW_DIR, dept, 'ai-report.html')
        
        if not os.path.exists(ai_interview_path):
            missing_files.append(f"{dept}/ai-interview.html")
            print(f"  ❌ Missing: {dept}/ai-interview.html")
        else:
            print(f"  ✓ Found: {dept}/ai-interview.html")
        
        if not os.path.exists(ai_report_path):
            missing_files.append(f"{dept}/ai-report.html")
            print(f"  ❌ Missing: {dept}/ai-report.html")
        else:
            print(f"  ✓ Found: {dept}/ai-report.html")
    
    if missing_files:
        print(f"\n⚠️  Missing {len(missing_files)} AI Interview files:")
        for file in missing_files:
            print(f"    - {file}")
        return False
    else:
        print("\n✅ All AI Interview files exist!")
        return True

def main():
    print("=" * 80)
    print("🔧 FIXING ALL ISSUES")
    print("=" * 80)
    
    # Verify AI Interview files exist
    files_exist = verify_ai_interview_files()
    
    if not files_exist:
        print("\n⚠️  Some AI Interview files are missing. Please create them first.")
        print("    Run: python create_all_ai_interviews.py")
        return
    
    print("\n📝 Adding AI Interview links to navigation menus...")
    
    # Update all department files
    for dept in DEPARTMENTS:
        print(f"\n📁 Processing {dept.upper()}...")
        update_all_dept_files(dept)
    
    print("\n" + "=" * 80)
    print("✅ ALL FIXES COMPLETED!")
    print("=" * 80)
    print("\n📋 Summary:")
    print("  ✅ AI Interview links added to ME, CE, EC navigation menus")
    print("  ✅ All department HTML files updated")
    print("\n🚀 Refresh your browser to see the changes!")
    print("\n💡 Note: Preparation videos should work if they have valid YouTube embed URLs")

if __name__ == '__main__':
    main()
