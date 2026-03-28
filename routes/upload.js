const express = require('express');
const upload = require('../middleware/upload');
const { authMiddleware } = require('../middleware/auth');
const { uploadMedia } = require('../controllers/uploadController');
const router = express.Router();

router.use(authMiddleware);
router.post('/', upload.single('file'), uploadMedia);

module.exports = router;

