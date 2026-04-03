const express = require('express');
const { upload } = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');
const router = express.Router();

// POST /api/upload - upload single file
router.post('/', upload.single('file'), async function (req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn một file!' });
    }

    // For single file, you can create directly or call controller
    res.status(200).json({
      success: true,
      message: 'Upload thành công!',
      data: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server khi upload file' });
  }
});

// POST /api/upload/media - structured media asset
router.post('/media', upload.single('file'), async function (req, res, next) {
  try {
    const { entityId, entityModel, mediaType } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = `/uploads/${req.file.filename}`;
    const mediaAsset = await uploadController.UploadMedia(entityId, entityModel, mediaType, filePath);
    res.json({ message: 'File uploaded successfully', mediaAsset });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
