import re

with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix textareas: Find all <textarea... h-[50px] px-4 py-0 leading-normal... and replace with px-4 py-3
def textarea_replacer(match):
    tag_content = match.group(0)
    tag_content = tag_content.replace('h-[50px] px-4 py-0 leading-normal', 'px-4 py-3')
    return tag_content

content = re.sub(r'<textarea[^>]+>', textarea_replacer, content)

# 2. Change initial state of expandable sections in AIFeedbackLoopPage
content = content.replace('const [isRatingExpanded, setIsRatingExpanded] = useState(false);', 'const [isRatingExpanded, setIsRatingExpanded] = useState(true);')
content = content.replace('const [is4StepsExpanded, setIs4StepsExpanded] = useState(false);', 'const [is4StepsExpanded, setIs4StepsExpanded] = useState(true);')
content = content.replace('const [isEvolutionExpanded, setIsEvolutionExpanded] = useState(false);', 'const [isEvolutionExpanded, setIsEvolutionExpanded] = useState(true);')
content = content.replace('const [isFlaggedExpanded, setIsFlaggedExpanded] = useState(false);', 'const [isFlaggedExpanded, setIsFlaggedExpanded] = useState(true);')
content = content.replace('const [isTechExpanded, setIsTechExpanded] = useState(false);', 'const [isTechExpanded, setIsTechExpanded] = useState(true);')

# 3. Move LIVE RATING DISTRIBUTION
# The comment is `{/* LIVE RATING */}` according to my previous findings, let's verify.
# Wait, I previously found `{/* LIVE RATING */}` but earlier grep output:
# `{/* PROMPT EVOLUTION TIMELINE */}`
# `{/* LIVE RATING */}`
# `{/* FLAGGED GREETINGS */}`
# `{/* HOW THE AI USES IT \u2014 Technical Detail */}`
# Let's extract between `{/* LIVE RATING */}` and `{/* FLAGGED GREETINGS */}`

start_marker = '{/* LIVE RATING */}'
end_marker = '</div>\n\n        <div className="flex flex-col gap-6">\n        {/* FLAGGED GREETINGS */}'

live_rating_idx = content.find(start_marker)
close_idx = content.find(end_marker, live_rating_idx)

if live_rating_idx != -1 and close_idx != -1:
    live_rating_block = content[live_rating_idx:close_idx]
    
    # Remove it from the current position
    content = content[:live_rating_idx] + content[close_idx:]
    
    # Now insert it before the grid
    grid_marker = '<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">'
    grid_idx = content.find(grid_marker)
    
    if grid_idx != -1:
        # Wrap the live rating block in a div that makes it full width and mb-6 for spacing
        content = content[:grid_idx] + live_rating_block + '\n      ' + content[grid_idx:]

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done!")
