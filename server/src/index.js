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

    // Self-ping a cada 10 minutos para evitar hibernação no Render free tier
    if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
      const https = require('https');
      setInterval(() => {
        const url = `${process.env.RENDER_EXTERNAL_URL}/health`;
        https.get(url, (res) => {
          console.log(`[keepalive] ping ${url} → ${res.statusCode}`);
        }).on('error', (err) => {
          console.warn('[keepalive] erro no ping:', err.message);
        });
      }, 10 * 60 * 1000); // 10 min
    }
  });
})();
