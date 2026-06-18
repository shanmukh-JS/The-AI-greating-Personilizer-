const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'frontend', 'src', 'App.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the global setItems in handleUpdate
content = content.replace(
`          localStorage.setItem('profile_fullName', fullName);
          localStorage.setItem('profile_email', email);
          localStorage.setItem('profile_phone', phone);
          localStorage.setItem('profile_location', location);
          localStorage.setItem('profile_timezone', timezone);
          localStorage.setItem('profile_image', profileImage);`,
`          // Global overrides removed to prevent cross-contamination between roles`
);

// We need to do it for both try blocks (one is old offline save, one is the new try/catch wrapper)
content = content.replace(
`      localStorage.setItem('profile_fullName', fullName);
      localStorage.setItem('profile_email', email);
      localStorage.setItem('profile_phone', phone);
      localStorage.setItem('profile_location', location);
      localStorage.setItem('profile_timezone', timezone);
      localStorage.setItem('profile_image', profileImage);`,
`      // Global overrides removed to prevent cross-contamination`
);

// 2. Remove the global fallbacks in initUser and api user
content = content.replace(/\|\| localStorage\.getItem\('profile_image'\)/g, '');
content = content.replace(/\|\| localStorage\.getItem\('profile_location'\)/g, '');
content = content.replace(/\|\| localStorage\.getItem\('profile_phone'\)/g, '');
content = content.replace(/\|\| localStorage\.getItem\('profile_email'\)/g, '');

// Also inside the initial state of useState hooks in UserProfile:
// const [phone, setPhone] = useState(user?.phone || localStorage.getItem('profile_phone') || '');
content = content.replace(/\|\| localStorage\.getItem\('profile_phone'\) /g, '');
content = content.replace(/\|\| localStorage\.getItem\('profile_location'\) /g, '');

// For fullName:
// const [fullName, setFullName] = useState(() => localStorage.getItem('profile_fullName') || user?.username || '');
content = content.replace(/localStorage\.getItem\('profile_fullName'\) \|\| /g, '');

// For timezone:
// const [timezone, setTimezone] = useState(() => localStorage.getItem('profile_timezone') || 'UTC');
// It doesn't have a user specific key! We should change it to use user-specific timezone!
// Actually, it should be: user?.timezone || localStorage.getItem('profile_timezone_' + user?.username) || 'UTC'
content = content.replace(
  `const [timezone, setTimezone] = useState(() => localStorage.getItem('profile_timezone') || 'UTC');`,
  `const [timezone, setTimezone] = useState(() => localStorage.getItem('profile_timezone_' + user?.username) || 'UTC');`
);

// Make sure we didn't miss any others
content = content.replace(/\|\| apiUser\.profile_image \|\|/g, '|| apiUser.profile_image');
content = content.replace(/\|\| apiUser\.location \|\|/g, '|| apiUser.location');
content = content.replace(/\|\| apiUser\.phone \|\|/g, '|| apiUser.phone');
content = content.replace(/\|\| apiUser\.email \|\|/g, '|| apiUser.email');

content = content.replace(/\|\| decoded\.profile_image \|\|/g, '|| decoded.profile_image');
content = content.replace(/\|\| decoded\.location \|\|/g, '|| decoded.location');
content = content.replace(/\|\| decoded\.phone \|\|/g, '|| decoded.phone');
content = content.replace(/\|\| decoded\.email \|\|/g, '|| decoded.email');

fs.writeFileSync(file, content, 'utf8');
console.log("Global profile fallbacks removed.");
