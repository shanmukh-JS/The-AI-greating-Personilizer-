const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.jsx', 'utf8');

const targetStr = `            <div className="flex flex-wrap gap-2">
              {presets.map(preset => {
                let colorClasses = "bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border-violet-500/10";`;

const replacementStr = `            <div className="flex flex-wrap gap-2">
              {presetsLoading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                ))
              ) : presets.map(preset => {
                let colorClasses = "bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border-violet-500/10";`;

// Use indexOf to safely locate and replace the starting block
const startIdx = code.indexOf(targetStr);
if (startIdx !== -1) {
    code = code.slice(0, startIdx) + replacementStr + code.slice(startIdx + targetStr.length);
    
    // Now we need to find where the presets.map ends to close the ternary condition.
    // The presets.map block ends with:
    //                   </button>
    //                 </div>
    //               );
    //             })}
    //           </div>
    
    const targetEnd = `                </div>
              );
            })}
          </div>`;
          
    const replacementEnd = `                </div>
              );
            })}
          </div>`;
          
    // Actually, I don't need to change the end!
    // The ternary starts with: {presetsLoading ? (...) : presets.map(...)}
    // So the `}` that currently closes `presets.map(...)` will also close the ternary `{...}` block correctly.
    // Let's verify:
    // Original:
    // {presets.map(preset => { ... })}
    // New:
    // {presetsLoading ? (...) : presets.map(preset => { ... })}
    // The closing `)}` of map is exactly the same! The outer `{` and `}` enclose the ternary expression.
    // So I only need to change the opening!

    fs.writeFileSync('frontend/src/App.jsx', code);
    console.log('Success');
} else {
    // maybe try with \r\n
    const targetStrCRLF = targetStr.replace(/\n/g, '\r\n');
    const startIdxCRLF = code.indexOf(targetStrCRLF);
    if (startIdxCRLF !== -1) {
        const replacementStrCRLF = replacementStr.replace(/\n/g, '\r\n');
        code = code.slice(0, startIdxCRLF) + replacementStrCRLF + code.slice(startIdxCRLF + targetStrCRLF.length);
        fs.writeFileSync('frontend/src/App.jsx', code);
        console.log('Success (CRLF)');
    } else {
        console.log('Failed to find block');
    }
}
