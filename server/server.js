import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { IndividualRegistration } from './models/IndividualRegistration.js';
import { SchoolRegistration } from './models/SchoolRegistration.js';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Static serve uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));


// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${ts}_${safe}`);
  },
});
const upload = multer({ storage });

// DB connect with retry
const MONGO_URI = process.env.MONGO_URI;
async function connectWithRetry() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
  } catch (e) {
    console.error('MongoDB error', e?.message || e);
    setTimeout(connectWithRetry, 5000);
  }
}
connectWithRetry();

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/health/db', (req, res) => {
  const state = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  const map = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({ ok: state === 1, state, stateText: map[state] || 'unknown' });
});

// Public endpoints
app.post('/api/public/registrations/individual', async (req, res) => {
  try {
    const doc = await IndividualRegistration.create({
      ...req.body,
      createdAt: new Date(),
    });
    res.status(201).json({ id: doc._id });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post(
  '/api/public/registrations/school',
  upload.single('participantSheet'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'File is required' });
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      const doc = await SchoolRegistration.create({
        ...req.body,
        fileName: req.file.originalname,
        filePath: `/uploads/${req.file.filename}`,
        downloadURL: fileUrl,
        createdAt: new Date(),
      });
      res.status(201).json({ id: doc._id, downloadURL: fileUrl });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
);

// Admin auth
function createToken(payload) {
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  return jwt.sign(payload, secret, { expiresIn: '12h' });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body || {};
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
  if (email === adminEmail && password === adminPassword) {
    const token = createToken({ email });
    return res.json({ token, email });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

// Admin protected routes
app.get('/api/admin/registrations/individual', authMiddleware, async (req, res) => {
  const docs = await IndividualRegistration.find().sort({ createdAt: -1 }).lean();
  res.json(docs);
});

app.get('/api/admin/registrations/school', authMiddleware, async (req, res) => {
  const docs = await SchoolRegistration.find().sort({ createdAt: -1 }).lean();
  res.json(docs);
});

// Serve frontend (production) or provide a friendly root route
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API server is running. Start the client with "npm run dev" in the client folder and open http://localhost:5173');
  });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
