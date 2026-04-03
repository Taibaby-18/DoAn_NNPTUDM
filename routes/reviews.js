const express = require('express');
const { protect } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');
const router = express.Router();

router.post('/', protect, async function (req, res, next) {
  try {
    const { gameId, rating, comment } = req.body;
    const userId = req.user._id;
    const result = await reviewController.AddReview(gameId, rating, comment, userId);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/:gameId', async function (req, res, next) {
  try {
    const result = await reviewController.GetGameReviews(req.params.gameId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
