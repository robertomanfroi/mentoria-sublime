require('dotenv').config();
const { PORT } = require('./config/env');
const { migrate } = require('./db/migrate');
const app = require('./app');

// Evita crash por erros assíncronos não capturados
process.on('unhandledRejection', (reason) => {
  console.error('[process] UnhandledRejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[process] UncaughtException:', err);
});

// Executa migrations e seeds antes de iniciar o servidor
(async () => {
  try {
    await migrate();
  } catch (err) {
    console.error('[index] Falha crítica nas migrations:', err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[server] Rodando em http://localhost:${PORT}`);
    console.log(`[server] Health check: http://localhost:${PORT}/health`);
    console.log(`[server] Ambiente: ${process.env.NODE_ENV || 'development'}`);

    // Self-ping a cada 14 minutos para evitar hibernação no Render free tier
    // (Render hiberna após 15min — ping a cada 14min mantém o serviço vivo)
    if (process.env.NODE_ENV === 'production') {
      const https = require('https');
      const selfUrl = process.env.RENDER_EXTERNAL_URL || 'https://mentoria-sublime.onrender.com';
      const pingUrl = `${selfUrl}/health`;
      console.log(`[keepalive] Iniciando self-ping a cada 14min → ${pingUrl}`);
      setInterval(() => {
        https.get(pingUrl, (res) => {
          console.log(`[keepalive] ping → ${res.statusCode}`);
        }).on('error', (err) => {
          console.warn('[keepalive] erro no ping:', err.message);
        });
      }, 14 * 60 * 1000); // 14 min
    }
  });
})();
