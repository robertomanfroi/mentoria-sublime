const express = require('express');
const router = express.Router();
const monthlyController = require('./monthly.controller');
const authMiddleware = require('../../middleware/auth');
const upload = require('../../middleware/upload');

router.use(authMiddleware);

router.get('/', monthlyController.getHistory);
router.get('/:month', monthlyController.getByMonth);
router.post('/:month', monthlyController.upsertMonth);
router.post('/:month/proof', upload.single('proof'), monthlyController.uploadProof);

module.exports = router;
