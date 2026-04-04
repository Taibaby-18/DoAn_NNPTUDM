const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.get('/topup/qr', protect, async function (req, res, next) {
    try {
        const userId = req.user._id || req.user.id;
        const result = await paymentController.GetBankQR(userId);
        res.json(result);
    } catch (error) {
        console.error("QR ERROR:", error);
        const status = error.statusCode || 500;
        res.status(status).json({ message: error.message || "Lỗi server" });
    }
});

router.post('/webhook/seepay', async function (req, res, next) {
    try {
        const { content, amount } = req.body;
        const result = await paymentController.HandleSeepayWebhook(content, amount);
        res.json(result);
    } catch (error) {
        console.error("Webhook ERROR:", error);
        const status = error.statusCode || 500;
        res.status(status).json({ message: error.message || "Webhook lỗi" });
    }
});

module.exports = router;