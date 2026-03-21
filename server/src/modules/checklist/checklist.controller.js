const checklistService = require('./checklist.service');

async function getAllItems(req, res, next) {
  try {
    const items = await checklistService.getAllItems(req.user.id);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function toggleItem(req, res, next) {
  try {
    const result = await checklistService.toggleItem(req.user.id, req.params.itemId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getProgress(req, res, next) {
  try {
    const progress = await checklistService.getProgress(req.user.id);
    res.json(progress);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllItems, toggleItem, getProgress };
