const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth'); 
router.get('/topup/qr', protect, paymentController.getBankQR);
router.post('/webhook/seepay', paymentController.handleSeepayWebhook);

module.exports = router;