import re

with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """      // Clean up any previously seeded mock data
      const removeMock = (key) => {
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
      const cleanedGreetings = removeMock('live_greetings');
      const cleanedFeedbacks = removeMock('live_feedbacks');
      if (cleanedGreetings || cleanedFeedbacks) {
        window.location.reload();
      }"""

replacement = """      // Migrate user's old real data (from 'local_') to the new keys ('live_')
      const migrateData = () => {
        let reloaded = false;
        
        // Migrate greetings
        const oldGreetings = safeParseLocal('local_greetings', []);
        const liveGreetings = safeParseLocal('live_greetings', []);
        if (oldGreetings.length > 0) {
          // Filter out mock data (g-*) from the old items
          const realOldGreetings = oldGreetings.filter(item => !(item.id && String(item.id).startsWith('g-')));
          if (realOldGreetings.length > 0) {
            // Only add ones that aren't already in live_greetings
            const existingIds = new Set(liveGreetings.map(g => g.id));
            const newGreetingsToAdd = realOldGreetings.filter(g => !existingIds.has(g.id));
            
            if (newGreetingsToAdd.length > 0) {
              localStorage.setItem('live_greetings', JSON.stringify([...liveGreetings, ...newGreetingsToAdd]));
              localStorage.removeItem('local_greetings'); // clear old key
              reloaded = true;
            }
          }
        }
        
        // Migrate feedbacks
        const oldFeedbacks = safeParseLocal('local_feedbacks', []);
        const liveFeedbacks = safeParseLocal('live_feedbacks', []);
        if (oldFeedbacks.length > 0) {
          // Filter out mock data
          const realOldFeedbacks = oldFeedbacks.filter(item => !(item.greeting_id && String(item.greeting_id).startsWith('g-')));
          if (realOldFeedbacks.length > 0) {
            // Only add ones that aren't already in live_feedbacks
            const existingIds = new Set(liveFeedbacks.map(f => f.greeting_id));
            const newFeedbacksToAdd = realOldFeedbacks.filter(f => !existingIds.has(f.greeting_id));
            
            if (newFeedbacksToAdd.length > 0) {
              localStorage.setItem('live_feedbacks', JSON.stringify([...liveFeedbacks, ...newFeedbacksToAdd]));
              localStorage.removeItem('local_feedbacks'); // clear old key
              reloaded = true;
            }
          }
        }
        
        if (reloaded) {
          window.location.reload();
        }
      };
      migrateData();"""

if target in content:
    content = content.replace(target, replacement)
    with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added migration logic.")
else:
    print("Could not find the target code.")
