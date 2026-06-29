import re

with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

grid_start = '<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">'
if grid_start in content:
    content = content.replace(grid_start, '<div className="columns-1 lg:columns-2 gap-6 [&>div]:break-inside-avoid [&>div]:mb-6">')
else:
    print("Could not find grid start")

old_wrapper = """        {/* LIVE RATING + FLAGGED */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >"""

new_wrapper = """        {/* LIVE RATING */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full"
        >"""

if old_wrapper in content:
    content = content.replace(old_wrapper, new_wrapper)
else:
    print("Could not find old_wrapper")

flagged_start = """          {/* Flagged greetings */}"""
new_flagged_start = """        </motion.div>

        {/* FLAGGED GREETINGS */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="w-full"
        >"""

if flagged_start in content:
    content = content.replace(flagged_start, new_flagged_start)
else:
    print("Could not find flagged_start")

old_grid_end = """        </motion.div>
      </div>

      {/* HOW THE AI USES IT — Technical Detail */}"""

new_grid_end = """        </motion.div>

      {/* HOW THE AI USES IT — Technical Detail */}"""

if old_grid_end in content:
    content = content.replace(old_grid_end, new_grid_end)
else:
    print("Could not find old_grid_end")

old_end = """      </motion.div>

    </motion.div>
  );
}"""

new_end = """      </motion.div>

      </div> {/* End of masonry columns */}

    </motion.div>
  );
}"""

if old_end in content:
    content = content.replace(old_end, new_end)
else:
    print("Could not find old_end")

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
