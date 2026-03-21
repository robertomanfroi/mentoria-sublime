const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, '../../data/mentoria.db');

const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (e) {
    // Fallback para diretório local se não tiver permissão (ex: Render free plan)
    dbPath = path.join(__dirname, '../../data/mentoria.db');
    const localDir = path.dirname(dbPath);
    if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
  }
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;
