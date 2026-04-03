const express = require('express');
const { protect } = require('../middleware/auth');
const walletController = require('../controllers/walletController');
const router = express.Router();

router.post('/momo/create', protect, async function (req, res, next) {
    try {
        const userId = req.user._id || req.user.id;
        const userEmail = req.user.email;
        const username = req.user.username;
        const amount = req.body.amount;
        const redirectUrlParam = req.body.redirectUrl;
        const ipnUrlParam = req.body.ipnUrl;
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        const result = await walletController.CreateMoMoPayment(
            amount, userId, userEmail, username, redirectUrlParam, ipnUrlParam, baseUrl
        );

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.all('/momo/return', async function (req, res, next) {
    try {
        const params = { ...(req.query || {}), ...(req.body || {}) };
        const orderId = params.orderId;
        const resultCode = Number(params.resultCode);
        const message = params.message;

        const result = await walletController.MomoCallback(orderId, resultCode, message);

        if (result.action === 'redirect') {
            return res.redirect(result.url);
        }

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result.data
        });
    } catch (error) {
        const statusCode = error.message.includes('Thiếu') ? 400 : 500;
        res.status(statusCode).json({ success: false, message: error.message || 'Callback failed' });
    }
});

module.exports = router;
