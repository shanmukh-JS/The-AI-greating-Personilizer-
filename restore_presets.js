const fs = require('fs');

let current = fs.readFileSync('frontend/src/App.jsx', 'utf8');
let orig = fs.readFileSync('frontend/src/original_app.jsx', 'utf8');

const presetStateRegex = /const \[presets, setPresets\] = useState\(\[\]\);[\s\S]+?const applyCustomPreset = \([\s\S]+?setSpecialNotes[^\n]+\n  \};/;
const presetStateMatch = orig.match(presetStateRegex);

if (!presetStateMatch) {
  console.error("Could not find preset state in original app");
  process.exit(1);
}

// 1. Inject Preset state into GreetingGenerator
// Let's find "function GreetingGenerator() {" in current app.
current = current.replace(
  /function GreetingGenerator\(\) \{\n/,
  `function GreetingGenerator() {\n  const [showPresetModal, setShowPresetModal] = useState(false);\n  const [presetForm, setPresetForm] = useState({ label: '', emoji: '✈️', destination: '', travelType: 'Family Trip', bookingHistory: '1st Trip', category: 'Standard', language: 'English', notes: '' });\n\n  `
);

current = current.replace(
  /  const handleGenerate = async \(\) => {/,
  presetStateMatch[0] + '\n\n  const handleGenerate = async () => {'
);

// 2. Inject Preset UI into Generator Form
const presetUIRegex = /\{\/\* Template Quick Presets \*\/\}[\s\S]+?\{\/\* Main Output Card \*\/\}/;
const presetUIMatch = orig.match(presetUIRegex);

if (presetUIMatch) {
  // Replace the top part of current form
  // Find where to inject in current form. In current app, it starts with:
  // <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200
  // Or look for `{/* Form Section */}`
  
  // Actually, wait, presetUIMatch includes the <form> start. Let's just grab the Template Quick Presets block exactly.
  const preciseUI = orig.match(/\{\/\* Template Quick Presets \*\/\}[\s\S]+?\{\/\* Add Preset Modal \*\/\}[\s\S]+?<\/div>\n        \)\}/);
  if (preciseUI) {
     // inject right after `<form className="space-y-6">`
     current = current.replace(
        /<form className="space-y-6">/,
        `<form className="space-y-6">\n        ${preciseUI[0]}\n`
     );
  }
}

// 3. Fix Template Library functionality
// The user wants "Template Library need to be the old one only those past generated templates"
// I will REPLACE the `TemplatesManager` component with a copy of `HistoryLog` but styled as a template library!
// No, wait, in the old app, they had `TemplatesManager` which was a prompt editor, and `HistoryLog` for past.
// If they say "need to be the old one only those past generated templates", it means I should just replace `TemplatesManager` with `HistoryLog` basically, but maybe let's just use the exact old `TemplatesManager` logic! No wait! The OLD `TemplatesManager` DID NOT have past generated templates! 
// Let me look at the old TemplatesManager in original_app.jsx again. It had `subject_pattern` and `body_pattern`.
// Perhaps they literally mean they just want the old Templates Manager back! "Template Library need to be the old one" - okay, I will just extract the entire `TemplatesManager` from original_app.jsx and put it back in!
const oldTemplatesManager = orig.match(/function TemplatesManager\(\) \{[\s\S]+?\n\nfunction UserProfile/);
if (oldTemplatesManager) {
  // Replace current TemplatesManager
  current = current.replace(
    /function TemplatesManager\(\) \{[\s\S]+?(?=\n\nfunction UserProfile)/,
    oldTemplatesManager[0].replace(/\n\nfunction UserProfile$/, '')
  );
}

fs.writeFileSync('frontend/src/App.jsx', current);
console.log("Restored Presets and old TemplatesManager");
