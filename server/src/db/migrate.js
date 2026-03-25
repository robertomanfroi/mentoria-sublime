const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { prepare, execRaw } = require('../config/database');

const migrationsDir = path.join(__dirname, 'migrations');
const checklistItemsSeed = require('./seeds/checklist_items');
const prizesSeed = require('./seeds/prizes');

async function runMigrations() {
  console.log('[migrate] Iniciando migrations...');

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    for (const stmt of statements) {
      await execRaw(stmt.trim());
    }
    console.log(`[migrate] Executado: ${file}`);
  }

  console.log('[migrate] Migrations concluídas.');
}

async function seedChecklistItems() {
  const count = await prepare('SELECT COUNT(*) as cnt FROM checklist_items').get();
  if (count.cnt > 0) {
    console.log('[seed] checklist_items já populado, pulando.');
    return;
  }

  for (const item of checklistItemsSeed) {
    await prepare('INSERT INTO checklist_items (stage, description, sort_order, active) VALUES (?, ?, ?, 1)')
      .run(item.stage, item.description, item.sort_order);
  }
  console.log(`[seed] ${checklistItemsSeed.length} checklist_items inseridos.`);
}

async function seedPrizes() {
  const count = await prepare('SELECT COUNT(*) as cnt FROM prizes').get();
  if (count.cnt > 0) {
    console.log('[seed] prizes já populados, pulando.');
    return;
  }

  for (const item of prizesSeed) {
    await prepare('INSERT INTO prizes (position, title, description, active) VALUES (?, ?, ?, 1)')
      .run(item.position, item.title, item.description);
  }
  console.log(`[seed] ${prizesSeed.length} prizes inseridos.`);
}

async function seedAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@plataforma.com';
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword && process.env.NODE_ENV === 'production') {
    console.error('[seed] ADMIN_PASSWORD não definido em produção. Configure a variável de ambiente.');
    return;
  }

  const password = adminPassword || 'admin123';

  const existing = await prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (existing) {
    console.log('[seed] Admin user já existe, pulando.');
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  await prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
    .run('Administrador', adminEmail, passwordHash, 'admin');

  console.log(`[seed] Admin user criado: ${adminEmail}`);
}

async function seedSampleMentoradas() {
  const samples = [
    { name: 'Ana Silva', email: 'ana@exemplo.com', instagram_handle: '@anasilva' },
    { name: 'Carla Souza', email: 'carla@exemplo.com', instagram_handle: '@carlasouza' },
    { name: 'Julia Mendes', email: 'julia@exemplo.com', instagram_handle: '@juliamendes' },
  ];

  const samplePassword = process.env.SAMPLE_USER_PASSWORD || 'senha123';
  const passwordHash = bcrypt.hashSync(samplePassword, 10);
  for (const u of samples) {
    const exists = await prepare('SELECT id FROM users WHERE email = ?').get(u.email);
    if (!exists) {
      await prepare('INSERT INTO users (name, email, password_hash, instagram_handle, role) VALUES (?, ?, ?, ?, ?)')
        .run(u.name, u.email, passwordHash, u.instagram_handle, 'mentorada');
    }
  }
  console.log('[seed] Mentoradas de exemplo inseridas (ou já existentes).');
}

async function migrate() {
  await runMigrations();
  await seedChecklistItems();
  await seedPrizes();
  await seedAdminUser();
  await seedSampleMentoradas();
  console.log('[migrate] Setup completo.');
}

module.exports = { migrate };
