import re

# Read CS template
with open('interview/cs/ai-interview.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace title
content = content.replace('<title>SmartMock – AI Interview</title>', '<title>SmartMock – EE AI Interview</title>')

# Replace heading
content = content.replace('<h2>AI Interview</h2>', '<h2>Electrical Engineering – AI Interview</h2>')

# Replace department code (both single and double quotes)
content = content.replace("department: 'cs'", "department: 'EE'")
content = content.replace("department: 'CS'", "department: 'EE'")
content = content.replace('department: "cs"', 'department: "EE"')
content = content.replace('department: "CS"', 'department: "EE"')

# Replace topic select options
old_topics = '''<select id="topic-select">
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="dsa">Data Structures & Algorithms</option>
            </select>'''

new_topics = '''<select id="topic-select">
              <option value="circuits">Circuits</option>
              <option value="power_systems">Power Systems</option>
              <option value="machines">Machines</option>
            </select>'''

content = content.replace(old_topics, new_topics)

# Update report redirect link
content = content.replace("window.location.href = 'report.html';", "window.location.href = './ai-report.html';")

# Now update the question banks - find the questions object and replace with EE questions
# This is a large section so we'll do targeted replacements

# Replace topic keys in questions object
content = content.replace('javascript: {', 'circuits: {')
content = content.replace('python: {', 'power_systems: {')
content = content.replace('dsa: {', 'machines: {')

# Write to EE file
with open('interview/ee/ai-interview.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ Created interview/ee/ai-interview.html')
print('✅ Updated: title, heading, department code, topics, report link')
print('✅ Replaced question bank topics (circuits, power_systems, machines)')
