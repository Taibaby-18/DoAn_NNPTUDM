const express = require('express');
const Game = require('../models/Game');
const Category = require('../models/Category');
const gameController = require('../controllers/gameController');
const { protect, authorize } = require('../middleware/auth');
const { uploadGameMedia } = require('../middleware/upload');
const router = express.Router();

// GET /api/games - list all
router.get('/', async function (req, res, next) {
  try {
    const result = await gameController.GetAllGames(
      req.query.page,
      req.query.limit,
      req.query.name,
      req.query.category
    );
    res.status(200).json(result);
  } catch (error) {
    console.error('Game list error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/games - create (protected)
router.post('/', protect, authorize(['admin', 'publisher']), uploadGameMedia, async function (req, res, next) {
  try {
    const { title, description, price, pcRequirements, category, publisher, trailerUrl } = req.body;

    const thumbnail = req.files && req.files['thumbnail'] ? `/uploads/${req.files['thumbnail'][0].filename}` : '';
    const gallery = req.files && req.files['gallery'] ? req.files['gallery'].map(file => `/uploads/${file.filename}`) : [];
    const trailerVideo = req.files && req.files['trailer'] ? `/uploads/${req.files['trailer'][0].filename}` : trailerUrl || '';

    const result = await gameController.CreateGame(title, description, price, pcRequirements, category, publisher, thumbnail, gallery, trailerVideo);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/games/meta/categories
router.get('/meta/categories', async function (req, res, next) {
  try {
    const result = await gameController.GetGameCategories();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/games/:id
router.get('/:id', async function (req, res, next) {
  try {
    const result = await gameController.GetGameById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Game not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    console.error('Game detail error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
