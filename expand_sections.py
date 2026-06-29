import re

with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add states
state_addition = """  const [isRatingExpanded, setIsRatingExpanded] = useState(false);
  const [is4StepsExpanded, setIs4StepsExpanded] = useState(false);
  const [isEvolutionExpanded, setIsEvolutionExpanded] = useState(false);
  const [isFlaggedExpanded, setIsFlaggedExpanded] = useState(false);
  const [isTechExpanded, setIsTechExpanded] = useState(false);"""

content = content.replace("  const [isRatingExpanded, setIsRatingExpanded] = useState(false);", state_addition)

def make_expandable(title_text, state_var, button_text_open, button_text_closed, content_chunk):
    return f"""<div 
            onClick={{() => setIs{state_var}Expanded(!is{state_var}Expanded)}}
            className="cursor-pointer bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10"
          >
            <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{title_text}</p>
              <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-full">{{is{state_var}Expanded ? '{button_text_open}' : '{button_text_closed}'}}</span>
            </div>
            <AnimatePresence>
              {{is{state_var}Expanded && (
                <motion.div
                  initial={{{{ height: 0, opacity: 0 }}}}
                  animate={{{{ height: 'auto', opacity: 1 }}}}
                  exit={{{{ height: 0, opacity: 0 }}}}
                  transition={{{{ duration: 0.3 }}}}
                  className="overflow-hidden"
                >
                  <div className="pt-2">
{content_chunk}
                  </div>
                </motion.div>
              )}}
            </AnimatePresence>
          </div>"""


# 2. Replace 4-STEP CYCLE
four_steps_old = """      {/* 4-STEP CYCLE */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4"
      >
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">How the Loop Works — 4 Steps</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <div key={s.num} className={`relative p-5 rounded-2xl bg-gradient-to-br ${s.color} border ${s.border} flex flex-col gap-3 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10`}>
              {i < 3 && (
                <div className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-400 text-xs font-bold shadow">→</div>
              )}
              <span className="text-3xl">{s.emoji}</span>
              <div>
                <span className={`text-[9px] font-extrabold uppercase tracking-widest ${s.badge}`}>Step {s.num}</span>
                <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{s.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>"""

four_steps_inner = """                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {steps.map((s, i) => (
                        <div key={s.num} className={`relative p-5 rounded-2xl bg-gradient-to-br ${s.color} border ${s.border} flex flex-col gap-3 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10`}>
                          {i < 3 && (
                            <div className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-400 text-xs font-bold shadow">→</div>
                          )}
                          <span className="text-3xl">{s.emoji}</span>
                          <div>
                            <span className={`text-[9px] font-extrabold uppercase tracking-widest ${s.badge}`}>Step {s.num}</span>
                            <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{s.title}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{s.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>"""

four_steps_new = """      {/* 4-STEP CYCLE */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
""" + make_expandable("How the Loop Works — 4 Steps", "4Steps", "Hide Steps", "Click to View Steps", four_steps_inner) + """
      </motion.div>"""

content = content.replace(four_steps_old, four_steps_new)

# 3. PROMPT EVOLUTION
prompt_evo_old = """        {/* PROMPT EVOLUTION TIMELINE */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4"
        >
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Prompt Evolution History</p>
          <div className="relative space-y-3 pl-7">
            <div className="absolute left-[18px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-red-400 via-amber-400 to-emerald-400 rounded-full opacity-40"></div>
            {promptStages.map((stage) => (
              <div key={stage.version} className={`relative flex gap-4 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg ${stage.active ? 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-emerald-500/10' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 hover:border-indigo-500/40 hover:shadow-indigo-500/10'}`}>
                <div className={`absolute -left-[24px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-gradient-to-br ${stage.gradient} border-2 border-white dark:border-slate-900 shadow-md`}></div>
                <div className={`flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br ${stage.gradient} flex items-center justify-center shadow`}>
                  <span className="text-[10px] font-extrabold text-white">{stage.version}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">{stage.label}</span>
                    {stage.active && <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">● LIVE</span>}
                  </div>
                  {stage.problem && <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1">❌ {stage.problem}</p>}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{stage.active ? `✅ ${stage.ratingImpact}` : `⭐ Rating impact: ${stage.ratingImpact}`}</p>
                  <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold mt-1">{stage.active ? `⚙️ ${stage.fix}` : `→ Fix: ${stage.fix}`}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>"""

prompt_evo_inner = """                    <div className="relative space-y-3 pl-7">
                      <div className="absolute left-[18px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-red-400 via-amber-400 to-emerald-400 rounded-full opacity-40"></div>
                      {promptStages.map((stage) => (
                        <div key={stage.version} className={`relative flex gap-4 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg ${stage.active ? 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-emerald-500/10' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 hover:border-indigo-500/40 hover:shadow-indigo-500/10'}`}>
                          <div className={`absolute -left-[24px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-gradient-to-br ${stage.gradient} border-2 border-white dark:border-slate-900 shadow-md`}></div>
                          <div className={`flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br ${stage.gradient} flex items-center justify-center shadow`}>
                            <span className="text-[10px] font-extrabold text-white">{stage.version}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-800 dark:text-white">{stage.label}</span>
                              {stage.active && <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">● LIVE</span>}
                            </div>
                            {stage.problem && <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1">❌ {stage.problem}</p>}
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{stage.active ? `✅ ${stage.ratingImpact}` : `⭐ Rating impact: ${stage.ratingImpact}`}</p>
                            <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold mt-1">{stage.active ? `⚙️ ${stage.fix}` : `→ Fix: ${stage.fix}`}</p>
                          </div>
                        </div>
                      ))}
                    </div>"""

prompt_evo_new = """        {/* PROMPT EVOLUTION TIMELINE */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
""" + make_expandable("Prompt Evolution History", "Evolution", "Hide History", "Click to View History", prompt_evo_inner) + """
        </motion.div>"""

content = content.replace(prompt_evo_old, prompt_evo_new)

# 4. FLAGGED GREETINGS
flagged_old = """          {/* Flagged greetings */}
          <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Flagged Low-Rated Greetings (1–2★)</p>
            {flagged.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle size={28} className="text-emerald-400 mb-2" />
                <p className="text-sm font-semibold text-slate-400">No low-rated greetings</p>
                <p className="text-xs text-slate-400/70 mt-1">All ratings are 3★ or above — great quality!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {flagged.map((fb, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 transition-all duration-300 hover:scale-[1.02] hover:bg-rose-500/10 hover:border-rose-500/40 hover:shadow-lg hover:shadow-rose-500/10">
                    <div className="h-8 w-8 rounded-full bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-extrabold text-rose-500">{fb.rating}★</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{fb.customer_name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{fb.destination} · {fb.language}</p>
                    </div>
                    {fb.comments && <p className="text-[10px] text-rose-500 italic truncate max-w-[120px]">"{fb.comments}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>"""

flagged_inner = """                    {flagged.length === 0 ? (
                      <div className="flex flex-col items-center py-8 text-center">
                        <CheckCircle size={28} className="text-emerald-400 mb-2" />
                        <p className="text-sm font-semibold text-slate-400">No low-rated greetings</p>
                        <p className="text-xs text-slate-400/70 mt-1">All ratings are 3★ or above — great quality!</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {flagged.map((fb, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 transition-all duration-300 hover:scale-[1.02] hover:bg-rose-500/10 hover:border-rose-500/40 hover:shadow-lg hover:shadow-rose-500/10">
                            <div className="h-8 w-8 rounded-full bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-extrabold text-rose-500">{fb.rating}★</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{fb.customer_name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{fb.destination} · {fb.language}</p>
                            </div>
                            {fb.comments && <p className="text-[10px] text-rose-500 italic truncate max-w-[120px]">"{fb.comments}"</p>}
                          </div>
                        ))}
                      </div>
                    )}"""

flagged_new = """          {/* Flagged greetings */}
""" + make_expandable("Flagged Low-Rated Greetings (1–2★)", "Flagged", "Hide Flagged", "Click to View Flagged", flagged_inner)

content = content.replace(flagged_old, flagged_new)

# 5. TECHNICAL DETAIL (HOW THE AI USES IT)
tech_old = """      {/* HOW THE AI USES IT — Technical Detail */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-slate-400" />
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">How the AI Uses Your Ratings — Technical Detail</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40 flex flex-col gap-2 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10">
            <span className="text-xs font-extrabold text-slate-800 dark:text-white">1. Context Injection</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Recent low-rated greetings (1-2★) are injected into the system prompt as negative examples. High-rated (4-5★) are injected as few-shot positive examples.</p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40 flex flex-col gap-2 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10">
            <span className="text-xs font-extrabold text-slate-800 dark:text-white">2. Semantic Search</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Before generating, the AI searches past feedback for similar customer profiles (e.g. "Families traveling to Goa") to avoid repeating past mistakes.</p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40 flex flex-col gap-2 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10">
            <span className="text-xs font-extrabold text-slate-800 dark:text-white">3. Self-Correction Loop</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">If the new output closely matches a previously flagged greeting, the generation halts and retries with a higher temperature to break out of the bad pattern.</p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40 flex flex-col gap-2 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10">
            <span className="text-xs font-extrabold text-slate-800 dark:text-white">4. Tone Consistency Enforcement</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Loyalty tier guidelines (Standard vs VIP) are cross-referenced with past ratings to ensure the vocabulary aligns with the brand's premium standard.</p>
          </div>
        </div>
      </motion.div>"""

tech_inner = """                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40 flex flex-col gap-2 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">1. Context Injection</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Recent low-rated greetings (1-2★) are injected into the system prompt as negative examples. High-rated (4-5★) are injected as few-shot positive examples.</p>
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40 flex flex-col gap-2 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">2. Semantic Search</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Before generating, the AI searches past feedback for similar customer profiles (e.g. "Families traveling to Goa") to avoid repeating past mistakes.</p>
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40 flex flex-col gap-2 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">3. Self-Correction Loop</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">If the new output closely matches a previously flagged greeting, the generation halts and retries with a higher temperature to break out of the bad pattern.</p>
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40 flex flex-col gap-2 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">4. Tone Consistency Enforcement</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Loyalty tier guidelines (Standard vs VIP) are cross-referenced with past ratings to ensure the vocabulary aligns with the brand's premium standard.</p>
                      </div>
                    </div>"""

tech_new = """      {/* HOW THE AI USES IT — Technical Detail */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
""" + make_expandable("How the AI Uses Your Ratings — Technical Detail", "Tech", "Hide Tech Details", "Click to View Tech Details", tech_inner) + """
      </motion.div>"""

content = content.replace(tech_old, tech_new)

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
