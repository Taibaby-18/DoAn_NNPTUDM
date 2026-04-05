const express = require('express');
const categoryController = require('../controllers/Admin/categoryController'); // Đường dẫn chuẩn của bạn
const gameController = require('../controllers/gameController'); // Vẫn cần import cái này để dùng hàm GetGameCategories
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// 1. GET /api/categories - Lấy tất cả danh mục (Bao gồm cả danh mục rỗng chưa có game)
router.get('/', async function (req, res, next) {
    try {
        const categories = await categoryController.GetAllCategories();
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. GET /api/categories/active - Lấy các danh mục ĐANG CÓ GAME (Cho Menu Cửa Hàng)
router.get('/active', async function (req, res, next) {
    try {
        const result = await gameController.GetGameCategories();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. POST /api/categories - Thêm danh mục mới (CHỈ ADMIN)
router.post('/', protect, authorize('Admin'), async function (req, res, next) {
    try {
        const { name, description } = req.body;
        const newCategory = await categoryController.CreateCategory(name, description);

        res.status(201).json({
            success: true,
            message: 'Thêm danh mục thành công',
            data: newCategory
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// 4. PUT /api/categories/:id - Cập nhật danh mục (CHỈ ADMIN)
router.put('/:id', protect, authorize('Admin'), async function (req, res, next) {
    try {
        const { name, description } = req.body;
        const updatedCategory = await categoryController.UpdateCategory(req.params.id, name, description);

        res.status(200).json({
            success: true,
            message: 'Cập nhật danh mục thành công',
            data: updatedCategory
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// 5. DELETE /api/categories/:id - Xóa danh mục (CHỈ ADMIN)
router.delete('/:id', protect, authorize('Admin'), async function (req, res, next) {
    try {
        await categoryController.DeleteCategory(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Đã xóa danh mục thành công!'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;