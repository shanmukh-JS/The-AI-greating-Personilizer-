const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'frontend', 'src', 'App.jsx');
let content = fs.readFileSync(file, 'utf8');

// We will inject a safety fallback timeout at the start of handleUpdate and handlePasswordChange
// If they don't finish within 3 seconds, they force-unlock.

const injectSafety = (funcStr, stateVar) => {
  return funcStr.replace(
    /e\.preventDefault\(\);\n\s+set.*?\(true\);/,
    `e.preventDefault();\n    ${stateVar}(true);\n    // ULTIMATE SAFETY NET: Guarantee unlock after 3.5s if catastrophic failure\n    const safetyTimer = setTimeout(() => ${stateVar}(false), 3500);`
  ).replace(
    /setIsSavingProfile\(false\);/g,
    `clearTimeout(safetyTimer); setIsSavingProfile(false);`
  ).replace(
    /setIsSavingPassword\(false\);/g,
    `clearTimeout(safetyTimer); setIsSavingPassword(false);`
  );
}

// But an easier way is to just wrap the whole function body in try/finally, except we don't want to rewrite the AST.
// So let's just add the safety timer. It's foolproof.

let newContent = content;

// 1. handleUpdate safety timer
newContent = newContent.replace(
  `    e.preventDefault();
    setIsSavingProfile(true);`,
  `    e.preventDefault();
    setIsSavingProfile(true);
    const safetyTimer = setTimeout(() => setIsSavingProfile(false), 3000);`
);

// We need to clear the timer whenever setIsSavingProfile(false) is called
newContent = newContent.replace(/setIsSavingProfile\(false\);/g, `clearTimeout(safetyTimer); setIsSavingProfile(false);`);

// 2. handlePasswordChange safety timer
newContent = newContent.replace(
  `    e.preventDefault();
    setIsSavingPassword(true);`,
  `    e.preventDefault();
    setIsSavingPassword(true);
    const safetyTimer2 = setTimeout(() => setIsSavingPassword(false), 3000);`
);

// We need to clear the timer whenever setIsSavingPassword(false) is called
newContent = newContent.replace(/setIsSavingPassword\(false\);/g, `clearTimeout(safetyTimer2); setIsSavingPassword(false);`);

// 3. Fix the Vercel 200 OK issue where res.data.user is undefined
// If Vercel rewrites to index.html, it returns HTML, so res.headers['content-type'] is text/html
// We should throw an error if the response is not JSON, so it correctly falls back to offline mode!
const patchRes = `      const res = await api.put('/profile', { email, phone, location, profile_image: profileImage });
      if (typeof res.data === 'string' && res.data.includes('<!DOCTYPE html>')) throw new Error('Vercel HTML Response');
      const updatedUser = res.data.user;`;

newContent = newContent.replace(
  `      const res = await api.put('/profile', { email, phone, location, profile_image: profileImage });
      const updatedUser = res.data.user;`,
  patchRes
);

const patchPwdRes = `      const res = await api.put('/profile/password', { currentPassword, newPassword });
      if (typeof res.data === 'string' && res.data.includes('<!DOCTYPE html>')) throw new Error('Vercel HTML Response');`;

newContent = newContent.replace(
  `      await api.put('/profile/password', { currentPassword, newPassword });`,
  patchPwdRes
);

// Also wrap the localStorage inside catch block in try-catch in case of QuotaExceededError
const catchBlockUpdateOld = `    } catch (err) {
      if (uName) {
        localStorage.setItem('profile_fullName_' + uName, fullName);
        localStorage.setItem('profile_email_' + uName, email);
        localStorage.setItem('profile_phone_' + uName, phone);
        localStorage.setItem('profile_location_' + uName, location);
        localStorage.setItem('profile_timezone_' + uName, timezone);
        localStorage.setItem('profile_image_' + uName, profileImage);
      }
      localStorage.setItem('profile_fullName', fullName);
      localStorage.setItem('profile_email', email);
      localStorage.setItem('profile_phone', phone);
      localStorage.setItem('profile_location', location);
      localStorage.setItem('profile_timezone', timezone);
      localStorage.setItem('profile_image', profileImage);

      setUser({
        ...user,
        email,
        phone,
        location,
        profile_image: profileImage
      });

      setAlert("Profile saved locally (Offline)!");
      setIsEditing(false);
      clearTimeout(safetyTimer); setIsSavingProfile(false);
    }`;

const catchBlockUpdateNew = `    } catch (err) {
      try {
        if (uName) {
          localStorage.setItem('profile_fullName_' + uName, fullName);
          localStorage.setItem('profile_email_' + uName, email);
          localStorage.setItem('profile_phone_' + uName, phone);
          localStorage.setItem('profile_location_' + uName, location);
          localStorage.setItem('profile_timezone_' + uName, timezone);
          localStorage.setItem('profile_image_' + uName, profileImage);
        }
        localStorage.setItem('profile_fullName', fullName);
        localStorage.setItem('profile_email', email);
        localStorage.setItem('profile_phone', phone);
        localStorage.setItem('profile_location', location);
        localStorage.setItem('profile_timezone', timezone);
        localStorage.setItem('profile_image', profileImage);

        setUser({
          ...user,
          email,
          phone,
          location,
          profile_image: profileImage
        });

        setAlert("Profile saved locally (Offline)!");
      } catch (storageErr) {
        console.error(storageErr);
        setAlert("Profile saved partially. Storage limit exceeded for images.");
      }
      setIsEditing(false);
      clearTimeout(safetyTimer); setIsSavingProfile(false);
    }`;

newContent = newContent.replace(catchBlockUpdateOld, catchBlockUpdateNew);

fs.writeFileSync(file, newContent, 'utf8');
console.log("Bulletproof UI unlocks injected!");
