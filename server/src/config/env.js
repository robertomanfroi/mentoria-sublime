require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';

if (isProd && !process.env.JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET não definido em produção. Configure a variável de ambiente.');
  process.exit(1);
}

module.exports = {
  PORT: process.env.PORT || 3001,
  JWT_SECRET: process.env.JWT_SECRET || 'mentoria_sublime_dev_only_secret_not_for_production',
  JWT_EXPIRES_IN: '7d',
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_URL: process.env.RENDER_EXTERNAL_URL || process.env.APP_URL || 'http://localhost:5173',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  RESEND_FROM: process.env.RESEND_FROM || 'Mentoria Sublime <nao-responda@suellenwarmling.com.br>',
};
