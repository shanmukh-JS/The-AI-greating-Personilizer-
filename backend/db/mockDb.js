// Mock Database Adapter - PostgreSQL Query Simulation with JSON Persistence
// Project: AI Customer Greeting Personalizer
// Company: Manivtha Tours & Travels
// -------------------------------------------------------------

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DATABASE_DIR = path.resolve(__dirname, '../../database');
const USERS_FILE = path.join(DATABASE_DIR, 'users.json');
const TEMPLATES_FILE = path.join(DATABASE_DIR, 'templates.json');
const GREETINGS_FILE = path.join(DATABASE_DIR, 'greetings.json');
const FEEDBACK_FILE = path.join(DATABASE_DIR, 'feedback.json');
const PRESETS_FILE = path.join(DATABASE_DIR, 'presets.json');

// Initial seed tables matching database schemas
const initialUsers = [
  {
    id: 'b3014a5c-59bc-47cb-8c9f-d31e9c5a1a1f',
    username: 'admin',
    password_hash: '$2a$10$pXI8WOQQ3HSbX0tufILAqeeZRRTVZhvHB8YqmV6XKPppIfHc2840S', // hash for password123
    role: 'admin',
    email: 'admin@manivthatravels.com',
    created_at: new Date('2026-05-15T09:00:00Z').toISOString()
  },
  {
    id: 'd2903b4b-48ab-46cb-8b8f-c20d8c4a0a0f',
    username: 'agent',
    password_hash: '$2a$10$pXI8WOQQ3HSbX0tufILAqeeZRRTVZhvHB8YqmV6XKPppIfHc2840S', // hash for password123
    role: 'staff',
    email: 'agent@manivthatravels.com',
    created_at: new Date('2026-05-15T10:00:00Z').toISOString()
  },
  {
    id: 'a1014a5c-59bc-47cb-8c9f-d31e9c5a1a1f',
    username: 'NIAT x AURORA',
    password_hash: '$2a$10$VRhcEGdTgmeNK8kdoQOC5eC22.XvkXIZRHRScnq/2Rt9c/sl7c6mK', // hash for nxtwave@2026
    role: 'admin',
    email: 'niatxaurora@manivthatravels.com',
    created_at: new Date('2026-06-10T10:00:00Z').toISOString()
  }
];

const initialTemplates = [
  {
    id: 't1010101-1111-2222-3333-444455556666',
    title: 'Standard Pre-Trip Greeting',
    description: 'General template for all travel types',
    subject_pattern: 'Greeting for {{CustomerName}}',
    body_pattern: 'Hello {{CustomerName}},\n\nThank you for choosing Manivtha Tours & Travels for your upcoming journey to {{Destination}}.\n\nWe hope you have an incredible travel experience. Let us know if you need any assistance.\n\nRegards,\nManivtha Tours & Travels',
    language: 'English',
    is_active: true,
    created_at: new Date('2026-05-15T11:00:00Z').toISOString(),
    updated_at: new Date('2026-05-15T11:00:00Z').toISOString()
  },
  {
    id: 't2020202-2222-3333-4444-555566667777',
    title: 'VIP Spiritual Journey',
    description: 'Tailored spiritual tone for holy cities',
    subject_pattern: 'Spiritual greetings for {{CustomerName}}',
    body_pattern: 'Namaste {{CustomerName}},\n\nWe are honored to assist in facilitating your sacred journey to {{Destination}}.\n\nAs one of our returning customers, we have arranged the primary details to ensure absolute peace of mind during your spiritual tour.\n\nMay your pilgrimage be deeply rewarding.\n\nRegards,\nManivtha Tours & Travels',
    language: 'English',
    is_active: true,
    created_at: new Date('2026-05-16T12:00:00Z').toISOString(),
    updated_at: new Date('2026-05-16T12:00:00Z').toISOString()
  }
];

const initialGreetings = [];

const initialFeedback = [];

const initialPresets = [
  {
    id: 'p1',
    label: 'Tirupati Pilgrimage',
    emoji: '☸️',
    destination: 'Tirupati',
    travelType: 'Spiritual Tour',
    bookingHistory: '3 Previous Trips',
    category: 'VIP',
    language: 'English',
    notes: 'Arrange clean vegetarian guide.'
  },
  {
    id: 'p2',
    label: 'Goa Honeymoon',
    emoji: '🏖️',
    destination: 'Goa',
    travelType: 'Honeymoon',
    bookingHistory: '1st Trip',
    category: 'Premium',
    language: 'English',
    notes: 'Arrange flower decorations and candle light dinners.'
  },
  {
    id: 'p3',
    label: 'Mumbai Corporate',
    emoji: '💼',
    destination: 'Mumbai',
    travelType: 'Corporate Travel',
    bookingHistory: '5 Previous Trips',
    category: 'VIP',
    language: 'English',
    notes: 'Provide premium executive sedan, late check-out, express Wi-Fi.'
  },
  {
    id: 'p4',
    label: 'Ladakh Adventure',
    emoji: '🏔️',
    destination: 'Leh Ladakh',
    travelType: 'Solo Adventure',
    bookingHistory: '1st Trip',
    category: 'Standard',
    language: 'Hindi',
    notes: 'Include high-altitude oxygen kit, emergency local contacts, bike rental details.'
  },
  {
    id: 'p5',
    label: 'Ooty Family',
    emoji: '👪',
    destination: 'Ooty',
    travelType: 'Family Trip',
    bookingHistory: '2 Previous Trips',
    category: 'Premium',
    language: 'Telugu',
    notes: 'Book kid-friendly theme park tickets and arrange an English-speaking driver.'
  },
  {
    id: 'p6',
    label: 'Jaipur Heritage',
    emoji: '🏰',
    destination: 'Jaipur',
    travelType: 'Family Trip',
    bookingHistory: '4 Previous Trips',
    category: 'VIP',
    language: 'Hindi',
    notes: 'Book local guide for historical forts and royal dinner reservations.'
  }
];

// Read helper with JSON parse & folder creation
function readJSONFile(filePath, defaultValue) {
  try {
    if (!fs.existsSync(filePath)) {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
      return JSON.parse(JSON.stringify(defaultValue));
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading database file ${filePath}:`, err);
    return JSON.parse(JSON.stringify(defaultValue));
  }
}

// Write helper
function writeJSONFile(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing database file ${filePath}:`, err);
  }
}

// Memory tables that load from files
let usersTable = [];
let templatesTable = [];
let greetingsTable = [];
let feedbackTable = [];
let presetsTable = [];
const adminLogsTable = [];

function loadAllTables() {
  usersTable = readJSONFile(USERS_FILE, initialUsers);
  templatesTable = readJSONFile(TEMPLATES_FILE, initialTemplates);
  greetingsTable = readJSONFile(GREETINGS_FILE, initialGreetings);
  feedbackTable = readJSONFile(FEEDBACK_FILE, initialFeedback);
  presetsTable = readJSONFile(PRESETS_FILE, initialPresets);
}

// Initial load
loadAllTables();

// Helper to simulate UUID generation
function generateUUID() {
  return crypto.randomUUID();
}

// -------------------------------------------------------------
// DATABASE INTERACTION SERVICE LAYER (SIMULATING SQL INTEGRITY)
// -------------------------------------------------------------

// USERS OPERATIONS
async function findUserByUsername(username) {
  loadAllTables();
  return usersTable.find(u => u.username.toLowerCase() === username.toLowerCase());
}

async function findUserById(id) {
  loadAllTables();
  return usersTable.find(u => u.id === id);
}

async function updateUserEmail(id, email) {
  loadAllTables();
  const idx = usersTable.findIndex(u => u.id === id);
  if (idx !== -1) {
    usersTable[idx].email = email;
    writeJSONFile(USERS_FILE, usersTable);
    return usersTable[idx];
  }
  return null;
}

// GREETINGS OPERATIONS
async function createGreeting(data) {
  loadAllTables();
  const record = {
    id: generateUUID(),
    created_at: new Date().toISOString(),
    status: 'draft',
    user_id: data.user_id,
    customer_name: data.name,
    destination: data.destination,
    travel_date: data.travelDate,
    booking_history: data.bookingHistory,
    travel_type: data.travelType,
    language: data.preferredLanguage,
    category: data.customerCategory,
    special_notes: data.specialNotes,
    whatsapp_number: data.whatsappNumber,
    generated_text: data.generated_text
  };
  greetingsTable.push(record);
  writeJSONFile(GREETINGS_FILE, greetingsTable);
  return record;
}

async function updateGreetingStatus(id, status) {
  loadAllTables();
  const idx = greetingsTable.findIndex(g => g.id === id);
  if (idx !== -1) {
    greetingsTable[idx].status = status;
    writeJSONFile(GREETINGS_FILE, greetingsTable);
    return greetingsTable[idx];
  }
  return null;
}

async function getGreetingsHistory(filters = {}) {
  loadAllTables();
  let results = greetingsTable.map(g => {
    const fb = feedbackTable.find(f => f.greeting_id === g.id);
    return {
      ...g,
      rating: fb ? fb.rating : null,
      comments: fb ? fb.comments : null
    };
  });

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(g => 
      g.customer_name.toLowerCase().includes(q) || 
      g.destination.toLowerCase().includes(q)
    );
  }

  // Sort descending by created date
  results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return results;
}

async function getGreetingById(id) {
  loadAllTables();
  const greeting = greetingsTable.find(g => g.id === id);
  if (!greeting) return null;

  const fb = feedbackTable.find(f => f.greeting_id === id);
  return {
    ...greeting,
    rating: fb ? fb.rating : null,
    comments: fb ? fb.comments : null
  };
}

// FEEDBACK OPERATIONS
async function createFeedback(data) {
  loadAllTables();
  const record = {
    id: generateUUID(),
    created_at: new Date().toISOString(),
    ...data
  };
  feedbackTable.push(record);
  writeJSONFile(FEEDBACK_FILE, feedbackTable);
  return record;
}

// TEMPLATE CRUD
async function getTemplates() {
  loadAllTables();
  return templatesTable.filter(t => t.is_active);
}

async function getTemplateById(id) {
  loadAllTables();
  return templatesTable.find(t => t.id === id && t.is_active);
}

async function createTemplate(data) {
  loadAllTables();
  const record = {
    id: generateUUID(),
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...data
  };
  templatesTable.push(record);
  writeJSONFile(TEMPLATES_FILE, templatesTable);
  return record;
}

async function updateTemplate(id, data) {
  loadAllTables();
  const idx = templatesTable.findIndex(t => t.id === id);
  if (idx !== -1) {
    const cleanData = {};
    for (const key in data) {
      if (data[key] !== undefined) {
        cleanData[key] = data[key];
      }
    }
    templatesTable[idx] = {
      ...templatesTable[idx],
      ...cleanData,
      updated_at: new Date().toISOString()
    };
    writeJSONFile(TEMPLATES_FILE, templatesTable);
    return templatesTable[idx];
  }
  return null;
}

async function deleteTemplate(id) {
  loadAllTables();
  const idx = templatesTable.findIndex(t => t.id === id);
  if (idx !== -1) {
    templatesTable[idx].is_active = false;
    writeJSONFile(TEMPLATES_FILE, templatesTable);
    return true;
  }
  return false;
}

// ANALYTICS COMPUTATION
async function getAnalyticsData(filters = {}) {
  loadAllTables();

  let filteredGreetings = [...greetingsTable];

  // Apply filters if provided
  if (filters.category && filters.category !== 'All') {
    filteredGreetings = filteredGreetings.filter(g => g.category === filters.category);
  }
  if (filters.language && filters.language !== 'All') {
    filteredGreetings = filteredGreetings.filter(g => g.language === filters.language);
  }
  if (filters.travelType && filters.travelType !== 'All') {
    filteredGreetings = filteredGreetings.filter(g => g.travel_type === filters.travelType);
  }

  const offsetMinutes = parseInt(filters.tzOffset || 0, 10);
  const nowUtcMillis = Date.now();
  const localNowMillis = nowUtcMillis - (offsetMinutes * 60000);
  const totalGreetings = filteredGreetings.length;
  
  // Calculate average rating for filtered greetings
  const filteredGreetingIds = new Set(filteredGreetings.map(g => g.id));
  const filteredFeedback = feedbackTable.filter(f => filteredGreetingIds.has(f.greeting_id));

  const ratings = filteredFeedback.map(f => f.rating);
  const averageRating = ratings.length ? parseFloat((ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)) : 0;

  // Calculate top destinations (All destinations)
  const destCount = {};
  filteredGreetings.forEach(g => {
    destCount[g.destination] = (destCount[g.destination] || 0) + 1;
  });
  const topDestinations = Object.keys(destCount).map(name => ({
    name,
    count: destCount[name]
  })).sort((a, b) => b.count - a.count);

  // Group by travel category
  const categoryCount = {};
  filteredGreetings.forEach(g => {
    categoryCount[g.category] = (categoryCount[g.category] || 0) + 1;
  });
  const topCategories = Object.keys(categoryCount).map(name => ({
    name,
    count: categoryCount[name]
  }));

  // Daily volume mapping (last 7 days dynamic calculation based on filtered greetings)
  const dailyUsage = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(localNowMillis);
    d.setUTCDate(d.getUTCDate() - i);
    
    const dayName = daysOfWeek[d.getUTCDay()];
    const localYear = d.getUTCFullYear();
    const localMonth = String(d.getUTCMonth() + 1).padStart(2, '0');
    const localDay = String(d.getUTCDate()).padStart(2, '0');
    const dateStr = `${localYear}-${localMonth}-${localDay}`;
    
    const count = filteredGreetings.filter(g => {
      if (!g.created_at) return false;
      const gDateObj = new Date(new Date(g.created_at).getTime() - (offsetMinutes * 60000));
      const gYear = gDateObj.getUTCFullYear();
      const gMonth = String(gDateObj.getUTCMonth() + 1).padStart(2, '0');
      const gDay = String(gDateObj.getUTCDate()).padStart(2, '0');
      const gDate = `${gYear}-${gMonth}-${gDay}`;
      return gDate === dateStr;
    }).length;
    
    dailyUsage.push({
      date: `${dayName} ${d.getUTCDate()}`,
      count: count
    });
  }

  // Slice last 5 feedbacks
  const recentFeedbacks = filteredFeedback.map(fb => {
    const greeting = filteredGreetings.find(g => g.id === fb.greeting_id);
    return {
      id: fb.id,
      customer_name: greeting ? greeting.customer_name : 'Unknown Customer',
      destination: greeting ? greeting.destination : 'Unknown',
      rating: fb.rating,
      comments: fb.comments,
      created_at: fb.created_at
    };
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  return {
    totalGreetings,
    averageRating,
    feedbackCount: filteredFeedback.length,
    topDestinations,
    topCategories,
    dailyUsage,
    recentFeedbacks,
    performanceMetrics: {
      avgResponseMs: 2400,
      uptimePct: 99.9,
      aiSuccessRate: 99.2
    }
  };
}

async function deleteGreeting(id) {
  loadAllTables();
  const idx = greetingsTable.findIndex(g => g.id === id);
  if (idx !== -1) {
    greetingsTable.splice(idx, 1);
    writeJSONFile(GREETINGS_FILE, greetingsTable);
    // Clean up associated feedback logs
    feedbackTable = feedbackTable.filter(f => f.greeting_id !== id);
    writeJSONFile(FEEDBACK_FILE, feedbackTable);
    return true;
  }
  return false;
}

// PRESETS OPERATIONS
async function getPresets() {
  loadAllTables();
  return presetsTable;
}

async function createPreset(data) {
  loadAllTables();
  const record = {
    id: generateUUID(),
    label: data.label,
    emoji: data.emoji || '✈️',
    destination: data.destination,
    travelType: data.travelType || 'Family Trip',
    bookingHistory: data.bookingHistory || '1st Trip',
    category: data.category || 'Standard',
    language: data.language || 'English',
    notes: data.notes || ''
  };
  presetsTable.push(record);
  writeJSONFile(PRESETS_FILE, presetsTable);
  return record;
}

async function deletePreset(id) {
  loadAllTables();
  const idx = presetsTable.findIndex(p => p.id === id);
  if (idx !== -1) {
    presetsTable.splice(idx, 1);
    writeJSONFile(PRESETS_FILE, presetsTable);
    return true;
  }
  return false;
}

module.exports = {
  findUserByUsername,
  findUserById,
  updateUserEmail,
  createGreeting,
  updateGreetingStatus,
  getGreetingsHistory,
  getGreetingById,
  deleteGreeting,
  createFeedback,
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getAnalyticsData,
  getPresets,
  createPreset,
  deletePreset,
  usersTable
};

