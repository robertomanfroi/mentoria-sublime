const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('./auth.controller');
const authMiddleware = require('../../middleware/auth');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas. Aguarde 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Muitos cadastros do mesmo IP. Aguarde 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.get('/me', authMiddleware, authController.me);

module.exports = router;
