const express = require('express');
const { protect } = require('../middleware/auth');
const checkoutController = require('../controllers/User/checkoutController');
const router = express.Router();

router.post('/buy', protect, async function (req, res, next) {
    try {
        const userId = req.user._id || req.user.id;
        const { gameId } = req.body;
        
        const result = await checkoutController.BuyGame(userId, gameId);
        
        res.status(200).json({
            success: true,
            message: 'Thanh toán thành công! Game đã được thêm vào thư viện.',
            transaction: result.transaction,
            newBalance: result.newBalance
        });
    } catch (error) {
        console.error("Lỗi thanh toán:", error);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes('sở hữu') || error.message.includes('không đủ tiền')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi server trong quá trình thanh toán' });
    }
});

module.exports = router;