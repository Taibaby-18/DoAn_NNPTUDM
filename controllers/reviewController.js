const Review = require('../models/Review');
const User = require('../models/User');
const Game = require('../models/Game');

// 1. Thêm đánh giá mới
const addReview = async (req, res) => {
  try {
    const { gameId, rating, comment } = req.body;
    const userId = req.user._id || req.user.id;

    // Check game có tồn tại không
    const game = await Game.findById(gameId);
    if (!game) return res.status(404).json({ success: false, message: 'Game không tồn tại!' });

    // Check quyền: Phải sở hữu game mới được review
    const user = await User.findById(userId);
    if (!user.library || !user.library.includes(gameId)) {
      return res.status(403).json({ success: false, message: 'Bạn phải mua game này mới được phép đánh giá!' });
    }

    // Check spam: Mỗi user chỉ được review 1 lần cho 1 game
    const existingReview = await Review.findOne({ user: userId, game: gameId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'Bạn đã đánh giá game này rồi!' });
    }

    // Tạo review
    const review = await Review.create({
      user: userId,
      game: gameId,
      rating,
      comment
    });

    res.status(201).json({ success: true, message: 'Cảm ơn bạn đã đánh giá!', review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm đánh giá' });
  }
};

// 2. Xem toàn bộ đánh giá của 1 game
const getGameReviews = async (req, res) => {
  try {
    const { gameId } = req.params;
    // Lấy danh sách review, nhúng thêm tên của người đánh giá vào cho đẹp
    const reviews = await Review.find({ game: gameId }).populate('user', 'username');
    
    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy đánh giá' });
  }
};

module.exports = { addReview, getGameReviews };