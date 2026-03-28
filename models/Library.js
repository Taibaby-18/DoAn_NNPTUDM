const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  ownedGames: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game' }]
}, { timestamps: true });

module.exports = mongoose.model('Library', librarySchema);

