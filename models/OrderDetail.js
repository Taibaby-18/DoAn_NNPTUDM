const mongoose = require('mongoose');

const orderDetailSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  priceAtPurchase: { type: Number, required: true, min: 0 }
});

module.exports = mongoose.model('OrderDetail', orderDetailSchema);

