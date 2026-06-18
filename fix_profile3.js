const fs = require('fs');

let content = fs.readFileSync('frontend/src/App.jsx', 'utf8');

// 1. Update initUser
content = content.replace(
  /email: username === 'NIAT x AURORA' \? 'niatxaurora@manivthatravels.com' : `\$\{username\}@manivthatravels.com`\s*\};/,
  `email: username === 'NIAT x AURORA' ? 'niatxaurora@manivthatravels.com' : \`\${username}@manivthatravels.com\`,
              profile_image: localStorage.getItem('profile_image'),
              location: localStorage.getItem('profile_location')
            };`
);

// 2. Update login fallback validation
content = content.replace(
  /const customAgentPassword = localStorage\.getItem\('custom_password_agent'\);\s*const customAdminPassword = localStorage\.getItem\('custom_password_admin'\);\s*const isValidAgent = username === 'agent' && \(password === \(customAgentPassword \|\| 'password123'\) \|\| password === 'ManivthaTravels2026!'\);\s*const isValidAdmin = username === 'admin' && \(password === \(customAdminPassword \|\| 'password123'\) \|\| password === 'ManivthaTravels2026!'\);\s*const isValidNiatAurora = username === 'NIAT x AURORA' && password === 'nxtwave@2026';/,
  `const customAgentPassword = localStorage.getItem('custom_password_agent');
      const customAdminPassword = localStorage.getItem('custom_password_admin');
      const customNiatPassword = localStorage.getItem('custom_password_NIAT x AURORA');
      const isValidAgent = username === 'agent' && password === (customAgentPassword || 'password123');
      const isValidAdmin = username === 'admin' && password === (customAdminPassword || 'password123');
      const isValidNiatAurora = username === 'NIAT x AURORA' && password === (customNiatPassword || 'nxtwave@2026');`
);

// 3. Update error message
content = content.replace(
  /setError\("Invalid username or password\."\);/g,
  `setError("Wrong credentials detected.");`
);

// 4. Update handleQuickDemo
content = content.replace(
  /const handleQuickDemo = \(u, p\) => \{\s*setUsername\(u\);\s*setPassword\(p\);\s*\};/,
  `const handleQuickDemo = (u, p) => {
    const custom = localStorage.getItem('custom_password_' + u);
    setUsername(u);
    setPassword(custom || p);
  };`
);

// 5. Update Header Avatar
content = content.replace(
  /<div className="h-8 w-8 rounded-full bg-indigo-500\/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs select-none ring-2 ring-indigo-500\/20">\s*\{user\?.username\?.substring\(0, 2\)\.toUpperCase\(\)\}\s*<\/div>/,
  `<div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs select-none ring-2 ring-indigo-500/20 overflow-hidden">
                {user?.profile_image ? (
                  <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.username?.substring(0, 2).toUpperCase()
                )}
              </div>`
);

fs.writeFileSync('frontend/src/App.jsx', content);
console.log('Successfully patched App.jsx');
