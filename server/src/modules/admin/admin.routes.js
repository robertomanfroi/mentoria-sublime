const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const adminController = require('./admin.controller');
const authMiddleware = require('../../middleware/auth');
const adminMiddleware = require('../../middleware/admin');

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
});

router.use(authMiddleware);
router.use(adminMiddleware);
router.use(adminLimiter);

// Users
router.get('/users', adminController.listUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Checklist
router.get('/checklist', adminController.listChecklistItems);
router.post('/checklist', adminController.addChecklistItem);
router.put('/checklist/:id', adminController.updateChecklistItem);
router.delete('/checklist/:id', adminController.deleteChecklistItem);

// Validations
router.get('/validations', adminController.listValidations);
router.put('/validations/:id', adminController.setValidation);
router.post('/validations/approve-all', adminController.approveAllPending);

// Prizes
router.get('/prizes', adminController.listPrizes);
router.put('/prizes/:id', adminController.updatePrize);

// Ranking
router.post('/ranking/calculate', adminController.calculateRanking);
router.get('/diagnostic', adminController.getMonthDiagnostic);

// Export
router.get('/export', adminController.exportCSV);
router.get('/export/ranking', adminController.exportCSV);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

module.exports = router;
