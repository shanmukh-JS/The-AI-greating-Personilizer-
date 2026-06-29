import io

try:
    content = io.open('frontend/src/App.jsx', 'r', encoding='utf-8').read()
    
    # Insert the prompt history fetch
    target_fetch = """      const totalGreetings = allGreetings.length;"""
    replace_fetch = """      let promptHistory = [];
      try {
        const phRes = await api.get('/prompt-history');
        promptHistory = phRes.data;
      } catch (phErr) {
        console.warn("API offline, rendering simulated prompt history", phErr);
      }
      
      const totalGreetings = allGreetings.length;"""
    
    content = content.replace(target_fetch, replace_fetch)
    
    # Update setMetrics to include promptHistory
    target_setMetrics = """        recentFeedbacks,"""
    replace_setMetrics = """        recentFeedbacks,
        promptHistory,"""
    
    content = content.replace(target_setMetrics, replace_setMetrics)
    
    io.open('frontend/src/App.jsx', 'w', encoding='utf-8').write(content)
    print("Patched App.jsx to fetch promptHistory correctly")
except Exception as e:
    print("Error:", e)
