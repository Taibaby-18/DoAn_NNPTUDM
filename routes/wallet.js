const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
<<<<<<< Updated upstream
const { protect } = require('../middleware/auth'); 
router.get('/topup/qr', protect, paymentController.getBankQR);
router.post('/webhook/seepay', paymentController.handleSeepayWebhook);
=======

const { protect } = require('../middleware/auth');



router.get('/topup/qr', protect, async (req, res) => {
  try {
    const result = await paymentController.GetBankQR(req.user._id);
    res.json(result);
  } catch (err) {
    console.error("QR ERROR:", err);
    res.status(err.statusCode || 500).json({
      message: err.message
    });
  }
});



router.get('/topup/history', protect, async (req, res) => {
  try {
    const result = await paymentController.GetTopUpHistory(req.user._id);
    res.json(result);
  } catch (err) {
    console.error("HISTORY ERROR:", err);
    res.status(500).json({
      message: "Lỗi lấy lịch sử"
    });
  }
});
>>>>>>> Stashed changes


router.post('/topup/cancel', protect, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        message: "Thiếu orderId"
      });
    }

    const result = await paymentController.CancelTopUp(
      req.user._id,
      orderId
    );

    res.json(result);
  } catch (err) {
    console.error("CANCEL ERROR:", err);
    res.status(err.statusCode || 500).json({
      message: err.message
    });
  }
});


router.post('/topup/webhook', async (req, res) => {
  try {
    const { content, amount } = req.body;

    const result = await paymentController.HandleSeepayWebhook(
      content,
      amount
    );

    res.json(result);
  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    res.status(err.statusCode || 500).json({
      message: err.message
    });
  }
});


module.exports = router;