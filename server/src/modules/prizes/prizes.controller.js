const prizesService = require('./prizes.service');

function getPrizes(req, res, next) {
  try {
    const prizes = prizesService.getActivePrizes();
    res.json(prizes);
  } catch (err) {
    next(err);
  }
}

module.exports = { getPrizes };
