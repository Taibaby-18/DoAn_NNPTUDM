const mongoose = require('mongoose');

const publisherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactEmail: { type: String },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Publisher', publisherSchema);

