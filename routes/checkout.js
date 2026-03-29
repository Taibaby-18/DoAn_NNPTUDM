const express = require('express');
const { protect } = require('../middleware/auth');
const { buyGame } = require('../controllers/checkoutController');
const router = express.Router();

// Bắt buộc phải đăng nhập (có token) mới được mua game
router.post('/', protect, buyGame);

module.exports = router;