const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  walletBalance: { type: Number, default: 0 },
  library: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game' }], 
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game' }],
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  depositCode: {type: String, unique: true}
}, { timestamps: true });

function generateDepositCode() {
  return 'NAP_' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  if (!this.depositCode) {
    let code;
    let isExist = true;
    while (isExist) {
      code = 'NAP_' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = await mongoose.models.User.findOne({ depositCode: code });
      if (!existing) isExist = false;
    }
    this.depositCode = code;
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};



module.exports = mongoose.model('User', userSchema);