const fs = require('fs');
let current = fs.readFileSync('frontend/src/App.jsx', 'utf8');
let orig = fs.readFileSync('frontend/src/original_app.jsx', 'utf8');

// 1. Replace TemplatesManager
const origStart = orig.indexOf('function TemplatesManager() {');
const origEnd = orig.indexOf('// -------------------------------------------------------------', origStart);
const origTemplatesManager = orig.substring(origStart, origEnd).trim();

const curStart = current.indexOf('function TemplatesManager() {');
const curEnd = current.indexOf('function UserProfile() {', curStart);

if(origStart > -1 && curStart > -1) {
  current = current.substring(0, curStart) + origTemplatesManager + '\n\n' + current.substring(curEnd);
  console.log('Replaced TemplatesManager');
}

// 2. Add Load Preset Settings back to GreetingGenerator
const formIdx = current.indexOf('<form className="space-y-6">');
if (formIdx > -1) {
   const presetStart = orig.indexOf('{/* Template Quick Presets */}');
   const presetEnd = orig.indexOf('</div>\n        )}', presetStart) + 16;
   const presetJSX = orig.substring(presetStart, presetEnd);
   
   current = current.substring(0, formIdx + 28) + '\n        ' + presetJSX + '\n' + current.substring(formIdx + 28);
   console.log('Injected Preset JSX');
}

const presetStateStart = orig.indexOf('const [presets, setPresets] = useState');
const presetStateEnd = orig.indexOf('const applyCustomPreset = (preset) => {');
const presetApplyEnd = orig.indexOf('};', presetStateEnd) + 2;

const presetStateCode = orig.substring(presetStateStart, presetApplyEnd);

const generatorStart = current.indexOf('function GreetingGenerator() {');
const generatorBodyStart = current.indexOf('const [destination, setDestination]', generatorStart);

current = current.substring(0, generatorBodyStart) + 'const [showPresetModal, setShowPresetModal] = useState(false);\n  const [presetForm, setPresetForm] = useState({ label: \'\', emoji: \'✈️\', destination: \'\', travelType: \'Family Trip\', bookingHistory: \'1st Trip\', category: \'Standard\', language: \'English\', notes: \'\' });\n  ' + presetStateCode + '\n  ' + current.substring(generatorBodyStart);

// We also need `saveCustomPreset` and `deleteCustomPreset`!
const savePresetStart = orig.indexOf('const saveCustomPreset =');
const savePresetEnd = orig.indexOf('const deleteCustomPreset =');
const deletePresetEnd = orig.indexOf('const loadHistory =', savePresetEnd);

const presetActionsCode = orig.substring(savePresetStart, deletePresetEnd);

// inject right before `const handleGenerate = async`
const handleGenerateStart = current.indexOf('const handleGenerate = async');
current = current.substring(0, handleGenerateStart) + presetActionsCode + '\n  ' + current.substring(handleGenerateStart);

fs.writeFileSync('frontend/src/App.jsx', current);
console.log('Done');
