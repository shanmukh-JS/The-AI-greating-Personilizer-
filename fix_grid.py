with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_wrapper = 'className="columns-1 lg:columns-2 gap-6 [&>div]:break-inside-avoid [&>div]:mb-6"'
new_wrapper = 'className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"'
content = content.replace(old_wrapper, new_wrapper)

content = content.replace('{/* PROMPT EVOLUTION TIMELINE */}', '<div className="flex flex-col gap-6">\n        {/* PROMPT EVOLUTION TIMELINE */}')
content = content.replace('{/* FLAGGED GREETINGS */}', '</div>\n\n        <div className="flex flex-col gap-6">\n        {/* FLAGGED GREETINGS */}')
content = content.replace('{/* End of masonry columns */}', '</div>\n      {/* End of masonry columns */}')

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed grid!")
