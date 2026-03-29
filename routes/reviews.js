const express = require('express');
const { protect } = require('../middleware/auth');
const { addReview, getGameReviews } = require('../controllers/reviewController');
const router = express.Router();

// Bắt buộc đăng nhập mới được viết review
router.post('/', protect, addReview); 

// Ai cũng xem được review (không cần protect)
router.get('/:gameId', getGameReviews); 

module.exports = router;