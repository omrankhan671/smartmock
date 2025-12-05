"""
Add Department Navigation Bar and Separate AI Tutor to Interview Course Pages
"""

import os
import re
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent

# Department Navigation HTML
DEPT_NAV_HTML = '''
    <!-- Department Navigation -->
    <div class="dept-navigation">
      <div class="container">
        <div class="dept-nav-title">Interview Departments:</div>
        <div class="dept-nav-links">
          <a href="../cs/courses.html" class="dept-nav-link cs" data-dept="cs">
            <span class="dept-icon">💻</span>
            <span class="dept-name">Computer Science</span>
          </a>
          <a href="../ee/courses.html" class="dept-nav-link ee" data-dept="ee">
            <span class="dept-icon">⚡</span>
            <span class="dept-name">Electrical Eng.</span>
          </a>
          <a href="../me/courses.html" class="dept-nav-link me" data-dept="me">
            <span class="dept-icon">⚙️</span>
            <span class="dept-name">Mechanical Eng.</span>
          </a>
          <a href="../ce/courses.html" class="dept-nav-link ce" data-dept="ce">
            <span class="dept-icon">🏗️</span>
            <span class="dept-name">Civil Eng.</span>
          </a>
          <a href="../ec/courses.html" class="dept-nav-link ec" data-dept="ec">
            <span class="dept-icon">📡</span>
            <span class="dept-name">Electronics & Comm.</span>
          </a>
        </div>
      </div>
    </div>'''

# Department Navigation CSS
DEPT_NAV_CSS = '''
      /* Department Navigation */
      .dept-navigation {
        background: rgba(10, 10, 10, 0.9);
        backdrop-filter: blur(20px);
        border-bottom: 2px solid rgba(168, 85, 247, 0.3);
        padding: 15px 0;
        position: sticky;
        top: 0;
        z-index: 1500;
        margin-bottom: 30px;
      }
      
      .dept-nav-title {
        color: #a855f7;
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 10px;
      }
      
      .dept-nav-links {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      
      .dept-nav-link {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 18px;
        background: rgba(168, 85, 247, 0.1);
        border: 2px solid rgba(168, 85, 247, 0.3);
        border-radius: 10px;
        color: #fff;
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
      }
      
      .dept-nav-link:hover {
        background: rgba(168, 85, 247, 0.3);
        border-color: rgba(168, 85, 247, 0.6);
        transform: translateY(-2px);
        box-shadow: 0 5px 20px rgba(168, 85, 247, 0.4);
      }
      
      .dept-nav-link.active {
        background: linear-gradient(135deg, #a855f7, #d946ef);
        border-color: #a855f7;
        box-shadow: 0 5px 20px rgba(168, 85, 247, 0.5);
      }
      
      .dept-icon {
        font-size: 20px;
      }
      
      .dept-name {
        font-weight: 600;
      }
      
      @media (max-width: 768px) {
        .dept-nav-links {
          flex-direction: column;
        }
        .dept-nav-link {
          width: 100%;
          justify-content: center;
        }
      }'''

# AI Tutor Section Template
AI_TUTOR_TEMPLATE = '''
    <!-- AI Tutor for {dept_name} -->
    <section class="hero-card ai-tutor-section" style="margin-top: 40px;">
      <h2 class="headline">🤖 AI Tutor - {dept_name}</h2>
      <p class="subhead">Your personal AI tutor specialized in {dept_field}. Get instant help, explanations, and resources.</p>
      
      <div class="tutor-container">
        <div class="tutor-main">
          <div id="tutor-chat-window-{dept}">
            <div class="tutor-message tutor">
              <strong>{tutor_icon} {tutor_name}:</strong> {greeting}
            </div>
          </div>
          <div class="tutor-input">
            <input type="text" id="tutor-question-{dept}" placeholder="Ask me anything about {dept_field}...">
            <button id="tutor-ask-btn-{dept}" class="btn primary">Ask</button>
          </div>
          <div class="tutor-actions">
            <button class="tutor-action-btn" data-action="hint" data-dept="{dept}">💡 Get Hint</button>
            <button class="tutor-action-btn" data-action="explain" data-dept="{dept}">📚 Explain Concept</button>
            <button class="tutor-action-btn" data-action="resources" data-dept="{dept}">🔗 Suggest Resources</button>
            <button class="tutor-action-btn" data-action="practice" data-dept="{dept}">✍️ Practice Problems</button>
          </div>
        </div>
      </div>
    </section>'''

# AI Tutor CSS
AI_TUTOR_CSS = '''
      /* AI Tutor Styles */
      .ai-tutor-section {
        background: rgba(18, 18, 18, 0.9) !important;
        border: 2px solid rgba(168, 85, 247, 0.4);
      }
      
      .tutor-container {
        margin-top: 20px;
      }
      
      .tutor-main {
        width: 100%;
      }
      
      #tutor-chat-window-cs,
      #tutor-chat-window-ee,
      #tutor-chat-window-me,
      #tutor-chat-window-ce,
      #tutor-chat-window-ec {
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(168, 85, 247, 0.3);
        border-radius: 12px;
        padding: 20px;
        min-height: 300px;
        max-height: 400px;
        overflow-y: auto;
        margin-bottom: 15px;
      }
      
      .tutor-message {
        margin-bottom: 15px;
        padding: 12px 16px;
        border-radius: 10px;
        line-height: 1.6;
      }
      
      .tutor-message.tutor {
        background: rgba(168, 85, 247, 0.2);
        border-left: 4px solid #a855f7;
      }
      
      .tutor-message.user {
        background: rgba(100, 100, 100, 0.2);
        border-left: 4px solid #4CAF50;
        margin-left: 40px;
      }
      
      .tutor-input {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
      }
      
      .tutor-input input {
        flex: 1;
        padding: 12px 16px;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(168, 85, 247, 0.3);
        border-radius: 10px;
        color: #fff;
        font-size: 15px;
      }
      
      .tutor-input input:focus {
        outline: none;
        border-color: #a855f7;
        box-shadow: 0 0 15px rgba(168, 85, 247, 0.3);
      }
      
      .tutor-actions {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 10px;
      }
      
      .tutor-action-btn {
        padding: 12px 20px;
        background: rgba(168, 85, 247, 0.2);
        border: 2px solid rgba(168, 85, 247, 0.4);
        border-radius: 10px;
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .tutor-action-btn:hover {
        background: rgba(168, 85, 247, 0.4);
        border-color: #a855f7;
        transform: translateY(-2px);
        box-shadow: 0 5px 20px rgba(168, 85, 247, 0.4);
      }'''

# Department configurations
DEPARTMENTS = {
    'cs': {
        'name': 'Computer Science',
        'field': 'Computer Science & Programming',
        'tutor_icon': '🤖',
        'tutor_name': 'CodeMaster AI',
        'greeting': 'Hello! I\'m CodeMaster AI, your Computer Science tutor. Ask me about algorithms, data structures, programming languages, or any CS concept!'
    },
    'ee': {
        'name': 'Electrical Engineering',
        'field': 'Electrical Engineering & Circuits',
        'tutor_icon': '⚡',
        'tutor_name': 'Circuit Sage',
        'greeting': 'Greetings! I\'m Circuit Sage, your Electrical Engineering expert. Ask me about circuits, electronics, power systems, or any EE topic!'
    },
    'me': {
        'name': 'Mechanical Engineering',
        'field': 'Mechanical Engineering & Thermodynamics',
        'tutor_icon': '⚙️',
        'tutor_name': 'MechBot',
        'greeting': 'Hey there! I\'m MechBot, your Mechanical Engineering guide. Ask me about mechanics, thermodynamics, materials, or any ME concept!'
    },
    'ce': {
        'name': 'Civil Engineering',
        'field': 'Civil Engineering & Structures',
        'tutor_icon': '🏗️',
        'tutor_name': 'StructurePro',
        'greeting': 'Welcome! I\'m StructurePro, your Civil Engineering advisor. Ask me about structures, materials, surveying, or any CE topic!'
    },
    'ec': {
        'name': 'Electronics & Communication',
        'field': 'Electronics & Communication Systems',
        'tutor_icon': '📡',
        'tutor_name': 'SignalMaster',
        'greeting': 'Hi! I\'m SignalMaster, your Electronics & Communication expert. Ask me about signals, communication systems, digital electronics, or any EC concept!'
    }
}

# AI Tutor JavaScript
AI_TUTOR_JS = '''
    <!-- AI Tutor Functionality -->
    <script>
      // AI Tutor for each department
      document.addEventListener('DOMContentLoaded', () => {
        const departments = ['cs', 'ee', 'me', 'ce', 'ec'];
        
        departments.forEach(dept => {
          const askBtn = document.getElementById(`tutor-ask-btn-${dept}`);
          const questionInput = document.getElementById(`tutor-question-${dept}`);
          const chatWindow = document.getElementById(`tutor-chat-window-${dept}`);
          
          if (!askBtn || !questionInput || !chatWindow) return;
          
          // Handle ask button click
          askBtn.addEventListener('click', () => handleAsk(dept, questionInput, chatWindow));
          
          // Handle enter key
          questionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              handleAsk(dept, questionInput, chatWindow);
            }
          });
          
          // Handle action buttons
          document.querySelectorAll(`.tutor-action-btn[data-dept="${dept}"]`).forEach(btn => {
            btn.addEventListener('click', () => {
              const action = btn.getAttribute('data-action');
              handleAction(dept, action, chatWindow);
            });
          });
        });
        
        function handleAsk(dept, input, chatWindow) {
          const question = input.value.trim();
          if (!question) return;
          
          // Add user message
          addMessage(chatWindow, question, 'user');
          input.value = '';
          
          // Simulate AI response
          setTimeout(() => {
            const response = generateResponse(dept, question);
            addMessage(chatWindow, response, 'tutor');
          }, 800);
        }
        
        function handleAction(dept, action, chatWindow) {
          const responses = {
            hint: `💡 Here's a helpful hint for ${dept.toUpperCase()}: Break down complex problems into smaller steps. Focus on understanding the fundamentals first!`,
            explain: `📚 Let me explain: In ${dept.toUpperCase()}, concepts build upon each other. Make sure you grasp the basics before moving to advanced topics. What specific concept would you like me to explain?`,
            resources: `🔗 Great resources for ${dept.toUpperCase()}: Check out the video tutorials above, practice with the code compiler, and explore our comprehensive study materials!`,
            practice: `✍️ Practice problems coming up for ${dept.toUpperCase()}! Try solving the examples in the videos first, then test yourself with the interactive compiler.`
          };
          
          addMessage(chatWindow, responses[action] || 'How can I help you?', 'tutor');
        }
        
        function addMessage(chatWindow, text, sender) {
          const msgDiv = document.createElement('div');
          msgDiv.className = `tutor-message ${sender}`;
          msgDiv.innerHTML = sender === 'tutor' ? `<strong>🤖 AI Tutor:</strong> ${text}` : `<strong>You:</strong> ${text}`;
          chatWindow.appendChild(msgDiv);
          chatWindow.scrollTop = chatWindow.scrollHeight;
        }
        
        function generateResponse(dept, question) {
          const q = question.toLowerCase();
          
          // Smart responses based on keywords
          if (q.includes('hello') || q.includes('hi')) {
            return `Hello! I'm your ${dept.toUpperCase()} tutor. How can I help you today?`;
          }
          if (q.includes('help')) {
            return `I'm here to help! Ask me about any ${dept.toUpperCase()} concept, or use the action buttons below for hints, explanations, and resources.`;
          }
          if (q.includes('explain') || q.includes('what is')) {
            return `Great question! For ${dept.toUpperCase()}, this topic involves understanding core principles. Let me break it down: [Concept explanation would go here]. Would you like me to provide examples?`;
          }
          if (q.includes('example')) {
            return `Sure! Here's a practical example for ${dept.toUpperCase()}: [Example would be provided here]. Try it out in the code compiler above!`;
          }
          
          return `Interesting question about ${dept.toUpperCase()}! To answer that, I'd need a bit more context. Could you be more specific? Or try asking for a hint, explanation, or resources using the buttons below!`;
        }
        
        // Highlight active department in navigation
        const currentPath = window.location.pathname;
        document.querySelectorAll('.dept-nav-link').forEach(link => {
          const dept = link.getAttribute('data-dept');
          if (currentPath.includes(`/${dept}/`)) {
            link.classList.add('active');
          }
        });
      });
    </script>'''

def process_courses_file(file_path, dept_code):
    """Add department navigation and AI tutor to courses.html"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if already has department navigation
        if 'dept-navigation' in content:
            print(f"  ⏭️  Skipped (already updated): {file_path.name}")
            return False
        
        dept_info = DEPARTMENTS[dept_code]
        
        # Add department navigation CSS
        if DEPT_NAV_CSS not in content:
            content = content.replace('</style>', f'{DEPT_NAV_CSS}\n{AI_TUTOR_CSS}\n    </style>')
        
        # Add department navigation after <body> tag (after particles and robot)
        if 'dept-navigation' not in content:
            # Find position after robot container
            robot_pos = content.find('</div>\n    <header')
            if robot_pos != -1:
                content = content[:robot_pos + 6] + DEPT_NAV_HTML + '\n' + content[robot_pos + 6:]
        
        # Add AI Tutor section before footer
        ai_tutor_html = AI_TUTOR_TEMPLATE.format(
            dept=dept_code,
            dept_name=dept_info['name'],
            dept_field=dept_info['field'],
            tutor_icon=dept_info['tutor_icon'],
            tutor_name=dept_info['tutor_name'],
            greeting=dept_info['greeting']
        )
        
        footer_pos = content.find('<footer')
        if footer_pos != -1:
            content = content[:footer_pos] + ai_tutor_html + '\n\n    ' + content[footer_pos:]
        
        # Add AI Tutor JavaScript before </body>
        if AI_TUTOR_JS not in content:
            content = content.replace('</body>', f'{AI_TUTOR_JS}\n  </body>')
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"  ✅ Updated: {file_path.name} ({dept_code.upper()})")
        return True
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def main():
    print("\n" + "="*70)
    print("  🎨 ADDING DEPARTMENT NAVIGATION & AI TUTORS")
    print("="*70 + "\n")
    
    updated_count = 0
    
    for dept_code in DEPARTMENTS.keys():
        print(f"\n📂 Processing {dept_code.upper()} Department:")
        courses_file = BASE_DIR / 'interview' / dept_code / 'courses.html'
        
        if courses_file.exists():
            if process_courses_file(courses_file, dept_code):
                updated_count += 1
        else:
            print(f"  ⚠️  File not found: {courses_file}")
    
    print("\n" + "="*70)
    print(f"  ✅ Updated: {updated_count} course files")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
