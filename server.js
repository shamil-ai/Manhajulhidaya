const express = require('express');
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 10000;

app.set('trust proxy', true);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Cookie Parser Middleware

// CORS Setup
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Database Setup
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Telegram Bot Setup
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramMessage(message) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' })
        });
    } catch (err) { console.error('Telegram Error:', err); }
}

// ==========================================
// ADMIN LOGIN SECURITY (Cookie Based)
// ==========================================
const adminUsername = process.env.ADMIN_USERNAME || 'shamil';
const adminPassword = process.env.ADMIN_PASSWORD || 'shamil123';

// Auth Middleware using Cookies
const authMiddleware = (req, res, next) => {
    const token = req.cookies.admin_session;
    // Simple verification (In production, use JWT)
    if (token && token === Buffer.from(`${adminUsername}:${adminPassword}`).toString('base64')) {
        return next();
    }
    res.redirect('/login');
};

// ==========================================
// AUTHENTICATION APIs & PAGES
// ==========================================

// 1. Serve Login Page
app.get('/login', (req, res) => {
    const token = req.cookies.admin_session;
    if (token && token === Buffer.from(`${adminUsername}:${adminPassword}`).toString('base64')) {
        return res.redirect('/');
    }
    
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Login | Grafyxora</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
            body { background-color: #111315; color: #ededed; display: flex; justify-content: center; align-items: center; height: 100vh; }
            .login-card { background: #1c1c1f; padding: 40px; border-radius: 12px; border: 1px solid #2e2e32; width: 100%; max-width: 400px; box-shadow: 0 8px 30px rgba(0,0,0,0.5); }
            h2 { font-weight: 600; margin-bottom: 8px; text-align: center; }
            p { color: #8b8d91; font-size: 14px; text-align: center; margin-bottom: 24px; }
            .input-group { margin-bottom: 16px; }
            label { display: block; font-size: 13px; color: #8b8d91; margin-bottom: 6px; }
            input { width: 100%; padding: 12px 16px; background: #111315; border: 1px solid #2e2e32; border-radius: 8px; color: #fff; font-size: 14px; outline: none; transition: 0.2s; }
            input:focus { border-color: #3ecf8e; }
            button { width: 100%; padding: 12px; background: #3ecf8e; color: #000; font-weight: 600; font-size: 14px; border: none; border-radius: 8px; cursor: pointer; transition: 0.2s; margin-top: 10px; }
            button:hover { background: #35b87e; }
            .error { color: #f56565; font-size: 13px; margin-top: 10px; text-align: center; display: none; }
        </style>
    </head>
    <body>
        <div class="login-card">
            <h2>Welcome Back</h2>
            <p>Sign in to access your dashboard</p>
            <form id="loginForm">
                <div class="input-group">
                    <label>Username</label>
                    <input type="text" id="username" required autocomplete="off">
                </div>
                <div class="input-group">
                    <label>Password</label>
                    <input type="password" id="password" required>
                </div>
                <button type="submit">Sign In</button>
                <div id="errorMsg" class="error">Invalid username or password.</div>
            </form>
        </div>

        <script>
            document.getElementById('loginForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const u = document.getElementById('username').value;
                const p = document.getElementById('password').value;
                const btn = e.target.querySelector('button');
                btn.textContent = "Verifying...";
                
                const res = await fetch('/api/login', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: u, password: p })
                });
                
                if (res.ok) { window.location.href = '/'; } 
                else { 
                    document.getElementById('errorMsg').style.display = 'block'; 
                    btn.textContent = "Sign In";
                }
            });
        </script>
    </body>
    </html>
    `);
});

// 2. Handle Login Verification
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === adminUsername && password === adminPassword) {
        const token = Buffer.from(`${username}:${password}`).toString('base64');
        res.cookie('admin_session', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 24 * 60 * 60 * 1000 // 1 Day
        });
        return res.status(200).json({ success: true });
    }
    res.status(401).json({ success: false, message: "Unauthorized" });
});

// 3. Handle Logout
app.get('/logout', (req, res) => {
    res.clearCookie('admin_session');
    res.redirect('/login');
});


// ==========================================
// PUBLIC APIs (വെബ്സൈറ്റിൽ നിന്നും വരുന്നവ)
// ==========================================
app.post('/submit', async (req, res) => {
    const { name, email, contact, message } = req.body;
    try {
        const query = `INSERT INTO contacts (name, email, contact, message) VALUES ($1, $2, $3, $4) RETURNING *;`;
        const result = await pool.query(query, [name, email, contact, message]);
        const telegramMsg = `📩 <b>പുതിയ കോൺടാക്റ്റ് മെസ്സേജ്!</b>\n👤 <b>Name:</b> ${name}\n📞 <b>Phone:</b> ${contact}`;
        await sendTelegramMessage(telegramMsg);
        res.status(200).json({ message: "Success", data: result.rows[0] });
    } catch (error) { res.status(500).json({ error: "Failed to save contact data" }); }
});

app.post('/log-visit-advanced', async (req, res) => {
    const data = req.body;
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (ip && ip.includes(',')) ip = ip.split(',')[0].trim();
    let country = 'Unknown', city = 'Unknown';
    try {
        if (ip && ip !== '::1' && ip !== '127.0.0.1') {
            const geo = await (await fetch(`http://ip-api.com/json/${ip}`)).json();
            if (geo.status === 'success') { country = geo.country; city = geo.city; }
        }
    } catch (error) {}
    try {
        const query = `INSERT INTO visitors_advanced_log (visitor_id, ip_address, country, city, device, os, network_type, battery_level) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
        await pool.query(query, [data.visitor_id || 'Unknown', ip, country, city, data.device || 'Unknown', data.os || 'Unknown', data.network_type || 'Unknown', data.battery_level || 'Unknown']);
        res.status(200).json({ message: "Visit logged" });
    } catch (error) { res.status(500).json({ error: "Failed to log" }); }
});

// ==========================================
// PRIVATE APIs (CRUD Operations) - Protected
// ==========================================
app.delete('/api/messages/:id', authMiddleware, async (req, res) => {
    try {
        await pool.query('DELETE FROM contacts WHERE id = $1', [req.params.id]);
        res.json({ message: "Deleted successfully" });
    } catch (error) { res.status(500).json({ error: "Failed to delete" }); }
});

app.put('/api/messages/:id', authMiddleware, async (req, res) => {
    const { name, contact, message } = req.body;
    try {
        await pool.query('UPDATE contacts SET name = $1, contact = $2, message = $3 WHERE id = $4', [name, contact, message, req.params.id]);
        res.json({ message: "Updated successfully" });
    } catch (error) { res.status(500).json({ error: "Failed to update" }); }
});

// ==========================================
// MAIN PREMIUM UI DASHBOARD (Protected)
// ==========================================
app.get('/', authMiddleware, async (req, res) => {
    try {
        const visitors = await pool.query('SELECT * FROM visitors_advanced_log ORDER BY visit_time DESC LIMIT 50');
        const messages = await pool.query('SELECT * FROM contacts ORDER BY id DESC LIMIT 50');

        const totalVisits = visitors.rows.length;
        const totalMessages = messages.rows.length;
        const uniqueIPs = new Set(visitors.rows.map(v => v.ip_address)).size;

        const visitorDates = visitors.rows.map(r => new Date(r.visit_time).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }));
        const dateCounts = visitorDates.reduce((acc, date) => { acc[date] = (acc[date] || 0) + 1; return acc; }, {});
        const chartLabels = JSON.stringify(Object.keys(dateCounts).reverse());
        const chartData = JSON.stringify(Object.values(dateCounts).reverse());

        let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Project Dashboard | Admin</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <script src="https://unpkg.com/lucide@latest"></script>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            
            <style>
                :root {
                    --bg-base: #111315;
                    --bg-surface: #1c1c1f;
                    --bg-surface-hover: #2a2a2e;
                    --border-subtle: #2e2e32;
                    --brand-primary: #3ecf8e;
                    --text-main: #ededed;
                    --text-muted: #8b8d91;
                    --danger: #f56565;
                    --font-main: 'Inter', -apple-system, sans-serif;
                }

                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: var(--font-main); background-color: var(--bg-base); color: var(--text-main); display: flex; min-height: 100vh; overflow-x: hidden; }
                
                /* Sidebar */
                .sidebar { width: 260px; background-color: var(--bg-base); border-right: 1px solid var(--border-subtle); padding: 24px 16px; position: fixed; height: 100vh; display: flex; flex-direction: column; }
                .brand { display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 16px; color: #fff; margin-bottom: 40px; padding-left: 8px; }
                .brand .logo-icon { background: var(--brand-primary); color: #000; padding: 4px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
                
                .nav-menu { display: flex; flex-direction: column; gap: 4px; flex: 1;}
                .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 6px; color: var(--text-muted); text-decoration: none; font-size: 14px; font-weight: 500; transition: 0.2s; cursor: pointer; }
                .nav-item:hover { background: var(--bg-surface-hover); color: var(--text-main); }
                .nav-item.active { background: rgba(62, 207, 142, 0.1); color: var(--brand-primary); }
                
                /* Logout Button at bottom */
                .logout-btn { color: var(--danger); margin-top: auto; border: 1px solid rgba(245, 101, 101, 0.2); }
                .logout-btn:hover { background: rgba(245, 101, 101, 0.1); color: var(--danger); border-color: rgba(245, 101, 101, 0.5);}

                /* Main Content Area */
                .main-layout { flex: 1; margin-left: 260px; display: flex; flex-direction: column; }
                
                /* Top Header */
                .topbar { height: 64px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; background: rgba(17, 19, 21, 0.8); backdrop-filter: blur(8px); position: sticky; top: 0; z-index: 10; }
                .breadcrumb { font-size: 14px; color: var(--text-muted); }
                .breadcrumb span { color: var(--text-main); font-weight: 500; }
                .topbar-actions { display: flex; align-items: center; gap: 16px; }
                .status-badge { font-size: 12px; background: rgba(62,207,142,0.15); color: var(--brand-primary); padding: 4px 10px; border-radius: 20px; display: flex; align-items: center; gap: 6px; border: 1px solid rgba(62,207,142,0.3); }
                .status-dot { width: 6px; height: 6px; background: var(--brand-primary); border-radius: 50%; box-shadow: 0 0 8px var(--brand-primary); }

                /* Content Padding */
                .content { padding: 32px; max-width: 1200px; margin: 0 auto; width: 100%; }

                /* Stats Grid */
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 32px; }
                .stat-card { background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 20px; transition: transform 0.2s, box-shadow 0.2s; }
                .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); border-color: #3e3e42; }
                .stat-title { color: var(--text-muted); font-size: 13px; font-weight: 500; display: flex; justify-content: space-between; margin-bottom: 12px; }
                .stat-value { font-size: 28px; font-weight: 600; color: #fff; }

                /* Sections & Tables */
                .section-container { background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 12px; margin-bottom: 32px; overflow: hidden; }
                .section-header { padding: 20px 24px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; }
                .section-title { font-size: 16px; font-weight: 500; display: flex; align-items: center; gap: 8px; }
                
                .table-responsive { width: 100%; overflow-x: auto; max-height: 400px; }
                table { width: 100%; border-collapse: collapse; text-align: left; }
                th, td { padding: 16px 24px; font-size: 13px; border-bottom: 1px solid var(--border-subtle); }
                th { color: var(--text-muted); font-weight: 500; background: var(--bg-base); position: sticky; top: 0; z-index: 5; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
                tr:hover td { background: rgba(255, 255, 255, 0.02); }
                tr:last-child td { border-bottom: none; }
                
                .text-bold { font-weight: 500; color: var(--text-main); }
                .sub-text { display: block; font-size: 12px; color: var(--text-muted); margin-top: 4px; }
                .badge { background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); padding: 2px 8px; border-radius: 4px; font-size: 11px; color: var(--text-muted); }

                /* Chart */
                .chart-wrapper { padding: 24px; height: 350px; }

                /* Action Buttons */
                .actions { display: flex; gap: 8px; }
                .btn-icon { background: transparent; border: 1px solid var(--border-subtle); color: var(--text-muted); padding: 6px; border-radius: 6px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
                .btn-icon:hover { background: var(--bg-surface-hover); color: var(--text-main); }
                .btn-edit:hover { color: #4299e1; border-color: rgba(66, 153, 225, 0.5); }
                .btn-delete:hover { color: var(--danger); border-color: rgba(245, 101, 101, 0.5); }

                @media (max-width: 768px) {
                    .sidebar { display: none; }
                    .main-layout { margin-left: 0; }
                }
            </style>
        </head>
        <body>

            <!-- SIDEBAR -->
            <aside class="sidebar">
                <div class="brand">
                    <div class="logo-icon"><i data-lucide="database" size="18"></i></div>
                    Grafyxora Admin
                </div>
                <div class="nav-menu">
                    <div class="nav-item active"><i data-lucide="layout-dashboard" size="18"></i> Overview</div>
                    <div class="nav-item" onclick="document.getElementById('messages-sec').scrollIntoView({behavior: 'smooth'})"><i data-lucide="message-square" size="18"></i> Messages</div>
                    <div class="nav-item" onclick="document.getElementById('visitors-sec').scrollIntoView({behavior: 'smooth'})"><i data-lucide="users" size="18"></i> Visitor Logs</div>
                    <a href="/logout" class="nav-item logout-btn"><i data-lucide="log-out" size="18"></i> Logout Session</a>
                </div>
            </aside>

            <!-- MAIN CONTENT -->
            <main class="main-layout">
                <!-- TOP NAVBAR -->
                <header class="topbar">
                    <div class="breadcrumb">Grafyxora / <span>Dashboard</span></div>
                    <div class="topbar-actions">
                        <div class="status-badge">
                            <div class="status-dot"></div> Production
                        </div>
                    </div>
                </header>

                <div class="content">
                    <!-- STATS WIDGETS -->
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-title">Total Visitors <i data-lucide="bar-chart-2" size="16"></i></div>
                            <div class="stat-value">${totalVisits}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-title">Unique Devices <i data-lucide="smartphone" size="16"></i></div>
                            <div class="stat-value">${uniqueIPs}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-title">Inbox Messages <i data-lucide="mail" size="16"></i></div>
                            <div class="stat-value">${totalMessages}</div>
                        </div>
                    </div>

                    <!-- ANALYTICS CHART -->
                    <div class="section-container">
                        <div class="section-header">
                            <div class="section-title"><i data-lucide="activity" size="18" style="color:var(--brand-primary)"></i> Traffic Overview</div>
                        </div>
                        <div class="chart-wrapper">
                            <canvas id="trafficChart"></canvas>
                        </div>
                    </div>

                    <!-- MESSAGES TABLE -->
                    <div class="section-container" id="messages-sec">
                        <div class="section-header">
                            <div class="section-title"><i data-lucide="inbox" size="18"></i> Client Messages</div>
                        </div>
                        <div class="table-responsive">
                            <table>
                                <tr>
                                    <th>Contact Info</th>
                                    <th>Message Details</th>
                                    <th style="width: 100px;">Actions</th>
                                </tr>
                                ${messages.rows.map(row => `
                                    <tr id="msg-row-${row.id}">
                                        <td>
                                            <div class="text-bold" id="name-${row.id}">${row.name}</div>
                                            <span class="sub-text" id="contact-${row.id}">${row.contact || row.email}</span>
                                        </td>
                                        <td>
                                            <div style="color: #c9cbcd;" id="message-${row.id}">${row.message || 'No content provided.'}</div>
                                        </td>
                                        <td>
                                            <div class="actions">
                                                <button class="btn-icon btn-edit" onclick="editMsg(${row.id})" title="Edit"><i data-lucide="pencil" size="14"></i></button>
                                                <button class="btn-icon btn-delete" onclick="deleteMsg(${row.id})" title="Delete"><i data-lucide="trash-2" size="14"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </table>
                        </div>
                    </div>

                    <!-- VISITOR LOGS TABLE -->
                    <div class="section-container" id="visitors-sec">
                        <div class="section-header">
                            <div class="section-title"><i data-lucide="globe" size="18"></i> Global Access Logs</div>
                        </div>
                        <div class="table-responsive">
                            <table>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Location & IP</th>
                                    <th>Device Info</th>
                                </tr>
                                ${visitors.rows.map(row => {
                                    let date = new Date(row.visit_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
                                    return `
                                    <tr>
                                        <td><span class="sub-text">${date}</span></td>
                                        <td>
                                            <div class="text-bold">${row.country !== 'Unknown' ? row.country + ', ' + row.city : 'Unknown Location'}</div>
                                            <span class="sub-text">IP / Net: <span class="badge">${row.network_type}</span></span>
                                        </td>
                                        <td>
                                            <div class="text-bold">${row.device} • ${row.os}</div>
                                            <span class="sub-text">Battery: ${row.battery_level}</span>
                                        </td>
                                    </tr>`;
                                }).join('')}
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            <script>
                lucide.createIcons();
                
                // Chart.js Setup (Supabase Green Theme)
                const ctx = document.getElementById('trafficChart').getContext('2d');
                let gradient = ctx.createLinearGradient(0, 0, 0, 350);
                gradient.addColorStop(0, 'rgba(62, 207, 142, 0.3)'); 
                gradient.addColorStop(1, 'rgba(62, 207, 142, 0.0)');
                
                new Chart(ctx, {
                    type: 'line',
                    data: { 
                        labels: ${chartLabels}, 
                        datasets: [{ 
                            label: 'Visits', 
                            data: ${chartData}, 
                            borderColor: '#3ecf8e', 
                            backgroundColor: gradient, 
                            borderWidth: 2, 
                            pointBackgroundColor: '#1c1c1f',
                            pointBorderColor: '#3ecf8e',
                            pointHoverBackgroundColor: '#3ecf8e',
                            fill: true, 
                            tension: 0.4 
                        }] 
                    },
                    options: { 
                        responsive: true, 
                        maintainAspectRatio: false, 
                        plugins: { legend: { display: false } }, 
                        scales: { 
                            x: { grid: { display: false }, ticks: { color: '#8b8d91' } }, 
                            y: { grid: { color: '#2e2e32' }, ticks: { color: '#8b8d91' }, beginAtZero: true } 
                        } 
                    }
                });

                // CRUD Operations
                async function editMsg(id) {
                    const newName = prompt("Edit Name:", document.getElementById('name-'+id).innerText);
                    if(!newName) return;
                    const newContact = prompt("Edit Contact:", document.getElementById('contact-'+id).innerText);
                    const newMessage = prompt("Edit Message:", document.getElementById('message-'+id).innerText);

                    if (newName && newContact && newMessage) {
                        const response = await fetch('/api/messages/' + id, {
                            method: 'PUT', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: newName, contact: newContact, message: newMessage })
                        });
                        if(response.ok) {
                            document.getElementById('name-'+id).innerText = newName;
                            document.getElementById('contact-'+id).innerText = newContact;
                            document.getElementById('message-'+id).innerText = newMessage;
                            alert("Message details updated.");
                        } else alert("Failed to update.");
                    }
                }

                async function deleteMsg(id) {
                    if (confirm("Are you sure you want to delete this message?")) {
                        const response = await fetch('/api/messages/' + id, { method: 'DELETE' });
                        if(response.ok) { 
                            document.getElementById('msg-row-'+id).style.display = 'none';
                        } else alert("Failed to delete.");
                    }
                }
            </script>
        </body>
        </html>
        `;
        res.send(html);
    } catch (error) { res.status(500).send("Error fetching data from database!"); }
});

app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });