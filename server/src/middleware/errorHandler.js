function errorHandler(err, req, res, next) {
  console.error('[errorHandler]', err.message || err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Arquivo muito grande. Limite de 5MB.' });
  }

  if (err.message && err.message.includes('Tipo de arquivo não permitido')) {
    return res.status(400).json({ error: err.message });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.expose ? err.message : (status < 500 ? err.message : 'Erro interno do servidor.');

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
