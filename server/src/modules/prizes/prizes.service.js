const { prepare } = require('../../config/database');

async function getActivePrizes() {
  return prepare('SELECT * FROM prizes WHERE active = 1 ORDER BY position ASC').all();
}

async function getAllPrizes() {
  return prepare('SELECT * FROM prizes ORDER BY position ASC').all();
}

async function updatePrize(id, { title, description, active }) {
  const existing = await prepare('SELECT id FROM prizes WHERE id = ?').get(id);
  if (!existing) {
    const err = new Error('Prêmio não encontrado.');
    err.status = 404;
    throw err;
  }

  await prepare(`
    UPDATE prizes SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      active = COALESCE(?, active)
    WHERE id = ?
  `).run(title ?? null, description ?? null, active ?? null, id);

  return prepare('SELECT * FROM prizes WHERE id = ?').get(id);
}

module.exports = { getActivePrizes, getAllPrizes, updatePrize };
