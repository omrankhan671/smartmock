"""Update EE ai-report.html with correct references"""

with open('interview/ee/ai-report.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace title
content = content.replace(
    '<title>SmartMock – AI Interview Report</title>',
    '<title>SmartMock – EE AI Interview Report</title>'
)

# Replace heading
content = content.replace(
    '<h2>AI Interview Report</h2>',
    '<h2>Electrical Engineering – AI Interview Report</h2>'
)

# Replace department references
content = content.replace("department: 'CS'", "department: 'EE'")
content = content.replace('department: "CS"', 'department: "EE"')

with open('interview/ee/ai-report.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ Updated interview/ee/ai-report.html')
