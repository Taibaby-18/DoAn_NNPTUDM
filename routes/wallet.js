const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const { createMoMoPayment, momoCallback } = require('../controllers/walletController');

// Tạo giao dịch nạp tiền MoMo (trả về payUrl/qrCodeUrl)
router.post('/momo/create', protect, createMoMoPayment);

// MoMo redirect (GET) hoặc callback (POST) về đây
router.all('/momo/return', momoCallback);

module.exports = router;

