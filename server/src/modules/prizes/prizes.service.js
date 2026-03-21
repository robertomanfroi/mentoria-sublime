const db = require('../../config/database');

function getActivePrizes() {
  return db.prepare('SELECT * FROM prizes WHERE active = 1 ORDER BY position ASC').all();
}

function getAllPrizes() {
  return db.prepare('SELECT * FROM prizes ORDER BY position ASC').all();
}

function updatePrize(id, { title, description, active }) {
  const existing = db.prepare('SELECT id FROM prizes WHERE id = ?').get(id);
  if (!existing) {
    const err = new Error('Prêmio não encontrado.');
    err.status = 404;
    throw err;
  }

  db.prepare(`
    UPDATE prizes SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      active = COALESCE(?, active)
    WHERE id = ?
  `).run(title ?? null, description ?? null, active ?? null, id);

  return db.prepare('SELECT * FROM prizes WHERE id = ?').get(id);
}

module.exports = { getActivePrizes, getAllPrizes, updatePrize };
