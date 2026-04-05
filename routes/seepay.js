const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/webhook', async (req, res) => {
  try {
    await paymentController.HandleSeepayWebhook(req.body);

    res.json({
      success: true
    });
  } catch (err) {
    console.error("SEPAY ERROR:", err);
    res.status(500).json({
      message: err.message
    });
  }
});

module.exports = router;