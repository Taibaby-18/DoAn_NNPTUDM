const express = require('express');
const gameController = require('../controllers/gameController');
const { protect, authorize } = require('../middleware/auth');
const { uploadGameMedia } = require('../middleware/upload');
const router = express.Router();

router.get('/', async function (req, res, next) {
  try {
    const result = await gameController.GetAllGames(req.query.page, req.query.limit, req.query.name, req.query.category);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= API DÀNH CHO PUBLISHER ================= //

router.get('/my-games', protect, authorize('Publisher'), async function (req, res, next) {
  try {
    const publisherId = req.user._id || req.user.id;
    const result = await gameController.GetMyGames(publisherId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, authorize('Publisher'), uploadGameMedia, async function (req, res, next) {
  try {
    const { title, description, price, pcRequirements, category, trailerUrl } = req.body;
    const publisherId = req.user._id || req.user.id;

    const thumbnail = req.files && req.files['thumbnail'] ? `/uploads/${req.files['thumbnail'][0].filename}` : '';
    const gallery = req.files && req.files['gallery'] ? req.files['gallery'].map(file => `/uploads/${file.filename}`) : [];
    const trailerVideo = req.files && req.files['trailer'] ? `/uploads/${req.files['trailer'][0].filename}` : trailerUrl || '';

    const result = await gameController.CreateGame(title, description, price, pcRequirements, category, publisherId, thumbnail, gallery, trailerVideo);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


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