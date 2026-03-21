const rankingService = require('./ranking.service');

function getRanking(req, res, next) {
  try {
    const month = req.query.month;
    if (!month) {
      return res.status(400).json({ error: 'Parâmetro month é obrigatório. Ex: ?month=2024-03' });
    }
    const ranking = rankingService.getRankingForMonth(month);
    res.json(ranking);
  } catch (err) {
    next(err);
  }
}

function getMyPosition(req, res, next) {
  try {
    const month = req.query.month;
    if (!month) {
      return res.status(400).json({ error: 'Parâmetro month é obrigatório. Ex: ?month=2024-03' });
    }
    const position = rankingService.getMyPosition(req.user.id, month);
    res.json(position);
  } catch (err) {
    next(err);
  }
}

module.exports = { getRanking, getMyPosition };
