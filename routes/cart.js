const express = require('express');
const { protect } = require('../middleware/auth');
const cartController = require('../controllers/User/cartController');
const router = express.Router();

router.post('/add', protect, async function (req, res, next) {
    try {
        const userId = req.user._id || req.user.id;
        const { gameId } = req.body;
        await cartController.AddToCart(userId, gameId);
        res.status(200).json({ success: true, message: 'Đã thêm vào giỏ hàng thành công!' });
    } catch (error) {
        const statusCode = error.message.includes('không tồn tại') ? 404 : 400;
        res.status(statusCode).json({ success: false, message: error.message });
    }
});

router.get('/', protect, async function (req, res, next) {
    try {
        const userId = req.user._id || req.user.id;
        const result = await cartController.GetCart(userId);
        res.status(200).json({ success: true, cart: result.cart, totalPrice: result.totalPrice });
    } catch (error) {
        console.error("LỖI LẤY GIỎ HÀNG:", error);
        res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/checkout', protect, async function (req, res, next) {
    try {
        const userId = req.user._id || req.user.id;
        const newBalance = await cartController.CheckoutCart(userId);
        res.status(200).json({ success: true, message: 'Thanh toán giỏ hàng thành công!', newBalance: newBalance });
    } catch (error) {
        console.error(error);
        if (error.message.includes('Giỏ hàng đang trống!') || error.message.includes('Ví không đủ tiền')) {
            res.status(400).json({ success: false, message: error.message });
        } else {
            res.status(500).json({ success: false, message: 'Lỗi server khi thanh toán giỏ hàng' });
        }
    }
});

router.post('/remove', protect, async function (req, res, next) {
    try {
        const userId = req.user._id || req.user.id;
        const { gameId } = req.body;
        await cartController.RemoveFromCart(userId, gameId);
        res.status(200).json({ success: true, message: 'Đã xóa game khỏi giỏ hàng!' });
    } catch (error) {
        const statusCode = error.message.includes('không tồn tại') ? 404 : 500;
        res.status(statusCode).json({ success: false, message: error.message });
    }
});

module.exports = router;