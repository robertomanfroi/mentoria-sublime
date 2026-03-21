const prizesService = require('./prizes.service');

async function getPrizes(req, res, next) {
  try {
    const prizes = await prizesService.getActivePrizes();
    res.json(prizes);
  } catch (err) {
    next(err);
  }
}

module.exports = { getPrizes };
