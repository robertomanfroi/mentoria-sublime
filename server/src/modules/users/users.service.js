const db = require('../../config/database');
const { mapUser } = require('../auth/auth.service');

function getProfile(userId) {
  const row = db.prepare(
    'SELECT id, name, email, instagram_handle, profile_photo, role, created_at, updated_at FROM users WHERE id = ?'
  ).get(userId);
  if (!row) {
    const err = new Error('Usuário não encontrado.');
    err.status = 404;
    throw err;
  }
  return mapUser(row);
}

function updateProfile(userId, { name, instagram_handle }) {
  if (!name && !instagram_handle) {
    const err = new Error('Nenhum campo para atualizar.');
    err.status = 400;
    throw err;
  }

  const fields = [];
  const values = [];

  if (name) { fields.push('name = ?'); values.push(name); }
  if (instagram_handle !== undefined) { fields.push('instagram_handle = ?'); values.push(instagram_handle); }
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(userId);

  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getProfile(userId);
}

function updateProfilePhoto(userId, filename) {
  db.prepare('UPDATE users SET profile_photo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(filename, userId);
  return getProfile(userId);
}

module.exports = { getProfile, updateProfile, updateProfilePhoto };
