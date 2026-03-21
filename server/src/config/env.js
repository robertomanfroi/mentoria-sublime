require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3001,
  JWT_SECRET: process.env.JWT_SECRET || 'mentoria_sublime_secret_fallback_dev',
  JWT_EXPIRES_IN: '7d',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
