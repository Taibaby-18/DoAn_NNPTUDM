const User = require('../models/User');
const TopUpTransaction = require('../models/TopUpTransaction');

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

      const existingPending = await TopUpTransaction.findOne({
        user: userId,
        status: 'pending'
      });

      if (existingPending) {
        const error = new Error("Bạn đang có đơn chưa thanh toán, vui lòng hoàn tất hoặc hủy đơn trước khi tạo đơn mới");
        error.statusCode = 400;
        throw error;
      }
      

    const code = user.depositCode;
    const orderId = generateOrderId();

const transaction = await TopUpTransaction.create({
  user: user._id,
  code: code,
  orderId: orderId,
  amount: amount,
  status: 'pending'
});

    const qrUrl = `https://img.vietqr.io/image/MB-0389306604-compact.png?amount=${amount}&addInfo=${code}_${transaction._id}&accountName=NGO%20MINH%20HAI`;

    return {
      bank: "MB",
      accountNumber: "0389306604",
      accountName: "NGO MINH HAI",
      content: code,
      qrUrl,
      transactionId: transaction._id,
      amount
    };
  },
  

  HandleSeepayWebhook: async function (content, amount) {
    if (!content || !amount) {
      const error = new Error("Thiếu dữ liệu");
      error.statusCode = 400;
      throw error;
    }

    if (amount <= 0) {
      const error = new Error("Số tiền không hợp lệ");
      error.statusCode = 400;
      throw error;
    }

    const transaction = await TopUpTransaction.findOne({
      code: content,
      status: 'pending'
    }).sort({ createdAt: -1 });

    if (!transaction) {
      const error = new Error("Không tìm thấy giao dịch");
      error.statusCode = 404;
      throw error;
    }

    const user = await User.findById(transaction.user);

    if (!user) {
      const error = new Error("User không tồn tại");
      error.statusCode = 404;
      throw error;
    }

    user.walletBalance += amount;
    await user.save();

    transaction.amount = amount;
    transaction.status = 'success';
    await transaction.save();

    return { success: true };
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