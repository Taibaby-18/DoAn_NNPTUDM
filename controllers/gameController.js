const Game = require('../models/Game');
const Category = require('../models/Category');
module.exports = {
  GetAllGames: async function (page = 1, limit = 0, name = '', category = '') {
    page = Math.max(parseInt(page), 1);
    const l = parseInt(limit);
    const actualLimit = l > 0 ? Math.min(l, 50) : 0;

    const filter = { status: 'approved' }; // CHỐT CHẶN: Chỉ show game đã duyệt

    if (name.trim()) {
      filter.title = { $regex: name.trim(), $options: 'i' };
    }

    if (category.trim()) {
      const c = category.trim();
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(c);
      if (isObjectId) {
        filter.category = c;
      } else {
        const found = await Category.findOne({ name: { $regex: `^${c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } }).select('_id');
        if (found) filter.category = found._id;
      }
    }

    const totalItems = await Game.countDocuments(filter);
    const query = Game.find(filter).populate('category', 'name').sort({ createdAt: -1 });

    if (actualLimit > 0) {
      query.skip((page - 1) * actualLimit).limit(actualLimit);
    }

    const games = await query;
    const totalPages = actualLimit > 0 ? Math.ceil(totalItems / actualLimit) : 1;

    return {
      success: true, count: games.length,
      pagination: { totalItems, totalPages, currentPage: page, limit: actualLimit > 0 ? actualLimit : totalItems },
      data: games
    };
  },

  // 3. Lấy danh sách danh mục (Chỉ tính game đã duyệt)
  GetGameCategories: async function () {
    const ids = await Game.distinct('category', { category: { $ne: null }, status: 'approved' });
    const categories = await Category.find({ _id: { $in: ids } }).select('_id name').sort({ name: 1 });
    return { success: true, count: categories.length, data: categories };
  },

  // 4. Lấy chi tiết 1 game
  GetGameById: async function (id) {
    const game = await Game.findById(id).populate('publisher', 'name').populate('category', 'name');
    if (!game) throw new Error('Game not found');
    return { success: true, data: game };
  },
};