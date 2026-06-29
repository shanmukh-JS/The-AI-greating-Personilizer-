import io

try:
    content = io.open('frontend/src/App.jsx', 'r', encoding='utf-8').read()
    
    # 1. Update setMetrics to include allFeedbacks
    target_setMetrics = """      setMetrics({
        totalGreetings,"""
    replace_setMetrics = """      setMetrics({
        allFeedbacks: filteredFeedback,
        totalGreetings,"""
    content = content.replace(target_setMetrics, replace_setMetrics)
    
    # 2. Update AI FEEDBACK LOOP to use metrics.allFeedbacks
    target_aiLoop = """      {(() => {
        const localGreetings = safeParseLocal('live_greetings', []);
        const localFbs = safeParseLocal('live_feedbacks', []);

        // Rating distribution
        const dist = [0,0,0,0,0]; // index = rating-1
        localFbs.forEach(fb => { if (fb.rating >= 1 && fb.rating <= 5) dist[fb.rating - 1]++; });
        const totalFb = localFbs.length || 1;
        const avgRating = localFbs.length
          ? (localFbs.reduce((s,f) => s + f.rating, 0) / localFbs.length).toFixed(1)
          : '0.0';
        const lowCount = dist[0] + dist[1]; // 1-2 stars (needs improvement)
        const highCount = dist[3] + dist[4]; // 4-5 stars (approved)"""
        
    replace_aiLoop = """      {(() => {
        const fbData = metrics?.allFeedbacks || [];

        // Rating distribution
        const dist = [0,0,0,0,0]; // index = rating-1
        fbData.forEach(fb => { if (fb.rating >= 1 && fb.rating <= 5) dist[fb.rating - 1]++; });
        const totalFb = fbData.length || 1;
        const avgRating = metrics?.averageRating?.toFixed(1) || '0.0';
        const lowCount = dist[0] + dist[1]; // 1-2 stars (needs improvement)
        const highCount = dist[3] + dist[4]; // 4-5 stars (approved)"""
        
    content = content.replace(target_aiLoop, replace_aiLoop)
    
    # 3. Update the UI string from "total ratings collected" to match fbData.length
    target_uiString = "{localFbs.length} total ratings collected"
    replace_uiString = "{fbData.length} total ratings collected"
    content = content.replace(target_uiString, replace_uiString)
    
    io.open('frontend/src/App.jsx', 'w', encoding='utf-8').write(content)
    print("Updated AI Feedback Loop to use live metrics")
except Exception as e:
    print("Error:", e)
