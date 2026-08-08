const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'manhaj_secret_key_2026';

// CORS & Methods Updated
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// JSON Limit increased for Images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ==========================================
// ഓട്ടോമാറ്റിക് ആയി പുതിയ ടേബിളുകൾ ക്രിയേറ്റ് ചെയ്യാനുള്ള ഫംഗ്ഷൻ (News, Results, Gallery)
// ==========================================
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        date_text VARCHAR(50),
        title VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS fest_results (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100),
        item_name VARCHAR(255),
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS gallery (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100),
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database tables verified/created successfully.");
  } catch (err) {
    console.error("Database initialization error:", err);
  }
};
initDB();

app.get('/', (req, res) => {
  res.send('Manhajul Hidaya Backend is running successfully! All Features Enabled.');
});

app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`Neon Database connected successfully! Server time: ${result.rows[0].now}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database connection error');
  }
});

// ==========================================
// 1. ADMISSIONS & CONTACTS (നിങ്ങളുടെ പഴയത്)
// ==========================================

app.post('/submit', async (req, res) => {
  try {
    const { email, name, dob, appEmail, phone, whatsapp, address, fatherName, motherName, classSelect, qualification, photo } = req.body;
    const query = `
      INSERT INTO admissions (email, name, dob, app_email, phone, whatsapp, address, father_name, mother_name, class_select, qualification, photo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *;
    `;
    const values = [email, name, dob, appEmail, phone, whatsapp, address, fatherName, motherName, classSelect, qualification, photo];
    const result = await pool.query(query, values);
    res.status(200).json({ success: true, message: 'Submitted successfully', data: result.rows[0] });
  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/contact-submit', async (req, res) => {
  try {
    const { Name, Email, Phone, Message } = req.body;
    const query = `INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *;`;
    const values = [Name, Email, Phone, Message];
    const result = await pool.query(query, values);
    res.status(200).json({ success: true, message: 'Message sent successfully', data: result.rows[0] });
  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'manhaj2026';

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' }); // സമയം കൂട്ടിയിട്ടുണ്ട്
    return res.status(200).json({ success: true, token });
  }
  res.status(401).json({ success: false, message: 'Invalid username or password' });
});

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

app.get('/admin/admissions', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM admissions ORDER BY id DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete('/admin/admissions/:id', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM admissions WHERE id = $1', [req.params.id]);
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/admin/contacts', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contacts ORDER BY id DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete('/admin/contacts/:id', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM contacts WHERE id = $1', [req.params.id]);
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ==========================================
// 2. NEWS MANAGEMENT API (പുതിയത്)
// ==========================================

app.get('/api/news', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM news ORDER BY id DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/admin/news', verifyToken, async (req, res) => {
  try {
    const { date_text, title, description } = req.body;
    const result = await pool.query('INSERT INTO news (date_text, title, description) VALUES ($1, $2, $3) RETURNING *', [date_text, title, description]);
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete('/admin/news/:id', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM news WHERE id = $1', [req.params.id]);
    res.status(200).json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ==========================================
// 3. MANHAJ FEST RESULTS API (പുതിയത്)
// ==========================================

app.get('/api/results', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fest_results ORDER BY id DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/admin/results', verifyToken, async (req, res) => {
  try {
    const { category, item_name, image_url } = req.body;
    const result = await pool.query('INSERT INTO fest_results (category, item_name, image_url) VALUES ($1, $2, $3) RETURNING *', [category, item_name, image_url]);
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete('/admin/results/:id', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM fest_results WHERE id = $1', [req.params.id]);
    res.status(200).json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ==========================================
// 4. GALLERY MANAGEMENT API (പുതിയത്)
// ==========================================

app.get('/api/gallery', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gallery ORDER BY id DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/admin/gallery', verifyToken, async (req, res) => {
  try {
    const { category, image_url } = req.body;
    const result = await pool.query('INSERT INTO gallery (category, image_url) VALUES ($1, $2) RETURNING *', [category, image_url]);
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete('/admin/gallery/:id', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM gallery WHERE id = $1', [req.params.id]);
    res.status(200).json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
