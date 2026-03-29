const multer = require('multer');
const path = require('path');

// 1. Cấu hình nơi lưu và cách đặt tên file
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Lưu vào thư mục uploads ở root
  },
  filename(req, file, cb) {
    // Đổi tên tránh trùng lặp: ten_field-1711234567.jpg
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// 2. Khởi tạo Multer (giới hạn 50MB cho video)
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } 
});

// 3. Khẩu pháo hạng nặng: Cấu hình nhận nhiều file cho Game
const uploadGameMedia = upload.fields([
  { name: 'thumbnail', maxCount: 1 }, // 1 ảnh bìa
  { name: 'gallery', maxCount: 6 },   // Tối đa 6 ảnh chi tiết
  { name: 'trailer', maxCount: 1 }    // 1 file video
]);

// 4. Xuất khẩu cả 2 món vũ khí ra ngoài
module.exports = { upload, uploadGameMedia };