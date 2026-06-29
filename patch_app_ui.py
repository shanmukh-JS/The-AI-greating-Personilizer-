import io

try:
    content = io.open('frontend/src/App.jsx', 'r', encoding='utf-8').read()
    
    target_stages = """  const promptStages = [
    {
      version: 'V1', label: 'Basic Text Generator', gradient: 'from-red-500 to-orange-500',
      problem: 'Outputs were too generic, inconsistent in tone, no brand identity.',
      ratingImpact: 'Agents rated low  greetings felt copy-paste and impersonal.',
      fix: 'Added loyalty category (Standard / Premium / VIP) and brand signature.', active: false,
    },
    {
      version: 'V2', label: 'Structured Template', gradient: 'from-orange-500 to-amber-500',
      problem: 'Format improved, but ignored preferred language and special notes.',
      ratingImpact: 'Non-English customers received English-only greetings  very low ratings.',
      fix: 'Added multilingual support (8 languages) and a special notes input field.', active: false,
    },
    {
      version: 'V3', label: 'Multilingual & Contextual', gradient: 'from-amber-500 to-yellow-400',
      problem: 'AI invented hotel check-in times, flight numbers, and tour schedules.',
      ratingImpact: 'Hallucinated facts caused customer confusion and complaint escalations.',
      fix: 'Introduced STRICT CONSTRAINTS block  zero hallucination policy enforced.', active: false,
    },
    {
      version: 'V4', label: 'Production-Grade (LIVE)', gradient: 'from-emerald-500 to-cyan-400',
      problem: null,
      ratingImpact: 'Tone-matched, language-native, loyalty-aware, zero hallucinations.',
      fix: 'Temperature 0.3  Max 500 tokens  3-retry exponential backoff  Fallback engine.', active: true,
    },
  ];"""
  
    replace_stages = """  const gradients = ['from-red-500 to-orange-500', 'from-orange-500 to-amber-500', 'from-amber-500 to-yellow-400', 'from-emerald-500 to-cyan-400', 'from-indigo-500 to-purple-500', 'from-pink-500 to-rose-500'];
  const dbStages = (metrics?.promptHistory || []).map((dbItem, index) => ({
    version: dbItem.version_name,
    label: dbItem.title,
    gradient: gradients[index % gradients.length],
    problem: dbItem.issues || null,
    ratingImpact: dbItem.rating_impact || '',
    fix: dbItem.fix_description || '',
    active: dbItem.is_live
  }));

  const promptStages = dbStages.length ? dbStages : [
    {
      version: 'V1', label: 'Basic Text Generator', gradient: 'from-red-500 to-orange-500',
      problem: 'Outputs were too generic, inconsistent in tone, no brand identity.',
      ratingImpact: 'Agents rated low  greetings felt copy-paste and impersonal.',
      fix: 'Added loyalty category (Standard / Premium / VIP) and brand signature.', active: false,
    },
    {
      version: 'V2', label: 'Structured Template', gradient: 'from-orange-500 to-amber-500',
      problem: 'Format improved, but ignored preferred language and special notes.',
      ratingImpact: 'Non-English customers received English-only greetings  very low ratings.',
      fix: 'Added multilingual support (8 languages) and a special notes input field.', active: false,
    },
    {
      version: 'V3', label: 'Multilingual & Contextual', gradient: 'from-amber-500 to-yellow-400',
      problem: 'AI invented hotel check-in times, flight numbers, and tour schedules.',
      ratingImpact: 'Hallucinated facts caused customer confusion and complaint escalations.',
      fix: 'Introduced STRICT CONSTRAINTS block  zero hallucination policy enforced.', active: false,
    },
    {
      version: 'V4', label: 'Production-Grade (LIVE)', gradient: 'from-emerald-500 to-cyan-400',
      problem: null,
      ratingImpact: 'Tone-matched, language-native, loyalty-aware, zero hallucinations.',
      fix: 'Temperature 0.3  Max 500 tokens  3-retry exponential backoff  Fallback engine.', active: true,
    },
  ];"""
  
    content = content.replace(target_stages, replace_stages)
    io.open('frontend/src/App.jsx', 'w', encoding='utf-8').write(content)
    print("Patched UI mapping")
except Exception as e:
    print("Error:", e)
