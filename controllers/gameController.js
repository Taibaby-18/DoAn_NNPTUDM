const Game = require('../models/Game');

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
        // Chỉ lấy game cơ bản, tạm bỏ populate để không bị xung đột ID cũ
        const games = await Game.find();
            
        res.status(200).json({ success: true, count: games.length, data: games });
    } catch (error) {
        // Tôi thêm dòng này để lỡ có lỗi nó sẽ in thẳng ra Terminal cho ông thấy rõ mười mươi
        console.error("LỖI THẬT SỰ LÀ ĐÂY NÈ TÀI:", error); 
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách game' });
    }
};

// 3. Lấy chi tiết 1 game (Bản trâu bò chống sập)
const getGameById = async (req, res) => {
    try {
        // Tạm ẩn populate để tương thích với data cũ chưa có Category/Publisher
        const game = await Game.findById(req.params.id);
        
        if (!game) return res.status(404).json({ success: false, message: 'Không tìm thấy game!' });
        
        res.status(200).json({ success: true, data: game });
    } catch (error) {
        console.error("LỖI CHI TIẾT GAME:", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy chi tiết game' });
    }
};

// Xuất khẩu đủ bộ 3 phép thuật
module.exports = { createGame, getAllGames, getGameById };