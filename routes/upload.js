const express = require('express');
const { upload, uploadGameMedia } = require('../middleware/upload');
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

router.post('/game/:gameId', uploadGameMedia, async function (req, res, next) {
  try {
    const gameId = req.params.gameId;
    const files = req.files; // Lưu ý: upload nhiều file thì dùng req.files (có chữ s)

    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng upload file!' });
    }

    const uploadedAssets = [];

    // Xử lý Thumbnail
    if (files.thumbnail) {
      const asset = await uploadController.UploadMedia(gameId, 'Game', 'Thumbnail', `/uploads/${files.thumbnail[0].filename}`);
      uploadedAssets.push(asset);
    }

    // Xử lý Trailer
    if (files.trailer) {
      const asset = await uploadController.UploadMedia(gameId, 'Game', 'Trailer', `/uploads/${files.trailer[0].filename}`);
      uploadedAssets.push(asset);
    }

    // Xử lý Gallery (nhiều ảnh)
    if (files.gallery) {
      for (const file of files.gallery) {
        const asset = await uploadController.UploadMedia(gameId, 'Game', 'Gallery', `/uploads/${file.filename}`);
        uploadedAssets.push(asset);
      }
    }

    res.status(200).json({ success: true, message: 'Upload media cho Game thành công!', data: uploadedAssets });
  } catch (error) {
    console.error("LỖI:", error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;
