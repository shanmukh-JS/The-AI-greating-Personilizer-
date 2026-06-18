const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.jsx', 'utf8');

const target1 = "const res = await api.get('/presets');";
const target3 = "localStorage.setItem('custom_presets', JSON.stringify(data));";

let start = code.indexOf(target1);
let end = code.indexOf(target3) + target3.length;

if (start !== -1 && end !== -1) {
    const replacement = `const res = await api.get('/presets');
      let dbPresets = res.data;
      const existingIds = dbPresets.map(p => p.id);
      let data = [...defaultPresetsList.filter(p => !existingIds.includes(p.id)), ...dbPresets];
      setPresets(data);
      localStorage.setItem('custom_presets', JSON.stringify(data));`;
    code = code.slice(0, start) + replacement + code.slice(end);
}

const targetCatch1 = 'let local = [];';
const targetCatch3 = 'setPresets(local);';

let start2 = code.indexOf(targetCatch1);
let end2 = code.indexOf(targetCatch3) + targetCatch3.length;

if (start2 !== -1 && end2 !== -1) {
    const replacement2 = `let local = [];
      try {
        local = JSON.parse(localStorage.getItem('custom_presets') || '[]');
      } catch (err) {
        local = [];
      }
      const localIds = local.map(p => p.id);
      let mergedLocal = [...defaultPresetsList.filter(p => !localIds.includes(p.id)), ...local];
      localStorage.setItem('custom_presets', JSON.stringify(mergedLocal));
      setPresets(mergedLocal);`;
    code = code.slice(0, start2) + replacement2 + code.slice(end2);
}

fs.writeFileSync('frontend/src/App.jsx', code);
console.log('Success');
