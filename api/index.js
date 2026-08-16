const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Base64 ഫോട്ടോകൾക്കായും വലിയ ഡാറ്റകൾക്കായും

// PostgreSQL Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 1. Backend Live Status Test Route
app.get('/', (req, res) => {
  res.send('Manhajul Hidaya Backend is Running Live on Vercel!');
});

// 2. Fest Gallery Photos Fetch Route
app.get('/api/fest-photos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fest_photos ORDER BY id DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Fetch Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Admin Photo Upload Route
app.post('/admin/upload-photo', async (req, res) => {
  const { photo_url, caption } = req.body;
  if (!photo_url) {
    return res.status(400).json({ success: false, error: 'Photo is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO fest_photos (photo_url, caption) VALUES ($1, $2) RETURNING *',
      [photo_url, caption || '']
    );
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
// ==========================================
// ADMISSION ROUTES (പുതിയതായി ചേർക്കേണ്ടവ)
// ==========================================

// അഡ്മിഷൻ ഡാറ്റാബേസ് ടേബിൾ ഉണ്ടാക്കാൻ (ആദ്യത്തെ തവണ മാത്രം)
pool.query(`
  CREATE TABLE IF NOT EXISTS admissions (
    id SERIAL PRIMARY KEY,
    student_name TEXT NOT NULL,
    guardian_name TEXT,
    phone TEXT NOT NULL,
    course TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).catch(err => console.error('DB Init Error:', err));


// 1. അഡ്മിഷൻ ഫോം സേവ് ചെയ്യാനുള്ള റൂട്ട് (POST)
app.post('/api/submit-admission', async (req, res) => {
  const { student_name, guardian_name, phone, course, address } = req.body;
  
  if (!student_name || !phone || !course) {
    return res.status(400).json({ success: false, error: 'Required fields are missing' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO admissions (student_name, guardian_name, phone, course, address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [student_name, guardian_name, phone, course, address]
    );
    res.status(200).json({ success: true, data: result.rows[0], message: 'Admission submitted!' });
  } catch (err) {
    console.error('Admission Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. അഡ്മിൻ പാനലിൽ അഡ്മിഷൻ വിവരങ്ങൾ കാണിക്കാനുള്ള റൂട്ട് (GET)
app.get('/admin/admissions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM admissions ORDER BY id DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Export Express app for Vercel Serverless Execution
module.exports = app;
