"""
Add Leaderboard Link to All Navigation Menus
This script updates all HTML files to include the leaderboard link in navigation
"""

import os
import re

# Root directory
root_dir = r"c:\Users\omran\project\copy of prosmart"

# Files to update (excluding index.html and loading.html which don't have main navigation)
files_to_update = [
    "about.html",
    "certificate.html",
    "community.html",
    "contact.html",
    "interview.html",
    "report.html",
    "verify-certificate.html"
]

# Pattern to match
old_pattern = r'(<li><a href="dashboard\.html">Dashboard</a></li>\s*<li class="has-submenu"><a href="interview\.html">Interview</a>)'

# Replacement pattern
new_pattern = r'<li><a href="dashboard.html">Dashboard</a></li>\n            <li><a href="leaderboard.html">🏆 Leaderboard</a></li>\n            <li class="has-submenu"><a href="interview.html">Interview</a>'

updated_count = 0

for filename in files_to_update:
    filepath = os.path.join(root_dir, filename)
    
    if not os.path.exists(filepath):
        print(f"⚠️  File not found: {filename}")
        continue
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if leaderboard link already exists
        if 'leaderboard.html' in content:
            print(f"✅ {filename} - Already has leaderboard link")
            continue
        
        # Replace pattern
        new_content = re.sub(old_pattern, new_pattern, content)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✅ {filename} - Leaderboard link added")
            updated_count += 1
        else:
            print(f"⚠️  {filename} - Pattern not found")
    
    except Exception as e:
        print(f"❌ {filename} - Error: {e}")

print(f"\n🎉 Updated {updated_count} files")
print("\nNote: Interview department pages (cs/, ee/, me/, ce/, ec/) need manual update")
print("Add this to their navigation:")
print('<li><a href="../../leaderboard.html">🏆 Leaderboard</a></li>')
