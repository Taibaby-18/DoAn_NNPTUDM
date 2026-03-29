const express = require('express');
const router = express.Router();
// Nhập đúng biến 'upload' có ngoặc nhọn
const { upload } = require('../middleware/upload');

// Route upload 1 file cơ bản (Cái cũ của ông)
router.post('/', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn một file!' });
        }
        res.status(200).json({
            success: true,
            message: 'Upload thành công!',
            data: `/uploads/${req.file.filename}` // Trả về đường dẫn để lưu DB
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi upload file' });
    }
});

module.exports = router;