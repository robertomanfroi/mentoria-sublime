const usersService = require('./users.service');

function getProfile(req, res, next) {
  try {
    const user = usersService.getProfile(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

function updateProfile(req, res, next) {
  try {
    const user = usersService.updateProfile(req.user.id, req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

function uploadPhoto(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }
    const user = usersService.updateProfilePhoto(req.user.id, req.file.filename);
    res.json({ message: 'Foto atualizada com sucesso.', user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, uploadPhoto };
