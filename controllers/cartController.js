const User = require('../models/User');
const Game = require('../models/Game');
const Transaction = require('../models/Transaction');

// 1. Thêm game vào giỏ hàng
const addToCart = async (req, res) => {
  try {
    const { gameId } = req.body;
    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId);
    const game = await Game.findById(gameId);

    if (!game) return res.status(404).json({ success: false, message: 'Game không tồn tại!' });
    
    // Check xem đã mua chưa
    if (user.library && user.library.includes(gameId)) {
      return res.status(400).json({ success: false, message: 'Bạn đã sở hữu game này rồi!' });
    }
    
    // Check xem đã có trong giỏ chưa
    if (user.cart && user.cart.includes(gameId)) {
      return res.status(400).json({ success: false, message: 'Game này đã nằm trong giỏ hàng!' });
    }

    user.cart.push(gameId);
    await user.save();
    res.status(200).json({ success: true, message: 'Đã thêm vào giỏ hàng thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm vào giỏ' });
  }
};

// 2. Xem giỏ hàng & Tính tổng tiền (ĐÃ SỬA LỖI ĐỒNG BỘ VỚI USER)
const getCart = async (req, res) => {
    try {
        // Tìm User và lôi cái mảng 'cart' ra, nhúng thêm Tên, Giá, và Hình ảnh
        const user = await User.findById(req.user.id).populate('cart', 'title price thumbnail imageUrl'); 
            
        // Nếu user không có cart hoặc cart rỗng
        if (!user || !user.cart || user.cart.length === 0) {
            return res.status(200).json({ success: true, cart: [], totalPrice: 0 });
        }

        // Tính tổng tiền
        let totalPrice = 0;
        user.cart.forEach(game => {
            totalPrice += game.price || 0;
        });

        // Trả về đúng mảng cart của user
        res.status(200).json({ 
            success: true, 
            cart: user.cart, 
            totalPrice: totalPrice 
        });
    } catch (error) {
        console.error("LỖI LẤY GIỎ HÀNG:", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy giỏ hàng' });
    }
};

// 3. Thanh toán toàn bộ giỏ hàng (Trùm cuối thực sự)
const checkoutCart = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    // Lấy user và thông tin giá của từng game trong giỏ
    const user = await User.findById(userId).populate('cart');

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng đang trống!' });
    }

    // Tính tổng tiền
    const totalPrice = user.cart.reduce((total, game) => total + game.price, 0);

    // Kiểm tra ví
    if (user.walletBalance < totalPrice) {
      return res.status(400).json({ success: false, message: `Ví không đủ tiền. Cần thêm ${totalPrice - user.walletBalance} để thanh toán!` });
    }

    // Trừ tiền
    user.walletBalance -= totalPrice;

    // Chuyển game từ cart sang library và tạo hóa đơn (Transaction)
    for (let game of user.cart) {
      user.library.push(game._id);
      
      await Transaction.create({
        user: user._id,
        game: game._id,
        price: game.price,
        status: 'completed'
      });
    }

    // Làm sạch giỏ hàng sau khi mua xong
    user.cart = [];
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'Thanh toán giỏ hàng thành công!', 
      newBalance: user.walletBalance 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server khi thanh toán giỏ hàng' });
  }
};

// 4. Xóa một game cụ thể khỏi giỏ hàng
const removeFromCart = async (req, res) => {
  try {
    const { gameId } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User không tồn tại' });

    // Lọc bỏ gameId ra khỏi mảng cart
    user.cart = user.cart.filter(id => id.toString() !== gameId);
    
    await user.save();

    res.status(200).json({ success: true, message: 'Đã xóa game khỏi giỏ hàng!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa game' });
  }
};

module.exports = { addToCart, getCart, checkoutCart, removeFromCart };