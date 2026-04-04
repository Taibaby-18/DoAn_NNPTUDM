const User = require('../models/User');
const TopUpTransaction = require('../models/TopUpTransaction');
const mongoose = require('mongoose');

module.exports = {

  GetBankQR: async function (userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // 🔥 FIX QUAN TRỌNG
    if (!user.depositCode) {
      user.depositCode = "NAP_" + Math.random().toString(36).substring(2, 8).toUpperCase();
      await user.save();
    }

    const code = user.depositCode;

    console.log("Deposit code:", code); // debug

    // 🔥 tìm transaction pending trước
    let transaction = await TopUpTransaction.findOne({
      user: user._id,
      status: 'pending'
    });

    // nếu chưa có thì tạo
    if (!transaction) {
      transaction = await TopUpTransaction.create({
        user: user._id,
        code: code,
        amount: 0,
        status: 'pending'
      });
    }

    const qrUrl = `https://img.vietqr.io/image/MB-0389306604-compact.png?amount=0&addInfo=${code}&accountName=NGO%20MINH%20HAI`;

    return {
      bank: "MB",
      accountNumber: "0389306604",
      accountName: "NGO MINH HAI",
      content: code,
      qrUrl
    };
  },

  HandleSeepayWebhook: async function (content, amount) {
    if (!content || !amount) {
      const error = new Error("Thiếu dữ liệu");
      error.statusCode = 400;
      throw error;
    }

    const transaction = await TopUpTransaction.findOne({
      code: content
    });

    if (!transaction) {
      const error = new Error("Không tìm thấy giao dịch");
      error.statusCode = 404;
      throw error;
    }

    if (transaction.status === 'success') {
      return { message: "Đã xử lý trước đó" };
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {

        const user = await User.findById(transaction.user).session(session);

        if (!user) throw new Error("User không tồn tại");

        user.walletBalance += amount;
        await user.save({ session });

        transaction.amount = amount;
        transaction.status = 'success';
        await transaction.save({ session });

      });
    } finally {
      session.endSession();
    }

    return { success: true };
  }

};