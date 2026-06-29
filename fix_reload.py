import re

with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """      const removeMock = (key) => {
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

replacement = """      const removeMock = (key) => {
        const data = safeParseLocal(key, []);
        if (data.length > 0) {
          const filtered = data.filter(item => 
            !(item.id && String(item.id).startsWith('g-')) && 
            !(item.greeting_id && String(item.greeting_id).startsWith('g-'))
          );
          if (filtered.length !== data.length) {
            localStorage.setItem(key, JSON.stringify(filtered));
            return true;
          }
        }
        return false;
      };
      const cleanedGreetings = removeMock('local_greetings');
      const cleanedFeedbacks = removeMock('local_feedbacks');
      if (cleanedGreetings || cleanedFeedbacks) {
        window.location.reload();
      }"""

if target in content:
    content = content.replace(target, replacement)
    with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added reload on cleanup.")
else:
    print("Could not find the target code.")
