const User = require('../models/User');
const TopUpTransaction = require('../models/TopUpTransaction');
const mongoose = require('mongoose');

const generateOrderId = () => {
  return 'ORDER_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
};

module.exports = {

  
GetBankQR: async function (userId, amount) {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (!user.depositCode) {
    const error = new Error("User chưa có mã nạp tiền");
    error.statusCode = 500;
    throw error;
  }

  if (!amount || amount <= 0) {
    const error = new Error("Số tiền không hợp lệ");
    error.statusCode = 400;
    throw error;
  }

  // ✅ 1. check đơn pending CHƯA HẾT HẠN
  const existingPending = await TopUpTransaction.findOne({
    user: userId,
    status: 'pending',
    expireAt: { $gt: new Date() }
  });

  if (existingPending) {
    return {
      message: "Bạn có đơn chưa hoàn thành",
      transaction: existingPending
    };
  }

  // ✅ 2. tạo đơn mới
  const code = user.depositCode;
  const orderId = generateOrderId();

  const transactionId = new mongoose.Types.ObjectId();

const content = `${code}${transactionId}`;

  const qrImage = `https://img.vietqr.io/image/MB-0389306604-compact.png?amount=${amount}&addInfo=${content}&accountName=NGO%20MINH%20HAI`;

  const expireAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

const transaction = await TopUpTransaction.create({
  _id: transactionId, // 🔥 QUAN TRỌNG
  user: user._id,
  code: code,
  orderId: orderId,
  amount: amount,
  status: 'pending',

  qrImage,
  bankName: "MB Bank",
  accountNumber: "0389306604",
  accountName: "NGO MINH HAI",
  content,

  expireAt
});

  return {
    message: "Tạo QR thành công",
    transaction
  };
},
  

HandleSeepayWebhook: async function (data) {
  console.log("SEPAY DATA:", data);

  const amount = Number(data.transferAmount); // ✅ FIX
  const content = data.content || data.description;

  if (!content || !amount) return;

  // ✅ FIX REGEX
  const match = content.match(/NAP[A-Z0-9]*([a-f0-9]{24})/i);

  if (!match) {
    console.log("❌ Không match được transactionId");
    return;
  }

  const transactionId = match[1];

  const transaction = await TopUpTransaction.findOne({
    _id: transactionId,
    status: 'pending'
  });

  if (!transaction) {
    console.log("❌ Không tìm thấy transaction:", transactionId);
    return;
  }

  if (transaction.status === 'success') return;

  const user = await User.findById(transaction.user);
  if (!user) return;

  user.walletBalance += amount;
  await user.save();

  transaction.amount = amount;
  transaction.status = 'success';
  await transaction.save();

  console.log("✅ Nạp tiền thành công:", transactionId);
},

  GetTopUpHistory: async function (userId) {
    const transactions = await TopUpTransaction.find({
      user: userId
    })
      .sort({ createdAt: -1 });

    return transactions;
  },

  CancelTopUp: async function (userId, orderId) {
  const transaction = await TopUpTransaction.findOne({
    user: userId,
    orderId: orderId,
    status: 'pending'
  });

  if (!transaction) {
    const error = new Error("Không tìm thấy đơn để hủy");
    error.statusCode = 404;
    throw error;
  }

  transaction.status = 'failed'; 
  await transaction.save();

  return { success: true };
}
};