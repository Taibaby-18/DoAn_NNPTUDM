const express = require('express');
const router = express.Router();

// 1. Nhập khẩu hàm bảo mật (Middleware)
const { protect } = require('../middleware/auth'); 

// 2. Nhập khẩu đúng tên hàm getUserProfile từ Controller
const { getUserProfile } = require('../controllers/userController'); 

// 3. Định tuyến (Đây chính là chỗ dòng số 7 hay bị lỗi nè)
// Phải đảm bảo cả protect và getUserProfile đều ĐÃ CÓ MẶT thì nó mới không chửi
router.get('/profile', protect, getUserProfile);

module.exports = router;