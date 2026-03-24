const { prepare } = require('../../config/database');
const { mapUser } = require('../auth/auth.service');

function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
}

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
  const cleanName  = name !== undefined ? sanitizeString(name) : undefined;
  const cleanInsta = instagram_handle !== undefined
    ? sanitizeString(instagram_handle).replace(/^@/, '')
    : undefined;

  if (!cleanName && cleanInsta === undefined) {
    const err = new Error('Nenhum campo para atualizar.');
    err.status = 400;
    throw err;
  }

  const fields = [];
  const values = [];

  if (cleanName) { fields.push('name = ?'); values.push(cleanName); }
  if (cleanInsta !== undefined) { fields.push('instagram_handle = ?'); values.push(cleanInsta); }
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
