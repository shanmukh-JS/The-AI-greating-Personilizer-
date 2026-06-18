const fs = require('fs');

let content = fs.readFileSync('frontend/src/App.jsx', 'utf8');

// Find the exact string where the button ends and the next div starts:
const searchString = `                : 'Enter a WhatsApp number above to send'
              }
            </button>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">`;

const replaceString = `                : 'Enter a WhatsApp number above to send'
              }
            </button>
            )}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">`;

content = content.replace(searchString, replaceString);

fs.writeFileSync('frontend/src/App.jsx', content);
console.log('Fixed syntax error');
