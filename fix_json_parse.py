import re

with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

safe_func = """
const safeParseLocal = (key, defaultVal) => {
  try {
    const val = localStorage.getItem(key);
    if (!val || val === 'undefined') return defaultVal;
    return JSON.parse(val);
  } catch (e) {
    console.error('Error parsing local storage for key:', key, e);
    return defaultVal;
  }
};
"""

import_end = content.find('import ')
if import_end != -1:
    last_import = content.rfind('import ', 0, content.find('function App()'))
    last_import_end = content.find('\n', last_import) + 1
    content = content[:last_import_end] + safe_func + content[last_import_end:]

content = re.sub(r"JSON\.parse\(localStorage\.getItem\((.*?)\)\s*\|\|\s*'\[\]'\)", r"safeParseLocal(\1, [])", content)
content = re.sub(r"JSON\.parse\(localStorage\.getItem\((.*?)\)\s*\|\|\s*'\{\}'\)", r"safeParseLocal(\1, {})", content)

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced and saved!")
