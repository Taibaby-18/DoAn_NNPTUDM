const express = require('express');
const { createGame, getAllGames, getGameCategories, getGameById } = require('../controllers/gameController');
const { protect, authorize } = require('../middleware/auth');
const { uploadGameMedia } = require('../middleware/upload'); // Import middleware mới
const router = express.Router();

router.route('/')
  .get(getAllGames)
  // Gắn uploadGameMedia vào đây, cho phép admin/publisher tạo game có file
  .post(protect, authorize('admin', 'publisher'), uploadGameMedia, createGame);

// Meta: category list cho filter (đặt trước /:id để tránh bị hiểu nhầm)
router.get('/meta/categories', getGameCategories);

// Route mới để xem chi tiết game
router.get('/:id', getGameById);

module.exports = router;