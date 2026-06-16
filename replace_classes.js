const fs = require('fs');
const path = require('path');

const appJsxPath = path.join(__dirname, 'frontend', 'src', 'App.jsx');
let content = fs.readFileSync(appJsxPath, 'utf8');

// Replacements
const replacements = [
  { from: /bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/g, to: "glass-panel-light dark:glass-panel" },
  { from: /bg-slate-950/g, to: "bg-luxury-midnight" },
  { from: /bg-slate-900/g, to: "bg-luxury-charcoal" },
  { from: /border-slate-800/g, to: "border-white/5" },
  { from: /border-slate-200/g, to: "border-black/5" },
  { from: /bg-indigo-600/g, to: "bg-luxury-gold text-luxury-midnight btn-hover border border-luxury-goldLight/50" },
  { from: /hover:bg-indigo-500/g, to: "hover:bg-luxury-goldLight" },
  { from: /text-indigo-500/g, to: "text-luxury-gold" },
  { from: /text-indigo-400/g, to: "text-luxury-gold" },
  { from: /bg-indigo-500\/10/g, to: "bg-luxury-gold/10" },
  { from: /bg-indigo-500\/20/g, to: "bg-luxury-gold/20" },
  { from: /border-indigo-500/g, to: "border-luxury-gold" },
  { from: /ring-indigo-500/g, to: "ring-luxury-gold" },
  { from: /shadow-indigo-500/g, to: "shadow-luxury-gold" },
  { from: /font-display/g, to: "font-serif" },
  { from: /text-emerald-500/g, to: "text-emerald-400" }, // Keep some emerald but maybe lighter
];

replacements.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

fs.writeFileSync(appJsxPath, content);
console.log('App.jsx updated with luxury classes.');
