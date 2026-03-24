const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const checklistRoutes = require('./modules/checklist/checklist.routes');
const monthlyRoutes = require('./modules/monthly/monthly.routes');
const rankingRoutes = require('./modules/ranking/ranking.routes');
const prizesRoutes = require('./modules/prizes/prizes.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── Middlewares globais ──────────────────────────────────────────────────────
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (mobile apps, Postman em dev)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Suprime tela de aviso do ngrok no browser
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

// ─── Static files (upload de fotos) ──────────────────────────────────────────
const uploadsRoot = process.env.UPLOADS_PATH
  ? path.resolve(process.env.UPLOADS_PATH)
  : path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsRoot));

// ─── Frontend em produção ─────────────────────────────────────────────────────
// Suporta estrutura local (../../client/dist) e deploy na raiz (../../client/dist ou ../public)
const clientBuild = process.env.CLIENT_BUILD_PATH
  ? path.resolve(process.env.CLIENT_BUILD_PATH)
  : path.join(__dirname, '../../client/dist');
const fs = require('fs');
console.log(`[app] Procurando frontend em: ${clientBuild}`);
console.log(`[app] Existe? ${fs.existsSync(clientBuild)}`);
if (fs.existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
}

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Rotas ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/monthly', monthlyRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/prizes', prizesRoutes);
app.use('/api/admin', adminRoutes);

// ─── SPA fallback (React Router) ─────────────────────────────────────────────
if (fs.existsSync(clientBuild)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
} else {
  // ─── 404 handler (dev) ───────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.path}` });
  });
}

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
