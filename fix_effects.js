const fs = require('fs');

let content = fs.readFileSync('frontend/src/App.jsx', 'utf8');

// The incorrect line is:
// const cMode = localStorage.getItem('settings_compactMode') === 'true'; cMode ? root.classList.add('compact-mode') : root.classList.remove('compact-mode'); const anim = localStorage.getItem('settings_animations') !== 'false'; !anim ? root.classList.add('disable-animations') : root.classList.remove('disable-animations');

// I will just replace the WHOLE block in SettingsPage and Layout separately.
// For Layout:
let layoutRegex = /useEffect\(\(\) => \{\s*const root = window\.document\.documentElement;\s*theme === 'dark' \? root\.classList\.add\('dark'\) : root\.classList\.remove\('dark'\); const cMode = [^;]+; cMode \? [^;]+; const anim = [^;]+; !anim \? [^;]+;\s*localStorage\.setItem\('theme', theme\);\s*\}, \[theme\]\);/g;

let layoutReplacement = `useEffect(() => {
      const root = window.document.documentElement;
      theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
      const cMode = localStorage.getItem('settings_compactMode') === 'true';
      cMode ? root.classList.add('compact-mode') : root.classList.remove('compact-mode');
      const anim = localStorage.getItem('settings_animations') !== 'false';
      !anim ? root.classList.add('disable-animations') : root.classList.remove('disable-animations');
      localStorage.setItem('theme', theme);
    }, [theme]);`;

content = content.replace(layoutRegex, layoutReplacement);

// For SettingsPage:
let settingsRegex = /useEffect\(\(\) => \{\s*const root = window\.document\.documentElement;\s*theme === 'dark' \? root\.classList\.add\('dark'\) : root\.classList\.remove\('dark'\);\s*localStorage\.setItem\('theme', theme\);\s*const root2 = window\.document\.documentElement;\s*theme === 'dark' \? root2\.classList\.add\('dark'\) : root2\.classList\.remove\('dark'\); const cMode = [^;]+; cMode \? [^;]+; const anim = [^;]+; !anim \? [^;]+;\s*localStorage\.setItem\('settings_compactMode', compactMode\);\s*localStorage\.setItem\('settings_animations', animationsEnabled\);/g;

// Actually it looks like I messed up SettingsPage by inserting it weirdly?
// Let's just find the `localStorage.setItem('settings_compactMode', compactMode);` block.
