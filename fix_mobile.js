const fs = require('fs');
const path = require('path');

const appJsxPath = path.join(__dirname, 'frontend', 'src', 'App.jsx');
let content = fs.readFileSync(appJsxPath, 'utf8');

// Fix border classes
content = content.replace(/border border border-slate-200/g, 'border border-slate-200');
content = content.replace(/border border border-slate-800/g, 'border border-slate-800');
content = content.replace(/border border-r border-slate-200/g, 'border-r border-slate-200');
content = content.replace(/border-r border border-slate-200/g, 'border-r border-slate-200');
content = content.replace(/border-b border border-slate-200/g, 'border-b border-slate-200');
content = content.replace(/border-t border border-slate-200/g, 'border-t border-slate-200');

// Add Mobile Sidebar Overlay
const overlay = `
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar Panel */}
`;

content = content.replace(/{[\s\S]*?\/\* Sidebar Panel \*\//, overlay.trim() + '\n      {/* Sidebar Panel */');

// Add some extra responsiveness to History Log table padding on mobile
content = content.replace(/className="p-4"/g, 'className="p-3 md:p-4"');
content = content.replace(/className="p-4 text-right"/g, 'className="p-3 md:p-4 text-right"');
content = content.replace(/className="p-4 text-xs text-slate-500"/g, 'className="p-3 md:p-4 text-xs text-slate-500"');
content = content.replace(/className="p-4 font-semibold text-slate-900 dark:text-white"/g, 'className="p-3 md:p-4 font-semibold text-slate-900 dark:text-white"');

fs.writeFileSync(appJsxPath, content);
console.log('Mobile layout and borders fixed.');
