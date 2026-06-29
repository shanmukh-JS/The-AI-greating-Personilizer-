import io

try:
    content = io.open('frontend/src/App.jsx', 'r', encoding='utf-8').read()
    
    parts1 = content.split('const promptStages = [')
    if len(parts1) < 2:
        print("Could not split promptStages start")
        exit(1)
        
    parts2 = parts1[1].split('];\n\n  const steps = [')
    if len(parts2) < 2:
        print("Could not split promptStages end")
        # Try another split
        parts2 = parts1[1].split('  ];\n\n')
        
    
    replace_stages = """const gradients = ['from-red-500 to-orange-500', 'from-orange-500 to-amber-500', 'from-amber-500 to-yellow-400', 'from-emerald-500 to-cyan-400', 'from-indigo-500 to-purple-500', 'from-pink-500 to-rose-500'];
  const dbStages = (metrics?.promptHistory || []).map((dbItem, index) => ({
    version: dbItem.version_name,
    label: dbItem.title,
    gradient: gradients[index % gradients.length],
    problem: dbItem.issues || null,
    ratingImpact: dbItem.rating_impact || '',
    fix: dbItem.fix_description || '',
    active: dbItem.is_live
  }));

  const promptStages = dbStages.length ? dbStages : [""" + parts2[0] + "];\n\n  const steps = [" + parts2[1]

    final_content = parts1[0] + replace_stages
    
    io.open('frontend/src/App.jsx', 'w', encoding='utf-8').write(final_content)
    print("Patched promptStages using split method")
except Exception as e:
    print("Error:", e)
