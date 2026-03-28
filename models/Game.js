const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  pcRequirements: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);

