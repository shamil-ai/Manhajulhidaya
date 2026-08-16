const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Postgres DB Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test Route
app.get('/', (req, res) => {
  res.send('Manhajul Hidaya Backend is Running Live on Vercel!');
});

// Upload Photo Route
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
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Photos Route
app.get('/api/fest-photos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fest_photos ORDER BY id DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = app;
