const fs = require('fs');
const path = require('path');

const appJsxPath = path.join(__dirname, 'frontend', 'src', 'App.jsx');
let content = fs.readFileSync(appJsxPath, 'utf8');

// Replacements
const replacements = [
  { from: /p-6 glass-panel-light/g, to: "p-8 glass-panel-light" },
  { from: /border border-slate-200 dark:border-white\/5/g, to: "border-black/5 dark:border-white/5" },
  { from: /bg-slate-50 dark:bg-luxury-midnight/g, to: "bg-black/5 dark:bg-white/5 backdrop-blur-sm" },
  { from: /dark:bg-slate-950/g, to: "dark:bg-black/20" },
  { from: /text-slate-500 dark:text-slate-400/g, to: "text-slate-600 dark:text-slate-400 font-medium" },
  { from: /text-indigo-400/g, to: "text-luxury-gold" },
];

replacements.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

fs.writeFileSync(appJsxPath, content);
console.log('App.jsx updated with more luxury classes.');
