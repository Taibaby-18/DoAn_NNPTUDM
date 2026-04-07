const Game = require('../../models/Game');
const Category = require('../../models/Category');
const User = require('../../models/User');

module.exports = {

  CreateGame: async function (title, description, price, pcRequirements, category, publisher, thumbnail, gallery, trailerVideo) {
    const newGame = await Game.create({
      title,
      description,
      price,
      pcRequirements,
      category,
      publisher,
      thumbnail,
      gallery,
      trailerVideo
    });
    return { success: true, data: newGame };
  },

  UpdateGame: async function (gameId, userId, fieldsToUpdate) {
    const user = await User.findById(userId);
    if (!user || !user.publisherProfile) {
      throw new Error('Người dùng không có Publisher Profile');
    }

    const game = await Game.findById(gameId);
    if (!game) throw new Error('Game not found');

    // Chỉ cho phép Publisher sở hữu game mới được sửa
    if (game.publisher.toString() !== user.publisherProfile.toString()) {
      throw new Error('Bạn không có quyền chỉnh sửa game này');
    }

    // Reset status về pending khi publisher sửa game
    const updates = { ...fieldsToUpdate, status: 'pending' };

    const updatedGame = await Game.findByIdAndUpdate(
      gameId,
      updates,
      { new: true, runValidators: true }
    ).populate('category', 'name');

    return { success: true, data: updatedGame };
  },

  GetMyGames: async function (userId) {
    const user = await User.findById(userId);

    if (!user || !user.publisherProfile) {
      return { success: true, count: 0, data: [] };
    }

    // Tìm game dựa trên ID của Publisher Profile
    const games = await Game.find({ publisher: user.publisherProfile })
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    return {
      success: true,
      count: games.length,
      data: games
    };
  },
};
