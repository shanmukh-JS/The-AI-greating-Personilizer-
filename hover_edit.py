import sys

with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 4-STEP CYCLE cards
content = content.replace(
    'className={`relative p-5 rounded-2xl bg-gradient-to-br ${s.color} border ${s.border} flex flex-col gap-3`}',
    'className={`relative p-5 rounded-2xl bg-gradient-to-br ${s.color} border ${s.border} flex flex-col gap-3 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10`}'
)

# 2. Prompt Evolution Timeline cards
content = content.replace(
    'className={`relative flex gap-4 p-4 rounded-2xl border transition-all ${stage.active ? \'bg-emerald-500/5 border-emerald-500/20\' : \'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800\'}`}',
    'className={`relative flex gap-4 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg ${stage.active ? \'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-emerald-500/10\' : \'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 hover:border-indigo-500/40 hover:shadow-indigo-500/10\'}`}'
)

# 3. Flagged Low-Rated Greetings rows
content = content.replace(
    'className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/15"',
    'className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 transition-all duration-300 hover:scale-[1.02] hover:bg-rose-500/10 hover:border-rose-500/40 hover:shadow-lg hover:shadow-rose-500/10"'
)

# 4. How the AI Uses Your Ratings cards
content = content.replace(
    'className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-indigo-500/10"',
    'className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-indigo-500/10 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10"'
)

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Applied hover states successfully")
