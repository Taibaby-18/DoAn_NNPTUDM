const mongoose = require('mongoose');

const mediaAssetSchema = new mongoose.Schema({
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  entityModel: { 
    type: String, 
    enum: ['Game', 'User'], 
    required: true 
  },
  url: { type: String, required: true },
  mediaType: { 
    type: String, 
    enum: ['Avatar', 'GameBanner', 'GameTrailer'] 
  }
}, { timestamps: true });

module.exports = mongoose.model('MediaAsset', mediaAssetSchema);

