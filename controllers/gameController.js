const Game = require('../models/Game');
const Category = require('../models/Category');

// 1. Tạo game mới (Đã nâng cấp nhận 1 đống file)
const createGame = async (req, res) => {
  try {
    const { title, description, price, pcRequirements, category, publisher, trailerUrl } = req.body;

    // Lấy đường dẫn ảnh bìa (kiểm tra an toàn xem có file không)
    const thumbnail = req.files && req.files['thumbnail'] ? `/uploads/${req.files['thumbnail'][0].filename}` : '';
    
    // Lấy mảng đường dẫn các ảnh gallery
    const gallery = req.files && req.files['gallery'] ? req.files['gallery'].map(file => `/uploads/${file.filename}`) : [];
    
    // Lấy video (ưu tiên file upload, nếu không có thì dùng link truyền tay từ body)
    const trailerVideo = req.files && req.files['trailer'] ? `/uploads/${req.files['trailer'][0].filename}` : (trailerUrl || '');

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

    res.status(201).json({ success: true, data: newGame });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Lấy toàn bộ danh sách Game (Bản trâu bò, chấp hết data cũ)
const getAllGames = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limitRaw = parseInt(req.query.limit, 10);
        const limit = Math.min(Math.max(limitRaw || 0, 0), 50); // 0 => không phân trang, max 50

        const { name, category } = req.query;

        const filter = {};
        if (typeof name === 'string' && name.trim()) {
            filter.title = { $regex: name.trim(), $options: 'i' };
        }

        if (typeof category === 'string' && category.trim()) {
            const c = category.trim();
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(c);
            if (isObjectId) {
                filter.category = c;
            } else {
                // Cho phép truyền name category (data cũ / FE đơn giản)
                const found = await Category.findOne({ name: { $regex: `^${c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } }).select('_id');
                if (found) filter.category = found._id;
                else filter.category = null; // không match => trả mảng rỗng
            }
        }

        const totalItems = await Game.countDocuments(filter);

        const query = Game.find(filter)
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        if (limit > 0) {
            query.skip((page - 1) * limit).limit(limit);
        }

        const games = await query;

        const totalPages = limit > 0 ? Math.max(Math.ceil(totalItems / limit), 1) : 1;
        const currentPage = limit > 0 ? Math.min(page, totalPages) : 1;

        res.status(200).json({
            success: true,
            count: games.length,
            pagination: {
                totalItems,
                totalPages,
                currentPage,
                limit: limit > 0 ? limit : totalItems
            },
            data: games
        });
    } catch (error) {
        // Tôi thêm dòng này để lỡ có lỗi nó sẽ in thẳng ra Terminal cho ông thấy rõ mười mươi
        console.error("LỖI THẬT SỰ LÀ ĐÂY NÈ TÀI:", error); 
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách game' });
    }
};

// 2.1 Lấy danh sách category để filter (chỉ những category đang có game)
const getGameCategories = async (req, res) => {
    try {
        const ids = await Game.distinct('category', { category: { $ne: null } });
        const categories = await Category.find({ _id: { $in: ids } })
            .select('_id name')
            .sort({ name: 1 });

        res.status(200).json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        console.error("LỖI LẤY CATEGORY:", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy category' });
    }
};

// 3. Lấy chi tiết 1 game (Bản trâu bò chống sập)
const getGameById = async (req, res) => {
    try {
        // Populate nhẹ để lấy name (nếu có). Data cũ có thể thiếu category/publisher -> vẫn OK.
        const game = await Game.findById(req.params.id)
          .populate('publisher', 'name')
          .populate('category', 'name');
        
        if (!game) return res.status(404).json({ success: false, message: 'Không tìm thấy game!' });
        
        res.status(200).json({ success: true, data: game });
    } catch (error) {
        console.error("LỖI CHI TIẾT GAME:", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy chi tiết game' });
    }
};

// Xuất khẩu đủ bộ 3 phép thuật
module.exports = { createGame, getAllGames, getGameCategories, getGameById };