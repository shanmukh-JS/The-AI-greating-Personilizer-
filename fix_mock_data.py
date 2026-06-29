import re

with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace seedMockData definition and call
seed_regex = re.compile(r'const seedMockData = \(\) => \{[\s\S]*?\};\n\s*seedMockData\(\);')
match = seed_regex.search(content)

if match:
    cleanup_code = """// Clean up any previously seeded mock data
      const removeMock = (key) => {
        const data = safeParseLocal(key, []);
        if (data.length > 0) {
          const filtered = data.filter(item => 
            !(item.id && String(item.id).startsWith('g-')) && 
            !(item.greeting_id && String(item.greeting_id).startsWith('g-'))
          );
          if (filtered.length !== data.length) {
            localStorage.setItem(key, JSON.stringify(filtered));
          }
        }
      };
      removeMock('local_greetings');
      removeMock('local_feedbacks');"""
    content = content[:match.start()] + cleanup_code + content[match.end():]
    
    with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Mock data removed and cleanup added.")
else:
    print("Could not find seedMockData")
