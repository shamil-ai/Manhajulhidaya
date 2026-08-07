const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'manhaj_secret_key_2026';

// CORS Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Neon Database Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get('/', (req, res) => {
  res.send('Manhajul Hidaya Backend is running successfully!');
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

// Admission Form Submission Route
app.post('/submit', async (req, res) => {
  try {
    const {
      email, name, dob, appEmail, phone, whatsapp,
      address, fatherName, motherName, classSelect,
      qualification, photo
    } = req.body;

    const query = `
      INSERT INTO admissions 
      (email, name, dob, app_email, phone, whatsapp, address, father_name, mother_name, class_select, qualification, photo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;

    const values = [
      email, name, dob, appEmail, phone, whatsapp,
      address, fatherName, motherName, classSelect,
      qualification, photo
    ];

    const result = await pool.query(query, values);
    res.status(200).json({ success: true, message: 'Submitted successfully', data: result.rows[0] });
  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Login Route
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  // ഇവിടെ നിങ്ങളുടെ അഡ്മിൻ യൂസർനെയിമും പാസ്‌വേർഡും നൽകാം
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'manhaj2026';

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '2h' });
    return res.status(200).json({ success: true, token });
  }

  res.status(401).json({ success: false, message: 'Invalid username or password' });
});

// Middleware to verify Admin Token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(403).json({ success: false, message: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

// Get all admissions for Admin Panel (Protected Route)
app.get('/admin/admissions', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM admissions ORDER BY id DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
