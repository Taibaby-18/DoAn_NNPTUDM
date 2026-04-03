const Review = require('../models/Review');
const User = require('../models/User');
const Game = require('../models/Game');

module.exports = {
  // Add new review
  AddReview: async function (gameId, rating, comment, userId) {
    const game = await Game.findById(gameId);
    if (!game) {
      throw new Error('Game không tồn tại!');
    }

    const user = await User.findById(userId);
    if (!user.library || !user.library.includes(gameId)) {
      throw new Error('Bạn phải mua game này mới được phép đánh giá!');
    }

    const existingReview = await Review.findOne({ user: userId, game: gameId });
    if (existingReview) {
      throw new Error('Bạn đã đánh giá game này rồi!');
    }

    const review = await Review.create({
      user: userId,
      game: gameId,
      rating,
      comment
    });

    return { success: true, message: 'Cảm ơn bạn đã đánh giá!', review };
  },

  // Get all reviews for a game
  GetGameReviews: async function (gameId) {
    const reviews = await Review.find({ game: gameId }).populate('user', 'username');
    return { success: true, count: reviews.length, reviews };
  }
};
