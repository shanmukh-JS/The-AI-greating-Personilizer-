import io

try:
    content = io.open('frontend/src/App.jsx', 'r', encoding='utf-8').read()
    content = content.replace("timeout: 1000", "timeout: 15000")
    io.open('frontend/src/App.jsx', 'w', encoding='utf-8').write(content)
    print("Updated Axios timeout in App.jsx to 15 seconds")
except Exception as e:
    print("Error:", e)
