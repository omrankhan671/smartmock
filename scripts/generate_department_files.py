"""
Department Interview Files Generator
Generates interview, preparation, and AI interview pages for all departments
"""

import os
import json

# Define department-specific data
DEPARTMENTS = {
    'ee': {
        'name': 'Electrical Engineering',
        'short': 'Electrical',
        'code': 'EE',
        'topics': {
            'circuits': 'Circuit Analysis',
            'power_systems': 'Power Systems',
            'machines': 'Electrical Machines',
            'electronics': 'Electronics'
        },
        'videos': [
            ('EE Interview Tips', 'How to ace electrical engineering interviews', 'UvDpdWfG9I0'),
            ('Circuit Analysis Interview', 'Common circuit analysis questions', 'mc8Dwvr58jI'),
            ('Power Systems Interview', 'Power generation and distribution', '7qUVqV8xpLE'),
            ('Electronics Fundamentals', 'Analog and digital electronics basics', 'd1uSXLEtq0o'),
            ("Ohm's Law & Circuit Analysis", 'Fundamental circuit concepts', '8jB6hDUqN0Y'),
            ('AC vs DC Systems', 'Understanding current types and applications', '9rdePANXvJU'),
            ('Transformers Interview', 'Transformer principles and applications', 'UchitHGF4n8'),
            ('Three-Phase Systems', 'Star and delta configurations', 'quABfe4Ev3s'),
            ('Control Systems Interview', 'Feedback control and stability', 'oBc_BHxw78s'),
            ('Electric Motors Interview', 'DC and AC motor concepts', 'CWulQ1ZSE3c'),
            ('Electrical Machines', 'Generators, motors, and alternators', 'fFUY9SWqJJ8'),
            ('Digital Electronics Interview', 'Logic gates and digital circuits', 'M0mx8S05v60'),
            ('Power Electronics Interview', 'Converters, inverters, and rectifiers', 'nZMtEseUN_U'),
            ('Renewable Energy Systems', 'Solar, wind, and grid integration', 'fKDbAJRto5I'),
            ('Protection Systems Interview', 'Circuit breakers and relays', 'bwHgjHJ2uKw'),
            ('Instrumentation & Measurement', 'Sensors, transducers, and measurement', 'xUDElAEvQ9Q'),
        ]
    },
    'me': {
        'name': 'Mechanical Engineering',
        'short': 'Mechanical',
        'code': 'ME',
        'topics': {
            'thermodynamics': 'Thermodynamics',
            'fluids': 'Fluid Mechanics',
            'materials': 'Materials Science',
            'manufacturing': 'Manufacturing'
        },
        'videos': [
            ('ME Interview Tips', 'How to ace mechanical engineering interviews', 'ROzF7Vgbhq4'),
            ('Thermodynamics Interview', 'Laws and cycles in thermodynamics', 'Z5nfF3tH46M'),
            ('Fluid Mechanics Interview', 'Principles of fluid flow', 'y7Hyc3MRKno'),
            ('Materials Science Interview', 'Properties and testing of materials', 'VMqWfQZgN0I'),
            ('Manufacturing Processes', 'Casting, forging, machining processes', '0WIXYfS0WP4'),
            ('CAD/CAM Interview', 'Computer-aided design and manufacturing', 'UvBh-gRD-K0'),
            ('Heat Transfer', 'Conduction, convection, and radiation', 'GGfRHI8o4s8'),
            ('Mechanics Interview', 'Statics and dynamics fundamentals', 'zUDqI9PJpc0'),
            ('Engine Technology', 'IC engines and gas turbines', 'Q3xW7QjMu_c'),
            ('Strength of Materials', 'Stress, strain, and material behavior', 'lW_S3H5P5Sw'),
            ('Machine Design', 'Design principles and procedures', 'O2D4g6TdGxc'),
            ('Vibrations & Control', 'Mechanical vibrations and control systems', 'qqHYk5L2dq8'),
            ('Composite Materials', 'Advanced materials and applications', 'TvSm8lPDL6Q'),
            ('CFD Analysis', 'Computational fluid dynamics', 'OL-mEhVccYc'),
            ('Additive Manufacturing', '3D printing and modern techniques', 'LLT_x48OZuw'),
            ('FEA Interview', 'Finite element analysis concepts', 'j8W1M6Sh7pg'),
        ]
    },
    'ce': {
        'name': 'Civil Engineering',
        'short': 'Civil',
        'code': 'CE',
        'topics': {
            'structures': 'Structural Analysis',
            'hydraulics': 'Hydraulics',
            'geotechnical': 'Geotechnical Engineering',
            'construction': 'Construction Management'
        },
        'videos': [
            ('CE Interview Tips', 'How to ace civil engineering interviews', 'Z6lk6W_q5DE'),
            ('Structural Analysis Interview', 'Beams, columns, and frame analysis', 'A9J6yqDuNqo'),
            ('Concrete Technology', 'Mix design and properties', 'P6GjLQGSKIU'),
            ('Soil Mechanics Interview', 'Soil classification and properties', 'FE0MwKxK6zk'),
            ('Hydraulics Interview', 'Open channel and pipe flow', 'QXWqVmGK-us'),
            ('Construction Management', 'Planning and scheduling', 'X3cUIBFQq1M'),
            ('Surveying Interview', 'Leveling and theodolite operations', 'V2YVf27-u5c'),
            ('RCC Design', 'Reinforced concrete design principles', 'rOdhwp0-gn0'),
            ('Transportation Engineering', 'Highway and traffic engineering', 'YbOmxXkN0xI'),
            ('Foundation Design', 'Shallow and deep foundations', 'MJGFZwjcZVY'),
            ('Steel Structures', 'Design of steel members', 'EyNnGf_FY_E'),
            ('Water Resources', 'Hydrology and water management', '9K-gN5C7NkM'),
            ('Seismic Design', 'Earthquake-resistant structures', '3fN9yP71bMc'),
            ('Dam Engineering', 'Types and design of dams', '9TnGjq7SNF8'),
            ('BIM Technology', 'Building information modeling', 'jKm7yPVZ0iQ'),
            ('Prestressed Concrete', 'Pre and post-tensioning', '6R62g9Z0P2A'),
        ]
    },
    'ec': {
        'name': 'Electronics & Communication',
        'short': 'Electronic Communication',
        'code': 'EC',
        'topics': {
            'communications': 'Communication Systems',
            'microcontrollers': 'Microcontrollers',
            'signals': 'Signals & Systems',
            'networks': 'Network Theory'
        },
        'videos': [
            ('EC Interview Tips', 'How to ace EC engineering interviews', 'vFHH6GSCVNU'),
            ('Communication Systems', 'Modulation and demodulation', 'T0P5lGlpHlU'),
            ('Microcontrollers Interview', '8051 and PIC fundamentals', 'nPt91ER8k3Y'),
            ('Signal Processing', 'Fourier and Laplace transforms', 'ukzFI9rgwfU'),
            ('Digital Communication', 'Digital modulation techniques', '8mLdhKdJj6Y'),
            ('Analog Electronics', 'Amplifiers and oscillators', 'd1uSXLEtq0o'),
            ('VLSI Design Interview', 'IC design and fabrication', 'b6F3F1D_q0c'),
            ('Wireless Networks', 'WiFi, Bluetooth, cellular systems', 'cYEONs36P4M'),
            ('Embedded Systems', 'ARM and real-time OS', 'Qd3glf8_vyE'),
            ('Antenna Theory', 'Antenna types and radiation', 'mQdV5MfgLro'),
            ('Digital Logic Design', 'Combinational and sequential circuits', 'M0mx8S05v60'),
            ('Op-Amp Circuits', 'Operational amplifier applications', 'lW_S3H5P5Sw'),
            ('DSP Interview', 'Digital signal processing algorithms', 'VfjQ8m2aYZo'),
            ('RF Engineering', 'Radio frequency and microwave', 'f_3tZsQGOFk'),
            ('5G Technology', 'Next-generation wireless', 'W-klOkIkMp0'),
            ('IoT Systems', 'Internet of things architecture', 'tEKHPJPXwzo'),
        ]
    }
}

print("Department Interview Files Generator")
print("=" * 60)
print(f"Total departments to process: {len(DEPARTMENTS)}")
print("Files per department: preparation.html, interview.html, ai-interview.html, ai-report.html")
print(f"Total files to create/update: {len(DEPARTMENTS) * 4}")
print("=" * 60)

for dept_code, dept_data in DEPARTMENTS.items():
    print(f"\n Processing {dept_data['name']} ({dept_code.upper()})...")
    print(f"   - Topics: {', '.join(dept_data['topics'].keys())}")
    print(f"   - Videos: {len(dept_data['videos'])} videos configured")
    
print("\n✅ Configuration loaded successfully")
print("\nTo generate files, run the corresponding file generation functions")
print("(Implementation continues with file generation logic...)")
