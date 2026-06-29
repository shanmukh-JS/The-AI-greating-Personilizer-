import sys

with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state variable
content = content.replace(
    'const [isPageLoading, setIsPageLoading] = useState(true);',
    'const [isPageLoading, setIsPageLoading] = useState(true);\n  const [isRatingExpanded, setIsRatingExpanded] = useState(false);'
)

# 2. Modify Live Rating Distribution card to be clickable and add AnimatePresence
old_card = """          <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Live Rating Distribution</p>
            <div className="flex items-center gap-4">"""

new_card = """          <div 
            onClick={() => setIsRatingExpanded(!isRatingExpanded)}
            className="cursor-pointer bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10"
          >
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Live Rating Distribution</p>
              <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-full">{isRatingExpanded ? 'Hide Details' : 'Click to View Detailed Logs'}</span>
            </div>
            <div className="flex items-center gap-4">"""

content = content.replace(old_card, new_card)

# 3. Add the expandable content section at the bottom of the card, before the verdict
old_verdict = """              })}
            </div>
            <div className={`p-3 rounded-xl border text-[11px] font-semibold leading-relaxed ${verdict.color}`}>{verdict.text}</div>
          </div>"""

new_verdict = """              })}
            </div>
            
            <AnimatePresence>
              {isRatingExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-slate-200/50 dark:border-slate-700/50 space-y-4">
                    <p className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Rating Logic Breakdown & Recent Logs</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[5,4,3,2,1].map(star => {
                        const logs = localFbs.filter(f => f.rating === star).slice(0, 3);
                        if (logs.length === 0) return null;
                        
                        const colorClass = star >= 4 ? 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20' : star === 3 ? 'text-amber-500 bg-amber-500/5 border-amber-500/20' : 'text-rose-500 bg-rose-500/5 border-rose-500/20';
                        
                        return (
                          <div key={star} className={`p-3 rounded-2xl border ${colorClass}`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-extrabold text-sm">{star}★ Ratings</span>
                              <span className="text-[10px] font-bold opacity-80">{star >= 4 ? 'Excellent / Minor tweaks' : star === 3 ? 'Neutral / OK' : 'Flagged for Review'}</span>
                            </div>
                            <div className="space-y-2">
                              {logs.map((log, idx) => (
                                <div key={idx} className="bg-white/50 dark:bg-slate-950/50 p-2 rounded-xl text-[10px]">
                                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                                    <span>{log.customer_name}</span>
                                    <span>{log.destination}</span>
                                  </div>
                                  <p className="mt-1 text-slate-600 dark:text-slate-400 italic">"{log.greeting.substring(0, 50)}..."</p>
                                  {log.comments && <p className="mt-1 font-semibold text-rose-500 dark:text-rose-400">Feedback: {log.comments}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`p-3 rounded-xl border text-[11px] font-semibold leading-relaxed ${verdict.color}`}>{verdict.text}</div>
          </div>"""

content = content.replace(old_verdict, new_verdict)

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated App.jsx with expandable rating distribution")
