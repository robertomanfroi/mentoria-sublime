const adminService = require('./admin.service');

// ─── USERS ───────────────────────────────────────────────────────────────────

async function listUsers(req, res, next) {
  try {
    const { page, limit } = req.query;
    res.json(await adminService.listUsers({
      page: page ? Number(page) : 1,
      limit: limit ? Math.min(Number(limit), 500) : 100,
    }));
  } catch (err) { next(err); }
}

async function updateUser(req, res, next) {
  try { res.json(await adminService.updateUser(req.params.id, req.body)); } catch (err) { next(err); }
}

async function deleteUser(req, res, next) {
  try { res.json(await adminService.deleteUser(req.params.id)); } catch (err) { next(err); }
}

// ─── CHECKLIST ────────────────────────────────────────────────────────────────

async function listChecklistItems(req, res, next) {
  try { res.json(await adminService.listChecklistItems()); } catch (err) { next(err); }
}

async function addChecklistItem(req, res, next) {
  try { res.status(201).json(await adminService.addChecklistItem(req.body)); } catch (err) { next(err); }
}

async function updateChecklistItem(req, res, next) {
  try { res.json(await adminService.updateChecklistItem(req.params.id, req.body)); } catch (err) { next(err); }
}

async function deleteChecklistItem(req, res, next) {
  try { res.json(await adminService.deleteChecklistItem(req.params.id)); } catch (err) { next(err); }
}

// ─── VALIDATIONS ──────────────────────────────────────────────────────────────

const MONTH_RE = /^\d{4}-\d{2}$/;

async function listValidations(req, res, next) {
  try {
    const { month, page, limit } = req.query;
    if (month && !MONTH_RE.test(month)) {
      return res.status(400).json({ error: 'Formato de mês inválido. Use YYYY-MM.' });
    }
    res.json(await adminService.listPendingValidations(month, {
      page: page ? Number(page) : 1,
      limit: limit ? Math.min(Number(limit), 200) : 50,
    }));
  } catch (err) { next(err); }
}

async function setValidation(req, res, next) {
  try {
    const { approved } = req.body;
    if (approved === undefined) {
      return res.status(400).json({ error: 'Campo approved (boolean) é obrigatório.' });
    }
    res.json(await adminService.setValidation(req.params.id, approved));
  } catch (err) { next(err); }
}

async function approveAllPending(req, res, next) {
  try {
    const month = req.body.month || req.query.month;
    if (!month) return res.status(400).json({ error: 'Parâmetro month é obrigatório.' });
    const result = await adminService.approveAllPending(month);
    let rankingResult = null;
    let rankingError = null;
    try {
      rankingResult = await adminService.calculateAndSaveRanking(month);
    } catch (e) {
      console.error('[approveAll] falha ao calcular ranking:', e.message);
      rankingError = e.message;
    }
    if (rankingError) {
      return res.status(207).json({
        ...result,
        message: `${result.approved} submissões aprovadas, mas o ranking falhou ao ser recalculado.`,
        rankingError,
      });
    }
    res.json({
      ...result,
      ranking: rankingResult,
      message: `${result.approved} submissões aprovadas e ranking recalculado.`,
    });
  } catch (err) { next(err); }
}

// ─── PRIZES ───────────────────────────────────────────────────────────────────

async function listPrizes(req, res, next) {
  try { res.json(await adminService.listAllPrizes()); } catch (err) { next(err); }
}

async function updatePrize(req, res, next) {
  try { res.json(await adminService.updatePrize(req.params.id, req.body)); } catch (err) { next(err); }
}

// ─── RANKING ──────────────────────────────────────────────────────────────────

async function calculateRanking(req, res, next) {
  try {
    const month = req.body.month || req.query.month;
    if (!month) return res.status(400).json({ error: 'Parâmetro month é obrigatório. Ex: ?month=2024-03' });
    if (!MONTH_RE.test(month)) return res.status(400).json({ error: 'Formato de mês inválido. Use YYYY-MM.' });
    res.json(await adminService.calculateAndSaveRanking(month));
  } catch (err) { next(err); }
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────

async function exportCSV(req, res, next) {
  try {
    const csv = await adminService.exportCSV();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="mentoradas-export.csv"');
    res.send('\uFEFF' + csv); // BOM para Excel reconhecer UTF-8
  } catch (err) { next(err); }
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

async function getSettings(req, res, next) {
  try { res.json(await adminService.getSettings()); } catch (err) { next(err); }
}

async function updateSettings(req, res, next) {
  try { res.json(await adminService.updateSettings(req.body)); } catch (err) { next(err); }
}

module.exports = {
  listUsers, updateUser, deleteUser,
  listChecklistItems, addChecklistItem, updateChecklistItem, deleteChecklistItem,
  listValidations, setValidation, approveAllPending,
  listPrizes, updatePrize,
  calculateRanking,
  exportCSV,
  getSettings, updateSettings,
};
