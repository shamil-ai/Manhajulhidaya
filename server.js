const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'manhaj_secret_key_2026';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Static Files Serving (HTML/CSS/JS ഫയലുകൾക്കായി)
app.use(express.static(path.join(__dirname, 'public')));

// PostgreSQL Database Connection (Neon DB)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'Postgresql://neondb_owner:npg_2IhSlvMToL4a@ep-twilight-pond-avkt3tnr-pooler.c-11.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

// Admin JWT Authentication Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(403).json({ success: false, message: 'Access denied.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token.' });
    req.user = user;
    next();
  });
};

// --- ROUTES ---

// 1. Home Route ('Cannot GET /' എറർ പരിഹരിക്കാൻ)
app.get('/', (req, res) => {
  res.status(200).send('Manhajul Hidaya Backend Server is running successfully!');
});

// 2. Admin Login
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'manhaj2026';

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '12h' });
    return res.status(200).json({ success: true, token });
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// 3. GET Admissions
app.get('/admin/admissions', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM admissions ORDER BY id DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. UPDATE Admission (PUT)
app.put('/admin/admissions/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, whatsapp, class_select, address, photo } = req.body;

  try {
    const query = `
      UPDATE admissions 
      SET name = $1, email = $2, phone = $3, whatsapp = $4, class_select = $5, address = $6, photo = $7 
      WHERE id = $8 RETURNING *;
    `;
    const values = [name, email, phone, whatsapp, class_select, address, photo, id];
    const result = await pool.query(query, values);
    res.status(200).json({ success: true, message: 'Admission updated successfully', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. DELETE Admission
app.delete('/admin/admissions/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM admissions WHERE id = $1', [id]);
    res.status(200).json({ success: true, message: 'Admission deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. GET Contacts
app.get('/admin/contacts', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contacts ORDER BY id DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. DELETE Contact Message
app.delete('/admin/contacts/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM contacts WHERE id = $1', [id]);
    res.status(200).json({ success: true, message: 'Contact deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
