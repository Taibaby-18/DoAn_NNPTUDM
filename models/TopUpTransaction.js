const mongoose = require('mongoose');

const topUpTransactionSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    code: { 
      type: String, 
      required: true, 
      index: true 
    },

    amount: { 
      type: Number, 
      default: 0 
    },

    paymentMethod: { 
      type: String, 
      default: 'BANK_TRANSFER' 
    },

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