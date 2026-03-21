const { prepare } = require('../../config/database');

async function getAllItems(userId) {
  return prepare(`
    SELECT ci.id, ci.stage, ci.description, ci.sort_order,
      COALESCE(cp.completed, 0) as completed,
      cp.completed_at
    FROM checklist_items ci
    LEFT JOIN checklist_progress cp ON cp.checklist_item_id = ci.id AND cp.user_id = ?
    WHERE ci.active = 1
    ORDER BY ci.sort_order ASC
  `).all(userId);
}

async function toggleItem(userId, itemId) {
  const item = await prepare('SELECT id FROM checklist_items WHERE id = ? AND active = 1').get(itemId);
  if (!item) {
    const err = new Error('Item não encontrado.');
    err.status = 404;
    throw err;
  }

  const existing = await prepare(
    'SELECT id, completed FROM checklist_progress WHERE user_id = ? AND checklist_item_id = ?'
  ).get(userId, itemId);

  if (!existing) {
    await prepare(
      'INSERT INTO checklist_progress (user_id, checklist_item_id, completed, completed_at) VALUES (?, ?, 1, CURRENT_TIMESTAMP)'
    ).run(userId, itemId);
    return { completed: true };
  }

  const newCompleted = existing.completed === 1 ? 0 : 1;
  if (newCompleted === 1) {
    await prepare('UPDATE checklist_progress SET completed = 1, completed_at = CURRENT_TIMESTAMP WHERE id = ?').run(existing.id);
  } else {
    await prepare('UPDATE checklist_progress SET completed = 0, completed_at = NULL WHERE id = ?').run(existing.id);
  }

  return { completed: newCompleted === 1 };
}

async function getProgress(userId) {
  const totalRow = await prepare('SELECT COUNT(*) as cnt FROM checklist_items WHERE active = 1').get();
  const completedRow = await prepare(
    'SELECT COUNT(*) as cnt FROM checklist_progress WHERE user_id = ? AND completed = 1'
  ).get(userId);

  const total = totalRow.cnt;
  const completed = completedRow.cnt;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percentage };
}

module.exports = { getAllItems, toggleItem, getProgress };
