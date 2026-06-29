with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add margin bottom
# Find LIVE RATING block
idx = content.find('{/* LIVE RATING */}')
if idx != -1:
    class_idx = content.find('className="w-full"', idx)
    if class_idx != -1 and class_idx < idx + 500:
        content = content[:class_idx] + 'className="w-full mb-6"' + content[class_idx + len('className="w-full"'):]

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added mb-6")
