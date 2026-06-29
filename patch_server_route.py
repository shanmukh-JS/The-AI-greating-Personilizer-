import io
import re

try:
    content = io.open('backend/server.js', 'r', encoding='utf-8').read()
    
    # Insert the prompt-history route right before /api/history
    route_code = """
// GET /api/prompt-history
app.get('/api/prompt-history', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM prompt_versions ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching prompt history:', error);
    res.status(500).json({ error: 'Failed to fetch prompt history.' });
  }
});

// GET /api/history (Query generated log list)"""

    content = re.sub(r'// GET /api/history \(Query generated log list\)', route_code, content)
    
    io.open('backend/server.js', 'w', encoding='utf-8').write(content)
    print("Patched server.js with /api/prompt-history route")
except Exception as e:
    print("Error:", e)
