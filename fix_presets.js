const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.jsx', 'utf8');

// Replace question mark emojis with correct emojis
code = code.replace(/emoji: "\?\?"/g, 'emoji: "🗺️"');
code = code.replace(/emoji: "\?\?\?"/g, 'emoji: "🏝️"');

// Modify initialization logic to always populate if array is empty
code = code.replace(
  /if \(local\.length === 0 && !localStorage\.getItem\('custom_presets_initialized'\)\) \{/g,
  'if (local.length === 0) {'
);

fs.writeFileSync('frontend/src/App.jsx', code);
