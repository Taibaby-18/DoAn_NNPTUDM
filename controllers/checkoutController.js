const User = require('../models/User');
const Game = require('../models/Game');
const Transaction = require('../models/Transaction');

const buyGame = async (req, res) => {
  try {
    const { gameId } = req.body;
    const userId = req.user._id || req.user.id; // Lấy ID của user đang đăng nhập từ Token

    // 1. Tìm Game xem có tồn tại không
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Game này!' });
    }

    // 2. Lấy thông tin User hiện tại
    const user = await User.findById(userId);

    // 3. Kiểm tra xem user đã mua game này chưa
    if (user.library && user.library.includes(gameId)) {
      return res.status(400).json({ success: false, message: 'Commander đã sở hữu tựa game này rồi!' });
    }

    // 4. Kiểm tra ví tiền
    if (user.walletBalance < game.price) {
      return res.status(400).json({ success: false, message: 'Ví không đủ tiền. Vui lòng nạp thêm!' });
    }

    // 5. Tiến hành thanh toán (Trừ tiền + Thêm game vào thư viện)
    user.walletBalance -= game.price;
    if (!user.library) user.library = [];
    user.library.push(game._id);

    // 6. Lưu lại lịch sử giao dịch (Biên lai)
    const transaction = await Transaction.create({
      user: user._id,
      game: game._id,
      price: game.price,
      status: 'completed'
    });

    // 7. Lưu thay đổi của User vào Database
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Thanh toán thành công! Game đã được thêm vào thư viện.',
      transaction,
      newBalance: user.walletBalance
    });

  } catch (error) {
    console.error("Lỗi thanh toán:", error);
    res.status(500).json({ success: false, message: 'Lỗi server trong quá trình thanh toán' });
  }
};

module.exports = { buyGame };