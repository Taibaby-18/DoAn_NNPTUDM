const User = require('../models/User');
const TopUpTransaction = require('../models/TopUpTransaction');
const mongoose = require('mongoose');

module.exports = {

getBankQR: async function (req, res) {
  try {
    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
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

    return res.json({
      bank: "MB",
      accountNumber: "0389306604",
      accountName: "NGO MINH HAI",
      content: code,
      qrUrl
    });

  } catch (err) {
    console.error("QR ERROR:", err); // 🔥 QUAN TRỌNG
    res.status(500).json({ message: "Lỗi server" });
  }
},



  handleSeepayWebhook: async function (req, res) {
    try {
      const { content, amount } = req.body;

      if (!content || !amount) {
        return res.status(400).json({ message: "Thiếu dữ liệu" });
      }

      const transaction = await TopUpTransaction.findOne({
        code: content
      });

      if (!transaction) {
        return res.status(404).json({ message: "Không tìm thấy giao dịch" });
      }

      if (transaction.status === 'success') {
        return res.json({ message: "Đã xử lý trước đó" });
      }

      const session = await mongoose.startSession();

      await session.withTransaction(async () => {

        const user = await User.findById(transaction.user).session(session);

        if (!user) throw new Error("User không tồn tại");

        user.walletBalance += amount;
        await user.save({ session });

        transaction.amount = amount;
        transaction.status = 'success';
        await transaction.save({ session });

      });

      session.endSession();

      res.json({ success: true });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Webhook lỗi" });
    }
  }


  

};