const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  
  // -- PHẦN MEDIA MỚI NÂNG CẤP --
  thumbnail: { type: String }, // Ảnh bìa dọc (để hiện ở trang chủ)
  gallery: [{ type: String }], // Mảng chứa nhiều ảnh ngang (hiển thị trong trang detail)
  trailerVideo: { type: String }, // Link video (có thể là file upload hoặc link Youtube)
  
  pcRequirements: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher' }
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);