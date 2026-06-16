const fs = require('fs');
const path = require('path');

const appJsxPath = path.join(__dirname, 'frontend', 'src', 'App.jsx');
let content = fs.readFileSync(appJsxPath, 'utf8');

// Reverse replacements
const replacements = [
  { from: /p-8 glass-panel-light/g, to: "p-6 glass-panel-light" }, // Revert p-8 to p-6
  { from: /glass-panel-light dark:glass-panel/g, to: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" },
  { from: /bg-luxury-midnight/g, to: "bg-slate-950" },
  { from: /bg-luxury-charcoal/g, to: "bg-slate-900" },
  
  // Revert buttons
  { from: /bg-luxury-gold text-luxury-midnight btn-hover border border-luxury-goldLight\/50/g, to: "bg-indigo-600" },
  { from: /hover:bg-luxury-goldLight/g, to: "hover:bg-indigo-500" },
  { from: /text-luxury-gold/g, to: "text-indigo-400" }, // Note: some were text-indigo-500, but text-indigo-400 is fine for most
  
  // Wait, I replaced text-indigo-500 with text-luxury-gold. I can't know which was 500 or 400. Let's just use text-indigo-500 for general text?
  // Let's use text-indigo-500 for bg-indigo-500/10 text-indigo-500, wait originally it was text-indigo-400 or 500.
  
  { from: /bg-luxury-gold\/10/g, to: "bg-indigo-500/10" },
  { from: /bg-luxury-gold\/20/g, to: "bg-indigo-500/20" },
  { from: /border-luxury-gold/g, to: "border-indigo-500" },
  { from: /ring-luxury-gold/g, to: "ring-indigo-500" },
  { from: /shadow-luxury-gold/g, to: "shadow-indigo-500" },
  { from: /font-serif/g, to: "font-display" },
  
  // Revert script 2
  { from: /border-black\/5 dark:border-white\/5/g, to: "border border-slate-200 dark:border-slate-800" },
  { from: /bg-black\/5 dark:bg-white\/5 backdrop-blur-sm/g, to: "bg-slate-50 dark:bg-slate-950" },
  { from: /dark:bg-black\/20/g, to: "dark:bg-slate-950" },
  { from: /text-slate-600 dark:text-slate-400 font-medium/g, to: "text-slate-500 dark:text-slate-400" },
  { from: /border-white\/5/g, to: "border-slate-800" },
  { from: /border-black\/5/g, to: "border-slate-200" },
];

replacements.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

// Fix specific known text-indigo instances from original
content = content.replace(/text-indigo-400/g, "text-indigo-500");
content = content.replace(/text-indigo-500 font-mono/g, "text-indigo-400 font-mono");
content = content.replace(/text-indigo-500 border border-indigo-500\/20/g, "text-indigo-400 border border-indigo-500/20");
content = content.replace(/text-indigo-500 text-sm/g, "text-indigo-400 text-sm"); // Not sure, but text-indigo-500 is safer.

fs.writeFileSync(appJsxPath, content);
console.log('App.jsx reverted.');
