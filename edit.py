import sys, re
with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_str = r'        // Prompt evolution stages\s+const promptStages = \['
end_str = r'                </div>\s*</div>\s*</div>\s*</div>\s*\);\s*}\)\(\)}'
pattern1 = re.compile(start_str + r'.*?' + end_str, re.DOTALL)

replacement1 = '''        return (
          <div 
            onClick={() => navigate('/ai-feedback-loop')}
            className=\"cursor-pointer hover:scale-[1.01] hover:shadow-indigo-500/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 space-y-6 group transition-all\"
          >
            {/* Header */}
            <div className=\"flex items-center justify-between flex-wrap gap-3\">
              <div className=\"flex items-center gap-3\">
                <div className=\"h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all\">
                  <Sparkles className=\"h-4.5 w-4.5 text-white\" size={18} />
                </div>
                <div>
                  <h3 className=\"font-display font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors\">AI Feedback Loop</h3>
                  <p className=\"text-[10px] text-slate-500 dark:text-slate-400\">Click to view full feedback analysis dashboard</p>
                </div>
              </div>
              <div className=\"flex items-center gap-2\">
                <span className=\"h-2 w-2 rounded-full bg-emerald-500 animate-pulse\"></span>
                <span className=\"text-[10px] font-bold text-emerald-500 uppercase tracking-wider\">Live Quality Signal</span>
              </div>
            </div>

            {/* ── LIVE RATING DISTRIBUTION ── */}
            <div className=\"space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800/80\">
              <div className=\"flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-8\">
                <div className=\"flex flex-col items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-xl shadow-indigo-500/25 flex-shrink-0\">
                  <span className=\"text-3xl font-extrabold text-white leading-none\">{avgRating}</span>
                  <span className=\"text-[10px] text-indigo-100 font-bold uppercase mt-0.5\">Avg ★</span>
                </div>
                
                <div className=\"flex-1 flex flex-col gap-2\">
                  <div className=\"flex flex-col gap-1.5\">
                    <div className=\"flex items-center gap-2\">
                      <span className=\"h-2.5 w-2.5 rounded-full bg-emerald-500\"></span>
                      <span className=\"text-xs font-semibold text-slate-600 dark:text-slate-300\">{highCount} high-quality (4–5★) — prompt approved</span>
                    </div>
                    <div className=\"flex items-center gap-2\">
                      <span className=\"h-2.5 w-2.5 rounded-full bg-rose-500\"></span>
                      <span className=\"text-xs font-semibold text-slate-600 dark:text-slate-300\">{lowCount} flagged (1–2★) — triggered prompt review</span>
                    </div>
                    <div className=\"flex items-center gap-2\">
                      <span className=\"h-2.5 w-2.5 rounded-full bg-slate-400\"></span>
                      <span className=\"text-xs font-semibold text-slate-600 dark:text-slate-300\">{localFbs.length} total ratings collected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}'''

if not pattern1.search(content):
    print('Error: Widget pattern not found')
    sys.exit(1)
    
content = pattern1.sub(replacement1, content)

content = content.replace(
    '<div className=\"max-w-6xl mx-auto space-y-8 pb-12\">',
    '<div className=\"w-full mx-auto space-y-8 pb-12 px-2\">'
)

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Edits applied successfully.')
