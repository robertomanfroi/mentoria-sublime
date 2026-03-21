const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');
const authMiddleware = require('../../middleware/auth');
const upload = require('../../middleware/upload');

router.get('/profile', authMiddleware, usersController.getProfile);
router.put('/profile', authMiddleware, usersController.updateProfile);
router.post('/profile/photo', authMiddleware, upload.single('photo'), usersController.uploadPhoto);

module.exports = router;
