const fs = require('fs');

let content = fs.readFileSync('frontend/src/App.jsx', 'utf8');

// 1. handleGenerate: Add Alert
const generateSearch = `setResultGreeting(generatedGreeting);
      loadGreetingsHistory();
    }
    setLoading(false);`;
const generateReplace = `setResultGreeting(generatedGreeting);
      loadGreetingsHistory();
      if (localStorage.getItem('settings_notifyGenerate') !== 'false') {
        setAlertMessage('AI Greeting generated successfully!');
      }
    }
    setLoading(false);`;
content = content.replace(generateSearch, generateReplace);

// 2. submitFeedback: Add Alert
const feedbackSearch1 = `saveFeedbackLocally(resultGreeting.id, rating, feedbackComments);
    } catch (e) {`;
const feedbackReplace1 = `saveFeedbackLocally(resultGreeting.id, rating, feedbackComments);
      if (localStorage.getItem('settings_notifyFeedback') !== 'false') {
        setAlertMessage('Feedback submitted successfully!');
      }
    } catch (e) {`;
content = content.replace(feedbackSearch1, feedbackReplace1);

const feedbackSearch2 = `saveFeedbackLocally(resultGreeting.id, rating, feedbackComments);
      setFeedbackSaved(true);
    }
  };`;
const feedbackReplace2 = `saveFeedbackLocally(resultGreeting.id, rating, feedbackComments);
      setFeedbackSaved(true);
      if (localStorage.getItem('settings_notifyFeedback') !== 'false') {
        setAlertMessage('Feedback saved locally!');
      }
    }
  };`;
content = content.replace(feedbackSearch2, feedbackReplace2);

// 3. Auto-save Form Inputs (useState)
const stateFields = [
  'name', 'destination', 'bookingHistory', 'travelType', 
  'preferredLanguage', 'customerCategory', 'specialNotes', 
  'travelDate', 'whatsappNumber'
];

stateFields.forEach(field => {
  // Replace useState
  const stateRegex = new RegExp(`const \\[${field}, set${field.charAt(0).toUpperCase() + field.slice(1)}\\] = useState\\(\\(\\) => localStorage\\.getItem\\('gen_${field}'\\) \\|\\| ('.*?')\\);`, 'g');
  const stateReplacement = `const [${field}, set${field.charAt(0).toUpperCase() + field.slice(1)}] = useState(() => (localStorage.getItem('settings_autoSave') !== 'false') ? (localStorage.getItem('gen_${field}') || $1) : $1);`;
  content = content.replace(stateRegex, stateReplacement);

  // Replace useEffect
  const effectRegex = new RegExp(`useEffect\\(\\(\\) => \\{\\s*localStorage\\.setItem\\('gen_${field}', ${field}\\);\\s*\\}, \\[${field}\\]\\);`, 'g');
  const effectReplacement = `useEffect(() => {\n    if (localStorage.getItem('settings_autoSave') !== 'false') localStorage.setItem('gen_${field}', ${field});\n  }, [${field}]);`;
  content = content.replace(effectRegex, effectReplacement);
});

// 4. Show WhatsApp Share Button (Modal Drawer)
const whatsappRegex1 = /\{\/\*\s*WhatsApp Send Button\s*\*\/\}\s*<button\s*type="button"\s*onClick=\{handleWhatsAppShare\}/g;
content = content.replace(whatsappRegex1, `{/* WhatsApp Send Button */}\n            {localStorage.getItem('settings_showWhatsapp') !== 'false' && (\n            <button\n              type="button"\n              onClick={handleWhatsAppShare}`);

// The modal button ends with:
//                 : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
//             }`}
//           >
//             <MessageCircle className="h-5 w-5" />
//             Send via WhatsApp
//           </button>
// Look for Send via WhatsApp\s*<\/button>
const whatsappEndRegex1 = /Send via WhatsApp\s*<\/button>/g;
content = content.replace(whatsappEndRegex1, `Send via WhatsApp\n            </button>\n            )}`);

// 5. Show WhatsApp Share Button (Inline History / Quick View)
const whatsappRegex2 = /<button onClick=\{handleWhatsAppShare\} title="Share WhatsApp" className="p-2\.5 bg-emerald-500\/10 text-emerald-400 hover:bg-emerald-500\/20 rounded-xl transition-colors flex items-center gap-2 font-semibold text-xs px-3">\s*<Share2 className="h-4 w-4" \/>\s*<span>Send<\/span>\s*<\/button>/g;
const whatsappReplace2 = `{localStorage.getItem('settings_showWhatsapp') !== 'false' && (\n                <button onClick={handleWhatsAppShare} title="Share WhatsApp" className="p-2.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-colors flex items-center gap-2 font-semibold text-xs px-3">\n                  <Share2 className="h-4 w-4" />\n                  <span>Send</span>\n                </button>\n                )}`;
content = content.replace(whatsappRegex2, whatsappReplace2);

fs.writeFileSync('frontend/src/App.jsx', content);
console.log("Settings successfully wired up!");
