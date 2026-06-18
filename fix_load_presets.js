const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.jsx', 'utf8');

const target1 = "const res = await api.get('/presets');";
const target2 = "setPresets(res.data);";
const target3 = "localStorage.setItem('custom_presets', JSON.stringify(res.data));";

let start = code.indexOf(target1);
let end = code.indexOf(target3) + target3.length;

if (start !== -1 && end !== -1) {
    const replacement = `const res = await api.get('/presets');
      let data = res.data;
      if (data.length === 0) {
        data = [...defaultPresetsList];
      }
      setPresets(data);
      localStorage.setItem('custom_presets', JSON.stringify(data));`;
    code = code.slice(0, start) + replacement + code.slice(end);
    fs.writeFileSync('frontend/src/App.jsx', code);
    console.log('Success');
} else {
    console.log('Failed to find exact block');
}
