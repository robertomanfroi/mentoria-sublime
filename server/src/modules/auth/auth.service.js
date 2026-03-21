const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/database');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../config/env');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    instagram: row.instagram_handle,
    avatar_url: row.profile_photo ? `/uploads/${row.profile_photo}` : null,
    role: row.role,
    created_at: row.created_at,
  };
}

function register({ name, email, password, instagram_handle }) {
  if (!name || !email || !password) {
    const err = new Error('Nome, e-mail e senha são obrigatórios.');
    err.status = 400;
    throw err;
  }

  if (password.length < 6) {
    const err = new Error('A senha deve ter pelo menos 6 caracteres.');
    err.status = 400;
    throw err;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    const err = new Error('E-mail já cadastrado.');
    err.status = 409;
    throw err;
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (name, email, password_hash, instagram_handle, role) VALUES (?, ?, ?, ?, ?)'
  ).run(name.trim(), email.toLowerCase().trim(), password_hash, instagram_handle || null, 'mentorada');

  const row = db.prepare('SELECT id, name, email, instagram_handle, profile_photo, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = generateToken(row);
  return { token, user: mapUser(row) };
}

function login({ email, password }) {
  if (!email || !password) {
    const err = new Error('email e password são obrigatórios.');
    err.status = 400;
    throw err;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user) {
    const err = new Error('Credenciais inválidas.');
    err.status = 401;
    throw err;
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    const err = new Error('Credenciais inválidas.');
    err.status = 401;
    throw err;
  }

  const token = generateToken(user);
  return { token, user: mapUser(user) };
}

function me(userId) {
  const row = db.prepare(
    'SELECT id, name, email, instagram_handle, profile_photo, role, created_at FROM users WHERE id = ?'
  ).get(userId);
  if (!row) {
    const err = new Error('Usuário não encontrado.');
    err.status = 404;
    throw err;
  }
  return mapUser(row);
}

module.exports = { register, login, me, mapUser };
