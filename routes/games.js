const express = require('express');
const gameController = require('../controllers/gameController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', async function (req, res, next) {
  try {
    const result = await gameController.GetAllGames(req.query.page, req.query.limit, req.query.name, req.query.category);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= API CHI TIẾT GAME ================= //

router.get('/:id', async function (req, res, next) {
  try {
    const result = await gameController.GetGameById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Game not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
