const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.jsx', 'utf8');

const targetStr = `  async function loadTemplates() {
    try {
      const res = await api.get('/templates');
      setTemplates(res.data);
      localStorage.setItem('custom_templates', JSON.stringify(res.data));
    } catch (e) {
      console.warn("API offline, rendering simulated templates");
      let local = [];
      if (typeof window !== 'undefined') {
        local = JSON.parse(localStorage.getItem('custom_templates') || '[]');
      }
      if (local.length === 0 && !localStorage.getItem('custom_templates_initialized')) {
        local = [
          {
            id: 't1010101-1111-2222-3333-444455556666',
            title: 'Standard Pre-Trip Greeting',
            description: 'General template for all travel types',
            subject_pattern: 'Greeting for {{CustomerName}}',
            body_pattern: 'Hello {{CustomerName}},\\n\\nThank you for choosing Manivtha Tours & Travels for your upcoming journey to {{Destination}}.\\n\\nWe hope you have an incredible travel experience. Let us know if you need any assistance.\\n\\nRegards,\\nManivtha Tours & Travels',
            language: 'English',
            is_active: true
          },
          {
            id: 't2020202-2222-3333-4444-555566667777',
            title: 'VIP Spiritual Journey',
            description: 'Tailored spiritual tone for holy cities',
            subject_pattern: 'Spiritual greetings for {{CustomerName}}',
            body_pattern: 'Namaste {{CustomerName}},\\n\\nWe are honored to assist in facilitating your sacred journey to {{Destination}}.\\n\\nAs one of our returning customers, we have arranged the primary details to ensure absolute peace of mind during your spiritual tour.\\n\\nMay your pilgrimage be deeply rewarding.\\n\\nRegards,\\nManivtha Tours & Travels',
            language: 'English',
            is_active: true
          }
        ];
        localStorage.setItem('custom_templates', JSON.stringify(local));
        localStorage.setItem('custom_templates_initialized', 'true');
      }
      setTemplates(local);
    }
    setLoading(false);
  }`;

const replacementStr = `  const defaultTemplatesList = [
    {
      id: 't1010101-1111-2222-3333-444455556666',
      title: 'Standard Pre-Trip Greeting',
      description: 'General template for all travel types',
      subject_pattern: 'Greeting for {{CustomerName}}',
      body_pattern: 'Hello {{CustomerName}},\\n\\nThank you for choosing Manivtha Tours & Travels for your upcoming journey to {{Destination}}.\\n\\nWe hope you have an incredible travel experience. Let us know if you need any assistance.\\n\\nRegards,\\nManivtha Tours & Travels',
      language: 'English',
      is_active: true
    },
    {
      id: 't2020202-2222-3333-4444-555566667777',
      title: 'VIP Spiritual Journey',
      description: 'Tailored spiritual tone for holy cities',
      subject_pattern: 'Spiritual greetings for {{CustomerName}}',
      body_pattern: 'Namaste {{CustomerName}},\\n\\nWe are honored to assist in facilitating your sacred journey to {{Destination}}.\\n\\nAs one of our returning customers, we have arranged the primary details to ensure absolute peace of mind during your spiritual tour.\\n\\nMay your pilgrimage be deeply rewarding.\\n\\nRegards,\\nManivtha Tours & Travels',
      language: 'English',
      is_active: true
    }
  ];

  async function loadTemplates() {
    try {
      const res = await api.get('/templates');
      let dbTemplates = res.data;
      const existingIds = dbTemplates.map(t => t.id);
      let data = [...defaultTemplatesList.filter(t => !existingIds.includes(t.id)), ...dbTemplates];
      setTemplates(data);
      localStorage.setItem('custom_templates', JSON.stringify(data));
    } catch (e) {
      console.warn("API offline, rendering simulated templates");
      let local = [];
      if (typeof window !== 'undefined') {
        try {
          local = JSON.parse(localStorage.getItem('custom_templates') || '[]');
        } catch(err) {
          local = [];
        }
      }
      const localIds = local.map(t => t.id);
      let mergedLocal = [...defaultTemplatesList.filter(t => !localIds.includes(t.id)), ...local];
      localStorage.setItem('custom_templates', JSON.stringify(mergedLocal));
      setTemplates(mergedLocal);
    }
    setLoading(false);
  }`;

// Use indexOf with exact matching
let startIdx = code.indexOf(targetStr);
if (startIdx !== -1) {
    code = code.slice(0, startIdx) + replacementStr + code.slice(startIdx + targetStr.length);
    fs.writeFileSync('frontend/src/App.jsx', code);
    console.log('Success');
} else {
    // try with CRLF
    const targetStrCRLF = targetStr.replace(/\n/g, '\r\n');
    startIdx = code.indexOf(targetStrCRLF);
    if (startIdx !== -1) {
        const replacementStrCRLF = replacementStr.replace(/\n/g, '\r\n');
        code = code.slice(0, startIdx) + replacementStrCRLF + code.slice(startIdx + targetStrCRLF.length);
        fs.writeFileSync('frontend/src/App.jsx', code);
        console.log('Success (CRLF)');
    } else {
        console.log('Failed to match');
    }
}
