const express = require('express');
const { protect } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');
const router = express.Router();

router.post('/create_payment_url', protect, paymentController.createPaymentUrl);
router.get('/vnpay_return', paymentController.vnpayReturn);

module.exports = router;
