with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<TrendingUp, Settings2 className="h-7 w-7 text-white" />', '<TrendingUp className="h-7 w-7 text-white" />')

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed!")
