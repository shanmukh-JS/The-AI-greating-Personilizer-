import io

try:
    content = io.open('frontend/src/App.jsx', 'r', encoding='utf-8').read()
    
    target = """  const loadGreetingsHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/history');
      let combined = [...res.data];
      const localGreetings = safeParseLocal('live_greetings', []);
      const localFeedbacks = safeParseLocal('live_feedbacks', []);
      
      localGreetings.forEach(lg => {
        if (!combined.find(g => g.id === lg.id)) combined.push(lg);
      });"""
      
    replace = """  const loadGreetingsHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/history');
      let combined = [...res.data];
      const localGreetings = safeParseLocal('live_greetings', []);
      const localFeedbacks = safeParseLocal('live_feedbacks', []);
      
      // BACKGROUND OFFLINE SYNC
      const offlineGreetings = localGreetings.filter(lg => !combined.find(g => g.id === lg.id));
      if (offlineGreetings.length > 0) {
        Promise.all(offlineGreetings.map(g => api.post('/sync', g).catch(e => console.warn('Sync failed', e))))
          .then(() => console.log('Offline greetings synced to cloud!'));
      }
      // Also sync offline feedbacks
      const offlineFeedbacks = localFeedbacks.filter(lf => {
        const cloudG = combined.find(g => g.id === lf.greeting_id);
        return cloudG && !cloudG.rating;
      });
      if (offlineFeedbacks.length > 0) {
        Promise.all(offlineFeedbacks.map(f => api.post('/feedback', { greeting_id: f.greeting_id, rating: f.rating, comments: f.comments }).catch(e => null)));
      }
      
      localGreetings.forEach(lg => {
        if (!combined.find(g => g.id === lg.id)) combined.push(lg);
      });"""
      
    content = content.replace(target, replace)
    io.open('frontend/src/App.jsx', 'w', encoding='utf-8').write(content)
    print("Updated App.jsx with offline sync logic")
except Exception as e:
    print("Error:", e)
