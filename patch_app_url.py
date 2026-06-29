import io

try:
    content = io.open('frontend/src/App.jsx', 'r', encoding='utf-8').read()
    
    target = "const phRes = await api.get('/api/prompt-history');"
    replace = "const phRes = await api.get('/prompt-history');"
    
    content = content.replace(target, replace)
    
    io.open('frontend/src/App.jsx', 'w', encoding='utf-8').write(content)
    print("Fixed API URL double /api")
except Exception as e:
    print("Error:", e)
