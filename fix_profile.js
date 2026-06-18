const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.jsx', 'utf8');

// 1. Fix login logic
const targetLogin = `        console.warn("API Login failed (network offline), triggering simulated authentications...");
        // Simulation fallback for standalone runs when backend is offline
        const isValidAgent = username === 'agent' && (password === 'password123' || password === 'ManivthaTravels2026!');
        const isValidAdmin = username === 'admin' && (password === 'password123' || password === 'ManivthaTravels2026!');
        const isValidNiatAurora = username === 'NIAT x AURORA' && password === 'nxtwave@2026';`;

const replacementLogin = `        console.warn("API Login failed (network offline), triggering simulated authentications...");
        // Simulation fallback for standalone runs when backend is offline
        const customAgentPassword = localStorage.getItem('custom_password_agent');
        const customAdminPassword = localStorage.getItem('custom_password_admin');
        const isValidAgent = username === 'agent' && (password === (customAgentPassword || 'password123') || password === 'ManivthaTravels2026!');
        const isValidAdmin = username === 'admin' && (password === (customAdminPassword || 'password123') || password === 'ManivthaTravels2026!');
        const isValidNiatAurora = username === 'NIAT x AURORA' && password === 'nxtwave@2026';`;

// 2. Fix handlePasswordChange
const targetPasswordChange = `      try {
        await api.put('/profile/password', { currentPassword, newPassword });
        setPasswordAlert("Password successfully changed!");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordAlert(''), 3000);
      } catch (err) {
        setPasswordAlert(err.response?.data?.error || "Failed to change password.");
      }`;

const replacementPasswordChange = `      try {
        await api.put('/profile/password', { currentPassword, newPassword });
        setPasswordAlert("Password successfully changed!");
        if (user && user.username) {
            localStorage.setItem('custom_password_' + user.username, newPassword);
        }
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordAlert(''), 3000);
      } catch (err) {
        // Fallback for simulated/offline mode
        if (user && user.username) {
            const currentCustom = localStorage.getItem('custom_password_' + user.username) || 'password123';
            if (currentPassword !== currentCustom && currentPassword !== 'ManivthaTravels2026!') {
               setPasswordAlert("Incorrect current password.");
               return;
            }
            localStorage.setItem('custom_password_' + user.username, newPassword);
            setPasswordAlert("Password successfully changed (Locally)!");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setPasswordAlert(''), 3000);
        } else {
            setPasswordAlert(err.response?.data?.error || "Failed to change password.");
        }
      }`;

// 3. Fix Location Input to include Detect button
const targetLocation = `                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Location</label>
                    <input type="text" disabled={!isEditing} value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-sm text-slate-800 dark:text-slate-200 disabled:opacity-60 transition-colors" placeholder="e.g. New York, USA" />
                  </div>`;

const replacementLocation = `                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
                      {isEditing && (
                        <button type="button" onClick={handleDetectLocation} className="text-[11px] text-emerald-500 hover:text-emerald-400 font-bold flex items-center gap-1 transition-colors">
                          <MapPin className="w-3 h-3" /> Detect
                        </button>
                      )}
                    </div>
                    <input type="text" disabled={!isEditing} value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-sm text-slate-800 dark:text-slate-200 disabled:opacity-60 transition-colors" placeholder="e.g. New York, USA" />
                  </div>`;


let modified = false;

function safeReplace(target, replacement, desc) {
    let t = target;
    let r = replacement;
    let idx = code.indexOf(t);
    if (idx !== -1) {
        code = code.slice(0, idx) + r + code.slice(idx + t.length);
        console.log("Success " + desc);
        modified = true;
    } else {
        t = target.replace(/\\n/g, '\\r\\n');
        idx = code.indexOf(t);
        if (idx !== -1) {
            r = replacement.replace(/\\n/g, '\\r\\n');
            code = code.slice(0, idx) + r + code.slice(idx + t.length);
            console.log("Success (CRLF) " + desc);
            modified = true;
        } else {
            console.log("Failed to match " + desc);
        }
    }
}

safeReplace(targetLogin, replacementLogin, 'Login logic');
safeReplace(targetPasswordChange, replacementPasswordChange, 'Password Change logic');
safeReplace(targetLocation, replacementLocation, 'Location UI');

if (modified) {
    fs.writeFileSync('frontend/src/App.jsx', code);
}
