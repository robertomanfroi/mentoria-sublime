const authService = require('./auth.service');

function register(req, res, next) {
  try {
    const result = authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

function login(req, res, next) {
  try {
    const result = authService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

function me(req, res, next) {
  try {
    const user = authService.me(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
