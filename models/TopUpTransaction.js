const mongoose = require('mongoose');

const topUpTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: String, required: true, unique: true, index: true }, // MoMo orderId
    amount: { type: Number, required: true, min: 1 },
    paymentMethod: { type: String, default: 'MoMo' },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TopUpTransaction', topUpTransactionSchema);

