const monthlyService = require('./monthly.service');
const { sanitizeMonthlyData } = require('../../utils/formatters');

function getHistory(req, res, next) {
  try {
    const rows = monthlyService.getHistory(req.user.id);
    res.json(rows.map(sanitizeMonthlyData));
  } catch (err) {
    next(err);
  }
}

function getByMonth(req, res, next) {
  try {
    const row = monthlyService.getByMonth(req.user.id, req.params.month);
    // Mentorada vê seus próprios dados incluindo revenue
    res.json(row);
  } catch (err) {
    next(err);
  }
}

function upsertMonth(req, res, next) {
  try {
    const row = monthlyService.upsertMonth(req.user.id, req.params.month, req.body);
    // Usuário pode ver seu próprio revenue ao enviar dados
    const { revenue, revenue_previous, ...safe } = row;
    res.json({ ...safe, revenue, revenue_previous });
  } catch (err) {
    next(err);
  }
}

function uploadProof(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }
    const row = monthlyService.updateProof(req.user.id, req.params.month, req.file.filename);
    res.json({ message: 'Comprovante enviado com sucesso.', data: sanitizeMonthlyData(row) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getHistory, getByMonth, upsertMonth, uploadProof };
