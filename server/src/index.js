require('dotenv').config();
const { PORT } = require('./config/env');
const { migrate } = require('./db/migrate');
const app = require('./app');

// Executa migrations e seeds antes de iniciar o servidor
try {
  migrate();
} catch (err) {
  console.error('[index] Falha crítica nas migrations:', err);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`[server] Rodando em http://localhost:${PORT}`);
  console.log(`[server] Health check: http://localhost:${PORT}/health`);
  console.log(`[server] Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
