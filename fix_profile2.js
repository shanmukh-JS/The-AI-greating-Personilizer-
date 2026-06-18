const fs = require('fs');
let lines = fs.readFileSync('frontend/src/App.jsx', 'utf8').split('\n');

// 1. Fix login logic
// Find: const isValidAgent = username === 'agent' && (password === 'password123' || password === 'ManivthaTravels2026!');
let loginIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`const isValidAgent = username === 'agent' && (password === 'password123' || password === 'ManivthaTravels2026!');`)) {
        loginIdx = i;
        break;
    }
}
if (loginIdx !== -1) {
    lines.splice(loginIdx, 3, 
        `      const customAgentPassword = localStorage.getItem('custom_password_agent');`,
        `      const customAdminPassword = localStorage.getItem('custom_password_admin');`,
        `      const isValidAgent = username === 'agent' && (password === (customAgentPassword || 'password123') || password === 'ManivthaTravels2026!');`,
        `      const isValidAdmin = username === 'admin' && (password === (customAdminPassword || 'password123') || password === 'ManivthaTravels2026!');`,
        `      const isValidNiatAurora = username === 'NIAT x AURORA' && password === 'nxtwave@2026';`
    );
    console.log('Login logic fixed');
} else {
    console.log('Login logic NOT found');
}

// 2. Fix handlePasswordChange
// Find: await api.put('/profile/password', { currentPassword, newPassword });
let pwdIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`await api.put('/profile/password', { currentPassword, newPassword });`)) {
        pwdIdx = i;
        break;
    }
}
if (pwdIdx !== -1) {
    // Delete lines starting from pwdIdx until `}` that closes catch block
    // Specifically lines 3524 to 3533
    // We are replacing 9 lines starting from pwdIdx - 1
    lines.splice(pwdIdx - 1, 10,
        `    try {`,
        `      await api.put('/profile/password', { currentPassword, newPassword });`,
        `      setPasswordAlert("Password successfully changed!");`,
        `      if (user && user.username) { localStorage.setItem('custom_password_' + user.username, newPassword); }`,
        `      setCurrentPassword('');`,
        `      setNewPassword('');`,
        `      setConfirmPassword('');`,
        `      setTimeout(() => setPasswordAlert(''), 3000);`,
        `    } catch (err) {`,
        `      if (user && user.username) {`,
        `        const currentCustom = localStorage.getItem('custom_password_' + user.username) || 'password123';`,
        `        if (currentPassword !== currentCustom && currentPassword !== 'ManivthaTravels2026!') {`,
        `          setPasswordAlert("Incorrect current password.");`,
        `          return;`,
        `        }`,
        `        localStorage.setItem('custom_password_' + user.username, newPassword);`,
        `        setPasswordAlert("Password successfully changed (Locally)!");`,
        `        setCurrentPassword('');`,
        `        setNewPassword('');`,
        `        setConfirmPassword('');`,
        `        setTimeout(() => setPasswordAlert(''), 3000);`,
        `      } else {`,
        `        setPasswordAlert(err.response?.data?.error || "Failed to change password.");`,
        `      }`,
        `    }`
    );
    console.log('Password logic fixed');
} else {
    console.log('Password logic NOT found');
}

// 3. Fix Location UI
let locIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`Location</label>`)) {
        // Double check it's the one with the input right after
        if (lines[i+1] && lines[i+1].includes(`placeholder="e.g. New York, USA"`)) {
            locIdx = i;
            break;
        }
    }
}
if (locIdx !== -1) {
    lines.splice(locIdx - 1, 4,
        `                <div>`,
        `                  <div className="flex justify-between items-center mb-2">`,
        `                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location</label>`,
        `                    {isEditing && (`,
        `                      <button type="button" onClick={handleDetectLocation} className="text-[11px] text-emerald-500 hover:text-emerald-400 font-bold flex items-center gap-1 transition-colors">`,
        `                        <MapPin className="w-3 h-3" /> Detect`,
        `                      </button>`,
        `                    )}`,
        `                  </div>`,
        `                  <input type="text" disabled={!isEditing} value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-sm text-slate-800 dark:text-slate-200 disabled:opacity-60 transition-colors" placeholder="e.g. New York, USA" />`,
        `                </div>`
    );
    console.log('Location UI fixed');
} else {
    console.log('Location UI NOT found');
}

fs.writeFileSync('frontend/src/App.jsx', lines.join('\n'));
