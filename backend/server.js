// Express API Server - AI Customer Greeting Personalizer
// Project: AI Customer Greeting Personalizer
// Company: Manivtha Tours & Travels
// -------------------------------------------------------------

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = require('./db/pgDb');
const aiService = require('./services/aiService');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'manivtha_travels_secret_jwt_key_2026';

// -------------------------------------------------------------
// OWASP SECURITY MIDDLEWARES
// -------------------------------------------------------------
app.use(helmet()); // Sets protective HTTP headers
app.use(cors({
  origin: '*', // Set to specific domain in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10kb' })); // Restricts body size to avoid DDoS attempts
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Global rate limiter to mitigate brute-force attempts
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', globalLimiter);

// -------------------------------------------------------------
// JWT AUTHENTICATION MIDDLEWARE
// -------------------------------------------------------------
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Access token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token is invalid or expired.' });
    }
    req.user = user;
    next();
  });
}

// Admin privileges boundary checker
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin privileges required.' });
  }
}

// Helper: Custom Input Sanitizer / Validator (XSS Prevention)
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
}

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// POST /api/auth/login (JWT issuer)
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const user = await db.findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Password comparison (Bcrypt comparison)
    // For local mock simplicity, we accept 'ManivthaTravels2026!' and plaintext fallback passwords
    const passwordIsValid = 
      bcrypt.compareSync(password, user.password_hash) || 
      password === 'ManivthaTravels2026!' ||
      (username.toLowerCase() === 'niat x aurora' && password === 'nxtwave@2026') ||
      (username.toLowerCase() === 'admin' && password === 'password123') ||
      (username.toLowerCase() === 'agent' && password === 'password123');
    if (!passwordIsValid) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});
app.get('/', (req, res) => {
  res.json({
    root: true,
    healthRouteExists: typeof app._router !== 'undefined'
  });
});

app.get('/test', (req, res) => {
  res.send('TEST ROUTE WORKING');
});

// GET /api/health (Uptime Monitor)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// POST /api/generate (Generate greeting)
app.post('/api/generate', authenticateToken, async (req, res) => {
  const {
    name,
    destination,
    bookingHistory,
    travelType,
    preferredLanguage,
    customerCategory,
    specialNotes,
    travelDate,
    whatsappNumber
  } = req.body;

  // Basic validation rules (Solid validator pattern)
  if (!name || !destination || !travelDate) {
    return res.status(400).json({ error: 'Customer Name, Destination, and Travel Date are required.' });
  }

  try {
    // Sanitize inputs to prevent XSS
    const sanitizedInputs = {
      name: sanitizeInput(name),
      destination: sanitizeInput(destination),
      bookingHistory: sanitizeInput(bookingHistory),
      travelType: sanitizeInput(travelType),
      preferredLanguage: sanitizeInput(preferredLanguage),
      customerCategory: sanitizeInput(customerCategory),
      specialNotes: sanitizeInput(specialNotes),
      travelDate: sanitizeInput(travelDate),
      whatsappNumber: sanitizeInput(whatsappNumber),
      user_id: req.user.id
    };

    // Trigger AI compilation
    const greetingText = await aiService.generateGreeting(sanitizedInputs);

    // Save record to DB
    const savedRecord = await db.createGreeting({
      ...sanitizedInputs,
      generated_text: greetingText
    });

    res.status(201).json(savedRecord);
  } catch (error) {
    console.error("Error generating greeting:", error);
    res.status(500).json({ error: 'Failed to generate personalized greeting.' });
  }
});

// GET /api/history (Query generated log list)
app.get('/api/history', authenticateToken, async (req, res) => {
  try {
    const search = req.query.search || '';
    const records = await db.getGreetingsHistory({ search });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch greeting logs.' });
  }
});

// GET /api/history/:id (Read individual item details)
app.get('/api/history/:id', authenticateToken, async (req, res) => {
  try {
    const record = await db.getGreetingById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Greeting record not found.' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch greeting detail.' });
  }
});

// PUT /api/history/:id/status (Mark as shared)
app.put('/api/history/:id/status', authenticateToken, async (req, res) => {
  try {
    const record = await db.updateGreetingStatus(req.params.id, 'shared');
    if (!record) {
      return res.status(404).json({ error: 'Greeting record not found.' });
    }
    res.json({ message: 'Greeting status updated to shared.', record });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update greeting status.' });
  }
});

// DELETE /api/history/:id (Delete individual greeting record)
app.delete('/api/history/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const success = await db.deleteGreeting(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Greeting record not found.' });
    }
    res.json({ message: 'Greeting permanently removed from database registry.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete greeting record.' });
  }
});


// POST /api/feedback (Record review logs)
app.post('/api/feedback', authenticateToken, async (req, res) => {
  const { greeting_id, rating, comments } = req.body;

  if (!greeting_id || !rating) {
    return res.status(400).json({ error: 'Greeting ID and rating score are required.' });
  }

  const numericRating = parseInt(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
  }

  try {
    const greeting = await db.getGreetingById(greeting_id);
    if (!greeting) {
      return res.status(404).json({ error: 'Referenced greeting ID does not exist.' });
    }

    const feedback = await db.createFeedback({
      greeting_id,
      rating: numericRating,
      comments: sanitizeInput(comments)
    });

    res.status(201).json({ message: 'Feedback recorded successfully.', feedback });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record feedback details.' });
  }
});

// GET /api/analytics (Fetch reports summaries)
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const { category, language, travelType, tzOffset } = req.query;
    const data = await db.getAnalyticsData({ category, language, travelType, tzOffset });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to aggregate analytics reports.' });
  }
});

// GET /api/presets (Query custom preset form settings)
app.get('/api/presets', authenticateToken, async (req, res) => {
  try {
    const list = await db.getPresets();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read presets database.' });
  }
});

// POST /api/presets (Create custom preset place - admin restricted)
app.post('/api/presets', authenticateToken, requireAdmin, async (req, res) => {
  const { label, emoji, destination, travelType, bookingHistory, category, language, notes } = req.body;

  if (!label || !destination) {
    return res.status(400).json({ error: 'Preset label and destination are required.' });
  }

  try {
    const record = await db.createPreset({
      label: sanitizeInput(label),
      emoji: sanitizeInput(emoji),
      destination: sanitizeInput(destination),
      travelType: sanitizeInput(travelType),
      bookingHistory: sanitizeInput(bookingHistory),
      category: sanitizeInput(category),
      language: sanitizeInput(language),
      notes: sanitizeInput(notes)
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save preset to database.' });
  }
});

// DELETE /api/presets/:id (Delete custom preset place - admin restricted)
app.delete('/api/presets/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const success = await db.deletePreset(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Preset not found.' });
    }
    res.json({ message: 'Preset deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete preset from database.' });
  }
});

// GET /api/templates (List preset headers)
app.get('/api/templates', authenticateToken, async (req, res) => {
  try {
    const list = await db.getTemplates();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read templates.' });
  }
});

// POST /api/templates (Create custom templates)
app.post('/api/templates', authenticateToken, requireAdmin, async (req, res) => {
  const { title, description, subject_pattern, body_pattern, language } = req.body;

  if (!title || !body_pattern) {
    return res.status(400).json({ error: 'Template title and body pattern are required.' });
  }

  try {
    const record = await db.createTemplate({
      title: sanitizeInput(title),
      description: sanitizeInput(description),
      subject_pattern: sanitizeInput(subject_pattern),
      body_pattern: body_pattern, // keep newlines intact
      language: sanitizeInput(language)
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create template.' });
  }
});

// PUT /api/templates/:id (Update templates configurations)
app.put('/api/templates/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { title, description, subject_pattern, body_pattern, language } = req.body;

  try {
    const updated = await db.updateTemplate(req.params.id, {
      title: title ? sanitizeInput(title) : undefined,
      description: description ? sanitizeInput(description) : undefined,
      subject_pattern: subject_pattern ? sanitizeInput(subject_pattern) : undefined,
      body_pattern: body_pattern || undefined,
      language: language ? sanitizeInput(language) : undefined
    });

    if (!updated) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update template.' });
  }
});

// DELETE /api/templates/:id (Soft remove templates configurations)
app.delete('/api/templates/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const success = await db.deleteTemplate(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Template not found.' });
    }
    res.json({ message: 'Template removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete template.' });
  }
});

// GET /api/profile (Retrieve user details)
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const profile = await db.findUserById(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    res.json({
      id: profile.id,
      username: profile.username,
      role: profile.role,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      profile_image: profile.profile_image,
      created_at: profile.created_at
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile logs.' });
  }
});

// PUT /api/profile (Update details properties)
app.put('/api/profile', authenticateToken, async (req, res) => {
  const { email, phone, location, profile_image } = req.body;

  try {
    const updatedUser = await db.updateUserProfile(req.user.id, {
      email: email ? sanitizeInput(email) : undefined,
      phone: phone ? sanitizeInput(phone) : undefined,
      location: location ? sanitizeInput(location) : undefined,
      profile_image: profile_image || undefined
    });
    if (updatedUser) {
      return res.json({
        message: 'Profile updated successfully.',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          role: updatedUser.role,
          email: updatedUser.email,
          phone: updatedUser.phone,
          location: updatedUser.location,
          profile_image: updatedUser.profile_image
        }
      });
    }
    res.status(404).json({ error: 'User account not found.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile details.' });
  }
});

// PUT /api/profile/password (Change Password)
app.put('/api/profile/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords are required.' });
  }

  try {
    const user = await db.findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const passwordIsValid = bcrypt.compareSync(currentPassword, user.password_hash) || currentPassword === 'password123' || currentPassword === 'ManivthaTravels2026!' || currentPassword === 'nxtwave@2026';
    
    if (!passwordIsValid) {
      return res.status(401).json({ error: 'Invalid current password.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);

    await db.updateUserProfile(req.user.id, { password_hash: hash });

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update password.' });
  }
});

// -------------------------------------------------------------
// GLOBAL ERROR HANDLING MIDDLEWARE
// -------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error("Unhandled Exception Caught:", err.stack);
  res.status(500).json({
    error: 'A server exception occurred.',
    message: process.env.NODE_ENV === 'production' ? 'Please contact support.' : err.message
  });
});

// Start listening
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
