import io

try:
    content = io.open('backend/server.js', 'r', encoding='utf-8').read()
    
    # 1. Add /api/prompt-history endpoint
    target_endpoint = """// Feedback"""
    replace_endpoint = """// Prompt History
app.get('/api/prompt-history', authenticateToken, async (req, res) => {
  try {
    const history = await db.getPromptHistory();
    res.json(history);
  } catch (error) {
    console.error('Error fetching prompt history:', error);
    res.status(500).json({ error: 'Failed to fetch prompt history' });
  }
});

// Feedback"""
    content = content.replace(target_endpoint, replace_endpoint)
    
    io.open('backend/server.js', 'w', encoding='utf-8').write(content)
    print("Patched server.js")
except Exception as e:
    print("Error:", e)
