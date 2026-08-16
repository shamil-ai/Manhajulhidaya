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

// Export Express app for Vercel Serverless Execution
module.exports = app;
