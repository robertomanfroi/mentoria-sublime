const express = require('express');
const router = express.Router();
const rankingController = require('./ranking.controller');
const authMiddleware = require('../../middleware/auth');

router.use(authMiddleware);

router.get('/', rankingController.getRanking);
router.get('/general', rankingController.getGeneralRanking);
router.get('/my-position', rankingController.getMyPosition);

module.exports = router;
