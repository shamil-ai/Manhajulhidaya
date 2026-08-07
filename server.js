const express = require('express');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Headers (Vercel ഫ്രണ്ട്-എൻഡിൽ നിന്ന് ഡാറ്റ സ്വീകരിക്കാൻ ഇത് സഹായിക്കും)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ഫോട്ടോകളും വലിയ ഡാറ്റകളും സ്വീകരിക്കാൻ ലിമിറ്റ് കൂട്ടി നൽകുന്നു
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Neon Database Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.get('/', (req, res) => {
  res.send('Manhajul Hidaya Backend is running successfully!');
});

// Database Connection Test Route
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
