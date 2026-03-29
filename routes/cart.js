const express = require('express');
const { protect } = require('../middleware/auth');
const { addToCart, getCart, checkoutCart, removeFromCart } = require('../controllers/cartController');
const router = express.Router();

router.post('/add', protect, addToCart); // Thêm vào giỏ
router.get('/', protect, getCart);       // Xem giỏ
router.post('/checkout', protect, checkoutCart); // Thanh toán giỏ
router.post('/remove', protect, removeFromCart); // Xóa game khỏi giỏ (nếu muốn thêm chức năng này sau)
module.exports = router;