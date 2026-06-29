import io

# 1. Update pgDb.js
try:
    pg_content = io.open('backend/db/pgDb.js', 'r', encoding='utf-8').read()
    pg_target = "async function updateGreetingStatus(id, status) {"
    pg_replace = """// SYNC OFFLINE GREETING
async function syncOfflineGreeting(data) {
  const query = `
    INSERT INTO greetings (
      id, user_id, customer_name, destination, travel_date, booking_history,
      travel_type, language, category, special_notes, whatsapp_number, generated_text, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    ON CONFLICT (id) DO NOTHING
    RETURNING *
  `;
  const values = [
    data.id, data.user_id, data.customer_name || '', data.destination || '', data.travel_date || '', data.booking_history || '',
    data.travel_type || '', data.language || '', data.category || '', data.special_notes || '',
    data.whatsapp_number || '', data.generated_text || '', data.created_at || new Date()
  ];
  const res = await pool.query(query, values);
  return res.rows[0];
}

async function updateGreetingStatus(id, status) {"""

    pg_content = pg_content.replace(pg_target, pg_replace)
    pg_content = pg_content.replace('createGreeting,', 'createGreeting,\n  syncOfflineGreeting,')
    io.open('backend/db/pgDb.js', 'w', encoding='utf-8').write(pg_content)
    print('Updated pgDb.js')
except Exception as e:
    print('Error in pgDb.js:', e)

# 2. Update server.js
try:
    server_content = io.open('backend/server.js', 'r', encoding='utf-8').read()
    server_target = "// GET /api/history (Query generated log list)"
    server_replace = """// POST /api/sync (Sync offline greeting)
app.post('/api/sync', authenticateToken, async (req, res) => {
  try {
    const greeting = req.body;
    greeting.user_id = req.user.id;
    const savedRecord = await db.syncOfflineGreeting(greeting);
    res.status(201).json(savedRecord || { message: 'Already synced' });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Failed to sync' });
  }
});

// GET /api/history (Query generated log list)"""

    server_content = server_content.replace(server_target, server_replace)
    io.open('backend/server.js', 'w', encoding='utf-8').write(server_content)
    print('Updated server.js')
except Exception as e:
    print('Error in server.js:', e)
