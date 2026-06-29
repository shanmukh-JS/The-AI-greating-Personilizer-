const { Pool } = require('pg');
require('dotenv').config();
const crypto = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize database tables
async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        location VARCHAR(255),
        profile_image TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS templates (
        id UUID PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        subject_pattern TEXT,
        body_pattern TEXT,
        language VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS presets (
        id UUID PRIMARY KEY,
        label VARCHAR(255) NOT NULL,
        emoji VARCHAR(50),
        destination VARCHAR(255),
        travel_type VARCHAR(100),
        booking_history VARCHAR(100),
        category VARCHAR(100),
        language VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS greetings (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        customer_name VARCHAR(255),
        destination VARCHAR(255),
        travel_date VARCHAR(255),
        booking_history VARCHAR(100),
        travel_type VARCHAR(100),
        language VARCHAR(100),
        category VARCHAR(100),
        special_notes TEXT,
        whatsapp_number VARCHAR(50),
        generated_text TEXT,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS prompt_versions (
        id UUID PRIMARY KEY,
        version_name VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        issues TEXT,
        rating_impact TEXT,
        fix_description TEXT,
        is_live BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS feedback (
        id UUID PRIMARY KEY,
        greeting_id UUID REFERENCES greetings(id) ON DELETE CASCADE,
        rating INTEGER,
        comments TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert mock users if not exist
    const { rowCount } = await client.query('SELECT 1 FROM users LIMIT 1');
    if (rowCount === 0) {
      await client.query(`
        INSERT INTO users (id, username, password_hash, role, email) VALUES
        ('b3014a5c-59bc-47cb-8c9f-d31e9c5a1a1f', 'admin', '$2a$10$pXI8WOQQ3HSbX0tufILAqeeZRRTVZhvHB8YqmV6XKPppIfHc2840S', 'admin', 'admin@manivthatravels.com'),
        ('d2903b4b-48ab-46cb-8b8f-c20d8c4a0a0f', 'agent', '$2a$10$pXI8WOQQ3HSbX0tufILAqeeZRRTVZhvHB8YqmV6XKPppIfHc2840S', 'staff', 'agent@manivthatravels.com'),
        ('a1014a5c-59bc-47cb-8c9f-d31e9c5a1a1f', 'NIAT x AURORA', '$2a$10$VRhcEGdTgmeNK8kdoQOC5eC22.XvkXIZRHRScnq/2Rt9c/sl7c6mK', 'admin', 'niatxaurora@manivthatravels.com')
      `);
      
      // Prompt Versions Seed
      await client.query(`
        INSERT INTO prompt_versions (id, version_name, title, issues, rating_impact, fix_description, is_live) VALUES
        ('v1000000-0000-0000-0000-000000000001', 'V1', 'Basic Text Generator', 'Outputs were too generic, inconsistent in tone, no brand identity.', 'Agents rated low — greetings felt copy-paste and impersonal.', 'Added loyalty category (Standard / Premium / VIP) and brand signature.', false),
        ('v2000000-0000-0000-0000-000000000002', 'V2', 'Structured Template', 'Format improved, but ignored preferred language and special notes.', 'Non-English customers received English-only greetings — very low ratings.', 'Added multilingual support (8 languages) and a special notes input field.', false),
        ('v3000000-0000-0000-0000-000000000003', 'V3', 'Multilingual & Contextual', 'AI invented hotel check-in times, flight numbers, and tour schedules.', 'Hallucinated facts caused customer confusion and complaint escalations.', 'Introduced STRICT CONSTRAINTS block — zero hallucination policy enforced.', false),
        ('v4000000-0000-0000-0000-000000000004', 'V4', 'Production-Grade (LIVE)', '', '', 'Tone-matched, language-native, loyalty-aware, zero hallucinations.\nTemperature 0.3 • Max 500 tokens • 3-retry exponential backoff • Fallback engine.', true)
        ON CONFLICT (id) DO NOTHING
      `);
      
      // Default Templates
      await client.query(`
        INSERT INTO templates (id, title, description, subject_pattern, body_pattern, language) VALUES
        ('t1010101-1111-2222-3333-444455556666', 'Standard Pre-Trip Greeting', 'General template for all travel types', 'Greeting for {{CustomerName}}', 'Hello {{CustomerName}},\n\nThank you for choosing Manivtha Tours & Travels for your upcoming journey to {{Destination}}.\n\nWe hope you have an incredible travel experience. Let us know if you need any assistance.\n\nRegards,\nManivtha Tours & Travels', 'English'),
        ('t2020202-2222-3333-4444-555566667777', 'VIP Spiritual Journey', 'Tailored spiritual tone for holy cities', 'Spiritual greetings for {{CustomerName}}', 'Namaste {{CustomerName}},\n\nWe are honored to assist in facilitating your sacred journey to {{Destination}}.\n\nAs one of our returning customers, we have arranged the primary details to ensure absolute peace of mind during your spiritual tour.\n\nMay your pilgrimage be deeply rewarding.\n\nRegards,\nManivtha Tours & Travels', 'English')
      `);

      // Default Presets
      await client.query(`
        INSERT INTO presets (id, label, emoji, destination, travel_type, booking_history, category, language, notes) VALUES
        ('p1010101-1111-2222-3333-444455556661', 'Tirupati Pilgrimage', '☸️', 'Tirupati', 'Spiritual Tour', '3 Previous Trips', 'VIP', 'English', 'Arrange clean vegetarian guide.'),
        ('p1010101-1111-2222-3333-444455556662', 'Goa Honeymoon', '🏖️', 'Goa', 'Honeymoon', '1st Trip', 'Premium', 'English', 'Arrange flower decorations and candle light dinners.'),
        ('p1010101-1111-2222-3333-444455556663', 'Mumbai Corporate', '💼', 'Mumbai', 'Corporate Travel', '5 Previous Trips', 'VIP', 'English', 'Provide premium executive sedan, late check-out, express Wi-Fi.')
      `);
    }
  } catch (err) {
    console.error("Failed to initialize database:", err);
  } finally {
    client.release();
  }
}

initDb();

function generateUUID() {
  return crypto.randomUUID();
}

async function findUserByUsername(username) {
  const res = await pool.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);
  return res.rows[0];
}

async function findUserById(id) {
  const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows[0];
}

async function updateUserProfile(id, data) {
  let query = 'UPDATE users SET ';
  const values = [];
  let i = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      query += `${key} = $${i}, `;
      values.push(value);
      i++;
    }
  }
  
  if (values.length === 0) return await findUserById(id);

  query = query.slice(0, -2) + ` WHERE id = $${i} RETURNING *`;
  values.push(id);

  const res = await pool.query(query, values);
  return res.rows[0];
}

async function updateUserEmail(id, email) {
  return await updateUserProfile(id, { email });
}

// GREETINGS OPERATIONS
async function createGreeting(data) {
  const id = generateUUID();
  const query = `
    INSERT INTO greetings (
      id, user_id, customer_name, destination, travel_date, booking_history,
      travel_type, language, category, special_notes, whatsapp_number, generated_text
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `;
  const values = [
    id, data.user_id, data.name, data.destination, data.travelDate, data.bookingHistory,
    data.travelType, data.preferredLanguage, data.customerCategory, data.specialNotes,
    data.whatsappNumber, data.generated_text
  ];
  const res = await pool.query(query, values);
  return res.rows[0];
}

// SYNC OFFLINE GREETING
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

async function updateGreetingStatus(id, status) {
  const res = await pool.query('UPDATE greetings SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
  return res.rows[0];
}

async function getGreetingsHistory(filters = {}) {
  let query = `
    SELECT g.*, f.rating, f.comments 
    FROM greetings g
    LEFT JOIN feedback f ON g.id = f.greeting_id
  `;
  const values = [];
  
  if (filters.search) {
    query += ` WHERE LOWER(g.customer_name) LIKE $1 OR LOWER(g.destination) LIKE $1`;
    values.push(`%${filters.search.toLowerCase()}%`);
  }
  
  query += ` ORDER BY g.created_at DESC`;
  
  const res = await pool.query(query, values);
  return res.rows;
}

async function getGreetingById(id) {
  const query = `
    SELECT g.*, f.rating, f.comments 
    FROM greetings g
    LEFT JOIN feedback f ON g.id = f.greeting_id
    WHERE g.id = $1
  `;
  const res = await pool.query(query, [id]);
  return res.rows[0];
}

async function deleteGreeting(id) {
  const res = await pool.query('DELETE FROM greetings WHERE id = $1', [id]);
  return res.rowCount > 0;
}

// FEEDBACK OPERATIONS
async function createFeedback(data) {
  const id = generateUUID();
  const res = await pool.query(
    'INSERT INTO feedback (id, greeting_id, rating, comments) VALUES ($1, $2, $3, $4) RETURNING *',
    [id, data.greeting_id, data.rating, data.comments]
  );
  return res.rows[0];
}

// TEMPLATE CRUD
async function getTemplates() {
  const res = await pool.query('SELECT * FROM templates WHERE is_active = TRUE ORDER BY created_at DESC');
  return res.rows;
}

async function getTemplateById(id) {
  const res = await pool.query('SELECT * FROM templates WHERE id = $1 AND is_active = TRUE', [id]);
  return res.rows[0];
}

async function createTemplate(data) {
  const id = generateUUID();
  const query = `
    INSERT INTO templates (id, title, description, subject_pattern, body_pattern, language)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
  `;
  const values = [id, data.title, data.description, data.subject_pattern, data.body_pattern, data.language];
  const res = await pool.query(query, values);
  return res.rows[0];
}

async function updateTemplate(id, data) {
  let query = 'UPDATE templates SET updated_at = CURRENT_TIMESTAMP, ';
  const values = [];
  let i = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      query += `${key} = $${i}, `;
      values.push(value);
      i++;
    }
  }

  if (values.length === 0) return await getTemplateById(id);

  query = query.slice(0, -2) + ` WHERE id = $${i} RETURNING *`;
  values.push(id);

  const res = await pool.query(query, values);
  return res.rows[0];
}

async function deleteTemplate(id) {
  const res = await pool.query('UPDATE templates SET is_active = FALSE WHERE id = $1', [id]);
  return res.rowCount > 0;
}

// ANALYTICS COMPUTATION
async function getAnalyticsData(filters = {}) {
  // Fetch all greetings that match the filters
  let query = 'SELECT g.*, f.rating, f.comments FROM greetings g LEFT JOIN feedback f ON g.id = f.greeting_id WHERE 1=1';
  const values = [];
  let i = 1;

  if (filters.category && filters.category !== 'All') {
    query += ` AND g.category = $${i}`;
    values.push(filters.category);
    i++;
  }
  if (filters.language && filters.language !== 'All') {
    query += ` AND g.language = $${i}`;
    values.push(filters.language);
    i++;
  }
  if (filters.travelType && filters.travelType !== 'All') {
    query += ` AND g.travel_type = $${i}`;
    values.push(filters.travelType);
    i++;
  }

  query += ` ORDER BY g.created_at DESC`;

  const { rows } = await pool.query(query, values);
  
  const totalGreetings = rows.length;
  
  const ratings = rows.filter(r => r.rating != null).map(r => r.rating);
  const averageRating = ratings.length ? parseFloat((ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)) : 0;
  
  const destCount = {};
  const categoryCount = {};
  
  rows.forEach(g => {
    destCount[g.destination] = (destCount[g.destination] || 0) + 1;
    categoryCount[g.category] = (categoryCount[g.category] || 0) + 1;
  });

  const topDestinations = Object.keys(destCount).map(name => ({ name, count: destCount[name] })).sort((a, b) => b.count - a.count);
  const topCategories = Object.keys(categoryCount).map(name => ({ name, count: categoryCount[name] }));

  // dailyUsage logic
  const offsetMinutes = parseInt(filters.tzOffset || 0, 10);
  
  const dailyUsage = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  let startD = new Date(filters.startDate || (Date.now() - 6 * 24 * 60 * 60 * 1000));
  let endD = new Date(filters.endDate || Date.now());
  
  // ensure startD is before endD
  if (startD > endD) {
    const temp = startD;
    startD = endD;
    endD = temp;
  }
  
  // Create an array of all dates between startD and endD
  const datesToQuery = [];
  let currentD = new Date(startD);
  while (currentD <= endD) {
    datesToQuery.push(new Date(currentD));
    currentD.setDate(currentD.getDate() + 1);
  }
  
  for (let d of datesToQuery) {
    const dayName = daysOfWeek[d.getUTCDay()];
    const localYear = d.getUTCFullYear();
    const localMonth = String(d.getUTCMonth() + 1).padStart(2, '0');
    const localDay = String(d.getUTCDate()).padStart(2, '0');
    const dateStr = `${localYear}-${localMonth}-${localDay}`;
    
    const count = rows.filter(g => {
      if (!g.created_at) return false;
      const gDateObj = new Date(new Date(g.created_at).getTime() - (offsetMinutes * 60000));
      const gYear = gDateObj.getUTCFullYear();
      const gMonth = String(gDateObj.getUTCMonth() + 1).padStart(2, '0');
      const gDay = String(gDateObj.getUTCDate()).padStart(2, '0');
      return `${gYear}-${gMonth}-${gDay}` === dateStr;
    }).length;
    
    dailyUsage.push({
      date: `${dayName} ${d.getUTCDate()}`,
      count: count
    });
  }

  const recentFeedbacks = rows.filter(r => r.rating != null).slice(0, 5).map(r => ({
    id: crypto.randomUUID(), // fake id for recentFeedbacks if we don't fetch fb id
    customer_name: r.customer_name,
    destination: r.destination,
    rating: r.rating,
    comments: r.comments,
    created_at: r.created_at
  }));

  return {
    totalGreetings,
    averageRating,
    feedbackCount: ratings.length,
    topDestinations,
    topCategories,
    dailyUsage,
    recentFeedbacks,
    performanceMetrics: {
      avgResponseMs: 2400,
      uptimePct: 99.9,
      aiSuccessRate: 99.2
    }
  };
}

// PROMPT HISTORY OPERATIONS
async function getPromptHistory() {
  const res = await pool.query('SELECT * FROM prompt_versions ORDER BY created_at ASC');
  return res.rows;
}

// PRESETS OPERATIONS
async function getPresets() {
  const res = await pool.query('SELECT * FROM presets ORDER BY created_at ASC');
  return res.rows;
}

async function createPreset(data) {
  const id = generateUUID();
  const query = `
    INSERT INTO presets (id, label, emoji, destination, travel_type, booking_history, category, language, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
  `;
  const values = [
    id, data.label, data.emoji || '✈️', data.destination, data.travelType || 'Family Trip',
    data.bookingHistory || '1st Trip', data.category || 'Standard', data.language || 'English', data.notes || ''
  ];
  const res = await pool.query(query, values);
  return res.rows[0];
}

async function deletePreset(id) {
  const res = await pool.query('DELETE FROM presets WHERE id = $1', [id]);
  return res.rowCount > 0;
}

module.exports = {
  findUserByUsername,
  findUserById,
  updateUserEmail,
  updateUserProfile,
  createGreeting,
  syncOfflineGreeting,
  updateGreetingStatus,
  getGreetingsHistory,
  getGreetingById,
  deleteGreeting,
  createFeedback,
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getPromptHistory,
  getAnalyticsData,
  getPresets,
  createPreset,
  deletePreset
};
