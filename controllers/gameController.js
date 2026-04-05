const Game = require('../models/Game');
const Category = require('../models/Category');
const User = require('../models/User');
module.exports = {
  // 1. Cho Publisher: Tạo game (Model tự động set status là 'pending')
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

  // 2. Cho Cửa hàng: Chỉ lấy những game đã duyệt ('approved')
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

  // 3. Cho Cửa hàng: Lấy danh sách danh mục (Chỉ tính game đã duyệt)
  GetGameCategories: async function () {
    const ids = await Game.distinct('category', { category: { $ne: null }, status: 'approved' });
    const categories = await Category.find({ _id: { $in: ids } }).select('_id name').sort({ name: 1 });
    return { success: true, count: categories.length, data: categories };
  },

  // 4. Cho Cửa hàng/Chi tiết: Lấy chi tiết 1 game
  GetGameById: async function (id) {
    const game = await Game.findById(id).populate('publisher', 'name').populate('category', 'name');
    if (!game) throw new Error('Game not found');
    return { success: true, data: game };
  },

  // 5. Cho Publisher: Xem danh sách game của chính mình đăng (Cả duyệt và chưa duyệt)
  GetMyGames: async function (userId) {
    // 1. Tìm User đó để lấy ra ID của Publisher mà họ quản lý
    const user = await User.findById(userId);

    if (!user || !user.publisherProfile) {
      return { success: true, count: 0, data: [] };
    }

    // 2. Tìm game dựa trên ID của Publisher Profile (Ví dụ: PlayStation Studios)
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