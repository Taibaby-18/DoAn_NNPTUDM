const mongoose = require('mongoose');

require('./Category');
require('./Publisher');

const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },

  thumbnail: { type: String },
  gallery: [{ type: String }],
  trailerVideo: { type: String },

  pcRequirements: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher' },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: { type: String } 

}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);