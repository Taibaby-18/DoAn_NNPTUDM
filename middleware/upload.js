const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } 
});

const uploadGameMedia = upload.fields([
  { name: 'thumbnail', maxCount: 1 }, 
  { name: 'gallery', maxCount: 6 },   
  { name: 'trailer', maxCount: 1 }    
]);

module.exports = { upload, uploadGameMedia };