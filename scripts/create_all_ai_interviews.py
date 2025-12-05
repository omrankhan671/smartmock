"""
Script to create AI interview pages for all departments (ME, CE, EC)
"""

# Department configurations
departments = {
    'me': {
        'name': 'Mechanical Engineering',
        'short': 'ME',
        'topics': [
            ('thermodynamics', 'Thermodynamics'),
            ('fluid_mechanics', 'Fluid Mechanics'),
            ('materials', 'Materials')
        ]
    },
    'ce': {
        'name': 'Civil Engineering',
        'short': 'CE',
        'topics': [
            ('structures', 'Structures'),
            ('hydraulics', 'Hydraulics'),
            ('geotechnical', 'Geotechnical')
        ]
    },
    'ec': {
        'name': 'Electronics & Communication',
        'short': 'EC',
        'topics': [
            ('communications', 'Communications'),
            ('microcontrollers', 'Microcontrollers'),
            ('signals', 'Signals')
        ]
    }
}

def create_ai_interview(dept_code, config):
    # Read CS template
    with open('interview/cs/ai-interview.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    dept_upper = config['short']
    dept_name = config['name']
    
    # Replace title
    content = content.replace(
        '<title>SmartMock – AI Interview</title>',
        f'<title>SmartMock – {dept_upper} AI Interview</title>'
    )
    
    # Replace heading
    content = content.replace(
        '<h2>AI Interview</h2>',
        f'<h2>{dept_name} – AI Interview</h2>'
    )
    
    # Replace department code (all variations)
    content = content.replace("department: 'cs'", f"department: '{dept_upper}'")
    content = content.replace("department: 'CS'", f"department: '{dept_upper}'")
    content = content.replace('department: "cs"', f'department: "{dept_upper}"')
    content = content.replace('department: "CS"', f'department: "{dept_upper}"')
    
    # Build topic select options
    old_topics = '''<select id="topic-select">
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="dsa">Data Structures & Algorithms</option>
            </select>'''
    
    topic_options = '\n'.join([
        f'              <option value="{topic[0]}">{topic[1]}</option>'
        for topic in config['topics']
    ])
    
    new_topics = f'''<select id="topic-select">
{topic_options}
            </select>'''
    
    content = content.replace(old_topics, new_topics)
    
    # Update navigation to add AI Interview link for this department
    old_nav = f'''<li class="has-submenu"><a href="../{dept_code}/courses.html">{dept_name if dept_code != 'ec' else 'Electronic Communication'}</a>
                  <ul class="submenu">
                    <li><a href="../{dept_code}/courses.html">Courses</a></li>
                    <li><a href="../{dept_code}/interview.html">Interview</a></li>
                    <li><a href="../{dept_code}/preparation.html">Interview Preparation</a></li>
                    <li><a href="../{dept_code}/report.html">Report</a></li>
                  </ul>
                </li>'''
    
    new_nav = f'''<li class="has-submenu"><a href="../{dept_code}/courses.html">{dept_name if dept_code != 'ec' else 'Electronic Communication'}</a>
                  <ul class="submenu">
                    <li><a href="../{dept_code}/courses.html">Courses</a></li>
                    <li><a href="../{dept_code}/interview.html">Interview</a></li>
                    <li><a href="../{dept_code}/preparation.html">Interview Preparation</a></li>
                    <li><a href="../{dept_code}/report.html">Report</a></li>
                    <li><a href="./ai-interview.html">AI Interview</a></li>
                  </ul>
                </li>'''
    
    content = content.replace(old_nav, new_nav)
    
    # Update report redirect link
    content = content.replace(
        "window.location.href = 'report.html';",
        "window.location.href = './ai-report.html';"
    )
    
    # Replace topic keys in questions object
    content = content.replace('javascript: {', f'{config["topics"][0][0]}: {{')
    content = content.replace('python: {', f'{config["topics"][1][0]}: {{')
    content = content.replace('dsa: {', f'{config["topics"][2][0]}: {{')
    
    # Write to department file
    output_path = f'interview/{dept_code}/ai-interview.html'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'✅ Created {output_path}')
    print(f'   - Title: {dept_upper} AI Interview')
    print(f'   - Topics: {", ".join([t[1] for t in config["topics"]])}')
    print(f'   - Navigation updated with AI Interview link')
    print()

# Create all department AI interviews
print('🚀 Creating AI interview pages for all departments...\n')

for dept_code, config in departments.items():
    create_ai_interview(dept_code, config)

print('✅ All AI interview pages created successfully!')
print('\nSummary:')
print('- ME: Thermodynamics, Fluid Mechanics, Materials')
print('- CE: Structures, Hydraulics, Geotechnical')
print('- EC: Communications, Microcontrollers, Signals')
