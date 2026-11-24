// Kerala Free Food — Express + built-in SQLite (node:sqlite)
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'food.db');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SECRET = process.env.SESSION_SECRET || crypto.createHash('sha256').update('kff:' + ADMIN_PASSWORD).digest('hex');

if (!ADMIN_PASSWORD) console.warn('WARNING: ADMIN_PASSWORD is not set — admin login is disabled.');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    district TEXT NOT NULL,
    place TEXT NOT NULL,
    address TEXT,
    timing TEXT NOT NULL,
    contact TEXT,
    map_url TEXT,
    notes TEXT,
    submitter_name TEXT,
    submitter_contact TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL,
    reviewed_at TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_status ON listings(status);
  CREATE TABLE IF NOT EXISTS seeds_applied (key TEXT PRIMARY KEY, applied_at TEXT NOT NULL);
`);
// migrations: donation details
{
  const cols = db.prepare('PRAGMA table_info(listings)').all().map(c => c.name);
  if (!cols.includes('donate_url')) db.exec('ALTER TABLE listings ADD COLUMN donate_url TEXT');
  if (!cols.includes('donate_info')) db.exec('ALTER TABLE listings ADD COLUMN donate_info TEXT');
}

// One-time seed: each entry in seed.json is inserted once (approved) and never re-added,
// so listings the admin edits or deletes stay that way across redeploys.
try {
  const seeds = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed.json'), 'utf8'));
  const seen = db.prepare('SELECT 1 FROM seeds_applied WHERE key=?');
  const mark = db.prepare('INSERT INTO seeds_applied (key, applied_at) VALUES (?, ?)');
  const ins = db.prepare(`INSERT INTO listings (name,type,district,place,address,timing,contact,map_url,notes,donate_url,donate_info,submitter_name,status,created_at,reviewed_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,'Seed data',?,?,?)`);
  let added = 0;
  for (const s of seeds) {
    if (!s.key || seen.get(s.key)) continue;
    const t = new Date().toISOString();
    ins.run(s.name, s.type, s.district, s.place, s.address || '', s.timing, s.contact || '', s.map_url || '', s.notes || '', s.donate_url || '', s.donate_info || '', 'approved', t, t);
    mark.run(s.key, t);
    added++;
  }
  if (added) console.log(`Seeded ${added} listing(s).`);
} catch (e) {
  if (e.code !== 'ENOENT') console.error('Seed failed:', e.message);
}

// One-time corrections to seeded listings (only touches rows still marked as seed data).
try {
  const patches = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed_patches.json'), 'utf8'));
  const seen = db.prepare('SELECT 1 FROM seeds_applied WHERE key=?');
  const mark = db.prepare('INSERT INTO seeds_applied (key, applied_at) VALUES (?, ?)');
  const ALLOWED = ['timing', 'notes', 'address', 'contact', 'donate_url', 'donate_info', 'map_url'];
  let n = 0;
  for (const p of patches) {
    if (!p.key || seen.get(p.key)) continue;
    const cols = Object.keys(p.set || {}).filter(k => ALLOWED.includes(k));
    if (cols.length) {
      db.prepare(`UPDATE listings SET ${cols.map(c => c + '=?').join(',')} WHERE name=? AND submitter_name='Seed data'`)
        .run(...cols.map(c => String(p.set[c])), p.match_name);
    }
    mark.run(p.key, new Date().toISOString());
    n++;
  }
  if (n) console.log(`Applied ${n} seed correction(s).`);
} catch (e) {
  if (e.code !== 'ENOENT') console.error('Seed patches failed:', e.message);
}

const DISTRICTS = ['Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam',
  'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'];
const TYPES = ['Temple annadanam', 'Mosque / iftar', 'Church', 'Gurudwara langar', 'Community kitchen',
  'NGO / charity', 'Hospital food', 'Restaurant / shop', 'Other'];

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'"
  });
  next();
});

// ---------- helpers ----------
const now = () => new Date().toISOString();
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function validate(body) {
  const d = {
    name: str(body.name, 120), type: str(body.type, 40), district: str(body.district, 40),
    place: str(body.place, 80), address: str(body.address, 300), timing: str(body.timing, 200),
    contact: str(body.contact, 100), map_url: str(body.map_url, 500), notes: str(body.notes, 600),
    donate_url: str(body.donate_url, 500), donate_info: str(body.donate_info, 400),
    submitter_name: str(body.submitter_name, 80), submitter_contact: str(body.submitter_contact, 100)
  };
  const errors = [];
  if (d.name.length < 2) errors.push('Name of the place is required.');
  if (!TYPES.includes(d.type)) errors.push('Choose a type.');
  if (!DISTRICTS.includes(d.district)) errors.push('Choose a district.');
  if (d.place.length < 2) errors.push('Town / area is required.');
  if (d.timing.length < 2) errors.push('Timing is required.');
  if (d.map_url && !/^https:\/\/\S+$/i.test(d.map_url)) errors.push('Map link must start with https://');
  if (d.donate_url && !/^https:\/\/\S+$/i.test(d.donate_url)) errors.push('Donation link must start with https://');
  return { d, errors };
}

// simple in-memory rate limiter
const hits = new Map();
function limited(key, max, windowMs) {
  const t = Date.now();
  const arr = (hits.get(key) || []).filter(x => t - x < windowMs);
  arr.push(t);
  hits.set(key, arr);
  return arr.length > max;
}
setInterval(() => { const t = Date.now(); for (const [k, a] of hits) if (!a.some(x => t - x < 3600e3)) hits.delete(k); }, 600e3).unref();

// admin session: signed cookie
function sign(exp) { return exp + '.' + crypto.createHmac('sha256', SECRET).update('admin:' + exp).digest('hex'); }
function isAdmin(req) {
  const m = (req.headers.cookie || '').match(/(?:^|;\s*)kff_admin=([^;]+)/);
  if (!m || !ADMIN_PASSWORD) return false;
  const [exp] = m[1].split('.');
  if (!exp || Number(exp) < Date.now()) return false;
  const good = sign(exp);
  return good.length === m[1].length && crypto.timingSafeEqual(Buffer.from(good), Buffer.from(m[1]));
}
function requireAdmin(req, res, next) { isAdmin(req) ? next() : res.status(401).json({ error: 'Not logged in' }); }
function sameOrigin(req, res, next) {
  const o = req.headers.origin;
  let host = null;
  try { host = o ? new URL(o).host : null; } catch { host = 'bad'; }
  if (o && host !== req.headers.host) return res.status(403).json({ error: 'Bad origin' });
  next();
}

const PUBLIC_COLS = 'id, name, type, district, place, address, timing, contact, map_url, notes, donate_url, donate_info, reviewed_at';

// ---------- public API ----------
app.get('/api/meta', (req, res) => res.json({ districts: DISTRICTS, types: TYPES }));

app.get('/api/listings', (req, res) => {
  const rows = db.prepare(`SELECT ${PUBLIC_COLS} FROM listings WHERE status='approved' ORDER BY district, name`).all();
  res.json(rows);
});

app.post('/api/submissions', sameOrigin, (req, res) => {
  if (req.body && req.body.website) return res.json({ ok: true }); // honeypot
  if (limited('sub:' + req.ip, 5, 3600e3)) return res.status(429).json({ error: 'Too many submissions. Please try again in an hour.' });
  const { d, errors } = validate(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });
  const pending = db.prepare("SELECT COUNT(*) AS n FROM listings WHERE status='pending'").get().n;
  if (pending > 2000) return res.status(503).json({ error: 'The review queue is full. Please try again later.' });
  db.prepare(`INSERT INTO listings (name,type,district,place,address,timing,contact,map_url,notes,donate_url,donate_info,submitter_name,submitter_contact,status,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'pending',?)`)
    .run(d.name, d.type, d.district, d.place, d.address, d.timing, d.contact, d.map_url, d.notes, d.donate_url, d.donate_info, d.submitter_name, d.submitter_contact, now());
  res.json({ ok: true });
});

// ---------- admin API ----------
app.post('/api/admin/login', sameOrigin, (req, res) => {
  if (!ADMIN_PASSWORD) return res.status(503).json({ error: 'Admin password is not configured on the server.' });
  if (limited('login:' + req.ip, 10, 900e3)) return res.status(429).json({ error: 'Too many attempts. Wait 15 minutes.' });
  const pw = String((req.body && req.body.password) || '');
  const a = crypto.createHash('sha256').update(pw).digest();
  const b = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest();
  if (!crypto.timingSafeEqual(a, b)) return res.status(401).json({ error: 'Wrong password' });
  const exp = Date.now() + 7 * 864e5;
  const secure = req.secure ? '; Secure' : '';
  res.set('Set-Cookie', `kff_admin=${sign(exp)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${7 * 86400}${secure}`);
  res.json({ ok: true });
});

app.post('/api/admin/logout', (req, res) => {
  res.set('Set-Cookie', 'kff_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
  res.json({ ok: true });
});

app.get('/api/admin/me', (req, res) => res.json({ admin: isAdmin(req) }));

app.get('/api/admin/listings', requireAdmin, (req, res) => {
  const status = ['pending', 'approved', 'rejected'].includes(req.query.status) ? req.query.status : 'pending';
  const rows = db.prepare('SELECT * FROM listings WHERE status=? ORDER BY created_at DESC LIMIT 500').all(status);
  const counts = Object.fromEntries(db.prepare('SELECT status, COUNT(*) AS n FROM listings GROUP BY status').all().map(r => [r.status, r.n]));
  res.json({ rows, counts });
});

app.post('/api/admin/listings/:id/status', sameOrigin, requireAdmin, (req, res) => {
  const status = req.body && req.body.status;
  if (!['pending', 'approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Bad status' });
  const r = db.prepare('UPDATE listings SET status=?, reviewed_at=? WHERE id=?').run(status, now(), Number(req.params.id));
  r.changes ? res.json({ ok: true }) : res.status(404).json({ error: 'Not found' });
});

app.put('/api/admin/listings/:id', sameOrigin, requireAdmin, (req, res) => {
  const { d, errors } = validate(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });
  const r = db.prepare(`UPDATE listings SET name=?,type=?,district=?,place=?,address=?,timing=?,contact=?,map_url=?,notes=?,donate_url=?,donate_info=? WHERE id=?`)
    .run(d.name, d.type, d.district, d.place, d.address, d.timing, d.contact, d.map_url, d.notes, d.donate_url, d.donate_info, Number(req.params.id));
  r.changes ? res.json({ ok: true }) : res.status(404).json({ error: 'Not found' });
});

app.delete('/api/admin/listings/:id', sameOrigin, requireAdmin, (req, res) => {
  const r = db.prepare('DELETE FROM listings WHERE id=?').run(Number(req.params.id));
  r.changes ? res.json({ ok: true }) : res.status(404).json({ error: 'Not found' });
});

app.get('/health', (req, res) => res.send('ok'));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));

app.listen(PORT, () => console.log(`Kerala Free Food running on :${PORT} (db: ${DB_PATH})`));
