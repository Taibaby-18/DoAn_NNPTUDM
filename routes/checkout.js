const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { checkoutCart } = require('../controllers/checkoutController');
const router = express.Router();

router.use(authMiddleware);
router.post('/cart', checkoutCart);

module.exports = router;

