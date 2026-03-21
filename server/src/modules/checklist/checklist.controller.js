const checklistService = require('./checklist.service');

function getAllItems(req, res, next) {
  try {
    const items = checklistService.getAllItems(req.user.id);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

function toggleItem(req, res, next) {
  try {
    const result = checklistService.toggleItem(req.user.id, req.params.itemId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

function getProgress(req, res, next) {
  try {
    const progress = checklistService.getProgress(req.user.id);
    res.json(progress);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllItems, toggleItem, getProgress };
