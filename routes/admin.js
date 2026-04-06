const express = require('express');
const router = express.Router();

const { protect, adminMiddleware } = require('../middleware/auth');
const adminController = require('../controllers/Admin/adminController');

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


// ================= QUẢN LÝ GAME ================= //

// GET /api/admin/games - Lấy tất cả game (kể cả pending, rejected)
router.get('/games', protect, adminMiddleware, async function (req, res, next) {
  try {
    const result = await adminController.GetAllGamesAdmin();
    res.status(200).json(result);
  } catch (error) {
    console.error("LỖI LẤY TẤT CẢ GAME:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách game" });
  }
});

// PATCH /api/admin/games/:id/approve - Duyệt game
router.patch('/games/:id/approve', protect, adminMiddleware, async function (req, res, next) {
  try {
    const result = await adminController.ApproveGame(req.params.id);
    res.status(200).json({ success: true, message: "Đã duyệt game thành công!", data: result.data });
  } catch (error) {
    console.error("LỖI DUYỆT GAME:", error);
    const status = error.message.includes('không tìm thấy') || error.message.includes('Không tìm thấy') ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/games/:id/reject - Từ chối game
router.patch('/games/:id/reject', protect, adminMiddleware, async function (req, res, next) {
  try {
    const { reason } = req.body;
    const result = await adminController.RejectGame(req.params.id, reason);
    res.status(200).json({ success: true, message: "Đã từ chối game!", data: result.data });
  } catch (error) {
    console.error("LỖI TỪ CHỐI GAME:", error);
    const status = error.message.includes('không tìm thấy') || error.message.includes('Không tìm thấy') ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
});

module.exports = router;