import re
with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

def repl(m):
    return m.group(0).replace('h-[50px] px-4 py-0 leading-normal', 'px-4 py-4')

content = re.sub(r'<textarea[\s\S]*?/>', repl, content)

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
