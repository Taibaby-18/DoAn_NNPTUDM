const express = require('express');
const { createGame, getAllGames, getGameById } = require('../controllers/gameController');
const { protect, authorize } = require('../middleware/auth');
const { uploadGameMedia } = require('../middleware/upload'); // Import middleware mới
const router = express.Router();

router.route('/')
  .get(getAllGames)
  // Gắn uploadGameMedia vào đây, cho phép admin/publisher tạo game có file
  .post(protect, authorize('admin', 'publisher'), uploadGameMedia, createGame);

// Route mới để xem chi tiết game
router.get('/:id', getGameById);

module.exports = router;