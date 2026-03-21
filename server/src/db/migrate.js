const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const migrationsDir = path.join(__dirname, 'migrations');
const checklistItemsSeed = require('./seeds/checklist_items');
const prizesSeed = require('./seeds/prizes');

function runMigrations() {
  console.log('[migrate] Iniciando migrations...');

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    for (const stmt of statements) {
      db.prepare(stmt).run();
    }
    console.log(`[migrate] Executado: ${file}`);
  }

  console.log('[migrate] Migrations concluídas.');
}

function seedChecklistItems() {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM checklist_items').get();
  if (count.cnt > 0) {
    console.log('[seed] checklist_items já populado, pulando.');
    return;
  }

  const insert = db.prepare(
    'INSERT INTO checklist_items (stage, description, sort_order, active) VALUES (?, ?, ?, 1)'
  );

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insert.run(item.stage, item.description, item.sort_order);
    }
  });

  insertMany(checklistItemsSeed);
  console.log(`[seed] ${checklistItemsSeed.length} checklist_items inseridos.`);
}

function seedPrizes() {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM prizes').get();
  if (count.cnt > 0) {
    console.log('[seed] prizes já populados, pulando.');
    return;
  }

  const insert = db.prepare(
    'INSERT INTO prizes (position, title, description, active) VALUES (?, ?, ?, 1)'
  );

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insert.run(item.position, item.title, item.description);
    }
  });

  insertMany(prizesSeed);
  console.log(`[seed] ${prizesSeed.length} prizes inseridos.`);
}

function seedAdminUser() {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@plataforma.com');
  if (existing) {
    console.log('[seed] Admin user já existe, pulando.');
    return;
  }

  const passwordHash = bcrypt.hashSync('admin123', 10);
  db.prepare(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
  ).run('Administrador', 'admin@plataforma.com', passwordHash, 'admin');

  console.log('[seed] Admin user criado: admin@plataforma.com / admin123');
}

function seedSampleMentoradas() {
  const samples = [
    { name: 'Ana Silva', email: 'ana@exemplo.com', instagram_handle: '@anasilva' },
    { name: 'Carla Souza', email: 'carla@exemplo.com', instagram_handle: '@carlasouza' },
    { name: 'Julia Mendes', email: 'julia@exemplo.com', instagram_handle: '@juliamendes' },
  ];

  const insert = db.prepare(
    'INSERT OR IGNORE INTO users (name, email, password_hash, instagram_handle, role) VALUES (?, ?, ?, ?, ?)'
  );

  const passwordHash = bcrypt.hashSync('senha123', 10);

  const insertMany = db.transaction((users) => {
    for (const u of users) {
      insert.run(u.name, u.email, passwordHash, u.instagram_handle, 'mentorada');
    }
  });

  insertMany(samples);
  console.log('[seed] 3 mentoradas de exemplo inseridas (ou já existentes).');
}

function migrate() {
  runMigrations();
  seedChecklistItems();
  seedPrizes();
  seedAdminUser();
  seedSampleMentoradas();
  console.log('[migrate] Setup completo.');
}

module.exports = { migrate };
