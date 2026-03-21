const express = require('express');
const router = express.Router();
const prizesController = require('./prizes.controller');
const authMiddleware = require('../../middleware/auth');

router.use(authMiddleware);

router.get('/', prizesController.getPrizes);

module.exports = router;
