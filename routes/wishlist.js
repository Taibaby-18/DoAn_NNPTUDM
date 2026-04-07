const express = require('express');
const { protect } = require('../middleware/auth');
const wishlistController = require('../controllers/User/wishlistController');
const router = express.Router();

router.post('/add', protect, async function (req, res, next) {
    try {
        const userId = req.user._id || req.user.id;
        const { gameId } = req.body;
        await wishlistController.AddToWishlist(userId, gameId);
        res.status(200).json({ success: true, message: 'Đã thêm vào danh sách yêu thích thành công!' });
    } catch (error) {
        const statusCode = error.message.includes('không tồn tại') ? 404 : 400;
        res.status(statusCode).json({ success: false, message: error.message });
    }
});

router.get('/', protect, async function (req, res, next) {
    try {
        const userId = req.user._id || req.user.id;
        const result = await wishlistController.GetWishlist(userId);
        res.status(200).json({ success: true, wishlist: result.wishlist, totalGames: result.totalGames });
    } catch (error) {
        console.error("LỖI LẤY DANH SÁCH YÊU THÍCH:", error);
        res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/remove', protect, async function (req, res, next) {
    try {
        const userId = req.user._id || req.user.id;
        const { gameId } = req.body;
        await wishlistController.RemoveFromWishlist(userId, gameId);
        res.status(200).json({ success: true, message: 'Đã xóa game khỏi danh sách yêu thích!' });
    } catch (error) {
        const statusCode = error.message.includes('không tồn tại') ? 404 : 500;
        res.status(statusCode).json({ success: false, message: error.message });
    }
});

module.exports = router;
