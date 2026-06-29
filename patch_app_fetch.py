import io

try:
    content = io.open('frontend/src/App.jsx', 'r', encoding='utf-8').read()
    
    # 1. Add fetching of prompt history
    target_fetch = """        const localFeedbacks = safeParseLocal('live_feedbacks', []);
        allGreetings = combined;"""
    replace_fetch = """        const localFeedbacks = safeParseLocal('live_feedbacks', []);
        allGreetings = combined;
        
        try {
          const phRes = await api.get('/api/prompt-history');
          setMetrics(prev => ({ ...prev, promptHistory: phRes.data }));
        } catch (phErr) {
          console.error("Could not fetch prompt history", phErr);
        }"""
    content = content.replace(target_fetch, replace_fetch)
    
    # Also add promptHistory to setMetrics call
    target_setMetrics = """      setMetrics({
        allFeedbacks: filteredFeedback,"""
    replace_setMetrics = """      setMetrics(prev => ({
        ...prev,
        allFeedbacks: filteredFeedback,"""
    content = content.replace(target_setMetrics, replace_setMetrics)
    
    # Replace ending braces
    target_setMetricsEnd = """        performanceMetrics: {
          avgResponseMs: 2400,
          uptimePct: 99.9,
          aiSuccessRate: 99.2
        }
      });"""
    replace_setMetricsEnd = """        performanceMetrics: {
          avgResponseMs: 2400,
          uptimePct: 99.9,
          aiSuccessRate: 99.2
        }
      }));"""
    content = content.replace(target_setMetricsEnd, replace_setMetricsEnd)
    
    io.open('frontend/src/App.jsx', 'w', encoding='utf-8').write(content)
    print("Patched App.jsx loadMetrics")
except Exception as e:
    print("Error:", e)
