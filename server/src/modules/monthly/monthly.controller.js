const monthlyService = require('./monthly.service');
const { sanitizeMonthlyData } = require('../../utils/formatters');

async function getHistory(req, res, next) {
  try {
    const rows = await monthlyService.getHistory(req.user.id);
    res.json(rows.map(sanitizeMonthlyData));
  } catch (err) {
    next(err);
  }
}

async function getByMonth(req, res, next) {
  try {
    const row = await monthlyService.getByMonth(req.user.id, req.params.month);
    res.json(row);
  } catch (err) {
    next(err);
  }
}

async function upsertMonth(req, res, next) {
  try {
    const row = await monthlyService.upsertMonth(req.user.id, req.params.month, req.body);
    const { revenue, revenue_previous, ...safe } = row;
    res.json({ ...safe, revenue, revenue_previous });
  } catch (err) {
    next(err);
  }
}

async function uploadProof(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }
    const row = await monthlyService.updateProof(req.user.id, req.params.month, req.file.filename);
    res.json({ message: 'Comprovante enviado com sucesso.', data: sanitizeMonthlyData(row) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getHistory, getByMonth, upsertMonth, uploadProof };
