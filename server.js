const express = require('express');
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken'); 
const nodemailer = require('nodemailer'); // For sending emails

const app = express();
const PORT = process.env.PORT || 10000;

app.set('trust proxy', true);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// ==========================================
// EMAIL SETUP (NODEMAILER)
// ==========================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail
        pass: process.env.EMAIL_PASS  // Your Gmail App Password
    }
});

async function sendEmailAlert(subject, htmlContent, base64Photo = null) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    
    let mailOptions = {
        from: `"Manhajul Hidaya" <${process.env.EMAIL_USER}>`,
        to: 'manhajulhidayacm@gmail.com', // Email destination
        subject: subject,
        html: htmlContent
    };

    if (base64Photo && base64Photo.includes('base64,')) {
        mailOptions.attachments = [{
            filename: 'photo.jpg',
            content: base64Photo.split(',')[1],
            encoding: 'base64'
        }];
    }

    try { await transporter.sendMail(mailOptions); } 
    catch (error) { console.error("Email Error:", error); }
}

// ==========================================
// TELEGRAM SETUP
// ==========================================
async function sendTelegramText(text) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: text, parse_mode: 'HTML' })
        });
    } catch (err) {}
}

async function sendTelegramData(data) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
    try {
        let message = `🎉 <b>പുതിയ അഡ്മിഷൻ ലഭിച്ചു!</b>\n\n👤 <b>Name:</b> ${data.name}\n📚 <b>Class:</b> ${data.classSelect}\n📞 <b>Phone:</b> ${data.phone}\n💬 <b>WhatsApp:</b> ${data.whatsapp || 'N/A'}\n🏠 <b>Address:</b> ${data.address}\n👨‍👩‍👦 <b>Parents:</b> ${data.fatherName} & ${data.motherName}\n🎓 <b>Qualification:</b> ${data.qualification}`;

        if (data.photo && data.photo.includes('base64,')) {
            const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
            const photoBuffer = Buffer.from(data.photo.split(',')[1], 'base64');
            const formData = new FormData();
            formData.append('chat_id', TELEGRAM_CHAT_ID);
            formData.append('photo', new Blob([photoBuffer]), 'photo.jpg');
            formData.append('caption', message);
            formData.append('parse_mode', 'HTML');
            await fetch(url, { method: 'POST', body: formData });
        } else {
            await sendTelegramText(message);
        }
    } catch (err) { console.error('Telegram Error:', err); }
}

// ==========================================
// ADMIN AUTH
// ==========================================
const authMiddleware = (req, res, next) => {
    const token = req.cookies.admin_session;
    if (!token) return res.redirect('/login');
    try { jwt.verify(token, JWT_SECRET); next(); } 
    catch (err) { res.clearCookie('admin_session'); res.redirect('/login'); }
};

app.get('/login', (req, res) => { /* Same login page as before */ 
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head><title>Admin Login</title><style>body{background:#111315;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;} .card{background:#1c1c1f;padding:40px;border-radius:12px;width:100%;max-width:400px;} input{width:100%;padding:12px;margin:10px 0;border-radius:8px;border:1px solid #333;background:#111;color:#fff;} button{width:100%;padding:12px;background:#3ecf8e;border:none;border-radius:8px;cursor:pointer;font-weight:bold;margin-top:10px;}</style></head>
    <body>
        <div class="card">
            <h2 style="text-align:center">Admin Login</h2>
            <form id="loginForm">
                <input type="text" id="username" placeholder="Username" required>
                <input type="password" id="password" placeholder="Password" required>
                <button type="submit">Sign In</button>
            </form>
        </div>
        <script>
            document.getElementById('loginForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: document.getElementById('username').value, password: document.getElementById('password').value }) });
                if (res.ok) window.location.href = '/'; else alert('Invalid Credentials');
            });
        </script>
    </body></html>`);
});

app.post('/api/login', (req, res) => {
    if (req.body.username === adminUsername && req.body.password === adminPassword) {
        res.cookie('admin_session', jwt.sign({ username: req.body.username }, JWT_SECRET, { expiresIn: '1d' }), { httpOnly: true, secure: true, maxAge: 86400000 });
        return res.status(200).json({ success: true });
    }
    res.status(401).json({ success: false });
});
app.get('/logout', (req, res) => { res.clearCookie('admin_session'); res.redirect('/login'); });

// ==========================================
// ADMISSION SUBMISSION
// ==========================================
app.post('/submit', async (req, res) => {
    const data = req.body;
    try {
        const query = `INSERT INTO "Manhaj form" (name, email, dob, app_email, phone, whatsapp, address, photo, father_name, mother_name, class_selected, qualification) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *;`;
        const result = await pool.query(query, [data.name, data.email, data.dob, data.appEmail, data.phone, data.whatsapp, data.address, data.photo, data.fatherName, data.motherName, data.classSelect, data.qualification]);
        
        // 1. Send to Telegram
        await sendTelegramData(data);
        
        // 2. Send to Email
        const emailHtml = `
            <div style="font-family: sans-serif; padding: 20px; background: #f4f4f9;">
                <h2 style="color: #059669;">🎉 പുതിയ അഡ്മിഷൻ ലഭിച്ചു!</h2>
                <div style="background: #fff; padding: 20px; border-radius: 10px; border: 1px solid #ddd;">
                    <p><b>👤 Name:</b> ${data.name}</p>
                    <p><b>📚 Class:</b> ${data.classSelect}</p>
                    <p><b>📞 Phone:</b> ${data.phone}</p>
                    <p><b>💬 WhatsApp:</b> ${data.whatsapp || 'N/A'}</p>
                    <p><b>📧 Email:</b> ${data.email}</p>
                    <p><b>🏠 Address:</b> ${data.address}</p>
                    <p><b>👨‍👩‍👦 Parents:</b> ${data.fatherName} & ${data.motherName}</p>
                    <p><b>🎓 Qualification:</b> ${data.qualification}</p>
                    <p><i>Photo is attached with this email.</i></p>
                </div>
            </div>
        `;
        await sendEmailAlert(`🎉 പുതിയ അഡ്മിഷൻ: ${data.name}`, emailHtml, data.photo);

        res.status(200).json({ message: "Success" });
    } catch (error) { res.status(500).json({ error: "Failed" }); }
});

// ==========================================
// VISITOR LOGGING (ADVANCED)
// ==========================================
app.post('/log-visit-advanced', async (req, res) => {
    const data = req.body;
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (ip && ip.includes(',')) ip = ip.split(',')[0].trim();
    let country = 'Unknown', city = 'Unknown', isp = 'Unknown';
    
    try {
        if (ip && ip !== '::1' && ip !== '127.0.0.1') {
            const geo = await (await fetch(`http://ip-api.com/json/${ip}`)).json();
            if (geo.status === 'success') { country = geo.country; city = geo.city; isp = geo.isp; }
        }
    } catch (error) {}
    
    try {
        // 1. Save to Database
        const query = `INSERT INTO visitors_advanced_log (visitor_id, ip_address, country, city, device, os, network_type, battery_level) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
        await pool.query(query, [data.visitor_id, ip, country, city, data.device, data.os, `${data.network_type} (${isp})`, data.battery_level]);
        
        // 2. Telegram Alert
        const alertMsg = `🚨 <b>പുതിയ സന്ദർശകൻ എത്തിയിട്ടുണ്ട്!</b>\n🌍 <b>സ്ഥലം:</b> ${city}, ${country}\n📱 <b>ഫോൺ/കമ്പ്യൂട്ടർ:</b> ${data.device} (${data.os})\n🔋 <b>ബാറ്ററി:</b> ${data.battery_level}\n📶 <b>നെറ്റ്‌വർക്ക്:</b> ${data.network_type} (ISP: ${isp})\n🌐 <b>IP:</b> ${ip}`;
        await sendTelegramText(alertMsg);

        // 3. Email Alert
        const emailHtml = `
            <div style="font-family: sans-serif; padding: 20px;">
                <h3 style="color: #d9534f;">🚨 പുതിയ സന്ദർശകൻ എത്തിയിട്ടുണ്ട്!</h3>
                <p><b>🌍 സ്ഥലം:</b> ${city}, ${country}</p>
                <p><b>📱 ഉപകരണം:</b> ${data.device} (${data.os})</p>
                <p><b>🔋 ബാറ്ററി:</b> ${data.battery_level}</p>
                <p><b>📶 നെറ്റ്‌വർക്ക്:</b> ${data.network_type} (ISP: ${isp})</p>
                <p><b>🌐 IP:</b> ${ip}</p>
            </div>
        `;
        await sendEmailAlert("🚨 പുതിയ വെബ്സൈറ്റ് സന്ദർശകൻ", emailHtml);

        res.status(200).json({ message: "Logged" });
    } catch (error) { res.status(500).json({ error: "Failed" }); }
});

app.delete('/api/messages/:id', authMiddleware, async (req, res) => {
    try { await pool.query('DELETE FROM "Manhaj form" WHERE id = $1', [req.params.id]); res.json({ message: "Deleted" }); } 
    catch (error) { res.status(500).json({ error: "Failed" }); }
});

// ==========================================
// DASHBOARD
// ==========================================
app.get('/', authMiddleware, async (req, res) => {
    try {
        const visitors = await pool.query('SELECT * FROM visitors_advanced_log ORDER BY visit_time DESC LIMIT 50');
        const messages = await pool.query('SELECT * FROM "Manhaj form" ORDER BY id DESC LIMIT 50');
        const totalVisits = visitors.rows.length; const totalMessages = messages.rows.length; const uniqueIPs = new Set(visitors.rows.map(v => v.ip_address)).size;
        
        let html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Manhajulhidaya | Admin</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script src="https://unpkg.com/lucide@latest"></script><style>:root { --bg-base: #111315; --bg-surface: #1c1c1f; --border-subtle: #2e2e32; --brand-primary: #3ecf8e; --text-main: #ededed; --text-muted: #8b8d91; --danger: #f56565; --font-main: 'Inter', sans-serif; } * { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: var(--font-main); background-color: var(--bg-base); color: var(--text-main); display: flex; min-height: 100vh; } .sidebar { width: 260px; background-color: var(--bg-base); border-right: 1px solid var(--border-subtle); padding: 24px 16px; position: fixed; height: 100vh; display: flex; flex-direction: column; z-index: 100; } .brand { display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 16px; color: #fff; margin-bottom: 40px; } .brand .logo-icon { background: var(--brand-primary); color: #000; padding: 4px; border-radius: 6px; } .nav-menu { display: flex; flex-direction: column; gap: 4px; flex: 1;} .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 6px; color: var(--text-muted); cursor: pointer; } .nav-item:hover { background: #2a2a2e; color: var(--text-main); } .nav-item.active { background: rgba(62, 207, 142, 0.1); color: var(--brand-primary); } .main-layout { flex: 1; margin-left: 260px; display: flex; flex-direction: column; } .topbar { height: 64px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; background: rgba(17, 19, 21, 0.8); position: sticky; top: 0; z-index: 10; } .content { padding: 32px; max-width: 1200px; margin: 0 auto; width: 100%; } .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 32px; } .stat-card { background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 20px; } .stat-title { color: var(--text-muted); font-size: 13px; font-weight: 500; display: flex; justify-content: space-between; margin-bottom: 12px; } .stat-value { font-size: 28px; font-weight: 600; color: #fff; } .section-container { background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 12px; margin-bottom: 32px; overflow: hidden; } .section-header { padding: 20px 24px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; } .table-responsive { width: 100%; overflow-x: auto; max-height: 500px; } table { width: 100%; border-collapse: collapse; text-align: left; } th, td { padding: 16px 20px; font-size: 13px; border-bottom: 1px solid var(--border-subtle); vertical-align: top; } th { color: var(--text-muted); background: var(--bg-base); position: sticky; top: 0; } tr:hover td { background: rgba(255, 255, 255, 0.02); } .text-bold { font-weight: 500; color: var(--text-main); margin-bottom: 4px;} .sub-text { display: block; font-size: 12px; color: var(--text-muted); margin-top: 4px; line-height: 1.5; } .photo-box { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-subtle); } .btn-icon { background: transparent; border: 1px solid var(--border-subtle); color: var(--text-muted); padding: 8px; border-radius: 6px; cursor: pointer; } .btn-icon:hover { color: var(--danger); border-color: rgba(245, 101, 101, 0.5); } @media (max-width: 768px) { .sidebar { display: none; } .main-layout { margin-left: 0; } }</style></head><body><aside class="sidebar"><div class="brand"><div class="logo-icon"><i data-lucide="database" size="18"></i></div>Manhajulhidaya</div><div class="nav-menu"><div class="nav-item active"><i data-lucide="layout-dashboard" size="18"></i> Overview</div><div class="nav-item" onclick="document.getElementById('admissions-sec').scrollIntoView({behavior: 'smooth'})"><i data-lucide="users-2" size="18"></i> Admissions</div><div class="nav-item" onclick="document.getElementById('visitors-sec').scrollIntoView({behavior: 'smooth'})"><i data-lucide="globe" size="18"></i> Visitor Logs</div><a href="/logout" class="nav-item logout-btn" style="margin-top:auto;color:#f56565;"><i data-lucide="log-out" size="18"></i> Logout</a></div></aside><main class="main-layout"><header class="topbar"><div class="breadcrumb">Admin / <span style="color:#ededed">Dashboard</span></div></header><div class="content"><div class="stats-grid"><div class="stat-card"><div class="stat-title">Total Visitors <i data-lucide="bar-chart-2" size="16"></i></div><div class="stat-value">${totalVisits}</div></div><div class="stat-card"><div class="stat-title">Unique Devices <i data-lucide="smartphone" size="16"></i></div><div class="stat-value">${uniqueIPs}</div></div><div class="stat-card"><div class="stat-title">Admissions <i data-lucide="graduation-cap" size="16"></i></div><div class="stat-value">${totalMessages}</div></div></div><div class="section-container" id="admissions-sec"><div class="section-header"><div style="font-size:16px;font-weight:500;display:flex;align-items:center;gap:8px"><i data-lucide="file-text" size="18"></i> Admission Applications</div></div><div class="table-responsive"><table><tr><th>Photo</th><th>Applicant</th><th>Course/Parents</th><th>Address</th><th>Action</th></tr>${messages.rows.map(row => `<tr id="msg-row-${row.id}"><td>${row.photo && row.photo.includes('base64') ? `<img src="${row.photo}" class="photo-box">` : `<div style="width:60px;height:60px;border:1px dashed #2e2e32;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#8b8d91">No Photo</div>`}</td><td><div class="text-bold">${row.name}</div><span class="sub-text">DOB: ${row.dob || 'N/A'}</span><span class="sub-text">Ph: ${row.phone}<br>WA: ${row.whatsapp || 'N/A'}</span></td><td><div class="text-bold" style="color:#3ecf8e">${row.class_selected || 'N/A'}</div><span class="sub-text">Qual: ${row.qualification || 'N/A'}</span><span class="sub-text">Father: ${row.father_name || 'N/A'}</span><span class="sub-text">Mother: ${row.mother_name || 'N/A'}</span></td><td><div style="color:#c9cbcd;font-size:13px;max-width:250px">${row.address || 'N/A'}</div></td><td><button class="btn-icon" onclick="deleteMsg(${row.id})"><i data-lucide="trash-2" size="16"></i></button></td></tr>`).join('')}</table></div></div><div class="section-container" id="visitors-sec"><div class="section-header"><div style="font-size:16px;font-weight:500;display:flex;align-items:center;gap:8px"><i data-lucide="globe" size="18"></i> Global Access Logs</div></div><div class="table-responsive"><table><tr><th>Time</th><th>Location & IP</th><th>Device & Network</th></tr>${visitors.rows.map(row => `<tr><td><span class="sub-text">${new Date(row.visit_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })}</span></td><td><div class="text-bold">${row.country !== 'Unknown' ? row.country + ', ' + row.city : 'Unknown Location'}</div><span class="sub-text">IP: ${row.ip_address}</span></td><td><div class="text-bold">${row.device} • ${row.os}</div><span class="sub-text">Batt: ${row.battery_level} | Net: ${row.network_type}</span></td></tr>`).join('')}</table></div></div></div></main><script>lucide.createIcons(); async function deleteMsg(id) { if(confirm("Delete this application?")) { const res = await fetch('/api/messages/'+id, {method:'DELETE'}); if(res.ok) document.getElementById('msg-row-'+id).style.display='none'; } }</script></body></html>`;
        res.send(html);
    } catch (error) { res.status(500).send("Error"); }
});

app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });
