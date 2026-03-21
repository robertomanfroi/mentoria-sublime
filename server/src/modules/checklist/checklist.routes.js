const express = require('express');
const router = express.Router();
const checklistController = require('./checklist.controller');
const authMiddleware = require('../../middleware/auth');

router.use(authMiddleware);

router.get('/', checklistController.getAllItems);
router.get('/progress', checklistController.getProgress);
router.post('/:itemId/toggle', checklistController.toggleItem);

module.exports = router;
