import io

try:
    content = io.open('backend/db/pgDb.js', 'r', encoding='utf-8').read()
    
    # 1. Add prompt_versions table
    target_create_tables = """      CREATE TABLE IF NOT EXISTS feedback ("""
    replace_create_tables = """      CREATE TABLE IF NOT EXISTS prompt_versions (
        id UUID PRIMARY KEY,
        version_name VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        issues TEXT,
        rating_impact TEXT,
        fix_description TEXT,
        is_live BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS feedback ("""
    content = content.replace(target_create_tables, replace_create_tables)
    
    # 2. Seed prompt_versions data
    target_seed = """      // Default Templates"""
    replace_seed = """      // Prompt Versions Seed
      await client.query(`
        INSERT INTO prompt_versions (id, version_name, title, issues, rating_impact, fix_description, is_live) VALUES
        ('v1000000-0000-0000-0000-000000000001', 'V1', 'Basic Text Generator', 'Outputs were too generic, inconsistent in tone, no brand identity.', 'Agents rated low — greetings felt copy-paste and impersonal.', 'Added loyalty category (Standard / Premium / VIP) and brand signature.', false),
        ('v2000000-0000-0000-0000-000000000002', 'V2', 'Structured Template', 'Format improved, but ignored preferred language and special notes.', 'Non-English customers received English-only greetings — very low ratings.', 'Added multilingual support (8 languages) and a special notes input field.', false),
        ('v3000000-0000-0000-0000-000000000003', 'V3', 'Multilingual & Contextual', 'AI invented hotel check-in times, flight numbers, and tour schedules.', 'Hallucinated facts caused customer confusion and complaint escalations.', 'Introduced STRICT CONSTRAINTS block — zero hallucination policy enforced.', false),
        ('v4000000-0000-0000-0000-000000000004', 'V4', 'Production-Grade (LIVE)', '', '', 'Tone-matched, language-native, loyalty-aware, zero hallucinations.\\nTemperature 0.3 • Max 500 tokens • 3-retry exponential backoff • Fallback engine.', true)
        ON CONFLICT (id) DO NOTHING
      `);
      
      // Default Templates"""
    content = content.replace(target_seed, replace_seed)
    
    # 3. Add getPromptHistory method
    target_exports = """// PRESETS OPERATIONS"""
    replace_exports = """// PROMPT HISTORY OPERATIONS
async function getPromptHistory() {
  const res = await pool.query('SELECT * FROM prompt_versions ORDER BY created_at ASC');
  return res.rows;
}

// PRESETS OPERATIONS"""
    content = content.replace(target_exports, replace_exports)
    
    # 4. Export getPromptHistory
    target_module_exports = """  deleteTemplate,"""
    replace_module_exports = """  deleteTemplate,
  getPromptHistory,"""
    content = content.replace(target_module_exports, replace_module_exports)
    
    io.open('backend/db/pgDb.js', 'w', encoding='utf-8').write(content)
    print("Patched pgDb.js")
except Exception as e:
    print("Error:", e)
