const { prepare } = require('../../config/database');
const { mapUser } = require('../auth/auth.service');

async function getProfile(userId) {
  const row = await prepare(
    'SELECT id, name, email, instagram_handle, profile_photo, role, created_at, updated_at FROM users WHERE id = ?'
  ).get(userId);
  if (!row) {
    const err = new Error('Usuário não encontrado.');
    err.status = 404;
    throw err;
  }
  return mapUser(row);
}

async function updateProfile(userId, { name, instagram_handle }) {
  if (!name && instagram_handle === undefined) {
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

  await prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getProfile(userId);
}

async function updateProfilePhoto(userId, filename) {
  await prepare('UPDATE users SET profile_photo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(filename, userId);
  return getProfile(userId);
}

module.exports = { getProfile, updateProfile, updateProfilePhoto };
