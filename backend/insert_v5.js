const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function insertV5() {
  const client = await pool.connect();
  try {
    const id = require('crypto').randomUUID();
    const query = `
      INSERT INTO prompt_versions (id, version_name, title, issues, rating_impact, fix_description, is_live) VALUES 
      ($1, 'V5', 'Database Test', 'Just testing the live DB!', 'No impact', 'Added from Backend Script by AI', true)
      ON CONFLICT DO NOTHING
    `;
    await client.query(query, [id]);
    console.log('Successfully inserted V5 into the live database!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

insertV5();
