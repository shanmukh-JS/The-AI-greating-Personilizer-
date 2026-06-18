const fs = require('fs');
let content = fs.readFileSync('frontend/src/App.jsx', 'utf8');

// For Layout (around line 38):
// Look for: theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark'); const cMode = localStorage.getItem('settings_compactMode') === 'true'; cMode ? root.classList.add('compact-mode') : root.classList.remove('compact-mode'); const anim = localStorage.getItem('settings_animations') !== 'false'; !anim ? root.classList.add('disable-animations') : root.classList.remove('disable-animations');
// where it's followed by localStorage.setItem('theme', theme);
content = content.replace(
  /theme === 'dark' \? root\.classList\.add\('dark'\) : root\.classList\.remove\('dark'\); const cMode = localStorage\.getItem\('settings_compactMode'\) === 'true'; cMode \? root\.classList\.add\('compact-mode'\) : root\.classList\.remove\('compact-mode'\); const anim = localStorage\.getItem\('settings_animations'\) !== 'false'; !anim \? root\.classList\.add\('disable-animations'\) : root\.classList\.remove\('disable-animations'\);\s*localStorage\.setItem\('theme', theme\);/,
  `theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
      const cMode = localStorage.getItem('settings_compactMode') === 'true';
      cMode ? root.classList.add('compact-mode') : root.classList.remove('compact-mode');
      const anim = localStorage.getItem('settings_animations') !== 'false';
      !anim ? root.classList.add('disable-animations') : root.classList.remove('disable-animations');
      localStorage.setItem('theme', theme);`
);

// For SettingsPage (around line 3839):
// Look for: const root = window.document.documentElement; \n theme === 'dark' ? ... ; \n localStorage.setItem('settings_compactMode', compactMode);
content = content.replace(
  /const root = window\.document\.documentElement;\s*theme === 'dark' \? root\.classList\.add\('dark'\) : root\.classList\.remove\('dark'\); const cMode = localStorage\.getItem\('settings_compactMode'\) === 'true'; cMode \? root\.classList\.add\('compact-mode'\) : root\.classList\.remove\('compact-mode'\); const anim = localStorage\.getItem\('settings_animations'\) !== 'false'; !anim \? root\.classList\.add\('disable-animations'\) : root\.classList\.remove\('disable-animations'\);\s*localStorage\.setItem\('settings_compactMode', compactMode\);\s*localStorage\.setItem\('settings_animations', animationsEnabled\);/,
  `localStorage.setItem('settings_compactMode', compactMode);
      localStorage.setItem('settings_animations', animationsEnabled);
      const root = window.document.documentElement;
      theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
      compactMode ? root.classList.add('compact-mode') : root.classList.remove('compact-mode');
      !animationsEnabled ? root.classList.add('disable-animations') : root.classList.remove('disable-animations');`
);

fs.writeFileSync('frontend/src/App.jsx', content);
console.log('Fixed Effects');
