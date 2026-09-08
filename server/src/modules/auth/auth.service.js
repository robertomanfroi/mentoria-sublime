const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { prepare } = require('../../config/database');
const { JWT_SECRET, JWT_EXPIRES_IN, APP_URL } = require('../../config/env');
const { sendPasswordResetEmail } = require('../../services/email.service');

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

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

function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
}

async function register({ name, email, password, instagram_handle }) {
  const cleanName  = sanitizeString(name);
  const cleanEmail = sanitizeString(email).toLowerCase();
  const cleanInsta = instagram_handle
    ? sanitizeString(instagram_handle).replace(/^@/, '')
    : null;

  if (!cleanName || !cleanEmail || !password) {
    const err = new Error('Nome, e-mail e senha são obrigatórios.');
    err.status = 400;
    throw err;
  }

  if (password.length < 6) {
    const err = new Error('A senha deve ter pelo menos 6 caracteres.');
    err.status = 400;
    throw err;
  }

  // Valida formato básico de e-mail
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    const err = new Error('Formato de e-mail inválido.');
    err.status = 400;
    throw err;
  }

  const existing = await prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
  if (existing) {
    const err = new Error('E-mail já cadastrado.');
    err.status = 409;
    throw err;
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const result = await prepare(
    'INSERT INTO users (name, email, password_hash, instagram_handle, role) VALUES (?, ?, ?, ?, ?)'
  ).run(cleanName, cleanEmail, password_hash, cleanInsta, 'mentorada');

  const row = await prepare('SELECT id, name, email, instagram_handle, profile_photo, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = generateToken(row);
  return { token, user: mapUser(row) };
}

async function login({ email, password }) {
  if (!email || !password) {
    const err = new Error('email e password são obrigatórios.');
    err.status = 400;
    throw err;
  }

  const user = await prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
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
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), action: 'login', userId: user.id, details: { email: user.email, role: user.role } }));
  return { token, user: mapUser(user) };
}

async function me(userId) {
  const row = await prepare(
    'SELECT id, name, email, instagram_handle, profile_photo, role, created_at FROM users WHERE id = ?'
  ).get(userId);
  if (!row) {
    const err = new Error('Usuário não encontrado.');
    err.status = 404;
    throw err;
  }
  return mapUser(row);
}

async function issuePasswordResetToken(user) {
  // Invalida tokens anteriores ainda não usados
  await prepare("UPDATE password_reset_tokens SET used_at = datetime('now') WHERE user_id = ? AND used_at IS NULL").run(user.id);

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();

  await prepare('INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)')
    .run(user.id, tokenHash, expiresAt);

  const resetUrl = `${APP_URL.replace(/\/$/, '')}/redefinir-senha?token=${rawToken}`;
  await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });
}

async function forgotPassword({ email }) {
  if (!email) {
    const err = new Error('E-mail é obrigatório.');
    err.status = 400;
    throw err;
  }
  const user = await prepare('SELECT id, name, email FROM users WHERE email = ? AND deleted_at IS NULL').get(email.toLowerCase().trim());
  // Retorna sucesso mesmo se e-mail não existe (segurança)
  if (user) {
    // Mantém o registro histórico usado pelo painel admin
    await prepare("UPDATE password_reset_requests SET status = 'cancelled' WHERE user_id = ? AND status = 'pending'").run(user.id);
    await prepare('INSERT INTO password_reset_requests (user_id, status) VALUES (?, ?)').run(user.id, 'pending');
    await issuePasswordResetToken(user);
  }
  return { message: 'Se o e-mail existir, enviamos um link de redefinição.' };
}

async function resetPassword({ token, new_password }) {
  if (!token || !new_password) {
    const err = new Error('Token e nova senha são obrigatórios.');
    err.status = 400;
    throw err;
  }
  if (new_password.length < 6) {
    const err = new Error('A senha deve ter pelo menos 6 caracteres.');
    err.status = 400;
    throw err;
  }

  const tokenHash = hashToken(token);
  const record = await prepare(
    "SELECT * FROM password_reset_tokens WHERE token_hash = ? AND used_at IS NULL AND expires_at > datetime('now')"
  ).get(tokenHash);

  if (!record) {
    const err = new Error('Link de redefinição inválido ou expirado.');
    err.status = 400;
    throw err;
  }

  const password_hash = bcrypt.hashSync(new_password, 10);
  await prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(password_hash, record.user_id);
  await prepare("UPDATE password_reset_tokens SET used_at = datetime('now') WHERE id = ?").run(record.id);
  await prepare("UPDATE password_reset_requests SET status = 'resolved' WHERE user_id = ? AND status = 'pending'").run(record.user_id);

  return { message: 'Senha redefinida com sucesso.' };
}

module.exports = { register, login, me, mapUser, forgotPassword, resetPassword, issuePasswordResetToken };
