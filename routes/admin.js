const express = require('express');
const router = express.Router();

const { protect, adminMiddleware } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// GET /api/admin/users - Lấy danh sách tất cả người dùng
router.get('/users', protect, adminMiddleware, async function (req, res, next) {
  try {
    const users = await adminController.GetAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("LỖI LẤY DANH SÁCH USER:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách người dùng" });
  }
});

// PUT /api/admin/users/:id/role - Phân quyền người dùng
router.put('/users/:id/role', protect, adminMiddleware, async function (req, res, next) {
  try {
    const userId = req.params.id;
    const { roleName } = req.body;

    if (!roleName) {
      return res.status(400).json({ success: false, message: "Vui lòng cung cấp roleName (Admin, Publisher, Gamer)" });
    }

    await adminController.UpdateUserRole(userId, roleName);
    res.status(200).json({ success: true, message: `Đã cập nhật quyền ${roleName} cho người dùng thành công!` });
  } catch (error) {
    console.error("LỖI CẬP NHẬT QUYỀN USER:", error);
    if (error.message.includes('không hợp lệ') || error.message.includes('Không tìm thấy')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    
    res.status(500).json({ success: false, message: "Lỗi server khi phân quyền người dùng" });
  }
});


router.get('/users/:id', protect, adminMiddleware, async function (req, res, next) {
  try {
    const user = await adminController.GetUserById(req.params.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("LỖI LẤY CHI TIẾT USER:", error);
    if (error.message === 'Không tìm thấy người dùng') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Lỗi server khi lấy thông tin người dùng" });
  }
});


router.delete('/users/:id', protect, adminMiddleware, async function (req, res, next) {
  try {
    
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: "Bạn không thể tự xóa tài khoản của chính mình!" });
    }

    await adminController.DeleteUser(req.params.id);
    res.status(200).json({ success: true, message: "Đã xóa người dùng thành công!" });
  } catch (error) {
    console.error("LỖI XÓA USER:", error);
    if (error.message === 'Không tìm thấy người dùng') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Lỗi server khi xóa người dùng" });
  }
});

module.exports = router;