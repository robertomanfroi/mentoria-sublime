const adminService = require('./admin.service');

// ─── USERS ───────────────────────────────────────────────────────────────────

function listUsers(req, res, next) {
  try { res.json(adminService.listUsers()); } catch (err) { next(err); }
}

function updateUser(req, res, next) {
  try { res.json(adminService.updateUser(req.params.id, req.body)); } catch (err) { next(err); }
}

function deleteUser(req, res, next) {
  try { res.json(adminService.deleteUser(req.params.id)); } catch (err) { next(err); }
}

// ─── CHECKLIST ────────────────────────────────────────────────────────────────

function listChecklistItems(req, res, next) {
  try { res.json(adminService.listChecklistItems()); } catch (err) { next(err); }
}

function addChecklistItem(req, res, next) {
  try { res.status(201).json(adminService.addChecklistItem(req.body)); } catch (err) { next(err); }
}

function updateChecklistItem(req, res, next) {
  try { res.json(adminService.updateChecklistItem(req.params.id, req.body)); } catch (err) { next(err); }
}

function deleteChecklistItem(req, res, next) {
  try { res.json(adminService.deleteChecklistItem(req.params.id)); } catch (err) { next(err); }
}

// ─── VALIDATIONS ──────────────────────────────────────────────────────────────

function listValidations(req, res, next) {
  try { res.json(adminService.listPendingValidations()); } catch (err) { next(err); }
}

function setValidation(req, res, next) {
  try {
    const { approved } = req.body;
    if (approved === undefined) {
      return res.status(400).json({ error: 'Campo approved (boolean) é obrigatório.' });
    }
    res.json(adminService.setValidation(req.params.id, approved));
  } catch (err) { next(err); }
}

// ─── PRIZES ───────────────────────────────────────────────────────────────────

function listPrizes(req, res, next) {
  try { res.json(adminService.listAllPrizes()); } catch (err) { next(err); }
}

function updatePrize(req, res, next) {
  try { res.json(adminService.updatePrize(req.params.id, req.body)); } catch (err) { next(err); }
}

// ─── RANKING ──────────────────────────────────────────────────────────────────

function calculateRanking(req, res, next) {
  try {
    const month = req.query.month;
    if (!month) return res.status(400).json({ error: 'Parâmetro month é obrigatório. Ex: ?month=2024-03' });
    res.json(adminService.calculateAndSaveRanking(month));
  } catch (err) { next(err); }
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────

function exportCSV(req, res, next) {
  try {
    const csv = adminService.exportCSV();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="mentoradas-export.csv"');
    res.send('\uFEFF' + csv); // BOM para Excel reconhecer UTF-8
  } catch (err) { next(err); }
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

function getSettings(req, res, next) {
  try { res.json(adminService.getSettings()); } catch (err) { next(err); }
}

function updateSettings(req, res, next) {
  try { res.json(adminService.updateSettings(req.body)); } catch (err) { next(err); }
}

module.exports = {
  listUsers, updateUser, deleteUser,
  listChecklistItems, addChecklistItem, updateChecklistItem, deleteChecklistItem,
  listValidations, setValidation,
  listPrizes, updatePrize,
  calculateRanking,
  exportCSV,
  getSettings, updateSettings,
};
